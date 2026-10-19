'use client';
import { useEffect, useState } from 'react';
import type { EditorialData } from '@/lib/editorial';
import { EditorialContent } from './editorial-content';

export function EditorialLive({ initial, full, section }: { initial: EditorialData; full: boolean; section: 'voices' | 'news' | 'both' }) {
  const [data, setData] = useState(initial);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    let controller: AbortController | undefined;
    async function refresh() {
      if (document.hidden || pending) return;
      pending = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 15000);
      try {
        const response = await fetch('/api/editorial', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const latest: EditorialData = await response.json();
        if (!Array.isArray(latest.creators) || !Array.isArray(latest.news)) throw new Error('Invalid response');
        if (active) {
          setData(previous => ({ ...latest,
            creators: latest.creators.map(source => source.unavailable ? { ...source, items: previous.creators.find(old => old.id === source.id)?.items ?? [] } : source),
            news: latest.news.map(source => source.unavailable ? { ...source, items: previous.news.find(old => old.id === source.id)?.items ?? [] } : source),
          }));
        }
        if (active) setOffline(latest.creators.some(source => source.unavailable) || latest.news.some(source => source.unavailable));
      } catch { if (active) setOffline(true); }
      finally { clearTimeout(timeout); pending = false; }
    }
    void refresh();
    const timer = setInterval(refresh, 5 * 60 * 1000);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    return () => { active = false; clearInterval(timer); controller?.abort(); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('online', onVisible); };
  }, []);
  return <><div className="portal-container e-update-status" role="status">{offline ? 'Some sources are unavailable. Previously loaded stories remain visible; reconnecting automatically.' : 'Auto-updating · new content checked every 5 minutes'}{data.checkedAt && <span>Last checked {new Date(data.checkedAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC</span>}</div><EditorialContent data={data} full={full} section={section} /></>;
}
