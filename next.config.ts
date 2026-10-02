import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Supabase Storage: آپلودر بنر تور (tours/banner-upload.ts) و عکس هتل
      // (hotels/photos.ts) با getPublicUrl از همین هاست لینک می‌سازند:
      // https://<ref>.supabase.co/storage/v1/object/public/...
      // وایلدکارد حساب‌شده: فقط یک ساب‌دامین از supabase.co (نه کل اینترنت)،
      // و pathname هم به فایل‌های عمومیِ استوریج محدود شده تا بهینه‌ساز Next
      // پروکسیِ بازِ مسیرهای دیگر این هاست نشود.
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
