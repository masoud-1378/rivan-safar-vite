'use client';

import { useState } from 'react';
import ProductWizard from './ProductWizard';
import DepartureBuilder from './DepartureBuilder';

export interface ProductRow {
  id: string;
  titleFa: string;
  slug: string;
  tourKind: string;
  status: string;
}

function statusFa(status: string) {
  switch (status) {
    case 'published':
      return 'منتشرشده';
    case 'review':
      return 'در بازبینی';
    case 'paused':
      return 'متوقف';
    case 'archived':
      return 'بایگانی';
    default:
      return 'پیش‌نویس';
  }
}

export default function ToursManager({ initial }: { initial: ProductRow[] }) {
  const [selectedId, setSelectedId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5" key={refreshKey}>
      <div>
        <h1 className="text-h2 font-bold text-text-heading">تورها</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          محصول را بسازید، بعد حرکت، مسیر و قیمت را اضافه کنید؛ انتشار فقط با پاس Gate.
        </p>
      </div>
      <ProductWizard onCreated={() => setRefreshKey((k) => k + 1)} />
      <div className="bg-surface-primary border border-border-default rounded-card p-5">
        <h2 className="text-h4 font-bold text-text-heading mb-3">محصول‌های ثبت‌شده ({initial.length})</h2>
        {initial.length === 0 ? (
          <p className="text-body-sm text-text-secondary">هنوز محصولی ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {initial.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-right p-3 rounded-control border transition-colors ${
                  selectedId === p.id
                    ? 'border-brand-orange bg-brand-orange-soft'
                    : 'border-border-default hover:border-brand-orange'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-text-heading">{p.titleFa}</span>
                  <span className="text-caption text-text-secondary">{statusFa(p.status)}</span>
                </div>
                <div className="text-caption text-text-muted mt-0.5" dir="ltr">
                  {p.slug}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedId ? <DepartureBuilder productId={selectedId} /> : null}
    </div>
  );
}
