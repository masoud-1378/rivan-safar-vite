'use server';

import { isDbConfigured, getDb } from '@/db/client';
import { leadRequests, siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface LeadInput {
  fullName: string;
  phone: string;
  sourcePath: string;
  tourContext?: string;
  destinationHint?: string;
  passengers?: string;
  notes?: string;
}

export interface LeadResult {
  ok: boolean;
  stored: boolean;
  message: string;
}

/**
 * Server Action ثبت درخواست تماس (Lead) — سند ۰۶ §۷.
 * - داده شخصی فقط در DB ذخیره می‌شود؛ به Analytics ارسال نمی‌شود.
 * - بدون DATABASE_URL، درخواست رد نمی‌شود ولی پیام «ثبت شد» صادقانه نیست؛
 *   stored=false برمی‌گرداند تا UI پیام تماس تلفنی نشان دهد.
 * - Rate limit ساده: حداکثر یک درخواست از هر شماره در هر ۶۰ ثانیه.
 */
const recentByPhone = new Map<string, number>();

/** شماره تماس پشتیبانی از تنظیمات؛ اگر خوانده نشد، همان شمارهٔ پیش‌فرض. */
async function supportPhoneDisplay(
  db: NonNullable<ReturnType<typeof getDb>>
): Promise<string> {
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, 'business.phone_display'))
      .limit(1);
    return rows[0]?.settingValue?.trim() || '۰۲۶ — ۳۳۳۵۰۱۳۹';
  } catch {
    return '۰۲۶ — ۳۳۳۵۰۱۳۹';
  }
}

export async function createLead(input: LeadInput): Promise<LeadResult> {
  const fullName = (input.fullName || '').trim();
  // ارقام فارسی/عربی را به انگلیسی برمی‌گردانیم تا در sanitize حذف نشوند
  const phone = (input.phone || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d+]/g, '');

  if (fullName.length < 3 || phone.length < 10) {
    return {
      ok: false,
      stored: false,
      message: 'نام و شماره تماس معتبر وارد کنید.',
    };
  }

  const now = Date.now();
  const last = recentByPhone.get(phone) || 0;
  if (now - last < 60_000) {
    return {
      ok: false,
      stored: false,
      message: 'درخواست شما قبلاً ثبت شده است؛ لطفاً کمی صبر کنید.',
    };
  }
  recentByPhone.set(phone, now);
  if (recentByPhone.size > 5000) recentByPhone.clear();

  if (!isDbConfigured()) {
    return {
      ok: true,
      stored: false,
      message:
        'برای پیگیری سریع‌تر با شماره ۰۲۶ — ۳۳۳۵۰۱۳۹ تماس بگیرید؛ درخواست آنلاین شما ذخیره نشد.',
    };
  }

  let supportPhone = '۰۲۶ — ۳۳۳۵۰۱۳۹';
  try {
    const db = getDb();
    if (!db) throw new Error('no-db');
    supportPhone = await supportPhoneDisplay(db);
    const autoAssign = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, 'leads.auto_assign'))
      .limit(1);
    const successMsg = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, 'leads.success_message'))
      .limit(1);
    await db.insert(leadRequests).values({
      fullName,
      phone,
      sourcePath: input.sourcePath || '/',
      tourContext: input.tourContext || null,
      destinationHint: input.destinationHint || null,
      passengers: input.passengers || null,
      notes: input.notes || null,
      assignee: autoAssign[0]?.settingValue || null,
    });
    return {
      ok: true,
      stored: true,
      message:
        successMsg[0]?.settingValue ||
        'درخواست تماس شما ثبت شد؛ کارشناس ریوان سفر در ساعات کاری با شما تماس می‌گیرد.',
    };
  } catch {
    return {
      ok: true,
      stored: false,
      message: `ثبت آنلاین درخواست موقتاً ممکن نشد؛ لطفاً با شماره ${supportPhone} تماس بگیرید.`,
    };
  }
}

/** نام قدیمی اکشن؛ فرم‌های موجود همین را صدا می‌زنند. */
export const submitLead = createLead;
