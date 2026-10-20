import { directoryMetadata } from '@/lib/directory-seo';
import { DetailPage } from '@/components/detail-page';
export const dynamic = 'force-dynamic';
export default async function MosquePage({ params }: { params: Promise<{ city: string; slug: string }> }) { return <DetailPage {...await params} type="mosques" />; }

export async function generateMetadata({ params }: { params: Promise<{city: string; category?: string; slug?: string}> }) { return directoryMetadata({...await params, type: 'mosques'}); }
