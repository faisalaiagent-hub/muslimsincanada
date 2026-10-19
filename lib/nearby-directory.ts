import 'server-only';
import { getDirectory } from './directory';
import type { NearbyPlace } from './nearby';
import { safeUrl } from './community';
import foods from '@/data/nearby/food-places.json';
import mosqueLocations from '@/data/nearby/mosque-locations.json';

export async function getNearbyDirectory() {
  const directory = await getDirectory();
  const reviewed = mosqueLocations as NearbyPlace[];
  const coordinates = new Map(reviewed.map(row => [row.id, row]));
  const mosques: NearbyPlace[] = directory.listings.filter(row => row.type === 'mosques').map(row => {
    const location = coordinates.get(row.id);
    return {
    id: row.id, name: row.name, type: 'mosque', city: row.city, address: row.address,
    website: row.website, href: `/${row.citySlug}/mosques/${row.slug}`, source: 'MIC mosque directory', checkedAt: row.lastVerified,
    latitude: location?.latitude ?? null, longitude: location?.longitude ?? null, geoAccuracy: location?.geoAccuracy || 'Address location not resolved',
  }; });
  const additional = reviewed.filter(row => row.id.startsWith('iwr:') || row.id.startsWith('official:')).map(row => ({ ...row, type: 'mosque' as const, website: safeUrl(row.website), sourceUrl: safeUrl(row.sourceUrl) }));
  const food: NearbyPlace[] = foods.map(row => ({ ...row, type: 'food', website: safeUrl(row.website), sourceUrl: safeUrl(row.sourceUrl) }));
  return { places: [...mosques, ...additional, ...food], unavailable: directory.unavailable };
}
