'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { leadRequests, auditLogs } from '@/db/schema';
import { and, desc, count, eq, ilike, inArray, isNotNull, like, ne, or } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { LEAD_STATUS_FA } from './lead-status';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'invalid';

// ستون‌های صریح (الگوی رفع خطای صفحهٔ لیدها): select همه‌ستونه روی
// دیتابیسی که ستونی را ندارد می‌شکست؛ فقط همین‌ها خوانده می‌شوند.
const LEAD_COLUMNS = {
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
};

export type LeadListRow = {
  id: string;
  fullName: string;
  phone: string;
  sourcePath: string;
  tourContext: string | null;
  destinationHint: string | null;
  passengers: string | null;
  notes: string | null;
  adminNotes: string | null;
  status: LeadStatus;
  assignee: string | null;
  createdAt: Date;
};

export interface LeadsPageParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus | 'all';
  q?: string;
  /** فقط لیدهای تور (صفحهٔ «درخواست‌های رزرو و استعلام تور») */
  tourOnly?: boolean;
}

export interface LeadsPage {
  rows: LeadListRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * صفحه‌بندی سروری واقعی لیدها (میز ۳ — ایراد ۲۵).
 * شمارش کل + offset/limit؛ فیلتر وضعیت و جست‌وجو روی کل دیتا اعمال می‌شوند،
 * نه روی ۲۰۰ ردیف آخر. صفحه از URL می‌آید تا لینک‌پذیر و تازه‌شدنی باشد.
 */
export async function getLeadsPage(params: LeadsPageParams): Promise<LeadsPage> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const pageSize = Math.min(100, Math.max(5, Math.floor(Number(params.pageSize) || 20)));
  const wantedPage = Math.max(1, Math.floor(Number(params.page) || 1));
  const q = (params.q || '').trim().replace(/[%_\\]/g, '');
  const status: LeadStatus | undefined =
    params.status && params.status !== 'all' ? params.status : undefined;

  const conds = [];
  if (status) conds.push(eq(leadRequests.status, status));
  if (q) {
    const needle = `%${q}%`;
    conds.push(
      or(
        ilike(leadRequests.fullName, needle),
        ilike(leadRequests.phone, needle),
        ilike(leadRequests.tourContext, needle),
        ilike(leadRequests.destinationHint, needle),
        ilike(leadRequests.notes, needle),
      ),
    );
  }
  if (params.tourOnly) {
    conds.push(
      or(
        and(isNotNull(leadRequests.tourContext), ne(leadRequests.tourContext, '')),
        like(leadRequests.sourcePath, '%/tour%'),
      ),
    );
  }
  const where = conds.length > 0 ? and(...conds) : undefined;

  const [totalRow] = await db.select({ n: count() }).from(leadRequests).where(where);
  const total = totalRow?.n ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(wantedPage, pageCount);
  const rows = await db
    .select(LEAD_COLUMNS)
    .from(leadRequests)
    .where(where)
    .orderBy(desc(leadRequests.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return {
    rows: rows.map((r) => ({ ...r, status: r.status as LeadStatus })),
    total,
    page,
    pageSize,
    pageCount,
  };
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
  revalidatePath('/admin/tours/leads');
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
  revalidatePath('/admin/tours/leads');
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
  revalidatePath('/admin/tours/leads');
  return { ok: true, count: valid.length };
}
