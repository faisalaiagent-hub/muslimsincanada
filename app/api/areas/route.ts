import { areaCentres, validPoint } from '@/lib/nearby';
import { createHash } from 'node:crypto';
export const dynamic = 'force-dynamic';
const cooldowns = new Map<string, number>();
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Use the search on MIC.' }, { status: 403 });
  let query: string;
  try { const raw = await request.text(); if (raw.length > 2048) return Response.json({ error: 'Search is too long.' }, { status: 413 }); const body = JSON.parse(raw); query = typeof body.query === 'string' ? body.query.trim() : ''; } catch { return Response.json({ error: 'Enter an area.' }, { status: 400 }); }
  if (query.length < 2 || query.length > 160) return Response.json({ error: 'Enter a city, neighbourhood, address or postal code (2–160 characters).' }, { status: 400 });
  const now = Date.now();
  const network = createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0] || 'local').digest('hex');
  if (now - (cooldowns.get(network) || 0) < 2000) return Response.json({ error: 'Please wait a moment before searching again.' }, { status: 429, headers: { 'Retry-After': '2' } });
  for (const [key, time] of cooldowns) if (now - time > 60000) cooldowns.delete(key);
  if (cooldowns.size > 1000) cooldowns.clear();
  cooldowns.set(network, now);
  try {
    const endpoint = new URL('/api/', process.env.MIC_PHOTON_URL || 'https://photon.komoot.io');
    endpoint.search = new URLSearchParams({ q: `${query} Canada`, limit: '8', lang: 'en' }).toString();
    const lookup = async () => {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'MICCommunityPortal/0.1 (manual Canadian area search)' } });
      if (!response.ok) throw new Error('Geocoder unavailable');
      const data = await response.json();
      return (data.features ?? []).filter((row: any) => row.properties?.countrycode === 'CA' && row.geometry?.type === 'Point' && validPoint({ latitude: row.geometry.coordinates[1], longitude: row.geometry.coordinates[0] }));
    };
    let matches = await lookup();
    const postal = query.toUpperCase().replace(/\s/g, '');
    let broaderPostal = false;
    const postcodeOf = (row: any) => String(row.properties.postcode || row.properties.name || '').toUpperCase().replace(/\s/g, '');
    if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postal)) {
      matches = matches.filter((row: any) => postcodeOf(row) === postal);
      if (!matches.length) {
        endpoint.searchParams.set('q', `${postal.slice(0, 3)} Canada`);
        matches = (await lookup()).filter((row: any) => postcodeOf(row).startsWith(postal.slice(0, 3))).slice(0, 1);
        broaderPostal = true;
      }
    }
    const areas = matches.slice(0, 5).map((row: any) => ({
      name: broaderPostal ? `${postal.slice(0, 3)} broader postal area, ${row.properties.city || row.properties.state} (approximate; exact code unavailable)` : [...new Set([row.properties.name, row.properties.street, row.properties.city, row.properties.state].filter(Boolean))].join(', '),
      latitude: row.geometry.coordinates[1], longitude: row.geometry.coordinates[0], approximate: true,
    }));
    return Response.json({ areas, provider: 'Photon / OpenStreetMap' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    const city = areaCentres.find(area => area.name.toLowerCase() === query.toLowerCase());
    return city ? Response.json({ areas: [{ ...city, name: `${city.name} city centre`, approximate: true }], provider: 'MIC city-centre fallback' }) : Response.json({ error: 'Area lookup is temporarily unavailable. Try a popular city below, or use your location.' }, { status: 503 });
  }
}
