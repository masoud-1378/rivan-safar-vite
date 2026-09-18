'use client';

import { useState, useTransition } from 'react';
import { listLandings, checkQualityGate, setLandingWorkflow, deleteLanding } from './actions';
import LandingForm from './LandingForm';

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-amber-50 border-amber-200 text-amber-900',
    review: 'bg-blue-50 border-blue-200 text-blue-900',
    published: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    paused: 'bg-slate-50 border-slate-200 text-slate-900',
    archived: 'bg-slate-100 border-slate-300 text-slate-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-caption font-bold ${colors[status] || 'bg-slate-50'}`}>{status}</span>;
}

export default function LandingList({ initial }: { initial: Awaited<ReturnType<typeof listLandings>> }) {
  const [data, setData] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const refresh = () => startTransition(async () => {
    const res = await listLandings();
    setData(res);
  });

  const run = (fn: () => Promise<unknown>, done?: () => void) => {
    startTransition(async () => {
      try {
        await fn();
        if (done) done();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('حذف شود؟')) return;
    run(async () => {
      await deleteLanding(id);
      refresh();
    });
  };

  const handleWorkflow = (id: string, workflow: string) => {
    if (workflow === 'published') {
      run(async () => {
        const check = await checkQualityGate(id);
        if (!check.canPublish) {
          alert('کیفیت پاس نشد:\n' + check.reasons.join('\n'));
          return;
        }
        await setLandingWorkflow(id, 'published');
        refresh();
      });
    } else {
      run(async () => {
        await setLandingWorkflow(id, workflow as any);
        refresh();
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-text-heading">مدیریت لندینگ‌ها</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            مدیریت صفحات سئو، چک‌لیست انتشار و کنترل ایندکس.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-medium btn-primary text-btn font-bold"
        >
          {showForm ? 'بستن فرم' : '+ لندینگ جدید'}
        </button>
      </div>

      {showForm && <LandingForm onSaved={() => { setShowForm(false); refresh(); }} />}

      <div className="bg-surface-primary border border-border-default rounded-card p-5">
        <h2 className="text-h4 font-bold text-text-heading mb-3">لیست لندینگ‌ها ({data.length})</h2>
        {data.length === 0 ? (
          <p className="text-body-sm text-text-secondary">لندینگی ثبت نشده.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-body-sm min-w-[900px]">
              <thead>
                <tr className="bg-surface-secondary border-b border-border-default text-text-heading">
                  <th className="px-4 py-3 font-bold">Query Owner</th>
                  <th className="px-4 py-3 font-bold">URL</th>
                  <th className="px-4 py-3 font-bold">Title</th>
                  <th className="px-4 py-3 font-bold">Workflow</th>
                  <th className="px-4 py-3 font-bold">Index</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-mono text-caption text-text-secondary" dir="ltr">{l.queryOwner}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-caption" dir="ltr">{l.urlPath}</td>
                    <td className="px-4 py-3 text-text-heading font-medium truncate max-w-[300px]">{l.titleFa}</td>
                    <td className="px-4 py-3">{statusBadge(l.workflow)}</td>
                    <td className="px-4 py-3 text-center">
                      {l.indexStatus === 'index' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-caption font-bold bg-emerald-50 text-emerald-800">index</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-caption font-bold bg-amber-50 text-amber-800">noindex</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={l.workflow}
                          onChange={e => handleWorkflow(l.id, e.target.value)}
                          className="bg-surface-secondary border border-border-default rounded-control px-2 py-1 text-caption text-text-heading"
                          disabled={pending}
                        >
                          <option value="draft">پیش‌نویس</option>
                          <option value="review">بازبینی</option>
                          <option value="published">منتشر</option>
                          <option value="paused">متوقف</option>
                          <option value="archived">بایگانی</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id)}
                          className="text-red-700 hover:underline text-caption font-medium"
                          disabled={pending}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}