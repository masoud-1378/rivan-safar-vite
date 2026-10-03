import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** تور پیدا نشد (مثلاً بایگانی‌شده یا شناسهٔ اشتباه) — داخل چیدمان پنل ادمین. */
export default function TourNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">۴۰۴</p>
      <h1 className="text-panel-title text-foreground">این تور پیدا نشد</h1>
      <p className="max-w-sm text-panel-body text-muted-foreground">
        شاید بایگانی شده یا آدرسش اشتباه است. از فهرست تورها دوباره پیدایش کن.
      </p>
      <Link href="/admin/tours">
        <Button>بازگشت به فهرست تورها</Button>
      </Link>
    </div>
  );
}
