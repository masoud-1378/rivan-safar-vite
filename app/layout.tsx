import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/src/lib/siteConfig';
import { organizationJsonLd } from './seo-helpers';
import ClientChrome from './ClientChrome';
import { getGaId } from '@/src/lib/site-contact';
import '../src/index.css';
import { pinar, vazirmatn } from "./fonts";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف · ریوان سفر',
    template: '%s',
  },
  description:
    'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید و برای تأیید مسیر و ظرفیت با کارشناس در تماس باشید.',
  // تا عبور از Launch Gate ایندکس عمومی بسته است
  robots: 'noindex,nofollow',
  icons: {
    icon: '/images/favicon-64.png',
    apple: '/images/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'ریوان سفر',
    locale: 'fa_IR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // cover تا نوارهای fixed واقعاً به لبهٔ فیزیکی صفحه برسند (نه لبهٔ safe-area)؛
  // فاصلهٔ امن با pb-safe/pt-safe به‌صورت پدینگ داخل نوارها جبران می‌شود.
  viewportFit: 'cover',
  themeColor: '#102A3A',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = await getGaId();
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
        <ClientChrome>{children}</ClientChrome>
      </body>
    </html>
  );
}
