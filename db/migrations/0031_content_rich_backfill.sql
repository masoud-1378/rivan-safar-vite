-- ترک «ویرایشگر محتوای ریوان سفر» — تیم «داده و مایگریشن» (۱۴۰۵/۰۷/۱۱).
-- تبدیل انبوه متن‌های تخت به JSON تایپ‌تپ — به دستور مسعود: «متن‌های قدیمی
-- همان حالا به‌صورت انبوه به JSON تمیز تایپ‌تپ تبدیل شوند (نه با اولین ویرایش)».
--
-- ⚠️ قاعدهٔ آهنی (درس آتش‌نشانی پروداکشن ۱۴۰۵/۰۷/۱۱): فقط افزایشی.
-- - فقط ستون‌های *_rich تازه (مایگریشن 0030) پر می‌شوند و فقط کلیدهای
--   تازهٔ *_rich داخل آبجکت‌های JSON اضافه می‌شود.
-- - هیچ ستون/کلید قدیمی خوانده‌شده توسط کد main دست نمی‌خورد و حذف نمی‌شود.
-- - قالب ذخیرهٔ فعلیِ هر ستون حفظ می‌شود: اگر مقدار رشته-کدشده است
--   (مثل sections/faqs راهنماها)، همان رشته-کدشده می‌ماند و فقط داخلش
--   کلید تازه اضافه می‌شود. رفتار کد قدیمی ذره‌ای عوض نمی‌شود.
-- - فقط متن‌های غیرخالی تبدیل می‌شوند؛ ردیف‌های خالی NULL می‌مانند.
--
-- شمارش‌های قبل/بعد (پروب فقط-خواندنی روی DB واقعی، ۱۴۰۵/۰۷/۱۱):
--   site_tours:                ۱۲ ردیف، ۱۲ توضیح غیرخالی        → ۱۲ description_rich
--   site_destinations:          ۱۵ ردیف، ۱۱ توضیح غیرخالی        → ۱۱ description_rich
--   guides:                     ۴ ردیف، ۴ خلاصه + ۴ پاسخ مستقیم    → ۴ summary_rich و ۴ direct_answer_rich
--   exhibitions:                ۳ ردیف، ۳ توضیح غیرخالی          → ۳ description_rich
--   content_blocks:              ۰ ردیف                          → ۰ (ستون آماده است؛ استخراج امن کلید content از رشتهٔ JSON body_fa)
--   guides.sections:            ۸ بخش، ۸ متن غیرخالی            → ۸ content_rich
--   guides.faqs:                ۴ پاسخ غیرخالی                  → ۴ answer_rich
--   site_destinations.faqs:    ۱۳ پاسخ غیرخالی                  → ۱۳ answer_rich
--   exhibitions.faqs:           ۴ پاسخ غیرخالی                  → ۴ answer_rich
--   site_tours.itinerary_days:   ۰ روز (آرایه‌ها خالی‌اند)       → بدون تغییر
--
-- این فایل هنوز روی DB واقعی اجرا نشده؛ آماده برای اجرای هماهنگ‌کننده.
-- ترتیب: بعد از 0030 اجرا شود.

-- ══════════════════════════════════════════════════════════════════════
-- تابع rich_from_plain_text — معادل SQL الگوریتم richFromPlainText تیم ویرایشگر
-- ══════════════════════════════════════════════════════════════════════
-- قرارداد (سند کامل در content-editor/data/NOTES.md):
-- ۱. ‎\r\n به \n یکدست می‌شود؛ فضای خالی ابتدا و انتهای کل متن پیراسته می‌شود.
-- ۲. متن با «خط(های) خالی» به پاراگراف تقسیم می‌شود (یک یا چند سطر خالی
--    پشت‌سرهم = یک مرز پاراگراف؛ سطرِ فقط-فضای‌خالی هم جداکننده است).
-- ۳. سطرهای تکیِ داخل یک پاراگراف با نود hardBreak به هم می‌چسبند
--    (بدون hardBreak انتهایی).
-- ۴. خروجی: {"type":"doc","content":[{"type":"paragraph","content":
--    [{"type":"text","text":"…"}, {"type":"hardBreak"}, …]}, …]}.
-- ۵. بی‌اتلاف: همهٔ کاراکترهای متن (به‌جز فضای خالی ابتدا/انتها و سطرهای
--    جداکننده) عیناً در نودهای text می‌مانند؛ escape بر عهدهٔ jsonb است.
-- ۶. ورودی NULL/خالی → NULL (تابع STRICT است).
CREATE OR REPLACE FUNCTION public.rich_from_plain_text(p_text text)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $func$
  WITH
  cleaned(t) AS (
    SELECT btrim(replace(p_text, E'\r\n', E'\n'), E' ' || E'\t' || E'\n' || E'\r')
  ),
  lines AS (
    SELECT u.ord AS idx,
           u.line AS line,
           (btrim(u.line) = '') AS is_blank
    FROM cleaned,
         unnest(string_to_array(cleaned.t, E'\n')) WITH ORDINALITY AS u(line, ord)
  ),
  numbered AS (
    SELECT idx,
           line,
           COALESCE(
             sum(CASE WHEN is_blank THEN 1 ELSE 0 END)
               OVER (ORDER BY idx ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),
             0
           ) AS para_id
    FROM lines
    WHERE NOT is_blank
  ),
  ranked AS (
    SELECT idx,
           line,
           para_id,
           row_number() OVER (PARTITION BY para_id ORDER BY idx) AS rn,
           count(*) OVER (PARTITION BY para_id) AS cnt
    FROM numbered
  ),
  paras AS (
    SELECT r.para_id,
           jsonb_build_object(
             'type', 'paragraph',
             'content', (
               SELECT jsonb_agg(x.el ORDER BY x.idx, x.seq)
               FROM (
                 SELECT r2.idx,
                        v.seq,
                        CASE WHEN v.seq = 0
                             THEN jsonb_build_object('type', 'text', 'text', r2.line)
                             ELSE jsonb_build_object('type', 'hardBreak')
                        END AS el
                 FROM ranked r2
                 CROSS JOIN (VALUES (0), (1)) AS v(seq)
                 WHERE r2.para_id = r.para_id
                   AND NOT (v.seq = 1 AND r2.rn = r2.cnt)
               ) x
             )
           ) AS para
    FROM ranked r
    GROUP BY r.para_id
  )
  SELECT jsonb_build_object(
           'type', 'doc',
           'content', COALESCE(
             (SELECT jsonb_agg(p.para ORDER BY p.para_id) FROM paras p),
             '[]'::jsonb
           )
         )
$func$;

-- ══════════════════════════════════════════════════════════════════════
-- تابع jsonb_content_or_text — استخراج امن کلید content از رشتهٔ JSON
-- ══════════════════════════════════════════════════════════════════════
-- ستون content_blocks.body_fa از نوع text است ولی دو قالب دارد: متن تخت
-- قدیمی، یا رشتهٔ JSON به شکل {"heading":"…","content":"…"}. اگر کل رشتهٔ
-- JSON خام به rich_from_plain_text داده شود، خودِ JSON داخل پاراگراف غنی
-- می‌افتد. پس اول فقط مقدار کلید content بیرون کشیده می‌شود.
-- cast مستقیمِ ::jsonb روی همهٔ ردیف‌ها امن نیست: یک ردیف غیرمعتبر کافی
-- است تا کل UPDATE بیفتد؛ به‌همین‌خاطر cast داخل EXCEPTION انجام می‌شود.
-- قرارداد:
-- ۱. NULL → NULL (تابع STRICT است).
-- ۲. رشتهٔ خالی/فقط-فضای‌خالی → همان متن (استخراجی ندارد).
-- ۳. JSON معتبر با کلید content غیرخالی → مقدار content.
-- ۴. هر چیز دیگر (JSON بدون کلید content، content خالی، آرایه، متن تخت) →
--    خود متن دست‌نخورده.
CREATE OR REPLACE FUNCTION public.jsonb_content_or_text(p_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $func$
DECLARE
  v_obj jsonb;
  v_content text;
BEGIN
  BEGIN
    v_obj := p_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN p_text;
  END;
  IF jsonb_typeof(v_obj) <> 'object' OR NOT (v_obj ? 'content') THEN
    RETURN p_text;
  END IF;
  v_content := v_obj ->> 'content';
  IF btrim(v_content) = '' THEN
    RETURN p_text;
  END IF;
  RETURN v_content;
END;
$func$;

-- ══════════════════════════════════════════════════════════════════════
-- ۱) ستون‌های متنی تخت → ‎*_rich
-- ══════════════════════════════════════════════════════════════════════

-- توضیحات تور: ۱۲ از ۱۲
UPDATE site_tours
SET description_rich = public.rich_from_plain_text(description)
WHERE description_rich IS NULL
  AND btrim(description) <> '';

-- توضیحات مقصد: ۱۱ از ۱۵
UPDATE site_destinations
SET description_rich = public.rich_from_plain_text(description)
WHERE description_rich IS NULL
  AND btrim(description) <> '';

-- خلاصهٔ راهنما: ۴ از ۴
UPDATE guides
SET summary_rich = public.rich_from_plain_text(summary)
WHERE summary_rich IS NULL
  AND summary IS NOT NULL
  AND btrim(summary) <> '';

-- پاسخ مستقیم راهنما: ۴ از ۴
UPDATE guides
SET direct_answer_rich = public.rich_from_plain_text(direct_answer)
WHERE direct_answer_rich IS NULL
  AND direct_answer IS NOT NULL
  AND btrim(direct_answer) <> '';

-- توضیحات کامل نمایشگاه: ۳ از ۳
UPDATE exhibitions
SET description_rich = public.rich_from_plain_text(description)
WHERE description_rich IS NULL
  AND description IS NOT NULL
  AND btrim(description) <> '';

-- بلوک‌های لندینگ: ۰ ردیف (ستون آماده است؛ چیزی برای تبدیل نیست)
-- body_fa رشتهٔ JSON {"heading":"…","content":"…"} هم دارد؛ فقط مقدار
-- کلید content استخراج و تبدیل می‌شود (متن تخت قدیمی دست‌نخورده می‌ماند).
UPDATE content_blocks
SET body_fa_rich = public.rich_from_plain_text(public.jsonb_content_or_text(body_fa))
WHERE body_fa_rich IS NULL
  AND body_fa IS NOT NULL
  AND btrim(body_fa) <> '';

-- ══════════════════════════════════════════════════════════════════════
-- ۲) محتوای داخل-JSON: کلید موازی *_rich داخل همان آبجکت
--    قالب ذخیرهٔ فعلی حفظ می‌شود (آرایه می‌ماند آرایه، رشته-کدشده می‌ماند
--    رشته-کدشده)؛ فقط کلید تازه اضافه می‌شود. کد قدیمی همان مقادیر قبلی
--    را برای کلیدهای قدیمی می‌بیند.
-- ══════════════════════════════════════════════════════════════════════

-- بخش‌های راهنما: content → content_rich (۸ بخش، هر ۸ غیرخالی)
-- توجه: sections در DB واقعی رشته-کدشده است ("[{...}]")؛ همان قالب می‌ماند.
UPDATE guides
SET sections = CASE
  WHEN jsonb_typeof(sections) = 'array' THEN COALESCE((
    SELECT jsonb_agg(
             CASE WHEN jsonb_typeof(e.value) = 'object'
                       AND e.value ? 'content'
                       AND btrim(e.value ->> 'content') <> ''
                  THEN e.value || jsonb_build_object(
                         'content_rich',
                         public.rich_from_plain_text(e.value ->> 'content'))
                  ELSE e.value END
             ORDER BY e.ord)
    FROM jsonb_array_elements(sections) WITH ORDINALITY AS e(value, ord)
  ), '[]'::jsonb)
  WHEN jsonb_typeof(sections) = 'string'
       AND (sections #>> '{}') ~ '^\s*\[' THEN
    to_jsonb(COALESCE((
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(e.value) = 'object'
                         AND e.value ? 'content'
                         AND btrim(e.value ->> 'content') <> ''
                    THEN e.value || jsonb_build_object(
                           'content_rich',
                           public.rich_from_plain_text(e.value ->> 'content'))
                    ELSE e.value END
               ORDER BY e.ord)
      FROM jsonb_array_elements((sections #>> '{}')::jsonb)
           WITH ORDINALITY AS e(value, ord)
    ), '[]'::jsonb)::text)
  ELSE sections
END
WHERE sections IS NOT NULL;

-- پاسخ‌های FAQ راهنما: answer → answer_rich (۴ پاسخ غیرخالی)
UPDATE guides
SET faqs = CASE
  WHEN jsonb_typeof(faqs) = 'array' THEN COALESCE((
    SELECT jsonb_agg(
             CASE WHEN jsonb_typeof(e.value) = 'object'
                       AND e.value ? 'answer'
                       AND btrim(e.value ->> 'answer') <> ''
                  THEN e.value || jsonb_build_object(
                         'answer_rich',
                         public.rich_from_plain_text(e.value ->> 'answer'))
                  ELSE e.value END
             ORDER BY e.ord)
    FROM jsonb_array_elements(faqs) WITH ORDINALITY AS e(value, ord)
  ), '[]'::jsonb)
  WHEN jsonb_typeof(faqs) = 'string'
       AND (faqs #>> '{}') ~ '^\s*\[' THEN
    to_jsonb(COALESCE((
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(e.value) = 'object'
                         AND e.value ? 'answer'
                         AND btrim(e.value ->> 'answer') <> ''
                    THEN e.value || jsonb_build_object(
                           'answer_rich',
                           public.rich_from_plain_text(e.value ->> 'answer'))
                    ELSE e.value END
               ORDER BY e.ord)
      FROM jsonb_array_elements((faqs #>> '{}')::jsonb)
           WITH ORDINALITY AS e(value, ord)
    ), '[]'::jsonb)::text)
  ELSE faqs
END
WHERE faqs IS NOT NULL;

-- پاسخ‌های FAQ مقصد: answer → answer_rich (۱۳ پاسخ غیرخالی؛ ۱۱ ردیف رشته-کدشده، ۴ ردیف آرایه)
UPDATE site_destinations
SET faqs = CASE
  WHEN jsonb_typeof(faqs) = 'array' THEN COALESCE((
    SELECT jsonb_agg(
             CASE WHEN jsonb_typeof(e.value) = 'object'
                       AND e.value ? 'answer'
                       AND btrim(e.value ->> 'answer') <> ''
                  THEN e.value || jsonb_build_object(
                         'answer_rich',
                         public.rich_from_plain_text(e.value ->> 'answer'))
                  ELSE e.value END
             ORDER BY e.ord)
    FROM jsonb_array_elements(faqs) WITH ORDINALITY AS e(value, ord)
  ), '[]'::jsonb)
  WHEN jsonb_typeof(faqs) = 'string'
       AND (faqs #>> '{}') ~ '^\s*\[' THEN
    to_jsonb(COALESCE((
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(e.value) = 'object'
                         AND e.value ? 'answer'
                         AND btrim(e.value ->> 'answer') <> ''
                    THEN e.value || jsonb_build_object(
                           'answer_rich',
                           public.rich_from_plain_text(e.value ->> 'answer'))
                    ELSE e.value END
               ORDER BY e.ord)
      FROM jsonb_array_elements((faqs #>> '{}')::jsonb)
           WITH ORDINALITY AS e(value, ord)
    ), '[]'::jsonb)::text)
  ELSE faqs
END
WHERE faqs IS NOT NULL;

-- پاسخ‌های FAQ نمایشگاه: answer → answer_rich (۴ پاسخ غیرخالی)
UPDATE exhibitions
SET faqs = CASE
  WHEN jsonb_typeof(faqs) = 'array' THEN COALESCE((
    SELECT jsonb_agg(
             CASE WHEN jsonb_typeof(e.value) = 'object'
                       AND e.value ? 'answer'
                       AND btrim(e.value ->> 'answer') <> ''
                  THEN e.value || jsonb_build_object(
                         'answer_rich',
                         public.rich_from_plain_text(e.value ->> 'answer'))
                  ELSE e.value END
             ORDER BY e.ord)
    FROM jsonb_array_elements(faqs) WITH ORDINALITY AS e(value, ord)
  ), '[]'::jsonb)
  WHEN jsonb_typeof(faqs) = 'string'
       AND (faqs #>> '{}') ~ '^\s*\[' THEN
    to_jsonb(COALESCE((
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(e.value) = 'object'
                         AND e.value ? 'answer'
                         AND btrim(e.value ->> 'answer') <> ''
                    THEN e.value || jsonb_build_object(
                           'answer_rich',
                           public.rich_from_plain_text(e.value ->> 'answer'))
                    ELSE e.value END
               ORDER BY e.ord)
      FROM jsonb_array_elements((faqs #>> '{}')::jsonb)
           WITH ORDINALITY AS e(value, ord)
    ), '[]'::jsonb)::text)
  ELSE faqs
END
WHERE faqs IS NOT NULL;

-- متن روزهای برنامهٔ تور: description → description_rich داخل هر روز
-- (امروز ۰ روز — آرایه‌ها خالی‌اند؛ این UPDATE برای رکورد قرارداد می‌ماند)
UPDATE site_tours
SET itinerary_days = COALESCE((
  SELECT jsonb_agg(
           CASE WHEN jsonb_typeof(e.value) = 'object'
                     AND e.value ? 'description'
                     AND btrim(e.value ->> 'description') <> ''
                THEN e.value || jsonb_build_object(
                       'description_rich',
                       public.rich_from_plain_text(e.value ->> 'description'))
                ELSE e.value END
           ORDER BY e.ord)
  FROM jsonb_array_elements(
         CASE WHEN jsonb_typeof(itinerary_days) = 'array'
              THEN itinerary_days ELSE '[]' END
       ) WITH ORDINALITY AS e(value, ord)
), '[]'::jsonb)
WHERE itinerary_days IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════
-- ۳) راستی‌آزمایی (فقط-خواندنی — بعد از اجرا توسط هماهنگ‌کننده)
-- ══════════════════════════════════════════════════════════════════════

-- الف) هیچ متن غیرخالی‌ای نباید بدون نسخهٔ rich بماند:
-- select 'tours.description' c, count(*) from site_tours
--   where description_rich is null and btrim(description) <> ''
-- union all select 'destinations.description', count(*) from site_destinations
--   where description_rich is null and btrim(description) <> ''
-- union all select 'guides.summary', count(*) from guides
--   where summary_rich is null and summary is not null and btrim(summary) <> ''
-- union all select 'guides.direct_answer', count(*) from guides
--   where direct_answer_rich is null and direct_answer is not null and btrim(direct_answer) <> ''
-- union all select 'exhibitions.description', count(*) from exhibitions
--   where description_rich is null and description is not null and btrim(description) <> ''
-- union all select 'content_blocks.body_fa', count(*) from content_blocks
--   where body_fa_rich is null and body_fa is not null and btrim(body_fa) <> '';
--   -- content_blocks: استخراج با public.jsonb_content_or_text انجام می‌شود؛
--   -- اگر ردیفی هست باید «مقدار کلید content» به rich تبدیل شده باشد نه کل رشتهٔ JSON.
-- انتظار: همه صفر.

-- ب) نمونه‌خوان یک ردیف از هر جدول (متن قدیم در برابر JSON تازه):
-- select slug, left(description, 50) AS old_head,
--        left(description_rich::text, 120) AS new_head
-- from site_tours limit 2;
-- select slug, left(description, 50) AS old_head,
--        left(description_rich::text, 120) AS new_head
-- from site_destinations limit 2;
-- select slug, left(summary, 50) AS old_head,
--        left(summary_rich::text, 120) AS new_head
-- from guides limit 2;
-- select slug, left(description, 50) AS old_head,
--        left(description_rich::text, 120) AS new_head
-- from exhibitions limit 2;

-- ج) کلیدهای داخل-JSON (نمونهٔ یک راهنما):
-- select slug, sections #>> '{}' from guides limit 1;
-- باید در هر بخش "content_rich" و در هر FAQ "answer_rich" دیده شود؛
-- کلیدهای قدیمی content/answer سر جایشان‌اند.

-- د) شمارش نهایی نسخه‌های rich (باید با شمارش‌های بالای فایل بخواند):
-- select count(*) filter (where description_rich is not null) AS tours_desc_rich
--   from site_tours;
-- select count(*) filter (where description_rich is not null) AS dest_desc_rich
--   from site_destinations;
-- select count(*) filter (where summary_rich is not null) AS guides_summary_rich,
--        count(*) filter (where direct_answer_rich is not null) AS guides_answer_rich
--   from guides;
-- select count(*) filter (where description_rich is not null) AS exh_desc_rich
--   from exhibitions;
