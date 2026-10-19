import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

// Local factual research inventory only; no automatic publication or database writes.
const out = 'data/gta-directory';
await mkdir(out, { recursive: true });
const collectedAt = new Date().toISOString();
const regions = {
  Toronto: ['Toronto', 'Scarborough', 'North York', 'Etobicoke', 'East York', 'Thorncliffe'],
  Peel: ['Mississauga', 'Brampton', 'Caledon', 'Bolton'],
  York: ['Vaughan', 'Markham', 'Richmond Hill', 'Aurora', 'Newmarket', 'King', 'King City', 'East Gwillimbury', 'Whitchurch-Stouffville', 'Stouffville', 'Georgina', 'Keswick', 'Thornhill', 'Maple', 'Woodbridge'],
  Halton: ['Oakville', 'Burlington', 'Milton', 'Halton Hills', 'Georgetown', 'Acton'],
  Durham: ['Ajax', 'Pickering', 'Whitby', 'Oshawa', 'Clarington', 'Bowmanville', 'Courtice', 'Brock', 'Scugog', 'Uxbridge', 'Port Perry'],
};
const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const regionFor = city => Object.entries(regions).find(([, cities]) => cities.some(name => normalize(name) === normalize(city)))?.[0] || '';
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').replace(/\s*[→↗]\s*$/, '').trim();
async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'MICDirectoryResearch/0.1 (local source assessment)' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

const mosqueUrl = 'https://islamicwillregistry.com/ilm-hub/directory/directory.json';
const mosqueData = await (await get(mosqueUrl)).json();
const canadianMosques = mosqueData.entities.filter(row => row.type === 'mosque' && !row.status).map(row => ({
  id: `iwr:${row.slug}`, name: row.name, city: row.city, province: row.province, country: 'Canada',
  address: row.address || '', phone: row.phone || '', website: row.website || '', latitude: row.latitude ?? null, longitude: row.longitude ?? null,
  region: row.province === 'ON' ? regionFor(row.city) : '', category: 'mosque',
  source_url: row.url, dataset_url: mosqueUrl, publisher: 'Islamic Will Registry', source_reported_verification: row.verified || '',
  source_reported_confidence: row.confidence || '', primary_source_urls: (row.sources || []).map(source => source.url),
  collected_at: collectedAt, mic_verification_status: 'pending_review', reuse_status: 'No explicit bulk republication licence established; local research only',
}));
const gtaMosques = canadianMosques.filter(row => row.region);

const hmaUrl = 'https://hmacanada.org/hma-certified-restaurants/';
const hmaHtml = await (await get(hmaUrl)).text();
let city = '';
const hmaRows = [];
for (const match of hmaHtml.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>|<li\b[^>]*class="[^"]*elementor-icon-list-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)) {
  if (match[1]) { city = text(match[1]); continue; }
  const region = regionFor(city);
  if (!region) continue;
  const li = match[2];
  const label = li.match(/<span\b[^>]*class="elementor-icon-list-text"[^>]*>([\s\S]*?)<\/span>/i)?.[1];
  const name = text(label || '');
  if (!name) continue;
  const href = li.match(/<a\b[^>]*href="([^"]+)"/i)?.[1];
  const retail = /fortinos|loblaws|sobey|supermarket|meat shoppe/i.test(name);
  hmaRows.push({ id: `hma:${normalize(city)}:${normalize(name)}`, name, city, region, province: 'Ontario', country: 'Canada',
    category: retail ? 'retail_food_outlet' : 'restaurant_or_dessert_outlet', address: '', website: '',
    source_url: href && href.startsWith('https://hmacanada.org/') ? href : `${hmaUrl}#${city.toLowerCase().replaceAll(' ', '-')}`,
    publisher: 'Halal Monitoring Authority', source_index_url: hmaUrl,
    halal_evidence: 'Appears in the HMA certified-restaurants index at collection time',
    certification_status: 'Source-listed; branch certificate scope and expiry not checked by MIC',
    collected_at: collectedAt, mic_verification_status: 'pending_review', reuse_status: 'No explicit bulk republication licence established; local research only',
  });
}
const uniqueHma = [...new Map(hmaRows.map(row => [row.id, row])).values()];
if (!gtaMosques.length || !uniqueHma.length) throw new Error('Source extraction returned no records; inspect source structure.');

let existing = { checked: false };
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const [mosques, businesses] = await Promise.all(['mosque', 'business'].map(table => client.from(table).select('id,name,address').in('verification_status', ['published', 'validating']).limit(1000)));
  if (mosques.error || businesses.error) throw new Error('Read-only MIC comparison failed');
  for (const record of gtaMosques) record.existing_mic_name_matches = mosques.data.filter(row => normalize(row.name) === normalize(record.name)).map(row => row.id);
  existing = { checked: true, public_mosques: mosques.data.length, public_businesses: businesses.data.length, gta_source_exact_name_matches: gtaMosques.filter(row => row.existing_mic_name_matches.length).length, note: 'Exact-name matches only; absence of a match does not establish a new listing.' };
}

function csv(rows) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const cell = value => { let s = typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"', '""')}"`; };
  return '\ufeff' + [columns.map(cell).join(','), ...rows.map(row => columns.map(key => cell(row[key])).join(','))].join('\r\n');
}
await writeFile(`${out}/canada-mosques-research.json`, JSON.stringify({ source: mosqueUrl, reuse_status: 'Research only; bulk republication licence not established', records: canadianMosques }, null, 2));
await writeFile(`${out}/gta-mosques-research.csv`, csv(gtaMosques));
await writeFile(`${out}/gta-hma-food-research.csv`, csv(uniqueHma));
await writeFile(`${out}/gta-hma-restaurants-research.csv`, csv(uniqueHma.filter(row => row.category === 'restaurant_or_dessert_outlet')));
await writeFile(`${out}/gta-source-records.json`, JSON.stringify({ collected_at: collectedAt, reuse_status: 'Local research only; not a public MIC listing database', mosques: gtaMosques, hma_food_outlets: uniqueHma }, null, 2));
const summary = {
  collected_at: collectedAt, canada_mosques_in_source: canadianMosques.length, gta_mosques_in_source: gtaMosques.length,
  gta_hma_food_outlets: uniqueHma.length, gta_hma_restaurant_or_dessert_outlets: uniqueHma.filter(row => row.category === 'restaurant_or_dessert_outlet').length,
  gta_hma_retail_outlets: uniqueHma.filter(row => row.category === 'retail_food_outlet').length,
  regions: Object.keys(regions).map(region => ({ region, mosques: gtaMosques.filter(row => row.region === region).length, hma_food_outlets: uniqueHma.filter(row => row.region === region).length })),
  existing_mic: existing,
  limitations: ['Neither source is a complete inventory.', 'Publisher-reported facts are not independently verified by MIC.', 'HMA record addresses need detail-page checks; chain names do not certify all branches.', 'No explicit bulk republication licence found for these two sources; research files are not approved for public import.', 'OpenStreetMap regional collection failed with timeout/HTTP 500; see summary.json.'],
};
await writeFile(`${out}/research-summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
