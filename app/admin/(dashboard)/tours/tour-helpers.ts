'use client';

/* ------------------------------------------------------------------ */
/* نامک انگلیسی تور — ترجمهٔ واژه‌به‌واژه از روی دیکشنری، نه آوانویسی   */
/* حرف‌به‌حرف. قاعده‌ها:                                               */
/*  ۱) «تور» و کلمات زائد (حروف اضافه، صفت تبلیغاتی، خدمات) حذف می‌شود */
/*  ۲) کشورها و شهرها از دیکشنری مقاصد واقعی دیتابیس ترجمه می‌شوند؛    */
/*     شهر چندکلمه‌ای مخفف می‌شود (کوالالامپور ← kl)                   */
/*  ۳) «۸ روزه» همیشه آخر نامک می‌آید: ‎8d (مثل قرارداد دستی تیم)      */
/*  ۴) واژهٔ ناشناخته فقط در آخرین قدم آوانویسی می‌شود (نه اول کار)     */
/* نمونه: «تور مالزی کوالالامپور» ← malaysia-kl                        */
/* ------------------------------------------------------------------ */

/** یکدست‌سازی برای جست‌وجو در دیکشنری: ي/ك عربی، نیم‌فاصله، اعراب. */
function normFaWord(w: string): string {
  return w
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ی')
    .replace(/[‌‍]/g, '')
    .replace(/[ً-ٰٟ]/g, '')
    .trim();
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function latinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => {
    const i = FA_DIGITS.indexOf(d);
    if (i >= 0) return String(i);
    return String(AR_DIGITS.indexOf(d));
  });
}

/** کلید دیکشنری: مثل normFaWord ولی فاصله هم حذف می‌شود تا
    «سن‌پترزبورگ» (نیم‌فاصله) و «سن پترزبورگ» (فاصله) یکی دیده شوند. */
const keyOf = (s: string): string => normFaWord(s).replace(/\s+/g, '');

/** مقاصد: نام فارسی ← نامک انگلیسی. از جدول site_destinations/places خوانده شده. */
const PLACES: Record<string, string> = {
  'ایران': 'iran',
  'ترکیه': 'turkey',
  'استانبول': 'istanbul',
  'آنتالیا': 'antalya',
  'امارات': 'uae',
  'امارات متحده عربی': 'uae',
  'دبی': 'dubai',
  'تایلند': 'thailand',
  'بانکوک': 'bangkok',
  'پوکت': 'phuket',
  'مالزی': 'malaysia',
  'کوالالامپور': 'kl',
  'لنکاوی': 'langkawi',
  'چین': 'china',
  'گوانگجو': 'guangzhou',
  'کانتون': 'canton',
  'کنتون': 'canton',
  'روسیه': 'russia',
  'مسکو': 'moscow',
  'سن پترزبورگ': 'st-petersburg',
  'سنت پترزبورگ': 'st-petersburg',
  'ارمنستان': 'armenia',
  'ایروان': 'yerevan',
  'گرجستان': 'georgia',
  'تفلیس': 'tbilisi',
  'باتومی': 'batumi',
  'پاریس': 'paris',
  'رم': 'rome',
  'مشهد': 'mashhad',
  'مشهد مقدس': 'mashhad',
  'کیش': 'kish',
  'آسیا': 'asia',
  'اروپا': 'europe',
  'اروپایی': 'europe',
  'خاورمیانه': 'middle-east',
  // پرتکرارهای بیرون از دیتابیس فعلی (آژانسی)
  'عربستان': 'saudi',
  'عربستان سعودی': 'saudi',
  'قطر': 'qatar',
  'دوحه': 'doha',
  'عمان': 'oman',
  'مسقط': 'muscat',
  'آذربایجان': 'azerbaijan',
  'باکو': 'baku',
  'عراق': 'iraq',
  'کربلا': 'karbala',
  'نجف': 'najaf',
  'هند': 'india',
  'دهلی': 'delhi',
  'ویتنام': 'vietnam',
  'هوشی مینه': 'ho-chi-minh',
  'اندونزی': 'indonesia',
  'بالی': 'bali',
  'سریلانکا': 'sri-lanka',
  'یونان': 'greece',
  'آتن': 'athens',
  'اسپانیا': 'spain',
  'مادرید': 'madrid',
  'بارسلونا': 'barcelona',
  'ایتالیا': 'italy',
  'میلان': 'milan',
  'ونیز': 'venice',
  'فرانسه': 'france',
  'آلمان': 'germany',
  'برلین': 'berlin',
  'انگلیس': 'england',
  'لندن': 'london',
  'هلند': 'netherlands',
  'آمستردام': 'amsterdam',
  'اتریش': 'austria',
  'وین': 'vienna',
  'سوئیس': 'switzerland',
  'جمهوری چک': 'czech',
  'پراگ': 'prague',
  'مجارستان': 'hungary',
  'بوداپست': 'budapest',
  'صربستان': 'serbia',
  'بلگراد': 'belgrade',
  'قبرس': 'cyprus',
  'مصر': 'egypt',
  'قاهره': 'cairo',
  'مراکش': 'morocco',
  'ژاپن': 'japan',
  'توکیو': 'tokyo',
  'کره': 'korea',
  'کره جنوبی': 'korea',
  'سئول': 'seoul',
  'سنگاپور': 'singapore',
  'هنگ کنگ': 'hong-kong',
  'تایوان': 'taiwan',
  'فیلیپین': 'philippines',
  'نپال': 'nepal',
  'کاتماندو': 'kathmandu',
  'ازبکستان': 'uzbekistan',
  'سمرقند': 'samarkand',
  'بخارا': 'bukhara',
  'آمریکا': 'usa',
  'کانادا': 'canada',
  'استرالیا': 'australia',
};

/** واژه‌های غیرمکانی که ترجمهٔ مشخص دارند. */
const WORDS: Record<string, string> = {
  'نمایشگاهی': 'exhibition',
  'نمایشگاه': 'exhibition',
  'فیر': 'fair',
  'زیارتی': 'pilgrim',
  'ساحلی': 'beach',
  'جزیره': 'island',
  'حرم': 'shrine',
  'نوروز': 'nowruz',
  'نوروزی': 'nowruz',
  // ماه شمسی ← مخفف میلادی (قرارداد دستی تیم: «ویژه شهریور» ← sep)
  'فروردین': 'apr',
  'اردیبهشت': 'may',
  'خرداد': 'jun',
  'تیر': 'jul',
  'مرداد': 'aug',
  'شهریور': 'sep',
  'مهر': 'oct',
  'آبان': 'nov',
  'آذر': 'dec',
  'دی': 'jan',
  'بهمن': 'feb',
  'اسفند': 'mar',
};

/** کلمات زائد: در نامک جایی ندارند. */
const STOP = new Set(
  [
    'تور', 'تورها', 'تورهای',
    'ویژه', 'لوکس', 'خاص', 'طلایی', 'رویایی', 'استثنایی',
    'ترکیب', 'ترکیبی', 'ترکیبات',
    'از', 'به', 'با', 'و', 'در', 'برای', 'تا', 'یا', 'که', 'را',
    'این', 'آن', 'هم', 'روی', 'سر', 'بین',
    'پرواز', 'پروازی', 'هتل', 'هتلها', 'هتلهای', 'اقامت', 'صبحانه',
    'ترانسفر', 'بیمه', 'ویزا', 'خدمات', 'سرویس',
    'قطار', 'هوایی', 'زمینی', 'دریایی', 'سریعالسیر', 'مستقیم',
    'نزدیک', 'مقدس',
  ].map(normFaWord),
);

// نگاشت‌های نرمال‌شده برای جست‌وجوی حریصانه
const PLACES_N: Record<string, string> = {};
for (const [k, v] of Object.entries(PLACES)) PLACES_N[keyOf(k)] = v;
const WORDS_N: Record<string, string> = {};
for (const [k, v] of Object.entries(WORDS)) WORDS_N[keyOf(k)] = v;
const STOP_N = new Set([...STOP].map(keyOf));

/** آوانویسی — فقط آخرین راه برای واژهٔ ناشناخته. */

const TR_MAP: Record<string, string> = {  'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
  'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
  'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'و': 'o', 'ه': 'h', 'ی': 'i',
};

function transliterate(word: string): string {
  return normFaWord(word)
    .split('')
    .map((ch) => TR_MAP[ch] ?? '')
    .join('');
}

/**
 * از عنوان فارسی، نامک انگلیسی کوتاه می‌سازد.
 * «تور مالزی کوالالامپور» ← «malaysia-kl»
 */
export function faToSlugFa(text: string): string {
  const cleaned = latinDigits(text).replace(/[-_–—/\\|،,؛;:!؟?'"«»()[\]{}+=*~^$#@&]/g, ' ');
  // رقمِ چسبیده به واژه را جدا می‌کند («۸روزه» ← «۸» + «روزه») تا
  // قاعده‌های عدد (8d، حذف «۵ ستاره») روی ورودی بی‌فاصله هم کار کنند.
  const tokens = cleaned
    .split(/\s+/)
    .flatMap((t) => t.split(/(\d+)/).filter(Boolean))
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return '';

  const parts: Array<{ en: string; dest: boolean }> = [];
  let daySuffix = '';

  let i = 0;
  while (i < tokens.length) {
    // تطبیق حریصانه: اول ترکیب ۳کلمه‌ای، بعد ۲کلمه‌ای، بعد تک‌کلمه
    let matched = false;
    for (let len = 3; len >= 1 && !matched; len--) {
      if (i + len > tokens.length) continue;
      const phrase = tokens.slice(i, i + len).join(' ');
      const key = keyOf(phrase);
      const place = PLACES_N[key];
      if (place) {
        parts.push({ en: place, dest: true });
        i += len;
        matched = true;
        break;
      }
      const word = WORDS_N[key];
      if (word && len <= 2) {
        parts.push({ en: word, dest: false });
        i += len;
        matched = true;
        break;
      }
      if (STOP_N.has(key)) {
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const tok = tokens[i];
    const norm = normFaWord(tok);

    // «۸ روزه» / «۷ شب» ← پسوند آخر نامک: 8d / 7n
    if (norm === 'روزه' || norm === 'روز' || norm === 'شب' || norm === 'شبه') {
      const prev = parts.length > 0 ? parts[parts.length - 1] : null;
      if (prev && /^\d+$/.test(prev.en)) {
        daySuffix = `${prev.en}${norm === 'روزه' || norm === 'روز' ? 'd' : 'n'}`;
        parts.pop();
      }
      i++;
      continue;
    }
    // «۵ ستاره» ← هر دو حذف
    if (norm === 'ستاره') {
      const prev = parts.length > 0 ? parts[parts.length - 1] : null;
      if (prev && /^\d+$/.test(prev.en)) parts.pop();
      i++;
      continue;
    }
    if (/^\d+$/.test(tok)) {
      parts.push({ en: tok, dest: false });
      i++;
      continue;
    }
    if (/^[a-zA-Z0-9]+$/.test(tok)) {
      parts.push({ en: tok.toLowerCase(), dest: false });
      i++;
      continue;
    }
    const tr = transliterate(tok);
    if (tr) parts.push({ en: tr, dest: false });
    i++;
  }

  // تکراری‌های پشت سر هم حذف؛ اگر طولانی شد اول کلمات غیرمکانی وسط می‌روند.
  const deduped: typeof parts = [];
  for (const p of parts) {
    if (deduped.length === 0 || deduped[deduped.length - 1].en !== p.en) deduped.push(p);
  }
  let final = deduped;
  if (final.length > 5) {
    const dests = final.filter((p) => p.dest);
    const others = final.filter((p) => !p.dest);
    final = [...dests, ...others].slice(0, 5);
  }
  if (daySuffix) final.push({ en: daySuffix, dest: false });

  return final
    .map((p) => p.en)
    .join('-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export const DEFAULT_SERVICES: Record<string, string[]> = {
  foreign: ['بلیت رفت و برگشت پرواز', 'اقامت در هتل با صبحانه', 'ترانسفر فرودگاهی رفت و برگشت', 'بیمه مسافرتی'],
  domestic: ['بلیط رفت و برگشت', 'اقامت در هتل', 'ترانسفر فرودگاهی', 'بیمه مسافرتی'],
  exhibition: ['بلیت رفت و برگشت پرواز', 'ویزای تجاری', 'اقامت در هتل با صبحانه', 'ترانسفر روزانه نمایشگاه', 'بیمه مسافرتی'],
};

/**
 * وضعیت ظرفیت تور (ستون status) — ربطی به انتشار ندارد؛ انتشار از دکمه‌های
 * «ثبت پیش‌نویس» / «انتشار» پایین فرم انجام می‌شود (شرایط انتشار، مایگریشن 0011).
 * منبع واحد گزینه‌ها: فیلتر جدول تورها و سلکت بنر مرحلهٔ ۱ هم از همین می‌خوانند (X7).
 */
export const CAPACITY_OPTIONS = [
  { value: 'pending', label: 'در انتظار تأیید ظرفیت' },
  { value: 'confirmed', label: 'تأیید شده' },
  { value: 'full', label: 'تکمیل ظرفیت' },
  { value: 'updating', label: 'در حال به‌روزرسانی' },
];

export const TITLE_MAX = 70;
export const DESC_MIN = 150;

export interface TourDraftErrors {
  title?: string;
  slug?: string;
  price?: string;
  destinations?: string;
  origin?: string;
  image?: string;
}

export function validateDraft(input: {
  title: string;
  slug: string;
  price: number | null;
  destinations: number;
  origin: string;
}): TourDraftErrors {
  const errors: TourDraftErrors = {};
  if (input.title.trim().length < 2) errors.title = 'عنوان تور حداقل ۲ نویسه است.';
  else if (input.title.trim().length > TITLE_MAX) errors.title = `عنوان حداکثر ${TITLE_MAX} نویسه باشد.`;
  if (!input.slug.trim()) errors.slug = 'آدرس اینترنتی لازم است.';
  else if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(input.slug.trim())) errors.slug = 'آدرس اینترنتی فقط حروف کوچک انگلیسی، عدد، خط تیره و آندرلاین می‌پذیرد.';
  if (input.price === null || input.price <= 0) errors.price = 'قیمت پایه معتبر وارد کنید.';
  if (input.destinations === 0) errors.destinations = 'حداقل یک مقصد انتخاب کنید.';
  if (!input.origin) errors.origin = 'مبدأ حرکت را انتخاب کنید.';
  return errors;
}

/**
 * تیک‌های مرحله‌های ویزارد از این‌جا حذف شد (موج ۱، قلم ۲): تیک هر مرحله حالا
 * از همان چک‌های گیت انتشار می‌آید — `stageTicksFromGate(checkPublishReadiness(...))`
 * در publish-gate.ts. دلیل: یک منبع حقیقت؛ قلم «ایستگاه پایانی» هم همان گیت را
 * استفاده می‌کند.
 */
