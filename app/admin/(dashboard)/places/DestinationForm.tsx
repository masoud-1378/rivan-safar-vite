'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TagsInput } from '@/components/ui/tags-input';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { fa, faSlug } from '@/lib/utils';
import { MediaField } from '@/components/ui/media-library/MediaField';
import { mediaTag, type PickedImage } from '@/components/ui/media-library/types';
import { openMediaPicker } from '@/components/ui/media-library/openMediaPicker';
import { RichEditor } from '@/components/ui/rich-editor';
import { ColumnNotice, useColumnGuard } from '@/components/ui/column-guard';
import { SeoMetaFields } from '@/components/ui/seo-meta-fields';
import {
  cleanRichValue,
  isRichEmpty,
  normalizeRichValue,
  richFromPlainText,
  type JSONContent,
} from '@/lib/rich-text';
import { saveDestination, checkDestinationSlugUnique, checkDestinationDescriptionCol, checkDestinationSeoCols, checkDestinationGalleryCol, type DestinationInput, type DestinationRow, type FaqItem, type GalleryImage } from './actions';
import { DESTINATION_CATEGORIES, isValidDestinationCategory } from './categories';
import { safeErrorMessage } from '@/src/lib/error-message';

/** مقدار اولیهٔ ویرایشگر: اول نسخهٔ غنی (`*_rich`)، اگر خالی بود متن تخت قدیمی. */
function initialRich(
  rich: JSONContent | string | null | undefined,
  plain: string | null | undefined,
): JSONContent | null {
  const json = normalizeRichValue(rich ?? null);
  if (json && !isRichEmpty(json)) return json;
  const t = (plain ?? '').trim();
  return t ? richFromPlainText(t) : null;
}

/** پیش‌نویس پرسش در فرم: سؤال تخت + پاسخ غنی (+ متن تخت قدیمی فقط برای fallback). */
interface FaqDraft {
  question: string;
  answerRich: JSONContent | null;
  answerPlain: string;
}

const EMPTY: DestinationInput = { slug: '', name: '', nameEn: '', type: 'city', parentCountrySlug: '', category: '', image: '', heroTagline: '', descriptionRich: null, metaTitle: '', metaDescription: '', gallery: [], faqsFormat: 'array', bestSeason: '', visaRequired: false, visaType: '', flightDuration: '', currency: '', startingPrice: '', startingPriceNote: '', lastVerifiedAt: '', activeToursCount: 0, popularDistricts: [], keyHighlights: [], travelTips: [], faqs: [], relatedGuides: [] };
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
  const src: DestinationInput = initial ? { slug: initial.slug, name: initial.name, nameEn: initial.nameEn, type: initial.type, parentCountrySlug: initial.parentCountrySlug, category: initial.category, image: initial.image, heroTagline: initial.heroTagline, descriptionRich: initial.descriptionRich ?? null, metaTitle: initial.metaTitle ?? '', metaDescription: initial.metaDescription ?? '', gallery: initial.gallery ?? [], faqsFormat: initial.faqsFormat ?? 'array', bestSeason: initial.bestSeason, visaRequired: initial.visaRequired, visaType: initial.visaType, flightDuration: initial.flightDuration, currency: initial.currency, startingPrice: initial.startingPrice, startingPriceNote: initial.startingPriceNote, lastVerifiedAt: initial.lastVerifiedAt, activeToursCount: initial.activeToursCount, popularDistricts: initial.popularDistricts, keyHighlights: initial.keyHighlights, travelTips: initial.travelTips, faqs: initial.faqs, relatedGuides: initial.relatedGuides } : EMPTY;
  const [form, setForm] = useState<DestinationInput>(src);
  const [guidesTxt, setGuidesTxt] = useState((src.relatedGuides ?? []).join('\n'));
  // توضیحات با ویرایشگر کامل؛ خوانش اول از description_rich، بعد متن تخت قدیمی.
  const [descriptionRich, setDescriptionRich] = useState<JSONContent | null>(() =>
    initialRich(initial?.descriptionRich, initial?.description),
  );
  const [faqs, setFaqs] = useState<FaqDraft[]>(() =>
    (src.faqs ?? []).map((f: FaqItem) => ({
      question: f.question,
      answerRich: initialRich(f.answerRich, f.answer),
      answerPlain: f.answer,
    })),
  );
  const [gallery, setGallery] = useState<GalleryImage[]>(src.gallery ?? []);
  // نگهبان ستون‌های تازه (الگوی مصوب QA): اگر مایگریشن 0030/0032 هنوز اجرا
  // نشده، کنار همان فیلد اطلاع صادقانه و غیربلاک‌کننده نشان می‌دهیم.
  const descriptionColReady = useColumnGuard(checkDestinationDescriptionCol);
  const seoColsReady = useColumnGuard(checkDestinationSeoCols);
  const galleryColReady = useColumnGuard(checkDestinationGalleryCol);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  // تصویر اصلی مقصد: آپلود تازه / انتخاب از کتابخانه / لینک دستی.
  // form.image همان url است و به اکشن ذخیره می‌رسد؛ کپشن و alt در خودِ
  // مقدار می‌ماند تا ستون‌هایش به دیتابیس اضافه شود.
  const [heroImg, setHeroImg] = useState<PickedImage | null>(
    src.image ? { url: src.image } : null,
  );
  const onHeroImg = (p: PickedImage | null) => {
    setHeroImg(p);
    set('image', p?.url ?? '');
  };

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

  const addFaq = () => setFaqs((arr) => [...arr, { question: '', answerRich: null, answerPlain: '' }]);
  const removeFaq = (idx: number) => setFaqs((arr) => arr.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, patch: Partial<FaqDraft>) => setFaqs((arr) => arr.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  // عکس داخل متن توضیحات از کتابخانهٔ رسانه (تگ مقصد).
  const pickDescriptionImage = () =>
    openMediaPicker({ tag: mediaTag('destination', form.slug), title: 'انتخاب عکس برای متن توضیحات' });

  const addGalleryImage = async () => {
    const picked = await openMediaPicker({
      tag: mediaTag('destination', form.slug),
      title: 'افزودن تصویر به گالری مقصد',
    });
    if (picked) {
      setGallery((g) => [...g, { url: picked.url, caption: picked.caption ?? '', alt: picked.alt ?? '' }]);
    }
  };
  const removeGalleryImage = (idx: number) => setGallery((g) => g.filter((_, i) => i !== idx));
  const updateGalleryImage = (idx: number, patch: Partial<GalleryImage>) =>
    setGallery((g) => g.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

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
      // توضیحات غنی در description_rich ذخیره می‌شود؛ ستون متنی قدیمی
      // (description) دست نمی‌خورد و فقط fallback می‌ماند.
      descriptionRich: cleanRichValue(descriptionRich),
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      gallery: gallery.filter((g) => g.url.trim() !== ''),
      faqsFormat: initial?.faqsFormat ?? 'array',
      faqs: faqs
        .filter((f) => f.question.trim() || !isRichEmpty(f.answerRich) || f.answerPlain.trim())
        .map((f) => ({
          question: f.question.trim(),
          // متن تخت قدیمی همان که بود می‌ماند (fallback)؛ نسخهٔ غنی در answer_rich.
          answer: f.answerPlain,
          answerRich: cleanRichValue(f.answerRich),
        })),
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
        const result = await saveDestination(editingId ?? null, payload);
        // ایراد ۱۸: اگر نامک عوض شده، به ادمین بگو پیوند تورها هم به‌روز شد.
        if (result.slugChanged) {
          toast({ title: `نامک عوض شد؛ پیوند ${fa(result.updatedTours)} تور متصل به‌روز شد.` });
        }
        onDone();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'ذخیره انجام نشد؛ دوباره تلاش کنید.') });
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
        setNewCountryError(safeErrorMessage(e, 'خطا در ثبت کشور.'));
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
                  <Field label="نامک" hint="خودکار از نام ساخته می‌شود؛ فقط حروف انگلیسی، عدد، خط تیره و آندرلاین" error={newCountryError}>
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
          <MediaField
            label="تصویر"
            hint="تصویر اصلی مقصد که روی کارت و صفحهٔ مقصد نمایش داده می‌شود."
            value={heroImg}
            onChange={onHeroImg}
            tag={mediaTag('destination', form.slug)}
            tagLabel="مقصد"
          />
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
          {/* ایراد ۱۷: شمارش «تور فعال» همیشه خودکار از تورهای منتشرشده ساخته می‌شود
              (db-content.ts)؛ فیلد دستی از فرم برداشته شد تا ادمین را گمراه نکند.
              ستون دیتابیس سر جایش است و فقط در حالت فالبک استاتیک به کار می‌آید. */}
        </div>

        <div className="grid gap-4">
          {/* توضیحات کامل با ویرایشگر غنی؛ بدون هیچ سقف کاراکتری (دستور مسعود). */}
          <Field
            label="توضیحات"
            hint="متن کامل معرفی مقصد؛ تیتر، لیست، لینک و عکس هم می‌شود گذاشت."
          >
            <RichEditor
              variant="full"
              value={descriptionRich}
              onChange={setDescriptionRich}
              pickImage={pickDescriptionImage}
              placeholder="معرفی کامل مقصد…"
            />
            {descriptionColReady === false && (
              <ColumnNotice>ذخیرهٔ این فیلد به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شود.</ColumnNotice>
            )}
          </Field>

          <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">گالری تصاویر</h3>
              <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>افزودن تصویر</Button>
            </div>
            <p className="text-xs text-muted-foreground">چند عکس از کتابخانهٔ رسانه برای این مقصد.</p>
            {galleryColReady === false && (
              <ColumnNotice>ذخیرهٔ این فیلد به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شود.</ColumnNotice>
            )}
            {gallery.length === 0 ? (
              <p className="text-sm text-muted-foreground">هنوز تصویری به گالری اضافه نشده است.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((g, idx) => (
                  <div key={idx} className="space-y-2 rounded-sm border border-border bg-muted/30 p-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.url} alt={g.alt || form.name} className="h-full w-full object-cover" />
                    </div>
                    <Input
                      value={g.caption}
                      onChange={(e) => updateGalleryImage(idx, { caption: e.target.value })}
                      placeholder="کپشن (اختیاری)…"
                      className="text-xs"
                    />
                    <Button type="button" variant="ghost" size="sm" className="w-full text-destructive" onClick={() => removeGalleryImage(idx)}>
                      حذف از گالری
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-5">
            <h3 className="text-sm font-semibold">سئو</h3>
            {seoColsReady === false && (
              <ColumnNotice>ذخیرهٔ این فیلد به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شود.</ColumnNotice>
            )}
            <SeoMetaFields
              metaTitle={form.metaTitle}
              onMetaTitleChange={(v) => set('metaTitle', v)}
              metaDescription={form.metaDescription}
              onMetaDescriptionChange={(v) => set('metaDescription', v)}
              titleFallback={form.name}
              urlPreview={form.slug ? `/destination/${form.slug}` : ''}
            />
          </div>

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
                  {/* پاسخ با ویرایشگر سبک (bold/لیست/لینک)؛ در answer_rich ذخیره می‌شود. */}
                  <RichEditor
                    variant="light"
                    value={faq.answerRich}
                    onChange={(json) => updateFaq(idx, { answerRich: json })}
                    placeholder="پاسخ…"
                  />
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
            hint={
              editingId && initial && form.slug.trim().toLowerCase() !== (initial.slug || '').trim().toLowerCase()
                ? 'نامک عوض شده؛ آدرس این صفحه در سایت عوض می‌شود ولی پیوند تورهای متصل خودکار به‌روز می‌شود.'
                : 'آدرس اینترنتی این مقصد در سایت؛ خودکار از نام فارسی ساخته می‌شود. فقط حروف انگلیسی، عدد، خط تیره و آندرلاین.'
            }
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

        {/* نوار اکشن پایین — در موبایل با fixed واقعاً به کف ویوپورت می‌چسبد
            (stickyِ bottom به‌عنوان آخرین فرزند هیچ‌وقت نمی‌چسبید)؛ در دسکتاپ
            همان نوار چسبان لبهٔ کارت. */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:sticky md:bottom-0 md:z-10 md:-mx-5 md:-mb-5">
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending} className="min-h-11 flex-1 sm:min-h-0 sm:flex-none">{pending ? 'در حال ذخیره…' : editingId ? 'ذخیره تغییرات' : 'ثبت مقصد'}</Button>
            <Button type="button" variant="outline" onClick={onDone} className="min-h-11 flex-1 sm:min-h-0 sm:flex-none">انصراف</Button>
          </div>
        </div>
        {/* فاصلهٔ نگه‌دارنده در موبایل: نوار fixed نباید روی محتوای پایانی کارت بیاید */}
        <div aria-hidden="true" className="h-24 md:hidden" />
      </CardContent>
    </Card>
  );
}
