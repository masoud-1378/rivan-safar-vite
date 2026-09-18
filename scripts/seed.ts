/**
 * اجرای Seed مرجع (فقط Draft و داده مرجع — بدون قیمت/ظرفیت واقعی).
 * اجرا: $env:DATABASE_URL="<direct>" ; npx tsx scripts/seed.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[db:seed] DATABASE_URL تنظیم نشده.');
  process.exit(1);
}

const seedFile = path.join(process.cwd(), 'db', 'seed.reference.sql');
const sqlText = fs.readFileSync(seedFile, 'utf8');

const sql = postgres(connectionString, { max: 1 });
try {
  console.log('[db:seed] applying seed.reference.sql ...');
  await sql.unsafe(sqlText);
  console.log('[db:seed] done.');
} finally {
  await sql.end();
}
