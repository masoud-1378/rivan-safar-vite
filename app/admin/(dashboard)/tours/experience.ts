'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { media, tourLeaders } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import {
  IMAGE_UPLOAD_BUCKET,
  assertUploadImage,
  storagePathInBucket,
} from '@/src/lib/upload-policy';

/**
 * موج ۴ — تورلیدر، نظر مسافران، گالری واقعی (۱۴۰۵/۰۷/۱۱).
 *
 * لیدرها جدول جدا دارند چون هر حرکت عوض می‌شوند و بین تورها مشترک‌اند؛
 * تور فقط leader_id را نگه می‌دارد (nullable — تور بی‌لیدر معتبر است).
 * نظرها در tour_reviews با پرچم is_visible ذخیره می‌شوند؛ گالری آرایهٔ
 * [{url, caption}] در ستون gallery خود تور است.
 */

import type {
  LeaderInput,
  LeaderJoinMode,
  TourGalleryItem,
  TourLeaderItem,
  TourReviewItem,
} from './experience-types';

export type { LeaderInput, LeaderJoinMode, TourGalleryItem, TourLeaderItem, TourReviewItem };

function toLeaderItem(r: typeof tourLeaders.$inferSelect): TourLeaderItem {
  return {
    id: r.id,
    name: r.name ?? '',
    photo: r.photo ?? '',
    bio: r.bio ?? '',
    languages: r.languages ?? '',
    joinMode: r.joinMode === 'at_destination' ? 'at_destination' : 'from_origin',
  };
}

export async function listLeaders(): Promise<TourLeaderItem[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(tourLeaders).orderBy(asc(tourLeaders.name)).limit(500);
  return rows.map(toLeaderItem);
}

function cleanLeaderInput(input: LeaderInput): Omit<LeaderInput, 'joinMode'> & { joinMode: LeaderJoinMode } {
  const name = (input.name || '').trim();
  if (name.length < 2) throw new Error('نام تورلیدر لازم است.');
  return {
    name,
    photo: (input.photo || '').trim(),
    bio: (input.bio || '').trim(),
    languages: (input.languages || '').trim(),
    joinMode: input.joinMode === 'at_destination' ? 'at_destination' : 'from_origin',
  };
}

export async function createLeader(
  input: LeaderInput,
): Promise<{ ok: true; leader: TourLeaderItem } | { ok: false; error: string }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return { ok: false, error: 'اتصال به دیتابیس برقرار نیست.' };
  let clean: ReturnType<typeof cleanLeaderInput>;
  try {
    clean = cleanLeaderInput(input);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'ورودی معتبر نیست.' };
  }
  const [row] = await db
    .insert(tourLeaders)
    .values({ ...clean, updatedAt: new Date() })
    .returning();
  return { ok: true, leader: toLeaderItem(row) };
}

export async function updateLeader(
  id: string,
  input: LeaderInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return { ok: false, error: 'اتصال به دیتابیس برقرار نیست.' };
  let clean: ReturnType<typeof cleanLeaderInput>;
  try {
    clean = cleanLeaderInput(input);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'ورودی معتبر نیست.' };
  }
  await db.update(tourLeaders).set({ ...clean, updatedAt: new Date() }).where(eq(tourLeaders.id, id));
  return { ok: true };
}

/**
 * حذف لیدر فقط وقتی که هیچ توری به او اشاره نکند؛ وگرنه پیام صادقانه
 * می‌گوید اول لیدر تورها را عوض کنید (حذف بی‌صدا، دادهٔ تور را یتیم نمی‌کند).
 */
export async function deleteLeader(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return { ok: false, error: 'اتصال به دیتابیس برقرار نیست.' };
  const { siteTours } = await import('@/db/schema');
  const used = await db
    .select({ id: siteTours.id })
    .from(siteTours)
    .where(eq(siteTours.leaderId, id))
    .limit(1);
  if (used.length > 0) {
    return { ok: false, error: 'این لیدر به توری وصل است؛ اول لیدر آن تور را عوض کنید.' };
  }
  const photo = (await db.select({ photo: tourLeaders.photo }).from(tourLeaders).where(eq(tourLeaders.id, id)).limit(1))[0]?.photo;
  await db.delete(tourLeaders).where(eq(tourLeaders.id, id));
  // عکس لیدر در استورج یتیم نماند (قانون پاک‌سازی دادهٔ تستی).
  if (photo) {
    try {
      await deleteExperiencePhoto(photo);
    } catch {
      /* نادیده */
    }
  }
  return { ok: true };
}

/* ── آپلود عکس (الگوی banner-upload.ts) ── */

const BUCKET = IMAGE_UPLOAD_BUCKET;
const LEADER_PREFIX = 'leaders/';
const GALLERY_PREFIX = 'tours/gallery/';

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('کلید سرویس سوپابیس تنظیم نشده؛ آپلود عکس ممکن نیست.');
  return createClient(url, key);
}

async function ensureBucket(sb: SupabaseClient) {
  const { data: buckets, error: listError } = await sb.storage.listBuckets();
  if (listError) throw new Error('خطا در بررسی فضای ذخیره‌سازی.');
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await sb.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error('ساخت فضای ذخیرهٔ عکس ناموفق بود.');
  }
}

/**
 * آپلود عکس لیدر یا گالری تور. قرارداد فرمت/حجم همان آپلودر بنر است.
 * خروجی: آدرس عمومی که مستقیم در فیلد می‌نشیند.
 */
export async function uploadExperiencePhoto(
  kind: 'leader' | 'gallery',
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return { ok: false, error: 'اتصال به دیتابیس برقرار نیست.' };
  const file = formData.get('photo');
  try {
    await assertUploadImage(file as File);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'فایل معتبر نیست.' };
  }
  const f = file as File;
  const sb = serviceClient();
  try {
    await ensureBucket(sb);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'خطا در فضای ذخیره‌سازی.' };
  }
  const prefix = kind === 'leader' ? LEADER_PREFIX : GALLERY_PREFIX;
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, f, {
    contentType: f.type,
    upsert: false,
  });
  if (uploadError) return { ok: false, error: 'عکس آپلود نشد؛ دوباره تلاش کنید.' };
  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  try {
    await db.insert(media).values({
      url: publicUrl,
      altFa: kind === 'leader' ? 'عکس تورلیدر' : 'عکس گالری تور',
      source: kind === 'leader' ? 'leader:photo' : 'tour-gallery:photo',
    });
  } catch {
    /* ردیف متادیتا حیاتی نیست؛ آدرس برمی‌گردد */
  }
  return { ok: true, url: publicUrl };
}

/**
 * پاک‌سازی عکس حذف‌شده از گالری — فقط همین باکت و همین دو پیشوند، فقط
 * آدرس‌های واقعی همین پروژه (الگوی cleanupReplacedBanner).
 */
export async function deleteExperiencePhoto(url: string): Promise<void> {
  await requireAdmin(['owner', 'editor']);
  const clean = (url || '').trim();
  if (!clean) return;
  const path =
    storagePathInBucket(clean, BUCKET, LEADER_PREFIX) ??
    storagePathInBucket(clean, BUCKET, GALLERY_PREFIX);
  if (!path) return;
  const db = getDb();
  try {
    const sb = serviceClient();
    await sb.storage.from(BUCKET).remove([path]);
  } catch {
    /* نادیده */
  }
  if (!db) return;
  try {
    const { and, isNull } = await import('drizzle-orm');
    const rows = await db
      .select({ id: media.id })
      .from(media)
      .where(and(eq(media.url, clean), isNull(media.deletedAt)));
    for (const r of rows) {
      await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, r.id));
    }
  } catch {
    /* نادیده */
  }
}

