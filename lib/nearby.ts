export type Point = { latitude: number; longitude: number };
export type NearbyPlace = {
  id: string; name: string; type: 'mosque' | 'food'; city: string; region?: string; address: string;
  website?: string; href?: string; sourceUrl?: string; source: string; checkedAt?: string; halal?: string;
  latitude: number | null; longitude: number | null; geoAccuracy?: string;
  halalBasis?: string;
};
export function validPoint(point: Point): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}
export function distanceKm(a: Point, b: Point): number {
  const rad = Math.PI / 180;
  const lat = (b.latitude - a.latitude) * rad, lon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(lon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function rankNearby(places: NearbyPlace[], origin: Point, radius: number) {
  if (!validPoint(origin) || !Number.isFinite(radius) || radius <= 0) return [];
  return places.filter(place => place.latitude !== null && place.longitude !== null && validPoint({ latitude: place.latitude, longitude: place.longitude }))
    .map(place => ({ ...place, distance: distanceKm(origin, { latitude: place.latitude!, longitude: place.longitude! }) }))
    .filter(place => place.distance <= radius)
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));
}
export function decodePoint(value: unknown): Point | null {
  try {
    if (typeof value === 'object' && value && 'coordinates' in value) {
      const coordinates = (value as { coordinates: number[] }).coordinates;
      const point = { longitude: coordinates[0], latitude: coordinates[1] };
      return validPoint(point) ? point : null;
    }
    if (typeof value !== 'string' || !/^[0-9a-f]+$/i.test(value) || value.length < 42) return null;
    const bytes = Uint8Array.from(value.match(/../g)!, hex => parseInt(hex, 16));
    const view = new DataView(bytes.buffer), little = view.getUint8(0) === 1;
    const type = view.getUint32(1, little);
    if ((type & 0xffff) !== 1) return null;
    const offset = (type & 0x20000000) ? 9 : 5;
    const point = { longitude: view.getFloat64(offset, little), latitude: view.getFloat64(offset + 8, little) };
    return validPoint(point) ? point : null;
  } catch { return null; }
}
export const areaCentres = [
  { name: 'Toronto', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Mississauga', latitude: 43.589, longitude: -79.6441 },
  { name: 'Brampton', latitude: 43.7315, longitude: -79.7624 },
  { name: 'Scarborough', latitude: 43.7764, longitude: -79.2318 },
  { name: 'Markham', latitude: 43.8561, longitude: -79.337 },
  { name: 'Oakville', latitude: 43.4675, longitude: -79.6877 },
  { name: 'Ajax', latitude: 43.8509, longitude: -79.0204 },
  { name: 'Ottawa', latitude: 45.4215, longitude: -75.6972 },
  { name: 'Montreal', latitude: 45.5019, longitude: -73.5674 },
  { name: 'Calgary', latitude: 51.0447, longitude: -114.0719 },
  { name: 'Vancouver', latitude: 49.2827, longitude: -123.1207 },
];
