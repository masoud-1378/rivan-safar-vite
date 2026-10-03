-- ترک «ویرایشگر محتوای ریوان سفر» — تیم «داده و مایگریشن» (۱۴۰۵/۰۷/۱۱).
-- ستون‌های *_rich برای مهاجرت متن‌های تخت به JSON تایپ‌تپ.
--
-- ⚠️ قاعدهٔ آهنی (درس آتش‌نشانی پروداکشن ۱۴۰۵/۰۷/۱۱): فقط افزایشی.
-- - همهٔ ستون‌ها nullable و بدون پیش‌فرض → هیچ ردیفی بازنویسی نمی‌شود؛
--   کد قدیمی main روی همین DB بی‌صدا کار می‌کند (ستون‌های تازه را نمی‌خواند).
-- - هیچ DROP/ALTER دیگری در این فایل نیست.
--
-- ⚠️ شماره‌گذاری: 0028 و 0029 در درختِ کاری موجودند
-- (0028_tour_flight_details.sql و 0029_seed_carriers.sql — هر دو untracked ولی حاضر)،
-- پس این فایل 0030 است تا تداخل نام پیش نیاید.
--
-- ⚠️ ترتیب استقرار: قبل از استقرار شاخهٔ panel-rebuild روی production اجرا شود.
--
-- قرارداد نام‌گذاری (سند کامل در content-editor/data/NOTES.md):
-- - هر فیلد متنیِ موجود X → ستون تازهٔ X_rich از نوع jsonb و nullable.
-- - محتوای داخل-JSON (بخش‌های راهنما، روزهای تور، FAQها): کلید موازی *_rich
--   داخل همان آبجکت (مثلاً هر بخش راهنما: content → content_rich).
-- - «سوالات پرتکرار سطح تور» و «چرا همین تور» در اسکوپ موج ۳ بودند ولی
--   ترک موج ۳ هنوز ستونی برایشان نساخته (راستی‌آزمایی با git diff روی
--   db/schema.ts و جست‌وجو در TourForm — تاریخ ۱۴۰۵/۰۷/۱۱)؛ پس ستون‌های
--   تازه‌شان همین‌جا تعریف می‌شود. این دو از روز اول روی ویرایشگر تازه‌اند،
--   پس همان ستونِ jsonb محل ذخیرهٔ JSON تایپ‌تپ است.

-- ── تورها ──────────────────────────────────────────────────────────────
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS description_rich jsonb;
-- سوالات پرتکرار سطح تور (تازه — موج ۳): Array<{ question, answer, answer_rich? }>
-- answer_rich: JSON تایپ‌تپِ پاسخ (ویرایشگر سبک).
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS faqs jsonb;
-- چرا همین تور (تازه — موج ۳): سند JSON تایپ‌تپ (ویرایشگر کامل).
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS why_this_tour jsonb;

-- ── مقصدها ─────────────────────────────────────────────────────────────
ALTER TABLE site_destinations ADD COLUMN IF NOT EXISTS description_rich jsonb;

-- ── راهنماها ────────────────────────────────────────────────────────────
ALTER TABLE guides ADD COLUMN IF NOT EXISTS summary_rich jsonb;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS direct_answer_rich jsonb;
-- بخش‌ها (sections: Array<{ heading, content, ... }>) و FAQها
-- (Array<{ question, answer }>) کلید موازی content_rich / answer_rich
-- را داخل همان آبجکت می‌گیرند — در مایگریشن 0031 پر می‌شوند.

-- ── نمایشگاه‌ها ─────────────────────────────────────────────────────────
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS description_rich jsonb;
-- FAQها (Array<{ question, answer }>): کلید موازی answer_rich داخل همان آبجکت.

-- ── بلوک‌های محتوای لندینگ‌ها ────────────────────────────────────────────
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS body_fa_rich jsonb;
