'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  setAllDraftFallbackAnswer,
  type AllDraftFallbackAnswer,
} from '../settings/actions';

interface AllDraftFallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** بعد از ثبت موفق جواب صدا زده می‌شود. */
  onSaved?: (answer: AllDraftFallbackAnswer) => void;
}

/**
 * قلم ۴ موج ۱ (تصمیم ۴، ۱۴۰۵/۰۷/۱۱): سؤال «همه پیش‌نویس».
 *
 * لحظه‌ای که تعداد تورهای منتشرشده به صفر می‌رسد، پنل همین دیالوگ را از مدیر
 * می‌پرسد — نه سیاست ثابت، نه حدس. جواب در تنظیمات سایت ذخیره می‌شود و سایت
 * عمومی بر اساس همان رفتار می‌کند. بستن دیالوگ بدون انتخاب هم مجاز است؛ در
 * این صورت بنر صفحهٔ تورها دوباره سؤال را یادآوری می‌کند.
 *
 * متن‌ها با persian-ui-copy: دکمه‌ها حاملِ خودِ کنش‌اند، نه «بله/خیر».
 */
export function AllDraftFallbackDialog({ open, onOpenChange, onSaved }: AllDraftFallbackDialogProps) {
  const [busy, setBusy] = useState<AllDraftFallbackAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (answer: AllDraftFallbackAnswer) => {
    if (busy) return;
    setBusy(answer);
    setError(null);
    try {
      await setAllDraftFallbackAnswer(answer);
      onOpenChange(false);
      onSaved?.(answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت انتخاب انجام نشد؛ دوباره تلاش کنید.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="تور نمونه نشان داده شود؟"
      description="آخرین تور منتشرشده هم از سایت برداشته شد و الان هیچ توری روی سایت نیست. این انتخاب ذخیره می‌شود و هر وقت دوباره توری منتشر شود، سایت به حالت عادی برمی‌گردد."
      footer={
        <>
          <Button
            type="button"
            disabled={busy !== null}
            onClick={() => void choose('sample')}
            className="max-md:min-h-11"
          >
            {busy === 'sample' ? 'در حال ثبت…' : 'تور نمونه نشان بده'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void choose('empty')}
            className="max-md:min-h-11"
          >
            {busy === 'empty' ? 'در حال ثبت…' : 'صفحهٔ خالی بماند'}
          </Button>
        </>
      }
    >
      {error ? (
        <p role="alert" className="text-panel-body text-destructive">
          {error}
        </p>
      ) : null}
    </Dialog>
  );
}

/**
 * دکمه‌ای که دیالوگ سؤال را باز می‌کند — برای بنر صفحهٔ تورها.
 * بعد از ثبت جواب، صفحه رفرش می‌شود تا بنر (که دیگر لازم نیست) محو شود.
 */
export function AllDraftFallbackAskButton({ label = 'انتخاب می‌کنم' }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)} className="max-md:min-h-11">
        {label}
      </Button>
      <AllDraftFallbackDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
