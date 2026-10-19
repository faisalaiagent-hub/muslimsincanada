import Image from 'next/image';
import { NearbyExplorer } from '@/components/nearby-explorer';
import { getNearbyDirectory } from '@/lib/nearby-directory';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mosques & halal food near you | MIC', description: 'Find mosques and source-listed halal food around a Canadian area or your optional device location. Starting with the GTA.' };
export default async function NearbyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [data, params] = await Promise.all([getNearbyDirectory(), searchParams]);
  const query = typeof params.q === 'string' ? params.q.slice(0, 160) : '';
  const type = params.type === 'mosque' || params.type === 'food' ? params.type : 'all';
  return <main className="portal-container page-main"><header className="n-hero"><div><span className="v-label">LESS SEARCHING. MORE BELONGING.</span><h1>Your next connection.<br /><em>A little closer.</em></h1><p>A place to pray. A table to share. Discover mosques and halal food around the area you choose.</p></div><div className="n-hero-image"><Image src="/media/shared-table.jpg" alt="Illustrative stock photo of a shared mezze table" fill priority sizes="(max-width:760px) 90vw, 40vw" /><span>EXPLORE YOUR CORNER OF COMMUNITY</span></div></header><NearbyExplorer {...data} initialQuery={query} initialType={type} /></main>;
}
