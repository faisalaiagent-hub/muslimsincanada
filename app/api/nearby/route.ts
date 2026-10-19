import { getNearbyDirectory } from '@/lib/nearby-directory';
export const dynamic = 'force-dynamic';
export async function GET() { return Response.json(await getNearbyDirectory(), { headers: { 'Cache-Control': 'public, max-age=60' } }); }
