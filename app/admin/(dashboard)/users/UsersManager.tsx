'use client';

import { useState, useTransition } from 'react';
import { Archive, RefreshCw, UserPlus } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Field, Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { formatJalali } from '@/lib/jalali';
import { fa } from '@/lib/utils';
import {
  listAdminUsers,
  createAdminUser,
  setUserRole,
  toggleUserActive,
  removeAdmin,
} from './actions';

type UserRow = Awaited<ReturnType<typeof listAdminUsers>>[number];

const ROLE_OPTIONS = [
  { value: 'editor', label: 'ویراستار' },
  { value: 'owner', label: 'مالک' },
];

type FieldErrors = Partial<Record<'email' | 'username' | 'password' | 'role', string>>;

/** رمزی قوی می‌سازد: ۱۶ نویسه از چهار دستهٔ نویسه‌ای، با crypto مرورگر. */
function generateStrongPassword(length = 16) {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = lower + upper + digits + symbols;
  const rand = new Uint32Array(length * 2);
  crypto.getRandomValues(rand);
  const chars = [lower, upper, digits, symbols].map((set, i) => set[rand[i] % set.length]);
  for (let i = 4; i < length; i++) chars.push(all[rand[i] % all.length]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[length + i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

const faTime = (date: Date) => `${fa(String(date.getHours()).padStart(2, '0'))}:${fa(String(date.getMinutes()).padStart(2, '0'))}`;

export default function UsersManager({ initial }: { initial: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'editor'>('editor');
  const [errors, setErrors] = useState<FieldErrors>({});
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

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!email.trim()) nextErrors.email = 'ایمیل را وارد کنید.';
    if (!username.trim()) nextErrors.username = 'نام کاربری را وارد کنید.';
    if (!password) nextErrors.password = 'رمز عبور را وارد کنید.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      try {
        const res = await createAdminUser({
          email: email.trim(),
          username: username.trim(),
          password,
          role,
        });
        if (res.ok) {
          toast({ variant: 'success', title: 'کاربر ساخته شد.' });
          setEmail('');
          setUsername('');
          setPassword('');
          setRole('editor');
          setErrors({});
          loadUsers();
          return;
        }
        // نکته: strict در tsconfig خاموش است و یونیون تمایزی narrow نمی‌شود؛
        // پس شاخهٔ خطا را صریح از روی همان تایپ قرارداد جدا می‌کنیم.
        const failure = res as Extract<Awaited<ReturnType<typeof createAdminUser>>, { ok: false }>;
        if (failure.field) {
          setErrors({ [failure.field]: failure.message });
        } else {
          toast({ variant: 'error', title: failure.message });
        }
      } catch (err) {
        toast({ variant: 'error', title: err instanceof Error ? err.message : 'خطا در ساخت کاربر.' });
      }
    });
  };

  const onRemove = () => {
    if (!removing) return;
    run(async () => {
      await removeAdmin(removing.id);
      setRemoving(null);
    }, 'کاربر بایگانی شد.');
  };

  const columns: Column<UserRow>[] = [
    { key: 'email', header: 'ایمیل', sortable: true, cell: (u) => <span dir="ltr" className="font-medium">{u.email}</span> },
    { key: 'username', header: 'نام کاربری', sortable: true, cell: (u) => <span dir="ltr" className="text-muted-foreground">{u.username ?? '-'}</span> },
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
            <Archive />
            بایگانی
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مدیریت کاربران پنل</h1>
        <p className="mt-1 text-sm text-muted-foreground">فقط مالک می‌تواند کاربر بسازد، نقش را تغییر دهد، غیرفعال یا بایگانی کند.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            افزودن کاربر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ایمیل" htmlFor="new-user-email">
              <Input
                id="new-user-email"
                type="email"
                dir="ltr"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="admin@example.com"
                error={errors.email}
              />
            </Field>
            <Field
              label="نام کاربری"
              htmlFor="new-user-username"
              hint="حروف کوچک لاتین، عدد، نقطه، آندرلاین و خط‌تیره؛ دست‌کم ۳ نویسه."
            >
              <Input
                id="new-user-username"
                type="text"
                dir="ltr"
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
                  if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="masoud.admin"
                error={errors.username}
              />
            </Field>
            <Field
              label="رمز عبور"
              htmlFor="new-user-password"
              hint="دست‌کم ۱۰ نویسه."
              error={errors.password}
            >
              <PasswordInput
                id="new-user-password"
                strength
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1.5 w-fit px-2 text-xs text-muted-foreground"
                onClick={() => {
                  setPassword(generateStrongPassword());
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              >
                <RefreshCw className="size-3.5" />
                تولید رمز
              </Button>
            </Field>
            <div>
              <Field label="نقش" htmlFor="new-user-role" error={errors.role}>
                <Select
                  id="new-user-role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as 'owner' | 'editor');
                    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  options={ROLE_OPTIONS}
                />
              </Field>
              <div className="mt-2 space-y-1.5 rounded-field border border-border bg-muted/40 p-3 text-xs leading-6 text-muted-foreground">
                <p>
                  <strong className="text-foreground">مالک:</strong>
                  {' '}دسترسی کامل؛ از جمله مدیریت کاربران، حذف لندینگ‌های سئو، حذف دائمی از بایگانی، حالت تعمیرات و اجرای دادهٔ نمونه.
                </p>
                <p>
                  <strong className="text-foreground">ویراستار:</strong>
                  {' '}مدیریت محتوای پنل مثل تورها، کاتالوگ، راهنماها، نمایشگاه‌ها، سئو و درخواست‌های تماس؛ بدون دسترسی به بخش کاربران، حذف دائمی و حالت تعمیرات.
                </p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending} className="h-10">
                {pending ? 'در حال افزودن کاربر…' : 'افزودن کاربر'}
              </Button>
            </div>
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
            searchKeys={['email', 'username']}
            searchPlaceholder="جست‌وجوی ایمیل یا نام کاربری…"
            emptyTitle="کاربری ثبت نشده است"
            emptyDescription="از فرم بالا اولین کاربر را بسازید."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(openState) => !openState && setRemoving(null)}
        title="بایگانی کاربر"
        description={removing ? `«${removing.email}» بایگانی می‌شود و دسترسی او به پنل بلافاصله قطع می‌شود؛ بعداً از صفحهٔ بایگانی می‌توان او را برگرداند.` : ''}
        confirmText="بایگانی کاربر"
        destructive
        onConfirm={onRemove}
      />
    </div>
  );
}
