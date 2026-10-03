'use server';

import { getDb } from '@/db/client';
import { siteTours } from '@/db/schema';
import { and, desc, isNull, ne, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface VisaRejectionSuggestion {
  /** متنی که مدیر در تور قبلی واقعاً نوشته */
  note: string;
  /** عنوان تور منبع — برای صداقتِ پیشنهاد */
  tourTitle: string;
}

/**
 * پیشنهاد داده‌محور بند «تکلیف پول در صورت رد ویزا» (موج ۳، هوشمندسازی).
 *
 * از میان تورهای قبلیِ همین مقصدها، تازه‌ترین بندی را برمی‌گرداند که مدیر
 * واقعاً نوشته است — نه متن پیش‌فرض شروع، نه خالی، و نه خودِ همین تور.
 * اگر داده‌ای نباشد null است و پیشنهاد خفته می‌ماند: هیچ‌چیز حدس زده
 * نمی‌شود. به actions.ts دست زده نشده چون تیم مالی هم‌زمان روی آن کار می‌کند.
 */
export async function getVisaRejectionSuggestion(
  destinationSlugs: string[],
  excludeTourId: string | null,
  defaultNote: string,
): Promise<VisaRejectionSuggestion | null> {
  await requireAdmin();
  const slugs = (destinationSlugs ?? []).filter(Boolean);
  if (slugs.length === 0) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const noteCol = sql<string>`${siteTours.financialSpecs} ->> 'visaRejectionNote'`;
    const rows = await db
      .select({ title: siteTours.title, note: noteCol })
      .from(siteTours)
      .where(
        and(
          isNull(siteTours.deletedAt),
          // هم‌پوشانی مقصدها: دست‌کم یکی از مقصدهای این تور
          sql`${siteTours.destinationSlugs} && ${JSON.stringify(slugs)}::jsonb`,
          // بند واقعاً نوشته‌شده: نه خالی، نه متن پیش‌فرض شروع
          sql`nullif(trim(${noteCol}), '') is not null`,
          sql`trim(${noteCol}) <> trim(${defaultNote})`,
          ...(excludeTourId ? [ne(siteTours.id, excludeTourId)] : []),
        ),
      )
      .orderBy(desc(siteTours.updatedAt))
      .limit(1);
    const row = rows[0];
    const note = (row?.note ?? '').trim();
    if (!note) return null;
    return { note, tourTitle: row.title };
  } catch {
    // مثلاً ستون financial_specs هنوز روی DB واقعی مهاجرت نشده است.
    return null;
  }
}
