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
