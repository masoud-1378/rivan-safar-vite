'use client';

import React, { useMemo, useRef, useState } from 'react';
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
  Building,
  Search,
  Info,
  Plus,
  RefreshCw,
  ImagePlus,
  Loader2,
  FileCheck2
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AmountInput } from '@/components/ui/amount-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/toast';
import { cn, fa, formatToman } from '@/lib/utils';
import { normalizeFaSearch } from '@/lib/persian';
import { faToSlugFa, CAPACITY_OPTIONS } from '../tour-helpers';
import { DepartureDateField } from '../DepartureDateField';
import { uploadTourBanner } from '../banner-upload';
import SmartImage from '@/src/components/SmartImage';
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
  { value: 'foreign', label: 'تور خارجی (آماده)' },
  { value: 'domestic', label: 'تور داخلی (گروهی یا انفرادی)' },
  { value: 'exhibition', label: 'تور نمایشگاهی و تجاری' },
];

const TRANSPORT_OPTIONS: Array<{ id: 'air' | 'land' | 'rail' | 'sea' | 'mixed'; label: string; icon: typeof Plane; placeholder: string }> = [
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
        // ناحیهٔ لمسی نامرئی تا ~۳۲px (تا لبهٔ gap، بدون هم‌پوشانی با دکمهٔ مجاور)؛ خود باکس ۱۶px می‌ماند.
        'relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors after:absolute after:-inset-2 after:content-[""]',
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
  // نامک خودکار: تا وقتی کاربر دستی به نامک دست نزده و نامکی هم از قبل ثبت نشده،
  // با هر نویسهٔ عنوان از نو ساخته می‌شود (گشت، ایراد ۳: قبلاً فقط نویسهٔ اول می‌ماند و «t» می‌شد).
  const [slugAuto, setSlugAuto] = useState(() => !data.slug);
  const [destQuery, setDestQuery] = useState('');
  // درخت مقصدها به‌صورت پیش‌فرض جمع است؛ جست‌وجو + تگ‌ها نمای اصلی‌اند (T2).
  const [showTree, setShowTree] = useState(false);
  const [capacity, setCapacity] = useState('');
  const { toast } = useToast();
  // آپلود بنر تور (T6): همان باکت عکس هتل‌ها، کنار فیلد URL.
  const [uploading, setUploading] = useState(false);
  const uploadingRef = useRef(false);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);

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

  // عنوان که عوض شود، اگر نامک هنوز خودکار است (دستی ویرایش نشده و از قبل هم خالی بوده)،
  // با هر نویسه از روی عنوان بازسازی می‌شود؛ قانون «عنوان بعدی نامک موجود را عوض نکند» سر جایش است.
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
      toast({ title: 'بنر آپلود شد', description: 'بنر آپلود شد؛ پیش‌نمایشش را پایین می‌بینید.' });
    } catch (e) {
      toast({
        variant: 'error',
        title: 'بنر آپلود نشد',
        description: e instanceof Error ? e.message : 'دوباره تلاش کنید.',
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
        .filter((a) => (a.type === 'city' || a.type === 'country') && normalizeFaSearch(a.name).includes(destSearchQuery))
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
            <span className="text-[11px] text-muted-foreground">انتشار:</span>
            <Badge variant={data.publishStatus === 'published' ? 'success' : 'warning'}>
              {data.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
            </Badge>
          </span>
          <label className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">ظرفیت:</span>
            <Select
              aria-label="وضعیت ظرفیت"
              value={CAPACITY_OPTIONS.some((o) => o.value === data.status) ? data.status : 'pending'}
              onChange={(e) => {
                const val = e.target.value;
                const opt = CAPACITY_OPTIONS.find((s) => s.value === val);
                onChange({ status: val, statusLabel: opt?.label || val });
              }}
              options={CAPACITY_OPTIONS}
              className="h-10 w-auto text-xs max-md:min-h-11"
            />
          </label>
        </div>
      </div>

      {/* Row 1: Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <Field label="عنوان کامل تور *" hint="مثال: تور ۸ روزه روسیه (مسکو + سن‌پترزبورگ) با قطار سریع‌السیر ساپسان">
            <Input
              value={data.title}
              error={errors.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="عنوان تور را شفاف و گیرا بنویسید…"
              className="font-medium"
            />
          </Field>
        </div>
        <div className="md:col-span-4">
          <Field label="آدرس اینترنتی تور *" hint="از روی عنوان خودکار ساخته می‌شود؛ اگر لازم بود خودتان تغییرش دهید">
            <Input
              dir="ltr"
              value={data.slug}
              error={errors.slug}
              onChange={(e) => { setSlugAuto(false); onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }); }}
              placeholder="e.g. russia-moscow-stpetersburg-8d"
            />
          </Field>
          <button
            type="button"
            onClick={handleSlugRebuild}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
          >
            <RefreshCw className="size-3" />
            بازسازی خودکار از عنوان
          </button>
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
          <label className="flex items-center gap-3 cursor-pointer rounded-sm border border-border bg-card/60 p-3 hover:bg-card transition-colors">
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
              <span className="font-bold text-foreground flex items-center gap-1.5">
                حرکت تضمین‌شده و قطعی
                <span
                  title="یعنی این تور حتماً در تاریخ اعلام‌شده حرکت می‌کند؛ تضمینِ قیمت نیست."
                  className="inline-flex cursor-help"
                >
                  <Info className="size-3.5 text-muted-foreground" />
                </span>
              </span>
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
      <div className="rounded-sm border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            <span>انتخاب مقاصد و شهرهای سفر *</span>
          </label>
          <span className="text-xs text-muted-foreground">
            {selectedSlugs.length > 0 ? `${fa(selectedSlugs.length)} مقصد انتخاب‌شده` : 'حداقل یک مقصد انتخاب کنید'}
          </span>
        </div>
        {/* گشت (ایراد ۴): خطای «مقصد» هیچ‌جا قرمز نشان داده نمی‌شد؛ زیر همان بلوک. */}
        {errors.destinations && (
          <p className="text-xs text-destructive" role="alert">{errors.destinations}</p>
        )}

        {/* جست‌وجوی نام فارسی مقصد: در حالت جست‌وجو، لیست تخت نتایج با انتخاب تک‌کلیکی */}
        <div className="relative">
          <Input
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            placeholder="نام شهر یا کشور را بنویسید… مثلاً: استانبول"
            className="ps-9 text-xs"
          />
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
        </div>
        {destSearchQuery && (
          <div className="max-h-56 overflow-y-auto rounded-sm border border-border/60 divide-y divide-border/40">
            {destSearchResults.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">چیزی پیدا نشد.</p>
            ) : (
              destSearchResults.map((r) => {
                const selected = selectedSlugs.includes(r.slug);
                return (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => toggleSlug(r.slug)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-xs transition-colors min-h-11",
                      selected ? "bg-brand/10" : "hover:bg-accent/40"
                    )}
                  >
                    <span className="flex items-center gap-2 text-foreground">
                      <MapPin className="size-3.5 text-brand shrink-0" />
                      <span className="font-medium">{r.name}</span>
                      <span className="text-[10px] text-muted-foreground">{r.type === 'city' ? 'شهر' : 'کشور'}</span>
                    </span>
                    {selected
                      ? <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                      : <Plus className="size-4 text-muted-foreground shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Selected Destinations Tags */}
        {selectedSlugs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2">
            {selectedSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 rounded-sm bg-brand/10 border border-brand/20 px-2.5 py-1 text-xs font-medium text-brand"
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

        {/* درخت مقصدها (T2): به‌صورت پیش‌فرض جمع؛ نمای اصلی فقط جست‌وجو و تگ‌هاست. */}
        <button
          type="button"
          onClick={() => setShowTree((v) => !v)}
          aria-expanded={showTree}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border/80 p-3 text-xs font-bold text-foreground transition-colors hover:bg-accent/40"
        >
          مرور همهٔ مقصدها
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', showTree && 'rotate-180')} />
        </button>

        {showTree && (
        <div className="space-y-2 rounded-sm border border-border/70 p-3 max-h-72 overflow-y-auto">
          {tree.regions.map((region) => {
            const desc = regionDescendants(region.slug, tree);
            const allOn = desc.length > 0 && desc.every((s) => selectedSlugs.includes(s));
            const open = openRegions[region.slug] ?? false;

            return (
              <div key={region.slug} className="rounded-sm border border-border/60">
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
                        <div key={country.slug} className="rounded-sm bg-muted/30">
                          <div className="flex items-center gap-2 px-2.5 py-1.5">
                            <CheckBox checked={cOn} onToggle={() => toggleMany(cdesc)} label={country.name} />
                            <button
                              type="button"
                              onClick={() => setOpenCountries((p) => ({ ...p, [country.slug]: !cOpen }))}
                              className="flex flex-1 items-center justify-between text-start text-xs font-medium"
                            >
                              <span>{country.name}</span>
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                {country.cities.length > 0 ? `${fa(country.cities.length)} شهر` : ''}
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
              <Select
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
          <span className="text-[11px] text-muted-foreground">برای هر بزرگسال در اتاق دوتخته پایه</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Field
              label="قیمت نمایشی روی کارت تور *"
              hint="این عدد روی کارت تور نمایش داده می‌شود؛ نرخ هر هتل (مرحلهٔ ۲) جداگانه و همان‌جا روی سایت نمایش داده می‌شود."
              error={errors.price}
            >
              <AmountInput
                value={Number(data.price) || 0}
                onChange={(val) => onChange({ price: val || 0 })}
                placeholder="۰"
              />
            </Field>
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
                  className="text-xs h-9"
                />
              </Field>
            </div>
            <div className="text-xs pb-1">
              <span className="text-muted-foreground block">ظرفیت × قیمت پایه</span>
              <span className="font-black text-sm text-foreground">
                {capacityNum > 0 && priceNum > 0 ? formatToman(capacityNum * priceNum) : '—'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground pb-1.5">فقط برای حساب سرانگشتی؛ ذخیره نمی‌شود.</span>
          </div>
        </Collapsible>
      </div>

      {/* تصویر بنر تور (T6): آپلود واقعی کنار فیلد URL + پیش‌نمایش زنده */}
      <div>
        <Field label="تصویر بنر تور" hint="لینک تصویر باکیفیت و بدون واترمارک از Unsplash، یا آپلود مستقیم از همین‌جا">
          <div className="flex gap-2">
            <Input
              dir="ltr"
              value={data.image}
              onChange={(e) => onChange({ image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="grow"
            />
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
            <input
              ref={bannerFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleBannerFile(e.target)}
            />
          </div>
        </Field>
        {/* پیش‌نمایش بنر: عمداً با همان SmartImageِ سایت رندر می‌شود تا اگر آدرس
            روی سایت باز نشود، این‌جا هم خراب دیده شود (نه سالمِ دروغین). */}
        {data.image.trim() ? (
          <div className="relative mt-2 aspect-video overflow-hidden rounded-sm border border-border/70">
            <SmartImage src={data.image.trim()} alt="پیش‌نمایش بنر تور" className="object-cover" />
          </div>
        ) : null}
      </div>

      {/* توضیحات کلی تور (T17): همان متن مرحلهٔ ۵، انتهای مرحلهٔ ۱ */}
      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="size-4 text-brand" />
          <span>توضیحات کلی، مقدمه سفر و نکات تکمیلی</span>
        </h4>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="روایت جذاب و صادقانه از حال و هوای سفر، تجربیات خاص این مسیر و این‌که چرا مسافر باید همین تور را انتخاب کند…"
          className="w-full rounded-sm border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
