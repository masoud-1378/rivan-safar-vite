'use client';

import React from 'react';
import { 
  Map, 
  Plus, 
  Trash2, 
  CalendarDays, 
  Compass, 
  ShoppingBag, 
  Navigation, 
  PlaneTakeoff,
  Utensils,
  CheckCircle2,
  XCircle,
  LayoutTemplate
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { cn, fa, faNumber } from '@/lib/utils';
import type { TourItineraryDayItem, TourInput } from '../actions';

interface Stage3ItineraryProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

const ACTIVITY_TYPES = [
  { id: 'guided', label: 'گشت گروهی با راهنما', icon: Compass, color: 'text-brand' },
  { id: 'free', label: 'وقت آزاد و خرید', icon: ShoppingBag, color: 'text-amber-500' },
  { id: 'transit', label: 'جابجایی بین‌شهری / ترانسفر', icon: Navigation, color: 'text-blue-500' },
  { id: 'departure', label: 'عزیمت و بازگشت به ایران', icon: PlaneTakeoff, color: 'text-purple-500' },
];

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
  const { toast } = useToast();

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const next: TourItineraryDayItem[] = [
      ...itinerary,
      {
        day: nextDayNum,
        title: '',
        city: data.destination || '',
        description: '',
        activityType: nextDayNum === 1 ? 'transit' : 'guided',
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
              تدوین شفاف زمان‌بندی روزانه (روز ۱ تا N)، گشت‌های گروهی، گشت‌های اختیاری و وعده‌های غذایی گنجانده‌شده
            </p>
          </div>
        </div>
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

      {/* Day by Day list */}
      {itinerary.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-border/80 p-8 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground mb-1">هنوز برنامه روزانه‌ای تنظیم نشده است</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            برای شفافیت برنامه سفر و ایجاد آرامش در مسافر، فعالیت‌های هر روز را تفکیک کنید.
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
                      className="text-xs font-medium"
                    />
                  </Field>
                </div>
                <div className="md:col-span-4">
                  <Field label="شهر / محل حضور">
                    <Input
                      value={dayItem.city}
                      onChange={(e) => handleUpdateDay(idx, { city: e.target.value })}
                      placeholder="مثلاً: استانبول"
                      className="text-xs"
                    />
                  </Field>
                </div>
              </div>

              {/* Activity Type & Meals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1.5">نوع فعالیت اصلی</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_TYPES.map((act) => {
                      const Icon = act.icon;
                      const active = dayItem.activityType === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleUpdateDay(idx, { activityType: act.id })}
                          className={cn(
                            "flex min-h-11 min-w-0 items-center gap-2 rounded-sm border p-2 text-start text-xs transition-colors",
                            active
                              ? "border-emerald-500 bg-emerald-500/10 font-bold text-foreground"
                              : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                          )}
                        >
                          <Icon className={cn("size-3.5", act.color)} />
                          <span className="min-w-0 truncate text-[11px]">{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Field label="وعده‌های غذایی گنجانده‌شده در این روز" hint="مثال: صبحانه بوفه هتل + ناهار محلی در گشت">
                    <Input
                      value={dayItem.meals || ''}
                      onChange={(e) => handleUpdateDay(idx, { meals: e.target.value })}
                      placeholder="صبحانه، ناهار یا شام…"
                      className="text-xs"
                    />
                  </Field>
                </div>
              </div>

              {/* Description */}
              <Field label="شرح کامل برنامه‌ها، ساعت حرکت و گشت‌ها">
                <textarea
                  rows={2}
                  value={dayItem.description}
                  onChange={(e) => handleUpdateDay(idx, { description: e.target.value })}
                  placeholder="توضیح دهید مسافر در این روز چه کارهایی انجام می‌دهد، چه جاهایی را می‌بیند و چه ساعتی بازمی‌گردد…"
                  className="w-full rounded-sm border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              className="text-xs grow"
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
              className="text-xs grow"
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

      {/* دیالوگ تأیید حذف روز برنامه (C3-2): شماره/عنوان روز + پیامد شماره‌گذاری مجدد */}
      <AlertDialog
        open={removeDayTarget !== undefined}
        onOpenChange={(open) => { if (!open) setConfirmRemoveDay(null); }}
        title={removeDayTarget ? `روز ${fa(removeDayTarget.day)}${removeDayTarget.title ? ` «${removeDayTarget.title}»` : ''} حذف شود؟` : ''}
        description="این روز برای همیشه حذف می‌شود و روز‌های بعدی یک شماره جلو کشیده می‌شوند؛ این کار قابل بازگشت نیست."
        confirmText="حذف روز"
        destructive
        onConfirm={() => { if (confirmRemoveDay !== null) handleRemoveDay(confirmRemoveDay); }}
      />
    </div>
  );
}
