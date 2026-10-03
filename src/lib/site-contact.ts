import { getRest } from './supabase-rest';
import { withDefaults } from './settings';
import { SITE_URL } from './siteConfig';

export interface ContactInfo {
  phone: string;
  phoneHref: string;
  phoneDisplay: string;
  phoneSecondary: string;
  email: string;
  address: string;
  workingHours: string;
  showHeaderPhone: boolean;
  showFooterPhone: boolean;
  brand: string;
  tagline: string;
  announcementText: string;
  social: {
    instagram: string;
    telegram: string;
    whatsapp: string;
    linkedin: string;
  };
}

const FALLBACK: ContactInfo = {
  phone: '02633350139',
  phoneHref: 'tel:02633350139',
  phoneDisplay: '۰۲۶-۳۳۳۵۰۱۳۹',
  phoneSecondary: '',
  email: 'info@rivansafar.com',
  address: 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۲۱',
  showHeaderPhone: true,
  showFooterPhone: true,
  brand: 'ریوان سفر',
  tagline: 'سفر خوب، از انتخاب روشن شروع می‌شود',
  announcementText: 'ثبت‌نام تورهای نوروزی آغاز شد.',
  social: { instagram: '', telegram: '', whatsapp: '', linkedin: '' },
};

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const rest = getRest();
    if (!rest) return FALLBACK;
    const { data, error } = await rest.from('site_settings').select('setting_key,setting_value');
    if (error) throw error;
    const s = withDefaults(
      ((data ?? []) as Array<{ setting_key: string; setting_value: string }>).map((r) => ({
        settingKey: r.setting_key,
        settingValue: r.setting_value,
      })),
    );
    const digits = (s['business.phone'] || FALLBACK.phone).replace(/[^\d]/g, '');
    const phone = digits || FALLBACK.phone;
    return {
      phone,
      phoneHref: `tel:${phone}`,
      phoneDisplay: s['business.phone_display'] || FALLBACK.phoneDisplay,
      phoneSecondary: s['business.phone_secondary'] || '',
      email: s['business.email'] || FALLBACK.email,
      address: s['business.address'] || FALLBACK.address,
      workingHours: s['business.working_hours'] || FALLBACK.workingHours,
      showHeaderPhone: (s['contact.show_header_phone'] ?? 'true') === 'true',
      showFooterPhone: (s['contact.show_footer_phone'] ?? 'true') === 'true',
      brand: s['site.brand'] || FALLBACK.brand,
      tagline: s['site.tagline'] || FALLBACK.tagline,
      announcementText: s['site.announcement_text'] || FALLBACK.announcementText,
      social: {
        instagram: s['social.instagram'] || '',
        telegram: s['social.telegram'] || '',
        whatsapp: s['social.whatsapp'] || '',
        linkedin: s['social.linkedin'] || '',
      },
    };
  } catch {
    return FALLBACK;
  }
}

export async function isIndexingEnabled(): Promise<boolean> {
  try {
    const rest = getRest();
    if (!rest) return process.env.SEO_INDEXING_ENABLED === 'true';
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'seo.indexing_enabled')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data.setting_value === 'true';
    return process.env.SEO_INDEXING_ENABLED === 'true';
  } catch {
    return process.env.SEO_INDEXING_ENABLED === 'true';
  }
}

export async function getGaId(): Promise<string | undefined> {
  try {
    const rest = getRest();
    if (!rest) return process.env.NEXT_PUBLIC_GA_ID;
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'seo.ga_id')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.setting_value || process.env.NEXT_PUBLIC_GA_ID || undefined;
  } catch {
    return process.env.NEXT_PUBLIC_GA_ID;
  }
}

export interface SiteMeta {
  /** دامنهٔ اصلی سایت — اول از تنظیم site.url، وگرنه SITE_URL (env/پیش‌فرض). */
  siteUrl: string;
  brand: string;
  defaultTitle: string;
  defaultDescription: string;
}

const META_FALLBACK: SiteMeta = {
  siteUrl: SITE_URL,
  brand: 'ریوان سفر',
  defaultTitle: 'تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف · ریوان سفر',
  defaultDescription:
    'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید و برای تأیید مسیر و ظرفیت با کارشناس در تماس باشید.',
};

/**
 * ایراد ۲۸: خوانش یک‌جای site.url و متاهای پیش‌فرض سئو برای layout/sitemap/robots.
 * مقدار نامعتبرِ ذخیره‌شده در دیتابیس، بی‌سروصدا با مقدار امن جایگزین می‌شود.
 */
export async function getSiteMeta(): Promise<SiteMeta> {
  try {
    const rest = getRest();
    if (!rest) return { ...META_FALLBACK, siteUrl: SITE_URL };
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_key,setting_value')
      .in('setting_key', ['site.url', 'site.brand', 'seo.default_title', 'seo.default_description']);
    if (error) throw error;
    const s = withDefaults(
      ((data ?? []) as Array<{ setting_key: string; setting_value: string }>).map((r) => ({
        settingKey: r.setting_key,
        settingValue: r.setting_value,
      })),
    );
    const rawUrl = (s['site.url'] || '').trim().replace(/\/+$/, '');
    const siteUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(rawUrl) ? rawUrl : SITE_URL;
    return {
      siteUrl,
      brand: s['site.brand'] || META_FALLBACK.brand,
      defaultTitle: s['seo.default_title'] || META_FALLBACK.defaultTitle,
      defaultDescription: s['seo.default_description'] || META_FALLBACK.defaultDescription,
    };
  } catch {
    return { ...META_FALLBACK, siteUrl: SITE_URL };
  }
}

/** دامنهٔ اصلی سایت برای canonical/sitemap/robots — همان getSiteMeta ولی فقط URL. */
export async function getSiteUrl(): Promise<string> {
  return (await getSiteMeta()).siteUrl;
}

export interface TourListSettings {
  /** تعداد تورِ اولِ فهرست (دکمهٔ «نمایش بیشتر» بقیه را می‌آورد). */
  pageSize: number;
  /** مرتب‌سازی اولیهٔ فهرست تورها. */
  defaultSort: 'default' | 'price-low' | 'price-high';
}

/**
 * ایراد ۲۸: tours.page_size و tours.default_sort از این‌جا به صفحهٔ تورها می‌رسند.
 * مقادیر تنظیمات (default/price_asc/price_desc) به کلیدهای مرتب‌سازی کامپوننت نگاشت می‌شوند.
 */
export async function getTourListSettings(): Promise<TourListSettings> {
  const fallback: TourListSettings = { pageSize: 12, defaultSort: 'default' };
  try {
    const rest = getRest();
    if (!rest) return fallback;
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_key,setting_value')
      .in('setting_key', ['tours.page_size', 'tours.default_sort']);
    if (error) throw error;
    const s = withDefaults(
      ((data ?? []) as Array<{ setting_key: string; setting_value: string }>).map((r) => ({
        settingKey: r.setting_key,
        settingValue: r.setting_value,
      })),
    );
    const rawSize = Number(s['tours.page_size']);
    const pageSize =
      Number.isFinite(rawSize) ? Math.min(48, Math.max(4, Math.round(rawSize))) : fallback.pageSize;
    const rawSort = s['tours.default_sort'];
    const defaultSort =
      rawSort === 'price_asc' ? 'price-low' : rawSort === 'price_desc' ? 'price-high' : 'default';
    return { pageSize, defaultSort };
  } catch {
    return fallback;
  }
}
