import 'server-only';
import { unstable_cache } from 'next/cache';
import { publishers, voices } from './editorial-config';
import { parseNews, parseVideos } from './feed-parser';
import type { FeedItem } from './feed-parser';
import bundledSnapshot from '@/data/editorial-snapshot.json';
import { snapshotSource } from './feed-snapshot';

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
  let snapshot: unknown = bundledSnapshot;
  try {
    const response = await fetch('https://raw.githubusercontent.com/faisalaiagent-hub/muslimsincanada/main/data/editorial-snapshot.json', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (response.ok && Number(response.headers.get('content-length') || 0) < 1000000) {
      const raw = await response.text();
      if (raw.length < 1000000) snapshot = JSON.parse(raw);
    }
  } catch { /* The bundled successful snapshot remains available offline. */ }
  async function sourceFeed(source: { id: string; channelId?: string; host?: string }, url: string, parser: (xml: string) => FeedItem[]) {
    const live = await safeFeed(url, parser);
    const fallback = snapshotSource(snapshot, source) || snapshotSource(bundledSnapshot, source);
    const items = live.items.map(item => ({ ...item, image: item.image || fallback?.items.find(saved => saved.id === item.id)?.image }));
    return { ...live, items, snapshotAt: undefined as string | undefined, ...(live.unavailable && fallback ? fallback : {}) };
  }
  const [creators, news] = await Promise.all([
    Promise.all(voices.map(async voice => ({ ...voice, ...await sourceFeed(voice, `https://www.youtube.com/feeds/videos.xml?channel_id=${voice.channelId}`, xml => parseVideos(xml, voice.channelId, 'match' in voice ? voice.match : undefined)) }))),
    Promise.all(publishers.map(async publisher => ({ ...publisher, ...await sourceFeed(publisher, publisher.feed, xml => parseNews(xml, publisher.host)) }))),
  ]);
  return { creators, news, checkedAt: new Date().toISOString() };
}, ['mic-editorial-v4'], { revalidate: 300 });

export type EditorialData = Awaited<ReturnType<typeof getEditorial>>;
