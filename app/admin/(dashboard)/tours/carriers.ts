'use server';

import { getDb } from '@/db/client';
import { carriers } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface CarrierOption {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string | null;
  iataCode: string | null;
  country: string | null;
}

/**
 * فهرست ایرلاین‌ها از جدول carriers (موج ۳، seed در مایگریشن 0029).
 *
 * رفتار صادقانه: اگر جدول خالی باشد — یا ستون‌های تازه (name_en و …) هنوز
 * مهاجرت نشده باشند — آرایهٔ خالی برمی‌گردد تا UI «فهرستی نیست» نشان بدهد،
 * نه حدس. به actions.ts دست زده نشده چون تیم مالی هم‌زمان روی آن کار می‌کند.
 */
export async function listCarriers(): Promise<CarrierOption[]> {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: carriers.id,
        slug: carriers.slug,
        nameFa: carriers.nameFa,
        nameEn: carriers.nameEn,
        iataCode: carriers.iataCode,
        country: carriers.country,
      })
      .from(carriers)
      .orderBy(asc(carriers.nameFa));
    return rows;
  } catch {
    // مثلاً ستون‌های 0029 هنوز روی DB واقعی اجرا نشده‌اند.
    return [];
  }
}
