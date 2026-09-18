'use client';

import { useState, useTransition } from 'react';
import { createProduct, type ProductInput } from './actions';

const TOUR_KINDS = [
  { value: 'foreign', label: 'خارجی' },
  { value: 'domestic', label: 'داخلی' },
  { value: 'combined', label: 'ترکیبی' },
  { value: 'exhibition', label: 'نمایشگاهی' },
];

const COMMON_SERVICES = [
  { slug: 'flight', label: 'پرواز' },
  { slug: 'hotel', label: 'اقامت' },
  { slug: 'transfer', label: 'ترنسفر' },
  { slug: 'leader', label: 'لیدر' },
  { slug: 'insurance', label: 'بیمه' },
  { slug: 'visa', label: 'ویزا' },
];

export default function ProductWizard({ onCreated }: { onCreated: () => void }) {
  const [titleFa, setTitleFa] = useState('');
  const [slug, setSlug] = useState('');
  const [tourKind, setTourKind] = useState('foreign');
  const [stops, setStops] = useState<Array<{ placeSlug: string; nights: number }>>([
    { placeSlug: '', nights: 3 },
  ]);
  const [origins, setOrigins] = useState('');
  const [included, setIncluded] = useState<string[]>(['flight', 'hotel', 'transfer', 'insurance']);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError('');
    const input: ProductInput = {
      titleFa,
      slug: slug || undefined,
      tourKind,
      stops: stops.filter((s) => s.placeSlug.trim()),
      originSlugs: origins.split(',').map((s) => s.trim()).filter(Boolean),
      services: COMMON_SERVICES.map((s) => ({ slug: s.slug, included: included.includes(s.slug) })),
    };
    startTransition(async () => {
      try {
        await createProduct(input);
        setTitleFa('');
        setSlug('');
        setStops([{ placeSlug: '', nights: 3 }]);
        setOrigins('');
        onCreated();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطا در ثبت محصول.');
      }
    });
  };

  return (
    <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4">
      <h2 className="text-h4 font-bold text-text-heading">محصول جدید (مرحله ۱ و ۲)</h2>
      {error ? (
        <p role="alert" className="text-body-sm text-red-700 bg-red-50 border border-red-200 rounded-control px-3 py-2">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-caption font-bold text-text-heading mb-1" htmlFor="p-title">
            عنوان تور <span className="text-red-500">*</span>
          </label>
          <input
            id="p-title"
            value={titleFa}
            onChange={(e) => setTitleFa(e.target.value)}
            placeholder="مثلاً تور استانبول ۴ شب"
            className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm"
          />
        </div>
        <div>
          <label className="block text-caption font-bold text-text-heading mb-1" htmlFor="p-slug">
            نامک (لاتین، اختیاری)
          </label>
          <input
            id="p-slug"
            value={slug}
            dir="ltr"
            onChange={(e) => setSlug(e.target.value)}
            placeholder="istanbul-4n"
            className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-left"
          />
        </div>
      </div>
      <div>
        <span className="block text-caption font-bold text-text-heading mb-1">نوع تور</span>
        <div className="flex flex-wrap gap-2">
          {TOUR_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setTourKind(k.value)}
              className={`chip chip-small ${tourKind === k.value ? 'chip-selected' : ''}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="block text-caption font-bold text-text-heading mb-1">توقف‌ها (اسلاگ مقصد + شب)</span>
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.placeSlug}
                onChange={(e) => {
                  const next = [...stops];
                  next[i] = { ...next[i], placeSlug: e.target.value };
                  setStops(next);
                }}
                placeholder="istanbul"
                dir="ltr"
                className="flex-1 bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left"
              />
              <input
                value={s.nights}
                type="number"
                min={0}
                onChange={(e) => {
                  const next = [...stops];
                  next[i] = { ...next[i], nights: Number(e.target.value) };
                  setStops(next);
                }}
                className="w-20 bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setStops([...stops, { placeSlug: '', nights: 3 }])}
            className="text-link text-body-sm"
          >
            + افزودن توقف
          </button>
        </div>
      </div>
      <div>
        <label className="block text-caption font-bold text-text-heading mb-1" htmlFor="p-origins">
          مبدأها (اسلاگ، با ویرگول جدا کنید)
        </label>
        <input
          id="p-origins"
          value={origins}
          dir="ltr"
          onChange={(e) => setOrigins(e.target.value)}
          placeholder="tehran,karaj"
          className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-left"
        />
      </div>
      <div>
        <span className="block text-caption font-bold text-text-heading mb-1">خدمات شامل</span>
        <div className="flex flex-wrap gap-2">
          {COMMON_SERVICES.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() =>
                setIncluded((prev) =>
                  prev.includes(s.slug) ? prev.filter((x) => x !== s.slug) : [...prev, s.slug],
                )
              }
              className={`chip chip-small ${included.includes(s.slug) ? 'chip-selected' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="btn btn-medium btn-primary text-btn font-bold"
      >
        {pending ? 'در حال ثبت...' : 'ثبت محصول'}
      </button>
    </div>
  );
}
