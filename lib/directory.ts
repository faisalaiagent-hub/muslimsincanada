import 'server-only';
import { cache } from 'react';
import { getSupabase } from './supabase';
import { safeUrl } from './community';
import { decodePoint } from './nearby';

export type City = { id: string; name: string; slug: string; is_launched: boolean };
export type Listing = {
  id: string; name: string; slug: string; type: 'mosques' | 'businesses' | 'events';
  city: string; citySlug: string; address: string; status: string; website?: string;
  lastVerified?: string; affiliation?: string; startsAt?: string;
  latitude?: number; longitude?: number;
};
type RecordRow = Record<string, unknown>;
const str = (value: unknown) => typeof value === 'string' ? value : '';

export const getDirectory = cache(async () => {
  try {
    const client = getSupabase();
    const tables = ['mosque', 'business', 'event'] as const;
    const [cityResult, ...results] = await Promise.all([
      client.from('city').select('id,name,slug,is_launched').order('name').abortSignal(AbortSignal.timeout(10000)),
      ...tables.map(table => client.from(table).select('*').in('verification_status', ['published', 'validating']).order(table === 'event' ? 'title' : 'name').limit(1000).abortSignal(AbortSignal.timeout(10000))),
    ]);
    const cities = (cityResult.data ?? []) as City[];
    const listings: Listing[] = results.flatMap((result, index) => (result.data ?? []).flatMap((raw: RecordRow) => {
      const city = cities.find(item => item.id === raw.city_id);
      if (!city || !city.is_launched) return [];
      const facilities = raw.facilities && typeof raw.facilities === 'object' ? raw.facilities as RecordRow : {};
      const startsAt = str(raw.starts_at) || str(raw.start_at) || str(raw.event_date);
      if (index === 2 && (!startsAt || !Number.isFinite(Date.parse(startsAt)) || Date.parse(startsAt) < Date.now())) return [];
      return [{ id: str(raw.id), name: str(raw.name) || str(raw.title), slug: str(raw.slug), type: (['mosques', 'businesses', 'events'] as const)[index],
        city: city.name, citySlug: city.slug, address: str(raw.address) || str(raw.location_address),
        status: str(raw.verification_status), website: safeUrl(raw.website),
        lastVerified: str(raw.last_verified_at) || undefined,
        affiliation: str(facilities.affiliation) || str(facilities.tradition) || undefined,
        startsAt: startsAt || undefined, ...(decodePoint(raw.location) ?? {}) }];
    }));
    return { cities, listings, unavailable: Boolean(cityResult.error || results.some(result => result.error)) };
  } catch {
    return { cities: [] as City[], listings: [] as Listing[], unavailable: true };
  }
});
