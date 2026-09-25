import { getRest } from './supabase-rest';
import { withDefaults } from './settings';

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
  ctaLabel: string;
  brand: string;
  tagline: string;
}

const FALLBACK: ContactInfo = {
  phone: '02633350139',
  phoneHref: 'tel:02633350139',
  phoneDisplay: '۰۲۶ — ۳۳۳۵۰۱۳۹',
  phoneSecondary: '',
  email: 'info@rivansafar.com',
  address: 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۲۱',
  showHeaderPhone: true,
  showFooterPhone: true,
  ctaLabel: 'درخواست تماس',
  brand: 'ریوان سفر',
  tagline: 'سفر خوب، از انتخاب روشن شروع می‌شود',
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
      ctaLabel: s['contact.cta_label'] || FALLBACK.ctaLabel,
      brand: s['site.brand'] || FALLBACK.brand,
      tagline: s['site.tagline'] || FALLBACK.tagline,
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
