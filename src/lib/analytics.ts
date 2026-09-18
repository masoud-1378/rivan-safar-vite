'use client';

/**
 * آنالیتیکس حریم‌محور — سند ۰۱ §۷ (Impression → تماس/Lead).
 * - بدون GA_ID هیچ اسکریپتی لود و هیچ رویدادی ارسال نمی‌شود.
 * - هرگز PII (نام/تلفن) ارسال نمی‌شود؛ فقط context صفحه.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function gaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID || undefined;
}

function send(event: string, params: Record<string, string>) {
  if (typeof window === 'undefined') return;
  if (!gaId() || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

export function trackPhoneClick(page: string) {
  send('phone_click', { page });
}

export function trackLeadSubmit(page: string, stored: boolean) {
  send('lead_submit', { page, stored: stored ? 'db' : 'fallback' });
}

/**
 * شنونده سراسری کلیک تلفن — همه لینک‌های tel: را بدون تغییر کامپوننت‌ها پوشش می‌دهد.
 * در ClientChrome یک‌بار نصب می‌شود.
 */
export function installPhoneClickTracker() {
  if (typeof document === 'undefined') return () => {};
  const handler = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]');
    if (!el) return;
    trackPhoneClick(window.location.pathname);
  };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}
