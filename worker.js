const REDIRECTS=new Map([['/news.html','/archive.html'],['/chart.html','/archive.html'],['/article.html','/archive.html']]);
export default{async fetch(request,env){const url=new URL(request.url),target=REDIRECTS.get(url.pathname);if(target)return Response.redirect(new URL(target,url.origin),301);return env.ASSETS.fetch(request)}};
