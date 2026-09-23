'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { listLandings, checkQualityGate, setLandingWorkflow, deleteLanding } from './actions';
import LandingForm from './LandingForm';
import SectionSettingsDialog from '../SectionSettingsDialog';

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
  const [deleting, setDeleting] = useState<LandingRow | null>(null);
  const [gateIssues, setGateIssues] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const refresh = () => startTransition(async () => {
    try {
      setData(await listLandings());
    } catch (e) {
      toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در بارگذاری لندینگ‌ها.' });
    }
  });

  const onDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      try {
        await deleteLanding(deleting.id);
        toast({ variant: 'success', title: 'لندینگ حذف شد.' });
        setDeleting(null);
        refresh();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در حذف.' });
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
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در تغییر وضعیت.' });
      }
    });
  };

  const columns: Column<LandingRow>[] = [
    { key: 'queryOwner', header: 'Query Owner', sortable: true, cell: (l) => <span dir="ltr" className="font-mono text-xs text-muted-foreground">{l.queryOwner}</span> },
    { key: 'urlPath', header: 'مسیر', sortable: true, cell: (l) => <span dir="ltr" className="font-mono text-xs text-muted-foreground">{l.urlPath}</span> },
    { key: 'titleFa', header: 'عنوان', sortable: true, cell: (l) => <span className="line-clamp-1 font-medium">{l.titleFa}</span> },
    { key: 'workflow', header: 'وضعیت', sortable: true, cell: (l) => <Badge variant={WORKFLOW_MAP[(l.workflow ?? 'draft') as Workflow]?.variant ?? 'secondary'}>{WORKFLOW_MAP[(l.workflow ?? 'draft') as Workflow]?.label ?? l.workflow}</Badge> },
    { key: 'indexStatus', header: 'ایندکس', cell: (l) => <Badge dir="ltr" variant={l.indexStatus === 'index' ? 'success' : 'warning'}>{l.indexStatus ?? 'noindex'}</Badge> },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-56',
      cell: (l) => (
        <div className="flex items-center gap-1">
          <Select
            aria-label={`تغییر وضعیت ${l.titleFa}`}
            value={l.workflow ?? 'draft'}
            disabled={pending}
            onChange={(event) => handleWorkflow(l.id, event.target.value as Workflow)}
            className="h-8 min-w-32 text-xs"
            options={WORKFLOW_OPTIONS}
          />
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(l)} disabled={pending}>
            <Trash2 />
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت لندینگ‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت صفحات سئو، چک‌لیست انتشار و کنترل ایندکس.</p>
        </div>
        <div className="flex items-center gap-2">
          <SectionSettingsDialog sectionKey="seo" title="تنظیمات سئو" tabs={['seo']} values={sectionSettings} />
          <Button onClick={() => setShowForm((v) => !v)}>
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
            searchPlaceholder="جست‌وجوی عنوان، مسیر یا Query Owner…"
            emptyTitle="لندینگی ثبت نشده است"
            emptyDescription="برای شروع، لندینگ جدیدی بسازید."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(openState) => !openState && setDeleting(null)}
        title="حذف لندینگ"
        description={deleting ? `آیا از حذف «${deleting.titleFa}» اطمینان دارید؟ این کار برگشت‌پذیر نیست.` : ''}
        confirmText="حذف لندینگ"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
