'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteSettings, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { settingDef, validateSetting, withDefaults, SETTINGS_REGISTRY } from '@/src/lib/settings';

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

/**
 * ذخیرهٔ گروهی تنظیمات یک تب (ST2): همهٔ کلیدهای کثیف در یک فراخوان.
 * خطای هر فیلد جداگانه برمی‌گردد تا زیر همان فیلد نمایش داده شود.
 */
export async function updateSettings(
  entries: Array<{ key: string; value: string }>,
): Promise<{ ok: boolean; saved: string[]; errors: Record<string, string> }> {
  const saved: string[] = [];
  const errors: Record<string, string> = {};
  for (const { key, value } of entries) {
    try {
      await updateSetting(key, value);
      saved.push(key);
    } catch (e) {
      errors[key] = e instanceof Error ? e.message : 'خطا در ذخیرهٔ تنظیمات.';
    }
  }
  return { ok: Object.keys(errors).length === 0, saved, errors };
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const db = getDb();
  // SEC-10: کلیدهای ownerOnly (مثل site.maintenance) نباید بدون لاگین لو بروند؛
  // خروجی عمومی فقط از روی رجیستری و بدون آن کلیدها ساخته می‌شود.
  const publicDefs = SETTINGS_REGISTRY.filter((d) => !d.ownerOnly);
  const build = (rows: Array<{ settingKey: string; settingValue: string }>) => {
    const merged = withDefaults(rows);
    const out: Record<string, string> = {};
    for (const d of publicDefs) out[d.key] = merged[d.key];
    return out;
  };
  if (!db) return build([]);
  try {
    const rows = await db.select().from(siteSettings);
    return build(rows);
  } catch {
    return build([]);
  }
}
