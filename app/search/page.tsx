import { getDirectory } from '@/lib/directory';
import { Discovery } from '@/components/discovery';
import { PageIntro } from '@/components/portal-shell';
import { VisualPageBanner } from '@/components/visual-page-banner';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discover your community | MIC' };
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [data, params] = await Promise.all([getDirectory(), searchParams]);
  const value = (key: string, fallback: string) => typeof params[key] === 'string' ? params[key] as string : fallback;
  const type = value('type', 'all'); const city = value('city', 'all');
  return <main className="portal-container page-main"><PageIntro eyebrow="GOOD CONNECTIONS START HERE" title="What will you discover?" description="Find places, gatherings and resources that bring your community closer." /><VisualPageBanner /><Discovery {...data} initialQuery={value('q', '')} initialCity={data.cities.some(item => item.slug === city && item.is_launched) ? city : 'all'} initialType={['mosques', 'businesses', 'events', 'resources'].includes(type) ? type : 'all'} /></main>;
}
