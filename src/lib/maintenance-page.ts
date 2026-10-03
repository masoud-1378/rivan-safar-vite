import type { MaintenanceState } from './maintenance';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * صفحهٔ تعمیرات — HTML خودکفا با استایل درون‌خطی.
 * چرا خودکفا؟ این صفحه مستقیم از middleware با استاتوس ۵۰۳ برگردانده می‌شود،
 * پس نمی‌تواند به باندل نکست، CSS سراسری یا کامپوننت‌های ری‌اکت تکیه کند.
 * فونت‌ها و لوگو از مسیرهای استاتیکی خوانده می‌شوند که middleware از
 * دروازهٔ تعمیرات مستثنا کرده است (/fonts/* و /images/*).
 */
export function renderMaintenancePage(state: MaintenanceState): string {
  const brand = escapeHtml(state.brand || 'ریوان سفر');
  const message = escapeHtml(state.message);
  const phoneDisplay = escapeHtml(state.phoneDisplay);
  const phoneHref = escapeHtml(state.phoneHref);

  const contact = phoneDisplay && phoneHref
    ? `<div class="contact"><span>کار فوری دارید؟ با ما تماس بگیرید:</span> <a href="${phoneHref}">${phoneDisplay}</a></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>به‌زودی برمی‌گردیم | ${brand}</title>
<link rel="icon" href="/images/favicon-64.png">
<style>
@font-face{font-family:'Pinar FD';src:url('/fonts/pinar/Pinar-FD-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'Vazirmatn';src:url('/fonts/vazirmatn/Vazirmatn-Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Vazirmatn';src:url('/fonts/vazirmatn/Vazirmatn-Medium.woff2') format('woff2');font-weight:500;font-display:swap}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAF7F2;color:#172027;font-family:'Vazirmatn',Tahoma,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
.card{background:#fff;border:1px solid #E2E6E8;border-radius:16px;max-width:520px;width:100%;padding:48px 40px;text-align:center;box-shadow:0 8px 30px rgba(16,42,58,.06)}
.icon{width:72px;height:72px;border-radius:50%;background:#FFF0E6;color:#FF6600;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.caption{font-size:13px;font-weight:500;color:#8A989F;margin-bottom:8px}
h1{font-family:'Pinar FD',Tahoma,sans-serif;font-weight:700;font-size:26px;color:#102A3A;margin-bottom:12px;line-height:1.6}
.message{font-size:15px;color:#66727A;line-height:2;margin-bottom:8px}
.thanks{font-size:15px;color:#66727A;line-height:2;margin-bottom:24px}
.divider{border:0;border-top:1px solid #EDF0F1;margin-bottom:20px}
.contact{font-size:13px;color:#66727A;line-height:2}
.contact a{font-weight:700;color:#102A3A;text-decoration:none}
.contact a:hover{text-decoration:underline}
.logo{margin-top:28px;opacity:.85}
.logo img{height:40px;width:auto}
@media (max-width:480px){.card{padding:36px 24px}h1{font-size:22px}}
</style>
</head>
<body>
<main class="card">
<div class="icon" aria-hidden="true">
<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
</div>
<div class="caption">به‌روزرسانی سایت</div>
<h1>داریم سایت را بهتر می‌کنیم</h1>
<p class="message">${message}</p>
<p class="thanks">ممنون از صبوری‌تان.</p>
<hr class="divider">
${contact}
<div class="logo"><img src="/images/logo-rivan-safar.png" alt="${brand}"></div>
</main>
</body>
</html>`;
}
