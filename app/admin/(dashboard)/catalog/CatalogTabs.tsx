'use client';

import Link from 'next/link';
import { Building2, MapPinned, Navigation } from 'lucide-react';
import { cn, fa } from '@/lib/utils';

export type CatalogTabId = 'destinations' | 'origins' | 'hotels';

const TABS: Array<{ id: CatalogTabId; label: string; href: string; icon: typeof MapPinned; desc: string }> = [
  { id: 'destinations', label: 'مقصدها', href: '/admin/catalog?tab=destinations', icon: MapPinned, desc: 'کشورها و شهرهای مقصد' },
  { id: 'origins', label: 'مبدأها', href: '/admin/catalog?tab=origins', icon: Navigation, desc: 'فهرست مبدأهای فرم تورساز (فقط پنل)' },
  { id: 'hotels', label: 'هتل‌ها', href: '/admin/catalog?tab=hotels', icon: Building2, desc: 'بانک هتل‌ها و اقامتگاه‌ها' },
];

export default function CatalogTabs({
  tab,
  counts,
  children,
}: {
  tab: CatalogTabId;
  counts: Record<CatalogTabId, number>;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-panel-display text-foreground">کاتالوگ</h1>
        <p className="mt-2 text-panel-body text-muted-foreground">مقصدها، مبدأها و هتل‌ها؛ همه در یک صفحه</p>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="بخش‌های کاتالوگ">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={t.href}
              role="tab"
              aria-selected={active}
              title={t.desc}
              className={cn(
                'group flex items-center gap-2 rounded-sm px-4 py-2.5 text-panel-label font-semibold transition-colors',
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'border border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-brand-foreground' : 'text-muted-foreground')} aria-hidden />
              <span>{t.label}</span>
              <span
                className={cn(
                  'ms-1 rounded-full px-1.5 py-0.5 text-panel-caption font-bold',
                  active ? 'bg-black/20 text-brand-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {fa(counts[t.id])}
              </span>
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
