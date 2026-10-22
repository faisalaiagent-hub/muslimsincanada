import {ImageResponse} from 'next/og';
import {notFound} from 'next/navigation';
import {getDailyEdition} from '@/lib/daily-highlights';
import {validDay} from '@/lib/daily-highlights-core';
export const dynamic='force-dynamic';
export const alt='MIC daily community highlight';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image({params}:{params:Promise<{date:string;item:string}>}){
 const {date,item}=await params;if(!validDay(date))notFound();const edition=await getDailyEdition(date);const feature=edition?.items.find(i=>i.id===item);if(!feature)notFound();
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',padding:'54px 66px',color:'white',background:'linear-gradient(130deg,#005638 0%,#00843d 38%,#b40929 100%)',fontFamily:'sans-serif'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:22,letterSpacing:2}}><span style={{fontWeight:700}}>MIC · MUSLIMS IN CANADA</span><span>{date}</span></div><div style={{display:'flex',marginTop:48,fontSize:19,letterSpacing:3}}>{feature.kind.toUpperCase()} / YOUR DAILY CONNECTION</div><div style={{display:'flex',marginTop:20,fontSize:feature.title.length>100?42:56,lineHeight:1.13,fontWeight:700,maxHeight:265,overflow:'hidden'}}>{feature.title.length>175?feature.title.slice(0,172)+'…':feature.title}</div><div style={{display:'flex',marginTop:'auto',justifyContent:'space-between',fontSize:21,paddingTop:20,borderTop:'1px solid #ffffff66'}}><span>{feature.source}</span><span>muslimsincanada.com</span></div></div>,size);
}
