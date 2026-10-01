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
      toast({ variant: 'success', title: 'بازیابی شد.' });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطای ناشناخته');
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
      setError(e instanceof Error ? e.message : 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">بایگانی</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total === 0
            ? 'هرچه از پنل بایگانی شود، این‌جا می‌آید و می‌توان آن را برگرداند.'
            : `${fa(total)} رکورد بایگانی‌شده؛ بازیابی هرکدام آن را به جای خودش برمی‌گرداند.`}
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
              <h2 className="mb-3 text-base font-semibold">
                {g.label} <span className="text-sm font-normal text-muted-foreground">({fa(g.rows.length)})</span>
              </h2>
              <Card className="divide-y">
                {g.rows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.title}</p>
                      {r.subtitle && <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>}
                      <p className="text-xs text-muted-foreground">
                        بایگانی‌شده در {formatJalali(new Date(r.archivedAt))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
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
