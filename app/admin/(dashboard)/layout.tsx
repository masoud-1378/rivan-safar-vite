import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/src/lib/admin-auth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminProviders from './AdminProviders';
import { AdminPaletteProvider } from './AdminCommand';
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
    <AdminPaletteProvider ownerOnly={role === 'owner'}>
      <div className="admin-vibefarsi min-h-dvh bg-background text-foreground" data-theme="admin" dir="rtl">
        <div className="mx-auto flex max-w-[1600px] gap-4 p-4 sm:gap-6 sm:p-6">
          <AdminSidebar role={role} email={email} />
          <main className="min-w-0 flex-1">
            <AdminHeader role={role} email={email} />
            <AdminProviders>{children}</AdminProviders>
          </main>
        </div>
      </div>
    </AdminPaletteProvider>
  );
}
