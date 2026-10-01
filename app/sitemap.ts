import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { getIndexableLandings, getDynamicIndexablePaths } from '@/src/data/seoLandings';
import { getTours, getGuides, getExhibitions, getCountries } from '@/src/lib/db-content';

// P1-12: سایت‌مپ باید هر درخواست تازه ساخته شود تا گیت لانچ و آیتم‌های تازه
// بدون دیپلوی در آن اعمال شوند.
export const dynamic = 'force-dynamic';

/**
 * نقشه سایت داینامیک — لندینگ‌های published/index + مسیرهای داینامیک دارای داده واقعی.
 *
 * P1-14: مسیرهای موجودیتی (تور/راهنما/نمایشگاه/ویزا) از DB خوانده می‌شوند؛
 * getTours/getGuides/getExhibitions خودشان فقط رکوردهای منتشرشده را
 * برمی‌گردانند (گیت انتشار ردیف ۱-۱). دیتای استاتیک فقط فالبکِ قطعی کاملِ
 * خواندن DB است (وقتی هیچ‌کدام از گترها پاسخی ندهند) — نه مکمل مسیرهای DB.
 *
 * P1-15: هاب‌ها (/destinations ،/exhibitions ،/guides) و صفحات اعتمادی
 * (/about ،/contact ،/licenses ،/terms ،/privacy) هم در سایت‌مپ هستند.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const landingPaths = getIndexableLandings().map((l) => l.urlPath);

  // P1-15 — هاب‌ها و صفحات اعتمادی (ثابت و همیشه زنده)
  const hubPaths = [
    '/destinations',
    '/exhibitions',
    '/guides',
    '/about',
    '/contact',
    '/licenses',
    '/terms',
    '/privacy',
  ];

  // مسیرهای موجودیتی زنده از DB؛ خطای کاملِ خواندن → فالبک استاتیک.
  let entityPaths: string[] = [];
  try {
    const [tours, guides, exhibitions, countries] = await Promise.all([
      getTours(),
      getGuides(),
      getExhibitions(),
      getCountries(),
    ]);
    for (const t of tours) entityPaths.push(`/tour/${t.id}`);
    for (const g of Object.values(guides)) entityPaths.push(`/guide/${g.slug}`);
    for (const s of Object.values(exhibitions)) {
      entityPaths.push(`/exhibition/${s.slug}`);
      if (s.upcomingEdition?.editionSlug) {
        entityPaths.push(`/exhibition/${s.slug}/${s.upcomingEdition.editionSlug}`);
      }
    }
    // ویزا گیت انتشار ندارد (هم‌خوان با صفحهٔ /visa/[country])؛ فهرست زنده کشورها.
    for (const c of Object.keys(countries)) entityPaths.push(`/visa/${c}`);
  } catch {
    // DB در دسترس نیست → همان مسیرهای استاتیک قبلی می‌ماند.
    entityPaths = getDynamicIndexablePaths();
  }

  const paths = Array.from(
    new Set([...landingPaths, ...hubPaths, ...entityPaths]),
  );

  return paths.map((p) => ({
    url: p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : p.split('/').filter(Boolean).length <= 1 ? 0.8 : 0.6,
  }));
}
