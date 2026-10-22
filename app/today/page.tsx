import Link from 'next/link';
import {getDailyEditions} from '@/lib/daily-highlights';
import {dailyPath} from '@/lib/daily-highlights-core';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('MIC daily highlights | Ideas, news & community','Explore MIC’s dated daily pairs: news, talks, community events and practical guides, with original sources and sharing tools.','/today');
export default async function DailyArchive(){const editions=await getDailyEditions();return <main className="portal-container page-main"><div className="page-intro"><span className="v-label">YOUR DAILY CONNECTION</span><h1>Worth a little of your time.</h1><p>Two highlights per edition. A mix of ideas, useful connections and things happening around us.</p></div><div className="dh-archive">{editions.map(e=><section className="prose-panel" key={e.date}><h2><time dateTime={e.date}>{e.date}</time></h2>{e.items.map(i=><p key={i.id}><span className="v-label">{i.kind}</span><br/><Link href={dailyPath(e.date,i)}>{i.title} →</Link><br/><small>{i.source}</small></p>)}</section>)}</div></main>;}
