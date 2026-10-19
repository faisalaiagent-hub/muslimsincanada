'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

export function EditorialCarousel({ children, label }: { children: ReactNode; label: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const direction = useRef(1);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || reduced || hovered || focused) return;
    let frame = 0;
    let previous = 0;
    let position = rail.current?.scrollLeft ?? 0;
    const step = (now: number) => {
      const element = rail.current;
      if (element && previous && !document.hidden) {
        const maximum = element.scrollWidth - element.clientWidth;
        if (maximum > 1) {
          if (position >= maximum - 1) direction.current = -1;
          if (position <= 0) direction.current = 1;
          position = Math.max(0, Math.min(maximum, position + direction.current * Math.min(now - previous, 50) * .035));
          element.scrollLeft = position;
        }
      }
      previous = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduced, hovered, focused]);

  function move(amount: number) {
    setPaused(true);
    rail.current?.scrollBy({ left: amount * (rail.current.clientWidth * .8), behavior: reduced ? 'instant' : 'smooth' });
  }

  return <div className="e-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="e-carousel-toolbar"><span>{reduced ? 'Swipe or use the arrows to explore' : 'Scrolls automatically · pauses while you explore'}</span><div>
      <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`}><ArrowLeft size={18} /></button>
      <button type="button" onClick={() => setPaused(value => !value)} disabled={reduced} aria-label={reduced ? `Motion reduced for ${label}` : `${paused ? 'Resume' : 'Pause'} ${label}`} aria-pressed={paused}>{paused || reduced ? <Play size={16} /> : <Pause size={16} />}{reduced ? 'Motion reduced' : paused ? 'Resume' : 'Pause'}</button>
      <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`}><ArrowRight size={18} /></button>
    </div></div>
    <div className="e-carousel-rail" ref={rail} tabIndex={0} aria-label={`${label} cards. Use arrow keys to scroll.`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onPointerDown={() => setPaused(true)}
      onClickCapture={event => { if ((event.target as HTMLElement).closest('.e-video button')) setPaused(true); }}>
      {children}
    </div>
  </div>;
}
