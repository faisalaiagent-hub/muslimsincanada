import Link from 'next/link';
import { guides } from '@/lib/guides';
import { pageMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/portal-shell';
export const metadata = pageMetadata('Make the most of MIC | Community feature guides', 'Learn how to find nearby mosques and halal food, share your business, and explore the Muslims in Canada community portal.', '/guides');
export default function GuidesPage() {
  return <main className="portal-container page-main"><PageIntro eyebrow="A LITTLE LOCAL KNOW-HOW" title="More from your community." description="Simple ways to find your place, share what you do, and make the most of MIC." /><div className="guide-grid">{guides.map(guide => <article className="guide-card" key={guide.slug}><Link href={`/guides/${guide.slug}`}><img src={guide.image} alt="" loading="lazy" /><div><h2>{guide.title}</h2><p>{guide.description}</p><span className="text-link">Explore the guide →</span></div></Link></article>)}</div></main>;
}
