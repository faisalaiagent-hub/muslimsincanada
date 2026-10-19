import { getEditorial } from '@/lib/editorial';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return Response.json(await getEditorial(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: 'Sources temporarily unavailable' }, { status: 503 }); }
}
