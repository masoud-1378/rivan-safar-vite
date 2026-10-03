'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { media } from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';
import { and, desc, eq, isNull } from 'drizzle-orm';
import {
  ALLOWED_IMAGE_EXTS,
  IMAGE_UPLOAD_BUCKET,
  assertUploadImage,
  cleanStorageSlug,
  storagePathInBucket,
} from '@/src/lib/upload-policy';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';

/**
 * افزودن عکس هتل با لینک دستی (موج ۵): همان اعتباری که MediaField می‌سنجد؛
 * ردیف media با همان source ساخته می‌شود تا فهرست یکدست بماند.
 */
export async function addHotelPhotoByLink(
  slug: string,
  nameFa: string,
  url: string,
): Promise<HotelPhoto> {
  await requireAdmin(['owner', 'editor']);
  assertRenderableImageUrl(url);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const [row] = await db
    .insert(media)
    .values({ url: url.trim(), altFa: `عکس ${nameFa}`, source: sourceFor(slug) })
    .returning({ id: media.id, url: media.url, altFa: media.altFa });
  return { id: row.id, url: row.url, altFa: row.altFa };
}

/**
 * عکس‌های هتل — کتابچه §۳ (فاز ۲): «آپلودر عکس هتل، عکس را ذخیره نمی‌کند».
 *
 * قرارداد ذخیره:
 * - بایت فایل در Supabase Storage باکت `hotel-photos` (عمومی) می‌نشیند؛
 *   اگر باکت نباشد، همین اکشن با کلید service_role می‌سازدش.
 * - ردیف متادیتا در جدول `media` با `source = 'hotel:<slug>'` ثبت می‌شود.
 * - پیش‌نمایش از URL عمومی واقعی سرو می‌شود، نه رشتهٔ نمایشی.
 */

const BUCKET = IMAGE_UPLOAD_BUCKET;
const MAX_BYTES = 5 * 1024 * 1024;

export interface HotelPhoto {
  id: string;
  url: string;
  altFa: string;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('کلید سرویس سوپابیس تنظیم نشده؛ آپلود عکس ممکن نیست.');
  }
  return createClient(url, key);
}

async function ensureBucket(sb: SupabaseClient) {
  const { data: buckets, error: listError } = await sb.storage.listBuckets();
  if (listError) throw new Error('خطا در بررسی فضای ذخیره‌سازی.');
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await sb.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error('ساخت فضای ذخیرهٔ عکس هتل ناموفق بود.');
  }
}

const sourceFor = (slug: string) => `hotel:${slug}`;

export async function listHotelPhotos(slug: string): Promise<HotelPhoto[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select()
    .from(media)
    .where(and(eq(media.source, sourceFor(slug)), isNull(media.deletedAt)))
    .orderBy(desc(media.createdAt))
    .limit(20);
  return rows.map((r) => ({ id: r.id, url: r.url, altFa: r.altFa }));
}

export async function uploadHotelPhoto(
  slug: string,
  nameFa: string,
  formData: FormData,
): Promise<HotelPhoto> {
  await requireAdmin(['owner', 'editor']);
  const file = formData.get('photo');
  // قرارداد مشترک آپلود تصویر (میز ۳ — ایراد ۲۷): همان سیاست بنر تور؛
  // SVG هم از روی پسوند هم از روی content-type رد می‌شود (ریسک XSS ذخیره‌شده).
  await assertUploadImage(file as File);
  const f = file as File;

  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const sb = serviceClient();
  await ensureBucket(sb);

  // پسوند این‌جا حتماً معتبر است (assertUploadImage ردش کرده) — همان را برای مسیر فایل برمی‌داریم.
  // نامک هم مثل بنر تور تمیز می‌شود تا نویسهٔ نامعتبر وارد مسیر استوریج نشود.
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const path = `${cleanStorageSlug(slug, 'hotel')}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, f, {
    contentType: f.type,
    upsert: false,
  });
  if (uploadError) throw new Error('آپلود عکس ناموفق بود.');

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  const [row] = await db
    .insert(media)
    .values({ url: publicUrl, altFa: `عکس ${nameFa}`, source: sourceFor(slug) })
    .returning({ id: media.id, url: media.url, altFa: media.altFa });
  return { id: row.id, url: row.url, altFa: row.altFa };
}

export async function deleteHotelPhoto(id: string): Promise<{ ok: true }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new Error('عکس پیدا نشد.');
  await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, id));
  // حذف فایل از استوریج؛ اگر نشد، رکورد بایگانی‌شده دیگر نمایش داده نمی‌شود.
  // همان اعتبارسنج سخت‌گیرانهٔ پاک‌سازی بنر تور: فقط همین باکت، فقط زیرمسیرِ
  // همین هتل، فقط URL عمومی استوریج همین پروژه — آدرس دست‌کاری‌شده رد می‌شود.
  try {
    const sb = serviceClient();
    const rawSlug = row.source.startsWith('hotel:') ? row.source.slice('hotel:'.length) : '';
    const path = storagePathInBucket(row.url, BUCKET, `${cleanStorageSlug(rawSlug, 'hotel')}/`);
    if (path) await sb.storage.from(BUCKET).remove([path]);
  } catch {
    /* نادیده — بایگانی منطقی کافی است */
  }
  return { ok: true };
}
