'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Compass, 
  Plane, 
  Train, 
  Bus, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X, 
  Check as CheckIcon,
  Sparkles,
  MapPin,
  Building,
  Search,
  Info,
  Plus,
  RefreshCw,
  ImagePlus,
  Loader2,
  Trash2,
  Link2,
  FileCheck2
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AmountInput } from '@/components/ui/amount-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { buildDurationFromNights } from '@/src/lib/tour-format';
import { cn, fa, formatToman } from '@/lib/utils';
import { normalizeFaSearch } from '@/lib/persian';
import { faToSlugFa, CAPACITY_OPTIONS } from '../tour-helpers';
import { DepartureDateField } from '../DepartureDateField';
import { uploadTourBanner } from '../banner-upload';
import SmartImage from '@/src/components/SmartImage';
import type { DestinationTree, OriginRow, TourInput, TourCategorySuggestion, TourPriceSuggestion } from '../actions';
import { getDestinationContent, getTourCategorySuggestion, getTourPriceSuggestion, checkTourRichCols, checkTourMetaCols } from '../actions';
import { SmartSuggestion } from '../SmartSuggestion';
import type { TourDraftErrors } from '../tour-helpers';
import { safeErrorMessage } from '@/src/lib/error-message';
// تیم «فرم تورها» (۱۴۰۵/۰۷/۱۱): ویرایشگر غنی توضیحات تور + پیش‌نمایش واقعی +
// متای سئو با الگوی «نگهبان + اطلاع» برای ستون‌های 0030/0033.
import { RichEditor } from '@/components/ui/rich-editor/RichEditor';
import { RichText } from '@/components/ui/rich-editor/RichText';
import { SeoMetaFields } from '@/components/ui/seo-meta-fields';
import { ColumnNotice, useColumnGuard } from '@/components/ui/column-guard';
import { mediaTag } from '@/components/ui/media-library/types';
import { openMediaPicker } from '@/components/ui/media-library/openMediaPicker';
import {
  normalizeRichValue,
  richFallback,
  richFromPlainText,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';

interface Stage1IdentityProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  errors: TourDraftErrors;
  tree: DestinationTree;
  origins: OriginRow[];
  /** شناسهٔ تور در حال ویرایش؛ پیشنهادها خودش را منبع حساب نمی‌کنند. */
  excludeTourId?: string | null;
}

const TYPE_OPTIONS = [
  { value: 'foreign', label: 'تور خارجی (آماده)' },
  { value: 'domestic', label: 'تور داخلی (گروهی یا انفرادی)' },
  { value: 'exhibition', label: 'تور نمایشگاهی و تجاری' },
];

const TRANSPORT_OPTIONS: Array<{ id: 'air' | 'land' | 'rail' | 'sea' | 'mixed'; label: string; icon: typeof Plane; placeholder: string }> = [
  { id: 'air', label: 'هوایی (پرواز)', icon: Plane, placeholder: 'نام ایرلاین (مثلاً: ماهان، ایران‌ایر، ترکیش)' },
  { id: 'rail', label: 'ریلی (قطار)', icon: Train, placeholder: 'نام قطار و شرکت ریلی (مثلاً: ۵ ستاره فدک، بن‌ریل، رجاء)' },
  { id: 'land', label: 'زمینی (اتوبوس)', icon: Bus, placeholder: 'نوع اتوبوس (مثلاً: اتوبوس VIP ۲۵ نفره تخت‌شو)' },
];

function countryDescendants(regionSlug: string, countrySlug: string, tree: DestinationTree): string[] {
  const region = tree.regions.find((r) => r.slug === regionSlug);
  const country = region?.countries.find((c) => c.slug === countrySlug);
  if (!country) return [countrySlug];
  return [country.slug, ...country.cities.map((c) => c.slug)];
}

export default function Stage1Identity({
  data,
  onChange,
  errors,
  tree,
  origins,
  excludeTourId,
}: Stage1IdentityProps) {
  // قلم ۳ موج ۰: شیوهٔ حمل‌ونقل انتخاب صریح مدیر است — نه حدس regex از روی
  // نام شرکت مجری، نه هیچ پیش‌فرض دیده‌شونده. تا انتخاب نشود هیچ دکمه‌ای فعال نیست.
  const currentTransport = data.transportKind;

  const selectedSlugs = Array.isArray(data.destinationSlugs) ? data.destinationSlugs : [];
  const nameBySlug = new Map(tree.all.map((a) => [a.slug, a.name]));

  // تیم ۳ (موج ۶، ایراد ۴): فقط نام کشورِ بازشده نگه داشته می‌شود؛
  // مرور دسته‌بندی‌شدهٔ مقصدها تک‌آکاردئونی است تا پنل جمع‌وجور بماند.
  const [openCountry, setOpenCountry] = useState<string | null>(null);
  // تأیید افزودن دسته‌ای کشور (گزارش QC موج ۶): یک کلیک ده‌ها مقصد
  // اضافه می‌کند؛ بدون تأیید خطرناک است.
  const [bulkCountry, setBulkCountry] = useState<{ name: string; slugs: string[] } | null>(null);
  // نامک خودکار: تا وقتی کاربر دستی به نامک دست نزده و نامکی هم از قبل ثبت نشده،
  // با هر نویسهٔ عنوان از نو ساخته می‌شود (گشت، ایراد ۳: قبلاً فقط نویسهٔ اول می‌ماند و «t» می‌شد).
  const [slugAuto, setSlugAuto] = useState(() => !data.slug);
  const [destQuery, setDestQuery] = useState('');
  // تیم ۳ (موج ۶، ایراد ۴): پیکر مقصد به‌صورت پیش‌فرض بسته است؛
  // نمای اصلی فقط چیپ‌های مرتب‌شدهٔ مسیر سفر است.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [capacity, setCapacity] = useState('');
  const { toast } = useToast();

  // تیم «فرم تورها»: نگهبان ستون‌های تازه — غنی (0030) و سئو (0033)؛ هر دو
  // هنوز اجرا نشده‌اند. اگر ستون‌ها در دیتابیس نباشند، کنار همان فیلدها یک
  // اطلاع صادقانه نشان داده می‌شود تا ویرایشی گم نشود (الگوی lib/column-guard.ts).
  const richColsReady = useColumnGuard(checkTourRichCols);
  const metaColsReady = useColumnGuard(checkTourMetaCols);

  /**
   * مقدار اولیهٔ ویرایشگر توضیحات: اگر نسخهٔ غنی هست همان؛ وگرنه متن تختِ
   * قدیمی به یک سند تایپ‌تپ تبدیل می‌شود تا با اولین ویرایش، متن قدیم
   * از بین نرود (همان مسیر مهاجرت گزارش ممیزی).
   */
  const descriptionEditorValue: JSONContent =
    normalizeRichValue(data.descriptionRich) ?? richFromPlainText(data.description || '');

  /** تغییر متن غنی → متن تختِ `description` هم از همان ساخته می‌شود (ستون
      قدیمی notNull است و گیت انتشار/سایت/کد main روی آن حساب می‌کنند). */
  const onDescriptionRichChange = (json: JSONContent) => {
    onChange({ descriptionRich: json, description: richToPlainText(json) });
  };

  // عکس داخل متن توضیحات از کتابخانهٔ رسانه (تگ تور).
  const pickDescriptionImage = () =>
    openMediaPicker({ tag: mediaTag('tour', data.slug), title: 'انتخاب عکس برای متن توضیحات' });

  /**
   * پیشنهادهای هوشمند از مقصد (موج ۱، قلم ۶ — فرصت‌های ۱-۴ و ۱-۵ ممیزی):
   * وقتی دقیقاً یک مقصد انتخاب شده و تور بنر یا توضیح ندارد، محتوای آمادهٔ
   * همان مقصد پیشنهاد می‌شود — با پیش‌نمایش و تأیید صریح، نه بی‌صدا.
   * قانون طلایی: اگر مقصد محتوایی نداشت، چیزی حدس زده نمی‌شود.
   */
  const singleDestSlug = selectedSlugs.length === 1 ? selectedSlugs[0] : null;
  const needBanner = !data.image.trim();
  const needDesc = !data.description.trim();
  const [destContent, setDestContent] = useState<{
    name: string;
    image: string;
    heroTagline: string;
    description: string;
  } | null>(null);
  const [dismissedBannerFor, setDismissedBannerFor] = useState<string | null>(null);
  const [showDescPreview, setShowDescPreview] = useState(false);
  useEffect(() => {
    if (!singleDestSlug || (!needBanner && !needDesc)) {
      setDestContent(null);
      return;
    }
    let alive = true;
    getDestinationContent(singleDestSlug)
      .then((c) => {
        if (alive) setDestContent(c);
      })
      .catch(() => {
        if (alive) setDestContent(null);
      });
    return () => {
      alive = false;
    };
  }, [singleDestSlug, needBanner, needDesc]);

  /**
   * پیشنهادهای هوشمند موج ۲ — قانون طلایی: فقط پیشنهاد با «پذیرفتن»/«رد»؛
   * تا مدیر تأیید نکند هیچ فیلدی عوض نمی‌شود. اگر داده‌ای نباشد، چیزی نشان داده نمی‌شود.
   */

  // قلم ۱: دسته‌بندی تور از روی category مقصد — فقط وقتی دقیقاً یک مقصد انتخاب شده.
  const [catSuggestion, setCatSuggestion] = useState<TourCategorySuggestion | null>(null);
  const [dismissedCatFor, setDismissedCatFor] = useState<string | null>(null);
  useEffect(() => {
    if (!singleDestSlug) {
      setCatSuggestion(null);
      return;
    }
    let alive = true;
    getTourCategorySuggestion(singleDestSlug)
      .then((s) => {
        if (alive) setCatSuggestion(s);
      })
      .catch(() => {
        if (alive) setCatSuggestion(null);
      });
    return () => {
      alive = false;
    };
  }, [singleDestSlug]);
  const catLabel = TYPE_OPTIONS.find((t) => t.value === catSuggestion?.suggestedType)?.label
    ?? catSuggestion?.suggestedType
    ?? '';
  const catDesc =
    catSuggestion?.suggestedType === 'domestic' ? 'داخلی'
    : catSuggestion?.suggestedType === 'exhibition' ? 'نمایشگاهی'
    : 'خارجی';

  // قلم ۲: آخرین نرخ ثبت‌شده برای همان مقصد — فقط نقطهٔ شروع، وقتی قیمت هنوز خالی است.
  const [priceSuggestion, setPriceSuggestion] = useState<TourPriceSuggestion | null>(null);
  const [dismissedPriceKey, setDismissedPriceKey] = useState<string | null>(null);
  const priceUnset = (Number(data.price) || 0) <= 0;
  useEffect(() => {
    if (!singleDestSlug) {
      setPriceSuggestion(null);
      return;
    }
    let alive = true;
    getTourPriceSuggestion(singleDestSlug, excludeTourId ?? null)
      .then((s) => {
        if (alive) setPriceSuggestion(s);
      })
      .catch(() => {
        if (alive) setPriceSuggestion(null);
      });
    return () => {
      alive = false;
    };
  }, [singleDestSlug, excludeTourId]);
  const priceKey = priceSuggestion ? `${singleDestSlug}:${priceSuggestion.price}` : null;

  // آپلود بنر تور (T6): همان باکت عکس هتل‌ها، کنار فیلد URL.
  const [uploading, setUploading] = useState(false);
  const uploadingRef = useRef(false);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);
  // پولیش موج ۲: لینک دستی بنر پشت تاگل مخفی است، نه عنصر اصلی فرم.
  const [showBannerUrl, setShowBannerUrl] = useState(false);
  // پولیش موج ۲ (تیم پیشرفتهٔ تاشو): «آدرس اینترنتی» فیلد فنی است و مدیر روزمره
  // لازمش ندارد؛ پشت «پیشرفته» و به‌صورت پیش‌فرض بسته می‌ماند. اگر خطای
  // اعتبارسنجی روی آن باشد، بخش خودش باز می‌شود تا خطا دیده شود.
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // کپی لینک بنر (پولیش موج ۲): لینک خام به کاربر نشان داده نمی‌شود؛ فقط کپی.
  const copyBannerLink = async () => {
    const url = data.image.trim();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'لینک تصویر کپی شد' });
    } catch {
      toast({ variant: 'error', title: 'کپی لینک انجام نشد.' });
    }
  };

  const toggleSlug = (slug: string) => {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];
    onChange({ destinationSlugs: next });
  };

  const toggleMany = (slugs: string[]) => {
    const allIncluded = slugs.every((s) => selectedSlugs.includes(s));
    const next = allIncluded
      ? selectedSlugs.filter((s) => !slugs.includes(s))
      : Array.from(new Set([...selectedSlugs, ...slugs]));
    onChange({ destinationSlugs: next });
  };

  // تیم ۳ (موج ۶، ایراد ۴): جابه‌جایی ترتیب مقصد در مسیر سفر — فقط جای دو
  // اسلاگ در آرایهٔ destinationSlugs عوض می‌شود؛ مدل داده همان است،
  // فقط UI ترتیب را قابل‌تغییر کرده. dir منفی یعنی جلوتر در مسیر.
  const moveSlug = (slug: string, dir: 1 | -1) => {
    const i = selectedSlugs.indexOf(slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= selectedSlugs.length) return;
    const next = [...selectedSlugs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ destinationSlugs: next });
  };

  // عنوان که عوض شود، اگر نامک هنوز خودکار است با هر نویسه از روی عنوان
  // بازسازی می‌شود؛ قانون «عنوانِ بعدی نامک موجود را عوض نکند» سر جایش است.
  const handleTitleChange = (v: string) => {
    const patch: Partial<TourInput> = { title: v };
    if (slugAuto) patch.slug = faToSlugFa(v);
    onChange(patch);
  };

  // «بازسازی خودکار از عنوان» (T14): نامک را از روی عنوان می‌سازد و حالت خودکار را
  // دوباره فعال می‌کند تا عنوان‌های بعدی هم نامک را به‌روز کنند.
  const handleSlugRebuild = () => {
    setSlugAuto(true);
    onChange({ slug: faToSlugFa(data.title) });
  };

  const handleBannerFile = async (input: HTMLInputElement | null) => {
    const file = input?.files?.[0];
    input && (input.value = '');
    if (!file || uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await uploadTourBanner(data.slug || 'tour', data.title, fd);
      onChange({ image: res.url });
      toast({ title: 'بنر آپلود شد', description: 'پیش‌نمایشش را پایین می‌بینید.' });
    } catch (e) {
      toast({
        variant: 'error',
        title: 'بنر آپلود نشد',
        description: safeErrorMessage(e, 'دوباره تلاش کنید.'),
      });
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  // گشت (ایراد ۲): سرور «نام فارسی» مبدأ را ذخیره می‌کند ولی آپشن‌های سلکت با اسلاگ کلید خورده بودند؛
  // مقدار نمایشی از روی نام به اسلاگ نگاشت می‌شود و هنگام تغییر، «نام» ذخیره می‌شود (قرارداد نمایشی پایین‌دست).
  // با ایراد ۸ (یک‌نام‌سازی در listOrigins) این نگاشت یک‌به‌یک است.
  const originSlugByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of origins) if (!m.has(o.nameFa)) m.set(o.nameFa, o.slug);
    return m;
  }, [origins]);

  // جست‌وجوی تخت مقصدها: در حالت جست‌وجو به‌جای دریلِ درخت، لیست مستقیم نتایج با انتخاب تک‌کلیکی
  const destSearchQuery = normalizeFaSearch(destQuery);
  const destSearchResults = destSearchQuery
    ? tree.all
        .filter((a) => {
          const t = String(a.type || '').trim().toLowerCase();
          if (t !== 'city' && t !== 'country' && t !== 'region') return false;
          return normalizeFaSearch(a.name).includes(destSearchQuery);
        })
        .slice(0, 30)
    : [];

  // ماشین‌حساب سرانگشتی درآمد: ظرفیت × قیمت پایه (فقط نمایشی، ذخیره نمی‌شود)
  const capacityNum = Number(capacity) || 0;
  const priceNum = Number(data.price) || 0;

  return (
    <div className="space-y-6" id="tour-stage-1">
      {/* Intro info banner — در موبایل می‌شکند تا بنر و سلکت ظرفیت روی هم نیفتند */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <Compass className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله اول: هویت، شیوه حرکت و نرخ پایه</h3>
            <p className="text-xs text-muted-foreground">
              تعیین نام، مقاصد، شیوه ترابری (هوایی، قطار، اتوبوس)، شهر مبدأ و شفافیت کف قیمت
            </p>
          </div>
        </div>
        {/* دوگانگی انتشار/ظرفیت (T4): هر دو با برچسب جدا کنار هم دیده می‌شوند. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span className="text-caption text-muted-foreground">انتشار:</span>
            <Badge variant={data.publishStatus === 'published' ? 'success' : 'warning'}>
              {data.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
            </Badge>
          </span>
          <label className="flex items-center gap-1.5">
            <span className="text-caption text-muted-foreground">وضعیت فروش:</span>
            <Select
              aria-label="وضعیت فروش"
              value={CAPACITY_OPTIONS.some((o) => o.value === data.status) ? data.status : 'pending'}
              onChange={(e) => {
                const val = e.target.value;
                const opt = CAPACITY_OPTIONS.find((s) => s.value === val);
                onChange({ status: val, statusLabel: opt?.label || val });
              }}
              options={CAPACITY_OPTIONS}
              className="h-10 w-auto text-xs max-md:min-h-11 max-md:text-base"
            />
          </label>
        </div>
        {/* یافتهٔ ۱/۱۲ مبتدی: توضیح «وضعیت فروش» در مرحلهٔ ۵ بود ولی انتخابش اینجاست — توضیح به همان‌جا آمد. */}
        <p className="text-caption text-muted-foreground">
          انتشار یعنی تور روی سایت دیده شود؛ «وضعیت فروش» یعنی ثبت‌نام باز است یا بسته، و همین به‌صورت برچسب روی سایت نشان داده می‌شود.
        </p>
      </div>

      {/* Row 1: Title */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12">
          <Field label="عنوان کامل تور *" hint="مثال: تور ۸ روزه روسیه (مسکو + سن‌پترزبورگ) با قطار سریع‌السیر ساپسان">
            <Input
              value={data.title}
              error={errors.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="عنوان تور را شفاف بنویسید…"
              className="font-medium max-md:text-base"
            />
          </Field>
          {/* پیش‌نمایش زندهٔ نامک: با هر نویسهٔ عنوان به‌روز می‌شود؛ تا وقتی دستی
              ویرایش نشده، خودکار است. ویرایش دستی همان بخش «پیشرفته» است. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1" aria-live="polite">
            <span className="text-panel-caption text-muted-foreground">
              آدرس اینترنتی{slugAuto ? ' (خودکار)' : ' (دستی)'}:
            </span>
            <span dir="ltr" className="text-panel-caption text-foreground/80">
              {typeof window !== 'undefined' ? window.location.host : 'rivansafar.ir'}/tour/{data.slug || '…'}
            </span>
            <button
              type="button"
              onClick={() => setAdvancedOpen(true)}
              className="text-panel-caption font-bold text-brand hover:underline"
            >
              ویرایش
            </button>
          </div>
        </div>
      </div>

      {/* آدرس اینترنتی (پولیش موج ۲، تیم پیشرفتهٔ تاشو): فیلد فنی است و مدیر
          روزمره لازمش ندارد — پشت «پیشرفته» و به‌صورت پیش‌فرض بسته. نامک از روی
          عنوان خودکار ساخته می‌شود، پس داده و اعتبارسنجی هیچ فرقی نمی‌کند؛ اگر
          خطای اعتبارسنجی روی آن باشد، بخش خودش باز می‌شود تا خطا دیده شود. */}
      <Collapsible
        trigger={
          <span className="flex flex-col items-start gap-1 text-start">
            <span className="text-xs font-bold text-foreground">تنظیمات پیشرفته</span>
            <span className="text-caption font-normal text-muted-foreground">
              آدرس اینترنتی تور (همان لینکی که تور با آن در سایت باز می‌شود) این‌جاست؛ خودکار از روی عنوان ساخته می‌شود و در کار روزمره نیازی به آن نیست.
            </span>
          </span>
        }
        open={advancedOpen || Boolean(errors.slug)}
        onOpenChange={setAdvancedOpen}
        className="rounded-sm border border-border/70 bg-card px-4 py-3"
      >
        <div className="max-w-xl">
          <Field label="آدرس اینترنتی تور *" hint="همان آدرسی که تور در سایت با آن باز می‌شود؛ از روی عنوان خودکار ساخته می‌شود و فقط حروف انگلیسی، عدد، خط تیره و آندرلاین می‌پذیرد">
            <Input className="max-md:text-base"
              dir="ltr"
              value={data.slug}
              error={errors.slug}
              onChange={(e) => { setSlugAuto(false); onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }); }}
              placeholder="e.g. russia-moscow-stpetersburg-8d"
            />
          </Field>
          <button
            type="button"
            onClick={handleSlugRebuild}
            className="mt-1.5 inline-flex items-center gap-1 text-caption font-bold text-brand hover:underline"
          >
            <RefreshCw className="size-3" />
            بازسازی خودکار از عنوان
          </button>
        </div>
      </Collapsible>

      {/* Row 2: Tour Category & Guaranteed Departure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Field label="دسته‌بندی تور">
            <Select className="max-md:text-base max-md:min-h-11"
              value={data.type}
              onChange={(e) => {
                const val = e.target.value;
                const opt = TYPE_OPTIONS.find((t) => t.value === val);
                onChange({ type: val, typeLabel: opt?.label || val });
              }}
              options={TYPE_OPTIONS}
            />
          </Field>
          {/* قلم ۱ موج ۲: دسته‌بندی پیشنهادی از روی مقصد — فقط پیشنهاد، با پذیرفتن/رد. */}
          {catSuggestion && catSuggestion.suggestedType !== data.type && dismissedCatFor !== singleDestSlug && (
            <div className="mt-2">
              <SmartSuggestion
                title={`دسته‌بندی پیشنهادی: «${catLabel}»`}
                description={`مقصد «${catSuggestion.destName}» ${catDesc} است؛ اگر درست است، دسته‌بندی تور همین شود.`}
                onAccept={() => {
                  onChange({ type: catSuggestion.suggestedType, typeLabel: catLabel });
                  toast({ title: 'دسته‌بندی پیشنهادی گذاشته شد' });
                }}
                onReject={() => setDismissedCatFor(singleDestSlug)}
              />
            </div>
          )}
        </div>

        {/* نشان تور — یک کنترل واحد (موج ۲، تیم تکراری‌ها):
            تیک «حرکت تضمین‌شده» + متن اختیاری که فقط با تیک روشن فعال است.
            متن خالی یعنی همان «حرکت تضمین‌شده». باگ قبلی: متن دستی بی‌صدا تیک را می‌بلعید. */}
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-3 cursor-pointer rounded-sm border border-border bg-card/60 p-3 hover:bg-card transition-colors">
            <input
              type="checkbox"
              checked={Boolean(data.guaranteedDeparture)}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  guaranteedDeparture: checked,
                  badge: checked ? (data.badge || 'حرکت تضمین‌شده') : '',
                });
              }}
              className="size-4 accent-brand rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                حرکت تضمین‌شده و قطعی
                <span
                  title="یعنی این تور حتماً در تاریخ اعلام‌شده حرکت می‌کند؛ تضمینِ قیمت نیست."
                  className="inline-flex cursor-help"
                >
                  <Info className="size-3.5 text-muted-foreground" />
                </span>
              </span>
              <span className="text-caption text-muted-foreground">نشان روی کارت تور</span>
            </div>
          </label>
          <Field
            label="متن نشان (اختیاری)"
            hint={
              data.guaranteedDeparture
                ? 'اگر خالی بماند، «حرکت تضمین‌شده» روی کارت می‌آید.'
                : 'برای نوشتن متن، اول «حرکت تضمین‌شده» را روشن کنید.'
            }
          >
            <Input className="max-md:text-base"
              value={data.badge === 'حرکت تضمین‌شده' ? '' : (data.badge || '')}
              disabled={!data.guaranteedDeparture}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ badge: v.trim() ? v : 'حرکت تضمین‌شده' });
              }}
              placeholder="مثلاً پرواز مستقیم، پیشنهاد ویژه، ویزای فوری"
            />
          </Field>
        </div>
      </div>

      {/* انتخاب مقصدها — چیپ‌های شماره‌دارِ مسیر سفر + یک پیکر جست‌وجوپذیر.
          تیم ۳ (موج ۶، ایراد ۴): سه نمای موازی قبلی (جست‌وجوی همیشه‌باز، تگ‌ها،
          درخت تودرتو) به یک نمای بسته + یک پنل واحد جمع شد. */}
      <div className="rounded-sm border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-panel-label font-bold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            <span>انتخاب مقاصد و شهرهای سفر *</span>
          </label>
          <span className="text-panel-caption text-muted-foreground">
            {selectedSlugs.length > 0 ? `${fa(selectedSlugs.length)} مقصد` : 'حداقل یک مقصد انتخاب کنید'}
          </span>
        </div>
        {/* گشت (ایراد ۴): خطای «مقصد» هیچ‌جا قرمز نشان داده نمی‌شد؛ زیر همان بلوک. */}
        {errors.destinations && (
          <p className="text-panel-caption text-destructive" role="alert">{errors.destinations}</p>
        )}

        {/* مقصدهای انتخاب‌شده: ترتیب چیپ‌ها همان مسیر سفر است؛
            شمارهٔ ترتیب، جابه‌جایی جلو/عقب و حذف روی هر چیپ. */}
        {selectedSlugs.length > 0 && (
          <div>
            <p className="mb-1.5 text-panel-caption text-muted-foreground">ترتیب مقصدها همان مسیر سفر است:</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSlugs.map((slug, i) => {
                const destName = nameBySlug.get(slug) || slug;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-brand/20 bg-brand/10 py-1 pe-1 ps-2 text-panel-caption font-medium text-brand"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-panel-micro tabular-nums text-brand-foreground">
                      {fa(i + 1)}
                    </span>
                    <span>{destName}</span>
                    <span className="flex items-center">
                      <button
                        type="button"
                        onClick={() => moveSlug(slug, -1)}
                        disabled={i === 0}
                        title={`«${destName}» را یک مقصد جلوتر ببر`}
                        aria-label={`«${destName}» را یک مقصد جلوتر ببر`}
                        className="rounded p-1 text-brand/70 transition-colors hover:bg-brand/20 hover:text-brand disabled:invisible"
                      >
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlug(slug, 1)}
                        disabled={i === selectedSlugs.length - 1}
                        title={`«${destName}» را یک مقصد عقب‌تر ببر`}
                        aria-label={`«${destName}» را یک مقصد عقب‌تر ببر`}
                        className="rounded p-1 text-brand/70 transition-colors hover:bg-brand/20 hover:text-brand disabled:invisible"
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSlug(slug)}
                        title={`حذف «${destName}»`}
                        aria-label={`حذف «${destName}»`}
                        className="rounded p-1 text-brand/70 transition-colors hover:bg-brand/20 hover:text-brand"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* پیکر مقصد: یک دکمه که یک پنل واحد را باز می‌کند؛
            بالای پنل جست‌وجو، پایینش مرور دسته‌بندی‌شده (قاره ← کشور ← شهر).
            تیک قارهٔ قبلی (که دیالوگ تأیید B-15 می‌خواست) حذف شد؛ افزودن دسته‌ای
            فقط در سطح کشور است که همان رفتار toggleMany قبلی است. */}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border/80 p-3 text-panel-caption font-bold text-foreground transition-colors hover:bg-accent/40"
        >
          <Plus className="size-4 text-brand" />
          {selectedSlugs.length > 0 ? 'تغییر مقصدها' : 'افزودن مقصد'}
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', pickerOpen && 'rotate-180')} />
        </button>

        {pickerOpen && (
          <div className="overflow-hidden rounded-sm border border-border/70">
            <div className="border-b border-border/60 p-2">
              <div className="relative">
                <Input
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="نام شهر یا کشور را بنویسید… مثلاً: استانبول"
                  className="ps-9 text-xs max-md:text-base"
                />
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {destSearchQuery ? (
                destSearchResults.length === 0 ? (
                  <p className="px-3 py-4 text-center text-panel-caption text-muted-foreground">چیزی پیدا نشد.</p>
                ) : (
                  destSearchResults.map((r) => {
                    const selected = selectedSlugs.includes(r.slug);
                    const parentName = nameBySlug.get(r.parent);
                    return (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => toggleSlug(r.slug)}
                        className={cn(
                          'flex min-h-11 w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-xs transition-colors',
                          selected ? 'bg-brand/10' : 'hover:bg-accent/40'
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2 text-foreground">
                          <MapPin className="size-3.5 shrink-0 text-brand" />
                          <span className="truncate font-medium">{r.name}</span>
                          <span className="truncate text-panel-caption text-muted-foreground">
                            {parentName ? `${parentName} · ` : ''}{r.type === 'city' ? 'شهر' : r.type === 'region' ? 'منطقه' : 'کشور'}
                          </span>
                        </span>
                        {selected
                          ? <CheckIcon className="size-4 shrink-0 text-emerald-600" />
                          : <Plus className="size-4 shrink-0 text-muted-foreground" />}
                      </button>
                    );
                  })
                )
              ) : (
                tree.regions.map((region) => (
                  <div key={region.slug}>
                    <p className="px-2 pb-0.5 pt-2 text-panel-caption font-bold text-muted-foreground">{region.name}</p>
                    {region.countries.map((country) => {
                      const cdesc = countryDescendants(region.slug, country.slug, tree);
                      const addedCount = cdesc.filter((s) => selectedSlugs.includes(s)).length;
                      const allOn = cdesc.length > 0 && addedCount === cdesc.length;
                      const cOpen = openCountry === country.slug;
                      return (
                        <div key={country.slug}>
                          <div className="flex items-center gap-1 py-0.5 pe-1 ps-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                // افزودن دسته‌ای تأیید می‌خواهد (ده‌ها مقصد یک‌جا)؛
                                // برداشتن مستقیم است چون مقصدها همین‌جا دیده می‌شوند.
                                if (allOn) toggleMany(cdesc);
                                else setBulkCountry({ name: country.name, slugs: cdesc });
                              }}
                              title={allOn ? `برداشتن همهٔ «${country.name}»` : `افزودن همهٔ «${country.name}»`}
                              aria-label={allOn ? `برداشتن همهٔ «${country.name}»` : `افزودن همهٔ «${country.name}»`}
                              aria-pressed={allOn}
                              className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-sm border transition-colors',
                                allOn
                                  ? 'border-brand bg-brand text-brand-foreground'
                                  : 'border-input bg-background/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                              )}
                            >
                              {allOn ? <CheckIcon className="size-3.5" /> : <Plus className="size-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenCountry(cOpen ? null : country.slug)}
                              aria-expanded={cOpen}
                              className="flex min-h-11 flex-1 items-center justify-between gap-2 rounded-sm px-1.5 py-2 text-start text-xs font-medium text-foreground transition-colors hover:bg-accent/40"
                            >
                              <span>{country.name}</span>
                              <span className="flex items-center gap-1.5 text-panel-caption text-muted-foreground">
                                {addedCount > 0 && (
                                  <span className="font-bold text-brand">{fa(addedCount)} انتخاب‌شده</span>
                                )}
                                {country.cities.length > 0 && `${fa(country.cities.length)} شهر`}
                                <ChevronDown className={cn('size-3.5 transition-transform', cOpen && 'rotate-180')} />
                              </span>
                            </button>
                          </div>
                          {cOpen && country.cities.length > 0 && (
                            <div className="mb-1 ms-5 space-y-0.5 border-s-2 border-border/50 ps-1">
                              {country.cities.map((city) => {
                                const selected = selectedSlugs.includes(city.slug);
                                return (
                                  <button
                                    key={city.slug}
                                    type="button"
                                    onClick={() => toggleSlug(city.slug)}
                                    className={cn(
                                      'flex min-h-10 w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors',
                                      selected
                                        ? 'bg-brand/10 font-medium text-foreground'
                                        : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                                    )}
                                  >
                                    <span>{city.name}</span>
                                    {selected
                                      ? <CheckIcon className="size-3.5 shrink-0 text-emerald-600" />
                                      : <Plus className="size-3.5 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Transport Kind Selector (Air vs Rail vs Land) */}
      <div className="rounded-sm border border-border/70 bg-card p-4 space-y-4">
        <label className="text-xs font-bold text-foreground block">
          شیوه حمل‌ونقل و شرکت مجری *
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRANSPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentTransport === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => onChange({ transportKind: opt.id })}
                className={cn(
                  "flex items-center gap-3 rounded-sm border p-3.5 text-start transition-all",
                  isSelected
                    ? "border-brand bg-brand/10 text-foreground font-bold"
                    : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-sm",
                  isSelected ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className="text-caption text-muted-foreground truncate mt-0.5">
                    {opt.id === 'air' ? 'پرواز داخلی یا خارجی' : opt.id === 'rail' ? 'قطار ۴ یا ۶ تخته و ۵ ستاره' : 'اتوبوس VIP تخت‌شو'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Carrier name input */}
        <Field 
          label={
            currentTransport === 'air' ? 'نام ایرلاین یا خط هوایی' :
            currentTransport === 'rail' ? 'نام قطار و شرکت ریلی' :
            currentTransport === 'land' ? 'نوع اتوبوس و شرکت حمل‌ونقل زمینی' :
            'نام شرکت مجری'
          }
          hint="در قرارداد رسمی و کارت تور به مسافر نمایش داده می‌شود"
        >
          <Input className="max-md:text-base"
            value={data.airline}
            onChange={(e) => onChange({ airline: e.target.value, carrierName: e.target.value })}
            placeholder={
              TRANSPORT_OPTIONS.find((t) => t.id === currentTransport)?.placeholder || 'نام شرکت حمل‌ونقل…'
            }
          />
        </Field>
      </div>

      {/* Row 4: Origins & Duration & Next Departure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          {origins.length === 0 ? (
            <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-1.5">
              <p className="font-bold text-foreground">هنوز هیچ مبدأی ثبت نشده است</p>
              <p className="text-muted-foreground">برای ساخت تور اول باید دست‌کم یک شهر مبدأ داشته باشید.</p>
              <a
                href="/admin/catalog?tab=origins"
                className="inline-flex items-center gap-1 font-bold text-brand hover:underline"
              >
                رفتن به مدیریت مبدأها
              </a>
            </div>
          ) : (
            <Field
              label="مبدأ حرکت مسافر *"
              hint="شهر یا پایانه‌ای که تور از آن شروع می‌شود"
              error={errors.origin}
            >
              <Select className="max-md:text-base max-md:min-h-11"
                value={originSlugByName.get(data.origin) ?? ''}
                onChange={(e) => {
                  const found = origins.find((o) => o.slug === e.target.value);
                  onChange({ origin: found ? found.nameFa : '' });
                }}
                options={origins.map((o) => ({ value: o.slug, label: o.nameFa }))}
                placeholder="انتخاب شهر مبدأ…"
              />
            </Field>
          )}
        </div>

        <div>
          {/* مدت اقامت دستی تایپ نمی‌شود؛ فقط از تعداد شب‌ها ساخته و همین‌جا پیش‌نمایش داده می‌شود (موج ۲، تیم تکراری‌ها). */}
          <Field label="مدت اقامت و تعداد شب‌ها *" hint="مدت اقامت خودکار از تعداد شب‌ها ساخته می‌شود.">
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <Input className="max-md:text-base"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={data.nights || ''}
                  onChange={(e) => {
                    const n = Math.max(0, Number(e.target.value) || 0);
                    onChange({ nights: n, duration: buildDurationFromNights(n) });
                  }}
                  placeholder="شب‌ها"
                  title="تعداد شب"
                />
              </div>
              <div
                className="flex grow items-center rounded-sm border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground"
                aria-live="polite"
              >
                {data.duration || 'تعداد شب را وارد کنید'}
              </div>
            </div>
          </Field>
        </div>

        {/* تاریخ حرکت بعدی (T3): همان ستون closestDeparture؛ DatePicker شمسی فقط میان‌بر نوشتن متن است. */}
        <div>
          <DepartureDateField
            value={data.closestDeparture || ''}
            onChange={(v) => onChange({ closestDeparture: v })}
          />
        </div>
      </div>

      {/* Row 5: Price & Currency Transparency */}
      <div className="rounded-sm border border-border/70 bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-foreground">
            قیمت‌گذاری پایه و شفافیت ارزی / تومانی *
          </label>
          <span className="text-caption text-muted-foreground">برای هر بزرگسال در اتاق دوتخته پایه</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Field
              label="قیمت نمایشی روی کارت تور *"
              hint="این عدد روی کارت تور نمایش داده می‌شود؛ نرخ هر هتل (مرحلهٔ ۲) جداگانه و همان‌جا روی سایت نمایش داده می‌شود."
              error={errors.price}
            >
              <AmountInput inputClassName="max-md:text-base"
                value={Number(data.price) || 0}
                onChange={(val) => onChange({ price: val || 0 })}
                placeholder="۰"
              />
            </Field>
            {/* قلم ۲ موج ۲: آخرین نرخ ثبت‌شده برای همین مقصد — فقط نقطهٔ شروع، با منبع. */}
            {priceSuggestion && priceUnset && priceKey !== dismissedPriceKey && (
              <div className="mt-2">
                <SmartSuggestion
                  title={`آخرین نرخ ثبت‌شده برای این مقصد: ${formatToman(priceSuggestion.price)}`}
                  description={`از تور «${priceSuggestion.title}»${priceSuggestion.departure ? ` (حرکت: ${priceSuggestion.departure})` : ''}. فقط نقطهٔ شروع است؛ با پذیرفتن، قیمت فرم همین می‌شود.`}
                  onAccept={() => {
                    onChange({ price: priceSuggestion.price });
                    toast({ title: 'قیمت پیشنهادی گذاشته شد' });
                  }}
                  onReject={() => setDismissedPriceKey(priceKey)}
                />
              </div>
            )}
          </div>
        </div>

        {/* حساب سرانگشتی درآمد (T1): بیرون از مسیر الزامی‌ها، تاشو و بسته؛ فقط نمایشی، ذخیره نمی‌شود */}
        <Collapsible trigger="حساب سرانگشتی درآمد">
          <div className="rounded-sm border border-border/60 bg-secondary/20 p-3.5 flex flex-wrap items-end gap-x-5 gap-y-3">
            <div className="w-36">
              <Field label="ظرفیت تور (نفر)">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="مثلاً: ۴۰"
                  className="text-xs h-9 max-md:text-base max-md:min-h-11"
                />
              </Field>
            </div>
            <div className="text-xs pb-1">
              <span className="text-muted-foreground block">ظرفیت × قیمت پایه</span>
              <span className="font-black text-sm text-foreground">
                {capacityNum > 0 && priceNum > 0 ? formatToman(capacityNum * priceNum) : '—'}
              </span>
            </div>
            <span className="text-caption text-muted-foreground pb-1.5">فقط برای حساب سرانگشتی؛ ذخیره نمی‌شود.</span>
          </div>
        </Collapsible>
      </div>

      {/* تصویر بنر تور (T6 + پولیش موج ۲): لینک خام عنصر اصلی فرم نیست؛
          پیش‌نمایش جمع‌وجور + «جایگزین»/«حذف بنر»، و لینک فقط پشت «کپی لینک». */}
      <div>
        <Field label="تصویر بنر تور" hint="بنر روی کارت تور و بالای صفحهٔ تور نمایش داده می‌شود.">
          <input
            ref={bannerFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleBannerFile(e.target)}
          />
          {data.image.trim() ? (
            <div className="flex items-center gap-3">
              {/* پیش‌نمایش جمع‌وجور بنر: عمداً با همان SmartImageِ سایت رندر می‌شود
                  تا اگر آدرس روی سایت باز نشود، این‌جا هم خراب دیده شود (نه سالمِ دروغین). */}
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-sm border border-border/70">
                <SmartImage src={data.image.trim()} alt="پیش‌نمایش بنر تور" className="object-cover" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => bannerFileRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  {uploading ? 'در حال آپلود…' : 'جایگزین'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyBannerLink}
                  className="gap-1.5 text-xs"
                >
                  <Link2 className="size-4" />
                  کپی لینک
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { onChange({ image: '' }); setShowBannerUrl(false); }}
                  className="gap-1.5 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  حذف بنر
                </Button>
                {!showBannerUrl && (
                  <button
                    type="button"
                    onClick={() => setShowBannerUrl(true)}
                    className="text-caption font-bold text-brand hover:underline"
                  >
                    چسباندن لینک
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => bannerFileRef.current?.click()}
                className="gap-2 text-xs shrink-0"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {uploading ? 'در حال آپلود…' : 'آپلود بنر'}
              </Button>
              {!showBannerUrl && (
                <button
                  type="button"
                  onClick={() => setShowBannerUrl(true)}
                  className="text-caption font-bold text-brand hover:underline"
                >
                  چسباندن لینک
                </button>
              )}
            </div>
          )}
          {showBannerUrl && (
            <div className="mt-2">
              <Input className="max-md:text-base"
                dir="ltr"
                value={data.image}
                onChange={(e) => onChange({ image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                aria-label="لینک تصویر بنر"
              />
              <p className="mt-1 text-caption text-muted-foreground">لینک تصویر باکیفیت و بدون واترمارک از Unsplash.</p>
            </div>
          )}
        </Field>
        {/* بنر پیشنهادی از تصویر مقصد (موج ۱، قلم ۶ — فرصت ۱-۴): با پیش‌نمایش و
            تأیید صریح؛ اگر مقصد تصویری نداشت، چیزی پیشنهاد نمی‌شود. */}
        {needBanner && destContent?.image && dismissedBannerFor !== singleDestSlug && (
          <div className="mt-2 flex gap-3 rounded-sm border border-brand/25 bg-brand/5 p-3">
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-sm border border-border/60">
              <SmartImage src={destContent.image} alt={`بنر ${destContent.name}`} className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">
                بنر آمادهٔ «{destContent.name}» را بگذارم؟
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                از تصویر مقصد می‌آید؛ بعداً می‌توانید عوضش کنید.
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onChange({ image: destContent.image });
                    toast({ title: 'بنر مقصد گذاشته شد', description: 'هر وقت خواستید عوضش کنید.' });
                  }}
                  className="text-xs"
                >
                  بله، همین بنر
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDismissedBannerFor(singleDestSlug)}
                  className="text-xs text-muted-foreground"
                >
                  نه
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* توضیحات کلی تور (T17): همان متن مرحلهٔ ۵، انتهای مرحلهٔ ۱ —
          تیم «فرم تورها»: ویرایشگر کامل (ستون description_rich) + پیش‌نمایش واقعی */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="size-4 text-brand" />
          <span>توضیحات کلی، مقدمه سفر و نکات تکمیلی</span>
        </h4>
        <Field
          label="متن توضیحات تور"
          hint="درشت، کج، لیست، نقل‌قول، لینک، جدول، عکس با توضیح و ویدیو — همان‌طور که روی سایت دیده می‌شود."
        >
          <RichEditor
            variant="full"
            value={descriptionEditorValue}
            onChange={onDescriptionRichChange}
            placeholder="روایت جذاب و صادقانه از حال و هوای سفر، تجربیات خاص این مسیر و این‌که چرا مسافر باید همین تور را انتخاب کند…"
            pickImage={pickDescriptionImage}
          />
          {richColsReady === false && (
            <ColumnNotice>
              قالب‌بندی متن (درشت، لیست و…) هنوز در دیتابیس جا ندارد؛ فعلاً فقط متن ساده ذخیره می‌شود.
            </ColumnNotice>
          )}
        </Field>
        {/* پیش‌نمایش واقعی متن — همان رندرری که روی سایت متن را چاپ می‌کند */}
        <div className="rounded-sm border border-border/70 bg-background p-4">
          <p className="mb-2 text-caption font-bold text-muted-foreground">نمای واقعی متن در سایت</p>
          <div className="text-xs leading-relaxed text-foreground">
            <RichText value={richFallback(data.descriptionRich, data.description)} />
          </div>
        </div>
        {/* توضیحات پیشنهادی از متن مقصد (موج ۱، قلم ۶ — فرصت ۱-۵): دکمهٔ صریح
            با پیش‌نمایش و تأیید؛ متن خالیِ مدیر هرگز بازنویسی نمی‌شود. */}
        {needDesc && destContent?.description && (
          <button
            type="button"
            onClick={() => setShowDescPreview(true)}
            className="inline-flex items-center gap-1.5 text-caption font-bold text-brand hover:underline"
          >
            <Sparkles className="size-3.5" />
            شروع از متن «{destContent.name}»
          </button>
        )}
      </div>

      {/* متای سئوی سطح تور (تیم «فرم تورها»؛ ستون‌های meta_title/meta_description —
          مایگریشن 0033 هنوز اجرا نشده). شمارنده فقط نرم و راهنماست. */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Search className="size-4 text-brand" />
          <span>سئوی صفحهٔ تور</span>
        </h4>
        <SeoMetaFields
          metaTitle={data.metaTitle || ''}
          onMetaTitleChange={(v) => onChange({ metaTitle: v })}
          metaDescription={data.metaDescription || ''}
          onMetaDescriptionChange={(v) => onChange({ metaDescription: v })}
          titleFallback={data.title}
          urlPreview={data.slug.trim() ? `/tour/${data.slug.trim()}` : ''}
        />
        {metaColsReady === false && (
          <ColumnNotice>
            ذخیرهٔ این فیلدها به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شوند.
          </ColumnNotice>
        )}
      </div>

      {/* پیش‌نمایش متن مقصد (موج ۱، قلم ۶ — فرصت ۱-۵): درج فقط با تأیید صریح */}
      <AlertDialog
        open={showDescPreview}
        onOpenChange={setShowDescPreview}
        title={destContent ? `متن «${destContent.name}» در توضیحات بیاید؟` : ''}
        description={destContent ? (
          <span className="block max-h-64 space-y-1.5 overflow-y-auto rounded-sm border border-border/60 bg-secondary/20 p-3 text-start">
            {destContent.heroTagline.trim() ? (
              <span className="block text-xs font-bold text-foreground">{destContent.heroTagline}</span>
            ) : null}
            <span className="block text-xs leading-relaxed text-foreground/90">{destContent.description}</span>
          </span>
        ) : ''}
        confirmText="درج در توضیحات"
        cancelText="انصراف"
        onConfirm={() => {
          if (!destContent) return;
          const text = [destContent.heroTagline.trim(), destContent.description.trim()]
            .filter(Boolean)
            .join('\n\n');
          // متن غنی هم از همان ساخته می‌شود تا ویرایشگر خالی نماند.
          onChange({ description: text, descriptionRich: richFromPlainText(text) });
          setShowDescPreview(false);
          toast({ title: 'متن مقصد درج شد', description: 'بخوانید و ویرایشش کنید.' });
        }}
      />
      {/* تأیید افزودن دسته‌ای کشور (گزارش QC موج ۶) */}
      <AlertDialog
        open={bulkCountry !== null}
        onOpenChange={(open) => !open && setBulkCountry(null)}
        title={bulkCountry ? `همهٔ مقصدهای «${bulkCountry.name}» اضافه شود؟` : ''}
        description={bulkCountry ? `${bulkCountry.slugs.length} مقصد یک‌جا به مسیر سفر اضافه می‌شود.` : ''}
        confirmText="افزودن همه"
        cancelText="انصراف"
        onConfirm={() => {
          if (bulkCountry) toggleMany(bulkCountry.slugs);
          setBulkCountry(null);
        }}
      />
    </div>
  );
}
