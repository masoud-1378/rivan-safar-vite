-- موج ۳ — seed جدول ایرلاین‌ها (۱۴۰۵/۰۷/۱۱).
--
-- جدول carriers از اول خفته بود (صفر ردیف) و فقط slug و name_fa داشت؛ اول سه
-- ستون تازه‌اش را می‌سازیم، بعد ۲۴ ایرلاین راستی‌آزمایی‌شده را می‌نشانیم:
-- ۱۷ ایرانی + ۷ خارجیِ مرتبط با مقصدهای ریوان (دبی، استانبول، آنتالیا،
-- بانکوک، تفلیس، کوالالامپور، ایروان، پکن، دوحه).
--
-- منبع کدهای یاتا: «List of airlines of Iran» ویکی‌پدیا برای ایرانی‌ها و
-- فهرست‌های کد یاتا برای خارجی‌ها (جزئیات در
-- ~/workspace/projects/rivan-admin-audit/wave-3/carriers/NOTES.md).
-- قانون seed: اگر از کدی مطمئن نبودیم، ردیفش را حذف کردیم — حدس ممنوع
-- (چابهار و ساها چون کد یاتا ندارند، نیامدند).
--
-- ⚠️ قاعدهٔ آهنی (درس آتش‌نشانی پروداکشن ۱۴۰۵/۰۷/۱۱): فقط افزایشی.
-- - ستون‌های تازه nullable، بدون NOT NULL و بدون پیش‌فرض.
-- - INSERTها با WHERE NOT EXISTS روی slug → idempotent؛ اجرای دوباره ردیف
--   تازه نمی‌سازد.
-- - هیچ DROP/ALTER دیگری در این فایل نیست.
--
-- این فایل هنوز روی DB واقعی اجرا نشده؛ آماده برای اجرای هماهنگ‌کننده.
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS name_en varchar(160);
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS iata_code varchar(10);
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS country varchar(80);

-- ایرلاین‌های ایرانی
INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'mahan', 'ماهان', 'Mahan Air', 'W5', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'mahan');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'iran-air', 'ایران‌ایر', 'Iran Air', 'IR', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'iran-air');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'caspian', 'کاسپین', 'Caspian Airlines', 'RV', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'caspian');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'kish-air', 'کیش‌ایر', 'Kish Air', 'Y9', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'kish-air');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'qeshm-air', 'قشم‌ایر', 'Qeshm Air', 'QB', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'qeshm-air');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'taban', 'تابان', 'Taban Air', 'HH', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'taban');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'zagros', 'زاگرس', 'Zagros Airlines', 'ZV', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'zagros');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'meraj', 'معراج', 'Meraj Airlines', 'JI', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'meraj');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'ata', 'آتا', 'ATA Airlines', 'I3', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'ata');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'karun', 'کارون', 'Karun Airlines', 'NV', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'karun');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'varesh', 'وارش', 'Varesh Airlines', 'VR', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'varesh');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'iran-airtour', 'ایران ایرتور', 'Iran Airtour', 'B9', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'iran-airtour');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'aseman', 'آسمان', 'Iran Aseman Airlines', 'EP', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'aseman');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'flypersia', 'فلای‌پرشیا', 'FlyPersia', 'FP', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'flypersia');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'pars-air', 'پارس ایر', 'Pars Air', 'PR', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'pars-air');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'sepehran', 'سپهران', 'Sepehran Airlines', 'IS', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'sepehran');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'pouya', 'پویا', 'Pouya Air', 'PY', 'ایران', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'pouya');

-- ایرلاین‌های خارجیِ مرتبط با مقصدهای ریوان
INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'emirates', 'امارات', 'Emirates', 'EK', 'امارات متحده عربی', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'emirates');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'flydubai', 'فلای‌دبی', 'flydubai', 'FZ', 'امارات متحده عربی', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'flydubai');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'qatar-airways', 'قطر ایرویز', 'Qatar Airways', 'QR', 'قطر', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'qatar-airways');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'turkish-airlines', 'ترکیش ایرلاینز', 'Turkish Airlines', 'TK', 'ترکیه', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'turkish-airlines');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'china-southern', 'چاینا ساترن', 'China Southern Airlines', 'CZ', 'چین', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'china-southern');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'thai-airways', 'تای ایرویز', 'Thai Airways International', 'TG', 'تایلند', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'thai-airways');

INSERT INTO carriers (slug, name_fa, name_en, iata_code, country, kind)
SELECT 'malaysia-airlines', 'مالزی ایرلاینز', 'Malaysia Airlines', 'MH', 'مالزی', 'airline'
WHERE NOT EXISTS (SELECT 1 FROM carriers WHERE slug = 'malaysia-airlines');
