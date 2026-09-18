/**
 * تأیید سلامت DB: جدول‌ها، تعداد ردیف‌ها، و تست واقعی insert/delete روی lead_requests.
 * اجرا: $env:DATABASE_URL="<direct>" ; npx tsx scripts/verify-db.ts
 * خروجی غیرصفر = مشکل.
 */
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[verify-db] DATABASE_URL تنظیم نشده.');
  process.exit(1);
}

const EXPECTED = [
  'places',
  'place_aliases',
  'origin_cities',
  'terminals',
  'carriers',
  'accommodations',
  'services',
  'tour_products',
  'tour_stops',
  'product_origin_cities',
  'product_services',
  'tour_departures',
  'route_segments',
  'accommodation_offers',
  'offer_price_components',
  'seo_landings',
  'seo_landing_products',
  'content_blocks',
  'seo_internal_links',
  'site_settings',
  'audit_logs',
  'lead_requests',
];

const sql = postgres(connectionString, { max: 1, connect_timeout: 15 });
let failures = 0;
try {
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const names = new Set(tables.map((t) => t.tablename as string));
  for (const t of EXPECTED) {
    if (!names.has(t)) {
      console.error(`[FAIL] missing table: ${t}`);
      failures += 1;
    }
  }
  if (failures === 0) console.log(`[OK] all ${EXPECTED.length} tables present.`);

  const origins = await sql`SELECT COUNT(*)::int AS n FROM origin_cities`;
  const landings =
    await sql`SELECT COUNT(*)::int AS n FROM seo_landings WHERE workflow = 'published' AND index_status = 'index'`;
  const settings = await sql`SELECT setting_value FROM site_settings WHERE setting_key = 'site.url'`;
  console.log(`[OK] origin_cities=${origins[0].n} published_landings=${landings[0].n}`);
  console.log(`[OK] site.url=${settings[0]?.setting_value}`);

  // تست واقعی چرخه Lead (insert + delete) — داده تست باقی نمی‌ماند
  const testPhone = '09999999999';
  await sql`DELETE FROM lead_requests WHERE phone = ${testPhone}`;
  const inserted = await sql`
    INSERT INTO lead_requests (full_name, phone, source_path, tour_context)
    VALUES ('تست سلامت', ${testPhone}, '/__health', 'health-check')
    RETURNING id
  `;
  console.log(`[OK] lead insert id=${inserted[0].id}`);
  await sql`DELETE FROM lead_requests WHERE id = ${inserted[0].id}`;
  const left =
    await sql`SELECT COUNT(*)::int AS n FROM lead_requests WHERE phone = ${testPhone}`;
  if (left[0].n !== 0) {
    console.error('[FAIL] test lead not cleaned up');
    failures += 1;
  } else {
    console.log('[OK] lead cycle insert→delete clean.');
  }
} catch (e) {
  console.error('[FAIL] ' + (e instanceof Error ? e.message : String(e)).slice(0, 300));
  failures += 1;
} finally {
  await sql.end();
}

if (failures > 0) {
  console.error(`\nverify-db: ${failures} failure(s).`);
  process.exit(1);
}
console.log('\nverify-db: ALL CHECKS PASSED');
