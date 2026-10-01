'use server';

import { headers } from 'next/headers';
import { getDb } from '@/db/client';
import { loginAttempts } from '@/db/schema';
import { and, count, eq, gte, lt } from 'drizzle-orm';

/**
 * SEC-08: throttling ورود ادمین — راه‌حل عمل‌گرا.
 *
 * هر تلاش ورود (موفق/ناموفق) با ایمیل و IP در جدول login_attempts لاگ می‌شود
 * (مایگریشن 0020). LoginForm پیش از signInWithPassword، checkLoginAllowed را
 * صدا می‌زند و پس از آن recordLoginAttempt را؛ پس حدس رمز آهسته و توزیع‌شده
 * هم پشت این سقف می‌ماند:
 *   - هر ایمیل: ۱۰ تلاش در ۱۵ دقیقه
 *   - هر IP: ۳۰ تلاش در ۱۵ دقیقه (تحمل NAT اشتراکی)
 *
 * محدودیت‌ها:
 * - اگر دیتابیس در دسترس نباشد، fail-open است (ورود نمی‌شکند) و تنها دفاع
 *   همان محدودیت داخلی Supabase Auth می‌ماند؛ این در لاگ سرور ثبت می‌شود.
 * - IP از x-forwarded-for خوانده می‌شود؛ پشت پروکسی‌های چندلایه ممکن است
 *   IP واقعی نباشد، ولی برای throttling همین کافی است.
 * - جایگزین 2FA برای حساب مالک همچنان توصیه می‌شود (در کد اثری از آن نیست).
 */

const WINDOW_MIN = 15;
const MAX_PER_EMAIL = 10;
const MAX_PER_IP = 30;

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

export async function checkLoginAllowed(
  emailRaw: string,
): Promise<{ ok: boolean; message?: string }> {
  const email = (emailRaw || '').trim().toLowerCase().slice(0, 320);
  if (!email) return { ok: true };
  const db = getDb();
  if (!db) {
    console.warn('[login-throttle] دیتابیس در دسترس نیست؛ throttling ورود غیرفعال است.');
    return { ok: true };
  }
  try {
    const ip = await clientIp();
    const since = new Date(Date.now() - WINDOW_MIN * 60_000);
    const [byEmail] = await db
      .select({ n: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.email, email), gte(loginAttempts.attemptedAt, since)));
    if ((byEmail?.n ?? 0) >= MAX_PER_EMAIL) {
      return {
        ok: false,
        message: 'تلاش‌های ورود به این حساب زیاد شده؛ لطفاً ۱۵ دقیقه دیگر تلاش کنید.',
      };
    }
    const [byIp] = await db
      .select({ n: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ip, ip), gte(loginAttempts.attemptedAt, since)));
    if ((byIp?.n ?? 0) >= MAX_PER_IP) {
      return {
        ok: false,
        message: 'تلاش‌های ورود از این نشانی زیاد شده؛ لطفاً ۱۵ دقیقه دیگر تلاش کنید.',
      };
    }
    // نظافت دوره‌ای: رکوردهای قدیمی‌تر از ۷ روز پاک می‌شوند تا جدول باد نکند.
    try {
      await db
        .delete(loginAttempts)
        .where(lt(loginAttempts.attemptedAt, new Date(Date.now() - 7 * 24 * 3600_000)));
    } catch {
      /* نظافت نباید ورود را بشکند */
    }
    return { ok: true };
  } catch {
    // شکست شمارش نباید ورود مشروع را قفل کند.
    return { ok: true };
  }
}

export async function recordLoginAttempt(emailRaw: string, succeeded: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(loginAttempts).values({
      email: (emailRaw || '').trim().toLowerCase().slice(0, 320),
      ip: await clientIp(),
      succeeded,
    });
  } catch {
    // لاگِ تلاش نباید خودِ ورود را بشکند.
  }
}
