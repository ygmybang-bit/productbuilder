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
    await navigator.clipboard.writeText(`KPOP YANGON — 양곤의 비 오는 밤\n\n${tracks}\n\nhttps://kpopyangon.com/posts/yangon-rainy-night.html`);
    button.textContent='복사 완료 ✓';
    if(status)status.textContent='10곡의 제목과 아티스트를 클립보드에 복사했습니다.';
    setTimeout(()=>button.textContent='곡 목록 복사',2200);
  }catch{
    if(status)status.textContent='브라우저에서 자동 복사를 허용하지 않았습니다. 아래 트랙 목록을 직접 선택해 주세요.';
  }
});
