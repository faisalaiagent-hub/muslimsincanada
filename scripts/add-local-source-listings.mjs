import fs from 'node:fs/promises';
// Basic location facts checked on official websites; no copied reviews/photos/descriptions.
const sources = [
  { id: 'official:darul-khair-stouffville', name: 'Darul Khair Center (Dar-ul-Khair)', type: 'mosque', city: 'Stouffville', address: '86 Ringwood Drive, Unit 36, Stouffville, ON L4A 1C3', website: 'https://darulkhair.ca/', sourceUrl: 'https://darulkhair.ca/contact/' },
  { id: 'owner:biggys-stouffville', name: "Biggy’s Grill", city: 'Stouffville', address: '18 Ringwood Drive, Unit 7, Stouffville, ON', website: 'https://biggysgrill.com/' },
  { id: 'owner:thezen-stouffville', name: 'The Zen — Stouffville', city: 'Stouffville', address: '5779 Main Street, Suite 108, Whitchurch-Stouffville, ON L4A 2T1', website: 'https://thezen.ca/' },
  { id: 'owner:queenz-stouffville', name: 'Shawarma Queenz — Stouffville', city: 'Stouffville', address: '6316 Main Street, Stouffville, ON', website: 'https://queenz.ca/' },
  { id: 'owner:queenz-scarborough', name: 'Shawarma Queenz — Scarborough', city: 'Toronto', address: '305 Port Union Road, Scarborough, ON', website: 'https://queenz.ca/' },
  { id: 'owner:tahinis-markham', name: 'Tahini’s — Markham Hwy 7', city: 'Markham', address: '3150 Highway 7, Markham, ON L3R 5A1', website: 'https://tahinis.com/locations/on/markham-hwy-7/', halalSourceUrl: 'https://tahinis.com/about-us/' },
  { id: 'owner:karahiboys-vaughan', name: 'Karahi Boys — Vaughan', city: 'Vaughan', address: '9781 Jane Street, Unit 4, Maple, ON L6A 3N9', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-scarborough', name: 'Karahi Boys — Scarborough', city: 'Toronto', address: '1921 Lawrence Avenue East, Scarborough, ON M1R 3Y6', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-brampton', name: 'Karahi Boys — Brampton', city: 'Brampton', address: '48 Peel Centre Drive, Unit A, Brampton, ON L6T 5M2', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-ajax', name: 'Karahi Boys — Ajax', city: 'Ajax', address: '259 Kingston Road East, Ajax, ON L1Z 0K5', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-burlington', name: 'Karahi Boys — Burlington', city: 'Burlington', address: '2180 Itabashi Way, Unit D4, Burlington, ON L7M 5A5', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-mississauga', name: 'Karahi Boys — Mississauga Latimer Drive', city: 'Mississauga', address: '5955 Latimer Drive, Unit 5, Mississauga, ON L5V 0B7', website: 'https://www.karahiboys.com/locations' },
  { id: 'owner:karahiboys-toronto', name: 'Karahi Boys — Toronto Queen Street', city: 'Toronto', address: '741 Queen Street West, Toronto, ON M6J 1G1', website: 'https://www.karahiboys.com/locations' },
];
const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
let cache = {};
try { cache = JSON.parse(await fs.readFile('data/nearby/local-source-geocoding.json', 'utf8')); } catch {}
for (const row of sources) {
  row.type ||= 'food'; row.sourceUrl ||= row.website;
  row.source = row.type === 'mosque' ? 'Official mosque website' : 'Restaurant website · owner declaration';
  row.checkedAt = new Date().toISOString();
  if (row.type === 'food') { row.halal = 'Owner states halal; certifier and current menu scope not independently checked'; row.halalBasis = 'owner-declared'; }
  if (!cache[row.address]) {
    const clean = row.address.replace(/\b(?:Unit|Suite)\s*[\w-]+,?\s*/gi, '');
    const house = clean.match(/^(\d+[a-z]?)/i)?.[1];
    const url = new URL('https://photon.komoot.io/api/'); url.search = new URLSearchParams({ q: `${clean}, Canada`, limit: '5', lang: 'en' });
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);
    const data = await response.json();
    const match = data.features?.find(feature => feature.properties?.countrycode === 'CA' && norm(feature.properties.housenumber) === norm(house) && feature.geometry?.type === 'Point');
    cache[row.address] = match ? { latitude: match.geometry.coordinates[1], longitude: match.geometry.coordinates[0], geoAccuracy: 'Approximate address location', coordinateSource: `https://www.openstreetmap.org/${({ N: 'node', W: 'way', R: 'relation' })[match.properties.osm_type]}/${match.properties.osm_id}`, coordinateLicence: 'ODbL-1.0' } : { latitude: null, longitude: null, geoAccuracy: 'Address location not resolved' };
    await fs.writeFile('data/nearby/local-source-geocoding.json', JSON.stringify(cache, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  Object.assign(row, cache[row.address]);
}
const mosques = JSON.parse(await fs.readFile('data/nearby/mosque-locations.json', 'utf8'));
const foods = JSON.parse(await fs.readFile('data/nearby/food-places.json', 'utf8'));
for (const row of sources) {
  const target = row.type === 'mosque' ? mosques : foods;
  const index = target.findIndex(old => old.id === row.id);
  if (index >= 0) target[index] = row; else target.push(row);
}
const iman = mosques.find(row => row.id === 'iwr:islamic-centre-of-markham');
if (iman) { iman.source = 'Official mosque address · source-listed'; iman.sourceUrl = 'https://daruliman.org/contact/'; }
await fs.writeFile('data/nearby/mosque-locations.json', JSON.stringify(mosques, null, 2));
await fs.writeFile('data/nearby/food-places.json', JSON.stringify(foods, null, 2));
for (const [name, records] of [['mosques', mosques], ['food', foods]]) await fs.writeFile(`public/data/nearby-${name}.json`, JSON.stringify({ attribution: 'Coordinates © OpenStreetMap contributors, via Photon', licence: 'ODbL-1.0', licenceUrl: 'https://www.openstreetmap.org/copyright', note: 'Basic source-attributed location facts. Food declaration source is labelled; listing does not establish independent halal certification.', records }, null, 2));
console.log(JSON.stringify({ mosques: mosques.length, foods: foods.length, added: sources.map(row => ({ name: row.name, located: row.latitude !== null })) }, null, 2));
