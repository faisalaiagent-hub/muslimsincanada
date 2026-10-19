const urls = [
  'https://muslimmatters.org/feed/',
  'https://muslimnews.co.uk/feed/',
  'https://muslimlink.ca/news?format=feed&type=rss',
  'https://themuslimvibe.com/feed',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCx1Zr8zUKUHUtHEVq09b5vg',
  'https://www.youtube.com/@yaqeeninstitute',
  'https://www.quranspeaks.com/',
  'https://linktr.ee/omarsuleiman',
  'https://linktr.ee/yasminmogahed',
];
for (let index=0;index<urls.length;index+=3) {
  const results = await Promise.all(urls.slice(index,index+3).map(async url => {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'MICPortal/0.1 (+https://muslimsincanada.com)'}});
      const text=await response.text();
      return {url,status:response.status,type:response.headers.get('content-type'),length:text.length,start:text.slice(0,140),ids:[...new Set(text.match(/UC[A-Za-z0-9_-]{22}/g)||[])].slice(0,5),socials:[...new Set((text.match(/https?:[^\s"<>]+/g)||[]).filter(value=>/youtube\.com\/(?:@|channel\/)|instagram\.com\//.test(value)))].slice(0,8)};
    }catch(error){return{url,error:error.message};}
  }));
  results.forEach(result=>console.log(JSON.stringify(result)));
}
