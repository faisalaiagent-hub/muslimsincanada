'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { resources } from '@/lib/community';
import { ResourceCard } from './resource-card';
export function ResourceExplorer({ initialCategory = 'all' }: { initialCategory?: string }) {
  const categories = Array.from(new Set(resources.map(item => item.category)));
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'all');
  const [region, setRegion] = useState('all'); const [query, setQuery] = useState('');
  const items = resources.filter(item => (category === 'all' || item.category === category) && (region === 'all' || item.region === region) && `${item.name} ${item.description} ${item.publisher}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><div className="discovery-controls"><label className="search-field"><Search size={20} /><span className="sr-only">Search resources</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find support, learning or a way to give back…" /></label><label className="select-field"><span>Explore by region</span><select value={region} onChange={event => setRegion(event.target.value)}><option value="all">All regions</option><option>Canada</option><option>United States</option><option>Global</option></select></label></div><div className="discovery-tabs">{['all', ...categories].map(item => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? 'active' : ''}>{item === 'all' ? 'All resources' : item}</button>)}</div><p className="result-count" aria-live="polite">{items.length} sourced resources · Links reviewed October 18, 2026</p><div className="listing-grid">{items.map(item => <ResourceCard key={item.id} resource={item} />)}</div>{!items.length ? <div className="empty-state"><h2>No matching resources yet.</h2><p>Try another region or topic.</p><button type="button" className="portal-button secondary" onClick={() => { setCategory('all'); setRegion('all'); setQuery(''); }}>Reset filters</button></div> : null}</>;
}
