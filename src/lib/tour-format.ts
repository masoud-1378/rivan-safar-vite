/**
 * قالب‌بندی‌های مشترک تور و تنظیمات — خالص و بدون هیچ import از ماژول‌های
 * سروری یا کلاینتی، تا هم در اکشن‌های سرور (saveTour) و هم در کامپوننت‌های
 * کلاینتی (مرحله‌های ویزارد، فرم تنظیمات) قابل استفاده باشد.
 *
 * موج ۲، تیم تکراری‌ها (۱۴۰۵/۰۷/۱۱): منبع حقیقتِ این قلم‌ها یکی است؛
 * فرم فقط ورودی می‌گیرد و سرور همان منطق را مرجع می‌کند.
 */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function faDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** ارقام فارسی/عربی به لاتین — برای تحلیل شمارهٔ واردشده توسط مدیر. */
function latinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * متن «مدت اقامت» همیشه و فقط از عدد «تعداد شب» ساخته می‌شود.
 * فرم دیگر ورودی متن جدا ندارد؛ سرور (saveTour) هم ورودی دستی را نادیده می‌گیرد.
 * nights>0 → «۳ شب و ۴ روز»؛ وگرنه رشتهٔ خالی (هیچ حدسی زده نمی‌شود).
 */
export function buildDurationFromNights(nights: number | string): string {
  const n = Math.max(0, Math.floor(Number(nights) || 0));
  if (n <= 0) return '';
  return `${faDigits(n)} شب و ${faDigits(n + 1)} روز`;
}

/**
 * پیشنهاد قالب نمایشی شماره تلفن از روی خود شماره.
 * فقط «پیشنهاد» است — هیچ‌وقت بی‌صدا نوشته نمی‌شود؛ فرم تنظیمات آن را با
 * دکمهٔ «اعمال شود» / «نه، همین بماند» به مدیر نشان می‌دهد.
 * '02633350139' → '۰۲۶ — ۳۳۳۵۰۱۳۹'؛ قالب ناشناس → null (پیشنهادی نیست).
 */
export function suggestPhoneDisplay(phone: string): string | null {
  const digits = latinDigits(phone).replace(/\D/g, '');
  if (/^0\d{10}$/.test(digits)) {
    return `${faDigits(digits.slice(0, 3))} — ${faDigits(digits.slice(3))}`;
  }
  return null;
}
