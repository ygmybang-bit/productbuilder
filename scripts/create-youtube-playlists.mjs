import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const credentialsPath = path.join(root, 'client_secret.json');
const tokenPath = path.join(root, 'youtube-token.json');
const postsDir = path.join(root, 'public', 'posts');
const scope = 'https://www.googleapis.com/auth/youtube.force-ssl';

const decodeHtml = value => value
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));

async function loadCredentials() {
  const raw = await readJson(credentialsPath);
  const credentials = raw.installed || raw.web;
  if (!credentials?.client_id || !credentials?.client_secret) {
    throw new Error('client_secret.json이 Google OAuth 클라이언트 형식이 아닙니다.');
  }
  return credentials;
}

async function exchangeToken(params) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || 'OAuth 토큰 요청 실패');
  return data;
}

async function authorize(credentials) {
  try {
    const saved = await readJson(tokenPath);
    if (saved.refresh_token) {
      const refreshed = await exchangeToken({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        refresh_token: saved.refresh_token,
        grant_type: 'refresh_token'
      });
      return { ...saved, ...refreshed, refresh_token: saved.refresh_token };
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn(`저장된 인증을 다시 요청합니다: ${error.message}`);
  }

  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = crypto.randomBytes(24).toString('hex');
  const server = http.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const redirectUri = `http://127.0.0.1:${port}`;
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.search = new URLSearchParams({
    client_id: credentials.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  console.log('\n아래 주소를 브라우저에서 열고 YouTube 권한을 승인해 주세요:\n');
  console.log(authUrl.toString());
  console.log('\n승인 완료를 기다리는 중입니다...');

  const code = await new Promise((resolve, reject) => {
    server.on('request', (request, response) => {
      const callback = new URL(request.url, redirectUri);
      if (callback.searchParams.get('state') !== state) {
        response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('잘못된 OAuth 요청입니다.');
        reject(new Error('OAuth state 불일치'));
        server.close();
        return;
      }
      const error = callback.searchParams.get('error');
      const authCode = callback.searchParams.get('code');
      response.writeHead(error || !authCode ? 400 : 200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(error || !authCode
        ? '<h1>승인이 취소되었습니다.</h1><p>이 창을 닫아도 됩니다.</p>'
        : '<h1>YouTube 연결 완료</h1><p>이 창을 닫고 Codex로 돌아가 주세요.</p>');
      if (error || !authCode) reject(new Error(`OAuth 승인 실패: ${error || '인증 코드 없음'}`));
      else resolve(authCode);
      server.close();
    });
  });

  const token = await exchangeToken({
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });
  await fs.writeFile(tokenPath, JSON.stringify(token, null, 2), { mode: 0o600 });
  return token;
}

async function loadSitePlaylists() {
  const app = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');
  const videoByTitle = new Map();
  for (const match of app.matchAll(/^\s*'([^']+)':'([A-Za-z0-9_-]{11})',?$/gm)) {
    videoByTitle.set(match[1], match[2]);
  }
  const files = (await fs.readdir(postsDir)).filter(file => file.endsWith('.html'));
  const playlists = [];
  for (const file of files) {
    const html = await fs.readFile(path.join(postsDir, file), 'utf8');
    const list = html.match(/<ol[^>]*class="[^"]*tracklist[^"]*"[\s\S]*?<\/ol>/i)?.[0];
    if (!list) continue;
    const title = decodeHtml(html.match(/<header class="article-head">[\s\S]*?<h1>([\s\S]*?)<\/h1>/i)?.[1] || file);
    const trackTitles = [...list.matchAll(/<h2>([\s\S]*?)<\/h2>/gi)].map(match => decodeHtml(match[1]));
    const videos = trackTitles.map(trackTitle => ({ title: trackTitle, videoId: videoByTitle.get(trackTitle) }));
    const missing = videos.filter(video => !video.videoId);
    if (missing.length) throw new Error(`${file}: 영상 ID가 없는 곡: ${missing.map(item => item.title).join(', ')}`);
    playlists.push({ file, title: `KPOP YANGON | ${title}`, videos });
  }
  return playlists;
}

async function youtube(token, endpoint, { method = 'GET', params = {}, body } = {}) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, {
      method,
      headers: {
        authorization: `Bearer ${token.access_token}`,
        ...(body ? { 'content-type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    if (response.ok) return data;
    const reason = data.error?.errors?.[0]?.reason || '';
    const retryable = response.status === 409 || response.status >= 500 || ['operationAborted', 'backendError', 'rateLimitExceeded', 'SERVICE_UNAVAILABLE'].includes(reason);
    if (!retryable || attempt === 6) {
      throw new Error(`${endpoint} (${response.status}${reason ? `, ${reason}` : ''}): ${data.error?.message || response.statusText}`);
    }
    console.log(`  YouTube 일시 오류 · ${attempt}/5회 재시도`);
    await new Promise(resolve => setTimeout(resolve, attempt * 1800));
  }
}

async function listOwnedPlaylists(token) {
  const items = [];
  let pageToken;
  do {
    const data = await youtube(token, 'playlists', {
      params: { part: 'snippet,status', mine: 'true', maxResults: '50', ...(pageToken ? { pageToken } : {}) }
    });
    items.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return items;
}

async function listPlaylistVideoIds(token, playlistId) {
  const ids = [];
  let pageToken;
  do {
    const data = await youtube(token, 'playlistItems', {
      params: { part: 'snippet', playlistId, maxResults: '50', ...(pageToken ? { pageToken } : {}) }
    });
    ids.push(...(data.items || []).map(item => item.snippet?.resourceId?.videoId).filter(Boolean));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}

async function syncPlaylists(token, sitePlaylists) {
  const existing = await listOwnedPlaylists(token);
  const results = [];
  for (const source of sitePlaylists) {
    let playlist = existing.find(item => item.snippet?.title === source.title);
    let newlyCreated = false;
    if (!playlist) {
      playlist = await youtube(token, 'playlists', {
        method: 'POST',
        params: { part: 'snippet,status' },
        body: {
          snippet: {
            title: source.title,
            description: `KPOP YANGON 플레이리스트\nhttps://kpopyangon.com/posts/${source.file.replace(/\.html$/, '')}`
          },
          status: { privacyStatus: 'public' }
        }
      });
      newlyCreated = true;
      existing.push(playlist);
      console.log(`생성: ${source.title}`);
    } else {
      console.log(`재사용: ${source.title}`);
    }
    const currentIds = newlyCreated
      ? new Set()
      : new Set(await listPlaylistVideoIds(token, playlist.id));
    for (const video of source.videos) {
      if (currentIds.has(video.videoId)) continue;
      await youtube(token, 'playlistItems', {
        method: 'POST',
        params: { part: 'snippet' },
        body: {
          snippet: {
            playlistId: playlist.id,
            resourceId: { kind: 'youtube#video', videoId: video.videoId }
          }
        }
      });
      console.log(`  추가: ${video.title}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    results.push({ file: source.file, title: source.title, playlistId: playlist.id });
  }
  await fs.writeFile(path.join(root, 'youtube-playlists.json'), JSON.stringify(results, null, 2));
  return results;
}

const credentials = await loadCredentials();
const sitePlaylists = await loadSitePlaylists();
console.log(`사이트에서 ${sitePlaylists.length}개의 플레이리스트를 확인했습니다.`);
sitePlaylists.forEach(item => console.log(`- ${item.title}: ${item.videos.length}곡`));
const token = await authorize(credentials);
const results = await syncPlaylists(token, sitePlaylists);
console.log('\n완료된 YouTube 재생목록:');
results.forEach(item => console.log(`${item.file}: https://www.youtube.com/playlist?list=${item.playlistId}`));
