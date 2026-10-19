import { XMLParser } from 'fast-xml-parser';

export type FeedItem = { id: string; title: string; url: string; published: string; image?: string };
const list = (value: any): any[] => value == null ? [] : Array.isArray(value) ? value : [value];
export function plain(value: unknown): string {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => {
    const code = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
  }).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim().slice(0, 400);
}
function parse(xml: string) {
  if (xml.length > 3_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported feed');
  return new XMLParser({ ignoreAttributes: false, processEntities: false, parseTagValue: false }).parse(xml);
}
function date(value: unknown) {
  const parsed = new Date(String(value));
  return Number.isFinite(parsed.getTime()) && parsed.getTime() < Date.now() + 86_400_000 ? parsed.toISOString() : '';
}
export function parseVideos(xml: string, channel: string, match?: string): FeedItem[] {
  const feed = parse(xml).feed;
  if (String(feed?.['yt:channelId']).replace(/^UC/, '') !== channel.replace(/^UC/, '')) throw new Error('Channel mismatch');
  return list(feed.entry).flatMap(entry => {
    const id = String(entry['yt:videoId'] ?? '');
    const title = plain(entry.title);
    const published = date(entry.published);
    return /^[\w-]{11}$/.test(id) && published && (!match || title.toLowerCase().includes(match)) ? [{ id, title, published, url: `https://www.youtube.com/watch?v=${id}`, image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }] : [];
  }).sort((a, b) => b.published.localeCompare(a.published));
}
export function parseNews(xml: string, host: string): FeedItem[] {
  return list(parse(xml).rss?.channel?.item).flatMap(entry => {
    try {
      const url = new URL(plain(entry.link));
      if (url.protocol !== 'https:' || url.hostname.replace(/^www\./, '') !== host) return [];
      url.search = '';
      const title = plain(entry.title), published = date(entry.pubDate);
      const content = String(entry['content:encoded'] ?? entry.description ?? '');
      const candidates = [...list(entry['media:content']), ...list(entry['media:thumbnail']), ...list(entry.enclosure)].map(item => item?.['@_url']);
      for (const tag of content.match(/<img\b[^>]*>/gi) ?? []) {
        if (/wp-content\/plugins/i.test(tag) || /(?:width|height)=["'](?:\d|\d\d)["']/i.test(tag)) continue;
        candidates.push(tag.match(/\bsrc=["']([^"']+)/i)?.[1]);
      }
      const image = candidates.map(candidate => candidate ? plain(candidate) : '').find(candidate => {
        try { const imageUrl = new URL(candidate); return imageUrl.protocol === 'https:' && imageUrl.hostname.replace(/^www\./, '') === host && /\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(imageUrl.pathname); } catch { return false; }
      });
      return title && published ? [{ id: url.href, title, published, url: url.href, ...(image ? { image: String(image) } : {}) }] : [];
    } catch { return []; }
  }).sort((a, b) => b.published.localeCompare(a.published));
}
