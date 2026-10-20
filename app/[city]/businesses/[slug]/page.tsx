import { directoryMetadata } from '@/lib/directory-seo';
import { DetailPage } from '@/components/detail-page';
export const dynamic = 'force-dynamic';
export default async function BusinessPage({ params }: { params: Promise<{ city: string; slug: string }> }) { return <DetailPage {...await params} type="businesses" />; }

export async function generateMetadata({ params }: { params: Promise<{city: string; category?: string; slug?: string}> }) { return directoryMetadata({...await params, type: 'businesses'}); }
