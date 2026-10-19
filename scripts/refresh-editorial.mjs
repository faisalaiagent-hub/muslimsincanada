import fs from 'node:fs/promises';
import { voices, publishers } from '../lib/editorial-config.ts';
import { parseVideos, parseNews } from '../lib/feed-parser.ts';
import { publisherImage } from '../lib/publisher-image.ts';

const path = 'data/editorial-snapshot.json';
let previous = { sources: {} };
try { previous = JSON.parse(await fs.readFile(path, 'utf8')); } catch {}
const sources = { ...previous.sources };
let successes = 0;
for (const source of [...voices, ...publishers]) {
  try {
    const video = 'channelId' in source;
    const url = video ? `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channelId}` : source.feed;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const items = video ? parseVideos(xml, source.channelId, source.match) : parseNews(xml, source.host);
    if (!items.length) throw new Error('No valid entries');
    if (!video) {
      await Promise.all(items.slice(0, 6).filter(item => !item.image).map(async item => {
        try {
          const page = await fetch(item.url, { signal: AbortSignal.timeout(8000) });
          if (!page.ok || new URL(page.url).hostname.replace(/^www\./, '') !== source.host) return;
          const reader = page.body.getReader(); let html = '', bytes = 0; const decoder = new TextDecoder();
          try { while (true) { const {done,value} = await reader.read(); if(done) break; bytes += value.byteLength; if(bytes > 1000000) break; html += decoder.decode(value, {stream:true}); if (html.includes('</head>')) break; } } finally { await reader.cancel(); }
          const image = publisherImage(html, source.host); if (image) item.image = image;
        } catch { /* A labelled illustration remains available. */ }
      }));
    }
    sources[source.id] = { checkedAt: new Date().toISOString(), items: items.slice(0, 15) };
    successes++;
    console.log(`${source.id}: refreshed ${items.length} entries`);
  } catch (error) { console.warn(`${source.id}: retained last successful snapshot (${error.message})`); }
}
if (!successes) throw new Error('All sources unavailable; existing snapshot left unchanged');
await fs.writeFile(path, JSON.stringify({ version: 1, sources }, null, 2) + '\n');
