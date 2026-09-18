'use client';

import { useState, useTransition } from 'react';
import {
  createDeparture,
  addSegment,
  addOffer,
  checkPublishGate,
  setProductStatus,
  type GateCheck,
} from './actions';

const TRANSPORTS = [
  { value: 'air', label: 'هوایی' },
  { value: 'land', label: 'زمینی' },
  { value: 'rail', label: 'ریلی' },
  { value: 'sea', label: 'دریایی' },
  { value: 'mixed', label: 'ترکیبی' },
];

const PRICE_STATUSES = [
  { value: 'on_request', label: 'استعلامی' },
  { value: 'confirmed', label: 'قطعی' },
  { value: 'under_review', label: 'در حال بررسی' },
  { value: 'expired', label: 'منقضی' },
];

export default function DepartureBuilder({ productId }: { productId: string }) {
  const [departsAt, setDepartsAt] = useState('');
  const [originSlug, setOriginSlug] = useState('');
  const [departureId, setDepartureId] = useState('');
  const [transportKind, setTransportKind] = useState('air');
  const [carrierSlug, setCarrierSlug] = useState('');
  const [isNonstop, setIsNonstop] = useState(false);
  const [board, setBoard] = useState('');
  const [nights, setNights] = useState(3);
  const [priceStatus, setPriceStatus] = useState('on_request');
  const [priceAmount, setPriceAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [gate, setGate] = useState<GateCheck | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>, done?: (r: unknown) => void) => {
    setMessage('');
    startTransition(async () => {
      try {
        const r = await fn();
        if (done) done(r);
        else setMessage('ثبت شد.');
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'خطا در ثبت.');
      }
    });
  };

  return (
    <div className="bg-surface-primary border border-border-default rounded-card p-5 space-y-5">
      <h2 className="text-h4 font-bold text-text-heading">حرکت، مسیر و قیمت (مرحله ۳ تا ۵)</h2>
      {message ? <p className="text-body-sm text-text-secondary">{message}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-caption font-bold text-text-heading mb-1">تاریخ رفت</label>
          <input
            type="date"
            value={departsAt}
            onChange={(e) => setDepartsAt(e.target.value)}
            className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
          />
        </div>
        <div>
          <label className="block text-caption font-bold text-text-heading mb-1">اسلاگ مبدأ</label>
          <input
            value={originSlug}
            dir="ltr"
            onChange={(e) => setOriginSlug(e.target.value)}
            placeholder="tehran"
            className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                async () =>
                  createDeparture({
                    productId,
                    departsAt: departsAt || undefined,
                    originSlug: originSlug || undefined,
                  }),
                (r) => {
                  setDepartureId((r as { id: string }).id);
                  setMessage('حرکت ثبت شد؛ حالا قطعه مسیر را اضافه کنید.');
                },
              )
            }
            className="btn btn-medium btn-secondary text-btn font-bold w-full"
          >
            ثبت حرکت
          </button>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-4 space-y-3">
        <div className="text-caption font-bold text-text-heading">شناسه حرکت (خودکار پر می‌شود)</div>
        <input
          value={departureId}
          dir="ltr"
          onChange={(e) => setDepartureId(e.target.value)}
          placeholder="departure id"
          className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="block text-caption font-bold text-text-heading mb-1">نوع حمل‌ونقل</span>
            <div className="flex flex-wrap gap-2">
              {TRANSPORTS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTransportKind(t.value)}
                  className={`chip chip-small ${transportKind === t.value ? 'chip-selected' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-caption font-bold text-text-heading mb-1">اسلاگ شرکت حمل‌ونقل</label>
            <input
              value={carrierSlug}
              dir="ltr"
              onChange={(e) => setCarrierSlug(e.target.value)}
              placeholder="mahan"
              className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left"
            />
          </div>
          <label className="flex items-center gap-2 text-body-sm font-medium min-h-[44px]">
            <input
              type="checkbox"
              checked={isNonstop}
              onChange={(e) => setIsNonstop(e.target.checked)}
              className="form-checkbox"
            />
            پرواز/مسیر مستقیم (بدون توقف)
          </label>
        </div>
        <button
          type="button"
          disabled={pending || !departureId}
          onClick={() =>
            run(() =>
              addSegment({
                departureId,
                transportKind: transportKind as 'air' | 'land' | 'rail' | 'sea' | 'mixed',
                carrierSlug: carrierSlug || undefined,
                isNonstop,
              }),
            )
          }
          className="btn btn-medium btn-secondary text-btn font-bold"
        >
          افزودن قطعه مسیر
        </button>
      </div>

      <div className="border-t border-border-subtle pt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-caption font-bold text-text-heading mb-1">پذیرایی/اتاق</label>
            <input
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              placeholder="صبحانه (BB)"
              className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
            />
          </div>
          <div>
            <label className="block text-caption font-bold text-text-heading mb-1">شب‌ها</label>
            <input
              value={nights}
              type="number"
              min={0}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
            />
          </div>
          <div>
            <span className="block text-caption font-bold text-text-heading mb-1">وضعیت قیمت</span>
            <div className="flex flex-wrap gap-2">
              {PRICE_STATUSES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriceStatus(p.value)}
                  className={`chip chip-small ${priceStatus === p.value ? 'chip-selected' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-bold text-text-heading mb-1">مبلغ (تومان)</label>
              <input
                value={priceAmount}
                inputMode="numeric"
                dir="ltr"
                onChange={(e) => setPriceAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="42500000"
                className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left"
              />
            </div>
            <div>
              <label className="block text-caption font-bold text-text-heading mb-1">اعتبار تا</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={pending || !departureId}
          onClick={() =>
            run(() =>
              addOffer({
                departureId,
                board: board || undefined,
                nights,
                priceStatus: priceStatus as 'confirmed' | 'on_request' | 'under_review' | 'expired',
                priceAmount: priceAmount ? Number(priceAmount) : undefined,
                validUntil: validUntil || undefined,
              }),
            )
          }
          className="btn btn-medium btn-secondary text-btn font-bold"
        >
          ثبت پیشنهاد قیمت
        </button>
      </div>

      <div className="border-t border-border-subtle pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(async () => checkPublishGate(productId), (r) => setGate(r as GateCheck))}
            className="btn btn-medium btn-outline text-btn font-bold"
          >
            بررسی Gate انتشار
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setProductStatus(productId, 'published'))}
            className="btn btn-medium btn-primary text-btn font-bold"
          >
            انتشار محصول
          </button>
        </div>
        {gate ? (
          <div className={`rounded-control border p-3 text-body-sm ${gate.canPublish ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            {gate.canPublish ? (
              'Gate پاس شد؛ محصول آماده انتشار است.'
            ) : (
              <ul className="list-disc pr-5 space-y-1">
                {gate.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
