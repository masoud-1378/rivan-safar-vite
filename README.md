# ریوان سفر — وب‌سایت آژانس مسافرتی (Next.js)

وب‌سایت فارسی و راست‌چین ریوان سفر: تورهای داخلی، خارجی و نمایشگاهی با مسیر
شفاف، راهنمای سفر و درخواست تماس با کارشناس.

## اجرا

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # بیلد production
npm run start    # اجرای production
```

## متغیرهای محیطی (`.env.example` را ببینید)

| متغیر | کاربرد |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | دامنه canonical سئو (پیش‌فرض `https://rivansafar.ir`) |
| `NEXT_PUBLIC_GA_ID` | شناسه GA4 (اختیاری؛ بدون آن هیچ رویدادی ارسال نمی‌شود) |
| `DATABASE_URL` | اتصال PostgreSQL واقعی — فقط Secret Store، هرگز در گیت |

## سئو و کیفیت

```bash
npm run seo:check   # گیت کیفیت: واژه ممنوعه، لینک شکسته، queryOwner یکتا، Sitemap
```

- رجیستری لندینگ‌ها: `src/data/seoLandings.ts` (آینه جدول `seo_landings` در DB)
- متای هر صفحه فقط از `app/seo-helpers.ts` می‌آید — Title/Meta دستی در کامپوننت ننویسید
- Sitemap داینامیک: `app/sitemap.ts` (فقط `published/index`)
- ایندکس عمومی تا عبور از Launch Gate بسته است (`SEO_INDEXING_ENABLED=true` برای باز کردن)

## دیتابیس

```bash
npm run db:migrate   # اجرای Migration روی PostgreSQL واقعی (نیازمند DATABASE_URL)
```

اسکیما: `db/schema.ts` — سند `05_DATABASE_STRATEGY` (جدایی Product/Departure/Route/Offer).

## ساختار

- `app/` — روت‌های Next.js (layout، صفحات، sitemap/robots، Server Action در `app/actions/lead.ts`)
- `src/components/` — کامپوننت‌های UI (همه لینک‌ها `<a href>` واقعی برای خزنده‌ها)
- `src/data/` — داده مرجع و رجیستری‌ها
- `db/` — اسکیما، Migration و Seed مرجع
- `scripts/legacy-css-fixers/` — بایگانی اسکریپت‌های دوران Vite
