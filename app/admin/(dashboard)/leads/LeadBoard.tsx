'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { bulkUpdateLeads, updateLeadAdminNotes, updateLeadStatus, type LeadStatus } from './actions';
import { LEAD_STATUSES, LEAD_STATUS_FA, LEAD_STATUS_VARIANT } from './lead-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type Column, type DataTableSelection } from '@/components/ui/data-table';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { safeErrorMessage } from '@/src/lib/error-message';

export interface LeadRow {
  id: string;
  fullName: string;
  phone: string;
  sourcePath: string;
  tourContext: string | null;
  destinationHint: string | null;
  passengers: string | null;
  notes: string | null;
  /** ۳-۱۰: یادداشت داخلی ادمین؛ جدا از یادداشت فقط‌خواندنیِ کاربر. */
  adminNotes: string | null;
  status: LeadStatus;
  assignee: string | null;
  createdAt: string;
}

interface LeadBoardProps {
  initial: LeadRow[];
  variant?: 'general' | 'tour';
  pageSize: number;
  /** میز ۳ — ایراد ۲۵: صفحه‌بندی سروری؛ فیلتر/جست‌وجو/صفحه از URL می‌آیند. */
  total: number;
  page: number;
  pageCount: number;
  status: LeadStatus | 'all';
  query: string;
}

function faDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function DefRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <p className="text-panel-caption text-muted-foreground">{label}</p>
        {hint ? <p className="mt-1 text-panel-caption text-muted-foreground/70">{hint}</p> : null}
      </div>
      <div className="text-start text-panel-label">{children}</div>
    </div>
  );
}

export function LeadBoard({ initial, variant = 'general', pageSize, total, page, pageCount, status, query }: LeadBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<LeadRow | null>(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState('');
  const [bulkStatus, setBulkStatus] = useState<{ open: boolean; value: LeadStatus } | null>(null);
  const [bulkAssignee, setBulkAssignee] = useState<{ open: boolean; value: string } | null>(null);
  const { toast } = useToast();

  // ۳-۱۰: با باز شدن جزئیات هر لید، پیش‌نویس یادداشت ادمین از سرور پر می‌شود.
  useEffect(() => {
    setAdminNoteDraft(detail?.adminNotes ?? '');
  }, [detail?.id]);

  // میز ۳ — ایراد ۲۵: فیلتر وضعیت، جست‌وجو و صفحه در URL می‌نشینند تا
  // سرور روی کل دیتا اعمالشان کند؛ لینک‌پذیر و با رفرش ماندگار.
  const go = (patch: { status?: LeadStatus | 'all'; q?: string; page?: number }) => {
    const params = new URLSearchParams();
    const nextStatus = patch.status ?? status;
    const nextQ = (patch.q ?? query).trim();
    const nextPage = patch.page ?? 1;
    if (nextStatus !== 'all') params.set('status', nextStatus);
    if (nextQ) params.set('q', nextQ);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // جست‌وجوی سروری با debounce؛ با هر تغییر، صفحه به ۱ برمی‌گردد.
  const [q, setQ] = useState(query);
  useEffect(() => {
    if (q.trim() === query.trim()) return;
    const timer = setTimeout(() => go({ q: q.trim(), page: 1 }), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilter = status !== 'all' || query.trim() !== '';
  const rows = initial.map((row) => ({ ...row })) as (LeadRow & Record<string, unknown>)[];

  const assigneeOptions = [...new Set(initial.map((r) => r.assignee).filter((a): a is string => Boolean(a)))];

  const toggleOne = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const togglePage = (keys: string[], select: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (select) next.add(k);
        else next.delete(k);
      }
      return next;
    });

  const selection: DataTableSelection = { selected, onToggle: toggleOne, onTogglePage: togglePage };
  // F9: فهرست نام‌های دیالوگ گروهی از دادهٔ خام ساخته می‌شود، نه نمای فیلترشده.
  const selectedRows = initial.filter((r) => selected.has(r.id));

  const changeStatus = (id: string, status: LeadStatus) => {
    setMessage('');
    startTransition(async () => {
      try {
        await updateLeadStatus(id, status);
        setMessage('وضعیت به‌روزرسانی شد.');
      } catch {
        // L4: پیام خنثی؛ نه حدس دربارهٔ علت، نه سرزنش کاربر.
        setMessage('وضعیت عوض نشد؛ دوباره تلاش کنید.');
      }
    });
  };

  // ۳-۱۰: ذخیرهٔ یادداشت داخلی ادمین؛ جدا از یادداشت فقط‌خواندنیِ کاربر.
  const saveAdminNotes = () => {
    if (!detail) return;
    const id = detail.id;
    const notes = adminNoteDraft.trim();
    startTransition(async () => {
      try {
        await updateLeadAdminNotes(id, notes);
        setDetail((d) => (d && d.id === id ? { ...d, adminNotes: notes || null } : d));
        toast({ variant: 'success', title: 'یادداشت ادمین ذخیره شد.' });
      } catch {
        toast({ variant: 'error', title: 'یادداشت ذخیره نشد؛ دوباره تلاش کنید.' });
      }
    });
  };

  const applyBulkStatus = () => {
    if (!bulkStatus) return;
    const ids = [...selected];
    const status = bulkStatus.value;
    setBulkStatus(null);
    startTransition(async () => {
      try {
        const res = await bulkUpdateLeads(ids, { status });
        toast({ variant: 'success', title: `وضعیت ${fa(res.count)} درخواست تغییر کرد.` });
        setSelected(new Set());
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'تغییر گروهی اعمال نشد؛ دوباره تلاش کنید.') });
      }
    });
  };

  const applyBulkAssignee = () => {
    if (!bulkAssignee) return;
    const ids = [...selected];
    const assignee = bulkAssignee.value.trim();
    setBulkAssignee(null);
    startTransition(async () => {
      try {
        const res = await bulkUpdateLeads(ids, { assignee });
        toast({ variant: 'success', title: `مسئول پیگیری ${fa(res.count)} درخواست مشخص شد.` });
        setSelected(new Set());
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'مسئول تعیین نشد؛ دوباره تلاش کنید.') });
      }
    });
  };

  // مرتب‌سازی ستون‌ها برداشته شده: فقط صفحهٔ جاری را مرتب می‌کرد و گمراه‌کننده بود؛
  // تا مرتب‌سازی سروری نوشته شود همین‌جا می‌ماند.
  const columns: Column<LeadRow>[] = [
    { key: 'fullName', header: 'نام', cell: (row) => <span className="text-panel-label">{row.fullName}</span> },
    {
      key: 'phone',
      header: 'تلفن',
      cell: (row) => (
        <a href={`tel:${row.phone}`} dir="ltr" className="text-brand" onClick={(e) => e.stopPropagation()}>
          {fa(row.phone)}
        </a>
      ),
    },
    { key: 'tourContext', header: 'زمینه تور', cell: (row) => <span>{[row.tourContext, row.destinationHint].filter(Boolean).join(' — ') || '—'}</span> },
    { key: 'createdAt', header: 'تاریخ', cell: (row) => <span className="whitespace-nowrap">{faDate(row.createdAt)}</span> },
    {
      key: 'status',
      header: 'وضعیت',
      cell: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Badge variant={LEAD_STATUS_VARIANT[row.status]}>{LEAD_STATUS_FA[row.status]}</Badge>
          <Select aria-label="تغییر وضعیت درخواست" value={row.status} disabled={pending} onChange={(event) => changeStatus(row.id, event.target.value as LeadStatus)} className="h-8 min-w-36 text-panel-caption max-md:min-h-11" options={LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_FA[status] }))} />
        </div>
      ),
    },
  ];

  // میز ۲: کارت موبایل درخواست — زیر md هر ردیف یک کارت عمودی است؛
  // tap روی کارت همان دیالوگ جزئیات (onRowClick) را باز می‌کند.
  const leadCard = (row: LeadRow & Record<string, unknown>) => (
    <div className="rounded-sm border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(row.id)}
            onCheckedChange={() => toggleOne(row.id)}
            aria-label={`انتخاب درخواست ${row.fullName}`}
          />
          <span className="truncate text-panel-label">{row.fullName}</span>
        </span>
        <Badge variant={LEAD_STATUS_VARIANT[row.status]} className="shrink-0">
          {LEAD_STATUS_FA[row.status]}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <a href={`tel:${row.phone}`} dir="ltr" className="font-medium text-brand" onClick={(e) => e.stopPropagation()}>
          {fa(row.phone)}
        </a>
        <span className="whitespace-nowrap text-panel-caption text-muted-foreground">{faDate(row.createdAt)}</span>
      </div>
      <p className="mt-1.5 text-panel-caption text-muted-foreground">
        {[row.tourContext, row.destinationHint].filter(Boolean).join(' — ') || '—'}
      </p>
      <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
        <Select
          aria-label="تغییر وضعیت درخواست"
          value={row.status}
          disabled={pending}
          onChange={(event) => changeStatus(row.id, event.target.value as LeadStatus)}
          className="h-8 min-w-36 text-panel-caption max-md:min-h-11"
          options={LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_FA[status] }))}
        />
      </div>
    </div>
  );

  // L2/L3: متن خالی دوحالته + حالت آموزشی صفحهٔ لیدهای تور.
  const emptyTitle = hasFilter
    ? 'با این فیلتر چیزی پیدا نشد'
    : variant === 'tour'
      ? 'هنوز درخواست تور ثبت نشده است'
      : 'هنوز درخواستی ثبت نشده است';
  const emptyDescription = hasFilter
    ? 'فیلتر وضعیت را عوض کنید یا جست‌وجو را پاک کنید.'
    : variant === 'tour'
      ? 'درخواست‌هایی که از صفحه‌های تور ثبت می‌شوند این‌جا می‌آیند. درخواست‌های عمومی سایت در «درخواست‌های تماس» است.'
      : 'درخواست‌های ثبت‌شده در سایت این‌جا می‌آیند؛ با تغییر وضعیت، روند پیگیری مشخص می‌شود.';

  return (
    <div className="space-y-4">
      {message ? <p className="text-panel-body text-muted-foreground">{message}</p> : null}

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-brand/20 bg-brand/5 p-3">
          <p className="text-panel-label font-bold">{fa(selected.size)} درخواست انتخاب‌شده</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkStatus({ open: true, value: 'contacted' })} disabled={pending}>
              تغییر وضعیت گروهی
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkAssignee({ open: true, value: '' })} disabled={pending}>
              تخصیص مسئول گروهی
            </Button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              لغو انتخاب
            </Button>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            pageSize={pageSize}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            onRowClick={(row) => setDetail(row)}
            selection={selection}
            mobileCard={leadCard}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-56">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="جست‌وجوی نام، تلفن یا مقصد…"
                    startAddon={<Search className="size-4" />}
                    className="h-9 max-md:min-h-11"
                    aria-label="جست‌وجو در همهٔ درخواست‌ها"
                  />
                </div>
                <div className="w-48">
                  <Select
                    aria-label="فیلتر وضعیت درخواست‌ها"
                    value={status}
                    onChange={(event) => go({ status: event.target.value as LeadStatus | 'all', page: 1 })}
                    className="h-9 max-md:min-h-11"
                    options={[{ value: 'all', label: 'همه وضعیت‌ها' }, ...LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_FA[status] }))]}
                  />
                </div>
              </div>
            }
          />
          {/* میز ۳ — ایراد ۲۵: صفحه‌بندی سروری؛ شمارش کل از سرور می‌آید. */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-panel-body text-muted-foreground">
              همهٔ {fa(total)} درخواست · صفحهٔ {fa(page)} از {fa(pageCount)}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go({ page: page - 1 })}>
                قبلی
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => go({ page: page + 1 })}>
                بعدی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* L1: دیالوگ جزئیات درخواست */}
      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        title="جزئیات درخواست"
        className="max-w-md"
        footer={
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setDetail(null)}>
              بستن
            </Button>
          </div>
        }
      >
        {detail ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-panel-title">{detail.fullName}</p>
              <Badge variant={LEAD_STATUS_VARIANT[detail.status]}>{LEAD_STATUS_FA[detail.status]}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-panel-body">
              <a href={`tel:${detail.phone}`} dir="ltr" className="font-medium text-brand">
                {fa(detail.phone)}
              </a>
              <span className="text-muted-foreground">{faDate(detail.createdAt)}</span>
            </div>
            <div className="my-4 border-t border-border" />
            <div className="divide-y divide-border/60">
              <DefRow label="زمینه تور">
                {[detail.tourContext, detail.destinationHint].filter(Boolean).join(' — ') || '—'}
              </DefRow>
              <DefRow label="مسیر منبع" hint="از کجای سایت آمده است">
                <span dir="ltr" className="font-mono text-panel-caption">{detail.sourcePath || '—'}</span>
              </DefRow>
              <DefRow label="تعداد مسافر">{detail.passengers || '—'}</DefRow>
              <DefRow label="مسئول پیگیری">{detail.assignee || 'تعیین نشده'}</DefRow>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-panel-caption text-muted-foreground">یادداشت</p>
              <div className="rounded-sm border border-border bg-muted/40 p-3 text-panel-body leading-6">
                {detail.notes || 'یادداشتی ثبت نشده است.'}
              </div>
            </div>
            {/* ۳-۱۰: یادداشت داخلی ادمین — قابل‌ویرایش، فقط در پنل */}
            <div className="mt-3">
              <p className="mb-2 text-panel-caption text-muted-foreground">یادداشت ادمین</p>
              <p className="mb-2 text-panel-caption text-muted-foreground/70">فقط تیم می‌بیند؛ روی سایت نمایش داده نمی‌شود.</p>
              <Textarea
                value={adminNoteDraft}
                onChange={(e) => setAdminNoteDraft(e.target.value)}
                placeholder="مثلاً: سه‌شنبه ساعت ۱۰ تماس گرفته شد؛ خواست کاتالوگ بفرستیم."
                className="min-h-16"
              />
              <div className="mt-2 flex justify-start">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={saveAdminNotes}
                  disabled={pending || adminNoteDraft.trim() === (detail.adminNotes ?? '').trim()}
                >
                  {pending ? 'در حال ذخیره…' : 'ذخیره یادداشت'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* L6: تغییر وضعیت گروهی */}
      <Dialog
        open={bulkStatus?.open ?? false}
        onOpenChange={(open) => !open && setBulkStatus(null)}
        title="تغییر وضعیت گروهی"
        className="max-w-md"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setBulkStatus(null)}>
              انصراف
            </Button>
            <Button onClick={applyBulkStatus} disabled={pending}>
              اعمال روی {fa(selected.size)} درخواست
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="وضعیت جدید">
            <Select
              value={bulkStatus?.value ?? 'contacted'}
              onChange={(e) => setBulkStatus((s) => (s ? { ...s, value: e.target.value as LeadStatus } : s))}
              options={LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_FA[status] }))}
            />
          </Field>
          <div>
            <p className="mb-2 text-panel-caption text-muted-foreground">درخواست‌های انتخاب‌شده</p>
            <ul className="max-h-32 space-y-1 overflow-auto text-panel-body">
              {selectedRows.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="text-panel-label">{r.fullName}</span>
                  <span dir="ltr" className="text-panel-caption text-muted-foreground">{r.phone}</span>
                </li>
              ))}
            </ul>
            {selectedRows.length > 5 ? (
              <p className="mt-1 text-panel-caption text-muted-foreground">و {fa(selectedRows.length - 5)} درخواست دیگر</p>
            ) : null}
          </div>
        </div>
      </Dialog>

      {/* L6: تخصیص مسئول گروهی */}
      <Dialog
        open={bulkAssignee?.open ?? false}
        onOpenChange={(open) => !open && setBulkAssignee(null)}
        title="تخصیص مسئول گروهی"
        className="max-w-md"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setBulkAssignee(null)}>
              انصراف
            </Button>
            <Button onClick={applyBulkAssignee} disabled={pending || !bulkAssignee?.value.trim()}>
              تعیین مسئول برای {fa(selected.size)} درخواست
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="مسئول پیگیری" hint="از فهرست انتخاب کنید یا نام تازه‌ای بنویسید.">
            <Input
              value={bulkAssignee?.value ?? ''}
              onChange={(e) => setBulkAssignee((s) => (s ? { ...s, value: e.target.value } : s))}
              list="lead-assignee-options"
              placeholder="مثلاً: علی اکبری"
              autoComplete="off"
            />
            <datalist id="lead-assignee-options">
              {assigneeOptions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
          <div>
            <p className="mb-2 text-panel-caption text-muted-foreground">درخواست‌های انتخاب‌شده</p>
            <ul className="max-h-32 space-y-1 overflow-auto text-panel-body">
              {selectedRows.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="text-panel-label">{r.fullName}</span>
                  <span dir="ltr" className="text-panel-caption text-muted-foreground">{r.phone}</span>
                </li>
              ))}
            </ul>
            {selectedRows.length > 5 ? (
              <p className="mt-1 text-panel-caption text-muted-foreground">و {fa(selectedRows.length - 5)} درخواست دیگر</p>
            ) : null}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
