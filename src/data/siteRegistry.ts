export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export type PageType = 
  | 'home' 
  | 'tours_all' 
  | 'tours_foreign' 
  | 'tours_domestic' 
  | 'destinations_catalog'
  | 'country'
  | 'destination_city'
  | 'tour_detail'
  | 'exhibitions_hub'
  | 'exhibition_detail'
  | 'guides_hub'
  | 'guide_detail'
  | 'visa_country'
  | 'about'
  | 'contact'
  | 'licenses'
  | 'terms'
  | 'privacy'
  | 'not_found';

export interface RouteMatch {
  type: PageType;
  params: Record<string, string>;
  canonicalPath: string;
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

export function resolveRoute(path: string): RouteMatch {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  // 1. Home
  if (cleanPath === '/' || cleanPath === '') {
    return {
      type: 'home',
      params: {},
      canonicalPath: '/',
      title: 'ریوان سفر البرز | تورهای داخلی، خارجی و نمایشگاهی',
      breadcrumbs: []
    };
  }

  // 2. All Tours
  if (cleanPath === '/tours') {
    return {
      type: 'tours_all',
      params: {},
      canonicalPath: '/tours',
      title: 'همه تورهای مسافرتی داخلی، خارجی و نمایشگاهی | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'همه تورها' }
      ]
    };
  }

  // 3. Foreign Tours Hub
  if (cleanPath === '/tours/foreign') {
    return {
      type: 'tours_foreign',
      params: {},
      canonicalPath: '/tours/foreign',
      title: 'تورهای خارجی؛ مقاصد آسیایی، اروپایی و همسایه | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'همه تورها', url: '/tours' },
        { name: 'تورهای خارجی' }
      ]
    };
  }

  // 4. Domestic Tours Hub
  if (cleanPath === '/tours/domestic') {
    return {
      type: 'tours_domestic',
      params: {},
      canonicalPath: '/tours/domestic',
      title: 'تورهای داخلی کیش، مشهد، قشم و شهرهای تاریخی | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'همه تورها', url: '/tours' },
        { name: 'تورهای داخلی' }
      ]
    };
  }

  // 5. Destinations Catalog
  if (cleanPath === '/destinations') {
    return {
      type: 'destinations_catalog',
      params: {},
      canonicalPath: '/destinations',
      title: 'فهرست مقصدهای تور داخلی و خارجی | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'مقصدها' }
      ]
    };
  }

  // 6. Exhibitions Hub
  if (cleanPath === '/exhibitions') {
    return {
      type: 'exhibitions_hub',
      params: {},
      canonicalPath: '/exhibitions',
      title: 'تورهای نمایشگاهی بین‌المللی چین، دبی و اروپا | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'تورهای نمایشگاهی' }
      ]
    };
  }

  // 7. Guides Hub
  if (cleanPath === '/guides') {
    return {
      type: 'guides_hub',
      params: {},
      canonicalPath: '/guides',
      title: 'راهنمای جامع سفر، ویزا، هزینه‌ها و انتخاب هتل | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'راهنمای سفر' }
      ]
    };
  }

  // 8. Single Tour Detail: /tour/:tourSlug
  const tourMatch = cleanPath.match(/^\/tour\/([a-zA-Z0-9_-]+)$/);
  if (tourMatch) {
    const slug = tourMatch[1];
    return {
      type: 'tour_detail',
      params: { tourSlug: slug },
      canonicalPath: `/tour/${slug}`,
      title: `مشخصات و قیمت تور | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'تورها', url: '/tours' },
        { name: 'جزئیات تور' }
      ]
    };
  }

  // 9. Destination City: /destination/:countrySlug/:placeSlug
  const cityMatch = cleanPath.match(/^\/destination\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/);
  if (cityMatch) {
    const countrySlug = cityMatch[1];
    const placeSlug = cityMatch[2];
    return {
      type: 'destination_city',
      params: { countrySlug, placeSlug },
      canonicalPath: `/destination/${countrySlug}/${placeSlug}`,
      title: `تور و اطلاعات سفر | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'مقصدها', url: '/destinations' },
        { name: countrySlug, url: `/destination/${countrySlug}` },
        { name: placeSlug }
      ]
    };
  }

  // 10. Country Page: /destination/:countrySlug
  const countryMatch = cleanPath.match(/^\/destination\/([a-zA-Z0-9_-]+)$/);
  if (countryMatch) {
    const countrySlug = countryMatch[1];
    return {
      type: 'country',
      params: { countrySlug },
      canonicalPath: `/destination/${countrySlug}`,
      title: `تورها و راهنمای سفر به کشور | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'مقصدها', url: '/destinations' },
        { name: countrySlug }
      ]
    };
  }

  // 11. Exhibition Detail / Edition: /exhibition/:eventSeriesSlug (and optional edition)
  const exMatch = cleanPath.match(/^\/exhibition\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?$/);
  if (exMatch) {
    const eventSeriesSlug = exMatch[1];
    const editionSlug = exMatch[2] || '';
    return {
      type: 'exhibition_detail',
      params: { eventSeriesSlug, editionSlug },
      canonicalPath: editionSlug ? `/exhibition/${eventSeriesSlug}/${editionSlug}` : `/exhibition/${eventSeriesSlug}`,
      title: `تور نمایشگاهی تخصصی | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'نمایشگاه‌ها', url: '/exhibitions' },
        { name: eventSeriesSlug }
      ]
    };
  }

  // 12. Guide Detail: /guide/:guideSlug
  const guideMatch = cleanPath.match(/^\/guide\/([a-zA-Z0-9_-]+)$/);
  if (guideMatch) {
    const guideSlug = guideMatch[1];
    return {
      type: 'guide_detail',
      params: { guideSlug },
      canonicalPath: `/guide/${guideSlug}`,
      title: `راهنمای تخصصی سفر | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'راهنمای سفر', url: '/guides' },
        { name: 'راهنما' }
      ]
    };
  }

  // 13. Visa Guide: /visa/:countrySlug
  const visaMatch = cleanPath.match(/^\/visa\/([a-zA-Z0-9_-]+)$/);
  if (visaMatch) {
    const countrySlug = visaMatch[1];
    return {
      type: 'visa_country',
      params: { countrySlug },
      canonicalPath: `/visa/${countrySlug}`,
      title: `شرایط و مدارک ویزا | ریوان سفر`,
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'راهنمای سفر', url: '/guides' },
        { name: `ویزای ${countrySlug}` }
      ]
    };
  }

  // 14. Static / Trust Pages
  if (cleanPath === '/about') {
    return {
      type: 'about',
      params: {},
      canonicalPath: '/about',
      title: 'درباره آژانس مسافرتی ریوان سفر البرز | هویت و تعهدات ما',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'درباره ما' }
      ]
    };
  }

  if (cleanPath === '/contact') {
    return {
      type: 'contact',
      params: {},
      canonicalPath: '/contact',
      title: 'تماس با ریوان سفر | نشانی دفتر مهرشهر و شماره‌های تماس',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'تماس با ما' }
      ]
    };
  }

  if (cleanPath === '/licenses') {
    return {
      type: 'licenses',
      params: {},
      canonicalPath: '/licenses',
      title: 'مجوزها و اطلاعات ثبتی رسمی | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'مجوزها و اطلاعات ثبتی' }
      ]
    };
  }

  if (cleanPath === '/terms') {
    return {
      type: 'terms',
      params: {},
      canonicalPath: '/terms',
      title: 'قوانین و شرایط رزرو و کنسلی تورها | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'قوانین و مقررات' }
      ]
    };
  }

  if (cleanPath === '/privacy') {
    return {
      type: 'privacy',
      params: {},
      canonicalPath: '/privacy',
      title: 'سیاست حریم خصوصی و امنیت داده‌ها | ریوان سفر',
      breadcrumbs: [
        { name: 'خانه', url: '/' },
        { name: 'حریم خصوصی' }
      ]
    };
  }

  // Fallback: 404
  return {
    type: 'not_found',
    params: {},
    canonicalPath: cleanPath,
    title: 'صفحه مورد نظر پیدا نشد | ریوان سفر',
    breadcrumbs: [
      { name: 'خانه', url: '/' },
      { name: '۴۰۴ - صفحه پیدا نشد' }
    ]
  };
}
