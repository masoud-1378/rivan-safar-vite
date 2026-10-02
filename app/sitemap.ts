import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { getIndexableLandings, getDynamicIndexablePaths } from '@/src/data/seoLandings';
import { getTours, getGuides, getExhibitions, getSeoLandings, normalizeLandingPath } from '@/src/lib/db-content';

/**
 * نقشه سایت داینامیک — لندینگ‌های published/index + مسیرهای داینامیک دارای داده واقعی.
 * ردیف ۱-۳: مسیرهای تور/راهنما/نمایشگاهِ منتشرشدهٔ DB هم به خروجی اضافه می‌شوند
 * (نه فقط دیتای استاتیک)؛ getTours/getGuides/getExhibitions خودشان فقط
 * رکوردهای منتشرشده را برمی‌گردانند (گیت انتشار ردیف ۱-۱).
 * ایراد ۱: لندینگ‌های سئو از جدول seo_landings می‌آیند (منبع حقیقت)؛
 * آرایهٔ استاتیک فقط فالبکِ قطعی DB است.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // مسیرهای استاتیک هم نرمالایز می‌شوند تا /x و /x/ هر دو نیایند.
  const staticLandingPaths = getIndexableLandings().map((l) =>
    normalizeLandingPath(l.urlPath),
  );
  const staticDynamicPaths = getDynamicIndexablePaths().map(normalizeLandingPath);

  // لندینگ‌های زنده از DB (منتشرشده + index)؛ خطا یا قطعی → همان استاتیک می‌ماند.
  const dbLandingPaths: string[] = [];
  try {
    const landings = await getSeoLandings();
    for (const l of landings) {
      if (l.indexStatus === 'index') dbLandingPaths.push(normalizeLandingPath(l.urlPath));
    }
  } catch {
    // getSeoLandings خودش خطا را می‌بلعد و [] برمی‌گرداند؛ این catch اطمینان مضاعف است.
  }

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
    new Set([...staticLandingPaths, ...dbLandingPaths, ...staticDynamicPaths, ...dbPaths]),
  );

  return paths.map((p) => ({
    url: p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : p.split('/').filter(Boolean).length <= 1 ? 0.8 : 0.6,
  }));
}
