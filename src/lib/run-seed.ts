import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

/**
 * اجرای فایل db/seed.reference.sql — منطق مشترک بین CLI (`db:seed`)
 * و دکمهٔ «دادهٔ نمونه» در ویزارد راه‌اندازی پنل.
 *
 * تصمیم ثبت‌شده: مقصدها در جدول زندهٔ `site_destinations` نوشته می‌شوند
 * (نه جدول مردهٔ `places`)، و لندینگ‌های seed بلوک و لینک داخلی می‌گیرند
 * تا گیت انتشار را واقعاً رد کنند.
 */
export async function runReferenceSeed(connectionString: string): Promise<void> {
  if (!connectionString) throw new Error('DATABASE_URL تنظیم نشده است.');
  const seedFile = path.join(process.cwd(), 'db', 'seed.reference.sql');
  const sqlText = fs.readFileSync(seedFile, 'utf8');
  const sql = postgres(connectionString, { max: 1 });
  try {
    await sql.unsafe(sqlText);
  } finally {
    await sql.end();
  }
}
