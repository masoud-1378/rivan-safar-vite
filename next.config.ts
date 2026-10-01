import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // تصاویر فعلاً همان <img> و Unsplash هستند؛ با مهاجرت به کتابخانه رسمی، remotePatterns فعال می‌شود.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // SEC-05: هدرهای امنیتی گمشده. CSP عمداً حداقلی است (فقط
          // frame-ancestors) تا اسکریپت‌های inline خود Next.js نشکند؛
          // X-Frame-Options: DENY جلوی کلیک‌جکینگ صفحهٔ ورود ادمین را می‌گیرد.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
