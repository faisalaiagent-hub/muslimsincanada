import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({ignoreAttributes:false,processEntities:false});
const urls = ['https://www.youtube.com/@QuranSpeaks','https://www.youtube.com/@YasminMogahedOnline','https://www.youtube.com/@YasirQadhi','https://www.youtube.com/@NavaidAziz','https://www.muslimnetwork.tv/feed/','https://muslimmatters.org/category/current-affairs/feed/','https://themuslimvibe.com/feed'];
const results=await Promise.all(urls.map(async url=>{
  try {
    const r=await fetch(url,{signal:AbortSignal.timeout(15000)});const text=await r.text();
    if(url.includes('youtube.com')) {
      const canonical=text.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
      const channel=text.match(/"externalId":"(UC[^"]+)"/)?.[1] || text.match(/"channelId":"(UC[^"]+)"/)?.[1];
      const name=text.match(/<title>(.*?)<\/title>/)?.[1];
      return {url,status:r.status,canonical,channel,name,subscribers:text.match(/"subscriberCountText":\{[^}]+\}/)?.[0]};
    }
    const xml=parser.parse(text);const items=xml.rss?.channel?.item;const first=Array.isArray(items)?items[0]:items;
    return {url,status:r.status,count:Array.isArray(items)?items.length:0,first:first?{title:first.title,date:first.pubDate,link:first.link,keys:Object.keys(first),media:first['media:content'],thumbnail:first['media:thumbnail'],enclosure:first.enclosure,description:String(first.description).slice(0,400),content:String(first['content:encoded']).slice(0,500)}:text.slice(0,120)};
  }catch(e){return{url,error:e.message};}
}));results.forEach(r=>console.log(JSON.stringify(r)));
