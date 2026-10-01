'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  Inbox, 
  MapPinned, 
  Navigation, 
  Building2,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourHubNavProps {
  counts?: {
    tours?: number;
    leads?: number;
    places?: number;
    origins?: number;
    hotels?: number;
  };
}

const TABS = [
  {
    id: 'tours',
    label: 'لیست تورها',
    href: '/admin/tours',
    icon: BriefcaseBusiness,
    desc: 'تورها، نرخ‌گذاری و وضعیت انتشار',
  },
  {
    id: 'leads',
    label: 'درخواست‌های رزرو تور',
    href: '/admin/tours/leads',
    icon: Inbox,
    desc: 'متقاضیان و درخواست‌های اختصاصی تورها',
  },
  {
    id: 'places',
    label: 'مقصدها و شهرها',
    href: '/admin/catalog?tab=destinations',
    icon: MapPinned,
    desc: 'کشورها، شهرها و درخت مقاصد',
  },
  {
    id: 'origins',
    label: 'مبدأهای حرکت',
    href: '/admin/catalog?tab=origins',
    icon: Navigation,
    desc: 'شهرهای مبدأ حرکت (هوایی، زمینی، ریلی)',
  },
  {
    id: 'hotels',
    label: 'هتل‌ها',
    href: '/admin/catalog?tab=hotels',
    icon: Building2,
    desc: 'بانک هتل‌ها، ستاره و امکانات اقامتی',
  },
];

function isTabActive(tabId: string, tabHref: string, pathname: string, catalogTab: string | null): boolean {
  if (tabId === 'tours') return pathname === '/admin/tours';
  if (tabHref.startsWith('/admin/catalog')) {
    if (!pathname.startsWith('/admin/catalog')) return false;
    const want = new URLSearchParams(tabHref.split('?')[1] ?? '').get('tab');
    return (catalogTab ?? 'destinations') === want;
  }
  return pathname.startsWith(tabHref);
}

export default function TourHubNav({ counts }: TourHubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogTab = searchParams.get('tab');

  return (
    <div className="mb-6 rounded-sm border border-border bg-card/60 p-4 backdrop-blur-md">
      {/* Header title */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-sm bg-brand/15 text-brand">
            <Compass className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">تورها</h2>
            <p className="text-xs text-muted-foreground">مدیریت متمرکز تورها، رزروها، مقاصد، مبدأهای حرکت (هوایی، زمینی) و هتل‌های طرف قرارداد</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const isActive = isTabActive(tab.id, tab.href, pathname, catalogTab);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-sm px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-brand text-brand-foreground"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
              )}
            >
              <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-brand-foreground" : "text-muted-foreground")} />
              <span>{tab.label}</span>
              {counts && counts[tab.id as keyof typeof counts] !== undefined && (
                <span className={cn(
                  "ms-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-black/20 text-brand-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {counts[tab.id as keyof typeof counts]}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
