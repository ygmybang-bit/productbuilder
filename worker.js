const REDIRECTS=new Map([['/news.html','/archive'],['/chart.html','/archive'],['/article.html','/archive']]);
export default{async fetch(request,env){
  const url=new URL(request.url);
  const original=url.toString();
  url.protocol='https:';
  url.hostname='kpopyangon.com';
  url.port='';
  const legacyTarget=REDIRECTS.get(url.pathname);
  if(legacyTarget)url.pathname=legacyTarget;
  else if(url.pathname.endsWith('/index.html'))url.pathname=url.pathname.slice(0,-10)||'/';
  else if(url.pathname.endsWith('.html'))url.pathname=url.pathname.slice(0,-5)||'/';
  if(url.pathname.length>1&&url.pathname.endsWith('/'))url.pathname=url.pathname.replace(/\/+$/,'');
  if(url.toString()!==original)return Response.redirect(url,301);
  return env.ASSETS.fetch(request);
}};
