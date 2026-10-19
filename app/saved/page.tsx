'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import { PageIntro } from '@/components/portal-shell';
import { readSaved, SaveButton, type SavedItem } from '@/components/saved-items';
export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]); const [ready, setReady] = useState(false);
  useEffect(() => { const sync = () => { setItems(readSaved()); setReady(true); }; sync(); window.addEventListener('mic:saved', sync); window.addEventListener('storage', sync); return () => { window.removeEventListener('mic:saved', sync); window.removeEventListener('storage', sync); }; }, []);
  return <main className="portal-container page-main"><PageIntro eyebrow="KEEP THE GOOD CONNECTIONS CLOSE" title="Your little corner of the community." description="Places and resources you’ve saved, stored in this browser. No account needed; saves don’t sync across devices." />{!ready ? <p role="status">Loading your saved connections…</p> : items.length ? <div className="listing-grid">{items.map(item => <article className="resource-card" key={item.id}><div className="resource-top"><span className="tag">{item.category}</span><SaveButton item={item} /></div><h3><a href={item.href} {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{item.name}<ArrowUpRight size={18} /></a></h3><p>{item.location}</p></article>)}</div> : <div className="empty-state"><Bookmark size={36} /><h2>A place for your next discoveries.</h2><p>Tap the bookmark on any listing or resource to keep it here.</p><Link href="/search" className="portal-button">Find your first connection</Link></div>}</main>;
}
