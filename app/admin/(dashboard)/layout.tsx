import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/src/lib/admin-auth';
import AdminSignOut from './SignOut';
import '@/src/index.css';

const NAV: Array<{ href: string; label: string; ownerOnly?: boolean }> = [
  { href: '/admin', label: 'داشبورد' },
  { href: '/admin/leads', label: 'درخواست‌های تماس' },
  { href: '/admin/tours', label: 'تورها' },
  { href: '/admin/places', label: 'مقصدها و شهرها' },
  { href: '/admin/guides', label: 'مقالات و راهنماها' },
  { href: '/admin/exhibitions', label: 'نمایشگاه‌ها' },
  { href: '/admin/seo', label: 'سئو و لندینگ‌ها' },
  { href: '/admin/settings', label: 'تنظیمات' },
  { href: '/admin/users', label: 'کاربران', ownerOnly: true },
  { href: '/admin/audit', label: 'گزارش تغییرات' },
];

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
    <div className="min-h-screen bg-page-background text-text-primary font-sans flex" dir="rtl">
      <aside className="w-56 shrink-0 bg-surface-dark text-white flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="text-body font-extrabold">ریوان سفر</div>
          <div className="text-caption text-white/60">پنل مدیریت</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.filter((i) => !i.ownerOnly || role === 'owner').map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 rounded-control text-body-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="text-caption text-white/60 px-1 truncate" dir="ltr">
            {email}
          </div>
          <div className="text-caption text-white/60 px-1">
            نقش: {role === 'owner' ? 'مالک' : 'ویراستار'}
          </div>
          <AdminSignOut />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
