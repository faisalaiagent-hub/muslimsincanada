'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDeviceLocation } from './location-provider';
import type { NearbyPlace } from '@/lib/nearby';
import { NearbyRecommendationsView } from './nearby-recommendations-view';
export function LocationRecommendations() {
  const { position } = useDeviceLocation();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const enabled = Boolean(position);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController(); setState('loading');
    fetch('/api/nearby', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); }).then(data => { setPlaces(data.places); setState('ready'); }).catch(error => { if (error.name !== 'AbortError') setState('error'); });
    return () => controller.abort();
  }, [enabled]);
  if (!position) return null; // The shared header already offers location access.
  if (state === 'loading') return <div className="l-recommendations" role="status">Finding your nearby connections…</div>;
  if (state === 'error') return <div className="l-recommendations" role="status">Nearby suggestions could not load. <Link href="/nearby">Try the nearby directory →</Link></div>;
  return <NearbyRecommendationsView places={places} position={position} accuracy={position.accuracy} />;
}
