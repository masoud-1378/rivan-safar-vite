'use client';

import { useState, useTransition } from 'react';
import { saveTour, type TourInput, type TourRow } from './actions';

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

const EMPTY: TourInput = {
  slug: '',
  title: '',
  type: 'foreign',
  typeLabel: 'تور خارجی',
  destination: '',
  origin: '',
  route: '',
  duration: '',
  nights: 0,
  closestDeparture: '',
  price: 0,
  formattedPrice: '',
  priceNote: '',
  status: 'pending',
  statusLabel: '',
  image: '',
  badge: '',
  features: [],
  visaRequired: false,
  hotelStars: 5,
  airline: '',
  includedServices: [],
  excludedServices: [],
  hotelOptions: [],
  description: '',
};

function nlToArray(v: string): string[] {
  return v.split('\n').map((s) => s.trim()).filter(Boolean);
}

function arrayToNl(v: string[]): string {
  return (v ?? []).join('\n');
}

export default function TourForm({
  initial,
  editingId,
  onDone,
}: {
  initial?: TourRow | null;
  editingId?: string | null;
  onDone: () => void;
}) {
  const src: TourInput = initial
    ? {
        slug: initial.slug,
        title: initial.title,
        type: initial.type,
        typeLabel: initial.typeLabel,
        destination: initial.destination,
        origin: initial.origin,
        route: initial.route,
        duration: initial.duration,
        nights: initial.nights,
        closestDeparture: initial.closestDeparture,
        price: initial.price,
        formattedPrice: initial.formattedPrice,
        priceNote: initial.priceNote,
        status: initial.status,
        statusLabel: initial.statusLabel,
        image: initial.image,
        badge: initial.badge,
        features: initial.features,
        visaRequired: initial.visaRequired,
        hotelStars: initial.hotelStars,
        airline: initial.airline,
        includedServices: initial.includedServices,
        excludedServices: initial.excludedServices,
        hotelOptions: initial.hotelOptions as TourInput['hotelOptions'],
        description: initial.description,
      }
    : EMPTY;
  const [form, setForm] = useState<TourInput>(src);
  const [featuresTxt, setFeaturesTxt] = useState(arrayToNl(src.features));
  const [includedTxt, setIncludedTxt] = useState(arrayToNl(src.includedServices));
  const [excludedTxt, setExcludedTxt] = useState(arrayToNl(src.excludedServices));
  const [hotelsTxt, setHotelsTxt] = useState(JSON.stringify(src.hotelOptions ?? [], null, 2));
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof TourInput>(k: K, v: TourInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    let hotelOptions: TourInput['hotelOptions'] = [];
    try {
      const parsed = hotelsTxt.trim() ? JSON.parse(hotelsTxt) : [];
      hotelOptions = Array.isArray(parsed) ? parsed : [];
    } catch {
      alert('گزینه‌های هتل JSON معتبر نیست.');
      return;
    }
    const payload: TourInput = {
      ...form,
      nights: Number(form.nights) || 0,
      price: Number(form.price) || 0,
      hotelStars: Number(form.hotelStars) || 0,
      features: nlToArray(featuresTxt),
      includedServices: nlToArray(includedTxt),
      excludedServices: nlToArray(excludedTxt),
      hotelOptions,
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
    <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4">
      <h2 className="text-h4 font-bold text-text-heading">{editingId ? 'ویرایش تور' : 'افزودن تور جدید'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک (slug)">
          <input value={form.slug} dir="ltr" onChange={(e) => set('slug', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="عنوان">
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </Field>
        <Field label="نوع (type)">
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
            <option value="foreign">foreign (خارجی)</option>
            <option value="domestic">domestic (داخلی)</option>
            <option value="exhibition">exhibition (نمایشگاهی)</option>
          </select>
        </Field>
        <Field label="برچسب نوع">
          <input value={form.typeLabel} onChange={(e) => set('typeLabel', e.target.value)} className={inputCls} />
        </Field>
        <Field label="مقصد">
          <input value={form.destination} onChange={(e) => set('destination', e.target.value)} className={inputCls} />
        </Field>
        <Field label="مبدأ">
          <input value={form.origin} onChange={(e) => set('origin', e.target.value)} className={inputCls} />
        </Field>
        <Field label="مسیر">
          <input value={form.route} onChange={(e) => set('route', e.target.value)} className={inputCls} />
        </Field>
        <Field label="مدت">
          <input value={form.duration} onChange={(e) => set('duration', e.target.value)} className={inputCls} />
        </Field>
        <Field label="شب‌ها">
          <input type="number" value={form.nights} onChange={(e) => set('nights', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="نزدیک‌ترین حرکت">
          <input value={form.closestDeparture} onChange={(e) => set('closestDeparture', e.target.value)} className={inputCls} />
        </Field>
        <Field label="قیمت (عدد)">
          <input type="number" value={form.price} dir="ltr" onChange={(e) => set('price', Number(e.target.value))} className={`${inputCls} text-left`} />
        </Field>
        <Field label="قیمت نمایشی">
          <input value={form.formattedPrice} onChange={(e) => set('formattedPrice', e.target.value)} className={inputCls} />
        </Field>
        <Field label="یادداشت قیمت">
          <input value={form.priceNote} onChange={(e) => set('priceNote', e.target.value)} className={inputCls} />
        </Field>
        <Field label="وضعیت (status)">
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
            <option value="confirmed">confirmed (قطعی)</option>
            <option value="pending">pending (در انتظار)</option>
            <option value="updating">updating (در حال به‌روزرسانی)</option>
            <option value="full">full (تکمیل ظرفیت)</option>
          </select>
        </Field>
        <Field label="برچسب وضعیت">
          <input value={form.statusLabel} onChange={(e) => set('statusLabel', e.target.value)} className={inputCls} />
        </Field>
        <Field label="تصویر (URL)">
          <input value={form.image} dir="ltr" onChange={(e) => set('image', e.target.value)} className={`${inputCls} text-left`} />
        </Field>
        <Field label="بج">
          <input value={form.badge} onChange={(e) => set('badge', e.target.value)} className={inputCls} />
        </Field>
        <Field label="ستاره هتل">
          <input type="number" min={0} max={7} value={form.hotelStars} onChange={(e) => set('hotelStars', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="ایرلاین">
          <input value={form.airline} onChange={(e) => set('airline', e.target.value)} className={inputCls} />
        </Field>
        <Field label="ویزا لازم است؟">
          <select value={form.visaRequired ? 'yes' : 'no'} onChange={(e) => set('visaRequired', e.target.value === 'yes')} className={inputCls}>
            <option value="no">خیر</option>
            <option value="yes">بله</option>
          </select>
        </Field>
      </div>
      <Field label="ویژگی‌ها (هر خط یک مورد)">
        <textarea value={featuresTxt} onChange={(e) => setFeaturesTxt(e.target.value)} className={`${inputCls} min-h-[80px]`} />
      </Field>
      <Field label="خدمات شامل (هر خط یک مورد)">
        <textarea value={includedTxt} onChange={(e) => setIncludedTxt(e.target.value)} className={`${inputCls} min-h-[80px]`} />
      </Field>
      <Field label="خدمات خارج (هر خط یک مورد)">
        <textarea value={excludedTxt} onChange={(e) => setExcludedTxt(e.target.value)} className={`${inputCls} min-h-[80px]`} />
      </Field>
      <Field label="گزینه‌های هتل (JSON)">
        <textarea value={hotelsTxt} dir="ltr" onChange={(e) => setHotelsTxt(e.target.value)} className={`${inputCls} min-h-[80px] text-left font-mono`} />
      </Field>
      <Field label="توضیحات">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} min-h-[100px]`} />
      </Field>
      <div className="flex gap-2">
        <button onClick={submit} disabled={pending} className="btn btn-medium btn-primary text-btn font-bold">
          {pending ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت تور'}
        </button>
        <button onClick={onDone} type="button" className="btn btn-medium text-btn font-bold border border-border-default">
          انصراف
        </button>
      </div>
    </div>
  );
}
