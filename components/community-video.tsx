'use client';

import { useRef, useState } from 'react';
import { Play, VolumeX } from 'lucide-react';

export function CommunityVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');

  async function play() {
    try {
      await video.current?.play();
      setStarted(true);
      setError('');
    } catch {
      setError('The clip couldn’t play. Use the source link below to watch it.');
    }
  }

  return (
    <article className={`v-video-card ${started ? 'is-playing' : ''}`}>
      <video
        ref={video}
        src="/media/toronto-sunset.mp4"
        poster="/media/toronto-poster.jpg"
        controls={started}
        preload="none"
        playsInline
        muted
        aria-label="Silent stock footage of the Toronto waterfront at sunset"
        onError={() => setError('The clip is temporarily unavailable. See the original on Pexels.')}
      />
      {!started && <button type="button" className="v-video-play" onClick={play} aria-label="Play Toronto sunset video"><Play size={27} fill="currentColor" /></button>}
      {!started && <div className="v-video-caption"><span className="v-label">A LITTLE LOCAL INSPIRATION</span><h3>A city.<br />A thousand connections.</h3><span><VolumeX size={12} /> Silent stock film · Toronto</span></div>}
      {error && <p className="v-video-error" role="status">{error} <a href="https://www.pexels.com/video/sunset-over-toronto-12655275/" target="_blank" rel="noreferrer">Watch at source ↗</a></p>}
    </article>
  );
}
