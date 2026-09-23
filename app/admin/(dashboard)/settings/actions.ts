'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteSettings, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { settingDef, validateSetting, withDefaults } from '@/src/lib/settings';

export async function getSettings() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(siteSettings);
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  await requireAdmin(['owner', 'editor']);
  const rows = await getSettings();
  return withDefaults(rows);
}

export async function updateSetting(key: string, value: string, reason?: string) {
  const def = settingDef(key);
  if (!def) throw new Error('کلید تنظیمات ناشناخته است.');
  const roles = def.ownerOnly ? (['owner'] as const) : (['owner', 'editor'] as const);
  const session = await requireAdmin([...roles]);
  const err = validateSetting(key, value);
  if (err) throw new Error(err);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(siteSettings).values({ settingKey: key, settingValue: value });
  } else {
    await db
      .update(siteSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(siteSettings.settingKey, key));
  }
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'settings.update',
    entity: 'site_settings',
    entityId: key,
    reasonFa: reason?.slice(0, 500) || `تغییر تنظیمات ${def.label}`,
  });
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function getSiteUrl() {
  const db = getDb();
  if (!db) return 'https://rivansafar.ir';
  const row = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, 'site.url'))
    .limit(1);
  return row[0]?.settingValue || 'https://rivansafar.ir';
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const db = getDb();
  if (!db) return withDefaults([]);
  try {
    const rows = await db.select().from(siteSettings);
    return withDefaults(rows);
  } catch {
    return withDefaults([]);
  }
}
