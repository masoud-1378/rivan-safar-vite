'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteSettings, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export async function getSettings() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(siteSettings);
}

export async function updateSetting(key: string, value: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db
    .update(siteSettings)
    .set({ settingValue: value, updatedAt: new Date() })
    .where(eq(siteSettings.settingKey, key));
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'settings.update',
    entity: 'site_settings',
    entityId: key,
    reasonFa: `تغییر تنظیمات ${key}`,
  });
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function getSiteUrl() {
  const db = getDb();
  if (!db) return 'https://rivansafar.ir';
  const row = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, 'site.url')).limit(1);
  return row[0]?.settingValue || 'https://rivansafar.ir';
}