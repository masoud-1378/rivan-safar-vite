'use client';

import { useState, useTransition } from 'react';
import { createPlace, createOrigin, createCarrier, createHotel, deletePlace } from './actions';

function useSubmit() {
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>, clear?: () => void) => {
    setMessage('');
    startTransition(async () => {
      try {
        await fn();
        setMessage('ثبت شد.');
        if (clear) clear();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'خطا در ثبت.');
      }
    });
  };
  return { message, pending, run };
}

function Field({ label, children, htmlFor }: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-caption font-bold text-text-heading mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm';

function PlaceForm() {
  const { message, pending, run } = useSubmit();
  const [slug, setSlug] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [type, setType] = useState<'region' | 'country' | 'city' | 'island'>('city');
  return (
    <MiniForm
      title="مکان جدید (کشور/شهر/جزیره)"
      message={message}
      pending={pending}
      onSubmit={() => run(() => createPlace({ slug, nameFa, type }), () => { setSlug(''); setNameFa(''); })}
    >
      <Field label="نام فارسی" htmlFor="pl-name">
        <input id="pl-name" value={nameFa} onChange={(e) => setNameFa(e.target.value)} className={inputCls} />
      </Field>
      <Field label="اسلاگ لاتین" htmlFor="pl-slug">
        <input id="pl-slug" value={slug} dir="ltr" onChange={(e) => setSlug(e.target.value)} className={`${inputCls} text-left`} />
      </Field>
      <Field label="نوع">
        <div className="flex flex-wrap gap-2">
          {([['country', 'کشور'], ['city', 'شهر'], ['island', 'جزیره'], ['region', 'منطقه']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setType(v)} className={`chip chip-small ${type === v ? 'chip-selected' : ''}`}>
              {l}
            </button>
          ))}
        </div>
      </Field>
    </MiniForm>
  );
}

function OriginForm() {
  const { message, pending, run } = useSubmit();
  const [slug, setSlug] = useState('');
  const [nameFa, setNameFa] = useState('');
  return (
    <MiniForm
      title="شهر مبدأ جدید"
      message={message}
      pending={pending}
      onSubmit={() => run(() => createOrigin({ slug, nameFa }), () => { setSlug(''); setNameFa(''); })}
    >
      <Field label="نام فارسی" htmlFor="or-name">
        <input id="or-name" value={nameFa} onChange={(e) => setNameFa(e.target.value)} className={inputCls} />
      </Field>
      <Field label="اسلاگ لاتین" htmlFor="or-slug">
        <input id="or-slug" value={slug} dir="ltr" onChange={(e) => setSlug(e.target.value)} className={`${inputCls} text-left`} />
      </Field>
    </MiniForm>
  );
}

function CarrierForm() {
  const { message, pending, run } = useSubmit();
  const [slug, setSlug] = useState('');
  const [nameFa, setNameFa] = useState('');
  return (
    <MiniForm
      title="شرکت حمل‌ونقل جدید"
      message={message}
      pending={pending}
      onSubmit={() => run(() => createCarrier({ slug, nameFa, kind: 'airline' }), () => { setSlug(''); setNameFa(''); })}
    >
      <Field label="نام فارسی" htmlFor="ca-name">
        <input id="ca-name" value={nameFa} onChange={(e) => setNameFa(e.target.value)} className={inputCls} />
      </Field>
      <Field label="اسلاگ لاتین" htmlFor="ca-slug">
        <input id="ca-slug" value={slug} dir="ltr" onChange={(e) => setSlug(e.target.value)} className={`${inputCls} text-left`} />
      </Field>
    </MiniForm>
  );
}

function HotelForm() {
  const { message, pending, run } = useSubmit();
  const [slug, setSlug] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [stars, setStars] = useState('5');
  const [placeSlug, setPlaceSlug] = useState('');
  return (
    <MiniForm
      title="هتل جدید"
      message={message}
      pending={pending}
      onSubmit={() =>
        run(() => createHotel({ slug, nameFa, stars: Number(stars) || undefined, placeSlug: placeSlug || undefined }), () => {
          setSlug('');
          setNameFa('');
          setPlaceSlug('');
        })
      }
    >
      <Field label="نام رسمی هتل" htmlFor="ho-name">
        <input id="ho-name" value={nameFa} onChange={(e) => setNameFa(e.target.value)} className={inputCls} />
      </Field>
      <Field label="اسلاگ لاتین" htmlFor="ho-slug">
        <input id="ho-slug" value={slug} dir="ltr" onChange={(e) => setSlug(e.target.value)} className={`${inputCls} text-left`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ستاره" htmlFor="ho-stars">
          <input id="ho-stars" value={stars} type="number" min={1} max={7} onChange={(e) => setStars(e.target.value)} className={inputCls} />
        </Field>
        <Field label="اسلاگ مقصد" htmlFor="ho-place">
          <input id="ho-place" value={placeSlug} dir="ltr" onChange={(e) => setPlaceSlug(e.target.value)} className={`${inputCls} text-left`} />
        </Field>
      </div>
    </MiniForm>
  );
}

function MiniForm({
  title,
  message,
  pending,
  onSubmit,
  children,
}: {
  title: string;
  message: string;
  pending: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-3">
      <h2 className="text-h4 font-bold text-text-heading">{title}</h2>
      {message ? <p className="text-body-sm text-text-secondary">{message}</p> : null}
      {children}
      <button type="button" onClick={onSubmit} disabled={pending} className="btn btn-medium btn-primary text-btn font-bold">
        {pending ? 'در حال ثبت...' : 'ثبت'}
      </button>
    </div>
  );
}

export interface CatalogRow {
  id: string;
  slug?: string;
  nameFa?: string;
  name?: string;
  type?: string;
}

export default function CatalogManager({
  places,
  origins,
  carriers,
  hotels,
  isOwner,
  onDeletePlace,
}: {
  places: CatalogRow[];
  origins: CatalogRow[];
  carriers: CatalogRow[];
  hotels: CatalogRow[];
  isOwner: boolean;
  onDeletePlace: (id: string) => Promise<unknown>;
}) {
  const [message, setMessage] = useState('');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h2 font-bold text-text-heading">مکان‌ها</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          مقصد، مبدأ، شرکت حمل‌ونقل و هتل فقط از همین‌جا تعریف می‌شوند؛ رشته آزاد در تور ممنوع است.
        </p>
        {message ? <p className="text-body-sm text-text-secondary mt-1">{message}</p> : null}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlaceForm />
        <OriginForm />
        <CarrierForm />
        <HotelForm />
      </div>
      <CatalogTable title={`مکان‌ها (${places.length})`} rows={places} showType isOwner={isOwner} onDelete={async (id) => { try { await onDeletePlace(id); setMessage('حذف شد.'); } catch { setMessage('حذف ناموفق بود.'); } }} />
      <CatalogTable title={`مبدأها (${origins.length})`} rows={origins} />
      <CatalogTable title={`شرکت‌های حمل‌ونقل (${carriers.length})`} rows={carriers} />
      <CatalogTable title={`هتل‌ها (${hotels.length})`} rows={hotels} />
    </div>
  );
}

function CatalogTable({
  title,
  rows,
  showType,
  isOwner,
  onDelete,
}: {
  title: string;
  rows: CatalogRow[];
  showType?: boolean;
  isOwner?: boolean;
  onDelete?: (id: string) => Promise<unknown>;
}) {
  return (
    <div className="bg-surface-primary border border-border-default rounded-card p-5">
      <h2 className="text-h4 font-bold text-text-heading mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-body-sm text-text-secondary">موردی ثبت نشده است.</p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {rows.map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between gap-2 text-body-sm">
              <span className="font-bold text-text-heading">{r.nameFa || r.name}</span>
              <span className="flex items-center gap-2">
                {showType && r.type ? <span className="text-caption text-text-secondary">{r.type}</span> : null}
                {r.slug ? (
                  <span className="text-caption text-text-muted" dir="ltr">
                    {r.slug}
                  </span>
                ) : null}
                {isOwner && onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="text-caption font-bold text-red-700 hover:underline"
                  >
                    حذف
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
