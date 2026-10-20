import type { MetadataRoute } from 'next';
import { getDirectory } from '@/lib/directory';
import { SITE } from '@/lib/seo';
import { guides } from '@/lib/guides';
import { publicMarket } from '@/lib/marketplace-server';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [data, market] = await Promise.all([getDirectory(), publicMarket()]);
  const paths = ['/', '/nearby', '/marketplace', '/news', '/voices', '/resources', '/community', '/sources', '/guides', ...guides.map(g => `/guides/${g.slug}`)];
  for (const city of data.cities.filter(c => c.is_launched)) {
    paths.push(`/${city.slug}`);
    for (const type of ['mosques', 'businesses', 'events']) if (data.listings.some(l => l.citySlug === city.slug && l.type === type)) paths.push(`/${city.slug}/${type}`);
  }
  for (const listing of data.listings) paths.push(`/${listing.citySlug}/${listing.type}/${listing.slug}`);
  for (const ad of market.ads) paths.push(`/marketplace/${ad.id}`);
  return [...new Set(paths)].map(path => ({ url: SITE + path }));
}
