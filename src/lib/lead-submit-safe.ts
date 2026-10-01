import { createLead, type LeadInput, type LeadResult } from '../../app/actions/lead';

/**
 * میز P-B فاز ۲ (PB-01): پوشش امن برای فراخوانی اکشن ثبت لید.
 *
 * هر ۶ نقطهٔ ثبت لید در کامپوننت‌های سایت، خروجی اکشن را مستقیم await
 * می‌کردند بدون try/catch. اگر شبکه وسط راه بیفتد یا خود اکشن throw کند،
 * promise رها می‌شود (unhandled rejection در کنسول) و اسپینر فرم برای همیشه
 * قفل می‌ماند. این هلپر به‌جای throw، همان قرارداد LeadResult را با پیام
 * فارسی راه‌گشا برمی‌گرداند تا فرم همیشه به یک حالت مشخص برسد.
 */
const NETWORK_FALLBACK_MESSAGE =
  'ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کنید و دوباره تلاش کنید، یا برای ثبت سریع‌تر با شمارهٔ ۰۲۶ — ۳۳۳۵۰۱۳۹ تماس بگیرید.';

export async function safeCreateLead(input: LeadInput): Promise<LeadResult> {
  try {
    return await createLead(input);
  } catch {
    return { ok: false, stored: false, message: NETWORK_FALLBACK_MESSAGE };
  }
}
