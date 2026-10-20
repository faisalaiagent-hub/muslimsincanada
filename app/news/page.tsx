import { pageMetadata } from '@/lib/seo';
import { EditorialSections } from '@/components/editorial-sections';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Community & world news | MIC', 'Muslim perspectives, CBC Canadian headlines and BBC world news. Follow attributed stories directly to their original publishers.', '/news');
export default function NewsPage() { return <main><h1 className="sr-only">Community and world news</h1><EditorialSections full section="news" /></main>; }
