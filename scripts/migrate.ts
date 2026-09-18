/**
 * اجرای Migration روی PostgreSQL واقعی.
 * اجرا: $env:DATABASE_URL="postgres://..." ; npm run db:migrate
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[db:migrate] DATABASE_URL تنظیم نشده. اتصال واقعی برقرار نشد.');
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

const sql = postgres(connectionString, { max: 1 });
try {
  for (const file of files) {
    const full = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`[db:migrate] applying ${file} ...`);
    await sql.unsafe(full);
  }
  console.log('[db:migrate] done.');
} finally {
  await sql.end();
}
