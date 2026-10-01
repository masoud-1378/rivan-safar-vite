'use client';

const FA_MAP: Record<string, string> = {
  آ: 'a', ا: 'a', ب: 'b', پ: 'p', ت: 't', ث: 's', ج: 'j', چ: 'ch',
  ح: 'h', خ: 'kh', د: 'd', ذ: 'z', ر: 'r', ز: 'z', ژ: 'zh',
  س: 's', ش: 'sh', ص: 's', ض: 'z', ط: 't', ظ: 'z', ع: 'a',
  غ: 'gh', ف: 'f', ق: 'gh', ک: 'k', گ: 'g', ل: 'l', م: 'm',
  ن: 'n', و: 'v', ه: 'h', ی: 'y', ي: 'y', ك: 'k',
  ء: '', ئ: '', ؤ: '', أ: 'a', إ: 'e',
};

export function faToSlugFa(text: string): string {
  return text
    .split('')
    .map((ch) => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      if (FA_MAP[ch] !== undefined) return FA_MAP[ch];
      if (/\s/.test(ch)) return '-';
      return '-';
    })
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export const DEFAULT_SERVICES: Record<string, string[]> = {
  foreign: ['بلیت رفت و برگشت پرواز', 'اقامت در هتل با صبحانه', 'ترانسفر فرودگاهی رفت و برگشت', 'بیمه مسافرتی'],
  domestic: ['بلیط رفت و برگشت', 'اقامت در هتل', 'ترانسفر فرودگاهی', 'بیمه مسافرتی'],
  exhibition: ['بلیت رفت و برگشت پرواز', 'ویزای تجاری', 'اقامت در هتل با صبحانه', 'ترانسفر روزانه نمایشگاه', 'بیمه مسافرتی'],
};

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
  if (!input.slug.trim()) errors.slug = 'نامک لازم است.';
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) errors.slug = 'نامک فقط حروف کوچک انگلیسی، عدد و خط تیره.';
  if (input.price === null || input.price <= 0) errors.price = 'قیمت پایه معتبر وارد کنید.';
  if (input.destinations === 0) errors.destinations = 'حداقل یک مقصد انتخاب کنید.';
  if (!input.origin) errors.origin = 'مبدأ حرکت را انتخاب کنید.';
  return errors;
}

/**
 * وضعیت تکمیل واقعی هر ۵ مرحلهٔ ویزارد تورساز — برای تیک‌های هدر مرحله‌ها.
 * قاعده: تیک هر مرحله فقط وقتی می‌خورد که فیلدهای الزامی همان مرحله پر شده باشند،
 * نه صرفاً با عبور از آن مرحله.
 * - مرحله ۱: همان validateDraft (عنوان، آدرس اینترنتی، قیمت، دست‌کم یک مقصد، مبدأ)
 * - مرحله ۲: دست‌کم یک هتل با نام و قیمت دوتخته یا نفری
 * - مرحله ۳: دست‌کم یک روز برنامه با عنوان
 * - مرحله ۴: دست‌کم یکی از میدان‌های اعتماد (مدارک، ضمانت‌نامه، مالیات شهری، انعام) پر شده باشد
 * - مرحله ۵: نام کارشناس تور ثبت شده باشد
 */
export function getStageCompletion(input: {
  title: string;
  slug: string;
  price: number | null;
  destinations: number;
  origin: string;
  hotelOptions: Array<{ name?: string; priceDouble?: string; pricePerPerson?: string }>;
  itineraryDays: Array<{ title?: string }>;
  trustSpecs?: { requiredDocs?: string[]; returnGuarantee?: string; cityTax?: string; tipsNote?: string } | null;
  consultantSpec?: { name?: string } | null;
}): [boolean, boolean, boolean, boolean, boolean] {
  const s1 =
    Object.keys(
      validateDraft({
        title: input.title,
        slug: input.slug,
        price: input.price,
        destinations: input.destinations,
        origin: input.origin,
      })
    ).length === 0;
  const s2 = input.hotelOptions.some(
    (h) => (h.name || '').trim() && ((h.priceDouble || '').trim() || (h.pricePerPerson || '').trim())
  );
  const s3 = input.itineraryDays.some((d) => (d.title || '').trim());
  const t = input.trustSpecs || {};
  const s4 =
    (t.requiredDocs?.length || 0) > 0 ||
    !!(t.returnGuarantee || '').trim() ||
    !!(t.cityTax || '').trim() ||
    !!(t.tipsNote || '').trim();
  const s5 = !!(input.consultantSpec?.name || '').trim();
  return [s1, s2, s3, s4, s5];
}
