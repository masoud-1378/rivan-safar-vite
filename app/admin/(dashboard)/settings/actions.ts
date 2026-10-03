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
  if (!db) return withDefaults([]);
  try {
    const rows = await db.select().from(siteSettings);
    return withDefaults(rows);
  } catch {
    return withDefaults([]);
  }
}

/* ------------------------------------------------------------------ */
/* قلم ۴ موج ۱ (تصمیم ۴، ۱۴۰۵/۰۷/۱۱): جواب مدیر به سؤال «همه پیش‌نویس»     */
/* ------------------------------------------------------------------ */

const ALL_DRAFT_FALLBACK_KEY = 'tours.all_draft_fallback';

export type AllDraftFallbackAnswer = 'sample' | 'empty';

/**
 * جواب ذخیره‌شدهٔ مدیر. null یعنی هنوز جوابی ثبت نشده (ردیف نیست یا مقدارش
 * 'unanswered' است) — در این حالت پنل همان لحظه از مدیر می‌پرسد، نه این‌که
 * حدس بزند. عمداً از withDefaults استفاده نمی‌شود چون پیش‌فرض 'unanswered'
 * هم یعنی «پرسیده نشده».
 */
export async function getAllDraftFallbackAnswer(): Promise<AllDraftFallbackAnswer | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ settingValue: siteSettings.settingValue })
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, ALL_DRAFT_FALLBACK_KEY))
    .limit(1);
  const v = rows[0]?.settingValue;
  return v === 'sample' || v === 'empty' ? v : null;
}

/**
 * ثبت جواب مدیر به سؤال «همه پیش‌نویس». فقط دو مقدار مجاز است؛
 * 'unanswered' از این مسیر ست نمی‌شود (ریست از صفحهٔ تنظیمات ممکن است).
 */
export async function setAllDraftFallbackAnswer(
  answer: AllDraftFallbackAnswer,
): Promise<{ ok: true }> {
  if (answer !== 'sample' && answer !== 'empty') {
    throw new Error('پاسخ نامعتبر است.');
  }
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const existing = await db
    .select({ settingKey: siteSettings.settingKey })
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, ALL_DRAFT_FALLBACK_KEY))
    .limit(1);
  if (existing.length === 0) {
    await db
      .insert(siteSettings)
      .values({ settingKey: ALL_DRAFT_FALLBACK_KEY, settingValue: answer });
  } else {
    await db
      .update(siteSettings)
      .set({ settingValue: answer, updatedAt: new Date() })
      .where(eq(siteSettings.settingKey, ALL_DRAFT_FALLBACK_KEY));
  }
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'settings.update',
    entity: 'site_settings',
    entityId: ALL_DRAFT_FALLBACK_KEY,
    reasonFa:
      answer === 'sample'
        ? 'انتخاب مدیر: وقتی هیچ توری منتشر نیست، تور نمونه نمایش داده شود'
        : 'انتخاب مدیر: وقتی هیچ توری منتشر نیست، صفحه خالی بماند',
  });
  revalidatePath('/admin/tours');
  revalidatePath('/admin/settings');
  revalidatePath('/tours');
  revalidatePath('/tours/domestic');
  revalidatePath('/tours/foreign');
  revalidatePath('/');
  return { ok: true };
}
