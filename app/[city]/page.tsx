import { directoryMetadata } from '@/lib/directory-seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDirectory } from '@/lib/directory';
import { PageIntro } from '@/components/portal-shell';
import { Discovery } from '@/components/discovery';
export const dynamic = 'force-dynamic';
export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const [{ city: slug }, data] = await Promise.all([params, getDirectory()]);
  if (data.unavailable && !data.cities.length) return <main className="portal-container page-main"><PageIntro eyebrow="YOUR COMMUNITY" title="We’ll be right back." description="The live city directory is temporarily unavailable. Explore our resource collection while we reconnect." /><Link href="/resources" className="portal-button">Explore resources</Link></main>;
  const city = data.cities.find(item => item.slug === slug); if (!city) notFound();
  return <main className="portal-container page-main"><PageIntro eyebrow="YOUR CITY. YOUR CONNECTIONS." title={`A little closer to ${city.name}.`} description={city.is_launched ? 'Places to gather, people to meet, and resources to make everyday life easier.' : 'This city directory is coming next. Help us discover the places and organizations that make your community.'} />{city.is_launched ? <Discovery {...data} initialCity={city.slug} /> : <Link href={`/submit?city=${city.slug}`} className="portal-button">Suggest a local listing</Link>}</main>;
}

export async function generateMetadata({ params }: { params: Promise<{city: string; category?: string; slug?: string}> }) { return directoryMetadata({...await params}); }
