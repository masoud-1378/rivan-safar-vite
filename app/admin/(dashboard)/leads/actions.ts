'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { leadRequests, auditLogs } from '@/db/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { LEAD_STATUS_FA } from './lead-status';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'invalid';

export async function getLeadStats() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // فقط ستون‌هایی که صفحه مصرف می‌کند را می‌خوانیم؛ ستون ip (مایگریشن 0021)
  // ممکن است روی دیتابیس اجرا نشده باشد و select همه‌ستونه خطا می‌داد.
  const rows = await db
    .select({
      id: leadRequests.id,
      fullName: leadRequests.fullName,
      phone: leadRequests.phone,
      sourcePath: leadRequests.sourcePath,
      tourContext: leadRequests.tourContext,
      destinationHint: leadRequests.destinationHint,
      passengers: leadRequests.passengers,
      notes: leadRequests.notes,
      adminNotes: leadRequests.adminNotes,
      status: leadRequests.status,
      assignee: leadRequests.assignee,
      createdAt: leadRequests.createdAt,
    })
    .from(leadRequests)
    .orderBy(desc(leadRequests.createdAt))
    .limit(200);
  const counts = await db
    .select({ status: leadRequests.status, n: count() })
    .from(leadRequests)
    .groupBy(leadRequests.status);
  return { rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) };
}

export async function updateLeadStatus(id: string, status: LeadStatus, assignee?: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db
    .update(leadRequests)
    .set({ status, ...(assignee !== undefined ? { assignee } : {}) })
    .where(eq(leadRequests.id, id));
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'lead.status',
    entity: 'lead_requests',
    entityId: id,
    reasonFa: `تغییر وضعیت به «${LEAD_STATUS_FA[status]}»`,
  });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  return { ok: true };
}

/**
 * ۳-۱۰: یادداشت داخلی ادمین برای لید — جدا از یادداشت فقط‌خواندنیِ خودِ کاربر
 * (ستون notes). فقط در پنل خوانده و نوشته می‌شود.
 * ⚠️ پیش‌نیاز دیپلوی: مایگریشن 0016 روی Supabase اجرا شده باشد.
 */
export async function updateLeadAdminNotes(id: string, adminNotes: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const notes = adminNotes.trim();
  await db
    .update(leadRequests)
    .set({ adminNotes: notes || null })
    .where(eq(leadRequests.id, id));
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'lead.admin_notes',
    entity: 'lead_requests',
    entityId: id,
    reasonFa: 'ثبت یادداشت ادمین',
  });
  revalidatePath('/admin/leads');
  return { ok: true };
}

/**
 * عملیات گروهی لیدها (L6): تغییر وضعیت گروهی و/یا تخصیص گروهی مسئول پیگیری.
 * دست‌کم یکی از status یا assignee باید داده شود.
 */
export async function bulkUpdateLeads(ids: string[], patch: { status?: LeadStatus; assignee?: string }) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const valid = ids.filter((id) => typeof id === 'string' && id.length > 0);
  if (valid.length === 0) throw new Error('هیچ درخواستی انتخاب نکرده‌اید.');
  if (patch.status === undefined && patch.assignee === undefined) {
    throw new Error('چیزی برای اعمال انتخاب نکرده‌اید.');
  }
  await db
    .update(leadRequests)
    .set({
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.assignee !== undefined ? { assignee: patch.assignee } : {}),
    })
    .where(inArray(leadRequests.id, valid));
  const what: string[] = [];
  if (patch.status !== undefined) what.push(`تغییر وضعیت به «${LEAD_STATUS_FA[patch.status]}»`);
  if (patch.assignee !== undefined) what.push(patch.assignee ? `تعیین مسئول: ${patch.assignee}` : 'حذف مسئول پیگیری');
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'lead.status',
    entity: 'lead_requests',
    entityId: `${valid.length} درخواست`,
    reasonFa: `عملیات گروهی (${what.join('، ')})`,
  });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  return { ok: true, count: valid.length };
}
