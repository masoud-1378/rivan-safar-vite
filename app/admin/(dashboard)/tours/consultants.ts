'use server';

import { getDb } from '@/db/client';
import { siteTours } from '@/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import type { TourConsultantSpecItem } from './actions';

export interface TourConsultantOption {
  name: string;
  title: string;
  phone: string;
  emergencyPhone: string;
}

/**
 * خواندنِ تحمل‌پذیر ستون jsonb که گاهی رشته است (consultant_spec).
 * نسخهٔ محلی همین فایل است تا actions.ts دست نخورده بماند.
 */
function jsonObjectOf(v: unknown): Record<string, unknown> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  if (typeof v === 'string') {
    try {
      return jsonObjectOf(JSON.parse(v));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * ایراد ۹ مسعود (موج ۶): فهرست کارشناس‌های قبلاً واردشده، از روی تورهای موجود.
 *
 * فقط خواندن است؛ هیچ ستون یا جدول تازه‌ای لازم نیست — منبع همان ستون
 * consultant_spec روی site_tours است. نام‌های تکراری یکی می‌شوند و تازه‌ترین
 * رکوردِ هر کارشناس می‌ماند (کامل‌ترین مشخصات). تورِ در حال ویرایش از فهرست
 * بیرون می‌ماند تا خودش را منبع حساب نکند.
 */
export async function listTourConsultants(excludeId?: string | null): Promise<TourConsultantOption[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select({ id: siteTours.id, consultantSpec: siteTours.consultantSpec })
      .from(siteTours)
      .where(isNull(siteTours.deletedAt))
      .orderBy(desc(siteTours.createdAt))
      .limit(500);
    const byName = new Map<string, TourConsultantOption>();
    for (const r of rows) {
      if (excludeId && r.id === excludeId) continue;
      const c = jsonObjectOf(r.consultantSpec) as Partial<TourConsultantSpecItem>;
      const name = String(c.name || '').trim();
      if (!name || byName.has(name)) continue;
      byName.set(name, {
        name,
        title: String(c.title || '').trim(),
        phone: String(c.phone || '').trim(),
        emergencyPhone: String(c.emergencyPhone || '').trim(),
      });
    }
    return [...byName.values()];
  } catch {
    return [];
  }
}
