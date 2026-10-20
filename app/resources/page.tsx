import { pageMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/portal-shell';
import { ResourceExplorer } from '@/components/resource-explorer';
import { VisualPageBanner } from '@/components/visual-page-banner';
import Link from 'next/link';
export const metadata = pageMetadata('Community resources for Muslims in Canada | MIC', 'Explore newcomer services, family support, careers, learning and ways to give back. Find named providers and check their service coverage.', '/resources');
export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <main className="portal-container page-main"><PageIntro eyebrow="A HELPING HAND, WHEN YOU NEED IT" title="You don’t have to figure it out alone." description="Find newcomer guidance, family support, career connections, and ways to give back—in Canada and beyond." /><VisualPageBanner variant="resources" /><ResourceExplorer initialCategory={category} /><p className="resource-disclaimer">These are independent resources, not MIC partners or endorsements. Eligibility, availability and service areas vary. Check directly with the provider. <Link href="/sources">How we source information →</Link></p></main>;
}
