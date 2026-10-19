import 'server-only';
import { unstable_cache } from 'next/cache';
import { publishers, voices } from './editorial-config';
import { parseNews, parseVideos } from './feed-parser';
import type { FeedItem } from './feed-parser';

async function readFeed(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } });
  if (!response.ok || !response.body) throw new Error('Feed unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let xml = '', bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 3_000_000) throw new Error('Feed too large');
      xml += decoder.decode(value, { stream: true });
    }
    return xml + decoder.decode();
  } finally { await reader.cancel(); }
}
async function safeFeed(url: string, parser: (xml: string) => FeedItem[]) {
  try { return { items: parser(await readFeed(url)), unavailable: false }; }
  catch { return { items: [] as FeedItem[], unavailable: true }; }
}
export const getEditorial = unstable_cache(async function getEditorial() {
  const [creators, news] = await Promise.all([
    Promise.all(voices.map(async voice => ({ ...voice, ...await safeFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${voice.channelId}`, xml => parseVideos(xml, voice.channelId, 'match' in voice ? voice.match : undefined)) }))),
    Promise.all(publishers.map(async publisher => ({ ...publisher, ...await safeFeed(publisher.feed, xml => parseNews(xml, publisher.host)) }))),
  ]);
  return { creators, news, checkedAt: new Date().toISOString() };
}, ['mic-editorial-v2'], { revalidate: 300 });

export type EditorialData = Awaited<ReturnType<typeof getEditorial>>;
