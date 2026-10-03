'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Globe2,
  Inbox,
  LayoutDashboard,
  LayoutList,
  MapPinned,
  Plane,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { CommandDialog, type CommandItem } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { searchAdmin, type AdminSearchHit } from './actions-search';

const NAV: Array<{ href: string; label: string; icon: typeof LayoutDashboard; keywords: string }> = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, keywords: 'home overview خلاصه' },
  { href: '/admin/leads', label: 'درخواست‌های تماس', icon: Inbox, keywords: 'lead سرنخ تماس' },
  { href: '/admin/tours', label: 'تورها', icon: BriefcaseBusiness, keywords: 'tour سفر' },
  { href: '/admin/catalog?tab=destinations', label: 'مقصدها', icon: MapPinned, keywords: 'destination شهر کشور مقصد' },
  { href: '/admin/catalog?tab=origins', label: 'مبدأها', icon: Plane, keywords: 'origin مبدأ' },
  { href: '/admin/catalog?tab=hotels', label: 'هتل‌ها', icon: Building2, keywords: 'hotel اقامت هتل' },
  { href: '/admin/guides', label: 'راهنماها', icon: BookOpen, keywords: 'guide راهنما' },
  { href: '/admin/exhibitions', label: 'نمایشگاه‌ها', icon: Globe2, keywords: 'exhibition نمایشگاه' },
  { href: '/admin/seo', label: 'سئو و لندینگ‌ها', icon: BarChart3, keywords: 'seo لندینگ' },
  { href: '/admin/settings', label: 'تنظیمات', icon: SlidersHorizontal, keywords: 'settings پیکربندی' },
  { href: '/admin/users', label: 'کاربران', icon: Users, keywords: 'user مدیر' },
  { href: '/admin/audit', label: 'گزارش تغییرات', icon: ShieldCheck, keywords: 'audit لاگ تاریخچه' },
];

const ACTIONS: Array<{ href: string; label: string; icon: typeof LayoutList; keywords: string }> = [
  { href: '/admin/tours/new', label: 'ثبت تور جدید', icon: Plus, keywords: 'new tour افزودن' },
  // برچسب «افزودن» فقط وقتی که واقعاً فرم/دیالوگ را باز می‌کند؛ بقیه به صفحهٔ مدیریتشان می‌روند.
  // F11: آیتم‌های مدیریتی آیکون خنثی می‌گیرند؛ Plus فقط مال «ثبت تور جدید» است.
  { href: '/admin/hotels', label: 'مدیریت هتل‌ها', icon: LayoutList, keywords: 'hotel هتل افزودن' },
  { href: '/admin/catalog?tab=origins', label: 'مدیریت مبدأها', icon: LayoutList, keywords: 'origin مبدأ افزودن' },
  { href: '/admin/catalog?tab=destinations', label: 'مدیریت مقصدها', icon: LayoutList, keywords: 'new place شهر مقصد افزودن' },
  { href: '/admin/seo', label: 'مدیریت لندینگ‌های سئو', icon: LayoutList, keywords: 'new landing seo لندینگ' },
];

const KIND_LABELS: Record<AdminSearchHit['kind'], string> = {
  tour: 'تور',
  lead: 'درخواست',
  destination: 'مقصد',
};

const PaletteContext = createContext<{ openPalette: () => void }>({ openPalette: () => {} });

export function useAdminPalette() {
  return useContext(PaletteContext);
}

/**
 * نگه‌دارندهٔ یگانهٔ پالت فرمان (⌘K).
 * دور شل ادمین پیچیده می‌شود تا هم دکمهٔ جست‌وجوی سایدبار و هم دکمهٔ هدر موبایل
 * همان یک دیالوگ را باز کنند و شنوندهٔ ⌘K فقط یک بار ثبت شود.
 */
export function AdminPaletteProvider({ ownerOnly, children }: { ownerOnly: boolean; children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<AdminSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (term.trim().length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      searchAdmin(term)
        .then(setHits)
        .catch(() => setHits([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [term, open]);

  const go = (href: string) => {
    // یافتهٔ ۱۴ مبتدی: اگر ویزارد تور دادهٔ ذخیره‌نشده دارد، بی‌هشدار نرو.
    if (typeof window !== 'undefined' && (window as unknown as { __tourFormDirty?: boolean }).__tourFormDirty) {
      if (!window.confirm('تغییرات ذخیره‌نشده از دست می‌رود. خارج می‌شوی؟')) return;
    }
    setOpen(false);
    setTerm('');
    router.push(href);
  };

  const openPalette = useCallback(() => setOpen(true), []);

  const items: CommandItem[] = [
    ...NAV.filter((n) => (ownerOnly ? true : n.href !== '/admin/users')).map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      icon: n.icon,
      keywords: [n.keywords, n.href],
      group: 'رفتن به',
      onSelect: () => go(n.href),
    })),
    ...ACTIONS.map((a) => ({
      id: `action-${a.href}-${a.label}`,
      label: a.label,
      icon: a.icon,
      keywords: [a.keywords],
      group: 'کارهای سریع',
      onSelect: () => go(a.href),
    })),
    ...hits.map((h) => ({
      id: `hit-${h.id}`,
      label: `${h.title} · ${KIND_LABELS[h.kind]}`,
      keywords: [h.subtitle, KIND_LABELS[h.kind], h.title],
      group: 'نتایج جست‌وجو',
      onSelect: () => go(h.href),
    })),
  ];

  return (
    <PaletteContext.Provider value={{ openPalette }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setHits([]);
        }}
        items={items}
        onQueryChange={setTerm}
        placeholder="برو به… یا نام تور، درخواست و مقصد را بنویسید"
        emptyText={searching && term.trim().length >= 2 ? 'در حال جست‌وجو در پایگاه داده…' : 'نتیجه‌ای پیدا نشد؛ عبارت دیگری را امتحان کنید.'}
      />
    </PaletteContext.Provider>
  );
}

/** دکمهٔ تمام‌عرض جست‌وجو — سایدبار دسکتاپ و کشوی موبایل (در موبایل ۴۴px). */
export default function AdminCommand() {
  const { openPalette } = useAdminPalette();
  return (
    <button
      type="button"
      onClick={openPalette}
      className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-sm border border-input bg-background/60 px-3 text-panel-body text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground lg:h-10"
    >
      <Search className="size-4" />
      <span className="flex-1 text-start">جست‌وجو در پنل…</span>
      <Kbd keys={['⌘', 'K']} />
    </button>
  );
}

/** دکمهٔ آیکونی جست‌وجو — هدر موبایل (هدف لمسی ۴۴ پیکسل). */
export function AdminCommandIconButton() {
  const { openPalette } = useAdminPalette();
  return (
    <button
      type="button"
      onClick={openPalette}
      aria-label="جست‌وجو در پنل"
      className="grid size-11 cursor-pointer place-items-center rounded-sm border border-border bg-card text-foreground transition-colors hover:bg-accent"
    >
      <Search className="size-5" />
    </button>
  );
}
