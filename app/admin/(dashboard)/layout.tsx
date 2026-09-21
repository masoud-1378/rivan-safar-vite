import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/src/lib/admin-auth';
import AdminSidebar from './AdminSidebar';
import '@/src/index.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let role: 'owner' | 'editor' = 'editor';
  let email = '';
  try {
    const session = await requireAdmin(['owner', 'editor']);
    role = session.role;
    email = session.email;
  } catch {
    redirect('/admin/login?next=/admin');
  }

  return (
    <div className="admin-vibefarsi min-h-dvh bg-background text-foreground" dir="rtl">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 sm:gap-6 sm:p-6">
        <AdminSidebar role={role} email={email} />
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2 font-bold">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">ر</span>
              ریوان سفر
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}