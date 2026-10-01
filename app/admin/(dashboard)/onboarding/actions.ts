'use server';

import { getDb } from '@/db/client';
import { originCities, seoLandings, siteDestinations, siteSettings, siteTours } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { requireAdmin } from '@/src/lib/admin-auth';
import { runReferenceSeed } from '@/src/lib/run-seed';

/**
 * ویزارد «راه‌اندازی در ۵ قدم» — فقط در اولین ورود هر کاربر بالای داشبورد.
 * وضعیت «اولین ورود» per-user در site_settings نگه داشته می‌شود
 * (کلید `onboarding.<email>`)؛ ستون جدیدی به اسکیما اضافه نشده است.
 */

const keyFor = (email: string) => `onboarding.${email}`;

async function countRows(db: NonNullable<ReturnType<typeof getDb>>, table: PgTable) {
  const rows = await db.select({ n: count() }).from(table);
  return Number(rows[0]?.n ?? 0);
}

export interface OnboardingState {
  completed: boolean;
  isOwner: boolean;
  email: string;
  counts: { destinations: number; origins: number; tours: number; landings: number };
}

export async function getOnboardingState(): Promise<OnboardingState> {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const key = keyFor(session.email);
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  const completed = rows[0]?.settingValue === '1';
  const [destinations, origins, tours, landings] = await Promise.all([
    countRows(db, siteDestinations),
    countRows(db, originCities),
    countRows(db, siteTours),
    countRows(db, seoLandings),
  ]);
  return { completed, isOwner: session.role === 'owner', email: session.email, counts: { destinations, origins, tours, landings } };
}

/** علامت‌گذاری پایان راه‌اندازی برای کاربر جاری. */
export async function completeOnboarding(): Promise<void> {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const key = keyFor(session.email);
  const rows = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  if (rows.length > 0) {
    await db.update(siteSettings).set({ settingValue: '1' }).where(eq(siteSettings.id, rows[0].id));
  } else {
    await db.insert(siteSettings).values({ settingKey: key, settingValue: '1' });
  }
}

/**
 * اجرای دادهٔ نمونه — فقط مالک.
 *
 * گارد یافتهٔ ۲: هر سه INSERT…SELECT انتهاییِ db/seed.reference.sql فقط روی
 * url_pathهای خودِ seed محدود شده‌اند (WHERE url_path IN (...))، پس حتی اگر
 * لندینگی خارج از seed وجود داشته باشد، seed به آن لینک/بلوک اضافه نمی‌کند؛
 * فقط رکوردهای گمشدهٔ خودش را می‌سازد (بقیهٔ INSERTها هم ON CONFLICT DO NOTHING اند).
 */
export async function runSampleSeed(): Promise<{ ok: true }> {
  await requireAdmin(['owner']);
  await runReferenceSeed(process.env.DATABASE_URL || '');
  return { ok: true };
}
