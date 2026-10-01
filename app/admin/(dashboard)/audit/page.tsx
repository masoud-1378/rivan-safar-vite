import type { Metadata } from 'next';
import { getDb } from '@/db/client';
import { auditLogs } from '@/db/schema';
import { and, desc, count, eq, ilike } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import AuditLog from './AuditLog';

export const metadata: Metadata = {
  title: 'گزارش تغییرات | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

const PER_PAGE = 30;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string; actor?: string }>;
}) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const sp = await searchParams;
  const raw = parseInt(sp.page || '1', 10);
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;
  const offset = (page - 1) * PER_PAGE;

  const entity = sp.entity?.trim() || undefined;
  const actor = sp.actor?.trim() || undefined;

  const conds = [
    entity ? eq(auditLogs.entity, entity) : undefined,
    actor ? ilike(auditLogs.actor, `%${actor}%`) : undefined,
  ].filter((c) => c !== undefined);
  const where = conds.length > 0 ? and(...conds) : undefined;

  const [total] = await db.select({ n: count() }).from(auditLogs).where(where);
  const totalPages = Math.max(1, Math.ceil(total.n / PER_PAGE));
  const rows = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  return (
    <AuditLog
      logs={rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }))}
      page={Math.min(page, totalPages)}
      totalPages={totalPages}
      total={total.n}
      filters={{ entity: entity ?? '', actor: actor ?? '' }}
    />
  );
}
