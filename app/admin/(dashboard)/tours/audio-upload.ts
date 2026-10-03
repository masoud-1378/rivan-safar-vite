'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/src/lib/admin-auth';
import { IMAGE_UPLOAD_BUCKET, cleanStorageSlug } from '@/src/lib/upload-policy';

/**
 * فایل صوتی معرفی تور (موج ۵): مشاور می‌تواند به‌جای لینک دستی،
 * فایل صوتی را از دستگاه آپلود کند. الگوی banner-upload.ts.
 */
const BUCKET = IMAGE_UPLOAD_BUCKET;
const AUDIO_PREFIX = 'tours/audio/';
const AUDIO_MAX_BYTES = 20 * 1024 * 1024; // ۲۰ مگابایت
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'ogg'] as const;
const AUDIO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
};

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('تنظیمات آپلود کامل نیست؛ موضوع را به تیم فنی بگویید.');
  return createClient(url, key);
}

async function ensureBucket(sb: SupabaseClient) {
  const { data: buckets, error: listError } = await sb.storage.listBuckets();
  if (listError) throw new Error('مشکلی در آپلود پیش آمد؛ اگر تکرار شد به تیم فنی بگویید.');
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await sb.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error('مشکلی در آپلود پیش آمد؛ اگر تکرار شد به تیم فنی بگویید.');
  }
}

export async function uploadConsultantAudio(
  slug: string,
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin(['owner', 'editor']);
  const file = formData.get('audio');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'فایلی انتخاب نکردید.' };
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!(AUDIO_EXTS as readonly string[]).includes(ext)) {
    return { ok: false, error: 'فرمت صوتی مجاز نیست؛ فقط mp3، wav، m4a یا ogg.' };
  }
  if (file.size > AUDIO_MAX_BYTES) {
    return { ok: false, error: 'حداکثر حجم فایل صوتی ۲۰ مگابایت است.' };
  }
  const sb = serviceClient();
  try {
    await ensureBucket(sb);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'مشکلی در آپلود پیش آمد؛ اگر تکرار شد به تیم فنی بگویید.' };
  }
  const path = `${AUDIO_PREFIX}${cleanStorageSlug(slug, 'tour')}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file, {
    contentType: AUDIO_MIME[ext] ?? file.type,
    upsert: false,
  });
  if (uploadError) return { ok: false, error: 'فایل صوتی آپلود نشد؛ دوباره تلاش کنید.' };
  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
