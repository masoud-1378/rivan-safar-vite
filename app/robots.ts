import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';

/**
 * تا عبور از Launch Gate ایندکس عمومی بسته می‌ماند.
 * باز کردن: شرط زیر را بردارید و رجیستری seoLandings را Published کنید.
 */
const LAUNCH_GATE_OPEN = process.env.SEO_INDEXING_ENABLED === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!LAUNCH_GATE_OPEN) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
