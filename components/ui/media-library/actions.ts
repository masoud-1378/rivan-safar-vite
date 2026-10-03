'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { media } from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';
import { and, desc, eq, ilike, isNull, or, type SQL } from 'drizzle-orm';
import {
  IMAGE_UPLOAD_BUCKET,
  assertUploadImage,
  storagePathInBucket,
} from '@/src/lib/upload-policy';
import { mediaKindLabel, mediaStoragePrefix, type MediaListItem } from './types';

/**
 * اکشن‌های سرور کتابخانهٔ رسانه.
 *
 * همان الگوی `tours/banner-upload.ts` و `hotels/photos.ts`، این‌بار عمومی:
 * - آپلود در باکت `hotel-photos` (باکت مشترک عکس‌های پنل)
 * - ردیف متادیتا در جدول `media` با `source` برابر tag (قرارداد `types.ts`)
 * - سیاست فرمت/حجم/SVG از قرارداد مشترک `src/lib/upload-policy.ts`
 *
 * همهٔ اکشن‌ها فقط برای owner/editor.
 */

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
  if (!buckets?.some((b) => b.name === IMAGE_UPLOAD_BUCKET)) {
    const { error: createError } = await sb.storage.createBucket(IMAGE_UPLOAD_BUCKET, {
      public: true,
    });
    if (createError) throw new Error('ساخت فضای ذخیرهٔ عکس ناموفق بود.');
  }
}

/**
 * فهرست رسانه‌ها برای دیالوگ کتابخانه.
 * - `tag` خالی یعنی همه؛ وگرنه فقط ردیف‌هایی با همان source دقیق.
 * - `search` روی متن جایگزین و آدرس می‌گردد.
 * - ردیف‌های بایگانی‌شده (حذف منطقی) برنمی‌گردند.
 */
export async function listMedia(tag?: string, search?: string): Promise<MediaListItem[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const t = (tag || '').trim();
  const q = (search || '').trim();
  const conds: SQL[] = [isNull(media.deletedAt)];
  if (t) conds.push(eq(media.source, t));
  if (q) {
    const hit = or(ilike(media.altFa, `%${q}%`), ilike(media.url, `%${q}%`));
    if (hit) conds.push(hit);
  }
  const rows = await db
    .select({
      id: media.id,
      url: media.url,
      altFa: media.altFa,
      source: media.source,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(and(...conds))
    .orderBy(desc(media.createdAt))
    .limit(60);
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    altFa: r.altFa,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * آپلود تازه با tag مشخص.
 * `altFa` خالی باشد، از برچسب نوع ساخته می‌شود («عکس راهنما»).
 * همان سیاست بنر تور/عکس هتل: فرمت، سقف ۵ مگابایت، رد سه‌لایهٔ SVG.
 */
export async function uploadMedia(
  tag: string,
  altFa: string,
  formData: FormData,
): Promise<MediaListItem> {
  await requireAdmin(['owner', 'editor']);
  const file = formData.get('photo');
  await assertUploadImage(file as File);
  const f = file as File;

  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const sb = serviceClient();
  await ensureBucket(sb);

  const cleanTag = (tag || '').trim() || 'misc';
  // پسوند این‌جا حتماً معتبر است (assertUploadImage ردش کرده).
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const path = `${mediaStoragePrefix(cleanTag)}${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(IMAGE_UPLOAD_BUCKET).upload(path, f, {
    contentType: f.type,
    upsert: false,
  });
  if (uploadError) throw new Error('آپلود عکس ناموفق بود.');

  const {
    data: { publicUrl },
  } = sb.storage.from(IMAGE_UPLOAD_BUCKET).getPublicUrl(path);
  const [row] = await db
    .insert(media)
    .values({
      url: publicUrl,
      altFa: (altFa || '').trim() || `عکس ${mediaKindLabel(cleanTag)}`,
      source: cleanTag,
    })
    .returning({
      id: media.id,
      url: media.url,
      altFa: media.altFa,
      source: media.source,
      createdAt: media.createdAt,
    });
  return {
    id: row.id,
    url: row.url,
    altFa: row.altFa,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * حذف رسانه: اول بایگانی منطقی (دیگر جایی نمایش داده نمی‌شود)، بعد حذف
 * فایل از استوریج. مسیر فایل فقط وقتی پذیرفته می‌شود که واقعاً زیر پیشوند
 * همین tag در همین باکت باشد — آدرس دست‌کاری‌شده رد می‌شود.
 */
export async function deleteMedia(id: string): Promise<{ ok: true }> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new Error('رسانه پیدا نشد.');
  await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, id));
  try {
    const sb = serviceClient();
    const path = row.source
      ? storagePathInBucket(row.url, IMAGE_UPLOAD_BUCKET, mediaStoragePrefix(row.source))
      : null;
    if (path) await sb.storage.from(IMAGE_UPLOAD_BUCKET).remove([path]);
  } catch {
    /* نادیده — بایگانی منطقی کافی است */
  }
  return { ok: true };
}
