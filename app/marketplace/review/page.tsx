import {MarketplaceEmailReview} from '@/components/marketplace-email-review';
export const metadata={alternates:{canonical:'/marketplace/review'},title:'Private advertisement review | MIC',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default function EmailReviewPage(){return <main className="portal-container page-main"><MarketplaceEmailReview/></main>;}
