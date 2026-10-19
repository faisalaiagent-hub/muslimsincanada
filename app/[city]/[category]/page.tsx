import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDirectory } from '@/lib/directory';
import { Discovery } from '@/components/discovery';
import { ResourceExplorer } from '@/components/resource-explorer';
import { PageIntro } from '@/components/portal-shell';
export const dynamic = 'force-dynamic';
export default async function CategoryPage({ params }: { params: Promise<{ city: string; category: string }> }) {
  const [{ city: slug, category }, data] = await Promise.all([params, getDirectory()]);
  if (!['mosques', 'businesses', 'events', 'resources', 'organizations'].includes(category)) notFound();
  if (data.unavailable && !data.cities.length) return <main className="portal-container page-main"><PageIntro eyebrow="DIRECTORY" title="Temporarily unavailable" description="We couldn’t load the city directory. Please try again shortly." /><Link href="/resources" className="portal-button">Browse resources</Link></main>;
  const city = data.cities.find(item => item.slug === slug); if (!city) notFound();
  const resourceView = category === 'resources' || category === 'organizations';
  return <main className="portal-container page-main"><PageIntro eyebrow={city.name.toUpperCase()} title={`${category.charAt(0).toUpperCase() + category.slice(1)} & connections`} description={resourceView ? 'A regional and international resource collection. Service coverage varies; confirm details directly with the provider.' : `Explore ${category} in ${city.name}. Save a connection or help us add one.`} />{resourceView ? <ResourceExplorer initialCategory={category === 'organizations' ? 'Community organizations' : 'all'} /> : <Discovery {...data} initialCity={city.slug} initialType={category} />}</main>;
}
