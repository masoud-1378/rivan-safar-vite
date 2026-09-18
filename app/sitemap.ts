import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { getIndexableLandings, getDynamicIndexablePaths } from '@/src/data/seoLandings';

/**
 * نقشه سایت داینامیک — فقط لندینگ‌های published/index + مسیرهای داینامیک دارای داده واقعی.
 * با اتصال DB، این فهرست از جدول seo_landings خوانده می‌شود.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const landingPaths = getIndexableLandings().map((l) => l.urlPath);
  const dynamicPaths = getDynamicIndexablePaths();
  const paths = Array.from(new Set([...landingPaths, ...dynamicPaths]));

  return paths.map((p) => ({
    url: p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : p.split('/').filter(Boolean).length <= 1 ? 0.8 : 0.6,
  }));
}
