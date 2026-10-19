import type { FeedItem } from './feed-parser';
// Public snapshot data is untrusted: restrict destinations, IDs and thumbnail hosts.
export function snapshotSource(data: unknown, source: { id: string; channelId?: string; host?: string }) {
  const row = (data as any)?.sources?.[source.id];
  if (!row || !Array.isArray(row.items) || !Number.isFinite(Date.parse(row.checkedAt)) || Date.parse(row.checkedAt) > Date.now() + 60000) return null;
  const items: FeedItem[] = row.items.slice(0, 15).flatMap((item: any) => {
    try {
      const url = new URL(item.url);
      const date = Date.parse(item.published);
      if (typeof item.title !== 'string' || !item.title.trim() || !Number.isFinite(date) || date > Date.now() + 86400000 || url.protocol !== 'https:') return [];
      if (source.channelId) {
        if (!/^[\w-]{11}$/.test(item.id) || url.hostname !== 'www.youtube.com' || url.pathname !== '/watch' || url.searchParams.get('v') !== item.id) return [];
        return [{ id: item.id, title: item.title.slice(0, 400), published: new Date(date).toISOString(), url: `https://www.youtube.com/watch?v=${item.id}`, image: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg` }];
      }
      if (url.hostname.replace(/^www\./, '') !== source.host) return [];
      let image: string | undefined;
      try { const candidate = new URL(item.image); if (candidate.protocol === 'https:' && candidate.hostname.replace(/^www\./, '') === source.host) image = candidate.href; } catch {}
      return [{ id: url.href, title: item.title.slice(0, 400), published: new Date(date).toISOString(), url: url.href, ...(image ? { image } : {}) }];
    } catch { return []; }
  });
  return items.length ? { items, snapshotAt: row.checkedAt as string } : null;
}
