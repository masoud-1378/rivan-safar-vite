'use client';

import { useState, useTransition } from 'react';
import { listLandings, checkQualityGate, setLandingWorkflow, deleteLanding } from './actions';
import LandingForm from './LandingForm';

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    review: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    published: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    paused: 'bg-muted border-border text-foreground',
    archived: 'bg-muted border-border text-muted-foreground',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${colors[status] || 'bg-muted'}`}>{status}</span>;
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
    <div className="admin-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">مدیریت لندینگ‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">
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

      <div className="bg-card border border-border rounded-xl p-5 admin-lift">
        <h2 className="font-semibold text-foreground mb-3">لیست لندینگ‌ها ({data.length})</h2>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">لندینگی ثبت نشده.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm min-w-[900px]">
              <thead>
                <tr className="bg-muted border-b border-border text-foreground">
                  <th className="px-4 py-3 font-bold">Query Owner</th>
                  <th className="px-4 py-3 font-bold">URL</th>
                  <th className="px-4 py-3 font-bold">Title</th>
                  <th className="px-4 py-3 font-bold">Workflow</th>
                  <th className="px-4 py-3 font-bold">Index</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((l) => (
                  <tr key={l.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{l.queryOwner}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs" dir="ltr">{l.urlPath}</td>
                    <td className="px-4 py-3 text-foreground font-medium truncate max-w-[300px]">{l.titleFa}</td>
                    <td className="px-4 py-3">{statusBadge(l.workflow)}</td>
                    <td className="px-4 py-3 text-center">
                      {l.indexStatus === 'index' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-300">index</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/15 text-amber-300">noindex</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={l.workflow}
                          onChange={e => handleWorkflow(l.id, e.target.value)}
                          className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground"
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
                          className="text-red-400 hover:underline text-xs font-medium"
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