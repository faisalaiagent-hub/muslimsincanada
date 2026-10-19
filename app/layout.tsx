import type { Metadata } from 'next'
import { PortalHeader, PortalFooter } from '@/components/portal-shell';
import { LocationProvider } from '@/components/location-provider';
import { LocationBanner } from '@/components/location-banner';
import './globals.css';
import './visual.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.muslimsincanada.com'),
  title: 'Muslims in Canada | Your community, a little closer',
  description: 'Discover mosques, community events, local connections and practical resources. Rooted in Canada. Connected by community.',
  icons: { icon: [{ url: '/favicon.png', type: 'image/png' }], shortcut: '/favicon.png', apple: '/apple-icon.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><LocationProvider><a className="skip-link" href="#main-content">Skip to content</a><PortalHeader /><LocationBanner /><div id="main-content">{children}</div><PortalFooter /></LocationProvider></body>
    </html>
  )
}
