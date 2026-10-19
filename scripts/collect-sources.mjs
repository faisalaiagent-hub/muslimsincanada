import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resources, safeUrl } from '../lib/community.ts';

// Public, editorially selected first-party pages only. No private social data,
// search-result scraping, guessed dates, or automatic publication.
const outputIndex = process.argv.indexOf('--output');
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : 'data/source-reviews.json';
const queue = process.argv.includes('--queue');
if (!output) throw new Error('Supply an output path.');
const MAX_BYTES = 2_000_000;
async function readLimited(response) {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('Page exceeds collection limit'); } chunks.push(value); }
  return Buffer.concat(chunks).toString('utf8');
}
function eventsFromJsonLd(html, source) {
  const events = [];
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.some(type => typeof type === 'string' && /(^|\/)Event$/.test(type))) {
      const start = value.startDate;
      if (typeof value.name === 'string' && typeof start === 'string' && /T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(start) && Date.parse(start) > Date.now()) {
        const eventUrl = safeUrl(value.url) || source.url;
        // Keep summaries short and plain; the source remains the authority.
        events.push({ name: value.name.replace(/<[^>]*>/g, '').slice(0, 180), starts_at: new Date(start).toISOString(), source_url: source.url, event_url: eventUrl, publisher: source.publisher, region: source.region, venue: typeof value.location?.name === 'string' ? value.location.name.slice(0, 180) : null, requires_review: true });
      }
    }
    if (value['@graph']) visit(value['@graph']);
    if (value.itemListElement) visit(value.itemListElement);
    if (value.item) visit(value.item);
    if (value.subEvent) visit(value.subEvent);
  }
  for (const match of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch { /* Invalid structured blocks are skipped, never guessed. */ }
  }
  return Array.from(new Map(events.map(event => [`${event.name}|${event.starts_at}`, event])).values());
}
async function review(source) {
  const checkedAt = new Date().toISOString();
  try {
    const origin = new URL(source.url).origin;
    const robotResponse = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'MICSourceReview/0.1' } });
    if (robotResponse.status !== 404 && !robotResponse.ok) throw new Error(`robots.txt unavailable (${robotResponse.status}); skipped`);
    if (robotResponse.ok) {
      const robots = await readLimited(robotResponse);
      let applicable = false; const path = new URL(source.url).pathname;
      for (const line of robots.split(/\r?\n/)) {
        const match = line.replace(/#.*/, '').trim().match(/^(user-agent|disallow)\s*:\s*(.*)$/i); if (!match) continue;
        if (match[1].toLowerCase() === 'user-agent') applicable = ['*', 'micsourcereview', 'micsourcereview/0.1'].includes(match[2].toLowerCase());
        else if (applicable && match[2]) {
          const rule = match[2].replace(/\$$/, '').split('*')[0];
          if (rule && path.startsWith(rule)) throw new Error('Collection disallowed by robots.txt');
        }
      }
    }
    const response = await fetch(source.url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'MICSourceReview/0.1', Accept: 'text/html' } });
    const html = await readLimited(response);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim().slice(0, 250) || null;
    const candidates = eventsFromJsonLd(html, source);
    return { id: source.id, publisher: source.publisher, url: source.url, checked_at: checkedAt, status: 'fetched', title, content_hash: createHash('sha256').update(html).digest('hex'), candidates };
  } catch (error) { return { id: source.id, publisher: source.publisher, url: source.url, checked_at: checkedAt, status: 'unavailable', error: error.message, candidates: [] }; }
}
const reviews = [];
// Small batches respect source sites and keep network use bounded.
for (let index = 0; index < resources.length; index += 3) {
  reviews.push(...await Promise.all(resources.slice(index, index + 3).map(review)));
}
let queued = 0;
if (queue) {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Queue mode requires server-side Supabase configuration.');
  const client = createClient(url, key, { auth: { persistSession: false } });
  for (const review of reviews) for (const event of review.candidates) {
    const importKey = createHash('sha256').update(`${event.source_url}|${event.name}|${event.starts_at}`).digest('hex');
    const existing = await client.from('submission').select('id').eq('payload->>import_key', importKey).limit(1);
    if (existing.error) throw new Error('Unable to check the moderation queue.');
    if (existing.data.length) continue;
    const result = await client.from('submission').insert({ submission_type: 'event', status: 'pending', payload: { ...event, import_key: importKey, channel: 'source-collector', collected_at: review.checked_at, source_content_hash: review.content_hash } });
    if (result.error) throw new Error('Unable to queue a source candidate.');
    queued++;
  }
}
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify({ generated_at: new Date().toISOString(), mode: queue ? 'moderation-queue' : 'review-only', queued, sources: reviews }, null, 2) + '\n');
console.log(JSON.stringify({ sources: reviews.length, fetched: reviews.filter(item => item.status === 'fetched').length, unavailable: reviews.filter(item => item.status !== 'fetched').length, upcomingEventCandidates: reviews.reduce((sum, item) => sum + item.candidates.length, 0), queued, output }));
