'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import {
  adminUsers,
  accommodations,
  contentBlocks,
  exhibitions,
  guides,
  originCities,
  seoInternalLinks,
  seoLandings,
  siteDestinations,
  siteTours,
} from '@/db/schema';
import { desc, eq, isNotNull } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { requireAdmin } from '@/src/lib/admin-auth';
import { hardDeleteOne, restoreOne, type ArchivableTable } from '@/src/lib/archive';
import { assertUserChangeAllowed } from '@/src/lib/user-guards';

interface EntityMeta {
  key: string;
  label: string;
  table: ArchivableTable;
  titleCol: AnyPgColumn;
  /** برای جدول‌های فرزند (بلوک/لینک): عنوان لندینگِ والد را هم از جوین می‌گیریم. */
  parentTable?: ArchivableTable;
  parentIdCol?: AnyPgColumn;
  parentTitleCol?: AnyPgColumn;
}

const ENTITIES: EntityMeta[] = [
  { key: 'site_tours', label: 'تورها', table: siteTours, titleCol: siteTours.title },
  { key: 'site_destinations', label: 'مقصدها', table: siteDestinations, titleCol: siteDestinations.name },
  { key: 'origin_cities', label: 'مبدأها', table: originCities, titleCol: originCities.nameFa },
  { key: 'accommodations', label: 'هتل‌ها', table: accommodations, titleCol: accommodations.nameFa },
  { key: 'seo_landings', label: 'لندینگ‌های سئو', table: seoLandings, titleCol: seoLandings.titleFa },
  { key: 'guides', label: 'راهنماها', table: guides, titleCol: guides.titleFa },
  { key: 'exhibitions', label: 'نمایشگاه‌ها', table: exhibitions, titleCol: exhibitions.titleFa },
  { key: 'content_blocks', label: 'بلوک‌های محتوایی', table: contentBlocks, titleCol: contentBlocks.blockKind, parentTable: seoLandings, parentIdCol: contentBlocks.landingId, parentTitleCol: seoLandings.titleFa },
  { key: 'seo_internal_links', label: 'لینک‌های داخلی', table: seoInternalLinks, titleCol: seoInternalLinks.anchorFa, parentTable: seoLandings, parentIdCol: seoInternalLinks.fromLandingId, parentTitleCol: seoLandings.titleFa },
  { key: 'admin_users', label: 'کاربران', table: adminUsers, titleCol: adminUsers.email },
];

export interface ArchivedRow {
  id: string;
  title: string;
  /** برچسب والد برای فرزندها، مثل «لندینگ: …» */
  subtitle?: string;
  archivedAt: string;
}

export interface ArchivedGroup {
  key: string;
  label: string;
  rows: ArchivedRow[];
}

/** فهرست همهٔ رکوردهای بایگانی‌شده، به تفکیک موجودیت. */
export async function listArchived(): Promise<ArchivedGroup[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const groups: ArchivedGroup[] = [];
  for (const e of ENTITIES) {
    const rows: Array<{ id: unknown; title: unknown; deletedAt: unknown; parentTitle?: unknown }> =
      e.parentTable && e.parentIdCol && e.parentTitleCol
        ? await db
            .select({ id: e.table.id, title: e.titleCol, deletedAt: e.table.deletedAt, parentTitle: e.parentTitleCol })
            .from(e.table)
            .leftJoin(e.parentTable, eq(e.parentIdCol, e.parentTable.id))
            .where(isNotNull(e.table.deletedAt))
            .orderBy(desc(e.table.deletedAt))
            .limit(200)
        : await db
            .select({ id: e.table.id, title: e.titleCol, deletedAt: e.table.deletedAt })
            .from(e.table)
            .where(isNotNull(e.table.deletedAt))
            .orderBy(desc(e.table.deletedAt))
            .limit(200);
    groups.push({
      key: e.key,
      label: e.label,
      rows: rows.map((r) => ({
        id: String(r.id),
        title: String(r.title ?? '—'),
        subtitle: e.parentTable ? (r.parentTitle ? `لندینگ: ${String(r.parentTitle)}` : 'بدون لندینگ') : undefined,
        archivedAt: r.deletedAt instanceof Date ? r.deletedAt.toISOString() : String(r.deletedAt ?? ''),
      })),
    });
  }
  return groups;
}

/** بازیابی رکورد از بایگانی. */
export async function restoreArchived(entity: string, id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const meta = ENTITIES.find((e) => e.key === entity);
  if (!meta) throw new Error('موجودیت نامعتبر است.');
  if (entity === 'admin_users' && session.role !== 'owner') {
    throw new Error('بازیابی کاربر فقط برای مالک مجاز است.');
  }
  const rows = await db
    .select({ title: meta.titleCol })
    .from(meta.table)
    .where(eq(meta.table.id, id))
    .limit(1);
  const title = String(rows[0]?.title ?? id);
  // فقط خودِ رکورد برمی‌گردد؛ به فرزندها دست نمی‌زنیم. فرزندهایی که موقع بایگانی
  // والد hard-delete شده‌اند دیگر نیستند و آن‌هایی که ویراستار عمداً تکی بایگانی
  // کرده بود، سر جای خودشان در بایگانی می‌مانند.
  await restoreOne(db, meta.table, id, {
    actor: session.email,
    entity,
    reasonFa: `بازیابی «${title}» از بایگانی`,
  });
  revalidatePath('/admin/archive');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/guides');
  return { ok: true };
}

/** حذف دائمی از بایگانی — فقط مالک، با هشدار برگشت‌ناپذیری در رابط. */
export async function hardDeleteArchived(entity: string, id: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const meta = ENTITIES.find((e) => e.key === entity);
  if (!meta) throw new Error('موجودیت نامعتبر است.');
  if (entity === 'admin_users') {
    // حذف دائمی کاربر هم «حذف» است؛ نباید آخرین مالک فعال را بی‌صدا از دست داد.
    await assertUserChangeAllowed(db, id, session.email, {
      wouldBeOwner: false,
      wouldBeActive: false,
      verb: 'حذف دائمی',
    });
  }
  const rows = await db
    .select({ title: meta.titleCol })
    .from(meta.table)
    .where(eq(meta.table.id, id))
    .limit(1);
  const title = String(rows[0]?.title ?? id);
  await hardDeleteOne(db, meta.table, id, {
    actor: session.email,
    entity,
    reasonFa: `حذف دائمی «${title}» از بایگانی`,
  });
  revalidatePath('/admin/archive');
  return { ok: true };
}
