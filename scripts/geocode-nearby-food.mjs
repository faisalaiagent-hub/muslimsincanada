import { readFile, writeFile, mkdir } from 'node:fs/promises';
const rows = JSON.parse(await readFile('data/nearby/food-source-review.json', 'utf8')).filter(row => !row.error);
let cache = {};
try { cache = JSON.parse(await readFile('data/nearby/geocoding-cache.json', 'utf8')); } catch {}
const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
for (const row of rows) {
  if (!row.address) continue;
  if (!cache[row.address]) {
    const query = row.address.replace(/\b(?:Unit[l]?|Suite|Ste)\s*#?\s*[\w-]+/gi, '').replace(/#\s*[\w-]+/g, '');
    const url = new URL('https://photon.komoot.io/api/');
    url.search = new URLSearchParams({ q: query, limit: '5', lang: 'en' });
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'MICCommunityPortal/0.1 (one-off 44 branch location checks)' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const house = row.address.match(/^\s*(\d+[a-z]?)/i)?.[1];
      const postal = row.address.match(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i)?.[0];
      const match = data.features?.find(feature => feature.properties?.countrycode === 'CA' && feature.geometry?.type === 'Point' &&
        ((house && norm(feature.properties.housenumber) === norm(house) && (!postal || !feature.properties.postcode || norm(feature.properties.postcode).slice(0, 3) === norm(postal).slice(0, 3))) ||
        (postal && norm(feature.properties.postcode) === norm(postal) && feature.properties.type === 'postcode')));
      cache[row.address] = match ? { latitude: match.geometry.coordinates[1], longitude: match.geometry.coordinates[0],
        geoAccuracy: match.properties.housenumber ? 'Approximate address location' : 'Approximate postal-code location',
        coordinateSource: `https://www.openstreetmap.org/${({ N: 'node', W: 'way', R: 'relation' })[match.properties.osm_type]}/${match.properties.osm_id}`,
        coordinateLicence: 'ODbL-1.0' } : { latitude: null, longitude: null, geoAccuracy: 'Address location not resolved' };
    } catch { cache[row.address] = { latitude: null, longitude: null, geoAccuracy: 'Address location unavailable' }; }
    await writeFile('data/nearby/geocoding-cache.json', JSON.stringify(cache, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  Object.assign(row, cache[row.address]);
}
await mkdir('public/data', { recursive: true });
await writeFile('data/nearby/food-places.json', JSON.stringify(rows, null, 2));
await writeFile('public/data/nearby-food.json', JSON.stringify({ attribution: 'Coordinates © OpenStreetMap contributors, via Photon', licence: 'ODbL-1.0', licenceUrl: 'https://www.openstreetmap.org/copyright', source: 'Basic branch facts from HMA branch pages; no publisher descriptions, reviews or imagery reproduced', records: rows }, null, 2));
console.log(JSON.stringify({ total: rows.length, located: rows.filter(row => row.latitude != null).length, unresolved: rows.filter(row => row.latitude == null).map(row => row.name) }, null, 2));
