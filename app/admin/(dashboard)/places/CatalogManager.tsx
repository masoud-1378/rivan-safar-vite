'use client';

import { useState, useTransition } from 'react';
import DestinationForm from './DestinationForm';
import { deleteDestination, type DestinationRow } from './actions';

export default function CatalogManager({ initial }: { initial: DestinationRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () => {
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  };

  const onDelete = (id: string) => {
    if (!confirm('این مقصد حذف شود؟')) return;
    startTransition(async () => {
      try {
        await deleteDestination(id);
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
          <h1 className="text-h2 font-bold text-text-heading">مکان‌ها و مقصدها</h1>
          <p className="text-body-sm text-text-secondary mt-1">مدیریت مستقیم جدول site_destinations</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn btn-medium btn-primary text-btn font-bold"
        >
          افزودن مقصد جدید
        </button>
      </div>

      {showForm || editing ? (
        <DestinationForm
          key={editing?.id ?? 'new'}
          initial={editing}
          editingId={editing?.id ?? null}
          onDone={reload}
        />
      ) : null}

      <div className="bg-surface-primary border border-border-default rounded-card p-5">
        <h2 className="text-h4 font-bold text-text-heading mb-3">مقصدها ({initial.length})</h2>
        {initial.length === 0 ? (
          <p className="text-body-sm text-text-secondary">هنوز مقصدی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {initial.map((d) => (
              <li key={d.id} className="py-2 flex items-center justify-between gap-2 text-body-sm">
                <div className="min-w-0">
                  <div className="font-bold text-text-heading truncate">
                    {d.name} <span className="text-caption text-text-muted font-normal">({d.nameEn})</span>
                  </div>
                  <div className="text-caption text-text-muted" dir="ltr">
                    {d.slug} · {d.type} · {d.category}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(d);
                      setShowForm(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-caption font-bold text-text-heading hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(d.id)}
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
