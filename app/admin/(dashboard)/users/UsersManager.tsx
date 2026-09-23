'use client';

import { useState, useTransition } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { formatJalali } from '@/lib/jalali';
import { fa } from '@/lib/utils';
import {
  listAdminUsers,
  inviteAdmin,
  setUserRole,
  toggleUserActive,
  removeAdmin,
} from './actions';

type UserRow = Awaited<ReturnType<typeof listAdminUsers>>[number];

const ROLE_OPTIONS = [
  { value: 'editor', label: 'ویراستار' },
  { value: 'owner', label: 'مالک' },
];

const faTime = (date: Date) => `${fa(String(date.getHours()).padStart(2, '0'))}:${fa(String(date.getMinutes()).padStart(2, '0'))}`;

export default function UsersManager({ initial }: { initial: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'editor'>('editor');
  const [removing, setRemoving] = useState<UserRow | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadUsers = () => {
    startTransition(async () => {
      try {
        setUsers(await listAdminUsers());
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در بارگذاری کاربران.' });
      }
    });
  };

  const run = (fn: () => Promise<unknown>, successTitle?: string) => {
    startTransition(async () => {
      try {
        await fn();
        if (successTitle) toast({ variant: 'success', title: successTitle });
        loadUsers();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا' });
      }
    });
  };

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      toast({ variant: 'error', title: 'ایمیل را وارد کنید.' });
      return;
    }
    run(async () => {
      await inviteAdmin(value, role);
      setEmail('');
    }, 'دعوت‌نامه ارسال شد.');
  };

  const onRemove = () => {
    if (!removing) return;
    run(async () => {
      await removeAdmin(removing.id);
      setRemoving(null);
    }, 'کاربر حذف شد.');
  };

  const columns: Column<UserRow>[] = [
    { key: 'email', header: 'ایمیل', sortable: true, cell: (u) => <span dir="ltr" className="font-medium">{u.email}</span> },
    {
      key: 'role',
      header: 'نقش',
      className: 'w-40',
      cell: (u) => (
        <Select
          aria-label={`نقش ${u.email}`}
          value={u.role}
          disabled={pending}
          onChange={(e) => run(async () => { await setUserRole(u.id, e.target.value as 'owner' | 'editor'); }, 'نقش به‌روزرسانی شد.')}
          className="h-8 text-xs"
          options={ROLE_OPTIONS}
        />
      ),
    },
    { key: 'active', header: 'وضعیت', cell: (u) => <Badge variant={u.active ? 'success' : 'warning'}>{u.active ? 'فعال' : 'غیرفعال'}</Badge> },
    {
      key: 'createdAt',
      header: 'تاریخ ایجاد',
      cell: (u) => <span className="text-xs text-muted-foreground">{formatJalali(new Date(u.createdAt))} · {faTime(new Date(u.createdAt))}</span>,
    },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-44',
      cell: (u) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(async () => { await toggleUserActive(u.id, !u.active); }, u.active ? 'کاربر غیرفعال شد.' : 'کاربر فعال شد.')}>
            {u.active ? 'غیرفعال' : 'فعال'}
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => setRemoving(u)}>
            <Trash2 />
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مدیریت کاربران پنل</h1>
        <p className="mt-1 text-sm text-muted-foreground">فقط مالک می‌تواند کاربران را دعوت، تغییر نقش، غیرفعال یا حذف کند.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            دعوت مدیر یا ویراستار جدید
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
            <Field label="ایمیل" htmlFor="invite-email">
              <Input
                id="invite-email"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="نقش" htmlFor="invite-role">
              <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as 'owner' | 'editor')} options={ROLE_OPTIONS} />
            </Field>
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? 'در حال انجام...' : 'ارسال دعوت‌نامه'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-base font-semibold">کاربران ({fa(users.length)})</h2>
          <DataTable
            rows={users}
            columns={columns}
            rowKey={(u) => u.id}
            searchKeys={['email']}
            searchPlaceholder="جست‌وجوی ایمیل…"
            emptyTitle="کاربری ثبت نشده است"
            emptyDescription="از فرم بالا اولین مدیر را دعوت کنید."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(openState) => !openState && setRemoving(null)}
        title="حذف کاربر"
        description={removing ? `آیا از حذف «${removing.email}» اطمینان دارید؟ دسترسی او به پنل بلافاصله قطع می‌شود.` : ''}
        confirmText="حذف کاربر"
        destructive
        onConfirm={onRemove}
      />
    </div>
  );
}
