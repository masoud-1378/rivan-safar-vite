'use client';

import { usePathname } from 'next/navigation';
import {
  Archive,
  BarChart3,
  BookOpen,
  Compass,
  Gauge,
  Globe2,
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Sidebar, SidebarGroup, SidebarItem } from '@/components/ui/sidebar';
import { Avatar } from '@/components/ui/avatar';
import AdminSignOut from './SignOut';
import AdminCommand from './AdminCommand';

const groups = [
  {
    title: 'مدیریت و عملیات',
    items: [
      { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
      { href: '/admin/tours', label: 'مرکز مدیریت تورها', icon: Compass },
      { href: '/admin/leads', label: 'درخواست‌های تماس عمومی', icon: Inbox },
    ],
  },
  {
    title: 'محتوا و رشد',
    items: [
      { href: '/admin/guides', label: 'مقالات و راهنماها', icon: BookOpen },
      { href: '/admin/exhibitions', label: 'نمایشگاه‌ها', icon: Globe2 },
      { href: '/admin/seo', label: 'سئو و لندینگ‌ها', icon: BarChart3 },
    ],
  },
  {
    title: 'سیستم',
    items: [
      { href: '/admin/settings', label: 'تنظیمات', icon: SlidersHorizontal },
      { href: '/admin/users', label: 'کاربران', icon: Users, ownerOnly: true },
      { href: '/admin/audit', label: 'گزارش تغییرات', icon: ShieldCheck },
      { href: '/admin/archive', label: 'بایگانی', icon: Archive },
    ],
  },
];

export function AdminNavHeader() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 py-2">
        <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground">
          <Gauge className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold">ریوان سفر</p>
          <p className="truncate text-xs text-muted-foreground">مرکز مدیریت محتوا</p>
        </div>
      </div>
      <AdminCommand />
    </div>
  );
}

export function AdminNavGroups({ role, onNavigate }: { role: 'owner' | 'editor'; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title} title={group.title}>
          {group.items.filter((item) => !item.ownerOnly || role === 'owner').map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onClick={onNavigate}
              active={
                item.href === '/admin'
                  ? pathname === '/admin'
                  : item.href === '/admin/tours'
                    ? pathname.startsWith('/admin/tours') || pathname.startsWith('/admin/places') || pathname.startsWith('/admin/origins') || pathname.startsWith('/admin/hotels')
                    : pathname.startsWith(item.href)
              }
            />
          ))}
        </SidebarGroup>
      ))}
    </>
  );
}

export function AdminNavFooter({ email, role }: { email: string; role: 'owner' | 'editor' }) {
  return (
    <div className="space-y-3 pb-1">
      <div className="flex items-center gap-2">
        <Avatar name={email || 'مدیر پنل'} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium" dir="ltr">{email}</p>
          <p className="text-[11px] text-muted-foreground">{role === 'owner' ? 'مالک سامانه' : 'ویراستار'}</p>
        </div>
      </div>
      <AdminSignOut />
    </div>
  );
}

export default function AdminSidebar({ role, email }: { role: 'owner' | 'editor'; email: string }) {
  return (
    <Sidebar
      className="admin-sidebar sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 border-border bg-card md:flex"
      header={<AdminNavHeader />}
      footer={<AdminNavFooter email={email} role={role} />}
    >
      <AdminNavGroups role={role} />
    </Sidebar>
  );
}
