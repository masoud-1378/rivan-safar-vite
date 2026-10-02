import { getRest } from './supabase-rest';
import { withDefaults } from './settings';

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  brand: string;
  phoneDisplay: string;
  phoneHref: string;
}

const KEYS = [
  'site.maintenance',
  'site.maintenance_message',
  'site.brand',
  'business.phone',
  'business.phone_display',
] as const;

/**
 * پرچم تعمیرات حداکثر هر ۳۰ ثانیه یک‌بار از دیتابیس خوانده می‌شود.
 * چرا کش؟ این چک روی هر ریکوئست عمومی سایت در middleware اجرا می‌شود؛
 * بدون کش، هر بازدید یک کوئری اضافه به دیتابیس می‌زد. با این TTL،
 * روشن/خاموش شدن از پنل حداکثر ۳۰ ثانیه بعد روی سایت اثر می‌گذارد.
 */
const TTL_MS = 30_000;

let cached: { at: number; state: MaintenanceState } | null = null;

function defaults(): MaintenanceState {
  const d = withDefaults([]);
  const digits = (d['business.phone'] || '').replace(/[^\d]/g, '');
  return {
    enabled: d['site.maintenance'] === 'true',
    message: d['site.maintenance_message'],
    brand: d['site.brand'],
    phoneDisplay: d['business.phone_display'],
    phoneHref: digits ? `tel:${digits}` : '',
  };
}

async function readFromDb(): Promise<MaintenanceState> {
  const rest = getRest();
  if (!rest) return defaults();
  const { data, error } = await rest
    .from('site_settings')
    .select('setting_key,setting_value')
    .in('setting_key', [...KEYS]);
  if (error) throw error;
  const merged = withDefaults(
    ((data ?? []) as Array<{ setting_key: string; setting_value: string }>).map((r) => ({
      settingKey: r.setting_key,
      settingValue: r.setting_value,
    })),
  );
  const fallback = defaults();
  const digits = (merged['business.phone'] || '').replace(/[^\d]/g, '');
  return {
    enabled: merged['site.maintenance'] === 'true',
    message: merged['site.maintenance_message'] || fallback.message,
    brand: merged['site.brand'] || fallback.brand,
    phoneDisplay: merged['business.phone_display'] || fallback.phoneDisplay,
    phoneHref: digits ? `tel:${digits}` : '',
  };
}

/**
 * وضعیت تعمیرات سایت. فقط سمت سرور.
 * اگر خواندن از دیتابیس به هر دلیلی خطا بخورد، سایت «باز» فرض می‌شود:
 * یک قطعی دیتابیس نباید خودش بهانه‌ای برای خواباندن کل سایت شود.
 */
export async function getMaintenanceState(): Promise<MaintenanceState> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) return cached.state;
  try {
    const state = await readFromDb();
    cached = { at: now, state };
    return state;
  } catch {
    const state = defaults();
    cached = { at: now, state };
    return state;
  }
}
