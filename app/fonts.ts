import localFont from "next/font/local";

/**
 * پینار FD (استاتیک) — فقط عنوان‌ها.
 * نسخهٔ FD ارقام لاتین ورودی را خودش فارسی رندر می‌کند؛ در تیترها تبدیل رشته‌ای لازم نیست.
 */
export const pinar = localFont({
  src: [
    { path: "../public/fonts/pinar/Pinar-FD-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/pinar/Pinar-FD-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/pinar/Pinar-FD-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/pinar/Pinar-FD-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/pinar/Pinar-FD-ExtraBold.woff2", weight: "800", style: "normal" },
    // وزن ۹۰۰ (Black) عمداً ثبت نشده: هیچ عنصری با فونت پینار وزن ۹۰۰
    // نمی‌گیرد (font-blackها همه روی فونت بدنه/وزیرمتن‌اند) و مرورگر
    // هیچ‌وقت این فایل ۳۷KB را دانلود نمی‌کرد (میز P-A فاز ۲).
  ],
  variable: "--font-pinar",
  display: "swap",
});

/** وزیرمتن (استاتیک) — متن بدنه. ارقام بدنه در مرز رندر با fa() فارسی می‌شوند. */
export const vazirmatn = localFont({
  src: [
    { path: "../public/fonts/vazirmatn/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/vazirmatn/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/vazirmatn/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/vazirmatn/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});
