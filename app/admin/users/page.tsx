import type { Metadata } from 'next';
import { listAdminUsers } from './actions';
import UsersManager from './UsersManager';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'کاربران | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminUsersPage() {
  await requireAdmin(['owner']);
  const users = await listAdminUsers();
  return <UsersManager initial={users} />;
}