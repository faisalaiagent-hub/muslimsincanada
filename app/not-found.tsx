import Link from 'next/link';
export default function NotFound() { return <main className="portal-container page-main empty-state"><span className="eyebrow">LET’S FIND YOUR WAY</span><h1>This connection isn’t here yet.</h1><p>The page may have moved, or the listing is not publicly available.</p><Link href="/search" className="portal-button">Explore the community</Link></main>; }
