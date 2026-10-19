'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { marketBrowser, useMarketplaceAuth } from './marketplace-auth';

export function AccountNav() {
  const { session, ready } = useMarketplaceAuth();
  const details = useRef<HTMLDetailsElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (details.current && !details.current.contains(event.target as Node)) details.current.open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  if (!ready) return <Link href="/marketplace/account" className="account-trigger account-loading" aria-label="Open your account"><UserRound size={17} /><span>Account…</span></Link>;
  if (!session) return <Link href="/marketplace/account" className="account-trigger"><UserRound size={17} /><span>Sign in</span></Link>;

  return <details className="account-nav" ref={details} onKeyDown={event => {
    if (event.key === 'Escape' && details.current) {
      details.current.open = false;
      details.current.querySelector('summary')?.focus();
    }
  }}>
    <summary className="account-trigger"><span className="account-active" aria-hidden="true" /><UserRound size={17} /><span>My account</span><ChevronDown size={13} /></summary>
    <div className="account-panel">
      <small>Signed in as</small><strong>{session.user.email}</strong>
      <Link href="/marketplace/account" onClick={() => { if (details.current) details.current.open = false; }}>My offerings & review dashboard ↗</Link>
      <Link href="/marketplace/new" onClick={() => { if (details.current) details.current.open = false; }}>Post an offering ↗</Link>
      <button disabled={busy} onClick={async () => {
        setBusy(true); setError('');
        try {
          const result = await marketBrowser().auth.signOut({ scope: 'local' });
          if (result.error) throw result.error;
        } catch { setError('Could not sign out. Please try again.'); }
        finally { setBusy(false); }
      }}><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button>
      {error && <p role="alert">{error}</p>}
    </div>
  </details>;
}
