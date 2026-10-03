import type { Metadata } from 'next';
import { listAdminUsers } from './actions';
import UsersManager from './UsersManager';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'کاربران | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminUsersPage() {
  try {
    await requireAdmin(['owner']);
  } catch {
    // ویراستار با آدرس مستقیم این‌جا می‌آید؛ به‌جای کرش #441، پیام روشن بده.
    return (
      <div className="admin-enter mx-auto max-w-lg py-16 text-center">
        <h1 className="text-panel-title text-foreground">دسترسی ندارید</h1>
        <p className="mt-2 text-panel-body text-muted-foreground">
          بخش مدیریت کاربران فقط برای مالک پنل است.
        </p>
      </div>
    );
  }
  const users = await listAdminUsers();
  return <UsersManager initial={users} />;
}