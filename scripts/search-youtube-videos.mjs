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

if(process.argv[2]==='--playlist'){
  const playlistId=process.argv[3];
  const playlistUrl=new URL('https://www.googleapis.com/youtube/v3/playlists');
  playlistUrl.search=new URLSearchParams({part:'snippet,status,contentDetails',id:playlistId});
  const playlistResponse=await fetch(playlistUrl,{headers:{authorization:`Bearer ${token.access_token}`}});
  const playlistData=await playlistResponse.json();
  if(!playlistResponse.ok)throw new Error(playlistData.error?.message||playlistResponse.statusText);
  console.log(JSON.stringify(playlistData.items||[],null,2));
  const itemsUrl=new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  itemsUrl.search=new URLSearchParams({part:'snippet,status',playlistId,maxResults:'50'});
  const itemsResponse=await fetch(itemsUrl,{headers:{authorization:`Bearer ${token.access_token}`}});
  const itemsData=await itemsResponse.json();
  if(!itemsResponse.ok)throw new Error(itemsData.error?.message||itemsResponse.statusText);
  console.log(`ITEMS=${itemsData.items?.length||0}`);
  for(const item of itemsData.items||[])console.log(`${item.snippet?.resourceId?.videoId}\t${item.status?.privacyStatus}\t${item.snippet?.title}`);
  process.exit(0);
}

if(process.argv[2]==='--video'){
  const videoId=process.argv[3];
  const videoUrl=new URL('https://www.googleapis.com/youtube/v3/videos');
  videoUrl.search=new URLSearchParams({part:'snippet,status,contentDetails',id:videoId});
  const videoResponse=await fetch(videoUrl,{headers:{authorization:`Bearer ${token.access_token}`}});
  const videoData=await videoResponse.json();
  if(!videoResponse.ok)throw new Error(videoData.error?.message||videoResponse.statusText);
  console.log(JSON.stringify(videoData.items||[],null,2));
  process.exit(0);
}

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
