import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { organizationJsonLd } from './seo-helpers';
import ClientChrome from './ClientChrome';
import { getGaId, getSiteMeta } from '@/src/lib/site-contact';
import { getNavLinks } from '@/src/lib/db-content';
import '../src/index.css';
import '@/components/ui/rich-editor/rich-editor.css';
import { pinar, vazirmatn } from "./fonts";


/** ایراد ۲۸: عنوان/توضیح پیش‌فرض و دامنهٔ اصلی از تنظیمات پنل می‌آیند. */
export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta();
  return {
    metadataBase: new URL(meta.siteUrl),
    title: {
      default: meta.defaultTitle,
      template: '%s',
    },
    description: meta.defaultDescription,
    // تا عبور از Launch Gate ایندکس عمومی بسته است
    robots: 'noindex,nofollow',
    icons: {
      icon: '/images/favicon-64.png',
      apple: '/images/apple-touch-icon.png',
    },
    openGraph: {
      siteName: meta.brand,
      locale: 'fa_IR',
      type: 'website',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102A3A',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ایراد ۱۹/۲۳: لینک‌های منو و فوتر از دیتابیس می‌آیند (فقط مقصدهای دارای
  // تور فعال + نمایشگاه‌های منتشرشده)؛ دادهٔ خالی → هاردکد؛ قطعی DB → دیتای استاتیک پشتیبان.
  const [GA_ID, navLinks] = await Promise.all([getGaId(), getNavLinks()]);
  return (
    <html lang="fa" dir="rtl" className={`${pinar.variable} ${vazirmatn.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        {GA_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="font-sans">
        <ClientChrome navLinks={navLinks}>{children}</ClientChrome>
      </body>
    </html>
  );
}
