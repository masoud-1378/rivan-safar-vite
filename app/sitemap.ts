import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { getIndexableLandings } from '@/src/data/seoLandings';

/**
 * نقشه سایت داینامیک — فقط لندینگ‌های published/index + صفحات اعتماد.
 * با اتصال DB، این فهرست از جدول seo_landings خوانده می‌شود.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '/',
    '/tours',
    '/tours/foreign',
    '/tours/domestic',
    '/destinations',
    '/about',
    '/contact',
    '/guides',
    '/exhibitions',
  ];
  const landingPaths = getIndexableLandings().map((l) => l.urlPath);
  const paths = Array.from(new Set([...staticPaths, ...landingPaths]));

  return paths.map((p) => ({
    url: p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : p.split('/').length <= 2 ? 0.8 : 0.6,
  }));
}
