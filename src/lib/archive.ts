/**
 * هلپر مشترک حذف منطقی («بایگانی») + ثبت در audit_logs.
 * همهٔ اکشن‌های حذف پنل باید از همین‌جا رد شوند تا هیچ حذفی بی‌ردپا نماند.
 *
 * قرارداد:
 * - بایگانی = set deleted_at + لاگ (action: 'archive')؛ رکورد از همهٔ فهرست‌ها پنهان می‌شود ولی قابل بازیابی است.
 * - بازیابی = deleted_at = null + لاگ (action: 'restore').
 * - حذف دائمی = db.delete واقعی + لاگ (action: 'hard_delete')؛ فقط از صفحهٔ بایگانی و فقط برای مالک.
 */
import { eq } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import { auditLogs } from '@/db/schema';
import type { AppDb } from '@/db/client';

/** جدول‌هایی که ستون‌های id و deleted_at را دارند. */
export type ArchivableTable = PgTable & { deletedAt: AnyPgColumn; id: AnyPgColumn };

export interface ArchiveMeta {
  /** ایمیل عامل (از نشست ادمین) */
  actor: string;
  /** نام جدول، مثل 'site_tours' */
  entity: string;
  /** توضیح فارسی برای گزارش تغییرات */
  reasonFa: string;
}

async function writeAudit(db: AppDb, action: string, meta: ArchiveMeta, entityId: string) {
  await db.insert(auditLogs).values({
    actor: meta.actor,
    action,
    entity: meta.entity,
    entityId,
    reasonFa: meta.reasonFa,
  });
}

/** بایگانی یک رکورد: deleted_at می‌خورد و لاگ می‌شود. */
export async function archiveOne(db: AppDb, table: ArchivableTable, id: string, meta: ArchiveMeta) {
  await db
    .update(table)
    .set({ deletedAt: new Date() } as never)
    .where(eq(table.id, id));
  await writeAudit(db, 'archive', meta, id);
  return { ok: true };
}

/** بازیابی رکورد بایگانی‌شده. */
export async function restoreOne(db: AppDb, table: ArchivableTable, id: string, meta: ArchiveMeta) {
  await db
    .update(table)
    .set({ deletedAt: null } as never)
    .where(eq(table.id, id));
  await writeAudit(db, 'restore', meta, id);
  return { ok: true };
}

/** حذف دائمی و واقعی رکورد + لاگ. فقط از صفحهٔ بایگانی صدا زده می‌شود. */
export async function hardDeleteOne(db: AppDb, table: ArchivableTable, id: string, meta: ArchiveMeta) {
  await db.delete(table).where(eq(table.id, id));
  await writeAudit(db, 'hard_delete', meta, id);
  return { ok: true };
}
