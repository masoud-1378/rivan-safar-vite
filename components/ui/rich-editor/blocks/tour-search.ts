'use server';

import { ilike, or, and, isNull, desc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { siteTours } from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';
import { getContactInfo } from '@/src/lib/site-contact';
import type { TourPickerHit } from './types';

function norm(value: string) {
  return value.trim().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[‌‏‎]/g, '');
}

/**
 * جست‌وجوی تور برای دیالوگ «کارت تور» در ویرایشگر.
 * فقط ادمین (همان سطح دسترسی جست‌وجوی سراسری پنل)؛ فقط خواندن دیتابیس.
 * عبارت خالی → ۱۰ تور تازه‌به‌روزشده.
 */
export async function searchToursForPicker(term: string): Promise<TourPickerHit[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return [];

  const q = norm(term);
  const like = `%${q}%`;
  const rows = await db
    .select({
      slug: siteTours.slug,
      title: siteTours.title,
      destination: siteTours.destination,
      duration: siteTours.duration,
      image: siteTours.image,
      price: siteTours.price,
      badge: siteTours.badge,
      statusLabel: siteTours.statusLabel,
    })
    .from(siteTours)
    .where(
      and(
        q.length >= 2
          ? or(ilike(siteTours.title, like), ilike(siteTours.slug, like))
          : undefined,
        isNull(siteTours.deletedAt),
      ),
    )
    .orderBy(desc(siteTours.updatedAt))
    .limit(10);

  return rows.map((r) => {
    const priceNum = Number(r.price);
    return {
      slug: r.slug,
      title: r.title,
      destination: r.destination,
      duration: r.duration,
      image: r.image,
      price: Number.isFinite(priceNum) && priceNum > 0 ? priceNum : null,
      badge: r.badge ?? null,
      statusLabel: r.statusLabel ?? null,
    };
  });
}

/** پیش‌فرض‌های بلوک «درخواست تماس» — شماره از تنظیمات سایت، فقط خواندن. */
export async function getCallCtaDefaults(): Promise<{
  heading: string;
  label: string;
  phoneHref: string;
  phoneDisplay: string;
}> {
  const info = await getContactInfo();
  return {
    heading: 'برای رزرو و مشاوره با کارشناسان ریوان سفر در تماس باشید',
    label: 'درخواست تماس',
    phoneHref: info.phoneHref,
    phoneDisplay: info.phoneDisplay,
  };
}
