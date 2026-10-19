import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const [{ data: mosques, error }, { data: cities }] = await Promise.all([
  client.from('mosque').select('id,name,address,website,city_id').in('verification_status', ['published', 'validating']),
  client.from('city').select('id,name,slug'),
]);
if (error) throw error;
const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const refs = JSON.parse(await fs.readFile('data/gta-directory/gta-source-records.json', 'utf8')).mosques;
const extra = refs.filter(row => ['York', 'Halton', 'Durham'].includes(row.region) && !mosques.some(existing => norm(existing.name) === norm(row.name)));
const rows = [...mosques.map(row => ({ id: row.id, name: row.name, address: row.address, city: cities.find(city => city.id === row.city_id)?.name || '', website: row.website || '', type: 'mosque', source: 'MIC mosque directory' })),
  ...extra.map(row => ({ id: row.id, name: row.name, address: row.address, city: row.city, region: row.region, website: row.website, type: 'mosque', source: 'Canadian Muslim Directory · source-listed', sourceUrl: row.source_url, checkedAt: row.source_reported_verification?.replace('web-', '') }))];
let cache = {};
try { cache = JSON.parse(await fs.readFile('data/nearby/mosque-geocoding-cache.json', 'utf8')); } catch {}
for (let index = 0; index < rows.length; index++) {
  const row = rows[index];
  if (!cache[row.address]) {
    const clean = row.address.replace(/\([^)]*\)/g, '').replace(/\b(?:Unit[s]?|Suite|Ste)\s*#?\s*[\w/-]+[, ]*/gi, '').replace(/#\s*[\w-]+/g, '').trim();
    const house = clean.match(/^(\d+[a-z]?)/i)?.[1];
    const postal = clean.match(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i)?.[0];
    let location = { latitude: null, longitude: null, geoAccuracy: 'Address location not resolved' };
    if (house && !/unconfirmed|exact address|conflict|near |formerly/i.test(row.address)) {
      const url = new URL('https://photon.komoot.io/api/'); url.search = new URLSearchParams({ q: `${clean}, ${row.city}, Canada`, limit: '5', lang: 'en' });
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(6500), headers: { 'User-Agent': 'MICDirectoryAddressReview/0.1 (one-off GTA coordinate review)' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const match = data.features?.find(feature => feature.properties?.countrycode === 'CA' && norm(feature.properties.housenumber) === norm(house) && (!postal || !feature.properties.postcode || norm(feature.properties.postcode).slice(0, 3) === norm(postal).slice(0, 3)) && feature.geometry?.type === 'Point');
        if (match) location = { latitude: match.geometry.coordinates[1], longitude: match.geometry.coordinates[0], geoAccuracy: 'Approximate address location', coordinateSource: `https://www.openstreetmap.org/${({ N: 'node', W: 'way', R: 'relation' })[match.properties.osm_type]}/${match.properties.osm_id}`, coordinateLicence: 'ODbL-1.0' };
      } catch { location.geoAccuracy = 'Address lookup unavailable'; }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    cache[row.address] = location;
    await fs.writeFile('data/nearby/mosque-geocoding-cache.json', JSON.stringify(cache, null, 2));
  }
  Object.assign(row, cache[row.address]);
  if ((index + 1) % 10 === 0) console.log(`Reviewed ${index + 1}/${rows.length} addresses`);
}
await fs.writeFile('data/nearby/mosque-locations.json', JSON.stringify(rows, null, 2));
await fs.writeFile('public/data/nearby-mosques.json', JSON.stringify({ attribution: 'Coordinates © OpenStreetMap contributors, via Photon', licence: 'ODbL-1.0', licenceUrl: 'https://www.openstreetmap.org/copyright', note: 'Basic source-listed location facts; no publisher descriptions, reviews or photographs reproduced. Unresolved addresses excluded from distance ranking.', records: rows }, null, 2));
console.log(JSON.stringify({ total: rows.length, added: extra.length, located: rows.filter(row => row.latitude !== null).length, newCommunities: [...new Set(extra.map(row => row.city))] }, null, 2));
