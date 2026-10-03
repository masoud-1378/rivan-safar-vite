'use client';

import { useEffect, useState } from 'react';

/**
 * components/ui/column-guard.tsx — سمت کلاینت الگوی «نگهبان + اطلاع».
 *
 * `useColumnGuard(check)`: روی mount یک‌بار از اکشن سرور می‌پرسد ستون‌ها
 * آماده‌اند یا نه. برمی‌گرداند:
 *  - `true`  → همه‌چیز سر جایش است؛ هیچ اطلاعی نشان نده.
 *  - `false` → ستون نیست (یا خطا خورد)؛ اطلاع صادقانه کنار فیلد نشان بده.
 *  - `null`  → هنوز جواب نیامده؛ چیزی نشان نده تا اطلاع چشمک نزند.
 *
 * `ColumnNotice`: اطلاع غیربلاک‌کنندهٔ کنار همان فیلد درگیر — نه بنر سراسری،
 * نه دیالوگ، نه غیرفعال‌کردن دکمهٔ ذخیره. کاربر بقیهٔ فرم را عادی ذخیره می‌کند
 * و فقط می‌داند این فیلد فعلاً اعمال نمی‌شود.
 */

/** پارامتر: اکشن سرور (مثل `checkGuideRichCols`) که boolean برمی‌گرداند. */
export function useColumnGuard(check: () => Promise<boolean>): boolean | null {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    check()
      .then((r) => {
        if (alive) setReady(r);
      })
      .catch(() => {
        // خطا = نتوانستیم مطمئن شویم ستون هست → صادقانه اطلاع نشان بده
        if (alive) setReady(false);
      });
    return () => {
      alive = false;
    };
  }, [check]);
  return ready;
}

/** اطلاع غیربلاک‌کننده کنار فیلد. متن را خود فرم می‌دهد (لحن طبیعی فارسی). */
export function ColumnNotice({ children }: { children: React.ReactNode }) {
  return (
    <p role="note" className="mt-1.5 text-xs leading-5 text-amber-700 dark:text-amber-400">
      {children}
    </p>
  );
}
