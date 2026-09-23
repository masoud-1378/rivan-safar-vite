import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[seed-hierarchy] DATABASE_URL missing');
  process.exit(1);
}
const sql = postgres(connectionString, { max: 1 });

const regions = [
  { slug: 'middle-east', name: 'خاورمیانه', nameEn: 'Middle East' },
  { slug: 'asia', name: 'آسیا', nameEn: 'Asia' },
  { slug: 'europe', name: 'اروپا', nameEn: 'Europe' },
  { slug: 'domestic', name: 'ایران', nameEn: 'Iran' },
];

const regionOf: Record<string, string> = {
  turkey: 'middle-east', uae: 'middle-east',
  thailand: 'asia', china: 'asia',
  iran: 'domestic',
};

const origins = [
  { slug: 'tehran', nameFa: 'تهران', type: 'city', parent: null },
  { slug: 'karaj', nameFa: 'کرج', type: 'city', parent: null },
  { slug: 'isfahan', nameFa: 'اصفهان', type: 'city', parent: null },
  { slug: 'shiraz', nameFa: 'شیراز', type: 'city', parent: null },
  { slug: 'mashhad-origin', nameFa: 'مشهد', type: 'city', parent: null },
  { slug: 'tabriz', nameFa: 'تبریز', type: 'city', parent: null },
];

try {
  for (const r of regions) {
    await sql`
      INSERT INTO site_destinations (slug, name, name_en, type, category, image, hero_tagline, description, best_season, visa_required, currency, starting_price, starting_price_note, last_verified_at, active_tours_count)
      VALUES (${r.slug}, ${r.name}, ${r.nameEn}, 'region', 'region', '', ${'قاره ' + r.name}, '', '', false, '', '', '', '', 0)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, type = 'region', updated_at = now()
    `;
  }
  console.log('[seed-hierarchy] regions ok');
  for (const [country, region] of Object.entries(regionOf)) {
    await sql`UPDATE site_destinations SET parent_country_slug = ${region} WHERE slug = ${country} AND type = 'country'`;
  }
  console.log('[seed-hierarchy] country parents ok');
  for (const o of origins) {
    await sql`
      INSERT INTO origin_cities (slug, name_fa, type, parent_slug)
      VALUES (${o.slug}, ${o.nameFa}, ${o.type}, ${o.parent})
      ON CONFLICT (slug) DO UPDATE SET name_fa = EXCLUDED.name_fa, type = EXCLUDED.type
    `;
  }
  console.log('[seed-hierarchy] origins ok');
} finally {
  await sql.end();
}
