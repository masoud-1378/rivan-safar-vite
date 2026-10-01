'use server';

import { headers } from 'next/headers';
import { isDbConfigured, getDb } from '@/db/client';
import { leadRequests, siteSettings } from '@/db/schema';
import { and, count, eq, gte } from 'drizzle-orm';

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
 * - SEC-04: محدودیت نرخ دیتابیسی — حداکثر یک لید در ۶۰ ثانیه برای هر شماره،
 *   و حداکثر ۳ لید در ۶۰ ثانیه برای هر IP (تحمل NAT اشتراکی). نسخهٔ قبلی با
 *   Map درون‌حافظه‌ای بود که در سرورلس Vercel با هر نمونه/cold-start پاک می‌شد.
 */

/** الگوی موبایل ایرانی — هم‌تراز با اعتبارسنجی سمت کلاینت (مهارت iran-validation). */
const IRANIAN_MOBILE_RE = /^(?:\+98|0098|0)?9\d{9}$/;

const RATE_WINDOW_MS = 60_000;
const MAX_PER_PHONE = 1;
const MAX_PER_IP = 3;

/** سقف طول فیلدهای آزاد — SEC-04 (جلوگیری از پر کردن دیتابیس با متن‌های غول‌پیکر). */
const cap = (v: string | undefined, n: number) => (v || '').trim().slice(0, n);

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0].trim().slice(0, 64) || 'unknown';
    return (h.get('x-real-ip') || 'unknown').slice(0, 64);
  } catch {
    return 'unknown';
  }
}

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
  const fullName = cap(input.fullName, 160);
  // ارقام فارسی/عربی را به انگلیسی برمی‌گردانیم تا در sanitize حذف نشوند
  const phone = (input.phone || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d+]/g, '');

  if (fullName.length < 3 || !IRANIAN_MOBILE_RE.test(phone)) {
    return {
      ok: false,
      stored: false,
      message: 'نام و شماره تماس معتبر وارد کنید.',
    };
  }

  const sourcePath = cap(input.sourcePath, 300) || '/';
  const tourContext = cap(input.tourContext, 220) || null;
  const destinationHint = cap(input.destinationHint, 120) || null;
  const passengers = cap(input.passengers, 20) || null;
  const notes = cap(input.notes, 2000) || null;
  const ip = await clientIp();

  if (!isDbConfigured()) {
    return {
      ok: true,
      stored: false,
      message:
        'برای پیگیری سریع‌تر با شماره ۰۲۶ — ۳۳۳۵۰۱۳۹ تماس بگیرید؛ درخواست آنلاین شما ذخیره نشد.',
    };
  }

  const db = getDb();
  if (!db) {
    return {
      ok: true,
      stored: false,
      message:
        'برای پیگیری سریع‌تر با شماره ۰۲۶ — ۳۳۳۵۰۱۳۹ تماس بگیرید؛ درخواست آنلاین شما ذخیره نشد.',
    };
  }

  // محدودیت نرخ از روی دیتابیس (مشترک بین همهٔ نمونه‌های سرورلس)، پیش از insert.
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const [byPhone] = await db
      .select({ n: count() })
      .from(leadRequests)
      .where(and(eq(leadRequests.phone, phone), gte(leadRequests.createdAt, since)));
    if ((byPhone?.n ?? 0) >= MAX_PER_PHONE) {
      return {
        ok: false,
        stored: false,
        message: 'درخواست شما قبلاً ثبت شده است؛ لطفاً کمی صبر کنید.',
      };
    }
    if (ip !== 'unknown') {
      const [byIp] = await db
        .select({ n: count() })
        .from(leadRequests)
        .where(and(eq(leadRequests.ip, ip), gte(leadRequests.createdAt, since)));
      if ((byIp?.n ?? 0) >= MAX_PER_IP) {
        return {
          ok: false,
          stored: false,
          message: 'درخواست‌های زیادی از این نشانی ثبت شده؛ لطفاً کمی بعد تلاش کنید.',
        };
      }
    }
  } catch {
    // اگر شمارش به هر دلیلی شکست خورد، فرم را نمی‌شکنیم؛ insert را ادامه می‌دهیم.
  }

  let supportPhone = '۰۲۶ — ۳۳۳۵۰۱۳۹';
  try {
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
      ip,
      sourcePath,
      tourContext,
      destinationHint,
      passengers,
      notes,
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
