import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';

import { isIndexingEnabled } from '@/src/lib/site-contact';

/**
 * تا عبور از Launch Gate ایندکس عمومی بسته می‌ماند.
 * باز کردن: شرط زیر را بردارید و رجیستری seoLandings را Published کنید.
 */

export default async function robots(): Promise<MetadataRoute.Robots> {
  const LAUNCH_GATE_OPEN = await isIndexingEnabled();
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
