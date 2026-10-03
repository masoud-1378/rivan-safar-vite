/**
 * ⚠ فایل تولیدشده — دستی ویرایش نکنید.
 * سازنده: node scripts/generate-site-routes.mjs
 * منبع حقیقت: ساختار پوشهٔ app/ (روت‌های نکست).
 *
 * با هر روت تازه: npm run routes:gen و کامیت.
 * بررسی drift: npm run routes:check
 *
 * مصرف‌کننده: src/lib/landing-path.ts (تشخیص تصادم آدرس لندینگ با روت‌های سایت).
 * catch-all لندینگ‌ها ([...landingPath]) عمداً در این فهرست نیست؛ چون خودش
 * مقصد لندینگ‌هاست، نه رقیب آن‌ها.
 */

/** روت‌های استاتیک سایت — آدرس نرمال‌شده (اسلش اول، بدون اسلش پایانی). */
export const SITE_STATIC_ROUTES: readonly string[] = [
  '/',
  '/about',
  '/admin',
  '/admin/archive',
  '/admin/audit',
  '/admin/catalog',
  '/admin/destinations',
  '/admin/exhibitions',
  '/admin/guides',
  '/admin/hotels',
  '/admin/leads',
  '/admin/login',
  '/admin/origins',
  '/admin/places',
  '/admin/seo',
  '/admin/settings',
  '/admin/tours',
  '/admin/tours/leads',
  '/admin/tours/new',
  '/admin/users',
  '/contact',
  '/destinations',
  '/exhibitions',
  '/guides',
  '/licenses',
  '/privacy',
  '/robots.txt',
  '/sitemap.xml',
  '/terms',
  '/tours',
  '/tours/domestic',
  '/tours/foreign',
];

/**
 * الگوهای داینامیک: هر الگو آرایه‌ای از سگمنت‌هاست؛ سگمنت ':name' یعنی هر مقداری.
 * مثلاً ['tour', ':slug'] یعنی /tour/‎<هر چیزی>‎ که صفحهٔ جزئیات تور را باز می‌کند.
 */
export const SITE_DYNAMIC_PATTERNS: readonly (readonly string[])[] = [
  ['admin', 'tours', ':id'],
  ['destination', ':country'],
  ['destination', ':country', ':city'],
  ['exhibition', ':series'],
  ['exhibition', ':series', ':edition'],
  ['guide', ':slug'],
  ['tour', ':slug'],
  ['visa', ':country'],
];
