import { marketAdmin, marketUser, marketJson, marketResponse, marketDto, MarketError, MARKET_CHANNEL, publicMarket, checkMarketPhotos } from '@/lib/marketplace-server';
import { validateMarketInput } from '@/lib/marketplace';
import { notifyMarketReview } from '@/lib/marketplace-review';
export const dynamic = 'force-dynamic';
export async function GET() { const data = await publicMarket(); return Response.json(data, { status: data.unavailable ? 503 : 200, headers: { 'Cache-Control': 'no-store' } }); }
export async function POST(request: Request) {
  try {
    const user = await marketUser(request), body = await marketJson(request);
    let offering; try { offering = validateMarketInput(body, user.id); } catch(error) { throw new MarketError((error as Error).message); }
    if(body.consent !== true || body.company) throw new MarketError('Confirm the posting rules and your permission to publish these details.');
    if(body.saveDraft !== true && !offering.imagePaths.length) throw new MarketError('Add at least one photo before submitting for review.');
    const admin = marketAdmin();
    const {count,error:countError} = await admin.from('submission').select('id',{count:'exact',head:true}).eq('payload->>channel',MARKET_CHANNEL).eq('payload->>owner_id',user.id).neq('payload->>market_state','withdrawn');
    if(countError) throw countError; if((count || 0) >= 10) throw new MarketError('You can have up to 10 active or draft advertisements. Withdraw an old ad first.',429);
    const recent = await admin.from('submission').select('id',{count:'exact',head:true}).eq('payload->>channel',MARKET_CHANNEL).eq('payload->>owner_id',user.id).gte('created_at',new Date(Date.now()-86400000).toISOString());
    if(recent.error)throw recent.error;if((recent.count||0)>=20)throw new MarketError('Please wait before creating more advertisements.',429);
    await checkMarketPhotos(offering.imagePaths,user.id);
    const {data,error} = await admin.from('submission').insert({submission_type:'business',submitter_email:user.email,status:'pending',payload:{...offering,channel:MARKET_CHANNEL,owner_id:user.id,email_verified:true,market_state:body.saveDraft === true ? 'draft' : 'pending',revision:1,consent:true,updated_at:new Date().toISOString()}}).select('id,created_at,submitter_email,payload').single();
    if(error) throw error;
    await notifyMarketReview(data);
    return Response.json({ad:await marketDto(data,true)},{status:201,headers:{'Cache-Control':'no-store'}});
  } catch(error) { return marketResponse(error); }
}
