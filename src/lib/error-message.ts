/**
 * SEC-13: لایهٔ مرکزی ترجمهٔ خطا برای UI پنل.
 *
 * مشکل: ده‌ها کامپوننت `err.message` خام را مستقیم در toast/خطا نشان می‌دادند.
 * امروز اکشن‌های سرور خطای ژنریک می‌اندازند، ولی هر `throw` تازه با پیام
 * دیتابیسی در آینده مستقیم به UI می‌رسید.
 *
 * قرارداد: فقط پیام‌هایی که با اطمینان امن‌اند (فارسی، کوتاه، بدون نشان
 * دیتابیسی) به کاربر نشان داده می‌شوند؛ بقیه به پیام ژنریک فارسی فرومی‌ریزند.
 * `err.message` خام در UI ممنوع است — همیشه از همین تابع ردش کن.
 */
const DBISH =
  /(select|insert|update|delete|from\s+where|postgres|supabase|drizzle|constraint|violat|duplicate|unique|relation|column|syntax|timeout|fetch\s+failed|network|stack|referenceerror|typeerror)/i;

export function safeErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    const m = err.message.trim();
    if (
      m.length > 0 &&
      m.length <= 220 &&
      /\p{Script=Arabic}/u.test(m) && // پیام فارسی = اعتبارسنجی امن سرور
      !DBISH.test(m) // هیچ بویی از دیتابیس/استک ندهد
    ) {
      return m;
    }
  }
  return fallback;
}
