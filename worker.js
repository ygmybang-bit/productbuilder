const REDIRECTS=new Map([
  ['/news.html','/archive'],
  ['/chart.html','/archive'],
  ['/article.html','/archive'],
  ['/article','/archive']
]);
const RETIRED_API_PATHS=new Set(['/api/nate-news','/api/melon-chart']);
export default{async fetch(request,env){
  const url=new URL(request.url);
  const original=url.toString();
  url.protocol='https:';
  url.hostname='kpopyangon.com';
  url.port='';
  const legacyTarget=REDIRECTS.get(url.pathname);
  if(legacyTarget){
    url.pathname=legacyTarget;
    url.search='';
  }
  else if(url.pathname.endsWith('/index.html'))url.pathname=url.pathname.slice(0,-10)||'/';
  else if(url.pathname.endsWith('.html'))url.pathname=url.pathname.slice(0,-5)||'/';
  if(url.pathname.length>1&&url.pathname.endsWith('/'))url.pathname=url.pathname.replace(/\/+$/,'');
  if(url.toString()!==original)return Response.redirect(url,301);
  if(RETIRED_API_PATHS.has(url.pathname))return new Response(null,{status:410,headers:{
    'cache-control':'public, max-age=86400',
    'x-robots-tag':'noindex, nofollow'
  }});
  return env.ASSETS.fetch(request);
}};
