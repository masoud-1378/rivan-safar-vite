export type ClassValue = string | number | bigint | null | undefined | false | ClassValue[];

/** Minimal class joiner (swap for clsx + tailwind-merge when the library grows). */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (Array.isArray(i)) {
      const nested = cn(...i);
      if (nested) out.push(nested);
    } else {
      out.push(String(i));
    }
  }
  return out.join(" ");
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert Latin digits in a string/number to Persian digits: 1405 -> ۱۴۰۵ */
export function fa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Persian digits back to Latin (for parsing user input). */
export function en(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d))).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** Thousands-separated Persian number: 12450000 -> ۱۲٬۴۵۰٬۰۰۰ */
export function faNumber(value: number): string {
  return fa(Math.round(value).toLocaleString("en-US")).replace(/,/g, "٬");
}

/** Amount in toman with unit: 12450000 -> ۱۲٬۴۵۰٬۰۰۰ تومان */
export function formatToman(value: number): string {
  return `${faNumber(value)} تومان`;
}

/** Percent with Persian digits and the Persian percent sign: 18 -> ۱۸٪ */
export function faPercent(value: number, digits = 0): string {
  return `${fa(value.toFixed(digits))}٪`;
}

/** File size in Persian: 1258291 -> ۱٫۲ مگابایت */
export function faFileSize(bytes: number): string {
  if (bytes < 1024) return `${fa(bytes)} بایت`;
  if (bytes < 1024 ** 2) return `${fa((bytes / 1024).toFixed(0))} کیلوبایت`;
  return `${fa((bytes / 1024 ** 2).toFixed(1)).replace(".", "٫")} مگابایت`;
}

/** Deterministic PRNG; same seed → same sequence. Returns a function yielding [0, 1). sequence: mulberry32(1)() -> 0.627... */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FA_SLUG_MAP: Record<string, string> = {
  'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
  'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
  'ق': 'gh', 'ک': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
  'ن': 'n', 'ه': 'h', 'ة': 'h', 'ی': 'i', 'ي': 'i', 'ئ': 'y',
  'ؤ': 'v', 'ء': '',
};

/**
 * نام فارسی → نامک لاتین: «تهران» → «tehran».
 * فقط پیشنهاد اولیه است؛ و و ی بر اساس جایگاه (اول واژه یا میان آن)
 * به v/y یا u/i تبدیل می‌شوند. نویسه‌های ناشناس حذف و فاصله‌ها خط تیره می‌شوند.
 */
export function faSlug(name: string): string {
  const chars = [...(name || '')];
  let out = '';
  let prevWasLetter = false;
  for (const ch of chars) {
    if (ch === 'و') {
      out += prevWasLetter ? 'u' : 'v';
      prevWasLetter = true;
      continue;
    }
    if (ch === 'ی' || ch === 'ي') {
      out += prevWasLetter ? 'i' : 'y';
      prevWasLetter = true;
      continue;
    }
    const mapped = FA_SLUG_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
      prevWasLetter = mapped !== '';
      continue;
    }
    if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.toLowerCase();
      prevWasLetter = true;
      continue;
    }
    // نیم‌فاصله، کشیده، اعراب و هر جداکنندهٔ دیگر → مرز واژه
    out += '-';
    prevWasLetter = false;
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
