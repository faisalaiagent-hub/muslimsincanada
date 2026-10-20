import type { Metadata } from 'next';
export const SITE = 'https://www.muslimsincanada.com';
export const SHARE_IMAGE = '/media/mic-share.jpg';
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'en_CA', siteName: 'Muslims in Canada', title, description, url: path, images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: 'MIC — Muslims in Canada. Your community. In full colour.' }] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] } };
}
