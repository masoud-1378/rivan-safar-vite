'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { leadRequests, auditLogs } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'invalid';

export async function getLeadStats() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(leadRequests).orderBy(desc(leadRequests.createdAt)).limit(200);
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
    reasonFa: `تغییر وضعیت به ${status}`,
  });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  return { ok: true };
}
