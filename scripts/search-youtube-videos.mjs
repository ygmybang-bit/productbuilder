import fs from 'node:fs/promises';

const credentialsRaw=JSON.parse(await fs.readFile('client_secret.json','utf8'));
const credentials=credentialsRaw.installed||credentialsRaw.web;
const saved=JSON.parse(await fs.readFile('youtube-token.json','utf8'));
const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{
  method:'POST',
  headers:{'content-type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({
    client_id:credentials.client_id,
    client_secret:credentials.client_secret,
    refresh_token:saved.refresh_token,
    grant_type:'refresh_token'
  })
});
const token=await tokenResponse.json();
if(!tokenResponse.ok)throw new Error(token.error_description||token.error);

for(const query of process.argv.slice(2)){
  const url=new URL('https://www.googleapis.com/youtube/v3/search');
  url.search=new URLSearchParams({part:'snippet',type:'video',maxResults:'5',q:query});
  const response=await fetch(url,{headers:{authorization:`Bearer ${token.access_token}`}});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error?.message||response.statusText);
  console.log(`\n${query}`);
  for(const item of data.items||[]){
    console.log(`${item.id.videoId}\t${item.snippet.channelTitle}\t${item.snippet.title}`);
  }
}
