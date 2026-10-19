'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getDevicePosition, type DeviceLocation } from '@/lib/device-location';
type LocationState = { position: DeviceLocation | null; busy: boolean; message: string; requestId: number; requestLocation: () => void; clearLocation: () => void };
const Context = createContext<LocationState | null>(null);
const preference = 'mic-location-paused';
function paused() { try { return sessionStorage.getItem(preference) === 'yes'; } catch { return false; } }
export function LocationProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<DeviceLocation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState(0);
  const version = useRef(0), mounted = useRef(true), pending = useRef(false);
  const currentPosition = useRef<DeviceLocation | null>(null);
  const acquireLocation = useCallback(async () => {
    if (pending.current) return;
    if (!window.isSecureContext || !navigator.geolocation) { setMessage('Location needs a secure HTTPS connection and a supported browser. You can search an area instead.'); return; }
    const attempt = ++version.current;
    pending.current = true; setBusy(true); setMessage('');
    try {
      const result = await getDevicePosition(navigator.geolocation);
      if (!mounted.current || attempt !== version.current) return;
      try { sessionStorage.removeItem(preference); } catch {}
      currentPosition.current = result; setPosition(result);
    } catch (error) { if (mounted.current && attempt === version.current) setMessage((error as Error).message); }
    finally { if (mounted.current && attempt === version.current) { pending.current = false; setBusy(false); } }
  }, []);
  const requestLocation = useCallback(() => { if (pending.current) return; setRequestId(value => value + 1); void acquireLocation(); }, [acquireLocation]);
  const clearLocation = useCallback(() => {
    version.current++; pending.current = false; currentPosition.current = null; setBusy(false); setPosition(null); setMessage('');
    try { sessionStorage.setItem(preference, 'yes'); } catch {}
  }, []);
  useEffect(() => {
    mounted.current = true;
    let permission: PermissionStatus | undefined;
    let active = true;
    const sync = () => {
      if (!active || !permission) return;
      if (permission.state === 'granted' && !paused()) void acquireLocation();
      if (permission.state === 'denied') { version.current++; pending.current = false; currentPosition.current = null; setBusy(false); setPosition(null); }
    };
    if (navigator.permissions && window.isSecureContext) navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (!active) return;
      permission = result; permission.addEventListener('change', sync); sync();
    }).catch(() => {});
    const resume = () => { if (!document.hidden && currentPosition.current && Date.now() - currentPosition.current.acquiredAt > 60000 && !paused()) void acquireLocation(); };
    document.addEventListener('visibilitychange', resume);
    return () => { active = false; mounted.current = false; version.current++; pending.current = false; permission?.removeEventListener('change', sync); document.removeEventListener('visibilitychange', resume); };
  }, [acquireLocation]);
  return <Context.Provider value={{ position, busy, message, requestId, requestLocation, clearLocation }}>{children}</Context.Provider>;
}
export function useDeviceLocation() { const state = useContext(Context); if (!state) throw new Error('LocationProvider is required'); return state; }
