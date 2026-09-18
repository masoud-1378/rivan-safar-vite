import type { Metadata } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { resolveRoute, type BreadcrumbItem } from '@/src/data/siteRegistry';
import { findLandingByPath } from '@/src/data/seoLandings';
import { SAMPLE_TOURS } from '@/src/data/toursData';
import { COUNTRIES, CITIES } from '@/src/data/destinationsData';
import { GUIDES } from '@/src/data/guidesData';
import { EXHIBITION_SERIES } from '@/src/data/exhibitionsData';

export interface ResolvedSeo {
  title: string;
  description: string;
  canonicalPath: string;
  robots: 'index,follow' | 'noindex,nofollow';
  breadcrumbs: BreadcrumbItem[];
}

/** نسخه سروری buildPageSeo — تنها مرجع Title/Description/Canonical همه صفحات */
export function resolveSeo(path: string): ResolvedSeo {
  const route = resolveRoute(path);
  const landing = findLandingByPath(route.canonicalPath);
  let title = landing?.titleFa ?? route.title;
  let description = landing?.metaDescriptionFa ?? route.description;
  let robots = landing
    ? ((landing.indexStatus === 'index'
        ? 'index,follow'
        : 'noindex,nofollow') as ResolvedSeo['robots'])
    : route.robots;
  const breadcrumbs = [...route.breadcrumbs];

  if (route.type === 'tour_detail') {
    const tour = SAMPLE_TOURS.find((t) => t.id === route.params.tourSlug);
    if (tour) {
      title = `${tour.title}؛ تاریخ، قیمت و شرایط | ریوان سفر`;
      description = `${tour.title} با حرکت از ${tour.origin}، مدت ${tour.duration} و ایرلاین ${tour.airline}. قیمت پایه و ظرفیت هر حرکت پیش از اقدام تأیید می‌شود.`;
      breadcrumbs[breadcrumbs.length - 1] = { name: tour.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'country') {
    const country = COUNTRIES[route.params.countrySlug];
    if (country) {
      title = `تور ${country.name}؛ تاریخ‌ها، قیمت و شرایط سفر | ریوان سفر`;
      description = `${country.description.slice(0, 140)}…`;
      breadcrumbs[breadcrumbs.length - 1] = { name: `تور ${country.name}` };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'destination_city') {
    const city = CITIES[route.params.placeSlug];
    if (city) {
      title = `تور ${city.name}؛ تاریخ‌ها، قیمت و شرایط سفر | ریوان سفر`;
      description = `${city.description.slice(0, 140)}…`;
      breadcrumbs[breadcrumbs.length - 1] = { name: `تور ${city.name}` };
      const country =
        COUNTRIES[route.params.countrySlug] ??
        (city.parentCountrySlug ? COUNTRIES[city.parentCountrySlug] : undefined);
      if (country && breadcrumbs.length >= 3) {
        breadcrumbs[breadcrumbs.length - 2] = {
          name: `تور ${country.name}`,
          url: `/destination/${country.slug}`,
        };
      }
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'guide_detail') {
    const guide = GUIDES[route.params.guideSlug];
    if (guide) {
      title = `${guide.title} | ریوان سفر`;
      description = guide.summary;
      breadcrumbs[breadcrumbs.length - 1] = { name: guide.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'exhibition_detail') {
    const series = EXHIBITION_SERIES[route.params.eventSeriesSlug];
    if (series) {
      title = `${series.title} | ریوان سفر`;
      description = `${series.heroTagline}. تاریخ: ${series.upcomingEdition.solarDate}.`;
      breadcrumbs[breadcrumbs.length - 1] = { name: series.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'visa_country') {
    const country = COUNTRIES[route.params.countrySlug];
    if (country) {
      title = `ویزای ${country.name}؛ مدارک و مراحل برای ایرانیان | ریوان سفر`;
      description = `مدارک و مراحل ویزای ${country.name} برای ایرانیان با منبع رسمی و تاریخ بازبینی.`;
      breadcrumbs[breadcrumbs.length - 1] = { name: `ویزای ${country.name}` };
    }
  }

  return { title, description, canonicalPath: route.canonicalPath, robots, breadcrumbs };
}

export function toMetadata(seo: ResolvedSeo): Metadata {
  const canonical =
    seo.canonicalPath === '/'
      ? SITE_URL
      : `${SITE_URL}${seo.canonicalPath}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    robots: seo.robots,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: 'ریوان سفر',
      locale: 'fa_IR',
      type: 'website',
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url
        ? { item: item.url === '/' ? SITE_URL : `${SITE_URL}${item.url}` }
        : {}),
    })),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'ریوان سفر',
    url: SITE_URL,
    telephone: '+98-26-33350139',
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷',
      addressLocality: 'کرج',
      addressCountry: 'IR',
    },
  };
}

/**
 * Schema صفحه تور — فقط از داده نمایش‌داده‌شده به کاربر ساخته می‌شود (سند ۱۰ §۱۲.۸).
 * قیمت به‌صورت PriceSpecification بدون ادعای قطعی؛ PriceType حذف چون استعلام‌محوریم.
 */
export function tourJsonLd(tourId: string) {
  const tour = SAMPLE_TOURS.find((t) => t.id === tourId);
  if (!tour) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.title,
    description: tour.description,
    image: tour.image,
    brand: { '@type': 'Brand', name: 'ریوان سفر' },
    category: 'Package Tour',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/tour/${tour.id}`,
      priceCurrency: 'IRR',
      price: tour.price * 10, // تومان → ریال
      availability:
        tour.status === 'full'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      priceValidUntil: undefined,
      seller: { '@type': 'Organization', name: 'ریوان سفر' },
    },
  };
}

/** Schema فهرست — ItemList برای صفحات لیستینگ (سند ۰۱: داده متناسب با صفحه) */
export function itemListJsonLd(
  path: string,
  items: Array<{ name: string; url: string }>,
) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: `${SITE_URL}${path}`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function metadataFor(path: string): Metadata {
  return toMetadata(resolveSeo(path));
}
