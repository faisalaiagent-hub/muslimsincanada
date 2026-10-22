import { allowedFeedImage } from './feed-images.js';

export type DailyItem = {
  id: string; kind: 'news' | 'talk' | 'event' | 'guide' | 'greeting'; title: string; summary: string;
  url: string; sourceId: string; source: string; image?: string; published?: string; expiresAt?: string;
};
export type DailyEdition = { date: string; generatedAt: string; items: DailyItem[] };
type Source = { id: string; name: string; host?: string; channelId?: string };
export function torontoDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function validDay(day: unknown): day is string {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}
export function dailyPath(day: string, item: DailyItem) { return `/today/${day}/${item.id}`; }
export function dailyCaption(day: string, item: DailyItem) {
  return `${item.title}\n\n${item.summary}\n\n${item.kind === 'guide' || item.kind === 'greeting' ? 'From' : 'Source:'} ${item.source}\nMIC highlights · ${day}\nhttps://www.muslimsincanada.com${dailyPath(day, item)}\n\n#MuslimsInCanada #MICCommunity`;
}
export function validateEdition(raw: unknown, sources: readonly Source[], now = new Date()): DailyEdition | null {
  const edition = raw as DailyEdition;
  if (!edition || !validDay(edition.date) || edition.date > torontoDate(now) || !Number.isFinite(Date.parse(edition.generatedAt)) || Date.parse(edition.generatedAt) > now.getTime() + 60000 || !Array.isArray(edition.items) || edition.items.length !== 2) return null;
  const items: DailyItem[] = [];
  for (const row of edition.items) {
    if (!row || !/^[a-z0-9-]{3,60}$/.test(row.id) || typeof row.title !== 'string' || !row.title.trim() || row.title.length > 400 || typeof row.summary !== 'string' || row.summary.length > 600 || !['news','talk','event','guide','greeting'].includes(row.kind)) return null;
    if (row.expiresAt && (!Number.isFinite(Date.parse(row.expiresAt)) || Date.parse(row.expiresAt) <= Date.parse(edition.generatedAt))) return null;
    if (row.published && (!Number.isFinite(Date.parse(row.published)) || Date.parse(row.published) > now.getTime() + 60000)) return null;
    let image: string | undefined;
    let source: string;
    try {
      if (row.sourceId === 'mic') {
        if (!['guide','greeting','event'].includes(row.kind) || !/^\/(?:guides|resources|nearby|submit|marketplace|[a-z-]+\/events)(?:\/|\?|$)/.test(row.url) || row.url.includes('\\') || row.url.includes('#')) return null;
        const url = new URL(row.url, 'https://www.muslimsincanada.com');
        if (url.origin !== 'https://www.muslimsincanada.com') return null;
        source = row.kind === 'event' ? 'MIC event directory' : 'Muslims in Canada';
        if (row.image && /^\/media\/[a-z0-9-]+\.(jpg|png|webp|svg)$/.test(row.image)) image = row.image;
      } else {
        const configured = sources.find(s => s.id === row.sourceId);
        if (!configured) return null;
        const url = new URL(row.url);
        if (url.protocol !== 'https:') return null;
        if (row.kind === 'talk' && configured.channelId && url.hostname === 'www.youtube.com' && url.pathname === '/watch' && /^[\w-]{11}$/.test(url.searchParams.get('v') || '')) image = `https://i.ytimg.com/vi/${url.searchParams.get('v')}/hqdefault.jpg`;
        else if (row.kind === 'news' && configured.host && url.hostname.replace(/^www\./, '') === configured.host) image = allowedFeedImage(row.image, configured.host);
        else return null;
        source = configured.name;
      }
    } catch { return null; }
    items.push({ id: row.id, kind: row.kind, title: row.title, summary: row.summary, url: row.url, sourceId: row.sourceId, source, ...(image ? {image} : {}), ...(row.published ? {published:row.published} : {}), ...(row.expiresAt ? {expiresAt:row.expiresAt} : {}) });
  }
  return new Set(items.map(i => i.url)).size === 2 && new Set(items.map(i => i.id)).size === 2 ? { date:edition.date, generatedAt:edition.generatedAt, items } : null;
}
export function chooseDailyItems(candidates: DailyItem[], history: DailyEdition[], date: string): DailyItem[] {
  const recent = history.filter(e => e.date < date).sort((a,b) => b.date.localeCompare(a.date)).slice(0,7);
  const used = new Set(recent.flatMap(e => e.items.map(i => i.url)));
  const available = candidates.filter(i => !used.has(i.url));
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const plan = ([['guide','talk'],['news','guide'],['talk','news'],['news','talk'],['talk','guide'],['talk','news'],['news','guide']] as const)[weekday];
  const result: DailyItem[] = [];
  // Date-reviewed greetings/events take precedence, with a different kind in the second slot.
  const special = available.find(i => i.kind === 'greeting') || available.find(i => i.kind === 'event');
  if (special) result.push(special);
  for (const kind of plan) {
    const item = available.find(i => i.kind === kind && !result.some(r => r.url === i.url || r.kind === i.kind));
    if (item && result.length < 2) result.push(item);
  }
  for (const item of available) if (result.length < 2 && !result.some(r => r.url === item.url || r.kind === item.kind)) result.push(item);
  if (result.length !== 2) throw new Error('Not enough distinct, unused highlights; retain the last successful edition.');
  return result;
}
