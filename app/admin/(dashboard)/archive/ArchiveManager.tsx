'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { fa } from '@/lib/utils';
import { formatJalali } from '@/lib/jalali';
import { useToast } from '@/components/ui/toast';
import { hardDeleteArchived, restoreArchived, type ArchivedGroup } from './actions';
import { safeErrorMessage } from '@/src/lib/error-message';

interface Props {
  groups: ArchivedGroup[];
  isOwner: boolean;
}

export default function ArchiveManager({ groups, isOwner }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<{ entity: string; id: string; title: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  const onRestore = async (entity: string, id: string) => {
    setBusy(true);
    setError(null);
    try {
      await restoreArchived(entity, id);
      toast({ variant: 'success', title: 'بازیابی شد' });
      router.refresh();
    } catch (e) {
      setError(safeErrorMessage(e, 'خطای ناشناخته'));
    } finally {
      setBusy(false);
    }
  };

  const onHardDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    setError(null);
    try {
      await hardDeleteArchived(pendingDelete.entity, pendingDelete.id);
      setPendingDelete(null);
    } catch (e) {
      setError(safeErrorMessage(e, 'خطای ناشناخته'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-panel-display">بایگانی</h1>
        <p className="mt-2 text-panel-body text-muted-foreground">
          {total === 0
            ? 'هرچه از پنل بایگانی شود، این‌جا می‌آید و می‌توان آن را برگرداند.'
            : `${fa(total)} رکورد بایگانی‌شده؛ بازیابی هرکدام آن را به جای خودش برمی‌گرداند.`}
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-panel-body text-destructive">
          {error}
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          title="بایگانی خالی است"
          description="هنوز چیزی بایگانی نشده؛ حذف‌های پنل از این به بعد این‌جا می‌آیند."
        />
      ) : (
        groups
          .filter((g) => g.rows.length > 0)
          .map((g) => (
            <section key={g.key} aria-label={g.label}>
              <h2 className="mb-4 text-panel-heading">
                {g.label} <span className="text-panel-body text-muted-foreground">({fa(g.rows.length)})</span>
              </h2>
              <Card className="divide-y">
                {g.rows.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate text-panel-label">{r.title}</p>
                      {r.subtitle && <p className="truncate text-panel-caption text-muted-foreground">{r.subtitle}</p>}
                      <p className="text-panel-caption text-muted-foreground">
                        بایگانی‌شده در {formatJalali(new Date(r.archivedAt))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 max-md:w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="max-md:min-h-11 max-md:flex-1"
                        disabled={busy}
                        onClick={() => onRestore(g.key, r.id)}
                      >
                        <ArchiveRestore className="size-4" />
                        بازیابی
                      </Button>
                      {isOwner && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="max-md:min-h-11 max-md:flex-1"
                          disabled={busy}
                          onClick={() => setPendingDelete({ entity: g.key, id: r.id, title: r.title })}
                        >
                          <Trash2 className="size-4" />
                          حذف دائمی
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          ))
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={pendingDelete ? `حذف دائمی «${pendingDelete.title}»؟` : ''}
        description="این رکورد برای همیشه از پایگاه داده پاک می‌شود و هیچ راهی برای برگرداندنش نیست. اگر هنوز ممکن است به آن نیاز داشته باشید، به‌جای حذف دائمی آن را بازیابی کنید."
        confirmText="حذف دائمی"
        destructive
        onConfirm={onHardDelete}
      />
    </div>
  );
}
