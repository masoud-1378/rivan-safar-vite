'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { media } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import {
  IMAGE_UPLOAD_BUCKET,
  IMAGE_UPLOAD_MAX_BYTES,
  assertUploadImage,
  storagePathInBucket,
} from '@/src/lib/upload-policy';

/**
 * بنر تور (T6) — الگوی آپلود عکس هتل (app/admin/(dashboard)/hotels/photos.ts):
 * باکت همان `hotel-photos` است (قابل استفادهٔ مجدد)؛ ردیف متادیتا با
 * `source = 'tour:<slug>'` در جدول media ثبت می‌شود تا از عکس‌های هتل جدا بماند.
 * URL عمومی برگردانده می‌شود و در فیلد image تور می‌نشیند.
 *
 * سیاست فرمت/حجم از قرارداد مشترک `src/lib/upload-policy.ts` می‌آید
 * (میز ۳ — ایراد ۲۷: همان قانونِ رد SVG که آپلودر هتل هم از آن می‌خواند).
 */

const BUCKET = IMAGE_UPLOAD_BUCKET;
const MAX_BYTES = IMAGE_UPLOAD_MAX_BYTES;
/** بنرها همیشه زیر این پیشوند می‌نشینند؛ پاک‌سازی فقط همین‌جا را لمس می‌کند. */
const BANNER_PREFIX = 'tours/';

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
    if (createError) throw new Error('ساخت فضای ذخیرهٔ عکس ناموفق بود.');
  }
}

export async function uploadTourBanner(
  slug: string,
  title: string,
  formData: FormData,
): Promise<{ url: string; mediaId: string | null }> {
  await requireAdmin(['owner', 'editor']);
  const file = formData.get('photo');
  // قرارداد مشترک آپلود تصویر (ایراد ۲۷): فرمت/حجم/SVG همین‌جا سنجیده می‌شود.
  assertUploadImage(file as File);
  const f = file as File;

  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const sb = serviceClient();
  await ensureBucket(sb);

  const cleanSlug = (slug || 'tour').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'tour';
  // پسوند این‌جا حتماً معتبر است (assertUploadImage ردش کرده).
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const path = `${BANNER_PREFIX}${cleanSlug}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, f, {
    contentType: f.type,
    upsert: false,
  });
  if (uploadError) throw new Error('بنر آپلود نشد.');

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  const [row] = await db
    .insert(media)
    .values({
      url: publicUrl,
      altFa: `بنر تور ${title || cleanSlug}`,
      source: `tour:${cleanSlug}`,
    })
    .returning({ id: media.id });
  return { url: publicUrl, mediaId: row?.id ?? null };
}

/**
 * پاک‌سازی بنر جایگزین‌شده (میز ۳ — ایراد ۲۶).
 *
 * وقتی بنر تور با موفقیت عوض و ذخیره شد، فایل قبلی در باکت یتیم می‌ماند.
 * این تابع فقط وقتی صدا زده می‌شود که رکورد تور دیگر به آدرس قبلی اشاره
 * نکند (یعنی در saveTour، بعد از ثبت image تازه) و با احتیاط کامل:
 * - فقط همین باکت (`hotel-photos`)، فقط همین پیشوند (`tours/`)
 * - فقط آدرس‌هایی که واقعاً URL عمومی استوریج همین پروژه‌اند
 * - ردیف‌های media همان آدرس هم بایگانی منطقی می‌شوند
 * اگر حذف فایل از استوریج نشد، بایگانی منطقیِ ردیف کافی است (دیگر جایی نمایش داده نمی‌شود).
 */
export async function cleanupReplacedBanner(oldUrl: string): Promise<void> {
  const path = storagePathInBucket(oldUrl, BUCKET, BANNER_PREFIX);
  if (!path) return;
  const db = getDb();
  if (!db) return;
  try {
    const sb = serviceClient();
    await sb.storage.from(BUCKET).remove([path]);
  } catch {
    /* نادیده — بایگانی منطقی کافی است */
  }
  try {
    const rows = await db
      .select({ id: media.id })
      .from(media)
      .where(and(eq(media.url, (oldUrl || '').trim()), isNull(media.deletedAt)));
    for (const r of rows) {
      await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, r.id));
    }
  } catch {
    /* نادیده */
  }
}
