/**
 * رجیستری لندینگ‌های سئو — آینه سبک جدول seo_landings (DB) در فرانت.
 * قانون: هیچ صفحه فروشی بدون موجودی واقعی index نمی‌شود (سند 01).
 *
 * - queryOwner: مالک یکتای جست‌وجو (جلوگیری از کنیبال شدن)
 * - indexStatus: فقط published + index وارد Sitemap می‌شوند
 * - دبی عمداً قرنطینه است (needs-inventory-proof) تا اثبات موجودی
 */

export type LandingWorkflow = 'draft' | 'review' | 'published' | 'paused' | 'archived';
export type LandingIndexStatus = 'index' | 'noindex';

export interface SeoLanding {
  queryOwner: string;
  urlPath: string;
  canonicalPath: string;
  pageType: string;
  titleFa: string;
  metaDescriptionFa: string;
  h1Fa: string;
  workflow: LandingWorkflow;
  indexStatus: LandingIndexStatus;
  /** اگر موجودی اثبات نشده، دلیل قرنطینه */
  quarantineReason?: string;
  nextReviewAt?: string;
}

export const SEO_LANDINGS: SeoLanding[] = [
  {
    queryOwner: 'home:ریوان سفر',
    urlPath: '/',
    canonicalPath: '/',
    pageType: 'home',
    titleFa: 'ریوان سفر | تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف',
    metaDescriptionFa:
      'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید و برای تأیید مسیر و ظرفیت با کارشناس در تماس باشید.',
    h1Fa: 'سفر خوب، از انتخاب روشن شروع می‌شود',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'tours:همه تورها',
    urlPath: '/tours',
    canonicalPath: '/tours',
    pageType: 'tours_all',
    titleFa: 'همه تورهای داخلی، خارجی و نمایشگاهی | ریوان سفر',
    metaDescriptionFa:
      'فهرست تورهای فعال داخلی، خارجی و نمایشگاهی با فیلتر مقصد، تاریخ و قیمت پایه.',
    h1Fa: 'تورهای داخلی، خارجی و نمایشگاهی',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'tours:تور خارجی',
    urlPath: '/tours/foreign',
    canonicalPath: '/tours/foreign',
    pageType: 'tours_foreign',
    titleFa: 'تورهای خارجی؛ ترکیه، تایلند و مقاصد فعال | ریوان سفر',
    metaDescriptionFa:
      'پکیج‌های تور خارجی فعال را با تفکیک مقصد، ویزا، ایرلاین و هتل بررسی کنید.',
    h1Fa: 'تورهای خارجی',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'tours:تور داخلی',
    urlPath: '/tours/domestic',
    canonicalPath: '/tours/domestic',
    pageType: 'tours_domestic',
    titleFa: 'تورهای داخلی؛ کیش و مشهد | ریوان سفر',
    metaDescriptionFa:
      'تورهای داخلی فعال کیش و مشهد با هتل منتخب و قیمت پایه شفاف.',
    h1Fa: 'تورهای داخلی',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور ترکیه',
    urlPath: '/destination/turkey',
    canonicalPath: '/destination/turkey',
    pageType: 'country',
    titleFa: 'تور ترکیه؛ استانبول و آنتالیا با قیمت و تاریخ | ریوان سفر',
    metaDescriptionFa:
      'تورهای فعال ترکیه (استانبول، آنتالیا) با تاریخ حرکت، هتل و قیمت پایه.',
    h1Fa: 'تور ترکیه',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور استانبول',
    urlPath: '/destination/turkey/istanbul',
    canonicalPath: '/destination/turkey/istanbul',
    pageType: 'destination_city',
    titleFa: 'تور استانبول؛ تاریخ‌ها، قیمت و شرایط سفر | ریوان سفر',
    metaDescriptionFa:
      'تورهای فعال استانبول با تاریخ، مدت، هتل و قیمت پایه؛ ظرفیت هر حرکت پیش از اقدام تأیید می‌شود.',
    h1Fa: 'تور استانبول؛ تاریخ‌ها، قیمت و شرایط سفر',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور آنتالیا',
    urlPath: '/destination/turkey/antalya',
    canonicalPath: '/destination/turkey/antalya',
    pageType: 'destination_city',
    titleFa: 'تور آنتالیا؛ ریزورت ساحلی UALL با قیمت | ریوان سفر',
    metaDescriptionFa:
      'ریزورت‌های ساحلی آنتالیا با خدمات UALL، تاریخ حرکت و قیمت پایه هر نفر.',
    h1Fa: 'تور آنتالیا',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور تایلند',
    urlPath: '/destination/thailand',
    canonicalPath: '/destination/thailand',
    pageType: 'country',
    titleFa: 'تور تایلند؛ بانکوک و پوکت | ریوان سفر',
    metaDescriptionFa:
      'تورهای فعال تایلند با ویزا، پرواز و هتل؛ مناسب سفر ترکیبی.',
    h1Fa: 'تور تایلند',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور پوکت',
    urlPath: '/destination/thailand/phuket',
    canonicalPath: '/destination/thailand/phuket',
    pageType: 'destination_city',
    titleFa: 'تور پوکت؛ سواحل و تورهای ترکیبی | ریوان سفر',
    metaDescriptionFa:
      'تور پوکت با سواحل آندامان و گشت جزایر؛ تاریخ و قیمت پایه هر حرکت.',
    h1Fa: 'تور پوکت',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور کیش',
    urlPath: '/destination/iran/kish',
    canonicalPath: '/destination/iran/kish',
    pageType: 'destination_city',
    titleFa: 'تور کیش؛ هتل ساحلی با قیمت | ریوان سفر',
    metaDescriptionFa:
      'تورهای فعال کیش با هتل ساحلی، ترانسفر و قیمت پایه شفاف.',
    h1Fa: 'تور کیش',
    workflow: 'published',
    indexStatus: 'index',
  },
  {
    queryOwner: 'dest:تور مشهد',
    urlPath: '/destination/iran/mashhad',
    canonicalPath: '/destination/iran/mashhad',
    pageType: 'destination_city',
    titleFa: 'تور مشهد؛ هتل نزدیک حرم هوایی و ریلی | ریوان سفر',
    metaDescriptionFa:
      'تور مشهد با هتل نزدیک حرم، گزینه هوایی و قطار ۵ ستاره.',
    h1Fa: 'تور مشهد',
    workflow: 'published',
    indexStatus: 'index',
  },
  // ---- قرنطینه: بدون موجودی اثبات‌شده، noindex ----
  {
    queryOwner: 'dest:تور دبی',
    urlPath: '/destination/uae/dubai',
    canonicalPath: '/destination/uae/dubai',
    pageType: 'destination_city',
    titleFa: 'تور دبی | ریوان سفر',
    metaDescriptionFa: 'استعلام تور دبی با کارشناس ریوان سفر.',
    h1Fa: 'تور دبی',
    workflow: 'draft',
    indexStatus: 'noindex',
    quarantineReason: 'needs-inventory-proof',
  },
  {
    queryOwner: 'dest:تور امارات',
    urlPath: '/destination/uae',
    canonicalPath: '/destination/uae',
    pageType: 'country',
    titleFa: 'تور امارات | ریوان سفر',
    metaDescriptionFa: 'استعلام تورهای امارات با کارشناس ریوان سفر.',
    h1Fa: 'تور امارات',
    workflow: 'draft',
    indexStatus: 'noindex',
    quarantineReason: 'needs-inventory-proof',
  },
  {
    queryOwner: 'dest:تور چین',
    urlPath: '/destination/china',
    canonicalPath: '/destination/china',
    pageType: 'country',
    titleFa: 'تور چین و نمایشگاه کانتون فیر | ریوان سفر',
    metaDescriptionFa: 'پکیج نمایشگاهی کانتون فیر گوانگجو با ویزا و ترانسفر.',
    h1Fa: 'تور چین',
    workflow: 'review',
    indexStatus: 'noindex',
    quarantineReason: 'needs-inventory-proof',
  },
];

/** فقط لندینگ‌های قابل ایندکس — ورودی Sitemap و robots */
export function getIndexableLandings(): SeoLanding[] {
  return SEO_LANDINGS.filter(
    (l) => l.workflow === 'published' && l.indexStatus === 'index',
  );
}

/**
 * مسیرهای داینامیک ایندکس‌پذیر (تور/راهنما/نمایشگاه/ویزا).
 * قانون: این صفحات فقط تا زمانی ایندکس‌پذیرند که داده واقعی پشتشان باشد.
 * با اتصال DB، این فهرست از جدول seo_landings خوانده می‌شود.
 */
export function getDynamicIndexablePaths(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SAMPLE_TOURS } = require('./toursData') as typeof import('./toursData');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GUIDES } = require('./guidesData') as typeof import('./guidesData');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EXHIBITION_SERIES } = require('./exhibitionsData') as typeof import('./exhibitionsData');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { COUNTRIES } = require('./destinationsData') as typeof import('./destinationsData');

  const paths: string[] = [];
  for (const t of SAMPLE_TOURS) paths.push(`/tour/${t.id}`);
  for (const g of Object.values(GUIDES)) paths.push(`/guide/${g.slug}`);
  for (const s of Object.values(EXHIBITION_SERIES)) {
    paths.push(`/exhibition/${s.slug}`);
    paths.push(`/exhibition/${s.slug}/${s.upcomingEdition.editionSlug}`);
  }
  for (const c of Object.keys(COUNTRIES)) paths.push(`/visa/${c}`);
  return paths;
}

export function findLandingByPath(path: string): SeoLanding | undefined {
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return SEO_LANDINGS.find((l) => l.urlPath === clean);
}

export interface QualityGateInput {
  sellsReally: boolean;
  hasDemand: boolean;
  hasInventory: boolean;
  contentReady: boolean;
}

/** گیت انتشار سند 01: فروش واقعی → تقاضا → موجودی → محتوا/QA */
export function qualityGateAllowsIndex(input: QualityGateInput): boolean {
  return (
    input.sellsReally && input.hasDemand && input.hasInventory && input.contentReady
  );
}
