import {marketUser,marketJson,marketRow,marketAdmin,marketResponse,MarketError} from '@/lib/marketplace-server';
export async function POST(request:Request){
  try{
    const user=await marketUser(request),body=await marketJson(request); await marketRow(body.adId);
    if(typeof body.reason!=='string'||body.reason.trim().length<10||body.reason.length>1000)throw new MarketError('Explain the concern in 10–1,000 characters.');
    const admin=marketAdmin(),since=new Date(Date.now()-3600000).toISOString();
    const count=await admin.from('submission').select('id',{count:'exact',head:true}).eq('payload->>channel','mic-marketplace-report').eq('payload->>reporter_id',user.id).gte('created_at',since);
    if(count.error)throw count.error; if((count.count||0)>=3)throw new MarketError('Please wait before submitting another report.',429);
    const {error}=await admin.from('submission').insert({submission_type:'correction',submitter_email:user.email,status:'pending',payload:{channel:'mic-marketplace-report',ad_id:body.adId,reporter_id:user.id,reason:body.reason.trim()}}); if(error)throw error;
    return Response.json({saved:true},{status:201});
  }catch(error){return marketResponse(error);}
}
