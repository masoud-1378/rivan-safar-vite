import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { getIndexableLandings, getDynamicIndexablePaths } from '@/src/data/seoLandings';
import { getTours, getGuides, getExhibitions } from '@/src/lib/db-content';

/**
 * نقشه سایت داینامیک — لندینگ‌های published/index + مسیرهای داینامیک دارای داده واقعی.
 * ردیف ۱-۳: مسیرهای تور/راهنما/نمایشگاهِ منتشرشدهٔ DB هم به خروجی اضافه می‌شوند
 * (نه فقط دیتای استاتیک)؛ getTours/getGuides/getExhibitions خودشان فقط
 * رکوردهای منتشرشده را برمی‌گردانند (گیت انتشار ردیف ۱-۱).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const landingPaths = getIndexableLandings().map((l) => l.urlPath);
  const staticDynamicPaths = getDynamicIndexablePaths();

  // مسیرهای زنده از DB؛ خطا یا قطعی → همان مسیرهای استاتیک می‌ماند.
  const dbPaths: string[] = [];
  try {
    const [tours, guides, exhibitions] = await Promise.all([
      getTours(),
      getGuides(),
      getExhibitions(),
    ]);
    for (const t of tours) dbPaths.push(`/tour/${t.id}`);
    for (const g of Object.values(guides)) dbPaths.push(`/guide/${g.slug}`);
    for (const s of Object.values(exhibitions)) {
      dbPaths.push(`/exhibition/${s.slug}`);
      if (s.upcomingEdition?.editionSlug) {
        dbPaths.push(`/exhibition/${s.slug}/${s.upcomingEdition.editionSlug}`);
      }
    }
  } catch {
    // getTours/getGuides/getExhibitions خودشان fallback استاتیک دارند؛
    // این catch فقط برای اطمینان مضاعف است.
  }

  const paths = Array.from(
    new Set([...landingPaths, ...staticDynamicPaths, ...dbPaths]),
  );

  return paths.map((p) => ({
    url: p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : p.split('/').filter(Boolean).length <= 1 ? 0.8 : 0.6,
  }));
}
