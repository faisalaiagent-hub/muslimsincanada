'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export function VisualMotion() {
  const [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPaused(preference.matches);
    setReduced(preference.matches);
    const sync = () => { setPaused(preference.matches); setReduced(preference.matches); };
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
    return () => { delete document.documentElement.dataset.motion; };
  }, [paused]);

  return (
    <button className="v-motion-control" type="button" disabled={reduced} title={reduced ? 'Your device prefers reduced motion.' : undefined} onClick={() => setPaused(value => !value)} aria-pressed={paused}>
      {paused ? <Play size={13} /> : <Pause size={13} />}
      {reduced ? 'Motion reduced' : paused ? 'Play motion' : 'Pause motion'}
    </button>
  );
}
