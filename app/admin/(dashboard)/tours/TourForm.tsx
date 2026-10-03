'use client';

import React, { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { 
  Compass, 
  Building2, 
  Map, 
  ShieldCheck, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Save, 
  Eye, 
  History,
  X,
  Send,
  EyeOff,
  Loader2,
  ExternalLink,
  Flag,
  Wallet,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { fa, faNumber, cn } from '@/lib/utils';
import type { 
  DestinationTree, 
  OriginRow, 
  TourInput, 
  TourRow,
  TourRichFields,
  TourFaqItem,
  TourItineraryDayItem,
  TourFinancialSpecsItem,
  TourCancellationTier,
} from './actions';
import type { TourGalleryItem, TourReviewItem } from './experience-types';
import { saveTour, checkSlugUnique } from './actions';
import { getAllDraftFallbackAnswer, getSettingsMap } from '../settings/actions';
import { AllDraftFallbackDialog } from './AllDraftFallbackDialog';
import type { HotelPickerItem } from '../hotels/actions';
import { validateDraft } from './tour-helpers';
import { buildDurationFromNights } from '@/src/lib/tour-format';
import { checkPublishReadiness, stageTicksFromGate, type PublishCheck } from './publish-gate';
import { MissingChecksDialog, PublishConfirmDialog } from './PublishGateDialog';
import { DOMESTIC_SLUGS, DOMESTIC_NAME_RE, guessVisaRequired } from '@/src/lib/domestic';

// 7 Modular Stage Components + ایستگاه پایانی (موج ۴: تجربه سفر شد مرحلهٔ ۷)
import Stage1Identity from './stages/Stage1Identity';
import { StageStepper } from './StageStepper';
import Stage2Hotels from './stages/Stage2Hotels';
import Stage3Itinerary from './stages/Stage3Itinerary';
import { safeErrorMessage } from '@/src/lib/error-message';
import Stage4TrustTerms from './stages/Stage4TrustTerms';
import Stage5Consultant from './stages/Stage5Consultant';
// بلوک مالی واقعی (موج ۳): مرحلهٔ ۶ «هزینه‌ها و شرایط».
import Stage6Financial from './stages/Stage6Financial';
import Stage7Experience from './stages/Stage7Experience';
// ایستگاه پایانی (موج ۱، قلم ۵): جمع‌بندی خودکار + انتشارِ گیت‌دار.
import StageFinalStation from './stages/StageFinalStation';
import SmartImage from '@/src/components/SmartImage';

export interface TourFormProps {
  /** ردیف تور + فیلدهای غنی/سئو (وقتی ویرایش است، از getTourById می‌آید). */
  initial?: (TourRow & Partial<TourRichFields>) | null;
  editingId?: string | null;
  /** بعد از ذخیرهٔ موفق صدا زده می‌شود؛ برای تور تازه، شناسهٔ ساخته‌شده را می‌گیرد. */
  onDone: (id?: string | null) => void;
  /**
   * انصراف: از صفحه خارج می‌شود. از onDone جداست چون «ذخیره شد» و «انصراف»
   * دو نیت متفاوت‌اند (D2): در ویرایش، ذخیره همان‌جا می‌ماند ولی انصراف
   * واقعاً به فهرست تورها برمی‌گردد تا دیالوگ «خارج می‌شوید؟» دروغ نگوید.
   * اگر داده نشود، همان onDone صدا زده می‌شود.
   */
  onCancel?: () => void;
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelPickerItem[];
}

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const LAST_ORIGIN_KEY = 'rivan-last-origin';

/**
 * مبدأ پیش‌فرض هوشمند (T5): اول آخرین مبدأ استفاده‌شده (localStorage)،
 * وگرنه اگر فقط یک مبدأ فعال بود همان. برای تورِ در حال ویرایش، مبدأ ثبت‌شده‌اش می‌ماند.
 */
function smartOriginDefault(origins: OriginRow[]): string {
  try {
    const last = localStorage.getItem(LAST_ORIGIN_KEY);
    if (last && origins.some((o) => o.nameFa === last)) return last;
  } catch {
    /* حافظهٔ مرورگر در دسترس نیست؛ رد شو */
  }
  if (origins.length === 1) return origins[0].nameFa;
  return '';
}

interface StageTabConfig {
  id: StageId;
  label: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STAGES: StageTabConfig[] = [
  { id: 1, shortTitle: '۱. هویت و نرخ', label: 'هویت، ترابری و نرخ پایه', icon: Compass, description: 'مقصد، نحوه حرکت، کف قیمت' },
  { id: 2, shortTitle: '۲. هتل و اتاق', label: 'هتل‌ها و اتاق‌ها', icon: Building2, description: 'هتل‌ها، ستاره و وعده‌ها' },
  { id: 3, shortTitle: '۳. برنامه سفر', label: 'برنامه روزبه‌روز و خدمات', icon: Map, description: 'تایم‌لاین گشت‌ها و ترانسفر' },
  { id: 4, shortTitle: '۴. اعتماد و مدارک', label: 'اعتماد، مدارک و قوانین', icon: ShieldCheck, description: 'ویزا، هزینه‌های مقصد، بار مجاز' },
  { id: 5, shortTitle: '۵. کارشناس', label: 'کارشناس مسیر و راهنما', icon: UserCheck, description: 'مشاور مسیر، فایل صوتی، راهنمای فروش و انتشار' },
  // بلوک مالی واقعی (موج ۳): مرحلهٔ ۶ «هزینه‌ها و شرایط» — جدول کنسلی پلکانی،
  // بند رد ویزا، پیش‌پرداخت و مهلت تسویه. ایستگاه پایانی شد مرحلهٔ ۷.
  { id: 6, shortTitle: '۶. هزینه‌ها و شرایط', label: 'هزینه‌ها و شرایط', icon: Wallet, description: 'کنسلی پلکانی، رد ویزا، پیش‌پرداخت' },
  // موج ۴: مرحلهٔ ۷ «تجربه سفر» — تورلیدر، نظر مسافران، گالری واقعی.
  // ایستگاه پایانی شد مرحلهٔ ۸.
  { id: 7, shortTitle: '۷. تجربه سفر', label: 'تورلیدر، نظرها و گالری', icon: Users, description: 'لیدر حرکت، نظر مسافران، عکس واقعی' },
  // ایستگاه پایانی (موج ۱، قلم ۵): مرحلهٔ ۸ ویزارد — جمع‌بندی و انتشار.
  { id: 8, shortTitle: '۸. ایستگاه پایانی', label: 'ایستگاه پایانی', icon: Flag, description: 'جمع‌بندی و انتشار' },
];

/** ترتیب واقعی گام‌های ویزارد (۷ گام + ایستگاه پایانی). */
const STAGE_ORDER: StageId[] = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * دکمهٔ آیکونی داک شناور پایین ویرایشگر — ۴۰px، با تول‌تیپ فارسی.
 * primary یعنی اکشن اصلی (رنگ برند) و active یعنی حالت روشن (مثل پیش‌نمایش باز).
 */
function DockBtn({
  title,
  onClick,
  disabled,
  primary,
  active,
  danger,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={
        primary
          ? 'flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm transition-all hover:bg-brand/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50'
          : danger
            ? 'flex size-10 items-center justify-center rounded-xl text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:pointer-events-none disabled:opacity-35'
            : 'flex size-10 items-center justify-center rounded-xl transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-35 ' +
              (active
                ? 'bg-brand/15 text-brand'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground')
      }
    >
      {children}
    </button>
  );
}

export default function TourForm({
  initial,
  editingId,
  onDone,
  onCancel,
  tree,
  origins,
  hotels,
}: TourFormProps) {
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState<StageId>(1);
  const [isPending, startTransition] = useTransition();
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [touched, setTouched] = useState(false);

  // فاز B5 موج ۲: «مبنای قیمت» برای ایستگاه پایانی از تنظیم می‌آید، نه از ستون.
  const [priceNoteDefault, setPriceNoteDefault] = useState('');
  useEffect(() => {
    getSettingsMap()
      .then((m) => setPriceNoteDefault(m['tours.default_price_note'] || ''))
      .catch(() => {});
  }, []);
  // گشت (ایراد ۱): تداخل نامک (مثلاً «t»های به‌جامانده از ایراد ۳) ذخیره را بی‌صدا می‌بست؛
  // حالا علاوه بر پیام، خود فیلد نامک هم قرمز می‌شود تا علت گم نشود.
  const [slugConflict, setSlugConflict] = useState(false);
  // انصراف با فرم کثیف (T11): قبل از خروج، دیالوگ «تغییرات ذخیره‌نشده از دست می‌رود».
  const [dirty, setDirty] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // یافتهٔ ۱۴ مبتدی (رفع ریشه‌ای، ۱۴۰۵/۰۷/۱۱): گشت زنده نشان داد beforeunload به‌تنهایی
  // برای خروج از سایدبار کافی نیست؛ پس نگهبان سه‌لایه شد:
  //  ۱) شنوندهٔ capture روی کلیک لینک‌های داخلی (سایدبار، بردکرامب، …) وقتی فرم
  //     کثیف است → جلوی ناوبری گرفته می‌شود و دیالوگ سفارشی (نه native) باز می‌شود؛
  //     دیالوگ سفارشی هم برای کاربر واقعی دیده می‌شود هم در گشت خودکار.
  //  ۲) نگهبان دکمهٔ برگشت مرورگر: با کثیف‌شدن فرم یک ورودی نگهبان در history گذاشته
  //     می‌شود؛ popstate آن را می‌گیرد و دیالوگ می‌پرسد.
  //  ۳) beforeunload برای بستن تب/رفرش سر جایش می‌ماند.
  // ناوبری SPA پالت فرمان هم از قبل با پرچم سراسری __tourFormDirty نگهبانی می‌شود.
  const dirtyRef = useRef(false);
  const suppressUnloadRef = useRef(false); // خروج تأییدشده: beforeunload شلیک نکند
  const guardPushedRef = useRef(false); // ورودی نگهبان history گذاشته شده؟
  const allowBackRef = useRef(false); // خروج با دکمهٔ برگشت تأیید شده
  const pendingHrefRef = useRef<string | null>(null); // لینکی که در انتظار تأیید خروج است
  const pendingAfterPopRef = useRef<(() => void) | null>(null); // بعد از برداشتن نگهبان از history
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    dirtyRef.current = dirty;
    (window as unknown as { __tourFormDirty?: boolean }).__tourFormDirty = dirty;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (suppressUnloadRef.current || !dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    // کلیک روی لینک داخلی وقتی فرم کثیف است: ناوبری (چه full چه SPA) را نگه دار.
    const onClickCapture = (e: MouseEvent) => {
      if (!dirtyRef.current || suppressUnloadRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null | undefined;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      if (anchor.hasAttribute('download')) return;
      if ((anchor.getAttribute('target') || '').toLowerCase() === '_blank') return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      e.preventDefault();
      e.stopPropagation();
      pendingHrefRef.current = url.href;
      setShowExitConfirm(true);
    };

    const onPopState = () => {
      // ناوبریِ بعد از ذخیره/انصراف که اول نگهبان را از history برمی‌دارد.
      if (pendingAfterPopRef.current) {
        const go = pendingAfterPopRef.current;
        pendingAfterPopRef.current = null;
        guardPushedRef.current = false;
        go();
        return;
      }
      if (!dirtyRef.current) return;
      if (allowBackRef.current) {
        allowBackRef.current = false;
        return;
      }
      // برگشت مرورگر با فرم کثیف: بمان و بپرس.
      window.history.pushState({ __tourFormGuard: true }, '', window.location.href);
      guardPushedRef.current = true;
      pendingHrefRef.current = null;
      setShowExitConfirm(true);
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPopState);
    // با کثیف‌شدن فرم، ورودی نگهبان برای دکمهٔ برگشت مرورگر.
    if (dirty && !guardPushedRef.current) {
      window.history.pushState({ __tourFormGuard: true }, '', window.location.href);
      guardPushedRef.current = true;
    }
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('popstate', onPopState);
      (window as unknown as { __tourFormDirty?: boolean }).__tourFormDirty = false;
    };
  }, [dirty]);

  // خروجِ تأییدشده از فرم (بعد از ذخیرهٔ موفق یا تأیید انصراف): اول ورودی نگهبان
  // را از history برمی‌داریم تا دکمهٔ برگشت بعداً گیر نکند، بعد ناوبری انجام می‌شود.
  const leaveForm = (go: () => void) => {
    dirtyRef.current = false;
    (window as unknown as { __tourFormDirty?: boolean }).__tourFormDirty = false;
    setDirty(false);
    const state = window.history.state as { __tourFormGuard?: boolean } | null;
    if (guardPushedRef.current && state?.__tourFormGuard) {
      guardPushedRef.current = false;
      pendingAfterPopRef.current = go;
      window.history.back();
    } else {
      guardPushedRef.current = false;
      go();
    }
  };
  // گیت انتشار (موج ۱، قلم ۲): دیالوگ ناقصی‌ها / دیالوگ تأیید انتشار.
  const [missingChecks, setMissingChecks] = useState<PublishCheck[] | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  // قلم ۴ موج ۱: دیالوگ سؤال «همه پیش‌نویس» — وقتی لغو انتشارِ این تور شمار
  // منتشرشده‌ها را به صفر می‌رساند و مدیر هنوز جواب نداده، همان لحظه باز می‌شود.
  const [askFallbackOpen, setAskFallbackOpen] = useState(false);

  // Initial State mapping
  const [formData, setFormData] = useState<TourInput>(() => {
    return {
      slug: initial?.slug || '',
      title: initial?.title || '',
      type: initial?.type || 'foreign',
      typeLabel: initial?.typeLabel || 'تور آماده',
      destinationSlugs: Array.isArray(initial?.destinationSlugs) 
        ? (initial.destinationSlugs as string[]) 
        : [],
      destination: initial?.destination || '',
      // پیش‌فرض هوشمند مبدأ (T5): آخرین مبدأ استفاده‌شده یا تنها مبدأ فعال.
      origin: initial?.origin || smartOriginDefault(origins),
      route: initial?.route || '',
      duration: buildDurationFromNights(initial?.nights) || (initial?.duration || ''),
      nights: Number(initial?.nights) || 0,
      closestDeparture: initial?.closestDeparture || '',
      price: Number(initial?.price) || 0,
      status: initial?.status || 'pending',
      statusLabel: initial?.statusLabel || 'در انتظار تأیید ظرفیت',
      // شرایط انتشار (مایگریشن 0011): پیش‌فرض همیشه پیش‌نویس؛ «انتشار» فقط با دکمهٔ خودش.
      publishStatus: initial?.publishStatus === 'published' ? 'published' : 'draft',
      image: initial?.image || '',
      badge: initial?.badge || '',
      visaRequired: Boolean(initial?.visaRequired),
      airline: initial?.airline || '',
      includedServices: Array.isArray(initial?.includedServices) ? (initial.includedServices as string[]) : [],
      excludedServices: Array.isArray(initial?.excludedServices) ? (initial.excludedServices as string[]) : [],
      hotelOptions: Array.isArray(initial?.hotelOptions) ? (initial.hotelOptions as any[]) : [],
      description: initial?.description || '',
      // تیم «فرم تورها» (۱۴۰۵/۰۷/۱۱): فیلدهای غنی/سئوی سطح تور.
      descriptionRich: initial?.descriptionRich ?? null,
      faqs: Array.isArray(initial?.faqs) ? (initial.faqs as TourFaqItem[]) : [],
      whyThisTourRich: initial?.whyThisTourRich ?? null,
      metaTitle: initial?.metaTitle ?? '',
      metaDescription: initial?.metaDescription ?? '',
      // قلم ۳ موج ۰: شیوهٔ سفر فقط از مقدار ذخیره‌شده می‌آید — هیچ حدس regex از
      // روی نام ایرلاین و هیچ پیش‌فرض حدسی. تور تازه در مرحلهٔ ۱ صریح انتخاب می‌شود.
      transportKind: initial?.transportKind,
      carrierName: initial?.airline || '',
      // موج ۲، تیم تکراری‌ها: نشان یک کنترل واحد شد؛ هر نشانِ ذخیره‌شده‌ای
      // (تضمین‌شده یا متن سفارشی قدیمی) تیک را روشن می‌کند تا بی‌صدا گم نشود.
      guaranteedDeparture: Boolean(initial?.badge),
      itineraryDays: Array.isArray(initial?.itineraryDays)
        ? (initial.itineraryDays as TourItineraryDayItem[])
        : [],
      trustSpecs: {
        returnGuarantee: initial?.trustSpecs?.returnGuarantee || '',
        cityTax: initial?.trustSpecs?.cityTax || '',
        tipsNote: initial?.trustSpecs?.tipsNote || '',
        luggageKg: ((): number => {
          const v: unknown = initial?.trustSpecs?.luggageKg;
          return v === '' || v == null ? 30 : Number(v);
        })(),
        activityLevel: initial?.trustSpecs?.activityLevel || 'easy',
        requiredDocs: Array.isArray(initial?.trustSpecs?.requiredDocs)
          ? (initial.trustSpecs.requiredDocs as string[])
          : [],
      },
      consultantSpec: {
        name: initial?.consultantSpec?.name || '',
        title: initial?.consultantSpec?.title || '',
        phone: initial?.consultantSpec?.phone || '',
        audioUrl: initial?.consultantSpec?.audioUrl || '',
        emergencyPhone: initial?.consultantSpec?.emergencyPhone || '',
      },
      // موج ۳ (رفع باگ ۱۴۰۵/۰۷/۱۱): بلوک مالی هم از تورِ در حال ویرایش
      // بارگذاری می‌شود؛ وگرنه بعد از ریلود خالی نشان می‌داد و ذخیرهٔ بعدی
      // بی‌صدا مقدار دیتابیس را با خالی رونویسی می‌کرد.
      financialSpecs: {
        cancellationTiers: Array.isArray(initial?.financialSpecs?.cancellationTiers)
          ? (initial.financialSpecs.cancellationTiers as TourCancellationTier[])
          : [],
        visaRejectionNote: initial?.financialSpecs?.visaRejectionNote || '',
        depositAmount: initial?.financialSpecs?.depositAmount || '',
        depositDeadline: initial?.financialSpecs?.depositDeadline || '',
      } as TourFinancialSpecsItem,
      // موج ۳ (همان باگ): مشخصات پرواز هم باید از اول در فرم بنشیند.
      flightDetails: initial?.flightDetails ?? undefined,
      // موج ۴: تورلیدر، نظر مسافران، گالری واقعی.
      leaderId: initial?.leaderId ?? null,
      gallery: Array.isArray(initial?.gallery) ? (initial.gallery as TourGalleryItem[]) : [],
      reviews: Array.isArray(initial?.reviews) ? (initial.reviews as TourReviewItem[]) : [],
    };
  });

  // ایراد ۹: نسخهٔ کلاینتیِ تشخیص «داخلی بودن» مقصد از روی درخت مقصدها؛
  // همان منطق سمت سرور (tours/actions.ts) با منبع یگانهٔ src/lib/domestic.
  const isDomesticSlugClient = useMemo(() => {
    // نکته: نام Mapِ لوسیید (آیکون) روی Map سراسری سایه انداخته؛ پس آبجکت ساده.
    const bySlug: Record<string, { slug: string; name: string; parent: string }> = {};
    for (const d of tree?.all ?? []) bySlug[d.slug] = { slug: d.slug, name: d.name, parent: d.parent };
    return (slug: string): boolean => {
      if (DOMESTIC_SLUGS.includes(slug)) return true;
      let cur = bySlug[slug];
      if (!cur) return false;
      if (DOMESTIC_NAME_RE.test(cur.name)) return true;
      for (let i = 0; i < 10 && cur; i++) {
        if (cur.slug === 'iran') return true;
        const p = cur.parent ?? '';
        if (!p) return false;
        if (p === 'iran' || DOMESTIC_SLUGS.includes(p)) return true;
        cur = bySlug[p];
        if (cur && DOMESTIC_NAME_RE.test(cur.name)) return true;
      }
      return false;
    };
  }, [tree]);

  const updateFormData = (fields: Partial<TourInput>) => {
    // نامک که عوض شد، پرچم تداخل قبلی بی‌اعتبار است.
    if (fields.slug !== undefined) setSlugConflict(false);
    // هر تغییری فرم را کثیف می‌کند (برای دیالوگ انصراف، T11).
    setDirty(true);
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      // ایراد ۹: با تغییر مقصدها، تیک «نیاز به ویزا» خودکار به‌روز می‌شود،
      // مگر این‌که مدیر خودش تیک را زده یا برداشته باشد (visaRequiredManual).
      // این‌طوری چیزی که مدیر در مرحله ۴ می‌بیند همان چیزی است که ذخیره می‌شود
      // و مدارک پیش‌فرض هم همیشه با همان مقدار ساخته می‌شوند.
      if (fields.destinationSlugs !== undefined && !prev.visaRequiredManual) {
        next.visaRequired = guessVisaRequired(fields.destinationSlugs ?? [], isDomesticSlugClient);
      }
      return next;
    });
  };

  // گیت انتشار + تیک‌های واقعی تکمیل هر مرحله (موج ۱، قلم ۲): تیک هر مرحله
  // از همین چک‌های گیت می‌آید — نه تزئینی، نه محاسبه‌ای جدا از گیت.
  const readiness = useMemo(() => checkPublishReadiness(formData), [formData]);
  const stageDone = useMemo(() => stageTicksFromGate(readiness), [readiness]);

  // Validation
  const errors = useMemo(() => {
    return touched
      ? validateDraft({
          title: formData.title,
          slug: formData.slug,
          price: formData.price,
          destinations: formData.destinationSlugs.length,
          origin: formData.origin,
        })
      : {};
  }, [formData, touched]);

  // Handle Save
  /**
   * دکمهٔ «انتشار» اول گیت را صدا می‌زند (موج ۱، قلم ۲): اگر ناقصی هست،
   * دیالوگ فهرست ناقصی‌ها با ارجاع به مرحلهٔ مربوط و انتشار انجام نمی‌شود؛
   * وگرنه دیالوگ تأیید با نام تور + جملهٔ «بعد از انتشار روی سایت دیده می‌شود».
   */
  const requestPublish = () => {
    setTouched(true);
    const gate = checkPublishReadiness(formData);
    if (!gate.ready) {
      setMissingChecks(gate.missing);
      return;
    }
    setShowPublishConfirm(true);
  };

  /**
   * نیت ذخیره:
   * - 'draft': ذخیره به‌عنوان پیش‌نویس (روی سایت دیده نمی‌شود)
   * - 'published': انتشار (روی سایت دیده می‌شود)
   * - 'keep': ذخیرهٔ تغییرات بدون دست‌کاری وضعیت انتشار
   */
  const handleSave = async (intent: 'draft' | 'published' | 'keep') => {
    setTouched(true);
    const draftErrors = validateDraft({
      title: formData.title,
      slug: formData.slug,
      price: formData.price,
      destinations: formData.destinationSlugs.length,
      origin: formData.origin,
    });

    if (Object.keys(draftErrors).length > 0) {
      toast({
        title: 'اطلاعات تور ناقص است',
        description: 'لطفاً فیلدهای الزامی مرحله اول (عنوان، آدرس اینترنتی، مقصد و قیمت پایه) را کامل کنید.',
        variant: 'error',
      });
      setActiveStage(1);
      // گشت (ایراد ۴): خطا نباید جایی گم شود که دیده نشود؛ اسکرول به مرحلهٔ اول.
      requestAnimationFrame(() => {
        document.getElementById('tour-stage-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    startTransition(async () => {
      try {
        const slugCheck = await checkSlugUnique(formData.slug, editingId);
        if (!slugCheck.unique) {
          setSlugConflict(true);
          toast({
            title: 'آدرس اینترنتی تکراری است',
            description: 'این آدرس اینترنتی قبلاً برای تور دیگری استفاده شده است.',
            variant: 'error',
          });
          setActiveStage(1);
          requestAnimationFrame(() => {
            document.getElementById('tour-stage-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
          return;
        }

        const nextPublish: 'draft' | 'published' =
          intent === 'keep' ? formData.publishStatus : intent;
        // نیت صریح به saveTour می‌رسد تا گیت انتشار فقط روی «انتشار» قفل شود،
        // نه روی ذخیرهٔ سادهٔ تورِ منتشرشده (باگ بحرانی موج ۱، ۱۴۰۵/۰۷/۱۱).
        const res = await saveTour(editingId ?? null, { ...formData, publishStatus: nextPublish }, intent);
        // خطای قابل‌پیش‌بینی به‌صورت مقدار برمی‌گردد (نه throw) تا پیام واقعی‌اش
        // در پروداکشن گم نشود — ریشهٔ bugfix-441.
        // نکته: این پروژه strict:false است و narrow روی !res.ok کار نمی‌کند؛ پس === false صریح.
        if (res.ok === false) {
          toast({
            title: 'خطا در ثبت تور',
            description: res.error,
            variant: 'error',
          });
          return;
        }
        updateFormData({ publishStatus: nextPublish });
        // مبدأ استفاده‌شده را نگه دار تا تور بعدی همان را پیش‌فرض بگیرد (T5).
        if (formData.origin.trim()) {
          try { localStorage.setItem(LAST_ORIGIN_KEY, formData.origin.trim()); } catch { /* رد شو */ }
        }

        const tourTitle = formData.title.trim();
        if (intent === 'published') {
          toast({
            title: 'تور منتشر شد',
            description: `تور «${tourTitle}» ذخیره شد و روی سایت دیده می‌شود.`,
          });
        } else if (intent === 'draft' && formData.publishStatus === 'published') {
          toast({
            title: 'انتشار لغو شد',
            description: `تور «${tourTitle}» دیگر روی سایت دیده نمی‌شود.`,
          });
          // قلم ۴ موج ۱: اگر با این لغو انتشار هیچ تور منتشرشده‌ای نماند و
          // مدیر هنوز جواب نداده، دیالوگ سؤال همان لحظه باز می‌شود.
          if (res.publishedRemaining === 0) {
            try {
              const answer = await getAllDraftFallbackAnswer();
              if (answer === null) setAskFallbackOpen(true);
            } catch {
              // خطا در خواندن جواب → بنر صفحهٔ تورها سؤال را یادآوری می‌کند.
            }
          }
        } else if (intent === 'draft') {
          toast({
            title: editingId ? 'پیش‌نویس ذخیره شد' : 'پیش‌نویس ثبت شد',
            description: `تور «${tourTitle}» به‌صورت پیش‌نویس ذخیره شد و روی سایت دیده نمی‌شود.`,
          });
        } else {
          toast({
            title: editingId ? 'تور به‌روزرسانی شد.' : 'تور تازه ساخته شد.',
            description: `تور «${tourTitle}» ذخیره شد.`,
          });
          // صداقت بعد از رفع باگ موج ۱ (۱۴۰۵/۰۷/۱۱): ذخیرهٔ سادهٔ تورِ منتشرشده
          // دیگر گیت نمی‌خورد؛ اگر ویرایش تور را ناقص کرده، مدیر باید بداند —
          // بی‌صدا نمی‌ماند.
          if (intent === 'keep' && nextPublish === 'published') {
            const gateNow = checkPublishReadiness(formData);
            if (!gateNow.ready) {
              toast({
                title: 'توجه: تور منتشرشده ناقص است',
                description: `تغییرات ذخیره شد، ولی این قلم‌ها ناقص‌اند: ${gateNow.missing.map((c) => c.label).join('، ')}.`,
                variant: 'warning',
              });
            }
          }
        }
        // ذخیره موفق شد — دیگر «تغییر ذخیره‌نشده» نیست (هشدار خروج بی‌مورد ندهد).
        leaveForm(() => onDone(res.id));
      } catch (err: unknown) {
        // خطای واقعاً غیرمنتظره: در پروداکشن err.message همان «Minified React error #441»
        // است و به کاربر چیزی نمی‌گوید؛ پس پیام عمومی نشان بده و جزئیات را لاگ کن.
        const digest = err instanceof Error ? (err as { digest?: string }).digest : undefined;
        console.error('[tour-save] unexpected error', digest ? { digest } : err);
        toast({
          title: 'خطا در ثبت تور',
          description: safeErrorMessage(err, 'ذخیره انجام نشد؛ اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'),
          variant: 'error',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* نوار وضعیت انتشار + مشاهده در سایت (شرایط انتشار، مایگریشن 0011) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant={formData.publishStatus === 'published' ? 'success' : 'warning'}>
            {formData.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
          </Badge>
          <span className="text-caption text-muted-foreground">
            {formData.publishStatus === 'published'
              ? 'این تور روی سایت دیده می‌شود.'
              : 'پیش‌نویس روی سایت دیده نمی‌شود.'}
          </span>
        </div>
        {formData.slug.trim() ? (
          formData.publishStatus === 'published' ? (
            <a href={`/tour/${formData.slug.trim()}`} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="size-4" />
                مشاهده در سایت
              </Button>
            </a>
          ) : (
            <span className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" disabled title="مشاهده در سایت پس از انتشار فعال می‌شود">
                <ExternalLink className="size-4" />
                مشاهده در سایت
              </Button>
              <span className="text-caption text-muted-foreground">پس از انتشار فعال می‌شود.</span>
            </span>
          )
        ) : (
          <span className="text-caption text-muted-foreground">
            برای مشاهده در سایت، اول آدرس اینترنتی (مرحلهٔ ۱) را وارد کنید.
          </span>
        )}
      </div>

      {/* استپر مراحل (موج ۵): موبایل/تبلت = نوار مرحلهٔ فعلی + شیت انتخاب؛ دسکتاپ = استپر افقی */}
      <StageStepper
        stages={STAGES}
        activeStage={activeStage}
        onSelect={(id) => setActiveStage(id)}
        isPassed={(id) => (id === 7 ? readiness.ready : stageDone[id - 1])}
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Active Stage Body */}
        {/* یافتهٔ ۲ مبتدی (ریشه‌ای): نوار چسبان پایین وسط اسکرول روی محتوا می‌ایستاد؛
            حاشیهٔ پایین به‌اندازهٔ ارتفاع نوار تا هیچ کنترلی زیر آن گیر نکند. */}
        <div className={cn(showLivePreview ? "xl:col-span-8" : "xl:col-span-12", "space-y-6", "pb-28")}>
          {activeStage === 1 && (
            <Stage1Identity
              data={formData}
              onChange={updateFormData}
              errors={slugConflict ? { ...errors, slug: 'این آدرس اینترنتی قبلاً برای تور دیگری استفاده شده است.' } : errors}
              tree={tree}
              origins={origins}
              excludeTourId={editingId ?? null}
            />
          )}

          {activeStage === 2 && (
            <Stage2Hotels
              data={formData}
              onChange={updateFormData}
              hotels={hotels}
              tree={tree}
            />
          )}

          {activeStage === 3 && (
            <Stage3Itinerary
              data={formData}
              onChange={updateFormData}
            />
          )}

          {activeStage === 4 && (
            <Stage4TrustTerms
              data={formData}
              onChange={updateFormData}
              excludeTourId={editingId ?? null}
            />
          )}

          {activeStage === 5 && (
            <Stage5Consultant
              data={formData}
              onChange={updateFormData}
              excludeTourId={editingId ?? null}
            />
          )}

          {activeStage === 6 && (
            <Stage6Financial
              data={formData}
              onChange={updateFormData}
              excludeTourId={editingId ?? null}
            />
          )}

          {activeStage === 7 && (
            <Stage7Experience data={formData} onChange={updateFormData} />
          )}

          {activeStage === 8 && (
            <StageFinalStation
              data={formData}
              priceNoteDefault={priceNoteDefault}
              tree={tree}
              onGoToStage={(s) => setActiveStage(s)}
              // انتشارِ گیت‌دار: همان مسیر دکمهٔ «انتشار» نوار چسبان (قلم ۲).
              onRequestPublish={requestPublish}
              onSaveIntent={(intent) => handleSave(intent)}
            />
          )}

          {/* داک شناور پایین ویرایشگر — آیکونی، جمع‌وجور، محکم چسبیده به کف
              ویوپورت ولی با گردی و سایه کاملاً از صفحه جدا و شناور؛
              در موبایل و دسکتاپ یکسان. */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5">
            <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border/70 bg-card/95 p-1.5 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.28)] backdrop-blur-md">
              {/* ناوبری مرحله */}
              <DockBtn
                title="مرحله قبلی"
                disabled={activeStage === 1}
                onClick={() => {
                  const i = STAGE_ORDER.indexOf(activeStage);
                  setActiveStage(STAGE_ORDER[Math.max(0, i - 1)]);
                }}
              >
                <ChevronRight className="size-5" />
              </DockBtn>
              <DockBtn
                title="مرحله بعدی"
                disabled={activeStage === 8}
                onClick={() => {
                  const i = STAGE_ORDER.indexOf(activeStage);
                  setActiveStage(STAGE_ORDER[Math.min(STAGE_ORDER.length - 1, i + 1)]);
                }}
              >
                <ChevronLeft className="size-5" />
              </DockBtn>
              <DockBtn
                title={showLivePreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش تغییرات'}
                active={showLivePreview}
                onClick={() => setShowLivePreview(!showLivePreview)}
              >
                <Eye className="size-5" />
              </DockBtn>

              <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />

              {/* اکشن‌ها */}
              <DockBtn
                title="انصراف"
                onClick={() => {
                  if (dirty) setShowCancelConfirm(true);
                  else (onCancel ?? onDone)();
                }}
              >
                <X className="size-5" />
              </DockBtn>

              {(!editingId || formData.publishStatus === 'draft') ? (
                <>
                  <DockBtn
                    title={editingId ? 'ذخیره پیش‌نویس' : 'ثبت پیش‌نویس'}
                    disabled={isPending}
                    onClick={() => handleSave('draft')}
                  >
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                  </DockBtn>
                  <DockBtn
                    primary
                    disabled={isPending || !readiness.ready}
                    // یافتهٔ ۳ مبتدی: دعوت زودهنگام به انتشار حس بدی می‌دهد؛ تا وقتی
                    // تور قابل‌انتشار نیست دکمه غیرفعالِ توضیح‌دار است (نه پنهان).
                    title={
                      readiness.ready
                        ? 'انتشار'
                        : `برای انتشار، اول این قلم‌ها را کامل کن: ${readiness.missing.map((c) => c.label).join('، ')}`
                    }
                    onClick={requestPublish}
                  >
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  </DockBtn>
                </>
              ) : (
                <>
                  <DockBtn
                    danger
                    title="لغو انتشار"
                    disabled={isPending}
                    onClick={() => handleSave('draft')}
                  >
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : <EyeOff className="size-5" />}
                  </DockBtn>
                  <DockBtn
                    primary
                    title="ذخیره تغییرات"
                    disabled={isPending}
                    onClick={() => handleSave('keep')}
                  >
                    {isPending ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                  </DockBtn>
                </>
              )}
            </div>
          </div>
          {/* فاصلهٔ نگه‌دارنده: داک شناور fixed است و نباید محتوای
              پایانی فرم زیر آن برود */}
          <div aria-hidden="true" className="h-28" />
        </div>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-sm border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-foreground">پیش‌نمایش کارت تور در سایت</span>
                <span className="text-caption text-muted-foreground">مشاهده زنده</span>
              </div>

              <div className="overflow-hidden rounded-sm border border-border/80 bg-background">
                {formData.image ? (
                  // عمداً همان SmartImageِ سایت: اگر آدرس روی سایت باز نشود، این‌جا هم خراب دیده می‌شود.
                  <div className="relative aspect-video">
                    <SmartImage src={formData.image} alt={formData.title} className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    بدون تصویر
                  </div>
                )}

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-bold text-brand">
                      {formData.carrierName || formData.airline || 'هوایی'}
                    </span>
                    {formData.badge && (
                      <span className="rounded-sm bg-brand/10 text-brand px-2 py-0.5 text-caption font-bold">
                        {formData.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {formData.title || 'عنوان تور…'}
                  </h4>

                  <div className="text-caption text-muted-foreground flex items-center justify-between">
                    <span>{formData.duration || 'مدت اقامت نامشخص'}</span>
                    <span>{formData.origin ? `از ${formData.origin}` : 'مبدأ نامشخص'}</span>
                  </div>

                  <div className="border-t border-border/50 pt-2 flex items-baseline justify-between">
                    <span className="text-caption text-muted-foreground">شروع قیمت از:</span>
                    <div className="text-start font-bold text-foreground">
                      <span className="text-sm font-black">{faNumber(Number(formData.price) || 0)}</span>
                      <span className="text-caption text-muted-foreground me-1">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* انصراف با فرم کثیف (T11): تغییرات ذخیره‌نشده از دست می‌رود. */}
      <AlertDialog
        open={showCancelConfirm}
        onOpenChange={(open) => !open && setShowCancelConfirm(false)}
        title="بدون ذخیره خارج می‌شوید؟"
        description="تغییرات ذخیره‌نشده از دست می‌رود."
        confirmText="خارج شوید"
        cancelText="بازگشت"
        onConfirm={() => { setShowCancelConfirm(false); leaveForm(() => (onCancel ?? onDone)()); }}
      />

      {/* یافتهٔ ۱۴ مبتدی: خروج از لینک داخلی یا دکمهٔ برگشت مرورگر با فرم کثیف. */}
      <AlertDialog
        open={showExitConfirm}
        onOpenChange={(open) => { if (!open) { setShowExitConfirm(false); pendingHrefRef.current = null; } }}
        title="بدون ذخیره خارج می‌شوید؟"
        description="تغییرات ذخیره‌نشدهٔ این تور از دست می‌رود."
        confirmText="خارج شوید"
        cancelText="بمانید"
        onConfirm={() => {
          const href = pendingHrefRef.current;
          pendingHrefRef.current = null;
          if (href) {
            // خروج تأییدشده از راه لینک داخلی: همان ناوبری کامل لینک.
            suppressUnloadRef.current = true;
            guardPushedRef.current = false;
            window.location.assign(href);
          } else {
            // خروج تأییدشده با دکمهٔ برگشت مرورگر.
            allowBackRef.current = true;
            guardPushedRef.current = false;
            window.history.back();
          }
        }}
      />

      {/* گیت انتشار (موج ۱، قلم ۲): ناقصی‌ها با ارجاع به مرحلهٔ مربوط، تأیید با نام تور */}
      {missingChecks && (
        <MissingChecksDialog
          open
          onOpenChange={(open) => !open && setMissingChecks(null)}
          missing={missingChecks}
          onGoToStage={(stageId) => setActiveStage(stageId as StageId)}
        />
      )}
      <PublishConfirmDialog
        open={showPublishConfirm}
        onOpenChange={setShowPublishConfirm}
        tourTitle={formData.title.trim()}
        onConfirm={() => handleSave('published')}
      />
      {/* قلم ۴ موج ۱: دیالوگ سؤال «همه پیش‌نویس» */}
      <AllDraftFallbackDialog
        open={askFallbackOpen}
        onOpenChange={setAskFallbackOpen}
        onSaved={() => toast({ title: 'ذخیره شد' })}
      />
    </div>
  );
}
