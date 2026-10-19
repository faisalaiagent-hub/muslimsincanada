'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {createClient,type Session} from '@supabase/supabase-js';
let browserClient:ReturnType<typeof createClient>|undefined;
export function marketBrowser(){return browserClient ||= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'mic-marketplace-auth'}});}
const Context=createContext<{session:Session|null;ready:boolean}>({session:null,ready:false});
export function MarketplaceAuth({children}:{children:ReactNode}){
  const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false);
  useEffect(()=>{let active=true;const client=marketBrowser();client.auth.getSession().then(({data})=>{if(active){setSession(data.session);setReady(true);}});const {data}=client.auth.onAuthStateChange((_event,value)=>{if(active){setSession(value);setReady(true);}});return()=>{active=false;data.subscription.unsubscribe();};},[]);
  return <Context.Provider value={{session,ready}}>{children}</Context.Provider>;
}
export const useMarketplaceAuth=()=>useContext(Context);
export async function marketplaceFetch(path:string,options:RequestInit={}){
  const {data}=await marketBrowser().auth.getSession();
  if(!data.session)throw new Error('Sign in to continue.');
  const response=await fetch(path,{...options,headers:{...options.headers,Authorization:`Bearer ${data.session.access_token}`}});
  const result=await response.json(); if(!response.ok)throw new Error(result.error||'Please try again.'); return result;
}
export function MarketplaceSignIn(){
  const [email,setEmail]=useState(''),[sent,setSent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  return <section className="m-auth"><span className="v-label">YOUR OFFERINGS. YOUR ACCOUNT.</span><h2>Sign in with your email.</h2><p>We’ll send a secure sign-in link. No password to remember. Confirming your email lets you submit offerings; it does not verify or endorse a business.</p><form onSubmit={async event=>{event.preventDefault();setBusy(true);setMessage('');try{const {error}=await marketBrowser().auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/marketplace/account`}});if(error)throw error;setSent(true);}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}}><label>Email address<input type="email" value={email} onChange={event=>setEmail(event.target.value)} autoComplete="email" required maxLength={254}/></label><button className="portal-button" disabled={busy}>{busy?'Sending…':sent?'Send another link':'Email me a sign-in link'}</button></form>{sent&&<p role="status">Check your inbox and spam folder. Open the sign-in link to manage your offerings.</p>}{message&&<p className="notice" role="alert">{message}</p>}<small>MIC keeps your sign-in email private unless you separately choose to display it as an advertisement contact.</small></section>;
}
