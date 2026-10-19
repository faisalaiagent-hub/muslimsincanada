import { marketAdmin, marketUser, marketResponse, marketDto, MARKET_CHANNEL } from '@/lib/marketplace-server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const user = await marketUser(request);
    let query = marketAdmin().from('submission').select('id,created_at,submitter_email,payload').eq('payload->>channel',MARKET_CHANNEL).order('created_at',{ascending:false}).limit(user.moderator ? 500 : 50);
    if(!user.moderator) query = query.eq('payload->>owner_id',user.id);
    const {data,error} = await query; if(error) throw error;
    const reports = user.moderator ? await marketAdmin().from('submission').select('id,created_at,payload').eq('payload->>channel','mic-marketplace-report').order('created_at',{ascending:false}).limit(100) : {data:[]};
    return Response.json({ user:{id:user.id,email:user.email,moderator:user.moderator}, ads:await Promise.all((data || []).map(row => marketDto(row,true))), reports:reports.data || [] },{headers:{'Cache-Control':'no-store'}});
  } catch(error) { return marketResponse(error); }
}
