'use client';

import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { fa } from '@/lib/utils';
import { STAGE_SHORT_TITLES, type PublishCheck } from './publish-gate';

interface MissingChecksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missing: PublishCheck[];
  /** رفتن به مرحلهٔ مربوط: دیالوگ بسته می‌شود و ویزارد همان مرحله را باز می‌کند. */
  onGoToStage: (stageId: number) => void;
}

/**
 * دیالوگ ناقصی‌های انتشار (موج ۱، قلم ۶ — نگهبان نرم پیش‌انتشار): به‌جای خطای
 * خشک، راهنمای قدم‌به‌قدم «اول این را کامل کن» با لینک مستقیم به مرحلهٔ مربوط.
 */
export function MissingChecksDialog({ open, onOpenChange, missing, onGoToStage }: MissingChecksDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="اول این‌ها را کامل کن"
      description="برای انتشار، این قلم‌ها ناقص‌اند:"
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)} data-autofocus>
          بستن
        </Button>
      }
    >
      <ul className="space-y-2">
        {missing.map((check) => (
          <li
            key={check.key}
            className="flex items-start justify-between gap-3 rounded-sm border border-border bg-card p-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="text-xs font-bold text-foreground">{check.label}</div>
              <div className="text-xs text-muted-foreground">{check.message}</div>
              <div className="text-[11px] text-muted-foreground">
                مرحلهٔ {fa(check.stageId)} · {STAGE_SHORT_TITLES[check.stageId] ?? ''}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => {
                onOpenChange(false);
                onGoToStage(check.stageId);
              }}
            >
              رفتن به مرحلهٔ {fa(check.stageId)}
            </Button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

interface PublishConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourTitle: string;
  onConfirm: () => void;
}

/**
 * دیالوگ تأیید انتشار: با نام تور + جملهٔ پیامد، بر اساس الگوی دیالوگ‌های
 * خطرناک پنل (بایگانی و حذف — اصل ۳ پلن).
 */
export function PublishConfirmDialog({ open, onOpenChange, tourTitle, onConfirm }: PublishConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`تور «${tourTitle || 'بدون عنوان'}» منتشر شود؟`}
      description="بعد از انتشار، تور روی سایت دیده می‌شود."
      confirmText="انتشار"
      cancelText="انصراف"
      onConfirm={onConfirm}
    />
  );
}
