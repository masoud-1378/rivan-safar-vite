'use client';

import React from 'react';
import { 
  Map, 
  Plus, 
  Trash2, 
  CalendarDays, 
  Utensils,
  CheckCircle2,
  XCircle,
  LayoutTemplate,
  Plane
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import CarrierSelect from './CarrierSelect';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { fa, faNumber } from '@/lib/utils';
import type { TourHotelOptionItem, TourItineraryDayItem, TourInput, TourFlightDetails } from '../actions';
// تیم «فرم تورها»: شرح هر روز با ویرایشگر سبک (کلید description_rich داخل آبجکت روز).
import { RichEditor } from '@/components/ui/rich-editor/RichEditor';
import { mediaTag } from '@/components/ui/media-library/types';
import { openMediaPicker } from '@/components/ui/media-library/openMediaPicker';
import {
  normalizeRichValue,
  richFromPlainText,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';
import { boardMealsText } from './Stage2Hotels';

interface Stage3ItineraryProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

// قالب‌های پیش‌فرض خدمات همراه تور (T12): فقط «خدمات همراه» را پر می‌کنند؛
// «خدمات خارج از تور» را نه.
const SERVICE_TEMPLATES: Array<{ label: string; items: string[] }> = [
  {
    label: 'پکیج استاندارد خارجی',
    items: [
      'بلیت رفت و برگشت هواپیما',
      'اقامت در هتل با صبحانه',
      'ترانسفر فرودگاهی',
      'بیمه مسافرتی',
      'لیدر فارسی‌زبان',
      'گشت شهری با ناهار',
    ],
  },
  {
    label: 'پکیج استاندارد داخلی',
    items: [
      'بلیت رفت و برگشت',
      'اقامت در هتل',
      'ترانسفر',
      'بیمه مسافرتی',
      'لیدر فارسی‌زبان',
      'گشت‌های روزانه',
    ],
  },
];

export default function Stage3Itinerary({ data, onChange }: Stage3ItineraryProps) {
  const itinerary: TourItineraryDayItem[] = Array.isArray(data.itineraryDays) ? data.itineraryDays : [];
  const included: string[] = Array.isArray(data.includedServices) ? data.includedServices : [];
  const excluded: string[] = Array.isArray(data.excludedServices) ? data.excludedServices : [];
  const hotelOptions: TourHotelOptionItem[] = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];
  const nights = Number(data.nights) || 0;
  const { toast } = useToast();

  // مشخصات پرواز (موج ۳، فیلدهای دامنه‌ای): همه اختیاری‌اند، جزو گیت انتشار
  // نیستند؛ خالی = خالی. در saveTour با نرمالایزر دفاعی در ستون flight_details
  // (مایگریشن 0028) ذخیره می‌شود.
  const fd: TourFlightDetails = data.flightDetails ?? {};
  const updateFlight = (patch: Partial<TourFlightDetails>) => {
    onChange({ flightDetails: { ...fd, ...patch } });
  };

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const next: TourItineraryDayItem[] = [
      ...itinerary,
      {
        day: nextDayNum,
        title: '',
        city: data.destination || '',
        description: '',
        meals: 'صبحانه',
      },
    ];
    onChange({ itineraryDays: next });
  };

  const handleUpdateDay = (index: number, patch: Partial<TourItineraryDayItem>) => {
    const next = [...itinerary];
    next[index] = { ...next[index], ...patch };
    onChange({ itineraryDays: next });
  };

  const handleRemoveDay = (index: number) => {
    const next = itinerary
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, day: idx + 1 }));
    onChange({ itineraryDays: next });
  };

  // دیالوگ تأیید حذف روز برنامه (C3-2): شماره/عنوان روز + پیامد شماره‌گذاری مجدد روز‌های بعدی.
  const [confirmRemoveDay, setConfirmRemoveDay] = React.useState<number | null>(null);
  const removeDayTarget = confirmRemoveDay === null ? undefined : itinerary[confirmRemoveDay];

  /**
   * ساخت N روز خالی (موج ۱، قلم ۶ — فرصت ۳-۱ ممیزی): به تعداد روزهای تور
   * (شب‌ها + ۱: روز رفت و روز برگشت)، کارتِ خالیِ قابل‌ویرایش می‌سازد
   * (قالب خالی، نه محتوای حدسی). روزهایی که از قبل ساخته شده‌اند دست
   * نمی‌خورند؛ فقط شماره‌های جاافتاده ساخته می‌شوند.
   * یافتهٔ ۱۳ مبتدی: قبلاً nights روز می‌ساخت و روز آخر جا می‌ماند.
   */
  const [confirmBuildDays, setConfirmBuildDays] = React.useState<number[] | null>(null);
  const buildEmptyDays = (missing: number[]) => {
    const next: TourItineraryDayItem[] = [...itinerary];
    for (const d of missing) {
      next.push({
        day: d,
        title: '',
        city: data.destination || '',
        description: '',
        meals: '',
      });
    }
    next.sort((a, b) => a.day - b.day);
    onChange({ itineraryDays: next });
    setConfirmBuildDays(null);
    toast({
      title: `${fa(missing.length)} روز خالی ساخته شد`,
      description: 'عنوان و شرح هر روز را خودتان بنویسید.',
    });
  };
  const handleBuildEmptyDays = () => {
    if (nights <= 0) return;
    const dayCount = nights + 1;
    const existing = new Set(itinerary.map((d) => d.day));
    const missing: number[] = [];
    for (let d = 1; d <= dayCount; d++) {
      if (!existing.has(d)) missing.push(d);
    }
    if (missing.length === 0) {
      toast({ title: 'همهٔ روزها از قبل ساخته شده‌اند', variant: 'warning' });
      return;
    }
    // برنامه که خالی است، خودِ دکمه تأیید صریح است؛ وگرنه دیالوگ می‌پرسد.
    if (itinerary.length === 0) buildEmptyDays(missing);
    else setConfirmBuildDays(missing);
  };

  /**
   * وعده‌ها از هتل (موج ۱، قلم ۶ — فرصت ۳-۲ ممیزی): وقتی هتلی با وعدهٔ مشخص
   * انتخاب شده، پیشنهاد می‌دهد همان وعده در برنامهٔ روزها تیک بخورد —
   * با تأیید مدیر، نه خودکار. RO (بدون پذیرایی) وعده‌ای برای پیشنهاد ندارد.
   */
  const [mealsDismissed, setMealsDismissed] = React.useState(false);
  const hotelBoards = React.useMemo(() => {
    // نکته: نام Mapِ لوسیید (آیکون سربرگ) روی Map سراسری سایه انداخته؛ پس globalThis.
    const map = new globalThis.Map<string, string[]>();
    for (const h of hotelOptions) {
      const code = ((h.board || 'BB') as string).toUpperCase();
      if (code === 'RO') continue;
      const name = (h.name || '').trim() || 'هتل بدون نام';
      const arr = map.get(code);
      if (arr) {
        if (!arr.includes(name)) arr.push(name);
      } else {
        map.set(code, [name]);
      }
    }
    return [...map.entries()];
  }, [hotelOptions]);
  const showMealsSuggestion =
    !mealsDismissed &&
    hotelBoards.length > 0 &&
    itinerary.length > 0 &&
    hotelBoards.some(([code]) =>
      itinerary.some((d) => (d.meals || '').trim() !== boardMealsText(code))
    );
  const applyBoardMeals = (code: string) => {
    const text = boardMealsText(code);
    onChange({ itineraryDays: itinerary.map((d) => ({ ...d, meals: text })) });
    setMealsDismissed(true);
    toast({
      title: `وعدهٔ «${text}» در همهٔ روزها ثبت شد`,
      description: 'هر روز را جداگانه هم می‌توانید عوض کنید.',
    });
  };

  // Service helpers
  const [newIncluded, setNewIncluded] = React.useState('');
  const [newExcluded, setNewExcluded] = React.useState('');

  const addIncluded = () => {
    if (!newIncluded.trim()) return;
    onChange({ includedServices: [...included, newIncluded.trim()] });
    setNewIncluded('');
  };

  const removeIncluded = (idx: number) => {
    onChange({ includedServices: included.filter((_, i) => i !== idx) });
  };

  // اعمال قالب خدمات (T12): آیتم‌های تکراری رد می‌شوند؛ تعداد اضافه‌شده اعلام می‌شود.
  const applyServiceTemplate = (tpl: { label: string; items: string[] }) => {
    const fresh = tpl.items.filter((item) => !included.includes(item));
    if (fresh.length === 0) {
      toast({ title: 'همهٔ خدمات این قالب قبلاً اضافه شده‌اند', variant: 'warning' });
      return;
    }
    onChange({ includedServices: [...included, ...fresh] });
    toast({
      title: `${faNumber(fresh.length)} خدمت از «${tpl.label}» اضافه شد`,
      description: fresh.length < tpl.items.length ? 'خدمات تکراری دوباره اضافه نشدند.' : undefined,
    });
  };

  const addExcluded = () => {
    if (!newExcluded.trim()) return;
    onChange({ excludedServices: [...excluded, newExcluded.trim()] });
    setNewExcluded('');
  };

  const removeExcluded = (idx: number) => {
    onChange({ excludedServices: excluded.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {/* Header (T16: الگوی تک‌رنگ با لهجهٔ برند) — در موبایل ستونی و دکمه تمام‌عرض */}
      <div className="flex flex-col gap-3 rounded-sm border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand text-brand-foreground">
            <Map className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground">مرحله سوم: برنامه سفر روزبه‌روز و خدمات</h3>
            <p className="text-xs text-muted-foreground">
              برنامهٔ شفاف هر روز سفر (از روز اول تا آخر)، گشت‌های گروهی، گشت‌های اختیاری و وعده‌های غذایی
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {/* ساخت N روز خالی (موج ۱، قلم ۶): فقط وقتی تعداد شب‌ها معلوم است */}
          {nights > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBuildEmptyDays}
              className="w-full gap-2 text-xs sm:w-auto"
            >
              <CalendarDays className="size-4" />
              ساخت {fa(nights + 1)} روز خالی
            </Button>
          )}
          <Button
            type="button"
            variant="brand"
            onClick={handleAddDay}
            className="w-full gap-2 text-xs sm:w-auto"
          >
            <Plus className="size-4" />
            افزودن روز برنامه
          </Button>
        </div>
      </div>

      {/* مشخصات پرواز (موج ۳، فیلدهای دامنه‌ای): نوع چارتر/سیستمی، ساعت پرواز،
          مستقیم/توقف‌دار + شهر توقف. همه اختیاری‌اند (تصمیم ۵ پلن) و جزو گیت
          انتشار نیستند — نبودشان تور را ناقص نمی‌کند. */}
      <div className="rounded-sm border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Plane className="size-4 shrink-0 text-brand" />
          <h4 className="text-sm font-bold text-foreground">مشخصات پرواز</h4>
          <span className="text-[11px] text-muted-foreground">(اختیاری)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ایرلاین" hint="همان که در قرارداد و کارت تور نمایش داده می‌شود">
            <CarrierSelect
              value={data.airline ?? ''}
              onChange={(airline) => onChange({ airline, carrierName: airline })}
            />
          </Field>
          <Field
            label="نوع پرواز"
            hint="اگر نمی‌دانید خالی بگذارید؛ خطا نیست"
          >
            <Select
              aria-label="نوع پرواز"
              value={fd.flightType ?? ''}
              onChange={(e) => updateFlight({ flightType: e.target.value || undefined })}
              options={[
                { value: '', label: 'انتخاب کنید…' },
                { value: 'charter', label: 'چارتر' },
                { value: 'scheduled', label: 'سیستمی' },
              ]}
              className="max-md:text-base max-md:min-h-11"
            />
          </Field>
          <Field label="ساعت پرواز">
            <Input
              className="max-md:text-base"
              value={fd.flightTime ?? ''}
              onChange={(e) => updateFlight({ flightTime: e.target.value })}
              placeholder="مثلاً: ۰۸:۳۰ صبح"
            />
          </Field>
          <Field label="مسیر پرواز">
            <Select
              aria-label="مسیر پرواز"
              value={fd.directness ?? ''}
              onChange={(e) => updateFlight({
                directness: e.target.value || undefined,
                // با مستقیم شدن، شهر توقف بی‌معنا می‌شود و پاک می‌شود.
                ...(e.target.value === 'stopover' ? {} : { stopCity: undefined }),
              })}
              options={[
                { value: '', label: 'انتخاب کنید…' },
                { value: 'direct', label: 'مستقیم' },
                { value: 'stopover', label: 'توقف‌دار' },
              ]}
              className="max-md:text-base max-md:min-h-11"
            />
          </Field>
          {fd.directness === 'stopover' && (
            <Field label="شهر توقف">
              <Input
                className="max-md:text-base"
                value={fd.stopCity ?? ''}
                onChange={(e) => updateFlight({ stopCity: e.target.value })}
                placeholder="مثلاً: استانبول"
              />
            </Field>
          )}
        </div>
      </div>

      {/* پیشنهاد وعده‌ها از هتل (موج ۱، قلم ۶): فقط پیشنهاد با تأیید صریح */}
      {showMealsSuggestion && (
        <div className="rounded-sm border border-brand/25 bg-brand/5 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Utensils className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="text-xs leading-relaxed">
              {hotelBoards.length === 1 ? (
                <p className="text-foreground">
                  هتل «{hotelBoards[0][1].join('، ')}» وعدهٔ «{boardMealsText(hotelBoards[0][0])}» دارد.
                </p>
              ) : (
                <div className="text-foreground">
                  <p>هتل‌ها وعده‌های متفاوتی دارند:</p>
                  <ul className="mt-1 list-disc space-y-0.5 ps-4">
                    {hotelBoards.map(([code, names]) => (
                      <li key={code}>
                        «{boardMealsText(code)}» — {names.join('، ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-1 text-muted-foreground">
                همین وعده در همهٔ روزها ثبت شود؟ متن فعلی وعدهٔ روزها جایگزین می‌شود.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotelBoards.map(([code]) => (
              <Button
                key={code}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyBoardMeals(code)}
                className="text-xs"
              >
                ثبت «{boardMealsText(code)}» در روزها
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setMealsDismissed(true)}
              className="text-xs text-muted-foreground"
            >
              فعلاً نه
            </Button>
          </div>
        </div>
      )}

      {/* Day by Day list */}
      {itinerary.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-border/80 p-8 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground mb-1">هنوز برنامهٔ روزانه‌ای ثبت نشده است</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            برای این‌که مسافر بداند هر روز چه می‌کند، فعالیت‌ها را روزبه‌روز بنویسید.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDay}
            className="gap-2 text-xs"
          >
            <Plus className="size-4" />
            افزودن روز اول سفر
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {itinerary.map((dayItem, idx) => (
            <div
              key={idx}
              className="rounded-sm border border-border bg-card p-4 space-y-3 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-xs font-bold text-emerald-600">
                    روز {fa(dayItem.day)}
                  </span>
                  <span className="truncate text-xs font-bold text-foreground">
                    {dayItem.title || `فعالیت روز ${fa(dayItem.day)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveDay(idx)}
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 px-2 text-xs text-destructive/80 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  حذف این روز
                </button>
              </div>

              {/* Title & City */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8">
                  <Field label="عنوان برنامه روز *" hint="مثال: پرواز به استانبول، ترانسفر فرودگاهی و تحویل اتاق‌ها">
                    <Input
                      value={dayItem.title}
                      onChange={(e) => handleUpdateDay(idx, { title: e.target.value })}
                      placeholder="عنوان این روز…"
                      className="text-xs font-medium max-md:text-base"
                    />
                  </Field>
                </div>
                <div className="md:col-span-4">
                  <Field label="شهر / محل حضور">
                    <Input
                      value={dayItem.city}
                      onChange={(e) => handleUpdateDay(idx, { city: e.target.value })}
                      placeholder="مثلاً: استانبول"
                      className="text-xs max-md:text-base"
                    />
                  </Field>
                </div>
              </div>

              {/* Meals */}
              <Field label="وعده‌های غذایی گنجانده‌شده در این روز" hint="مثال: صبحانه بوفه هتل + ناهار محلی در گشت">
                <Input
                  value={dayItem.meals || ''}
                  onChange={(e) => handleUpdateDay(idx, { meals: e.target.value })}
                  placeholder="صبحانه، ناهار یا شام…"
                  className="text-xs max-md:text-base"
                />
              </Field>

              {/* Description — ویرایشگر سبک (bold/ایتالیک/لیست/لینک)؛
                  متن تختِ description از همان ساخته می‌شود تا گیت انتشار و
                  سایت بی‌متن نمانند. */}
              <Field
                label="شرح کامل برنامه‌ها، ساعت حرکت و گشت‌ها"
                hint="درشت، کج، لیست و لینک — روز شلوغ نمی‌شود؛ عکس و جدول این‌جا نیست."
              >
                <RichEditor
                  variant="light"
                  value={normalizeRichValue(dayItem.descriptionRich) ?? richFromPlainText(dayItem.description || '')}
                  onChange={(json: JSONContent) =>
                    handleUpdateDay(idx, {
                      descriptionRich: json,
                      description: richToPlainText(json),
                    })
                  }
                  placeholder="توضیح دهید مسافر در این روز چه کارهایی انجام می‌دهد، چه جاهایی را می‌بیند و چه ساعتی بازمی‌گردد…"
                  pickImage={() =>
                    openMediaPicker({
                      tag: mediaTag('tour', data.slug || `day-${dayItem.day}`),
                      title: `انتخاب عکس برای روز ${dayItem.day}`,
                    })
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      )}

      {/* Included & Excluded Services Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Included Services */}
        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>خدمات همراه تور</span>
          </div>

          {/* نوار قالب‌های پیش‌فرض خدمات (T12) */}
          <div className="flex flex-wrap items-center gap-2 rounded-sm border border-dashed border-border/80 p-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
              <LayoutTemplate className="size-4 text-muted-foreground" />
              شروع سریع با قالب آماده:
            </span>
            {SERVICE_TEMPLATES.map((tpl) => (
              <Button
                key={tpl.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyServiceTemplate(tpl)}
                className="text-xs"
              >
                {tpl.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
              placeholder="مثال: ترانسفر رفت و برگشت فرودگاهی"
              className="text-xs grow max-md:text-base"
            />
            <Button type="button" size="sm" onClick={addIncluded} className="shrink-0 text-xs">
              افزودن
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {included.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-foreground"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeIncluded(i)}
                  aria-label={`حذف «${item}»`}
                  className="-m-1 inline-flex size-6 min-h-11 min-w-11 items-center justify-center text-lg leading-none text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Excluded Services */}
        <div className="rounded-sm border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <XCircle className="size-4 text-destructive" />
            <span>خدمات خارج از تور</span>
          </div>

          <div className="flex gap-2">
            <Input
              value={newExcluded}
              onChange={(e) => setNewExcluded(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExcluded())}
              placeholder="مثال: ورودی موزه‌ها، گشت شبانه بالون"
              className="text-xs grow max-md:text-base"
            />
            <Button type="button" size="sm" variant="secondary" onClick={addExcluded} className="shrink-0 text-xs">
              افزودن
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {excluded.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-foreground"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeExcluded(i)}
                  aria-label={`حذف «${item}»`}
                  className="-m-1 inline-flex size-6 min-h-11 min-w-11 items-center justify-center text-lg leading-none text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* دیالوگ تأیید ساخت روزهای خالی (موج ۱، قلم ۶): وقتی برنامه روز دارد */}
      <AlertDialog
        open={confirmBuildDays !== null}
        onOpenChange={(open) => { if (!open) setConfirmBuildDays(null); }}
        title={confirmBuildDays ? `${fa(confirmBuildDays.length)} روز خالی ساخته شود؟` : ''}
        description={confirmBuildDays ? `روزهای ${confirmBuildDays.map((d) => fa(d)).join('، ')} به برنامه اضافه می‌شوند؛ روزهای فعلی دست نمی‌خورند.` : ''}
        confirmText="ساخت روزها"
        onConfirm={() => { if (confirmBuildDays) buildEmptyDays(confirmBuildDays); }}
      />

      {/* دیالوگ تأیید حذف روز برنامه (C3-2): شماره/عنوان روز + پیامد شماره‌گذاری مجدد */}
      <AlertDialog
        open={removeDayTarget !== undefined}
        onOpenChange={(open) => { if (!open) setConfirmRemoveDay(null); }}
        title={removeDayTarget ? `روز ${fa(removeDayTarget.day)}${removeDayTarget.title ? ` «${removeDayTarget.title}»` : ''} حذف شود؟` : ''}
        description="این روز برای همیشه حذف می‌شود و روزهای بعدی یک شماره جلو کشیده می‌شوند؛ این کار قابل بازگشت نیست."
        confirmText="حذف روز"
        destructive
        onConfirm={() => { if (confirmRemoveDay !== null) handleRemoveDay(confirmRemoveDay); }}
      />
    </div>
  );
}
