import Link from 'next/link';
import {MarketplaceAuth} from '@/components/marketplace-auth';
import './marketplace.css';
export default function MarketplaceLayout({children}:{children:React.ReactNode}){return <MarketplaceAuth><div className="m-nav portal-container"><Link href="/marketplace">MIC Marketplace</Link><div><Link href="/marketplace/rules">Posting rules</Link><Link href="/marketplace/account">My offerings</Link><Link className="portal-button small" href="/marketplace/new">Post an offering +</Link></div></div>{children}</MarketplaceAuth>;}
