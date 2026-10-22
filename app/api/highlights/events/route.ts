import { getDirectory } from '@/lib/directory';
export const dynamic = 'force-dynamic';
export async function GET() {
  const data = await getDirectory();
  const events = data.listings.filter(i => i.type === 'events' && i.status === 'published' && i.startsAt && i.website).slice(0,30).map(i => ({ title:i.name, url:`/${i.citySlug}/events/${i.slug}`, city:i.city, startsAt:i.startsAt }));
  return Response.json({events, unavailable:data.unavailable}, {headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}});
}
