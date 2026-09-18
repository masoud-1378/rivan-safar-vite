import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/src/lib/siteConfig';
import { organizationJsonLd } from './seo-helpers';
import ClientChrome from './ClientChrome';
import '../src/index.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ریوان سفر | تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف',
    template: '%s',
  },
  description:
    'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید و برای تأیید مسیر و ظرفیت با کارشناس در تماس باشید.',
  // تا عبور از Launch Gate ایندکس عمومی بسته است
  robots: 'noindex,nofollow',
  openGraph: {
    siteName: 'ریوان سفر',
    locale: 'fa_IR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102A3A',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </head>
      <body>
        <ClientChrome>{children}</ClientChrome>
      </body>
    </html>
  );
}
