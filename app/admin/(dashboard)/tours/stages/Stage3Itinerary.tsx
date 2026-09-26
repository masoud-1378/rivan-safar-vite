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
  XCircle
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

export default function Stage3Itinerary({ data, onChange }: Stage3ItineraryProps) {
  const itinerary: TourItineraryDayItem[] = Array.isArray(data.itineraryDays) ? data.itineraryDays : [];
  const included: string[] = Array.isArray(data.includedServices) ? data.includedServices : [];
  const excluded: string[] = Array.isArray(data.excludedServices) ? data.excludedServices : [];

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
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Map className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله سوم: برنامه سفر روزبه‌روز و خدمات</h3>
            <p className="text-xs text-muted-foreground">
              تدوین شفاف زمان‌بندی روزانه (روز ۱ تا N)، گشت‌های گروهی، گشت‌های اختیاری و وعده‌های غذایی گنجانده‌شده
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddDay}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
        >
          <Plus className="size-4" />
          افزودن روز برنامه
        </Button>
      </div>

      {/* Day by Day list */}
      {itinerary.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-8 text-center">
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
              className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                    روز {dayItem.day}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {dayItem.title || `فعالیت روز ${dayItem.day}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDay(idx)}
                  className="inline-flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive p-1"
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
                            "flex items-center gap-2 rounded-xl border p-2 text-right transition-colors text-xs",
                            active
                              ? "border-emerald-500 bg-emerald-500/10 font-bold text-foreground"
                              : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                          )}
                        >
                          <Icon className={cn("size-3.5", act.color)} />
                          <span className="truncate text-[11px]">{act.label}</span>
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
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </Field>
            </div>
          ))}
        </div>
      )}

      {/* Included & Excluded Services Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Included Services */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>خدمات رایگان و همراه تور (Included)</span>
          </div>

          <div className="flex gap-2">
            <Input
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
              placeholder="مثال: ترانسفر رفت و برگشت فرودگاهی"
              className="text-xs grow"
            />
            <Button type="button" size="sm" onClick={addIncluded} className="text-xs">
              افزودن
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {included.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-foreground"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeIncluded(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Excluded Services */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <XCircle className="size-4 text-destructive" />
            <span>خدمات غیررایگان یا گشت‌های اختیاری (Excluded)</span>
          </div>

          <div className="flex gap-2">
            <Input
              value={newExcluded}
              onChange={(e) => setNewExcluded(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExcluded())}
              placeholder="مثال: ورودی موزه‌ها، گشت شبانه بالون"
              className="text-xs grow"
            />
            <Button type="button" size="sm" variant="secondary" onClick={addExcluded} className="text-xs">
              افزودن
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {excluded.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-foreground"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeExcluded(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
