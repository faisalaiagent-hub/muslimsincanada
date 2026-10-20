import { pageMetadata } from '@/lib/seo';
import { EditorialSections } from '@/components/editorial-sections';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Muslim voices in Canada & North America | MIC', 'Discover recent videos from established Muslim educators in Canada and the United States, with links to their official channels.', '/voices');
export default function VoicesPage() { return <main><h1 className="sr-only">Community voices</h1><EditorialSections full section="voices" /></main>; }
