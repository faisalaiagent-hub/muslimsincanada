import { EditorialSections } from '@/components/editorial-sections';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Community voices | MIC' };
export default function VoicesPage() { return <main><h1 className="sr-only">Community voices</h1><EditorialSections full section="voices" /></main>; }
