const MELON = 'https://www.melon.com/chart/index.htm';
const NATE = 'https://news.nate.com/ent/idol24';
const CHART_KEY = new Request('https://melon-cache.internal/current');
const NEWS_KEY = new Request('https://nate-cache.internal/v2/current');
const ONE_HOUR = 60 * 60 * 1000;

const clean = value => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const pick = (html, pattern) => { const match = html.match(pattern); return match ? clean(match[1]) : ''; };

function parse(html) {
  const chartTime = [pick(html, /<span class="year">([\s\S]*?)<\/span>/i), pick(html, /<span class="hour">([\s\S]*?)<\/span>/i)].filter(Boolean).join(' ');
  const rows = html.match(/<tr[^>]+class="[^"]*lst(?:50|100)[^"]*"[\s\S]*?<\/tr>/gi) || [];
  const songs = rows.map((row, index) => {
    const rank = Number(pick(row, /<span class="rank">(\d+)<\/span>/i)) || index + 1;
    const title = pick(row, /class="ellipsis rank01"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const artist = pick(row, /class="ellipsis rank02"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const album = pick(row, /class="ellipsis rank03"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const image = ((row.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || '').replace(/^\/\//, 'https://');
    const change = Number(pick(row, /<span class="(?:up|down)">([\s\S]*?)<\/span>/i)) || 0;
    const status = /class="up"/i.test(row) ? 'up' : /class="down"/i.test(row) ? 'down' : /class="new"/i.test(row) ? 'new' : 'same';
    return { rank, title, artist, album, image, change, status };
  }).filter(song => song.title && song.artist).slice(0, 100);
  return { chartTime, songs };
}

async function refreshChart() {
  const upstream = await fetch(MELON, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KPopYangon/1.0)', Referer: 'https://www.melon.com/', 'Accept-Language': 'ko-KR,ko;q=0.9' } });
  if (!upstream.ok) throw new Error(`멜론 응답 오류 (${upstream.status})`);
  const data = parse(await upstream.text());
  if (data.songs.length < 90) throw new Error(`멜론 차트 분석 오류 (${data.songs.length}곡)`);
  data.songs = data.songs.map(song => ({ ...song, image: song.image ? `/api/melon-image?url=${encodeURIComponent(song.image)}` : '' }));
  const response = Response.json({ ...data, fetchedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'public,max-age=300,s-maxage=86400,stale-while-revalidate=86400' } });
  await caches.default.put(CHART_KEY, response.clone());
  return response;
}

async function chart(request, context) {
  const force = new URL(request.url).searchParams.has('refresh');
  const cached = await caches.default.match(CHART_KEY);
  if (!force && cached) {
    const data = await cached.clone().json();
    const age = Date.now() - Date.parse(data.fetchedAt || 0);
    if (age >= ONE_HOUR) context.waitUntil(refreshChart());
    return cached;
  }
  try { return await refreshChart(); }
  catch (error) { if (cached) return cached; throw error; }
}

async function image(request) {
  const source = new URL(request.url).searchParams.get('url');
  if (!source) return new Response('Missing image URL', { status: 400 });
  let url;
  try { url = new URL(source); } catch { return new Response('Invalid image URL', { status: 400 }); }
  const allowed = url.protocol === 'https:' && (url.hostname.endsWith('.melon.co.kr') || url.hostname.endsWith('.kakaocdn.net') || url.hostname.endsWith('.nateimg.co.kr'));
  if (!allowed) return new Response('Image host not allowed', { status: 403 });
  const key = new Request(url.toString());
  const cached = await caches.default.match(key);
  if (cached) return cached;
  const upstream = await fetch(url, { headers: { Referer: 'https://www.melon.com/' } });
  if (!upstream.ok) return new Response('Image unavailable', { status: 502 });
  const response = new Response(upstream.body, upstream);
  response.headers.set('Cache-Control', 'public,max-age=2592000,immutable');
  await caches.default.put(key, response.clone());
  return response;
}

const decode = value => clean(value).replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&hellip;/g, '…').replace(/&#124;/g, '|');

async function translate(text) {
  if (!text) return '';
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=my&dt=t&q=${encodeURIComponent(text.slice(0, 700))}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return text;
    const data = await response.json();
    return (data[0] || []).map(part => part[0] || '').join('').trim() || text;
  } catch { return text; }
}

function parseNews(html) {
  const items = [];
  const seen = new Set();
  for (const match of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const block = match[1];
    const href = (block.match(/href="(\/\/(?:news|ps\.news)\.nate\.com\/[^"]+)"/i) || [])[1];
    const imageUrl = (block.match(/<img[^>]+src="(\/\/[^\"]*nateimg\.co\.kr[^\"]*)"/i) || [])[1];
    const title = pick(block, /<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!href || !imageUrl || !title) continue;
    const url = `https:${href.replace(/&amp;/g, '&')}`;
    if (seen.has(url)) continue;
    seen.add(url);
    const source = pick(block, /<(?:span|em)[^>]+class="(?:source|src)"[^>]*>([\s\S]*?)<\/(?:span|em)>/i);
    const textBlock = (block.match(/<span class="tb">([\s\S]*?)<\/span>/i) || [])[1] || '';
    const summary = decode(textBlock.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '')).slice(0, 180);
    items.push({ title: decode(title), summary, source: decode(source) || 'NATE 연예', url, image: `https:${imageUrl}` });
    if (items.length >= 20) break;
  }
  return items.sort((a, b) => Number(Boolean(b.summary)) - Number(Boolean(a.summary)));
}

async function refreshNews() {
  const upstream = await fetch(NATE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KPopYangon/1.0)', 'Accept-Language': 'ko-KR,ko;q=0.9' } });
  if (!upstream.ok) throw new Error(`네이트 응답 오류 (${upstream.status})`);
  const html = new TextDecoder('euc-kr').decode(await upstream.arrayBuffer());
  const articles = parseNews(html);
  if (articles.length < 4) throw new Error(`네이트 뉴스 분석 오류 (${articles.length}건)`);
  const translated = await Promise.all(articles.map(async (article, id) => {
    const [titleMy, summaryMy] = await Promise.all([translate(article.title), translate(article.summary)]);
    return { ...article, id, titleMy, summaryMy, image: `/api/news-image?url=${encodeURIComponent(article.image)}` };
  }));
  const response = Response.json({ articles: translated, fetchedAt: new Date().toISOString(), source: NATE }, { headers: { 'Cache-Control': 'public,max-age=300,s-maxage=86400,stale-while-revalidate=86400' } });
  await caches.default.put(NEWS_KEY, response.clone());
  return response;
}

async function news(request, context) {
  const force = new URL(request.url).searchParams.has('refresh');
  const cached = await caches.default.match(NEWS_KEY);
  if (!force && cached) {
    const data = await cached.clone().json();
    if (Date.now() - Date.parse(data.fetchedAt || 0) >= ONE_HOUR) context.waitUntil(refreshNews());
    return cached;
  }
  try { return await refreshNews(); }
  catch (error) { if (cached) return cached; throw error; }
}

export default {
  async fetch(request, env, context) {
    const path = new URL(request.url).pathname;
    if (path === '/api/melon-chart') {
      try { return await chart(request, context); }
      catch (error) { return Response.json({ error: error.message }, { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
    }
    if (path === '/api/nate-news') {
      try { return await news(request, context); }
      catch (error) { return Response.json({ error: error.message }, { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
    }
    if (path === '/api/melon-image') return image(request);
    if (path === '/api/news-image') return image(request);
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, _env, context) { context.waitUntil(Promise.allSettled([refreshChart(), refreshNews()])); }
};
