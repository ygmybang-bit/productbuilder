const REDIRECTS=new Map([['/news.html','/archive'],['/chart.html','/archive'],['/article.html','/archive']]);
export default{async fetch(request,env){
  const url=new URL(request.url);
  if(url.protocol!=='https:'||url.hostname==='www.kpopyangon.com'){
    url.protocol='https:';
    url.hostname='kpopyangon.com';
    url.port='';
    return Response.redirect(url,301);
  }
  const target=REDIRECTS.get(url.pathname);
  if(target)return Response.redirect(new URL(target,url.origin),301);
  return env.ASSETS.fetch(request);
}};
