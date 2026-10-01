'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { media } from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';

/**
 * بنر تور (T6) — الگوی آپلود عکس هتل (app/admin/(dashboard)/hotels/photos.ts):
 * باکت همان `hotel-photos` است (قابل استفادهٔ مجدد)؛ ردیف متادیتا با
 * `source = 'tour:<slug>'` در جدول media ثبت می‌شود تا از عکس‌های هتل جدا بماند.
 * URL عمومی برگردانده می‌شود و در فیلد image تور می‌نشیند.
 */

const BUCKET = 'hotel-photos';
const MAX_BYTES = 5 * 1024 * 1024;
// F4: allowlist پسوند — فقط فرمت‌های عکسیِ امن (بستن ریسک SVG).
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
// SEC-06: contentType هرگز از file.type (قابل جعل) خوانده نمی‌شود؛ از پسوند
// تأییدشدهٔ بالا مشتق می‌شود.
const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

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
): Promise<{ url: string }> {
  await requireAdmin(['owner', 'editor']);
  const file = formData.get('photo');
  if (!(file instanceof File) || file.size === 0) throw new Error('فایلی انتخاب نشده است.');
  if (!file.type.startsWith('image/')) throw new Error('فقط فایل تصویری مجاز است.');
  if (file.size > MAX_BYTES) throw new Error('حجم عکس نباید از ۵ مگابایت بیشتر باشد.');

  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const sb = serviceClient();
  await ensureBucket(sb);

  const cleanSlug = (slug || 'tour').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'tour';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) {
    throw new Error('فرمت عکس مجاز نیست؛ فقط jpg، png، webp یا gif.');
  }
  const path = `tours/${cleanSlug}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file, {
    contentType: EXT_MIME[ext],
    upsert: false,
  });
  if (uploadError) throw new Error('بنر آپلود نشد.');

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  await db.insert(media).values({
    url: publicUrl,
    altFa: `بنر تور ${title || cleanSlug}`,
    source: `tour:${cleanSlug}`,
  });
  return { url: publicUrl };
}
