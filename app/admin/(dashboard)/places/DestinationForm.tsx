'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { Field, Input } from '@/components/ui/input';
import { NumberField } from '@/components/ui/number-field';
import { Select } from '@/components/ui/select';
import { TagsInput } from '@/components/ui/tags-input';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { fa, faSlug } from '@/lib/utils';
import { saveDestination, checkDestinationSlugUnique, type DestinationInput, type DestinationRow, type FaqItem } from './actions';
import { DESTINATION_CATEGORIES, isValidDestinationCategory } from './categories';

const EMPTY: DestinationInput = { slug: '', name: '', nameEn: '', type: 'city', parentCountrySlug: '', category: '', image: '', heroTagline: '', description: '', bestSeason: '', visaRequired: false, visaType: '', flightDuration: '', currency: '', startingPrice: '', startingPriceNote: '', lastVerifiedAt: '', activeToursCount: 0, popularDistricts: [], keyHighlights: [], travelTips: [], faqs: [], relatedGuides: [] };
const nlToArray = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

export interface CountryOption {
  slug: string;
  name: string;
}

interface DestinationFormProps {
  initial?: DestinationRow | null;
  editingId?: string | null;
  onDone: () => void;
  countries: CountryOption[];
}

export default function DestinationForm({ initial, editingId, onDone, countries: initialCountries }: DestinationFormProps) {
  const src: DestinationInput = initial ? { slug: initial.slug, name: initial.name, nameEn: initial.nameEn, type: initial.type, parentCountrySlug: initial.parentCountrySlug, category: initial.category, image: initial.image, heroTagline: initial.heroTagline, description: initial.description, bestSeason: initial.bestSeason, visaRequired: initial.visaRequired, visaType: initial.visaType, flightDuration: initial.flightDuration, currency: initial.currency, startingPrice: initial.startingPrice, startingPriceNote: initial.startingPriceNote, lastVerifiedAt: initial.lastVerifiedAt, activeToursCount: initial.activeToursCount, popularDistricts: initial.popularDistricts, keyHighlights: initial.keyHighlights, travelTips: initial.travelTips, faqs: initial.faqs, relatedGuides: initial.relatedGuides } : EMPTY;
  const [form, setForm] = useState<DestinationInput>(src);
  const [guidesTxt, setGuidesTxt] = useState((src.relatedGuides ?? []).join('\n'));
  const [faqs, setFaqs] = useState<FaqItem[]>(src.faqs ?? []);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  // قلم ۱۱: نامک خودکار از نام فارسی؛ ویرایش دستی فقط در «پیشرفته».
  const [slugTouched, setSlugTouched] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // قلم ۱۲: انتخاب کشور مادر از فهرست + افزودن کشور تازه همان‌جا.
  const [countries, setCountries] = useState<CountryOption[]>(initialCountries);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountrySlug, setNewCountrySlug] = useState('');
  const [newCountrySlugTouched, setNewCountrySlugTouched] = useState(false);
  const [newCountryAdvancedOpen, setNewCountryAdvancedOpen] = useState(false);
  const [newCountryError, setNewCountryError] = useState('');

  const set = <K extends keyof DestinationInput>(k: K, v: DestinationInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setName = (v: string) => {
    setForm((f) => ({
      ...f,
      name: v,
      // فقط برای رکورد تازه و تا وقتی کاربر دستی به نامک دست نزده، نامک از نام ساخته می‌شود.
      slug: !editingId && !slugTouched ? faSlug(v) : f.slug,
    }));
    setNameError('');
  };

  const addFaq = () => setFaqs((arr) => [...arr, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs((arr) => arr.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, patch: Partial<FaqItem>) => setFaqs((arr) => arr.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const submit = () => {
    const name = (form.name || '').trim();
    const slug = (form.slug || '').trim();
    if (name.length < 2) {
      setNameError('نام مقصد لازم است.');
      return;
    }
    if (!slug) {
      setSlugError('نامک لازم است؛ اول نام فارسی را بنویسید تا خودکار ساخته شود.');
      setExtraOpen(true);
      setAdvancedOpen(true);
      return;
    }
    // ۲-۱۲: دسته‌بندی حتماً یکی از شش‌تایی باشد تا مقصد تازه زیر چیپ فیلتر هاب بنشیند.
    if (!isValidDestinationCategory(form.category)) {
      setCategoryError(
        form.category
          ? `مقدار قبلی «${form.category}» معتبر نیست؛ یکی از شش دسته را انتخاب کنید.`
          : 'دسته‌بندی را انتخاب کنید.',
      );
      return;
    }
    const payload: DestinationInput = {
      ...form,
      name,
      slug,
      activeToursCount: Number(form.activeToursCount) || 0,
      popularDistricts: form.popularDistricts ?? [],
      keyHighlights: form.keyHighlights ?? [],
      travelTips: form.travelTips ?? [],
      relatedGuides: nlToArray(guidesTxt),
      faqs: faqs.filter((f) => f.question.trim() || f.answer.trim()),
    };
    startTransition(async () => {
      try {
        const { unique } = await checkDestinationSlugUnique(slug, editingId ?? null);
        if (!unique) {
          setSlugError('این نامک قبلاً برای مقصد دیگری ثبت شده.');
          setExtraOpen(true);
          setAdvancedOpen(true);
          return;
        }
        await saveDestination(editingId ?? null, payload);
        onDone();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'ذخیره انجام نشد؛ دوباره تلاش کنید.' });
      }
    });
  };

  const handleAddCountry = () => {
    const name = newCountryName.trim();
    const slug = newCountrySlug.trim();
    if (name.length < 2) {
      setNewCountryError('نام کشور لازم است.');
      return;
    }
    if (!slug) {
      setNewCountryError('نامک لازم است.');
      return;
    }
    startTransition(async () => {
      try {
        const { unique } = await checkDestinationSlugUnique(slug);
        if (!unique) {
          setNewCountryError('این نامک قبلاً برای مقصد دیگری ثبت شده.');
          return;
        }
        await saveDestination(null, { ...EMPTY, slug, name, type: 'country' });
        setCountries((cs) => [...cs, { slug, name }].sort((a, b) => a.name.localeCompare(b.name, 'fa')));
        // کشور تازه ساخته‌شده همان‌جا انتخاب می‌شود.
        setForm((f) => ({ ...f, parentCountrySlug: slug }));
        setNewCountryName('');
        setNewCountrySlug('');
        setNewCountrySlugTouched(false);
        setNewCountryError('');
        setShowAddCountry(false);
        toast({ title: `کشور «${name}» ثبت و انتخاب شد.` });
      } catch (e) {
        setNewCountryError(e instanceof Error ? e.message : 'خطا در ثبت کشور.');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'ویرایش مقصد' : 'افزودن مقصد جدید'}</CardTitle>
        <CardDescription>اطلاعات مقصد، نکات سفر و پرسش‌های متداول را وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h3 className="mb-1 text-sm font-semibold">هویت مقصد</h3>
          <p className="mb-3 text-xs text-muted-foreground">همین ۶ فیلد برای ثبت یک مقصد تازه کافی است؛ بقیه در «تکمیلی».</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نام فارسی *" error={nameError}><Input value={form.name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="نام انگلیسی"><Input value={form.nameEn} dir="ltr" onChange={(e) => set('nameEn', e.target.value)} /></Field>
          <Field label="نوع"><Select value={form.type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'city', label: 'شهر' }, { value: 'country', label: 'کشور' }]} /></Field>
          <Field
            label="کشور مادر"
            hint="شهری که ثبت می‌کنید زیر کدام کشور می‌نشیند؟ از فهرست انتخاب کنید."
          >
            <div className="flex gap-2">
              <Select
                className="grow"
                value={form.parentCountrySlug}
                onChange={(e) => {
                  setForm((f) => ({ ...f, parentCountrySlug: e.target.value }));
                }}
                options={[
                  { value: '', label: 'بدون کشور مادر' },
                  ...countries.map((c) => ({ value: c.slug, label: `${c.name} (${c.slug})` })),
                ]}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={() => setShowAddCountry((v) => !v)}
              >
                <Plus className="size-4" />
                کشور تازه
              </Button>
            </div>
          </Field>
          {showAddCountry && (
            <div className="rounded-sm border border-border bg-muted/30 p-4 space-y-3 sm:col-span-2">
              <div className="text-sm font-semibold">افزودن کشور تازه</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="نام فارسی کشور *">
                  <Input
                    value={newCountryName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewCountryName(v);
                      if (!newCountrySlugTouched) setNewCountrySlug(faSlug(v));
                      setNewCountryError('');
                    }}
                    placeholder="مثلاً گرجستان"
                  />
                </Field>
                <Collapsible
                  trigger="پیشرفته"
                  openLabel="بستن بخش پیشرفته"
                  open={newCountryAdvancedOpen}
                  onOpenChange={setNewCountryAdvancedOpen}
                  className="rounded-sm border border-border bg-muted/20 p-3 sm:col-span-2"
                >
                  <Field label="نامک" hint="خودکار از نام ساخته می‌شود؛ معمولاً لازم نیست دست بزنید" error={newCountryError}>
                    <Input
                      dir="ltr"
                      value={newCountrySlug}
                      onChange={(e) => {
                        setNewCountrySlugTouched(true);
                        setNewCountrySlug(e.target.value);
                        setNewCountryError('');
                      }}
                    />
                  </Field>
                </Collapsible>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={pending} onClick={handleAddCountry}>
                  {pending ? 'در حال ثبت…' : 'ثبت کشور'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddCountry(false);
                    setNewCountryName('');
                    setNewCountrySlug('');
                    setNewCountrySlugTouched(false);
                    setNewCountryError('');
                  }}
                >
                  انصراف
                </Button>
              </div>
            </div>
          )}
          {/* ۲-۱۲: دسته‌بندی از متن آزاد به انتخاب از شش‌تاییِ Place['category'].
              مقدار قدیمیِ خارج از شش‌تایی (اگر باشد) به‌عنوان «مقدار قبلی» نشان
              داده می‌شود تا هنگام ویرایش، آگاهانه جایگزین شود. */}
          <Field
            label="دسته‌بندی *"
            hint="مشخص می‌کند مقصد زیر کدام فیلتر در هاب مقصدهای سایت دیده می‌شود."
            error={categoryError}
          >
            <Select
              value={form.category}
              onChange={(e) => { set('category', e.target.value); setCategoryError(''); }}
              placeholder="انتخاب دسته‌بندی…"
              options={[
                ...(form.category && !isValidDestinationCategory(form.category)
                  ? [{ value: form.category, label: `«${form.category}» (مقدار قبلی)` }]
                  : []),
                ...DESTINATION_CATEGORIES.map((c) => ({ value: c.value as string, label: c.label })),
              ]}
            />
          </Field>
          <Field label="تصویر" hint="آدرس کامل تصویر؛ فقط Unsplash"><Input value={form.image} dir="ltr" onChange={(e) => set('image', e.target.value)} /></Field>
          </div>
        </div>

        <Collapsible
          trigger="تکمیلی"
          openLabel="بستن بخش تکمیلی"
          open={extraOpen}
          onOpenChange={setExtraOpen}
          className="rounded-sm border border-border bg-muted/20 p-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="شعار هدر"><Input value={form.heroTagline} onChange={(e) => set('heroTagline', e.target.value)} /></Field>
          <Field label="بهترین فصل"><Input value={form.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} /></Field>
          <Field label="ویزا لازم است؟"><Select value={form.visaRequired ? 'yes' : 'no'} onChange={(e) => set('visaRequired', e.target.value === 'yes')} options={[{ value: 'no', label: 'خیر' }, { value: 'yes', label: 'بله' }]} /></Field>
          <Field label="نوع ویزا"><Input value={form.visaType} onChange={(e) => set('visaType', e.target.value)} /></Field>
          <Field label="مدت پرواز"><Input value={form.flightDuration} onChange={(e) => set('flightDuration', e.target.value)} /></Field>
          <Field label="واحد پول"><Input value={form.currency} onChange={(e) => set('currency', e.target.value)} /></Field>
          <Field label="شروع قیمت"><Input value={form.startingPrice} onChange={(e) => set('startingPrice', e.target.value)} /></Field>
          <Field label="یادداشت شروع قیمت"><Input value={form.startingPriceNote} onChange={(e) => set('startingPriceNote', e.target.value)} /></Field>
          <Field label="آخرین راستی‌آزمایی"><Input value={form.lastVerifiedAt} onChange={(e) => set('lastVerifiedAt', e.target.value)} /></Field>
          <Field label="تعداد تورهای فعال"><NumberField value={Number(form.activeToursCount) || 0} onChange={(v) => set('activeToursCount', v)} min={0} aria-label="تعداد تورهای فعال" /></Field>
        </div>

        <div className="grid gap-4">
          <Field label="توضیحات" hint="حداکثر ۱۲۰۰ نویسه"><Textarea autoResize showCount maxLength={1200} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <Field label="محله‌های محبوب" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.popularDistricts ?? []} onChange={(v) => set('popularDistricts', v)} placeholder="مثلاً شهر قدیم" /></Field>
          <Field label="جاذبه‌های کلیدی" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.keyHighlights ?? []} onChange={(v) => set('keyHighlights', v)} placeholder="مثلاً برج میلاد" /></Field>
          <Field label="نکات سفر" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.travelTips ?? []} onChange={(v) => set('travelTips', v)} placeholder="مثلاً بهترین زمان سفر" /></Field>
          <Field label="راهنماهای مرتبط" hint="نامک‌ها، هر خط یک مورد"><Textarea value={guidesTxt} dir="ltr" onChange={(e) => setGuidesTxt(e.target.value)} /></Field>
        </div>

        <div className="space-y-3 border-t pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">پرسش‌های متداول</h3>
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>افزودن پرسش</Button>
          </div>
          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز پرسشی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-3 rounded-sm border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">پرسش {fa(idx + 1)}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(idx)}>حذف پرسش</Button>
                  </div>
                  <Input placeholder="پرسش…" value={faq.question} onChange={(e) => updateFaq(idx, { question: e.target.value })} />
                  <Textarea placeholder="پاسخ…" value={faq.answer} onChange={(e) => updateFaq(idx, { answer: e.target.value })} />
                </div>
              ))}
            </div>
          )}
        </div>

        <Collapsible
          trigger="پیشرفته"
          openLabel="بستن بخش پیشرفته"
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          className="rounded-sm border border-border bg-muted/20 p-4"
        >
          <Field
            label="نامک"
            hint="آدرس اینترنتی این مقصد در سایت؛ خودکار از نام فارسی ساخته می‌شود و معمولاً لازم نیست دست بزنید"
            error={slugError}
          >
            <Input
              dir="ltr"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
                setSlugError('');
              }}
            />
          </Field>
        </Collapsible>
        </Collapsible>

        <div className="sticky bottom-0 z-10 -mx-5 -mb-5 border-t border-border bg-card/95 px-5 py-3 backdrop-blur">
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending} className="min-h-11 flex-1 sm:min-h-0 sm:flex-none">{pending ? 'در حال ذخیره…' : editingId ? 'ذخیره تغییرات' : 'ثبت مقصد'}</Button>
            <Button type="button" variant="outline" onClick={onDone} className="min-h-11 flex-1 sm:min-h-0 sm:flex-none">انصراف</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
