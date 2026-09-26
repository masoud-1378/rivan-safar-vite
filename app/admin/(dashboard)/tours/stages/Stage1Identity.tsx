'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Plane, 
  Train, 
  Bus, 
  ChevronDown, 
  X, 
  Check as CheckIcon,
  Sparkles,
  MapPin,
  Building
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AmountInput } from '@/components/ui/amount-input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DestinationTree, OriginRow, TourInput } from '../actions';
import type { TourDraftErrors } from '../tour-helpers';

interface Stage1IdentityProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
  errors: TourDraftErrors;
  tree: DestinationTree;
  origins: OriginRow[];
}

const TYPE_OPTIONS = [
  { value: 'foreign', label: 'تور خارجی (پکیج آماده)' },
  { value: 'domestic', label: 'تور داخلی (گروهی یا انفرادی)' },
  { value: 'exhibition', label: 'تور نمایشگاهی و تجاری' },
];

const TRANSPORT_OPTIONS = [
  { id: 'air', label: 'هوایی (پرواز)', icon: Plane, placeholder: 'نام ایرلاین (مثلاً: ماهان، ایران‌ایر، ترکیش)' },
  { id: 'rail', label: 'ریلی (قطار)', icon: Train, placeholder: 'نام قطار و شرکت ریلی (مثلاً: ۵ ستاره فدک، بن‌ریل، رجاء)' },
  { id: 'land', label: 'زمینی (اتوبوس)', icon: Bus, placeholder: 'نوع اتوبوس (مثلاً: اتوبوس VIP ۲۵ نفره تخت‌شو)' },
];

function regionDescendants(regionSlug: string, tree: DestinationTree): string[] {
  const region = tree.regions.find((r) => r.slug === regionSlug);
  if (!region) return [];
  const out: string[] = [];
  for (const c of region.countries) {
    out.push(c.slug);
    for (const city of c.cities) out.push(city.slug);
  }
  return out;
}

function countryDescendants(regionSlug: string, countrySlug: string, tree: DestinationTree): string[] {
  const region = tree.regions.find((r) => r.slug === regionSlug);
  const country = region?.countries.find((c) => c.slug === countrySlug);
  if (!country) return [countrySlug];
  return [country.slug, ...country.cities.map((c) => c.slug)];
}

function CheckBox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors',
        checked ? 'border-brand bg-brand text-brand-foreground' : 'border-input bg-background/60 hover:border-foreground/40'
      )}
    >
      {checked && <CheckIcon className="size-3" />}
    </button>
  );
}

export default function Stage1Identity({
  data,
  onChange,
  errors,
  tree,
  origins,
}: Stage1IdentityProps) {
  const currentTransport = data.transportKind || (
    /قطار|بن ریل|فدک|رجاء/i.test(data.airline) ? 'rail' :
    /اتوبوس|زمینی|vip/i.test(data.airline) ? 'land' : 'air'
  );

  const selectedSlugs = Array.isArray(data.destinationSlugs) ? data.destinationSlugs : [];
  const nameBySlug = new Map(tree.all.map((a) => [a.slug, a.name]));

  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    tree.regions.forEach((r, i) => {
      out[r.slug] = i === 0 || r.countries.some((c) => selectedSlugs.includes(c.slug) || c.cities.some((x) => selectedSlugs.includes(x.slug)));
    });
    return out;
  });
  const [openCountries, setOpenCountries] = useState<Record<string, boolean>>({});

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

  return (
    <div className="space-y-6">
      {/* Intro info banner */}
      <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Compass className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">مرحله اول: هویت، شیوه حرکت و نرخ پایه</h3>
            <p className="text-xs text-muted-foreground">
              تعیین نام، مقاصد، شیوه ترابری (هوایی، قطار، اتوبوس)، شهر مبدأ و شفافیت کف قیمت
            </p>
          </div>
        </div>
        <Badge variant={data.status === 'published' ? 'success' : 'secondary'}>
          {data.statusLabel || (data.status === 'published' ? 'منتشر شده' : 'پیش‌نویس')}
        </Badge>
      </div>

      {/* Row 1: Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <Field label="عنوان کامل تور *" hint={errors.title || "مثال: تور ۸ روزه روسیه (مسکو + سن‌پترزبورگ) با قطار سریع‌السیر ساپسان"}>
            <Input
              value={data.title}
              error={errors.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="عنوان تور را شفاف و گیرا بنویسید…"
              className="font-medium"
            />
          </Field>
        </div>
        <div className="md:col-span-4">
          <Field label="نامک انگلیسی (Slug) *" hint={errors.slug || "فقط حروف کوچک انگلیسی و خط تیره"}>
            <Input
              dir="ltr"
              value={data.slug}
              error={errors.slug}
              onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="e.g. russia-moscow-stpetersburg-8d"
            />
          </Field>
        </div>
      </div>

      {/* Row 2: Tour Category & Guaranteed Departure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Field label="دسته‌بندی تور">
            <Select
              value={data.type}
              onChange={(e) => {
                const val = e.target.value;
                const opt = TYPE_OPTIONS.find((t) => t.value === val);
                onChange({ type: val, typeLabel: opt?.label || val });
              }}
              options={TYPE_OPTIONS}
            />
          </Field>
        </div>

        {/* Guaranteed Departure toggle */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border bg-card/60 p-3 hover:bg-card transition-colors">
            <input
              type="checkbox"
              checked={Boolean(data.guaranteedDeparture || data.badge === 'حرکت تضمین‌شده')}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  guaranteedDeparture: checked,
                  badge: checked ? 'حرکت تضمین‌شده' : (data.badge === 'حرکت تضمین‌شده' ? '' : data.badge),
                });
              }}
              className="size-4 accent-brand rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-foreground block">حرکت تضمین‌شده و قطعی</span>
              <span className="text-[11px] text-muted-foreground">تور بدون قید و شرط اجرا می‌شود</span>
            </div>
          </label>
        </div>

        {/* Badge tag */}
        <div>
          <Field label="نشان ویژه روی کارت (اختیاری)" hint="مثال: پرواز مستقیم، پیشنهاد ویژه، ویزای فوری">
            <Input
              value={data.badge || ''}
              onChange={(e) => onChange({ badge: e.target.value })}
              placeholder="برچسب ویژه…"
            />
          </Field>
        </div>
      </div>

      {/* Destinations Hierarchy Tree Selector */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            <span>انتخاب مقاصد و شهرهای سفر *</span>
          </label>
          <span className="text-xs text-muted-foreground">
            {selectedSlugs.length > 0 ? `${selectedSlugs.length} مقصد انتخاب شده` : 'حداقل یک مقصد انتخاب کنید'}
          </span>
        </div>

        {/* Selected Destinations Tags */}
        {selectedSlugs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2">
            {selectedSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 rounded-lg bg-brand/10 border border-brand/20 px-2.5 py-1 text-xs font-medium text-brand"
              >
                {nameBySlug.get(slug) || slug}
                <button
                  type="button"
                  onClick={() => toggleSlug(slug)}
                  className="rounded hover:bg-brand/20 p-0.5"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Collapsible tree */}
        <div className="space-y-2 rounded-xl border border-border/70 p-3 max-h-72 overflow-y-auto">
          {tree.regions.map((region) => {
            const desc = regionDescendants(region.slug, tree);
            const allOn = desc.length > 0 && desc.every((s) => selectedSlugs.includes(s));
            const open = openRegions[region.slug] ?? false;

            return (
              <div key={region.slug} className="rounded-lg border border-border/60">
                <div className="flex items-center gap-2 p-2.5 bg-secondary/20">
                  <CheckBox checked={allOn} onToggle={() => toggleMany(desc)} label={region.name} />
                  <button
                    type="button"
                    onClick={() => setOpenRegions((p) => ({ ...p, [region.slug]: !open }))}
                    className="flex flex-1 items-center justify-between text-start text-xs font-bold"
                  >
                    <span>{region.name}</span>
                    <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
                  </button>
                </div>

                {open && (
                  <div className="space-y-2 border-t border-border/60 p-2.5">
                    {region.countries.map((country) => {
                      const cdesc = countryDescendants(region.slug, country.slug, tree);
                      const cOn = cdesc.length > 0 && cdesc.every((s) => selectedSlugs.includes(s));
                      const cOpen = openCountries[country.slug] ?? false;

                      return (
                        <div key={country.slug} className="rounded-md bg-muted/30">
                          <div className="flex items-center gap-2 px-2.5 py-1.5">
                            <CheckBox checked={cOn} onToggle={() => toggleMany(cdesc)} label={country.name} />
                            <button
                              type="button"
                              onClick={() => setOpenCountries((p) => ({ ...p, [country.slug]: !cOpen }))}
                              className="flex flex-1 items-center justify-between text-start text-xs font-medium"
                            >
                              <span>{country.name}</span>
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                {country.cities.length > 0 ? `${country.cities.length} شهر` : ''}
                                <ChevronDown className={cn('size-3 transition-transform', cOpen && 'rotate-180')} />
                              </span>
                            </button>
                          </div>

                          {cOpen && country.cities.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 border-t border-border/50 px-2.5 py-1.5">
                              {country.cities.map((city) => (
                                <label key={city.slug} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent/40">
                                  <CheckBox checked={selectedSlugs.includes(city.slug)} onToggle={() => toggleSlug(city.slug)} label={city.name} />
                                  <span>{city.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Transport Kind Selector (Air vs Rail vs Land) */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4">
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
                  "flex items-center gap-3 rounded-xl border p-3.5 text-right transition-all",
                  isSelected
                    ? "border-brand bg-brand/10 text-foreground font-bold shadow-sm"
                    : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">
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
            currentTransport === 'rail' ? 'نام قطار و شرکت ریلی' : 'نوع اتوبوس و شرکت حمل‌ونقل زمینی'
          }
          hint="در قرارداد رسمی و کارت تور به مسافر نمایش داده می‌شود"
        >
          <Input
            value={data.airline}
            onChange={(e) => onChange({ airline: e.target.value, carrierName: e.target.value })}
            placeholder={
              TRANSPORT_OPTIONS.find((t) => t.id === currentTransport)?.placeholder || 'نام شرکت حمل‌ونقل…'
            }
          />
        </Field>
      </div>

      {/* Row 4: Origins & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Field label="مبدأ حرکت مسافر *" hint={errors.origin || "شهر یا پایانه‌ای که تور از آن شروع می‌شود"}>
            <Select
              value={data.origin}
              onChange={(e) => onChange({ origin: e.target.value })}
              options={origins.map((o) => ({ value: o.slug, label: o.nameFa }))}
              placeholder="انتخاب شهر مبدأ…"
            />
          </Field>
        </div>

        <div>
          <Field label="مدت اقامت و تعداد شب‌ها *" hint="مثال: ۳ شب و ۴ روز">
            <div className="flex gap-2">
              <Input
                value={data.duration}
                onChange={(e) => onChange({ duration: e.target.value })}
                placeholder="۳ شب و ۴ روز"
                className="grow"
              />
              <div className="w-24 shrink-0">
                <Input
                  type="number"
                  min="0"
                  value={data.nights || ''}
                  onChange={(e) => onChange({ nights: Number(e.target.value) || 0 })}
                  placeholder="شب‌ها"
                  title="تعداد شب"
                />
              </div>
            </div>
          </Field>
        </div>
      </div>

      {/* Row 5: Price & Currency Transparency */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">
            قیمت‌گذاری پایه و شفافیت ارزی / تومانی *
          </label>
          <span className="text-[11px] text-muted-foreground">برای هر بزرگسال در اتاق دو تخته پایه</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Field label="قیمت پایه تومانی *" hint={errors.price || "رقم تمام‌شده تومانی (یا سهم پرواز/بخش ریالی)"}>
              <AmountInput
                value={Number(data.price) || 0}
                onChange={(val) => onChange({ price: val || 0 })}
                placeholder="مبلغ به تومان…"
              />
            </Field>
          </div>

          <div>
            <Field label="بخش ارزی تور (اختیاری - ویژه تورهای خارجی)" hint="مثال: ۱,۸۹۰ دلار برای هتل و خدمات خارج">
              <div className="flex gap-2">
                <Input
                  value={data.splitPriceAmount || ''}
                  onChange={(e) => onChange({ splitPriceAmount: e.target.value })}
                  placeholder="مبلغ ارزی (مثلاً: 1890)"
                  className="grow font-mono"
                />
                <select
                  value={data.splitPriceCurrency || 'USD'}
                  onChange={(e) => onChange({ splitPriceCurrency: e.target.value })}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold"
                >
                  <option value="USD">دلار ($)</option>
                  <option value="EUR">یورو (€)</option>
                  <option value="AED">درهم (AED)</option>
                </select>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Image URL */}
      <Field label="لینک تصویر بنر یا هیرو تور" hint="لینک تصویر باکیفیت و بدون واترمارک">
        <Input
          dir="ltr"
          value={data.image}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder="https://images.unsplash.com/..."
        />
      </Field>
    </div>
  );
}
