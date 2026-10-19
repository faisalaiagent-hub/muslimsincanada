'use client';
import { useEffect, useState } from 'react';
import { Bookmark, Check, Share2 } from 'lucide-react';

export type SavedItem = { id: string; name: string; href: string; category: string; location: string };
const KEY = 'mic:saved:v1';
export function readSaved(): SavedItem[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(data) ? data.filter((item): item is SavedItem => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.category === 'string' && typeof item.location === 'string' && typeof item.href === 'string' && !item.href.includes('\\') && (item.href.startsWith('/') && !item.href.startsWith('//') || /^https?:\/\//.test(item.href))) : [];
  } catch { return []; }
}
export function SaveButton({ item }: { item: SavedItem }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { const sync = () => setSaved(readSaved().some(entry => entry.id === item.id)); sync(); window.addEventListener('mic:saved', sync); window.addEventListener('storage', sync); return () => { window.removeEventListener('mic:saved', sync); window.removeEventListener('storage', sync); }; }, [item.id]);
  function toggle() {
    const items = readSaved(); const exists = items.some(entry => entry.id === item.id);
    try { localStorage.setItem(KEY, JSON.stringify(exists ? items.filter(entry => entry.id !== item.id) : [...items, item])); setError(false); setSaved(!exists); window.dispatchEvent(new Event('mic:saved')); } catch { setError(true); }
  }
  return <span><button type="button" className={`icon-button ${saved ? 'is-saved' : ''}`} onClick={toggle} aria-label={`${saved ? 'Unsave' : 'Save'} ${item.name}`} aria-pressed={saved}>{saved ? <Check size={18} /> : <Bookmark size={18} />}</button>{error ? <small role="status">Browser storage unavailable.</small> : null}</span>;
}
export function ShareButton({ title, path }: { title: string; path?: string }) {
  const [message, setMessage] = useState('');
  async function share() {
    const url = path ? new URL(path, window.location.origin).href : window.location.href;
    try { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setMessage('Link copied'); } }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('Copy the page address to share.'); }
  }
  return <span className="share-action"><button className="portal-button secondary small" onClick={share} type="button"><Share2 size={15} />Share</button><small role="status">{message}</small></span>;
}
