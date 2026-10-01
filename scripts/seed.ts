/**
 * اجرای Seed مرجع (فقط Draft و داده مرجع — بدون قیمت/ظرفیت واقعی).
 * اجرا: $env:DATABASE_URL="<direct>" ; npx tsx scripts/seed.ts
 *
 * منطق اجرا در src/lib/run-seed.ts مشترک است تا دکمهٔ «دادهٔ نمونه»
 * در پنل هم دقیقاً همین seed را اجرا کند.
 */
import { runReferenceSeed } from '../src/lib/run-seed';

const connectionString = process.env.DATABASE_URL || '';

try {
  console.log('[db:seed] applying seed.reference.sql ...');
  await runReferenceSeed(connectionString);
  console.log('[db:seed] done.');
} catch (e) {
  console.error('[db:seed]', e instanceof Error ? e.message : e);
  process.exit(1);
}
