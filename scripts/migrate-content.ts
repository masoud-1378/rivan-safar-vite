/**
 * مهاجرت کامل محتوای استاتیک سایت به PostgreSQL.
 * اجرا: npx tsx --env-file=.env.local scripts/migrate-content.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { SAMPLE_TOURS } from '../src/data/toursData';
import { COUNTRIES, CITIES } from '../src/data/destinationsData';
import { GUIDES } from '../src/data/guidesData';
import { EXHIBITION_SERIES } from '../src/data/exhibitionsData';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('[migrate-content] خطا: DATABASE_URL تنظیم نشده.');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

try {
  console.log('[migrate-content] شروع مهاجرت محتوا...');

  const migrationPath = path.join(process.cwd(), 'db', 'migrations', '0003_content.sql');
  console.log('[migrate-content] [۱/۵] اجرای مایگریشن 0003_content.sql ...');
  await sql.unsafe(fs.readFileSync(migrationPath, 'utf8'));
  const patchPath = path.join(process.cwd(), 'db', 'migrations', '0004_patch_fields.sql');
  if (fs.existsSync(patchPath)) {
    console.log('[migrate-content] اجرای 0004_patch_fields.sql ...');
    await sql.unsafe(fs.readFileSync(patchPath, 'utf8'));
  }

  console.log(`[migrate-content] [۲/۵] درج تورها (${SAMPLE_TOURS.length} تور)...`);
  for (const t of SAMPLE_TOURS) {
    await sql`
      INSERT INTO site_tours (slug, title, type, type_label, destination, origin, route, duration, nights, closest_departure, price, formatted_price, price_note, status, status_label, image, badge, features, visa_required, hotel_stars, airline, included_services, excluded_services, hotel_options, description, updated_at)
      VALUES (${t.id}, ${t.title}, ${t.type}, ${t.typeLabel}, ${t.destination}, ${t.origin}, ${t.route}, ${t.duration}, ${t.nights}, ${t.closestDeparture}, ${t.price}, ${t.formattedPrice}, ${t.priceNote}, ${t.status}, ${t.statusLabel}, ${t.image}, ${t.badge ?? null}, ${JSON.stringify(t.features)}::jsonb, ${t.visaRequired}, ${t.hotelStars}, ${t.airline}, ${JSON.stringify(t.includedServices)}::jsonb, ${JSON.stringify(t.excludedServices)}::jsonb, ${JSON.stringify(t.hotelOptions)}::jsonb, ${t.description}, now())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, type = EXCLUDED.type, type_label = EXCLUDED.type_label,
        destination = EXCLUDED.destination, origin = EXCLUDED.origin, route = EXCLUDED.route,
        duration = EXCLUDED.duration, nights = EXCLUDED.nights, closest_departure = EXCLUDED.closest_departure,
        price = EXCLUDED.price, formatted_price = EXCLUDED.formatted_price, price_note = EXCLUDED.price_note,
        status = EXCLUDED.status, status_label = EXCLUDED.status_label, image = EXCLUDED.image,
        badge = EXCLUDED.badge, features = EXCLUDED.features, visa_required = EXCLUDED.visa_required,
        hotel_stars = EXCLUDED.hotel_stars, airline = EXCLUDED.airline,
        included_services = EXCLUDED.included_services, excluded_services = EXCLUDED.excluded_services,
        hotel_options = EXCLUDED.hotel_options, description = EXCLUDED.description, updated_at = now()
    `;
    console.log('[migrate-content] تور: ' + t.id);
  }
  console.log(`[migrate-content] تورها تمام شد (${SAMPLE_TOURS.length} رکورد).`);

  const countries = Object.values(COUNTRIES).map((p) => ({ place: p, forcedType: 'country' as const }));
  const cities = Object.values(CITIES).map((p) => ({ place: p, forcedType: 'city' as const }));
  const allPlaces = [...countries, ...cities];
  console.log(`[migrate-content] [۳/۵] درج مقصدها (${countries.length} کشور + ${cities.length} شهر)...`);
  for (const { place: p, forcedType } of allPlaces) {
    await sql`
      INSERT INTO site_destinations (slug, name, name_en, type, parent_country_slug, parent_country_name, category, image, hero_tagline, description, best_season, visa_required, visa_type, flight_duration, currency, starting_price, starting_price_note, last_verified_at, active_tours_count, popular_districts, key_highlights, travel_tips, faqs, related_guides, updated_at)
      VALUES (${p.slug}, ${p.name}, ${p.nameEn}, ${forcedType}, ${p.parentCountrySlug ?? null}, ${p.parentCountryName ?? null}, ${p.category}, ${p.image}, ${p.heroTagline}, ${p.description}, ${p.bestSeason}, ${p.visaRequired}, ${p.visaType ?? null}, ${p.flightDuration ?? null}, ${p.currency}, ${p.startingPrice}, ${p.startingPriceNote}, ${p.lastVerifiedAt}, ${p.activeToursCount}, ${JSON.stringify(p.popularDistricts ?? [])}::jsonb, ${JSON.stringify(p.keyHighlights)}::jsonb, ${JSON.stringify(p.travelTips)}::jsonb, ${JSON.stringify(p.faqs)}::jsonb, ${JSON.stringify(p.relatedGuides ?? [])}::jsonb, now())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, name_en = EXCLUDED.name_en, type = EXCLUDED.type,
        parent_country_slug = EXCLUDED.parent_country_slug, parent_country_name = EXCLUDED.parent_country_name,
        category = EXCLUDED.category, image = EXCLUDED.image, hero_tagline = EXCLUDED.hero_tagline,
        description = EXCLUDED.description, best_season = EXCLUDED.best_season,
        visa_required = EXCLUDED.visa_required, visa_type = EXCLUDED.visa_type,
        flight_duration = EXCLUDED.flight_duration, currency = EXCLUDED.currency,
        starting_price = EXCLUDED.starting_price, starting_price_note = EXCLUDED.starting_price_note,
        last_verified_at = EXCLUDED.last_verified_at, active_tours_count = EXCLUDED.active_tours_count,
        popular_districts = EXCLUDED.popular_districts, key_highlights = EXCLUDED.key_highlights,
        travel_tips = EXCLUDED.travel_tips, faqs = EXCLUDED.faqs,
        related_guides = EXCLUDED.related_guides, updated_at = now()
    `;
    console.log('[migrate-content] مقصد: ' + p.slug);
  }
  console.log(`[migrate-content] مقصدها تمام شد (${allPlaces.length} رکورد).`);

  const guideList = Object.values(GUIDES);
  console.log(`[migrate-content] [۴/۵] درج راهنماها (${guideList.length} راهنما)...`);
  for (const g of guideList) {
    const existing = await sql`SELECT 1 FROM guides WHERE slug = ${g.slug} LIMIT 1`;
    if (existing.length > 0) console.log('[migrate-content] راهنما از قبل موجود است، به‌روزرسانی: ' + g.slug);
    await sql`
      INSERT INTO guides (slug, title_fa, category, category_label, read_time, author, reviewer, summary, hero_image, direct_answer, sections, faqs, related_destination_slug, related_tour_id, status)
      VALUES (${g.slug}, ${g.title}, ${g.category}, ${g.categoryLabel}, ${g.readTime}, ${g.author}, ${g.reviewer ?? null}, ${g.summary}, ${g.heroImage}, ${g.directAnswer}, ${JSON.stringify(g.sections)}::jsonb, ${JSON.stringify(g.faqs)}::jsonb, ${g.relatedDestinationSlug ?? null}, ${g.relatedTourId ?? null}, 'published')
      ON CONFLICT (slug) DO UPDATE SET
        title_fa = EXCLUDED.title_fa, category = EXCLUDED.category,
        category_label = EXCLUDED.category_label, read_time = EXCLUDED.read_time,
        author = EXCLUDED.author, reviewer = EXCLUDED.reviewer, summary = EXCLUDED.summary,
        hero_image = EXCLUDED.hero_image, direct_answer = EXCLUDED.direct_answer,
        sections = EXCLUDED.sections, faqs = EXCLUDED.faqs,
        related_destination_slug = EXCLUDED.related_destination_slug, related_tour_id = EXCLUDED.related_tour_id,
        status = 'published', updated_at = now()
    `;
    console.log('[migrate-content] راهنما: ' + g.slug);
  }
  console.log(`[migrate-content] راهنماها تمام شد (${guideList.length} رکورد).`);

  const exhibitionList = Object.values(EXHIBITION_SERIES);
  console.log(`[migrate-content] [۵/۵] درج نمایشگاه‌ها (${exhibitionList.length} نمایشگاه)...`);
  for (const s of exhibitionList) {
    const existing = await sql`SELECT 1 FROM exhibitions WHERE slug = ${s.slug} LIMIT 1`;
    if (existing.length > 0) console.log('[migrate-content] نمایشگاه از قبل موجود است، به‌روزرسانی: ' + s.slug);
    await sql`
      INSERT INTO exhibitions (slug, title_fa, title_en, country, country_slug, city, city_slug, venue, official_website, industry, industry_slug, hero_tagline, description, image, edition_slug, solar_date, gregorian_date, phases, visa_deadline, hotel_area, starting_price, starting_price_note, services_included, business_tips, faqs, status)
      VALUES (${s.slug}, ${s.title}, ${s.titleEn ?? null}, ${s.country ?? null}, ${s.countrySlug ?? null}, ${s.city ?? null}, ${s.citySlug ?? null}, ${s.venue ?? null}, ${s.officialWebsite ?? null}, ${s.industry ?? null}, ${s.industrySlug ?? null}, ${s.heroTagline ?? null}, ${s.description ?? null}, ${s.image ?? null}, ${s.upcomingEdition?.editionSlug ?? null}, ${s.upcomingEdition?.solarDate ?? null}, ${s.upcomingEdition?.gregorianDate ?? null}, ${JSON.stringify(s.upcomingEdition?.phases ?? [])}::jsonb, ${s.upcomingEdition?.visaDeadline ?? null}, ${s.upcomingEdition?.hotelArea ?? null}, ${s.upcomingEdition?.startingPrice ?? null}, ${s.upcomingEdition?.startingPriceNote ?? null}, ${JSON.stringify(s.servicesIncluded ?? [])}::jsonb, ${JSON.stringify(s.businessTips ?? [])}::jsonb, ${JSON.stringify(s.faqs ?? [])}::jsonb, 'published')
      ON CONFLICT (slug) DO UPDATE SET
        title_fa = EXCLUDED.title_fa, title_en = EXCLUDED.title_en,
        country = EXCLUDED.country, country_slug = EXCLUDED.country_slug,
        city = EXCLUDED.city, city_slug = EXCLUDED.city_slug, venue = EXCLUDED.venue,
        official_website = EXCLUDED.official_website, industry = EXCLUDED.industry,
        industry_slug = EXCLUDED.industry_slug,
        hero_tagline = EXCLUDED.hero_tagline, description = EXCLUDED.description,
        image = EXCLUDED.image, edition_slug = EXCLUDED.edition_slug,
        solar_date = EXCLUDED.solar_date, gregorian_date = EXCLUDED.gregorian_date,
        phases = EXCLUDED.phases, visa_deadline = EXCLUDED.visa_deadline,
        hotel_area = EXCLUDED.hotel_area, starting_price = EXCLUDED.starting_price,
        starting_price_note = EXCLUDED.starting_price_note,
        services_included = EXCLUDED.services_included, business_tips = EXCLUDED.business_tips,
        faqs = EXCLUDED.faqs, status = 'published', updated_at = now()
    `;
    console.log('[migrate-content] نمایشگاه: ' + s.slug);
  }
  console.log(`[migrate-content] نمایشگاه‌ها تمام شد (${exhibitionList.length} رکورد).`);

  console.log('[migrate-content] مهاجرت محتوا با موفقیت به پایان رسید.');
} catch (e) {
  console.error('[migrate-content] خطا: ' + (e instanceof Error ? e.message : String(e)));
  process.exitCode = 1;
} finally {
  await sql.end();
}
