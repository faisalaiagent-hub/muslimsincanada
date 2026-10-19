import { getEditorial } from '@/lib/editorial';
import { EditorialLive } from './editorial-live';
export async function EditorialSections({ full = false, section = 'both' }: { full?: boolean; section?: 'voices' | 'news' | 'both' }) {
  return <EditorialLive initial={await getEditorial()} full={full} section={section} />;
}
