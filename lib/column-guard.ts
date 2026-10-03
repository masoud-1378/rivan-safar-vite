/**
 * lib/column-guard.ts — نگهبان مشترک ستون‌های دیتابیس (الگوی «نگهبان + اطلاع»).
 *
 * سناریو: ستون تازه‌ای در کد هست ولی مایگریشنش هنوز اجرا نشده (مثل
 * `summary_rich` راهنما قبل از 0030). این هلپر با یک کوئری سبک روی
 * `information_schema` می‌پرسد ستون‌ها واقعاً هستند یا نه، تا کد فقط وقتی
 * بخواند/بنویسد که ستون هست — و فرم با `useColumnGuard` + `ColumnNotice`
 * (در components/ui/column-guard.tsx) کنار همان فیلدها یک اطلاع صادقانه
 * نشان بدهد. هیچ‌وقت نباید ویرایش کاربر بی‌صدا گم شود.
 *
 * قرارداد استفاده (برای تیم‌های مقصدها/تورها/لندینگ‌ها):
 *  ۱. سرور: `checkColumnsExist(db, 'table', ['col_a', 'col_b'])` — برمی‌گرداند
 *     `{ ready: true }` فقط وقتی «هر دو» (همهٔ) ستون باشند؛ وگرنه
 *     `{ ready: false, missing: [...] }`.
 *  ۲. سرور: یک اکشن کوچک مثل `checkXCols()` که همان را برمی‌گرداند و با
 *     requireAdmin محافظت شده.
 *  ۳. کلاینت: `const ready = useColumnGuard(checkXCols)` — روی mount یک‌بار
 *     می‌پرسد؛ `null` یعنی هنوز معلوم نیست، `false` یعنی اطلاع نشان بده.
 *  ۴. کلاینت: `{ready === false && <ColumnNotice>…</ColumnNotice>}` دقیقاً
 *     کنار فیلدهای درگیر، نه بنر سراسری و نه بلاک‌کننده.
 *  ۵. بعد از اجرای مایگریشن، اطلاع با یک ریلود (حداکثر با تأخیر کش ۶۰ ثانیه‌ای)
 *     خودش ناپدید می‌شود — چیزی برای پاک‌کردن دستی نیست.
 */
import { sql } from 'drizzle-orm';
import type { AppDb } from '@/db/client';

/** نتیجهٔ نگهبان: فقط وقتی آماده است که «همهٔ» ستون‌های خواسته‌شده باشند. */
export interface ColumnGuardResult {
  ready: boolean;
  /** ستون‌هایی که در دیتابیس پیدا نشدند (وقتی ready است خالی است). */
  missing: string[];
}

/** کش کوتاه‌مدت: بعد از اجرای مایگریشن حداکثر یک دقیقه طول می‌کشد تا تازه شود. */
const GUARD_TTL_MS = 60_000;
const guardCache = new Map<string, { at: number; result: ColumnGuardResult }>();

/** نام جدول/ستون فقط حروف و آندرلاین — ورودی کاربر نیست ولی دفاعی چک می‌شود. */
const IDENT_RE = /^[a-z_][a-z0-9_]*$/i;

function assertIdent(name: string, kind: 'table' | 'column'): void {
  if (!IDENT_RE.test(name)) throw new Error(`نام ${kind} نامعتبر است: ${name}`);
}

/**
 * آیا همهٔ ستون‌های داده‌شده در جدول هستند؟
 * خطای کوئری (مثلاً دیتابیس در دسترس نیست) = مثل نبود ستون رفتار می‌کند
 * (fail closed): خواندن/نوشتن انجام نمی‌شود و فرم اطلاع نشان می‌دهد.
 */
export async function checkColumnsExist(
  db: AppDb,
  table: string,
  columns: readonly string[],
): Promise<ColumnGuardResult> {
  assertIdent(table, 'table');
  for (const c of columns) assertIdent(c, 'column');
  const key = `${table}:${columns.join(',')}`;
  const now = Date.now();
  const cached = guardCache.get(key);
  if (cached && now - cached.at < GUARD_TTL_MS) return cached.result;

  let result: ColumnGuardResult;
  try {
    const res = await db.execute(sql`
      select column_name from information_schema.columns
      where table_schema = 'public'
        and table_name = ${table}
        and column_name in (${sql.join(
          columns.map((c) => sql`${c}`),
          sql`, `,
        )})
    `);
    const found = new Set(
      (res as unknown as Array<{ column_name: string }>).map((r) => r.column_name),
    );
    const missing = columns.filter((c) => !found.has(c));
    result = { ready: missing.length === 0, missing };
  } catch {
    // دیتابیس در دسترس نیست یا کوئری شکست خورد → مثل نبود ستون رفتار کن
    result = { ready: false, missing: [...columns] };
  }
  guardCache.set(key, { at: now, result });
  return result;
}
