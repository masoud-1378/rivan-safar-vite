'use client';

import { useState, useTransition } from 'react';
import { Archive, Layers, Pencil, Plus } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { listLandings, checkQualityGate, setLandingWorkflow, deleteLanding } from './actions';
import LandingForm, { type LandingFormInitial } from './LandingForm';
import LandingContent from './LandingContent';
import SectionSettingsDialog from '../SectionSettingsDialog';
import { safeErrorMessage } from '@/src/lib/error-message';

type LandingRow = Awaited<ReturnType<typeof listLandings>>[number];
type Workflow = 'draft' | 'review' | 'published' | 'paused' | 'archived';

const WORKFLOW_MAP: Record<Workflow, { label: string; variant: 'secondary' | 'warning' | 'success' | 'brand' | 'outline' }> = {
  draft: { label: 'پیش‌نویس', variant: 'secondary' },
  review: { label: 'بازبینی', variant: 'warning' },
  published: { label: 'منتشرشده', variant: 'success' },
  paused: { label: 'متوقف', variant: 'brand' },
  archived: { label: 'بایگانی', variant: 'outline' },
};

const WORKFLOW_OPTIONS = (Object.keys(WORKFLOW_MAP) as Workflow[]).map((value) => ({ value, label: WORKFLOW_MAP[value].label }));

export default function LandingList({ initial, sectionSettings }: { initial: LandingRow[]; sectionSettings: Record<string, string> }) {
  const [data, setData] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LandingRow | null>(null);
  const [contentFor, setContentFor] = useState<LandingRow | null>(null);
  const [deleting, setDeleting] = useState<LandingRow | null>(null);
  const [gateIssues, setGateIssues] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const editingInitial: LandingFormInitial | null = editing
    ? {
        id: editing.id,
        queryOwner: editing.queryOwner,
        urlPath: editing.urlPath,
        pageType: editing.pageType,
        titleFa: editing.titleFa,
        metaDescriptionFa: editing.metaDescriptionFa,
        h1Fa: editing.h1Fa,
        workflow: (editing.workflow ?? 'draft') as LandingFormInitial['workflow'],
        indexStatus: (editing.indexStatus ?? 'noindex') as LandingFormInitial['indexStatus'],
        nextReviewAt: editing.nextReviewAt ? new Date(editing.nextReviewAt) : null,
      }
    : null;

  const refresh = () => startTransition(async () => {
    try {
      setData(await listLandings());
    } catch (e) {
      toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در بارگذاری لندینگ‌ها.') });
    }
  });

  const onDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      try {
        await deleteLanding(deleting.id);
        toast({ variant: 'success', title: 'لندینگ بایگانی شد.' });
        setDeleting(null);
        refresh();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'حذف انجام نشد؛ دوباره تلاش کنید.') });
      }
    });
  };

  const handleWorkflow = (id: string, workflow: Workflow) => {
    startTransition(async () => {
      try {
        if (workflow === 'published') {
          const check = await checkQualityGate(id);
          if (!check.canPublish) {
            setGateIssues(check.reasons);
            return;
          }
        }
        await setLandingWorkflow(id, workflow);
        toast({ variant: 'success', title: `وضعیت به «${WORKFLOW_MAP[workflow].label}» تغییر کرد.` });
        refresh();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در تغییر وضعیت.') });
      }
    });
  };

  const columns: Column<LandingRow>[] = [
    { key: 'titleFa', header: 'عنوان فارسی', sortable: true, cell: (l) => <span className="line-clamp-1 font-medium">{l.titleFa}</span> },
    { key: 'queryOwner', header: 'کد یکتای صفحه', sortable: true, cell: (l) => <span dir="ltr" className="font-mono text-xs text-muted-foreground">{l.queryOwner}</span> },
    { key: 'urlPath', header: 'مسیر', sortable: true, cell: (l) => <span dir="ltr" className="font-mono text-xs text-muted-foreground">{l.urlPath}</span> },
    { key: 'workflow', header: 'وضعیت', sortable: true, cell: (l) => <Badge variant={WORKFLOW_MAP[(l.workflow ?? 'draft') as Workflow]?.variant ?? 'secondary'}>{WORKFLOW_MAP[(l.workflow ?? 'draft') as Workflow]?.label ?? l.workflow}</Badge> },
    { key: 'indexStatus', header: 'نمایش در گوگل', cell: (l) => <Badge variant={l.indexStatus === 'index' ? 'success' : 'warning'}>{l.indexStatus === 'index' ? 'باشد' : 'نباشد'}</Badge> },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-64',
      cell: (l) => (
        <div className="flex flex-wrap items-center gap-1">
          <Select
            aria-label={`تغییر وضعیت ${l.titleFa}`}
            value={l.workflow ?? 'draft'}
            disabled={pending}
            onChange={(event) => handleWorkflow(l.id, event.target.value as Workflow)}
            className="h-8 min-w-36 text-xs"
            options={WORKFLOW_OPTIONS}
          />
          <Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => setEditing(l)} disabled={pending}>
            <Pencil />
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => setContentFor(l)} disabled={pending}>
            <Layers />
            محتوا
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive max-md:min-h-11" onClick={() => setDeleting(l)} disabled={pending}>
            <Archive />
            بایگانی
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت لندینگ‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت صفحات سئو، چک‌لیست انتشار و کنترل ایندکس.</p>
        </div>
        <div className="flex items-center gap-2">
          <SectionSettingsDialog sectionKey="seo" title="تنظیمات سئو" tabs={['seo']} values={sectionSettings} />
          <Button className="h-11 lg:h-10" onClick={() => setShowForm((v) => !v)}>
            <Plus />
            {showForm ? 'بستن فرم' : 'لندینگ جدید'}
          </Button>
        </div>
      </div>

      {gateIssues ? (
        <Alert variant="warning" title="چک‌لیست انتشار پاس نشد">
          <ul className="mt-1 list-disc space-y-0.5 pe-4">
            {gateIssues.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </Alert>
      ) : null}

      {showForm ? <LandingForm onSaved={() => { setShowForm(false); refresh(); }} /> : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-base font-semibold">لیست لندینگ‌ها ({fa(data.length)})</h2>
          <DataTable
            rows={data}
            columns={columns}
            rowKey={(l) => l.id}
            searchKeys={['queryOwner', 'urlPath', 'titleFa']}
            searchPlaceholder="جست‌وجوی عنوان، مسیر یا کد یکتا…"
            emptyTitle="لندینگی ثبت نشده است"
            emptyDescription="برای شروع، لندینگ جدیدی بسازید."
            emptyAction={data.length === 0 ? { label: 'ساخت اولین لندینگ', onClick: () => setShowForm(true) } : undefined}
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(openState) => !openState && setEditing(null)}
        title={`ویرایش لندینگ «${editing?.titleFa ?? ''}»`}
        className="max-w-3xl"
      >
        {editingInitial ? (
          <LandingForm
            initial={editingInitial}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(contentFor)}
        onOpenChange={(openState) => !openState && setContentFor(null)}
        title={contentFor ? `محتوای لندینگ «${contentFor.titleFa}»` : ''}
        description="بلوک‌های محتوا و لینک‌های داخلی — همان‌هایی که شرایط انتشار می‌خواهد."
        className="max-w-3xl"
      >
        {contentFor ? (
          <LandingContent
            landingId={contentFor.id}
            titleFa={contentFor.titleFa}
            urlPath={contentFor.urlPath}
            landings={data.map((l) => ({ id: l.id, titleFa: l.titleFa, urlPath: l.urlPath }))}
          />
        ) : null}
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(openState) => !openState && setDeleting(null)}
        title="بایگانی لندینگ"
        description={deleting ? `لندینگ «${deleting.titleFa}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند. با «بازیابی» خودِ لندینگ برمی‌گردد، ولی بلوک‌های محتوا، لینک‌های داخلی و محصولات متصلش برای همیشه پاک شده‌اند و برنمی‌گردند.` : ''}
        confirmText="بایگانی لندینگ"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
