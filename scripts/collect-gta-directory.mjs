import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

// One-off local open-data extract. Does not publish or write to Supabase.
// OSM relation IDs checked against administrative boundary results on 2026-10-18.
const regions = [
  { name: 'Toronto', relation: 324211 },
  { name: 'Peel', relation: 4198907 },
  { name: 'York', relation: 324214 },
  { name: 'Halton', relation: 7034889 },
  { name: 'Durham', relation: 2408843 },
];
const output = 'data/gta-directory';
const endpoint = process.env.MIC_OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
const now = new Date().toISOString();
const all = new Map();
const failures = [];
await mkdir(output, { recursive: true });

const normal = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const safeUrl = value => {
  if (!value) return '';
  try { const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
};

for (const region of regions) {
  const query = `[out:json][timeout:40];rel(${region.relation});map_to_area->.region;(
    nwr["amenity"="place_of_worship"]["religion"="muslim"](area.region);
    nwr["building"="mosque"](area.region);
    nwr["amenity"="place_of_worship"]["name"~"mosque|masjid|islamic",i](area.region);
    nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["diet:halal"~"^(yes|only|limited)$"](area.region);
    nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["halal"~"^(yes|only|limited)$"](area.region);
    nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["name"~"halal",i](area.region);
  );out center body;`;
  const cachePath = `${output}/${region.name.toLowerCase()}-osm.json`;
  try {
    let data;
    if (process.argv.includes('--from-cache')) data = JSON.parse(await readFile(cachePath, 'utf8'));
    else {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'MICDirectoryResearch/0.1 (one-off GTA dataset; local review only)' }, body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(50000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      if (data.remark || !Array.isArray(data.elements)) throw new Error(data.remark || 'Invalid response');
      await writeFile(cachePath, JSON.stringify(data, null, 2));
    }
    for (const element of data.elements) {
      const id = `osm:${element.type}:${element.id}`;
      if (all.has(id)) continue;
      const tags = element.tags ?? {};
      const isFood = /^(restaurant|fast_food|cafe|food_court)$/.test(tags.amenity ?? '');
      const latitude = element.lat ?? element.center?.lat, longitude = element.lon ?? element.center?.lon;
      const halal = tags['diet:halal'] || tags.halal || '';
      const flags = ['not_independently_verified'];
      if (!tags.name && !tags['name:en']) flags.push('missing_name');
      if (!tags['addr:street'] || !tags['addr:housenumber']) flags.push('incomplete_address');
      if (latitude == null || longitude == null) flags.push('missing_coordinates');
      if (isFood && !halal) flags.push('halal_in_name_only');
      if (isFood && /^(no|unknown)$/.test(halal)) flags.push('conflicting_or_unknown_halal_status');
      if (isFood && halal === 'limited') flags.push('partial_halal_options');
      if (!isFood && tags.amenity !== 'place_of_worship') flags.push('building_tag_only_confirm_active_use');
      if (Object.keys(tags).some(key => /^(disused|abandoned|demolished|was):/.test(key)) || tags.disused === 'yes') flags.push('possible_inactive_location');
      all.set(id, {
        id, category: isFood ? 'halal_food_candidate' : 'mosque_candidate', name: tags.name || tags['name:en'] || '',
        region: region.name, municipality: tags['addr:city'] || (region.name === 'Toronto' ? 'Toronto' : ''), province: 'Ontario', country: 'Canada',
        street_address: [tags['addr:unit'] ? `Unit ${tags['addr:unit']}` : '', [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')].filter(Boolean).join(', '), postal_code: tags['addr:postcode'] || '',
        latitude: latitude ?? null, longitude: longitude ?? null, phone: tags['contact:phone'] || tags.phone || '',
        website: safeUrl(tags['contact:website'] || tags.website), cuisine: tags.cuisine || '', opening_hours: tags.opening_hours || '',
        osm_amenity: tags.amenity || '', religion: tags.religion || '', denomination: tags.denomination || '',
        halal_evidence: isFood ? (halal ? `OSM ${tags['diet:halal'] ? 'diet:halal' : 'halal'}=${halal}` : 'Name contains halal; no halal tag') : '',
        halal_scope: isFood ? halal === 'only' ? 'OSM says exclusively halal' : halal === 'limited' ? 'OSM says limited halal options' : halal === 'yes' ? 'OSM says halal available; scope unconfirmed' : 'Unconfirmed' : '',
        halal_certifier: '', certification_status: isFood ? 'Not checked against a current certificate' : '',
        source_url: `https://www.openstreetmap.org/${element.type}/${element.id}`, source: 'OpenStreetMap contributors', licence: 'ODbL-1.0',
        osm_snapshot_at: data.osm3s?.timestamp_osm_base || '', collected_at: now, verification_status: 'pending_review', review_flags: flags,
        possible_duplicate_ids: [], existing_mic_matches: [],
      });
    }
    console.log(`${region.name}: ${data.elements.length} source objects`);
  } catch (error) { failures.push({ region: region.name, error: error.message }); console.log(`${region.name}: unavailable (${error.message})`); }
}

const records = [...all.values()];
// Flag likely overlaps rather than silently deleting separately mapped entrances/buildings.
function distance(a, b) {
  if (a.latitude == null || b.latitude == null || a.longitude == null || b.longitude == null) return Infinity;
  return Math.hypot((a.latitude - b.latitude) * 111320, (a.longitude - b.longitude) * 111320 * Math.cos(a.latitude * Math.PI / 180));
}
for (let i = 0; i < records.length; i++) for (let j = i + 1; j < records.length; j++) {
  const a = records[i], b = records[j];
  if (a.category === b.category && normal(a.name) && normal(a.name) === normal(b.name) && distance(a, b) < 100) {
    a.possible_duplicate_ids.push(b.id); b.possible_duplicate_ids.push(a.id);
  }
}

let existingAudit = { checked: false, mosques: 0, businesses: 0, matched_candidates: 0 };
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const results = await Promise.all(['mosque', 'business'].map(table => client.from(table).select('id,name,address,website').in('verification_status', ['published', 'validating']).limit(1000)));
  if (results.every(result => !result.error)) {
    existingAudit = { checked: true, mosques: results[0].data.length, businesses: results[1].data.length, matched_candidates: 0 };
    for (const record of records) {
      const existing = results[record.category === 'mosque_candidate' ? 0 : 1].data;
      record.existing_mic_matches = existing.filter(row => {
        const sameName = normal(row.name) && normal(row.name) === normal(record.name);
        const sameAddress = normal(row.address) && normal(record.street_address) && normal(row.address).startsWith(normal(record.street_address));
        return sameName || sameAddress;
      }).map(row => ({ id: row.id, name: row.name, reason: normal(row.name) === normal(record.name) ? 'same_normalized_name_review_branch' : 'same_street_address_review_shared_building' }));
    }
    existingAudit.matched_candidates = records.filter(row => row.existing_mic_matches.length).length;
  }
}

const summary = {
  collected_at: now, coverage: 'Toronto + Peel + York + Halton + Durham administrative areas; not all of Canada', complete: failures.length === 0, failures,
  total_candidates: records.length, mosques: records.filter(row => row.category === 'mosque_candidate').length,
  halal_food: records.filter(row => row.category === 'halal_food_candidate').length,
  named_candidates: records.filter(row => row.name).length,
  food_by_amenity: Object.fromEntries(['restaurant', 'fast_food', 'cafe', 'food_court'].map(type => [type, records.filter(row => row.category === 'halal_food_candidate' && row.osm_amenity === type).length])),
  regions: regions.map(region => ({ region: region.name, mosques: records.filter(row => row.region === region.name && row.category === 'mosque_candidate').length, halal_food: records.filter(row => row.region === region.name && row.category === 'halal_food_candidate').length })),
  possible_duplicate_records: records.filter(row => row.possible_duplicate_ids.length).length,
  incomplete_addresses: records.filter(row => row.review_flags.includes('incomplete_address')).length,
  existing_mic: existingAudit,
  attribution: '© OpenStreetMap contributors', licence: 'ODbL-1.0', licence_url: 'https://www.openstreetmap.org/copyright',
  limitations: ['Community mapping is incomplete; these are candidates, not a census.', 'Halal map tags and names do not prove current certification.', 'Coordinates for ways/relations are geometry centres.', 'No entries published; no database changes made.'],
};
const columns = Object.keys(records[0] ?? { id: '' });
const csv = value => { let s = typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"', '""')}"`; };
await writeFile(`${output}/candidates.json`, JSON.stringify({ attribution: summary.attribution, licence: summary.licence, records }, null, 2));
await writeFile(`${output}/candidates.csv`, '\ufeff' + [columns.map(csv).join(','), ...records.map(row => columns.map(key => csv(row[key])).join(','))].join('\r\n'));
await writeFile(`${output}/summary.json`, JSON.stringify(summary, null, 2));
await writeFile(`${output}/candidates.geojson`, JSON.stringify({ type: 'FeatureCollection', attribution: summary.attribution, licence: summary.licence, features: records.filter(row => row.latitude != null && row.longitude != null).map(row => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [row.longitude, row.latitude] }, properties: row })) }, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
