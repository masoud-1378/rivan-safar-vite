/**
 * تنظیم مرکزی سایت — تنها محل خواندن دامنه اصلی و اطلاعات کسب‌وکار.
 * طبق سند 01_SEO_STRATEGY: دامنه نهایی rivansafar.ir است و انتقال باید امن باشد.
 *
 * اولویت خواندن SITE_URL:
 *  1. متغیر محیطی VITE_SITE_URL (بیلد / ران‌تایم Vite)
 *  2. متغیر APP_URL (محیط AI Studio / Cloud Run)
 *  3. مقدار پیش‌فرض امن https://rivansafar.ir
 */

const viteEnv =
  (typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: Record<string, string | undefined> })
        .env?.VITE_SITE_URL
    : undefined) ||
  (typeof process !== 'undefined'
    ? process.env?.NEXT_PUBLIC_SITE_URL ||
      process.env?.VITE_SITE_URL ||
      process.env?.APP_URL
    : undefined);

const rawSiteUrl = viteEnv || 'https://rivansafar.ir';

function normalise(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const SITE_URL = normalise(rawSiteUrl || 'https://rivansafar.ir');

export const BUSINESS = {
  brandFa: 'ریوان سفر',
  phoneDisplay: '۰۲۶ — ۳۳۳۵۰۱۳۹',
  phoneHref: 'tel:02633350139',
  address:
    'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷',
  email: 'info@rivansafar.com',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۲۱',
} as const;

export function canonicalUrl(path: string): string {
  const clean = path.split('?')[0].split('#')[0] || '/';
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SITE_URL}${withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '') || '/'}`;
}
