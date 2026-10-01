-- مایگریشن فاز ۲، میز T2 — گیت واقعی انتشار تور
-- ⚠️ پیش‌نیاز دیپلوی: حتماً پیش از انتشار کد، روی Supabase (SQL Editor) اجرا شود.
-- در غیر این صورت ذخیرهٔ تور در پنل خطا می‌خورد (ستون publish_status نیست).
-- دستی و idempotent؛ اجرای دوباره بی‌ضرر است.
--
-- مسئله: جدول site_tours هیچ ستون انتشار نداشت. سایت عمومی همهٔ ردیف‌های
-- حذف‌نشده را — صرف‌نظر از status — زنده نمایش می‌داد و دکمهٔ «انتشار» پنل
-- در واقع چیزی را عوض نمی‌کرد (وضعیت انتشار با وضعیت ظرفیت قاطی شده بود).
-- راه‌حل: ستون publish_status از enum آمادهٔ publish_status + فیلتر سمت سایت.
--
-- معنای نهایی:
--   publish_status = 'draft'     → پیش‌نویس؛ روی سایت دیده نمی‌شود.
--   publish_status = 'published' → منتشرشده؛ روی سایت دیده می‌شود.
-- ستون قدیمی status دست نخورده می‌ماند و فقط «وضعیت ظرفیت» است
-- ('confirmed' | 'pending' | 'updating' | 'full').

DO $$ BEGIN
  CREATE TYPE publish_status AS ENUM ('draft','review','published','paused','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE site_tours
  ADD COLUMN IF NOT EXISTS publish_status publish_status NOT NULL DEFAULT 'draft';

-- حفظ رفتار فعلی سایت: هر توری که امروز زنده است، منتشرشده می‌ماند تا با
-- اجرای مایگریشن ناگهان از سایت پنهان نشود. تورهای تازه از این پس پیش‌نویس‌اند.
UPDATE site_tours SET publish_status = 'published' WHERE publish_status = 'draft';

CREATE INDEX IF NOT EXISTS idx_site_tours_publish_status
  ON site_tours (publish_status) WHERE deleted_at IS NULL;
