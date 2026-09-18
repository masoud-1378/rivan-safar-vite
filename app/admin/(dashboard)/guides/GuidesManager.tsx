'use client';

import { useState, useTransition } from 'react';
import GuideForm from './GuideForm';
import {
  deleteGuide,
  setGuideStatus,
  type GuideRow,
  type GuideStatus,
} from './actions';

const STATUS_MAP: Record<GuideStatus, { label: string; cls: string }> = {
  published: { label: 'منتشرشده', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  review: { label: 'در حال بازبینی', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  draft: { label: 'پیش‌نویس', cls: 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30' },
  paused: { label: 'متوقف', cls: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  archived: { label: 'بایگانی', cls: 'bg-red-500/15 text-red-700 border-red-500/30' },
};

export default function GuidesManager({ initial }: { initial: GuideRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () => {
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  };

  const onDelete = (id: string, title: string) => {
    if (!confirm(`آیا از حذف مقاله «${title}» اطمینان دارید؟`)) return;
    startTransition(async () => {
      try {
        await deleteGuide(id);
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در حذف.');
      }
    });
  };

  const onStatusChange = (id: string, nextStatus: GuideStatus) => {
    startTransition(async () => {
      try {
        await setGuideStatus(id, nextStatus);
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در تغییر وضعیت.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-text-heading">مقالات و راهنماها</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            مجموع مقالات ثبت‌شده: {initial.length} مورد
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn btn-medium btn-primary text-btn font-bold"
        >
          مقاله جدید
        </button>
      </div>

      {(showForm || editing) && (
        <GuideForm
          key={editing?.id ?? 'new'}
          initial={editing}
          editingId={editing?.id ?? null}
          onSaved={reload}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="bg-surface-primary border border-border-default rounded-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-h4 font-bold text-text-heading">لیست مقالات ({initial.length})</h2>
        </div>

        {initial.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-body-sm">
            هیچ مقاله‌ای یافت نشد. برای شروع، روی «مقاله جدید» کلیک کنید.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-body-sm">
              <thead className="bg-surface-secondary text-caption font-bold text-text-secondary border-b border-border-subtle">
                <tr>
                  <th className="p-3">عنوان مقاله</th>
                  <th className="p-3">نامک (Slug)</th>
                  <th className="p-3">دسته‌بندی</th>
                  <th className="p-3">زمان مطالعه</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3">تغییر وضعیت</th>
                  <th className="p-3 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {initial.map((guide) => {
                  const statusInfo = STATUS_MAP[guide.status] || STATUS_MAP.draft;
                  return (
                    <tr key={guide.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="p-3 font-medium text-text-heading max-w-[240px] truncate">
                        {guide.titleFa}
                      </td>
                      <td className="p-3 font-mono text-caption text-text-muted max-w-[180px] truncate" dir="ltr">
                        {guide.slug}
                      </td>
                      <td className="p-3 text-caption text-text-secondary whitespace-nowrap">
                        {guide.categoryLabel || guide.category}
                      </td>
                      <td className="p-3 text-caption text-text-secondary whitespace-nowrap">
                        {guide.readTime || '-'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-caption border ${statusInfo.cls}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={guide.status}
                          disabled={pending}
                          onChange={(e) => onStatusChange(guide.id, e.target.value as GuideStatus)}
                          className="bg-surface-secondary border border-border-default rounded px-2 py-1 text-caption text-text-primary"
                        >
                          <option value="draft">پیش‌نویس</option>
                          <option value="review">بازبینی</option>
                          <option value="published">منتشرشده</option>
                          <option value="paused">متوقف</option>
                          <option value="archived">بایگانی</option>
                        </select>
                      </td>
                      <td className="p-3 text-left whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(guide);
                              setShowForm(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-caption font-bold text-text-heading hover:text-brand-orange hover:underline"
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(guide.id, guide.titleFa)}
                            disabled={pending}
                            className="text-caption font-bold text-red-600 hover:text-red-700 hover:underline"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
