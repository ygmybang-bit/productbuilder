if(document.querySelector('.playlist-hero,.playlist-article,.archive-heading')){
  const playlistStyles=document.createElement('link');
  playlistStyles.rel='stylesheet';
  playlistStyles.href='/playlist.css';
  document.head.append(playlistStyles);
}

const menu=document.querySelector('.menu');
menu?.addEventListener('click',()=>{
  const links=document.querySelector('.nav-links');
  const open=links?.classList.toggle('open')??false;
  menu.setAttribute('aria-expanded',String(open));
});

document.querySelector('.copy-tracklist')?.addEventListener('click',async event=>{
  const button=event.currentTarget;
  const target=document.querySelector(button.dataset.copyTarget);
  const status=document.querySelector('.copy-status');
  if(!target)return;
  const tracks=[...target.querySelectorAll('li h2')].map((track,index)=>`${String(index+1).padStart(2,'0')}. ${track.textContent.trim()}`).join('\n');
  try{
    const title=document.querySelector('.article-head h1')?.textContent.trim()||'플레이리스트';
    await navigator.clipboard.writeText(`KPOP YANGON — ${title}\n\n${tracks}\n\n${location.href}`);
    button.textContent='복사 완료 ✓';
    if(status)status.textContent=`${tracks.split('\n').length}곡의 제목과 아티스트를 클립보드에 복사했습니다.`;
    setTimeout(()=>button.textContent='곡 목록 복사',2200);
  }catch{
    if(status)status.textContent='브라우저에서 자동 복사를 허용하지 않았습니다. 아래 트랙 목록을 직접 선택해 주세요.';
  }
});

const youtubeTracks={
  'FTISLAND — 눈물이 더 가까운 사람':'JKuuo7OT18A',
  'DAY6 — Zombie':'k8gx-C7GCGU',
  'QWER — 눈물참기':'pifz9JH1Re8',
  'LUCY — 못 죽는 기사와 비단 요람':'Q9Nvvz6pd9g',
  'QWER — 안녕, 나의 슬픔':'5riuR07c8Dc',
  'LUCY — 개화 (Flowering)':'2-P-NIiLiQc',
  'DAY6 — HAPPY':'2dFwndi4ung',
  'DAY6 — 녹아내려요 (Melt Down)':'yss4rIrHl6o',
  'QWER — 내 이름 맑음':'AlirzLFEHUI',
  'FTISLAND — 바래':'R0Far5Y9ZCs',
  'LUCY — 조깅 (Jogging)':'YdWBnqQgqSk',
  'DAY6 — 한 페이지가 될 수 있게':'vnS_jn2uibs',
  'BIGBANG — BiiiG':'L8ZnXgbyUuc',
  'BIGBANG — FANTASTIC BABY':'AAbokV76tkU',
  'BIGBANG — BANG BANG BANG':'2ips2mM7Zqw',
  'BIGBANG — 거짓말':'2Cv3phvP8Ro',
  'BIGBANG — 하루 하루':'mzCbEdtNbJ0',
  'BIGBANG — BLUE':'2GRP1rkE4O0',
  'BIGBANG — BAD BOY':'1qnV55LUFVM',
  'BIGBANG — LOSER':'1CTced9CMMk',
  'BIGBANG — LAST DANCE':'--zku6TB5NY',
  'BIGBANG — 봄여름가을겨울 (Still Life)':'eN5mG_yMDiM',
  '(여자)아이들 — 나는 아픈 건 딱 질색이니까':'ATK7gAaZTOM',
  'pH-1 — Homebody':'fdMiq-0mi3M',
  '우원재 — 시차 (We Are) (Feat. 로꼬 & GRAY)':'pJ-IGZKyfpU',
  '기리보이 — 교통정리 (Feat. 헤이즈)':'1x6pcgRXmPs',
  'BIG Naughty — 정이라고 하자 (Feat. 10CM)':'q0sUSTMm7gs',
  'DPR LIVE — Martini Blue':'czftJ7E7wa4',
  'DPR LIVE — Jasmine':'Jg9NbDizoPM',
  '박재범 — DRIVE (Feat. GRAY)':'8HFxbY8YvDk',
  '빈지노 — Boogie On & On':'m3xgphSrPfQ',
  '코드 쿤스트 — PARACHUTE (Feat. 오혁 & Dok2)':'ty8fr7vmedg',
  'pH-1, Kid Milli, 루피 — Good Day (Feat. 팔로알토)':'HhWAQDZX-Vg',
  'BewhY — Day Day (Feat. 박재범)':'AMWOLv4Y_0Y',
  '창모 — METEOR':'lOrU0MH0bMk',
  '미란이, 먼치맨, Khundi Panda, 머쉬베놈 — VVS':'hq9hcJIzB6w',
  '에픽하이 — Fly':'fGxlhEp4pao',
  '로꼬, 유주 — 우연히 봄':'VjYO5fdmWhk'
};

const trackHeadings=[...document.querySelectorAll('.tracklist li h2')];
if(trackHeadings.length){
  const tracks=trackHeadings.map(heading=>({
    heading,
    title:heading.textContent.trim(),
    videoId:youtubeTracks[heading.textContent.trim()],
    button:null
  })).filter(track=>track.videoId);
  const playerShell=document.createElement('section');
  playerShell.className='youtube-player-shell';
  playerShell.hidden=true;
  playerShell.setAttribute('aria-label','YouTube 음악 플레이어');
  playerShell.innerHTML='<div class="youtube-player-head"><div><span>OFFICIAL VIDEO · YOUTUBE</span><strong data-player-title>곡을 선택해 주세요</strong><small data-player-progress></small></div><button type="button" data-player-close aria-label="플레이어 닫기">×</button></div><div class="youtube-player-frame"><div data-youtube-player></div></div>';
  document.body.append(playerShell);
  const playerElement=playerShell.querySelector('[data-youtube-player]');
  const nowPlaying=playerShell.querySelector('[data-player-title]');
  const progress=playerShell.querySelector('[data-player-progress]');
  let player;
  let currentIndex=-1;
  let playerReady;
  const loadYouTubeApi=()=>{
    if(window.YT?.Player)return Promise.resolve();
    if(window.youtubeIframeApiReady)return window.youtubeIframeApiReady;
    window.youtubeIframeApiReady=new Promise(resolve=>{
      const previous=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=()=>{
        if(typeof previous==='function')previous();
        resolve();
      };
      const script=document.createElement('script');
      script.src='https://www.youtube.com/iframe_api';
      document.head.append(script);
    });
    return window.youtubeIframeApiReady;
  };
  const setActiveTrack=index=>{
    document.querySelectorAll('.track-play.is-playing').forEach(item=>item.classList.remove('is-playing'));
    const track=tracks[index];
    track.button?.classList.add('is-playing');
    nowPlaying.textContent=track.title;
    progress.textContent=`${index+1} / ${tracks.length} · 종료 후 다음 곡 자동 재생`;
    currentIndex=index;
    playerShell.hidden=false;
  };
  const ensurePlayer=async()=>{
    if(playerReady)return playerReady;
    playerReady=(async()=>{
      await loadYouTubeApi();
      return new Promise(resolve=>{
        player=new YT.Player(playerElement,{
          width:'100%',
          height:'100%',
          host:'https://www.youtube-nocookie.com',
          playerVars:{autoplay:1,playsinline:1,rel:0},
          events:{
            onReady:resolve,
            onStateChange:event=>{
              if(event.data===YT.PlayerState.ENDED&&currentIndex<tracks.length-1){
                const nextIndex=currentIndex+1;
                setActiveTrack(nextIndex);
                player.loadVideoById(tracks[nextIndex].videoId);
              }
            }
          }
        });
      });
    })();
    return playerReady;
  };
  const play=async index=>{
    setActiveTrack(index);
    await ensurePlayer();
    player.loadVideoById(tracks[index].videoId);
  };
  trackHeadings.forEach(heading=>{
    const title=heading.textContent.trim();
    const videoId=youtubeTracks[title];
    const actions=document.createElement('div');
    actions.className='track-actions';
    if(videoId){
      const button=document.createElement('button');
      button.className='track-play';
      button.type='button';
      button.innerHTML='<span aria-hidden="true">▶</span> 여기서 듣기';
      button.setAttribute('aria-label',`${title} 여기서 듣기`);
      const index=tracks.findIndex(track=>track.heading===heading);
      tracks[index].button=button;
      button.addEventListener('click',()=>play(index));
      actions.append(button);
    }
    const link=document.createElement('a');
    link.className='track-youtube-link';
    link.href=videoId?`https://www.youtube.com/watch?v=${videoId}`:`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official`)}`;
    link.target='_blank';
    link.rel='noopener';
    link.textContent=videoId?'YouTube에서 열기 ↗':'YouTube에서 찾기 ↗';
    actions.append(link);
    heading.insertAdjacentElement('afterend',actions);
  });
  const serviceButtons=document.querySelector('.listen-panel .service-buttons');
  if(serviceButtons&&tracks.length){
    const playlistLink=document.createElement('a');
    playlistLink.className='service-button';
    playlistLink.href=`https://www.youtube.com/watch_videos?video_ids=${tracks.map(track=>track.videoId).join(',')}`;
    playlistLink.target='_blank';
    playlistLink.rel='noopener';
    playlistLink.textContent='YouTube에서 전체 목록 듣기 ↗';
    serviceButtons.prepend(playlistLink);
  }
  playerShell.querySelector('[data-player-close]').addEventListener('click',()=>{
    player?.stopVideo();
    playerShell.hidden=true;
    currentIndex=-1;
    document.querySelectorAll('.track-play.is-playing').forEach(item=>item.classList.remove('is-playing'));
  });
}

const playlistSlider=document.querySelector('[data-playlist-slider]');
if(playlistSlider){
  const cards=[...playlistSlider.children];
  const dots=[...document.querySelectorAll('.slider-dots span')];
  const move=direction=>playlistSlider.scrollBy({left:direction*playlistSlider.clientWidth,behavior:'smooth'});
  document.querySelector('[data-slider-prev]')?.addEventListener('click',()=>move(-1));
  document.querySelector('[data-slider-next]')?.addEventListener('click',()=>move(1));
  playlistSlider.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft')move(-1);
    if(event.key==='ArrowRight')move(1);
  });
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const index=cards.indexOf(entry.target);
    dots.forEach((dot,dotIndex)=>dot.classList.toggle('active',dotIndex===index));
  }),{root:playlistSlider,threshold:.65});
  cards.forEach(card=>observer.observe(card));
}
