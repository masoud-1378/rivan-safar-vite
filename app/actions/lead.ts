'use server';

import { isDbConfigured, getDb } from '@/db/client';
import { leadRequests } from '@/db/schema';

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

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const fullName = (input.fullName || '').trim();
  const phone = (input.phone || '').replace(/[^\d+]/g, '');

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

  try {
    const db = getDb();
    if (!db) throw new Error('no-db');
    await db.insert(leadRequests).values({
      fullName,
      phone,
      sourcePath: input.sourcePath || '/',
      tourContext: input.tourContext || null,
      destinationHint: input.destinationHint || null,
      passengers: input.passengers || null,
      notes: input.notes || null,
    });
    return {
      ok: true,
      stored: true,
      message:
        'درخواست تماس شما ثبت شد؛ کارشناس ریوان سفر در ساعات کاری با شما تماس می‌گیرد.',
    };
  } catch {
    return {
      ok: true,
      stored: false,
      message:
        'ثبت آنلاین درخواست موقتاً ممکن نشد؛ لطفاً با شماره ۰۲۶ — ۳۳۳۵۰۱۳۹ تماس بگیرید.',
    };
  }
}
