'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, LocateFixed } from 'lucide-react';
import { rankNearby, type NearbyPlace, type Point } from '@/lib/nearby';

export function NearbyRecommendationsView({ places, position, accuracy }: { places: NearbyPlace[]; position: Point; accuracy: number }) {
  const [radius, setRadius] = useState(25);
  const [visible, setVisible] = useState({ mosque: 4, food: 4 });
  const nearby = rankNearby(places, position, radius);
  const unknown = places.filter(place => place.latitude == null || place.longitude == null).length;
  return <div className="l-recommendations"><div className="l-recommend-heading"><strong><LocateFixed size={18} />Places near you</strong><label className="n-radius">Within <select value={radius} onChange={event => { setRadius(+event.target.value); setVisible({ mosque: 4, food: 4 }); }}>{[5, 10, 25, 50, 100].map(km => <option value={km} key={km}>{km} km</option>)}</select></label><Link href="/nearby">Open full nearby search ↗</Link></div><p className="l-results-count" role="status">{nearby.length} mapped places within {radius} km · nearest first</p>
    <div className="l-nearby-groups">{(['mosque', 'food'] as const).map(type => {
      const results = nearby.filter(place => place.type === type);
      return <section className="l-nearby-group" key={type} aria-label={type === 'mosque' ? 'Nearby mosques' : 'Nearby halal food'}><div className="l-nearby-cover"><Image src={type === 'mosque' ? '/media/prayer-space.jpg' : '/media/shared-table.jpg'} alt="" fill sizes="(max-width:760px) 90vw, 45vw" /><h3>{type === 'mosque' ? 'Mosques & prayer spaces' : 'Halal food'}<span>{results.length} in this radius</span></h3><small>Illustrative photo</small></div><div className="l-nearby-list">{results.slice(0, visible[type]).map(place => {
        const href = place.href || place.website || place.sourceUrl || `/nearby?type=${type}`;
        const external = /^https?:/.test(href);
        return <Link className="l-nearby-row" href={href} key={place.id} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}><div><strong>{place.name}<ArrowUpRight size={15} /></strong><span>{place.address || place.city}</span><small>{place.source}{place.halal ? ' · confirm current halal scope' : ''}</small></div><b>{place.distance < 1 ? '< 1' : place.distance.toFixed(1)}<small>km</small></b></Link>;
      })}{!results.length && <p className="l-group-empty">No mapped {type === 'mosque' ? 'mosques' : 'food outlets'} in our current data within {radius} km. Try a wider radius. This does not mean there are no places nearby.</p>}
      {results.length > visible[type] && <button className="l-more-results" onClick={() => setVisible(previous => ({ ...previous, [type]: previous[type] + 6 }))}>Show more {type === 'mosque' ? 'mosques' : 'food outlets'} ({results.length - visible[type]} more)</button>}
      <Link className="l-full-category" href={`/nearby?type=${type}`}>Browse all {type === 'mosque' ? 'mosques' : 'food listings'} ↗</Link></div></section>;
    })}</div><p className="l-coverage-note">Results come from our available directory, not a complete live search of every nearby business. Food entries include certifier-listed and owner-declared locations, labelled by source. Coverage is still growing. {unknown > 0 ? `${unknown} listings without resolved coordinates are excluded from distance results. ` : ''}Approximate straight-line distances.{accuracy > 1000 ? ` Your device reported an approximate location (about ${(accuracy / 1000).toFixed(1)} km accuracy); try an area search if results look far away.` : ''} <Link href="/nearby#nearby-area">Search an area</Link> · <Link href="/submit">Suggest a missing place</Link>.</p>
  </div>;
}
