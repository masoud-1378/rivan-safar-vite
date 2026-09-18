'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  listAdminUsers,
  inviteAdmin,
  setUserRole,
  toggleUserActive,
  removeAdmin,
} from './actions';

type UserRow = Awaited<ReturnType<typeof listAdminUsers>>[number];

function statusBadge(active: boolean) {
  return active ? (
    <span className="inline-flex px-2 py-0.5 rounded-md text-caption font-bold bg-emerald-50 text-emerald-800">فعال</span>
  ) : (
    <span className="inline-flex px-2 py-0.5 rounded-md text-caption font-bold bg-amber-50 text-amber-800">غیرفعال</span>
  );
}

export default function UsersManager({ initial }: { initial: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [pending, startTransition] = useTransition();

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

  const loadUsers = () => {
    startTransition(async () => {
      try {
        const res = await listAdminUsers();
        setUsers(res);
      } catch {
        alert('خطا در بارگذاری کاربران.');
      }
    });
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const role = form.get('role') as 'owner' | 'editor';
    if (!email) return;
    run(async () => {
      await inviteAdmin(email, role);
      loadUsers();
    });
  };

  const handleRoleChange = (userId: string, role: 'owner' | 'editor') => {
    run(async () => {
      await setUserRole(userId, role);
      loadUsers();
    });
  };

  const handleToggleActive = (userId: string, active: boolean) => {
    run(async () => {
      await toggleUserActive(userId, !active);
      loadUsers();
    });
  };

  const handleRemove = (userId: string) => {
    if (!confirm('حذف شود؟')) return;
    run(async () => {
      await removeAdmin(userId);
      loadUsers();
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h2 font-bold text-text-heading">مدیریت کاربران پنل</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          فقط مالک می‌تواند کاربران را دعوت، تغییر نقش، غیرفعال یا حذف کند.
        </p>
      </div>

      <form onSubmit={handleInvite} className="bg-surface-primary border border-border-default rounded-card p-5 space-y-3">
        <h2 className="text-h4 font-bold text-text-heading mb-3">دعوت مدیر/ویراستار جدید</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-caption font-bold text-text-heading mb-1">ایمیل</label>
            <input name="email" type="email" dir="ltr" required className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm text-left" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-caption font-bold text-text-heading mb-1">نقش</label>
            <select name="role" className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm">
              <option value="editor">ویراستار</option>
              <option value="owner">مالک</option>
            </select>
          </div>
          <button type="submit" className="btn btn-medium btn-primary text-btn font-bold h-fit" disabled={pending}>
            {pending ? 'در حال انجام...' : 'دعوت'}
          </button>
        </div>
      </form>

      <div className="bg-surface-primary border border-border-default rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-body-sm min-w-[700px]">
            <thead>
              <tr className="bg-surface-secondary border-b border-border-default text-text-heading">
                <th className="px-4 py-3 font-bold">ایمیل</th>
                <th className="px-4 py-3 font-bold">نقش</th>
                <th className="px-4 py-3 font-bold">وضعیت</th>
                <th className="px-4 py-3 font-bold">تاریخ ایجاد</th>
                <th className="px-4 py-3 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-medium text-text-heading" dir="ltr">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as 'owner' | 'editor')}
                      className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm"
                      disabled={pending}
                    >
                      <option value="editor">ویراستار</option>
                      <option value="owner">مالک</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{statusBadge(u.active)}</td>
                  <td className="px-4 py-3 text-text-secondary text-caption" dir="ltr">
                    {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(u.createdAt))}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id, u.active)}
                      className="text-caption font-bold text-text-secondary hover:underline"
                      disabled={pending}
                    >
                      {u.active ? 'غیرفعال' : 'فعال'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(u.id)}
                      className="text-caption font-bold text-red-700 hover:underline ml-4"
                      disabled={pending}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}