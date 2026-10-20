import type { Metadata } from 'next'
import { pageMetadata, SITE } from '@/lib/seo';
import { PortalHeader, PortalFooter } from '@/components/portal-shell';
import { LocationProvider } from '@/components/location-provider';
import { LocationBanner } from '@/components/location-banner';
import { MarketplaceReturn } from '@/components/marketplace-return';
import { MarketplaceAuth } from '@/components/marketplace-auth';
import './globals.css';
import './visual.css';
import './brand-theme.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.muslimsincanada.com'),
  ...pageMetadata('Muslims in Canada | Mosques, halal food & community', 'Find mosques, halal food, community offerings, Muslim voices and Canadian and world news. Explore MIC, starting in the Greater Toronto Area.', '/'),
  icons: { icon: [{ url: '/favicon.png', type: 'image/png' }], shortcut: '/favicon.png', apple: '/apple-icon.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', '@id': SITE + '/#organization', name: 'Muslims in Canada', alternateName: 'MIC', url: SITE, logo: SITE + '/brand/mic-maple-emblem-red-green-white.png', sameAs: ['https://www.facebook.com/profile.php?id=100076979267705'] }, { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Muslims in Canada', url: SITE, publisher: { '@id': SITE + '/#organization' }, inLanguage: 'en-CA' }] }) }} /><MarketplaceReturn /><MarketplaceAuth><LocationProvider><a className="skip-link" href="#main-content">Skip to content</a><PortalHeader /><LocationBanner /><div id="main-content">{children}</div><PortalFooter /></LocationProvider></MarketplaceAuth></body>
    </html>
  )
}
