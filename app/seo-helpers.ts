import type { Metadata } from 'next';
import { SITE_URL } from '@/src/lib/siteConfig';
import { resolveRoute, type BreadcrumbItem } from '@/src/data/siteRegistry';
import { findLandingByPath } from '@/src/data/seoLandings';
import { SAMPLE_TOURS, type TourItem } from '@/src/data/toursData';
import { COUNTRIES, CITIES } from '@/src/data/destinationsData';
import { GUIDES } from '@/src/data/guidesData';
import { EXHIBITION_SERIES } from '@/src/data/exhibitionsData';
import { getTour, getGuide, getExhibition, getCountries, getCities } from '@/src/lib/db-content';
import { isIndexingEnabled } from '@/src/lib/site-contact';

export interface ResolvedSeo {
  title: string;
  description: string;
  canonicalPath: string;
  robots: 'index,follow' | 'noindex,nofollow';
  breadcrumbs: BreadcrumbItem[];
}

/**
 * P1-22: اتصال اجزای جمله با «،» و «و»؛ فقط فیلدهای پر وارد جمله می‌شوند
 * تا با origin/duration/airline خالی جملهٔ ناقص («با حرکت از ، مدت  و ایرلاین .») ساخته نشود.
 */
function joinFa(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join('، ')} و ${parts[parts.length - 1]}`;
}

function tourMetaDescription(tour: {
  title: string;
  origin: string;
  duration: string;
  airline: string;
}): string {
  const bits: string[] = [];
  const origin = tour.origin.trim();
  const duration = tour.duration.trim();
  const airline = tour.airline.trim();
  if (origin) bits.push(`با حرکت از ${origin}`);
  if (duration) bits.push(`مدت ${duration}`);
  if (airline) bits.push(`ایرلاین ${airline}`);
  const head = bits.length > 0 ? `${tour.title} ${joinFa(bits)}.` : tour.title;
  return `${head} قیمت پایه و ظرفیت هر حرکت پیش از اقدام تأیید می‌شود.`;
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
      title = `${tour.title}؛ تاریخ، قیمت و شرایط · ریوان سفر`;
      description = tourMetaDescription(tour);
      breadcrumbs[breadcrumbs.length - 1] = { name: tour.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'country') {
    const country = COUNTRIES[route.params.countrySlug];
    if (country) {
      title = `تور ${country.name}؛ تاریخ‌ها، قیمت و شرایط سفر · ریوان سفر`;
      description = `${country.description.slice(0, 140)}…`;
      breadcrumbs[breadcrumbs.length - 1] = { name: `تور ${country.name}` };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'destination_city') {
    const city = CITIES[route.params.placeSlug];
    if (city) {
      title = `تور ${city.name}؛ تاریخ‌ها، قیمت و شرایط سفر · ریوان سفر`;
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
      title = `${guide.title} · ریوان سفر`;
      description = guide.summary;
      breadcrumbs[breadcrumbs.length - 1] = { name: guide.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'exhibition_detail') {
    const series = EXHIBITION_SERIES[route.params.eventSeriesSlug];
    if (series) {
      title = `${series.title} · ریوان سفر`;
      const solarStatic = series.upcomingEdition.solarDate?.trim();
      description = solarStatic
        ? `${series.heroTagline}. تاریخ: ${solarStatic}.`
        : series.heroTagline;
      breadcrumbs[breadcrumbs.length - 1] = { name: series.title };
    } else {
      robots = 'noindex,nofollow';
    }
  } else if (route.type === 'visa_country') {
    const country = COUNTRIES[route.params.countrySlug];
    if (country) {
      title = `ویزای ${country.name}؛ مدارک و مراحل برای ایرانیان · ریوان سفر`;
      description = `مدارک و مراحل ویزای ${country.name} برای ایرانیان با منبع رسمی و تاریخ بازبینی.`;
      breadcrumbs[breadcrumbs.length - 1] = { name: `ویزای ${country.name}` };
    } else {
      robots = 'noindex,nofollow';
    }
  }

  return { title, description, canonicalPath: route.canonicalPath, robots, breadcrumbs };
}

/**
 * نسخهٔ زندهٔ resolveSeo (ردیف ۱-۳): برای سه شاخهٔ تور/راهنما/نمایشگاه اول
 * رکورد همان موجودیت را از DB می‌خواند (از همان getTours/getGuides/getExhibitions
 * که صفحه‌ها استفاده می‌کنند) و تایتل/توضیحات را از فیلدهای رکورد می‌سازد؛
 * برای کشور/شهر/ویزا هم از getCountries/getCities زنده lookup گرفته می‌شود
 * تا موجودیت‌های فقط-DB متای اختصاصی بگیرند.
 * اگر در DB نبود، به رجیستری استاتیک (همان resolveSeo) برمی‌گردد.
 *
 * قانون robots: «شناخته‌شده در DB یا استاتیک» — رکورد منتشرشده‌ای که در DB هست
 * دیگر noindex,nofollow نمی‌گیرد، حتی اگر در دیتای استاتیک نباشد.
 * (ریسک ۲ طرح: این رکوردهای تازه از محرومیت ایندکس خارج می‌شوند.)
 */
export async function resolveSeoLive(path: string): Promise<ResolvedSeo> {
  const route = resolveRoute(path);
  const fallback = resolveSeo(path);
  const withCrumb = (name: string): BreadcrumbItem[] => {
    const crumbs = [...fallback.breadcrumbs];
    crumbs[crumbs.length - 1] = { name };
    return crumbs;
  };

  let seo: ResolvedSeo = fallback;

  try {
    if (route.type === 'tour_detail') {
      const tour = await getTour(route.params.tourSlug);
      if (tour) {
        seo = {
          ...fallback,
          title: `${tour.title}؛ تاریخ، قیمت و شرایط · ریوان سفر`,
          description: tourMetaDescription(tour),
          robots: 'index,follow',
          breadcrumbs: withCrumb(tour.title),
        };
      }
    } else if (route.type === 'guide_detail') {
      const guide = await getGuide(route.params.guideSlug);
      if (guide) {
        seo = {
          ...fallback,
          title: `${guide.title} · ریوان سفر`,
          description: guide.summary,
          robots: 'index,follow',
          breadcrumbs: withCrumb(guide.title),
        };
      }
    } else if (route.type === 'exhibition_detail') {
      const series = await getExhibition(route.params.eventSeriesSlug);
      if (series) {
        const solarLive = series.upcomingEdition.solarDate?.trim();
        seo = {
          ...fallback,
          title: `${series.title} · ریوان سفر`,
          description: solarLive
            ? `${series.heroTagline}. تاریخ: ${solarLive}.`
            : series.heroTagline,
          robots: 'index,follow',
          breadcrumbs: withCrumb(series.title),
        };
      }
    } else if (route.type === 'country') {
      // QA1-02: کشورهای فقط-DB هم متای اختصاصی می‌گیرند.
      const country = (await getCountries())[route.params.countrySlug];
      if (country) {
        seo = {
          ...fallback,
          title: `تور ${country.name}؛ تاریخ‌ها، قیمت و شرایط سفر · ریوان سفر`,
          description: `${country.description.slice(0, 140)}…`,
          robots: 'index,follow',
          breadcrumbs: withCrumb(`تور ${country.name}`),
        };
      }
    } else if (route.type === 'destination_city') {
      // QA1-02: شهرهای فقط-DB هم متای اختصاصی می‌گیرند.
      const cities = await getCities();
      const city = cities[route.params.placeSlug];
      if (city) {
        const allCountries = await getCountries();
        const country =
          allCountries[route.params.countrySlug] ??
          (city.parentCountrySlug ? allCountries[city.parentCountrySlug] : undefined);
        const crumbs = withCrumb(`تور ${city.name}`);
        if (country && crumbs.length >= 3) {
          crumbs[crumbs.length - 2] = {
            name: `تور ${country.name}`,
            url: `/destination/${country.slug}`,
          };
        }
        seo = {
          ...fallback,
          title: `تور ${city.name}؛ تاریخ‌ها، قیمت و شرایط سفر · ریوان سفر`,
          description: `${city.description.slice(0, 140)}…`,
          robots: 'index,follow',
          breadcrumbs: crumbs,
        };
      }
    } else if (route.type === 'visa_country') {
      // QA1-02: کشورهای فقط-DB در صفحهٔ ویزا هم متای اختصاصی می‌گیرند.
      const country = (await getCountries())[route.params.countrySlug];
      if (country) {
        seo = {
          ...fallback,
          title: `ویزای ${country.name}؛ مدارک و مراحل برای ایرانیان · ریوان سفر`,
          description: `مدارک و مراحل ویزای ${country.name} برای ایرانیان با منبع رسمی و تاریخ بازبینی.`,
          robots: 'index,follow',
          breadcrumbs: withCrumb(`ویزای ${country.name}`),
        };
      }
    }
  } catch {
    // خطا در خواندن DB → همان fallback استاتیک می‌ماند.
  }

  // P1-13 — لایهٔ دفاعی دوم گیت لانچ: تا ایندکس عمومی بسته است، همهٔ صفحه‌ها
  // (حتی آن‌هایی که resolveSeo برایشان index داده) متای noindex,nofollow می‌گیرند.
  // خود گیت دست نمی‌خورد؛ فقط متای robots به وضعیت آن وصل می‌شود.
  if (!(await isIndexingEnabled())) {
    seo = { ...seo, robots: 'noindex,nofollow' };
  }
  return seo;
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
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    inLanguage: 'fa-IR',
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
    inLanguage: 'fa-IR',
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
 *
 * ردیف ۲-۴: آبجکت تور زنده را به‌عنوان آرگومان می‌گیرد (از همان دیتایی که صفحه
 * جزئیات از getTours گرفته) — دیگر lookup از SAMPLE_TOURS نمی‌کند.
 */
export function tourJsonLd(tour: TourItem | null | undefined) {
  if (!tour) return null;
  return {
    '@context': 'https://schema.org',
    inLanguage: 'fa-IR',
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
    inLanguage: 'fa-IR',
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

export async function metadataFor(path: string): Promise<Metadata> {
  return toMetadata(await resolveSeoLive(path));
}
