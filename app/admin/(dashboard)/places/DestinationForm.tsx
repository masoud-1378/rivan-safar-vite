'use client';

import { useState, useTransition } from 'react';
import { saveDestination, type DestinationInput, type DestinationRow, type FaqItem } from './actions';

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-caption font-bold text-text-heading mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls = 'w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm';

const EMPTY: DestinationInput = {
  slug: '',
  name: '',
  nameEn: '',
  type: 'city',
  parentCountrySlug: '',
  parentCountryName: '',
  category: '',
  image: '',
  heroTagline: '',
  description: '',
  bestSeason: '',
  visaRequired: false,
  visaType: '',
  flightDuration: '',
  currency: '',
  startingPrice: '',
  startingPriceNote: '',
  lastVerifiedAt: '',
  activeToursCount: 0,
  popularDistricts: [],
  keyHighlights: [],
  travelTips: [],
  faqs: [],
  relatedGuides: [],
};

function nlToArray(v: string): string[] {
  return v.split('\n').map((s) => s.trim()).filter(Boolean);
}

function arrayToNl(v: string[]): string {
  return (v ?? []).join('\n');
}

export default function DestinationForm({
  initial,
  editingId,
  onDone,
}: {
  initial?: DestinationRow | null;
  editingId?: string | null;
  onDone: () => void;
}) {
  const src: DestinationInput = initial
    ? {
        slug: initial.slug,
        name: initial.name,
        nameEn: initial.nameEn,
        type: initial.type,
        parentCountrySlug: initial.parentCountrySlug,
        parentCountryName: initial.parentCountryName,
        category: initial.category,
        image: initial.image,
        heroTagline: initial.heroTagline,
        description: initial.description,
        bestSeason: initial.bestSeason,
        visaRequired: initial.visaRequired,
        visaType: initial.visaType,
        flightDuration: initial.flightDuration,
        currency: initial.currency,
        startingPrice: initial.startingPrice,
        startingPriceNote: initial.startingPriceNote,
        lastVerifiedAt: initial.lastVerifiedAt,
        activeToursCount: initial.activeToursCount,
        popularDistricts: initial.popularDistricts,
        keyHighlights: initial.keyHighlights,
        travelTips: initial.travelTips,
        faqs: initial.faqs,
        relatedGuides: initial.relatedGuides,
      }
    : EMPTY;

  const [form, setForm] = useState<DestinationInput>(src);
  const [districtsTxt, setDistrictsTxt] = useState(arrayToNl(src.popularDistricts));
  const [highlightsTxt, setHighlightsTxt] = useState(arrayToNl(src.keyHighlights));
  const [tipsTxt, setTipsTxt] = useState(arrayToNl(src.travelTips));
  const [guidesTxt, setGuidesTxt] = useState(arrayToNl(src.relatedGuides));
  const [faqs, setFaqs] = useState<FaqItem[]>(src.faqs ?? []);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof DestinationInput>(k: K, v: DestinationInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addFaq = () => setFaqs((arr) => [...arr, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs((arr) => arr.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, patch: Partial<FaqItem>) =>
    setFaqs((arr) => arr.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const submit = () => {
    const payload: DestinationInput = {
      ...form,
      activeToursCount: Number(form.activeToursCount) || 0,
      popularDistricts: nlToArray(districtsTxt),
      keyHighlights: nlToArray(highlightsTxt),
      travelTips: nlToArray(tipsTxt),
      relatedGuides: nlToArray(guidesTxt),
      faqs: faqs.filter((f) => f.question.trim() || f.answer.trim()),
    };
    startTransition(async () => {
      try {
        await saveDestination(editingId ?? null, payload);
        onDone();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در ذخیره.');
      }
    });
  };

  return (
    <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4">
      <h2 className="text-h4 font-bold text-text-heading">{editingId ? 'ویرایش مقصد' : 'افزودن مقصد جدید'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک (slug)">
          <input value={form.slug} dir="ltr" onChange={(e) => set('slug', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="نام فارسی">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </Field>
        <Field label="نام انگلیسی">
          <input value={form.nameEn} dir="ltr" onChange={(e) => set('nameEn', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="نوع (type)">
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
            <option value="city">city (شهر)</option>
            <option value="country">country (کشور)</option>
          </select>
        </Field>
        <Field label="اسلاگ کشور مادر">
          <input value={form.parentCountrySlug} dir="ltr" onChange={(e) => set('parentCountrySlug', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="نام کشور مادر">
          <input value={form.parentCountryName} onChange={(e) => set('parentCountryName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="دسته‌بندی (category)">
          <input value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls} />
        </Field>
        <Field label="تصویر (URL)">
          <input value={form.image} dir="ltr" onChange={(e) => set('image', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="شعار هدر (hero tagline)">
          <input value={form.heroTagline} onChange={(e) => set('heroTagline', e.target.value)} className={inputCls} />
        </Field>
        <Field label="بهترین فصل">
          <input value={form.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} className={inputCls} />
        </Field>
        <Field label="ویزا لازم است؟">
          <select value={form.visaRequired ? 'yes' : 'no'} onChange={(e) => set('visaRequired', e.target.value === 'yes')} className={inputCls}>
            <option value="no">خیر</option>
            <option value="yes">بله</option>
          </select>
        </Field>
        <Field label="نوع ویزا">
          <input value={form.visaType} onChange={(e) => set('visaType', e.target.value)} className={inputCls} />
        </Field>
        <Field label="مدت پرواز">
          <input value={form.flightDuration} onChange={(e) => set('flightDuration', e.target.value)} className={inputCls} />
        </Field>
        <Field label="واحد پول">
          <input value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls} />
        </Field>
        <Field label="شروع قیمت">
          <input value={form.startingPrice} onChange={(e) => set('startingPrice', e.target.value)} className={inputCls} />
        </Field>
        <Field label="یادداشت شروع قیمت">
          <input value={form.startingPriceNote} onChange={(e) => set('startingPriceNote', e.target.value)} className={inputCls} />
        </Field>
        <Field label="آخرین راستی‌آزمایی">
          <input value={form.lastVerifiedAt} onChange={(e) => set('lastVerifiedAt', e.target.value)} className={inputCls} />
        </Field>
        <Field label="تعداد تورهای فعال">
          <input type="number" value={form.activeToursCount} onChange={(e) => set('activeToursCount', Number(e.target.value))} className={inputCls} />
        </Field>
      </div>

      <Field label="توضیحات">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} min-h-[100px]`} />
      </Field>

      <Field label="محله‌های محبوب (هر خط یک مورد)">
        <textarea value={districtsTxt} onChange={(e) => setDistrictsTxt(e.target.value)} className={`${inputCls} min-h-[70px]`} />
      </Field>
      <Field label="جاذبه‌های کلیدی (هر خط یک مورد)">
        <textarea value={highlightsTxt} onChange={(e) => setHighlightsTxt(e.target.value)} className={`${inputCls} min-h-[70px]`} />
      </Field>
      <Field label="نکات سفر (هر خط یک مورد)">
        <textarea value={tipsTxt} onChange={(e) => setTipsTxt(e.target.value)} className={`${inputCls} min-h-[70px]`} />
      </Field>
      <Field label="راهنماهای مرتبط (اسلاگ‌ها، هر خط یک مورد)">
        <textarea value={guidesTxt} dir="ltr" onChange={(e) => setGuidesTxt(e.target.value)} className={`${inputCls} min-h-[70px] text-left`} />
      </Field>

      <div className="space-y-3 pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <label className="block text-caption font-bold text-text-heading">پرسش‌های متداول (FAQs)</label>
          <button type="button" onClick={addFaq} className="btn btn-medium text-btn font-bold border border-border-default">
            + افزودن پرسش
          </button>
        </div>
        {faqs.length === 0 ? (
          <p className="text-caption text-text-muted">هنوز پرسشی ثبت نشده است.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3 border border-border-default rounded-control space-y-2 bg-surface-secondary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-caption font-bold text-text-heading">پرسش {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="text-caption text-red-700 font-bold hover:underline"
                  >
                    حذف پرسش
                  </button>
                </div>
                <input
                  placeholder="پرسش..."
                  value={faq.question}
                  onChange={(e) => updateFaq(idx, { question: e.target.value })}
                  className={inputCls}
                />
                <textarea
                  placeholder="پاسخ..."
                  value={faq.answer}
                  onChange={(e) => updateFaq(idx, { answer: e.target.value })}
                  className={`${inputCls} min-h-[60px]`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={submit} disabled={pending} className="btn btn-medium btn-primary text-btn font-bold">
          {pending ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت مقصد'}
        </button>
        <button onClick={onDone} type="button" className="btn btn-medium text-btn font-bold border border-border-default">
          انصراف
        </button>
      </div>
    </div>
  );
}
