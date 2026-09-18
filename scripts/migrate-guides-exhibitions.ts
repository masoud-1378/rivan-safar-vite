/**
 * مهاجرت داده استاتیک راهنماها و نمایشگاه‌ها به DB (یک‌بارمصرف، idempotent با slug).
 * اجرا: $env:DATABASE_URL="<direct>" ; npx tsx scripts/migrate-guides-exhibitions.ts
 */
import postgres from 'postgres';
import { GUIDES } from '../src/data/guidesData';
import { EXHIBITION_SERIES } from '../src/data/exhibitionsData';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[migrate-content] DATABASE_URL تنظیم نشده.');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
try {
  for (const g of Object.values(GUIDES)) {
    await sql`
      INSERT INTO guides (slug, title_fa, category, category_label, read_time, author, reviewer, summary, hero_image, direct_answer, sections, faqs, status)
      VALUES (${g.slug}, ${g.title}, ${g.category}, ${g.categoryLabel}, ${g.readTime}, ${g.author}, ${g.reviewer ?? null}, ${g.summary}, ${g.heroImage}, ${g.directAnswer}, ${JSON.stringify(g.sections)}::jsonb, ${JSON.stringify(g.faqs)}::jsonb, 'published')
      ON CONFLICT (slug) DO UPDATE SET
        title_fa = EXCLUDED.title_fa, summary = EXCLUDED.summary,
        direct_answer = EXCLUDED.direct_answer, sections = EXCLUDED.sections,
        faqs = EXCLUDED.faqs, status = 'published', updated_at = now()
    `;
    console.log('[migrate-content] guide: ' + g.slug);
  }
  for (const s of Object.values(EXHIBITION_SERIES)) {
    await sql`
      INSERT INTO exhibitions (slug, title_fa, title_en, country, city, venue, official_website, industry, hero_tagline, description, image, edition_slug, solar_date, gregorian_date, phases, visa_deadline, hotel_area, starting_price_note, services_included, business_tips, faqs, status)
      VALUES (${s.slug}, ${s.title}, ${s.titleEn ?? null}, ${s.country ?? null}, ${s.city ?? null}, ${s.venue ?? null}, ${s.officialWebsite ?? null}, ${s.industry ?? null}, ${s.heroTagline ?? null}, ${s.description ?? null}, ${s.image ?? null}, ${s.upcomingEdition?.editionSlug ?? null}, ${s.upcomingEdition?.solarDate ?? null}, ${s.upcomingEdition?.gregorianDate ?? null}, ${JSON.stringify(s.upcomingEdition?.phases ?? [])}::jsonb, ${s.upcomingEdition?.visaDeadline ?? null}, ${s.upcomingEdition?.hotelArea ?? null}, ${s.upcomingEdition?.startingPriceNote ?? null}, ${JSON.stringify(s.servicesIncluded ?? [])}::jsonb, ${JSON.stringify(s.businessTips ?? [])}::jsonb, ${JSON.stringify(s.faqs ?? [])}::jsonb, 'published')
      ON CONFLICT (slug) DO UPDATE SET
        title_fa = EXCLUDED.title_fa, description = EXCLUDED.description,
        phases = EXCLUDED.phases, faqs = EXCLUDED.faqs, status = 'published', updated_at = now()
    `;
    console.log('[migrate-content] exhibition: ' + s.slug);
  }
  console.log('[migrate-content] DONE');
} finally {
  await sql.end();
}
