import {MarketplaceForm} from '@/components/marketplace-form';
export const metadata={alternates:{canonical:'/marketplace/new'},title:'Post a community offering | MIC',robots:{index:false,follow:true}};
export default function NewOffering(){return <main className="portal-container page-main m-form-page"><span className="v-label">WHAT YOU DO COULD MAKE SOMEONE’S DAY.</span><h1>Share your talent.<br/><em>Find your community.</em></h1><p>Products, services and a little local possibility. Create a free advertisement for MIC review.</p><MarketplaceForm/></main>;}
