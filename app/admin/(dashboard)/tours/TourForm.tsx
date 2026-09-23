'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Building2, Check as CheckIcon, ChevronDown, Plus, Sparkles, X } from 'lucide-react';
import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';
import { fa } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  saveTour,
  type DestinationTree,
  type OriginRow,
  type TourInput,
  type TourRow,
} from './actions';
import { listHotels, saveHotel, type HotelRow } from '../hotels/actions';

const TYPE_LABELS: Record<string, string> = {
  domestic: 'تور گروهی',
  foreign: 'پکیج آماده',
  exhibition: 'تور نمایشگاهی',
};

const BADGE_OPTIONS = ['ویزای فوری', 'UALL / All Inclusive', 'ظرفیت محدود', 'پیشنهاد ویژه', 'پرواز مستقیم', 'بدون ویزا'];

const DOMESTIC_SLUGS = [
  'iran',
  'kish',
  'mashhad',
  'qeshm',
  'qeshm-island',
  'shiraz',
  'isfahan',
  'yazd',
  'tabriz',
  'chabahar',
  'kerman',
  'ahvaz',
  'rasht',
  'hamedan',
];

const DOMESTIC_NAME_RE = /کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار|کرمان|اهواز|رشت|همدان|ایران/;

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

function Check({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background/60 hover:border-foreground/40',
      )}
    >
      {checked && <CheckIcon className="size-3.5" />}
    </button>
  );
}

export interface TourFormProps {
  initial?: TourRow | null;
  editingId?: string | null;
  onDone: () => void;
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelRow[];
}

export default function TourForm({ initial, editingId, onDone, tree, origins, hotels }: TourFormProps) {
  const nameBySlug = useMemo(() => new Map(tree.all.map((a) => [a.slug, a.name])), [tree]);
  const metaBySlug = useMemo(() => new Map(tree.all.map((a) => [a.slug, a])), [tree]);
  const originBySlug = useMemo(() => new Map(origins.map((o) => [o.slug, o.nameFa])), [origins]);

  const initialSlugs = useMemo(() => {
    const fromRow = asStrArray(initial?.destinationSlugs);
    if (fromRow.length > 0) return fromRow.filter((s) => nameBySlug.has(s) || s.trim() !== '');
    const match = tree.all.find((a) => a.name === initial?.destination)?.slug;
    return match ? [match] : [];
  }, [initial, tree, nameBySlug]);

  const initialOrigin = useMemo(() => {
    if (!initial?.origin) return '';
    const bySlug = origins.find((o) => o.slug === initial.origin)?.slug;
    if (bySlug) return bySlug;
    const byName = origins.find((o) => o.nameFa === initial.origin)?.slug;
    return byName ?? `custom:${initial.origin}`;
  }, [initial, origins]);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [type, setType] = useState(initial?.type ?? 'foreign');
  const [typeLabel, setTypeLabel] = useState(initial?.typeLabel ?? TYPE_LABELS[initial?.type ?? 'foreign'] ?? 'پکیج آماده');
  const [image, setImage] = useState(initial?.image ?? '');
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [origin, setOrigin] = useState(initialOrigin);
  const [price, setPrice] = useState<number | null>(initial?.price ?? null);
  const [picked, setPicked] = useState<Record<string, { price: number | null; board: string }>>(() => {
    const out: Record<string, { price: number | null; board: string }> = {};
    for (const opt of initial?.hotelOptions ?? []) {
      const h = hotels.find((x) => x.nameFa === opt.name);
      if (h && !out[h.id]) {
        const n = Number(String(opt.pricePerPerson ?? '').replace(/[^\d]/g, ''));
        out[h.id] = { price: Number.isFinite(n) && String(opt.pricePerPerson ?? '').trim() !== '' ? n : null, board: opt.board ?? '' };
      }
    }
    return out;
  });
  const [hotelList, setHotelList] = useState<HotelRow[]>(hotels);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelStars, setNewHotelStars] = useState(5);
  const [newHotelPlace, setNewHotelPlace] = useState('');
  const [savingHotel, startSavingHotel] = useTransition();
  const [badgeSel, setBadgeSel] = useState(BADGE_OPTIONS.includes(initial?.badge ?? '') ? (initial?.badge as string) : '');
  const [badgeCustom, setBadgeCustom] = useState(BADGE_OPTIONS.includes(initial?.badge ?? '') ? '' : (initial?.badge ?? ''));
  const [airline, setAirline] = useState(initial?.airline ?? '');
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [nights, setNights] = useState(initial?.nights ?? 0);
  const [closestDeparture, setClosestDeparture] = useState(initial?.closestDeparture ?? '');
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [included, setIncluded] = useState<string[]>(initial?.includedServices ?? []);
  const [excluded, setExcluded] = useState<string[]>(initial?.excludedServices ?? []);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'pending');
  const [statusLabel, setStatusLabel] = useState(initial?.statusLabel ?? '');
  const [visa, setVisa] = useState(initial?.visaRequired ?? false);
  const [pending, startTransition] = useTransition();
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    tree.regions.forEach((r, i) => {
      out[r.slug] = i === 0 || r.countries.some((c) => initialSlugs.includes(c.slug) || c.cities.some((x) => initialSlugs.includes(x.slug)));
    });
    return out;
  });
  const [openCountries, setOpenCountries] = useState<Record<string, boolean>>({});

  const toggleSlug = (s: string) => setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleMany = (slugs: string[]) =>
    setSelected((prev) => (slugs.every((s) => prev.includes(s)) ? prev.filter((x) => !slugs.includes(x)) : [...new Set([...prev, ...slugs])]));

  const isDomestic = (s: string): boolean => {
    if (DOMESTIC_SLUGS.includes(s)) return true;
    let cur = metaBySlug.get(s);
    if (!cur) return false;
    if (DOMESTIC_NAME_RE.test(cur.name)) return true;
    for (let i = 0; i < 10 && cur; i++) {
      if (cur.slug === 'iran') return true;
      const p = cur.parent;
      if (!p) return false;
      if (p === 'iran' || DOMESTIC_SLUGS.includes(p)) return true;
      cur = metaBySlug.get(p);
      if (cur && DOMESTIC_NAME_RE.test(cur.name)) return true;
    }
    return false;
  };
  const allDomestic = selected.length > 0 && selected.every(isDomestic);
  const visaOpen = !allDomestic;
  const effectiveVisa = allDomestic ? false : visa;

  const originName = origin.startsWith('custom:') ? origin.slice(7) : (originBySlug.get(origin) ?? '');
  const destNames = selected.map((s) => nameBySlug.get(s) ?? s);
  const routePreview = destNames.length > 0 ? (originName ? `${originName} به ${destNames.join(' و ')}` : destNames.join(' و ')) : '—';

  const originOptions = useMemo(() => {
    const opts = origins.map((o) => ({ value: o.slug, label: o.nameFa }));
    if (origin.startsWith('custom:')) opts.unshift({ value: origin, label: `${origin.slice(7)} (ثبت‌شده)` });
    return opts;
  }, [origins, origin]);

  const applyTypeLabel = (t: string) => setTypeLabel(TYPE_LABELS[t] ?? '');

  const addHotel = () => {
    if (newHotelName.trim().length < 2) {
      alert('نام هتل لازم است.');
      return;
    }
    startSavingHotel(async () => {
      try {
        await saveHotel({ nameFa: newHotelName.trim(), stars: Math.max(0, Number(newHotelStars) || 0), placeSlug: newHotelPlace, slug: '' });
        const fresh = await listHotels();
        setHotelList(fresh);
        setNewHotelName('');
        setNewHotelStars(5);
        setNewHotelPlace('');
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در ذخیره هتل.');
      }
    });
  };

  const submit = () => {
    if (title.trim().length < 2) {
      alert('عنوان تور لازم است.');
      return;
    }
    if (!slug.trim()) {
      alert('نامک (slug) لازم است.');
      return;
    }
    const hotelOptions = Object.entries(picked)
      .map(([id, v]) => {
        const h = hotelList.find((x) => x.id === id);
        if (!h) return null;
        return { name: h.nameFa, stars: h.stars, board: v.board, pricePerPerson: v.price !== null ? String(v.price) : '' };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const payload: TourInput = {
      slug: slug.trim(),
      title: title.trim(),
      type,
      typeLabel,
      destinationSlugs: selected,
      destination: '',
      origin: origin.startsWith('custom:') ? origin.slice(7) : origin,
      route: '',
      duration,
      nights: Number(nights) || 0,
      closestDeparture,
      price: price ?? 0,
      formattedPrice: '',
      priceNote: '',
      status,
      statusLabel,
      image,
      badge: badgeCustom.trim() || badgeSel,
      features,
      visaRequired: effectiveVisa,
      hotelStars: 0,
      airline,
      includedServices: included,
      excludedServices: excluded,
      hotelOptions,
      description,
    };
    startTransition(async () => {
      try {
        await saveTour(editingId ?? null, payload);
        onDone();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در ذخیره.');
      }
    });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'ویرایش تور' : 'افزودن تور جدید'}</CardTitle>
          <CardDescription>مشخصات اصلی تور؛ نامک همان آدرس صفحه تور در سایت است.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="عنوان تور">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً تور استانبول + آنتالیا" className="h-12 text-base font-bold" />
          </Field>
          <Field label="نامک (اسلاگ)">
            <div className="flex items-stretch gap-0 overflow-hidden rounded-lg border border-input bg-background/60 focus-within:ring-2 focus-within:ring-ring/60">
              <span dir="ltr" className="flex select-none items-center border-e border-border bg-muted/60 px-3 text-xs text-muted-foreground">
                https://rivansafar.ir/tour/
              </span>
              <input
                value={slug}
                dir="ltr"
                onChange={(e) => setSlug(e.target.value)}
                placeholder="istanbul-antalya"
                className="h-10 min-w-0 flex-1 bg-transparent px-3 text-left text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </Field>
          <p dir="ltr" className="text-left text-xs text-muted-foreground">
            {slug.trim() ? `https://rivansafar.ir/tour/${slug.trim()}` : 'نامک را وارد کنید تا آدرس نهایی نمایش داده شود.'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نوع تور">
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  applyTypeLabel(e.target.value);
                }}
                options={[
                  { value: 'foreign', label: 'تور خارجی' },
                  { value: 'domestic', label: 'تور داخلی' },
                  { value: 'exhibition', label: 'تور نمایشگاهی' },
                ]}
              />
            </Field>
            <Field label="برچسب نوع">
              <div className="flex gap-2">
                <Input value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)} className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => applyTypeLabel(type)} className="shrink-0">
                  <Sparkles />
                  پیشنهاد خودکار
                </Button>
              </div>
            </Field>
          </div>
          <Field label="تصویر شاخص">
            <Input value={image} dir="ltr" onChange={(e) => setImage(e.target.value)} placeholder="/images/tours/… یا آدرس کامل" className="text-left" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مقصد و مبدأ</CardTitle>
          <CardDescription>
            {selected.length > 0 ? `${fa(selected.length)} مقصد انتخاب شد` : 'از درخت زیر یک یا چند مقصد انتخاب کنید.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <span key={s} className="inline-flex h-7 items-center gap-1 rounded-md bg-secondary ps-2.5 pe-1 text-xs font-medium text-secondary-foreground">
                  {nameBySlug.get(s) ?? s}
                  <button
                    type="button"
                    aria-label={`حذف ${nameBySlug.get(s) ?? s}`}
                    onClick={() => toggleSlug(s)}
                    className="flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="space-y-2 rounded-xl border border-border p-3">
            {tree.regions.map((region) => {
              const desc = regionDescendants(region.slug, tree);
              const allOn = desc.length > 0 && desc.every((s) => selected.includes(s));
              const open = openRegions[region.slug] ?? false;
              return (
                <div key={region.slug} className="rounded-lg border border-border/70">
                  <div className="flex items-center gap-2 p-2.5">
                    <Check checked={allOn} onToggle={() => toggleMany(desc)} label={region.name} />
                    <button
                      type="button"
                      onClick={() => setOpenRegions((p) => ({ ...p, [region.slug]: !open }))}
                      className="flex flex-1 cursor-pointer items-center justify-between text-start text-sm font-semibold"
                      aria-expanded={open}
                    >
                      {region.name}
                      <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                    </button>
                  </div>
                  {open && (
                    <div className="space-y-2 border-t border-border/70 p-2.5">
                      {region.countries.map((country) => {
                        const cdesc = countryDescendants(region.slug, country.slug, tree);
                        const cOn = cdesc.length > 0 && cdesc.every((s) => selected.includes(s));
                        const cOpen = openCountries[country.slug] ?? false;
                        return (
                          <div key={country.slug} className="rounded-md bg-muted/40">
                            <div className="flex items-center gap-2 px-2.5 py-2">
                              <Check checked={cOn} onToggle={() => toggleMany(cdesc)} label={country.name} />
                              <button
                                type="button"
                                onClick={() => setOpenCountries((p) => ({ ...p, [country.slug]: !cOpen }))}
                                className="flex flex-1 cursor-pointer items-center justify-between text-start text-[13px] font-medium"
                                aria-expanded={cOpen}
                              >
                                {country.name}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {country.cities.length > 0 ? fa(country.cities.length) : ''}
                                  <ChevronDown className={cn('size-3.5 transition-transform', cOpen && 'rotate-180')} />
                                </span>
                              </button>
                            </div>
                            {cOpen && country.cities.length > 0 && (
                              <div className="grid grid-cols-1 gap-1 border-t border-border/60 px-2.5 py-2 sm:grid-cols-2">
                                {country.cities.map((city) => (
                                  <label key={city.slug} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[13px] hover:bg-accent/50">
                                    <Check checked={selected.includes(city.slug)} onToggle={() => toggleSlug(city.slug)} label={city.name} />
                                    <span onClick={(e) => e.preventDefault()} className="cursor-pointer" role="presentation">
                                      {city.name}
                                    </span>
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
          <Field label="مبدأ حرکت">
            {originOptions.length > 0 ? (
              <RadioGroup options={originOptions} value={origin} onChange={setOrigin} />
            ) : (
              <p className="text-sm text-muted-foreground">شهری ثبت نشده است.</p>
            )}
          </Field>
          <Field label="مسیر نهایی (خودکار)">
            <div className="rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2.5 text-sm font-medium">{routePreview}</div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قیمت</CardTitle>
          <CardDescription>فقط مبلغ پایه را وارد کنید؛ بقیه خودکار محاسبه می‌شود.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="قیمت پایه (تومان)">
            <AmountInput value={price} onChange={setPrice} unit="تومان" words />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">یادداشت قیمت ثابت است: برای هر بزرگسال در اتاق دو تخته</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>اقامت</CardTitle>
              <CardDescription>هتل‌های این تور را تیک بزنید و برای هرکدام قیمت و نوع برد را بنویسید.</CardDescription>
            </div>
            <Link href="/admin/hotels">
              <Button variant="outline" size="sm">
                <Building2 />
                مدیریت هتل‌ها
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {hotelList.length === 0 && <p className="text-sm text-muted-foreground">هتلی ثبت نشده است؛ از فرم زیر اضافه کنید.</p>}
          {hotelList.map((h) => {
            const on = Boolean(picked[h.id]);
            return (
              <div key={h.id} className={cn('rounded-xl border p-3 transition-colors', on ? 'border-foreground/30 bg-accent/40' : 'border-border')}>
                <div className="flex items-center gap-2">
                  <Check checked={on} onToggle={() => setPicked((p) => (p[h.id] ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== h.id)) : { ...p, [h.id]: { price: null, board: '' } }))} label={h.nameFa} />
                  <span className="flex-1 text-sm font-semibold">{h.nameFa}</span>
                  <span className="text-xs text-muted-foreground">
                    {fa(h.stars)} ستاره{nameBySlug.get(h.placeSlug) ? ` · ${nameBySlug.get(h.placeSlug)}` : ''}
                  </span>
                </div>
                {on && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="قیمت این هتل (تومان)">
                      <AmountInput value={picked[h.id]?.price ?? null} onChange={(v) => setPicked((p) => ({ ...p, [h.id]: { ...p[h.id], price: v } }))} unit="تومان" words={false} />
                    </Field>
                    <Field label="نوع برد">
                      <Input value={picked[h.id]?.board ?? ''} onChange={(e) => setPicked((p) => ({ ...p, [h.id]: { ...p[h.id], board: e.target.value } }))} placeholder="مثلاً BB / HB / UALL" />
                    </Field>
                  </div>
                )}
              </div>
            );
          })}
          <div className="rounded-xl border border-dashed border-border p-3">
            <p className="mb-3 text-sm font-semibold">هتل جدید</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="نام هتل">
                <Input value={newHotelName} onChange={(e) => setNewHotelName(e.target.value)} placeholder="مثلاً Rixos Premium" />
              </Field>
              <Field label="ستاره">
                <Input type="number" min={0} max={7} value={newHotelStars} onChange={(e) => setNewHotelStars(Number(e.target.value))} />
              </Field>
              <Field label="شهر / مقصد">
                <Select value={newHotelPlace} onChange={(e) => setNewHotelPlace(e.target.value)} options={[{ value: '', label: 'انتخاب کنید…' }, ...tree.all.map((a) => ({ value: a.slug, label: a.name }))]} />
              </Field>
            </div>
            <Button variant="outline" size="sm" onClick={addHotel} disabled={savingHotel} className="mt-3">
              <Plus />
              {savingHotel ? 'در حال ذخیره…' : 'افزودن هتل'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خدمات و جزئیات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نشان (بج)">
              <Select value={badgeSel} onChange={(e) => setBadgeSel(e.target.value)} options={[{ value: '', label: 'بدون نشان' }, ...BADGE_OPTIONS.map((b) => ({ value: b, label: b }))]} />
            </Field>
            <Field label="یا متن دلخواه">
              <Input value={badgeCustom} onChange={(e) => setBadgeCustom(e.target.value)} placeholder="متن دلخواه نشان…" />
            </Field>
            <Field label="ایرلاین">
              <Input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="مثلاً ترکیش ایرلاینز" />
            </Field>
            <Field label="مدت سفر">
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="مثلاً ۷ شب و ۸ روز" />
            </Field>
            <Field label="تعداد شب‌ها">
              <Input type="number" min={0} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
            </Field>
            <Field label="نزدیک‌ترین تاریخ حرکت">
              <Input value={closestDeparture} onChange={(e) => setClosestDeparture(e.target.value)} placeholder="مثلاً ۲۵ آبان" />
            </Field>
            <Field label="وضعیت فروش">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'confirmed', label: 'قطعی' },
                  { value: 'pending', label: 'در انتظار' },
                  { value: 'updating', label: 'در حال به‌روزرسانی' },
                  { value: 'full', label: 'تکمیل ظرفیت' },
                ]}
              />
            </Field>
            <Field label="برچسب وضعیت">
              <Input value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} placeholder="مثلاً ظرفیت محدود" />
            </Field>
          </div>
          <Field label="ویژگی‌ها">
            <TagsInput value={features} onChange={setFeatures} placeholder="ویژگی را بنویسید و Enter بزنید" />
          </Field>
          <Field label="خدمات شامل">
            <TagsInput value={included} onChange={setIncluded} placeholder="خدمت را بنویسید و Enter بزنید" />
          </Field>
          <Field label="خدمات خارج از پکیج">
            <TagsInput value={excluded} onChange={setExcluded} placeholder="خدمت را بنویسید و Enter بزنید" />
          </Field>
          <Field label="توضیحات">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} autoResize className="min-h-28 leading-7" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ویزا</CardTitle>
          <CardDescription>{allDomestic ? 'همه مقصدهای انتخاب‌شده داخلی‌اند؛ ویزا لازم نیست.' : 'آیا این تور به ویزا نیاز دارد؟'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid transition-all duration-300" style={{ gridTemplateRows: visaOpen ? '1fr' : '0fr', opacity: visaOpen ? 1 : 0, overflow: 'hidden' }}>
            <div className="min-h-0 overflow-hidden">
              <Field label="ویزا لازم است؟">
                <Select value={effectiveVisa ? 'yes' : 'no'} onChange={(e) => setVisa(e.target.value === 'yes')} options={[{ value: 'no', label: 'خیر' }, { value: 'yes', label: 'بله' }]} />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onDone}>
            انصراف
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'در حال ذخیره…' : editingId ? 'ذخیره تغییرات' : 'ثبت تور'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function asStrArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
}
