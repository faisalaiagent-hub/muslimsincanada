import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {marketRow,marketDto,MarketError} from '@/lib/marketplace-server';
import {activeMarketAd} from '@/lib/marketplace';
import {MarketplaceDetail} from '@/components/marketplace-detail';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 try { const row=await marketRow(id); if(!activeMarketAd(row.payload))return {title:'Offering unavailable | MIC',robots:{index:false}};
 const ad=await marketDto(row);
 return pageMetadata(`${ad.title} | MIC Marketplace`, 'Explore this community advertisement on MIC. View the offering, service area and advertiser contact details.', `/marketplace/${id}`);
 } catch { return {title:'Offering unavailable | MIC',robots:{index:false}}; }
}
export default async function AdPage({params}:{params:Promise<{id:string}>}){let row;try{row=await marketRow((await params).id);}catch(error){if(error instanceof MarketError&&error.status===404)notFound();throw error;}if(!activeMarketAd(row.payload))return <main className="portal-container page-main m-empty"><h1>This offering isn’t available.</h1><p>It may be awaiting review, expired or withdrawn.</p><Link className="portal-button" href="/marketplace">Explore the marketplace</Link></main>;return <main className="portal-container page-main"><Link className="text-link" href="/marketplace">← Back to the marketplace</Link><MarketplaceDetail ad={await marketDto(row)}/></main>;}
