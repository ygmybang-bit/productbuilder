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
  'BTS — 쩔어':'BVwAVbKYYeM',
  'BTS — 불타오르네':'4ujQOR2DMFM',
  'BTS — Not Today':'9DwzBICPhdM',
  'BTS — MIC Drop (Steve Aoki Remix)':'kTlv5_Bs8aw',
  'BTS — ON':'mPVDGOVjRQ0',
  'BTS — DNA':'MBdVXkSdhwU',
  'BTS — IDOL':'pBuZEGYXA6E',
  'BTS — 작은 것들을 위한 시 (Boy With Luv)':'XsX3ATc3FbA',
  'BTS — Dynamite':'gdZLi9oWNZg',
  'BTS — Butter':'WMweEpGlu_U',
  'BTS — Permission to Dance':'CuklIb9d3fI',
  '아이유 — 밤편지':'BzYnNdJhZQw',
  'NewJeans — Hurt':'tVIXY14aJms',
  '태연 — 11:11':'ulr0muQKjk0',
  'Colde — 와르르♥':'M9tsm6S9v1g',
  'offonoff — 춤':'zt0Me5qyK4g',
  '헤이즈 — 비도 오고 그래서':'afxLaQiLu-o',
  '아이유 — 무릎':'SfeaTW4bcAw',
  'AKMU — 어떻게 이별까지 사랑하겠어, 널 사랑하는 거지':'m3DZsBw5bnE',
  'RESCENE — LOVE ATTACK':'9XttLI0oH0I',
  'KiiiKiii — Pop Off Pop Off':'UsbRoaH6y-Q',
  'Hearts2Hearts — Lemon Tang':'1VqxWNwgf5Q',
  'Red Velvet — Surfin’ Boy':'Do9BOhk0u_w',
  'KISS OF LIFE — SWEAT':'M0v-AeoIsTU',
  'KATSEYE — Animal':'m7k9UMcHbr0',
  'ARTMS — Born Stunner':'jyRuPP4q5g0',
  'BABYMONSTER — SUGAR HONEY ICE TEA':'J3-oRJ606Jw',
  'BABYMONSTER — MOON':'8cFKPrxrrJM',
  'OURBIRTHDAY — Our Birthday':'Kw2gmCOgR0c',
  '정은지 — I Love LOVE':'IfYKJSTCTI0',
  'Hearts2Hearts — RUDE!':'F7sGJVUrkjQ',
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
  'BIGBANG — 하루 하루':'MzCbEdtNbJ0',
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
  playerShell.innerHTML='<div class="youtube-player-head"><div><span>OFFICIAL VIDEO · YOUTUBE</span><strong data-player-title>곡을 선택해 주세요</strong><small data-player-progress></small><a data-player-youtube-link href="https://www.youtube.com/" target="_blank" rel="noopener">YouTube 앱에서 이 곡 듣기</a></div><button type="button" data-player-close aria-label="플레이어 닫기">×</button></div><div class="youtube-player-frame"><div data-youtube-player></div></div>';
  document.body.append(playerShell);
  const playerElement=playerShell.querySelector('[data-youtube-player]');
  const nowPlaying=playerShell.querySelector('[data-player-title]');
  const progress=playerShell.querySelector('[data-player-progress]');
  const playerYouTubeLink=playerShell.querySelector('[data-player-youtube-link]');
  let player;
  let currentIndex=-1;
  let currentTrackHasPlayed=false;
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
    playerYouTubeLink.href=`https://www.youtube.com/watch?v=${track.videoId}`;
    progress.textContent=`${index+1} / ${tracks.length} · 종료 후 다음 곡 자동 재생`;
    currentIndex=index;
    currentTrackHasPlayed=false;
    playerShell.hidden=false;
  };
  const playNextTrack=(afterError=false)=>{
    const nextIndex=currentIndex+1;
    if(nextIndex>=tracks.length){
      progress.textContent=afterError
        ?'이 영상은 현재 재생할 수 없습니다 · 공식 YouTube 링크를 확인해 주세요'
        :'플레이리스트 재생이 끝났습니다';
      return;
    }
    if(afterError)progress.textContent='현재 영상을 재생할 수 없어 다음 곡으로 이동합니다';
    setTimeout(()=>{
      setActiveTrack(nextIndex);
      player.loadVideoById(tracks[nextIndex].videoId);
    },afterError?500:0);
  };
  const handlePlayerError=event=>{
    const errorCode=event.data;
    if([100,101,150].includes(errorCode)){
      playNextTrack(true);
      return;
    }
    progress.textContent=errorCode===153
      ?'YouTube가 재생 요청을 확인하지 못했습니다 · 아래 링크로 YouTube에서 들어주세요'
      :'YouTube에서 사용자 확인이 필요할 수 있습니다 · 아래 링크로 YouTube에서 들어주세요';
  };
  const ensurePlayer=async()=>{
    if(playerReady)return playerReady;
    playerReady=(async()=>{
      await loadYouTubeApi();
      return new Promise(resolve=>{
        player=new YT.Player(playerElement,{
          width:'100%',
          height:'100%',
          host:'https://www.youtube.com',
          playerVars:{
            autoplay:1,
            playsinline:1,
            rel:0,
            origin:window.location.origin,
            widget_referrer:window.location.href
          },
          events:{
            onReady:resolve,
            onStateChange:event=>{
              if(event.data===YT.PlayerState.PLAYING){
                currentTrackHasPlayed=true;
              }
              if(event.data===YT.PlayerState.ENDED&&currentTrackHasPlayed&&currentIndex<tracks.length-1){
                playNextTrack();
              }
            },
            onError:handlePlayerError
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
    const playlistButton=document.createElement('button');
    playlistButton.className='service-button';
    playlistButton.type='button';
    playlistButton.textContent='사이트에서 전체 목록 듣기 ▶';
    playlistButton.setAttribute('aria-label','첫 곡부터 전체 목록 연속 재생');
    playlistButton.addEventListener('click',()=>play(0));
    serviceButtons.prepend(playlistButton);
  }
  playerShell.querySelector('[data-player-close]').addEventListener('click',()=>{
    player?.stopVideo();
    playerShell.hidden=true;
    currentIndex=-1;
    document.querySelectorAll('.track-play.is-playing').forEach(item=>item.classList.remove('is-playing'));
  });
}

const heroTopList=document.querySelector('.hero-top-list');
if(heroTopList){
  const latestLinks=[...heroTopList.querySelectorAll('li')]
    .sort((a,b)=>(b.querySelector('a')?.dataset.published||'').localeCompare(a.querySelector('a')?.dataset.published||''));
  latestLinks.forEach((item,index)=>{
    if(index>=5)return item.remove();
    const number=item.querySelector('span');
    if(number)number.textContent=String(index+1).padStart(2,'0');
    heroTopList.append(item);
  });
}

const playlistSlider=document.querySelector('[data-playlist-slider]');
if(playlistSlider){
  const allCards=[...playlistSlider.querySelectorAll('.playlist-feature')]
    .sort((a,b)=>(b.dataset.published||'').localeCompare(a.dataset.published||''));
  allCards.forEach(card=>playlistSlider.append(card));
  allCards.slice(3).forEach(card=>card.remove());
  const cards=allCards.slice(0,3);
  const latest=cards[0];
  if(latest){
    const playlistLabel=latest.querySelector('.playlist-cover > span')?.textContent.match(/PLAYLIST\s+\d+/)?.[0];
    const trackCount=latest.querySelector('.playlist-cover small')?.textContent.match(/\d+(?=\s*TRACKS)/)?.[0];
    const duration=latest.querySelector('.playlist-summary > p')?.textContent.match(/약\s*\d+분/)?.[0];
    const category=latest.querySelector('.category')?.textContent.replace(/^NEW\s*·\s*/,'');
    const title=latest.querySelector('.playlist-summary h3')?.textContent.trim();
    const heroMeta=[...document.querySelectorAll('.hero-meta span')];
    if(playlistLabel&&heroMeta[0])heroMeta[0].textContent=playlistLabel;
    if(trackCount&&duration&&heroMeta[1])heroMeta[1].textContent=`${trackCount}곡 · ${duration}`;
    if(category&&heroMeta[2])heroMeta[2].textContent=category;
    const playNow=document.querySelector('.hero-side .side-block');
    if(playNow){
      playNow.href=latest.getAttribute('href');
      const number=playNow.querySelector('.side-number');
      const description=playNow.querySelector('p');
      if(number&&trackCount)number.textContent=trackCount.padStart(2,'0');
      if(description&&title)description.textContent=`${title} →`;
    }
    const flowNumber=document.querySelector('.hero-side .side-block:nth-child(2) .side-number');
    if(flowNumber&&trackCount)flowNumber.textContent=`01—${trackCount.padStart(2,'0')}`;
  }
  const dotsContainer=document.querySelector('.slider-dots');
  if(dotsContainer){
    dotsContainer.replaceChildren(...cards.map((_,index)=>{
      const dot=document.createElement('span');
      dot.classList.toggle('active',index===0);
      return dot;
    }));
  }
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
