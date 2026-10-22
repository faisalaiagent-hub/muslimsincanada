'use client';
import {useState} from 'react';
export function DailyFeatureImage({src,source,kind}:{src?:string;source:string;kind:string}) {
 const [failed,setFailed]=useState(false);
 return src && !failed ? <img className="dh-photo" src={src} alt="" onError={()=>setFailed(true)} fetchPriority="high"/> : <div className={`dh-art dh-art-${kind}`} aria-hidden="true"><span>✳</span><strong>{source}</strong><small>IDEAS. PEOPLE. POSSIBILITIES.</small></div>;
}
