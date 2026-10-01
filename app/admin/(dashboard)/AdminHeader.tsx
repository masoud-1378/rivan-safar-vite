'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { AdminNavHeader, AdminNavGroups, AdminNavFooter } from './AdminSidebar';
import { AdminCommandIconButton } from './AdminCommand';

/**
 * هدر موبایل شل ادمین: دکمهٔ همبرگر (کشوی ناوبری از سمت راست) + لوگو + دکمهٔ جست‌وجو.
 * در دسکتاپ مخفی است؛ ناوبری دسکتاپ همان سایدبار می‌ماند.
 */
export default function AdminHeader({ role, email }: { role: 'owner' | 'editor'; email: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // با هر جابه‌جایی، کشو بسته می‌شود تا کاربر روی صفحهٔ تازه تنها نماند.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="باز کردن منوی ناوبری"
            aria-haspopup="dialog"
            className="grid size-11 cursor-pointer place-items-center rounded-sm border border-border bg-card text-foreground transition-colors hover:bg-accent"
          >
            <Menu className="size-5" />
          </button>
          <span className="flex items-center gap-2">
            <Image
              src="/images/logo-rivan-safar-simple.png"
              alt="ریوان سفر البرز"
              width={1200}
              height={657}
              className="h-9 w-auto max-w-full"
            />
          </span>
        </div>
        <AdminCommandIconButton />
      </div>
      <Sheet open={navOpen} onOpenChange={setNavOpen} side="start" title="منوی ناوبری">
        <div className="admin-mobile-nav flex h-full flex-col gap-3">
          <AdminNavHeader />
          <nav aria-label="ناوبری اصلی" className="min-h-0 flex-1 overflow-y-auto">
            <AdminNavGroups role={role} onNavigate={() => setNavOpen(false)} />
          </nav>
          <div className="border-t border-border pt-3">
            <AdminNavFooter email={email} role={role} />
          </div>
        </div>
      </Sheet>
    </>
  );
}
