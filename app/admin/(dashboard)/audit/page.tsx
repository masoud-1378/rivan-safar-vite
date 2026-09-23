import type { Metadata } from 'next';
import { getDb } from '@/db/client';
import { auditLogs } from '@/db/schema';
import { desc, count } from 'drizzle-orm';
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
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const raw = parseInt((await searchParams).page || '1', 10);
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;
  const offset = (page - 1) * PER_PAGE;

  const [total] = await db.select({ n: count() }).from(auditLogs);
  const totalPages = Math.max(1, Math.ceil(total.n / PER_PAGE));
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  return (
    <AuditLog
      logs={rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }))}
      page={Math.min(page, totalPages)}
      totalPages={totalPages}
      total={total.n}
    />
  );
}
