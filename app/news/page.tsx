import { EditorialSections } from '@/components/editorial-sections';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Muslim newsroom | MIC' };
export default function NewsPage() { return <main><h1 className="sr-only">Muslim newsroom</h1><EditorialSections full section="news" /></main>; }
