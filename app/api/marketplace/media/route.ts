import { activeMarketAd } from '@/lib/marketplace';
import { marketRow,marketAdmin,MARKET_BUCKET,MarketError,marketResponse } from '@/lib/marketplace-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{
    const query=new URL(request.url).searchParams, row=await marketRow(query.get('ad')||''),index=Number(query.get('index'));
    if(!activeMarketAd(row.payload)||!Number.isInteger(index)||index<0||index>=row.payload.imagePaths.length)throw new MarketError('Photo not found.',404);
    const result=await marketAdmin().storage.from(MARKET_BUCKET).download(row.payload.imagePaths[index]); if(result.error||!result.data)throw new MarketError('Photo not found.',404);
    return new Response(result.data,{headers:{'Content-Type':'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){return marketResponse(error);}
}
