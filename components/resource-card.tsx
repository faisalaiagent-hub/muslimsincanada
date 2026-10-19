import { ArrowUpRight } from 'lucide-react';
import type { Resource } from '@/lib/community';
import { SaveButton } from './saved-items';
export function ResourceCard({ resource }: { resource: Resource }) {
  return <article className="resource-card"><div className="resource-top"><span className="tag">{resource.category}</span><SaveButton item={{ id: `resource:${resource.id}`, name: resource.name, href: resource.url, category: resource.category, location: resource.region }} /></div><h3><a href={resource.url} target="_blank" rel="noreferrer">{resource.name}<ArrowUpRight size={17} /></a></h3><p>{resource.description}</p><div className="resource-source"><span>{resource.publisher}</span><span>{resource.region} · Reviewed {resource.checkedAt}</span></div></article>;
}
