import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides } from '@/lib/guides';
import { pageMetadata } from '@/lib/seo';
export function generateStaticParams() { return guides.map(g => ({ slug: g.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const selected = guides.find(g => g.slug === slug);
  return selected ? pageMetadata(`${selected.title} | MIC`, selected.description, `/guides/${slug}`) : { robots: { index: false } };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);
  if (!guide) notFound();
  return <main className="portal-container page-main guide-page"><Link href="/guides" className="text-link">← MIC feature guides</Link><header className="page-intro"><span className="eyebrow">YOUR COMMUNITY. MADE USEFUL.</span><h1>{guide.title}</h1><p>{guide.description}</p></header><img className="guide-hero" src={guide.image} alt="Illustrative community stock photograph" /><article className="prose-panel">{guide.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}<div className="button-row"><Link className="portal-button" href={guide.href}>{guide.cta} →</Link><Link className="text-link" href="/guides">More MIC guides</Link></div></article></main>;
}
