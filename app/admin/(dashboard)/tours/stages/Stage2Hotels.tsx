'use client';

import React, { useMemo, useRef, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Star, 
  UtensilsCrossed, 
  Users, 
  User, 
  Baby, 
  Info,
  DollarSign,
  Search,
  Check,
  Unlink,
  Wallet,
  Globe,
  Eye,
  ChevronDown
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { cn, en, fa, faNumber } from '@/lib/utils';
import { normalizeFaSearch } from '@/lib/persian';
import type { HotelBookingType, TourHotelOptionItem, TourInput, DestinationTree } from '../actions';
import type { HotelPickerItem } from '../../hotels/actions';

interface Stage2HotelsProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  hotels: HotelPickerItem[];
  /** درخت مقصدها — برای فیلتر «فقط هتل‌های همین مقصد» (موج ۱، قلم ۶). */
  tree: DestinationTree;
}

const BOARD_OPTIONS = [
  { value: 'BB', label: 'صبحانه بوفه (BB)' },
  { value: 'HB', label: 'صبحانه + ناهار یا شام (HB)' },
  { value: 'FB', label: 'صبحانه، ناهار و شام کامل (FB)' },
  { value: 'ALL', label: 'تمامی وعده‌ها و نوشیدنی‌ها تا ساعت ۲۳ (ALL)' },
  { value: 'UALL', label: 'سرویس ۲۴ ساعته نامحدود (UALL)' },
  { value: 'RO', label: 'فقط اتاق بدون پذیرایی (RO)' },
];

/**
 * برچسب فارسی نوع پذیرایی هتل — برای پیشنهاد «وعده‌ها از هتل» در مرحلهٔ ۳
 * (موج ۱، قلم ۶). متن همان برچسبِ دیده‌شده در همین مرحله است؛ حدسی در کار نیست.
 */
export function boardDisplayLabel(board?: string | null): string {
  const code = (board || 'BB').toUpperCase();
  return BOARD_OPTIONS.find((b) => b.value === code)?.label ?? code;
}

/** متن وعده برای فیلد «وعده‌های غذایی» روزها: برچسب، بدون کد لاتین داخل پرانتز. */
export function boardMealsText(board?: string | null): string {
  return boardDisplayLabel(board).replace(/\s*\([A-Z]+\)\s*$/, '').trim();
}

// کتابچه §۳ (فاز ۲، قلم ۷): سه نوع رزرو — هر کدام زیرفیلد نرخ خودش را نشان می‌دهد.
// مقدار ذخیره‌شده کد لاتین است؛ برچسب فارسی در UI.
const BOOKING_TYPE_OPTIONS: Array<{ value: HotelBookingType; label: string }> = [
  { value: 'guarantee', label: 'گارانتی' },
  { value: 'semi_charter', label: 'نیم‌چارتر' },
  { value: 'on_request', label: 'درخواستی' },
];

/** آیا هتل دست‌کم یک نرخ دارد؟ (برای حالت پیش‌فرض آکاردئون، T7) */
function hotelHasRates(h: TourHotelOptionItem): boolean {
  return [h.pricePerPerson, h.priceDouble, h.priceSingle, h.priceChildWithBed, h.priceChildNoBed]
    .some((v) => (v || '').toString().trim() !== '');
}

/** «۳۸٬۵۰۰٬۰۰۰» یا «38500000» → 38500000؛ خالی/نامعتبر → null */
function priceNumber(v?: string): number | null {
  const digits = en(String(v || '')).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits ? Number(digits) : null;
}

interface HotelCardProps {
  hotel: TourHotelOptionItem;
  idx: number;
  onUpdate: (patch: Partial<TourHotelOptionItem>) => void;
  onRemove: () => void;
  onUnlink: () => void;
}

function HotelCard({ hotel, idx, onUpdate, onRemove, onUnlink }: HotelCardProps) {
  // پیش‌فرض هوشمند آکاردئون (T7): هتل بی‌نرخ باز، هتل بانرخ بسته.
  const [open, setOpen] = useState(() => !hotelHasRates(hotel));
  const [copiedFromDouble, setCopiedFromDouble] = useState(false);
  const copyDoneRef = useRef(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // پیش‌فرض هوشمند (T7): اولین باز شدن؛ «هر نفر» خالی و «دوتخته» پر → کپی یک‌طرفه.
    if (
      next &&
      !copyDoneRef.current &&
      !(hotel.pricePerPerson || '').trim() &&
      (hotel.priceDouble || '').trim()
    ) {
      copyDoneRef.current = true;
      onUpdate({ pricePerPerson: hotel.priceDouble });
      setCopiedFromDouble(true);
    }
  };

  // نشان زندهٔ سربرگ آکاردئون: «نرخ هر نفر» وگرنه «دوتخته»، وگرنه خط تیره.
  const shownRate = priceNumber(hotel.pricePerPerson) ?? priceNumber(hotel.priceDouble);

  const bookingGuide =
    hotel.bookingType === 'guarantee'
      ? 'نرخ قطعی گارانتی هتل؛ تا پایان قرارداد تغییر نمی‌کند.'
      : hotel.bookingType === 'semi_charter'
        ? 'نرخ نیم‌چارتر؛ با پر شدن ظرفیت ممکن است تغییر کند.'
        : hotel.bookingType === 'on_request'
          ? 'قیمت نهایی موقع رزرو مشخص می‌شود؛ اگر سقف تقریبی دارید بنویسید.'
          : null;

  const perPersonLabel =
    hotel.bookingType === 'guarantee' ? 'نرخ گارانتی (هر نفر، تومان)'
    : hotel.bookingType === 'semi_charter' ? 'نرخ نیم‌چارتر (هر نفر، تومان)'
    : hotel.bookingType === 'on_request' ? 'سقف تقریبی (هر نفر، تومان)'
    : 'نرخ هر نفر (تومان)';
  const perPersonHint =
    hotel.bookingType === 'guarantee' ? 'نرخی که هتل به‌صورت گارانتی اعلام کرده است.'
    : hotel.bookingType === 'semi_charter' ? 'نرخ نیم‌چارتر این هتل برای همین تور.'
    : hotel.bookingType === 'on_request' ? undefined
    : 'برای تورهای قدیمی؛ با انتخاب نوع رزرو، برچسب دقیق می‌شود.';

  return (
    <div className="rounded-sm border border-border bg-card p-5 space-y-4 transition-all hover:border-border/80">
      {/* Hotel header line — در موبایل می‌شکند؛ دکمه‌های عملیات ۴۴px */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
            {fa(idx + 1)}
          </span>
          <span className="truncate text-xs font-bold text-foreground">
            {hotel.name ? `هتل ${hotel.name}` : `بستهٔ اقامتی شماره ${fa(idx + 1)}`}
          </span>
          {hotel.hotelId && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <Check className="size-3" />
              متصل به جدول هتل‌ها
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hotel.hotelId && (
            <button
              type="button"
              onClick={onUnlink}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="نام و ستاره دستی می‌ماند؛ فقط پیوندش با فهرست هتل‌ها قطع می‌شود"
            >
              <Unlink className="size-4" />
              جدا کردن
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-xs text-destructive/80 transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
            حذف هتل
          </button>
        </div>
      </div>

      {/* Basic Hotel Specs: Name, Stars, Board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <Field label="نام کامل هتل *" hint="مثال: Hilton Bosphorus Istanbul">
            <Input
              value={hotel.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="نام هتل…"
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="درجه / ستاره">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => onUpdate({ stars: star })}
                  className={cn(
                    // ۴۴px برای لمس؛ ۵ × ۴۴ + فاصله‌ها در ۳۶۰ جا می‌شود.
                    "flex size-11 items-center justify-center rounded-sm border transition-colors",
                    (hotel.stars ?? 0) >= star
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-border/60 bg-secondary/30 text-muted-foreground"
                  )}
                  title={`${fa(star)} ستاره`}
                  aria-label={`${fa(star)} ستاره`}
                >
                  <Star className={cn("size-4", (hotel.stars ?? 0) >= star ? "fill-amber-500" : "")} />
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="خدمات غذایی">
            <select
              value={hotel.board || 'BB'}
              onChange={(e) => onUpdate({ board: e.target.value })}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              {BOARD_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* آکاردئون «نرخ‌های تفصیلی» (T7) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-sm border border-border/60 bg-secondary/20 px-3.5 py-3 text-start transition-colors hover:bg-secondary/40"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Wallet className="size-4 text-muted-foreground" />
            نرخ‌های تفصیلی
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm border border-brand/20 bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">
              <Globe className="size-3" />
              روی سایت: {shownRate !== null ? `${faNumber(shownRate)} تومان` : '—'}
            </span>
            <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </span>
        </button>

        {open && (
          <div className="rounded-sm border border-border/60 bg-secondary/20 p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground">نوع رزرو</span>
                {hotel.hotelId && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">ویژهٔ این تور</span>
                )}
              </div>
              <select
                value={hotel.bookingType ?? ''}
                onChange={(e) => onUpdate({ bookingType: (e.target.value || undefined) as HotelBookingType | undefined })}
                className="w-full max-w-60 rounded-sm border border-input bg-background px-3 py-2 text-xs font-medium"
                aria-label="نوع رزرو هتل"
              >
                <option value="">انتخاب کنید…</option>
                {BOOKING_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {bookingGuide && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">{bookingGuide}</p>
              )}
            </div>

            {/* نرخ هر نفر — همان عددی که روی سایت نمایش داده می‌شود */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                <span className="text-xs font-bold text-foreground">{perPersonLabel}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Eye className="size-3.5" />
                  این عدد روی سایت نمایش داده می‌شود
                </span>
              </div>
              <AmountInput
                value={priceNumber(hotel.pricePerPerson)}
                onChange={(v) => onUpdate({ pricePerPerson: v == null ? '' : String(v) })}
                placeholder="۰"
              />
              {perPersonHint && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">{perPersonHint}</p>
              )}
              {copiedFromDouble && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">از نرخ اتاق دوتخته کپی شد؛ می‌توانید تغییرش دهید.</p>
              )}
            </div>

            {/* تفکیک نرخ اتاق‌ها */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">تفکیک نرخ اتاق‌ها (اختیاری)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-sm bg-card p-3 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span>اتاق دوتخته *</span>
                  </div>
                  <AmountInput
                    value={priceNumber(hotel.priceDouble)}
                    onChange={(v) => onUpdate({ priceDouble: v == null ? '' : String(v) })}
                    placeholder="۰"
                    words={false}
                  />
                </div>

                <div className="rounded-sm bg-card p-3 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>اتاق یک‌تخته</span>
                  </div>
                  <AmountInput
                    value={priceNumber(hotel.priceSingle)}
                    onChange={(v) => onUpdate({ priceSingle: v == null ? '' : String(v) })}
                    placeholder="۰"
                    words={false}
                  />
                </div>

                <div className="rounded-sm bg-card p-3 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                    <Baby className="size-3.5 text-muted-foreground" />
                    <span>کودک با تخت (۶ تا ۱۲ سال)</span>
                  </div>
                  <AmountInput
                    value={priceNumber(hotel.priceChildWithBed)}
                    onChange={(v) => onUpdate({ priceChildWithBed: v == null ? '' : String(v) })}
                    placeholder="۰"
                    words={false}
                  />
                </div>

                <div className="rounded-sm bg-card p-3 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                    <Baby className="size-3.5 text-muted-foreground" />
                    <span>کودک بدون تخت (۲ تا ۶ سال)</span>
                  </div>
                  <AmountInput
                    value={priceNumber(hotel.priceChildNoBed)}
                    onChange={(v) => onUpdate({ priceChildNoBed: v == null ? '' : String(v) })}
                    placeholder="۰"
                    words={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location & Transfer note */}
      <Field label="موقعیت هتل یا نکته ترانسفر" hint="مثال: واقع در میدان تقسیم، فاصله ۵ دقیقه تا مترو، استخر روباز دارد">
        <Input
          value={hotel.locationNote || ''}
          onChange={(e) => onUpdate({ locationNote: e.target.value })}
          placeholder="فاصله تا مراکز مهم یا ویژگی ممتاز هتل…"
          className="text-xs"
        />
      </Field>
    </div>
  );
}

export default function Stage2Hotels({ data, onChange, hotels: catalogHotels, tree }: Stage2HotelsProps) {
  const hotels: TourHotelOptionItem[] = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];
  const [showHotelPicker, setShowHotelPicker] = useState(false);
  const [hotelQuery, setHotelQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  /**
   * فیلتر «فقط هتل‌های همین مقصد» (موج ۱، قلم ۶ — فرصت ۲-۱ ممیزی هوشمندسازی):
   * وقتی مقصد ست شده، پیش‌فرض روشن است و با یک کلیک خاموش می‌شود.
   * دامنه = مقصدهای انتخاب‌شده + زیرمجموعه‌هایشان در درخت (مثلاً با انتخاب
   * «ترکیه»، هتل‌های «استانبول» هم می‌آیند)؛ فقط تطبیق دقیق اسلاگ، بدون حدس.
   */
  const destSlugs = useMemo(
    () => (Array.isArray(data.destinationSlugs) ? data.destinationSlugs.filter((s) => (s || '').trim()) : []),
    [data.destinationSlugs]
  );
  const destScope = useMemo(() => {
    if (destSlugs.length === 0) return null;
    const children = new Map<string, string[]>();
    for (const a of tree?.all ?? []) {
      if (!a.parent) continue;
      const arr = children.get(a.parent);
      if (arr) arr.push(a.slug);
      else children.set(a.parent, [a.slug]);
    }
    const out = new Set<string>(destSlugs);
    const stack = [...destSlugs];
    while (stack.length > 0) {
      const s = stack.pop() as string;
      for (const c of children.get(s) ?? []) {
        if (!out.has(c)) {
          out.add(c);
          stack.push(c);
        }
      }
    }
    return out;
  }, [tree, destSlugs]);
  // پیش‌فرضِ دیده‌شونده: مقصد که ست باشد، فیلتر از اول روشن است.
  const [destOnly, setDestOnly] = useState(() => destSlugs.length > 0);

  // گشت (ایراد ۵): باز شدن پنل باید غیرقابل‌چشم‌پوشی باشد — دکمه حالت فعال می‌گیرد،
  // پنل به دید اسکرول می‌شود و جست‌وجو فوکوس می‌گیرد تا «هیچ اتفاقی نیفتاد» تکرار نشود.
  const toggleHotelPicker = () => {
    const next = !showHotelPicker;
    setShowHotelPicker(next);
    if (next) {
      requestAnimationFrame(() => {
        pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        pickerRef.current?.querySelector('input')?.focus({ preventScroll: true });
      });
    }
  };

  const handleAddHotel = () => {
    const next: TourHotelOptionItem[] = [
      ...hotels,
      {
        name: '',
        // ستاره عمداً خالی می‌ماند تا مدیر آگاهانه انتخاب کند (ادعای ستاره نباید حدسی باشد)
        board: 'BB',
        // نوع رزرو پیش‌فرض «درخواستی» است تا شاخهٔ قدیمی «نرخ هر نفر» دیده نشود (T18).
        bookingType: 'on_request',
        pricePerPerson: '',
        priceDouble: '',
        priceSingle: '',
        priceChildWithBed: '',
        priceChildNoBed: '',
        locationNote: '',
      },
    ];
    onChange({ hotelOptions: next });
  };

  // افزودن هتل از جدول ثبت‌شده‌ها: نام و ستاره از رکورد می‌آید، قیمت همان‌جا دستی وارد می‌شود (ویژهٔ این تور)
  // اگر کاتالوگ برای هتل ستاره ثبت نکرده باشد، ستاره خالی می‌ماند — هرگز حدس زده نمی‌شود.
  const handleAddHotelFromTable = (h: HotelPickerItem) => {
    const next: TourHotelOptionItem[] = [
      ...hotels,
      {
        hotelId: h.id,
        name: h.nameFa,
        ...(h.stars ? { stars: h.stars } : {}),
        board: 'BB',
        bookingType: 'on_request',
        pricePerPerson: '',
        priceDouble: '',
        priceSingle: '',
        priceChildWithBed: '',
        priceChildNoBed: '',
        locationNote: '',
      },
    ];
    onChange({ hotelOptions: next });
    setShowHotelPicker(false);
    setHotelQuery('');
  };

  const handleUnlinkHotel = (index: number) => {
    const next = hotels.map((h, i) => {
      if (i !== index) return h;
      const { hotelId: _dropped, ...rest } = h;
      return rest;
    });
    onChange({ hotelOptions: next });
  };

  const catalogQuery = normalizeFaSearch(hotelQuery);
  // فهرست پایهٔ پیکر: با فیلتر مقصدی فقط هتل‌هایی که placeSlugشان در دامنهٔ
  // مقصدهای همین تور است؛ هتل بی‌شهر (placeSlug خالی) در حالت فیلتر نمی‌آید.
  const scopedHotels = useMemo(
    () =>
      destOnly && destScope
        ? catalogHotels.filter((h) => h.placeSlug && destScope.has(h.placeSlug))
        : catalogHotels,
    [catalogHotels, destOnly, destScope]
  );
  const catalogResults = catalogQuery
    ? scopedHotels.filter((h) => normalizeFaSearch(h.nameFa).includes(catalogQuery)).slice(0, 30)
    : scopedHotels.slice(0, 30);
  // گروه‌بندی با سرفصل شهر (فرصت ۲-۱): فهرست ۵۰۰تاییِ پشت‌سرهم، بزرگ‌ترین عامل
  // «قاطی‌کردن» فرم بود؛ حالا هم در حالت فیلتر و هم در حالت همه، شهر سرفصل دارد.
  const groupedResults = useMemo(() => {
    const map = new Map<string, HotelPickerItem[]>();
    for (const h of catalogResults) {
      const key = h.cityName || 'شهر ثبت‌نشده';
      const arr = map.get(key);
      if (arr) arr.push(h);
      else map.set(key, [h]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fa'));
  }, [catalogResults]);

  const handleUpdateHotel = (index: number, patch: Partial<TourHotelOptionItem>) => {
    const next = [...hotels];
    next[index] = { ...next[index], ...patch };
    onChange({ hotelOptions: next });
  };

  const handleRemoveHotel = (index: number) => {
    const next = hotels.filter((_, i) => i !== index);
    onChange({ hotelOptions: next });
  };

  // دیالوگ تأیید حذف هتل (B-25): با نام هتل + جملهٔ پیامد، الگوی «بایگانی تور».
  const [confirmRemoveHotel, setConfirmRemoveHotel] = useState<number | null>(null);
  const removeTarget = confirmRemoveHotel === null ? undefined : hotels[confirmRemoveHotel];
  const removeLabel = removeTarget
    ? removeTarget.name || `بستهٔ اقامتی شماره ${fa(confirmRemoveHotel + 1)}`
    : '';

  return (
    <div className="space-y-6">
      {/* Stage Header (T16: الگوی تک‌رنگ با لهجهٔ برند) — در موبایل ستونی و دکمه‌ها تمام‌عرض */}
      <div className="flex flex-col gap-3 rounded-sm border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground">مرحله دوم: ماتریس هتل‌ها و ظرفیت اتاق‌ها</h3>
            <p className="text-xs text-muted-foreground">
              تعریف بسته‌های اقامتی، ستاره هتل، نوع پذیرایی (صبحانه بوفه، همه‌چیز شامل و…) و تفکیک شفاف قیمت اتاق ۲تخته، ۱تخته و کودکان
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={toggleHotelPicker}
            aria-expanded={showHotelPicker}
            className={cn('w-full gap-2 text-xs sm:w-auto', showHotelPicker && 'border-brand bg-brand/10 text-foreground')}
          >
            <Search className="size-4" />
            {showHotelPicker ? 'بستن فهرست هتل‌ها' : 'انتخاب از هتل‌های ثبت‌شده'}
          </Button>
          <Button
            type="button"
            onClick={handleAddHotel}
            className="w-full gap-2 text-xs sm:w-auto"
          >
            <Plus className="size-4" />
            افزودن هتل جدید
          </Button>
        </div>
      </div>

      {/* انتخاب هتل از جدول ثبت‌شده‌ها: نام و ستاره از رکورد پر می‌شود؛ قیمت همان‌جا دستی (ویژهٔ این تور) */}
      {showHotelPicker && (
        <div ref={pickerRef} className="rounded-sm border border-border bg-card p-4 space-y-3">
          {/* فیلتر «فقط هتل‌های همین مقصد» (موج ۱، قلم ۶): پیش‌فرضِ دیده‌شونده و
              قابل‌خاموش؛ برداشتن تیک یعنی «همهٔ هتل‌ها». */}
          {destScope && (
            <label className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-brand/20 bg-brand/5 px-3 py-2.5">
              <input
                type="checkbox"
                checked={destOnly}
                onChange={(e) => setDestOnly(e.target.checked)}
                className="size-4 shrink-0 cursor-pointer accent-brand"
              />
              <span className="text-xs font-bold text-foreground">فقط هتل‌های همین مقصد</span>
              <span className="text-[11px] text-muted-foreground">
                ({fa(scopedHotels.length)} هتل)
              </span>
            </label>
          )}
          <div className="relative">
            <Input
              value={hotelQuery}
              onChange={(e) => setHotelQuery(e.target.value)}
              placeholder="نام هتل را بنویسید…"
              className="ps-9 text-xs"
            />
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          </div>
          {catalogHotels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              هنوز هتلی در جدول ثبت نشده است؛ از «افزودن هتل جدید» به‌صورت دستی وارد کنید.
            </p>
          ) : destOnly && scopedHotels.length === 0 ? (
            <div className="py-3 text-center">
              <p className="text-xs text-muted-foreground">
                برای این مقصد هتلی ثبت نشده است.
              </p>
              <button
                type="button"
                onClick={() => setDestOnly(false)}
                className="mt-2 text-xs font-bold text-brand hover:underline"
              >
                نمایش همهٔ هتل‌ها
              </button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-sm border border-border/60">
              {catalogResults.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">چیزی پیدا نشد.</p>
              ) : (
                groupedResults.map(([city, items]) => (
                  <div key={city}>
                    <div className="sticky top-0 bg-secondary/60 px-3 py-1.5 text-[11px] font-bold text-foreground">
                      {city}
                      <span className="ms-1.5 font-normal text-muted-foreground">({fa(items.length)})</span>
                    </div>
                    <div className="divide-y divide-border/40">
                      {items.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => handleAddHotelFromTable(h)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-xs transition-colors hover:bg-accent/40 min-h-11"
                        >
                          <span className="flex items-center gap-2 text-foreground">
                            <Building2 className="size-3.5 text-blue-600 shrink-0" />
                            <span className="font-medium">{h.nameFa}</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Star className="size-3 text-amber-500 fill-amber-500" />
                              {h.stars ?? '—'}
                            </span>
                          </span>
                          <Plus className="size-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-border/80 p-10 text-center">
          <Building2 className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground mb-1">هنوز هتلی برای این تور ثبت نشده است</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            با افزودن هتل‌های مختلف (۳ ستاره اقتصادی تا ۵ ستاره لوکس)، به مسافر حق انتخاب شفاف بر اساس بودجه می‌دهید.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddHotel}
            className="gap-2 text-xs"
          >
            <Plus className="size-4" />
            افزودن اولین هتل
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {hotels.map((hotel, idx) => (
            <HotelCard
              key={idx}
              hotel={hotel}
              idx={idx}
              onUpdate={(patch) => handleUpdateHotel(idx, patch)}
              onRemove={() => setConfirmRemoveHotel(idx)}
              onUnlink={() => handleUnlinkHotel(idx)}
            />
          ))}
        </div>
      )}

      {/* دیالوگ تأیید حذف هتل (B-25): نام هتل + پیامد حذف همهٔ نرخ‌ها، بدون بازگشت */}
      <AlertDialog
        open={removeTarget !== undefined}
        onOpenChange={(open) => { if (!open) setConfirmRemoveHotel(null); }}
        title={`«${removeLabel}» حذف شود؟`}
        description="این هتل با همهٔ نرخ‌هایی که برایش وارد کرده‌اید برای همیشه حذف می‌شود و قابل بازگشت نیست."
        confirmText="حذف هتل"
        destructive
        onConfirm={() => { if (confirmRemoveHotel !== null) handleRemoveHotel(confirmRemoveHotel); }}
      />
    </div>
  );
}
