'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    desc: 'پکیج‌ها، نرخ‌گذاری و وضعیت انتشار',
  },
  {
    id: 'leads',
    label: 'درخواست‌های رزرو تور',
    href: '/admin/tours/leads',
    icon: Inbox,
    desc: 'متقاضیان و لیدهای اختصاصی تورها',
  },
  {
    id: 'places',
    label: 'مقصدها و شهرها',
    href: '/admin/places',
    icon: MapPinned,
    desc: 'کشورها، شهرها و درخت مقاصد',
  },
  {
    id: 'origins',
    label: 'مبدأهای حرکت',
    href: '/admin/origins',
    icon: Navigation,
    desc: 'شهرهای مبدأ حرکت (هوایی، زمینی، ریلی)',
  },
  {
    id: 'hotels',
    label: 'هتل‌ها',
    href: '/admin/hotels',
    icon: Building2,
    desc: 'بانک هتل‌ها، ستاره و امکانات اقامتی',
  },
];

export default function TourHubNav({ counts }: TourHubNavProps) {
  const pathname = usePathname();

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-md">
      {/* Header title */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Compass className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">مرکز عملیات و مدیریت جامع تورها</h2>
            <p className="text-xs text-muted-foreground">مدیریت متمرکز پکیج‌ها، رزروها، مقاصد، مبدأهای حرکت (هوایی، زمینی) و هتل‌های طرف قرارداد</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.href === '/admin/tours' 
            ? pathname === '/admin/tours' 
            : pathname.startsWith(tab.href);
          
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-brand text-brand-foreground shadow-sm"
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
