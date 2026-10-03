import type { MetadataRoute } from 'next';

import { isIndexingEnabled, getSiteUrl } from '@/src/lib/site-contact';

/**
 * تا عبور از Launch Gate ایندکس عمومی بسته می‌ماند.
 * باز کردن: شرط زیر را بردارید و رجیستری seoLandings را Published کنید.
 */

export default async function robots(): Promise<MetadataRoute.Robots> {
  const LAUNCH_GATE_OPEN = await isIndexingEnabled();
  // ایراد ۲۸: آدرس نقشهٔ سایت از تنظیم site.url می‌آید.
  const siteUrl = await getSiteUrl();
  if (!LAUNCH_GATE_OPEN) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
