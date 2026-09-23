-- مقصدهای چندتایی تور (آرایه slug)؛ destination نمایشی از اولی ساخته می‌شود
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS destination_slugs JSONB NOT NULL DEFAULT '[]';
-- مبدأ سلسله‌مراتبی: والد اختیاری (قاره/کشور/شهر)
ALTER TABLE origin_cities ADD COLUMN IF NOT EXISTS parent_slug VARCHAR(120);
ALTER TABLE origin_cities ADD COLUMN IF NOT EXISTS type VARCHAR(60) NOT NULL DEFAULT 'city';
