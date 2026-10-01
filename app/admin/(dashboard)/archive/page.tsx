import { requireAdmin } from '@/src/lib/admin-auth';
import { listArchived } from './actions';
import ArchiveManager from './ArchiveManager';

export const metadata = { title: 'بایگانی' };

export default async function ArchivePage() {
  const session = await requireAdmin(['owner', 'editor']);
  const groups = await listArchived();
  return <ArchiveManager groups={groups} isOwner={session.role === 'owner'} />;
}
