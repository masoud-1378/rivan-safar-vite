/**
 * ابزارهای سئوی تکنیکال — بدون SSR (موقت تا مهاجرت Next.js).
 * این ماژول Title/Meta/Canonical/Robots/JSON-LD را در CSR مدیریت می‌کند.
 */
import { SITE_URL, BUSINESS, canonicalUrl } from './siteConfig';
import type { BreadcrumbItem } from '../data/siteRegistry';

export interface PageSeo {
  title: string;
  description: string;
  canonicalPath: string;
  robots: 'index,follow' | 'noindex,nofollow';
  breadcrumbs: BreadcrumbItem[];
  faqCount?: number;
}

function upsertMeta(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector(selector);
  if (existing) return existing as HTMLElement;
  const el = create();
  document.head.appendChild(el);
  return el;
}

export function applyPageSeo(seo: PageSeo): void {
  if (typeof document === 'undefined') return;
  document.title = seo.title;
  document.documentElement.lang = 'fa';
  document.documentElement.dir = 'rtl';

  const desc = upsertMeta('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  desc.setAttribute('content', seo.description);

  const robots = upsertMeta('meta[name="robots"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'robots');
    return m;
  });
  robots.setAttribute('content', seo.robots);

  const canonical = upsertMeta('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  canonical.setAttribute('href', canonicalUrl(seo.canonicalPath));

  const ogTitle = upsertMeta('meta[property="og:title"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:title');
    return m;
  });
  ogTitle.setAttribute('content', seo.title);

  const ogDesc = upsertMeta('meta[property="og:description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:description');
    return m;
  });
  ogDesc.setAttribute('content', seo.description);

  const ogUrl = upsertMeta('meta[property="og:url"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:url');
    return m;
  });
  ogUrl.setAttribute('content', canonicalUrl(seo.canonicalPath));

  const ogLocale = upsertMeta('meta[property="og:locale"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:locale');
    return m;
  });
  ogLocale.setAttribute('content', 'fa_IR');
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'ریوان سفر',
    url: SITE_URL,
    telephone: '+98-26-33350139',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address,
      addressLocality: 'کرج',
      addressCountry: 'IR',
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> | null {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: canonicalUrl(item.url) } : {}),
    })),
  };
}

export function applyJsonLd(id: string, data: Record<string, unknown> | null): void {
  if (typeof document === 'undefined') return;
  const existing = document.head.querySelector(`script[data-jsonld="${id}"]`);
  if (!data) {
    existing?.remove();
    return;
  }
  const payload = JSON.stringify(data);
  if (existing) {
    existing.textContent = payload;
    return;
  }
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.setAttribute('data-jsonld', id);
  s.textContent = payload;
  document.head.appendChild(s);
}
