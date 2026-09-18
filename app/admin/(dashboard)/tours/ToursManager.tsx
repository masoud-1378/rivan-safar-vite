'use client';

import { useState, useTransition } from 'react';
import TourForm from './TourForm';
import { deleteTour, type TourRow } from './actions';

export default function ToursManager({ initial }: { initial: TourRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TourRow | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () => {
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  };

  const onDelete = (id: string) => {
    if (!confirm('این تور حذف شود؟')) return;
    startTransition(async () => {
      try {
        await deleteTour(id);
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در حذف.');
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-h2 font-bold text-text-heading">تورها</h1>
          <p className="text-body-sm text-text-secondary mt-1">مدیریت مستقیم جدول site_tours</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn btn-medium btn-primary text-btn font-bold"
        >
          افزودن تور جدید
        </button>
      </div>

      {showForm || editing ? (
        <TourForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onDone={reload} />
      ) : null}

      <div className="bg-surface-primary border border-border-default rounded-card p-5">
        <h2 className="text-h4 font-bold text-text-heading mb-3">تورها ({initial.length})</h2>
        {initial.length === 0 ? (
          <p className="text-body-sm text-text-secondary">هنوز توری ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {initial.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between gap-2 text-body-sm">
                <div className="min-w-0">
                  <div className="font-bold text-text-heading truncate">{t.title}</div>
                  <div className="text-caption text-text-muted" dir="ltr">
                    {t.slug} · {t.destination}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(t);
                      setShowForm(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-caption font-bold text-text-heading hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    disabled={pending}
                    className="text-caption font-bold text-red-700 hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
