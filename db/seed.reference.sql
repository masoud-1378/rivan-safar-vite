-- Seed مرجع (فقط Draft و داده مرجع). قیمت/ظرفیت واقعی فقط با ورود عملیاتی.
-- ترتیب اجرا: بعد از 0001_init.sql و فقط یک‌بار در محیط تازه.

-- دامنه و تنظیمات مرکزی
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('site.url', 'https://rivansafar.ir'),
  ('site.robots.indexing_enabled', 'false'),
  ('business.phone', '02633350139'),
  ('business.address', 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷')
ON CONFLICT DO NOTHING;

-- مبدأها
INSERT INTO origin_cities (slug, name_fa) VALUES
  ('tehran','تهران'), ('karaj','کرج'), ('isfahan','اصفهان'), ('shiraz','شیراز'),
  ('mashhad','مشهد'), ('yazd','یزد'), ('tabriz','تبریز'), ('hamedan','همدان'),
  ('kerman','کرمان'), ('ahvaz','اهواز'), ('rasht','رشت')
ON CONFLICT DO NOTHING;

-- مقصدهای P0/P1 (جدول زنده: site_destinations — جدول places مرده است و دیگر seed نمی‌گیرد)
-- دادهٔ نمونه برای شروع سریع؛ قیمت‌ها واقعی نیستند.
INSERT INTO site_destinations (slug, name, name_en, type, parent_country_slug, category, image, hero_tagline, description, best_season, currency, starting_price, starting_price_note, last_verified_at) VALUES
  ('turkey','ترکیه','Turkey','country',NULL,'ترکیبی','https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop','ترکیه؛ استانبول و آنتالیا','ترکیه پرترددترین مقصد خارجی ماست: استانبول برای شهرگردی و خرید، آنتالیا برای استراحت ساحلی.','بهار و پاییز','لیر ترکیه','از ۲۸ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('thailand','تایلند','Thailand','country',NULL,'ساحلی','https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop','تایلند؛ بانکوک و پوکت','تایلند برای سفر ترکیبی شهر و ساحل مناسب است: بانکوک، پوکت و گشت جزایر.','پاییز و زمستان','بات تایلند','از ۴۵ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('iran','ایران','Iran','country',NULL,'ترکیبی','https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop','ایران؛ کیش و مشهد','سفرهای داخلی با تمرکز بر کیش و مشهد؛ هتل‌های منتخب و پرواز یا قطار.','همهٔ فصل‌ها','تومان','از ۸ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('china','چین','China','country',NULL,'شهری','https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop','چین؛ پکن و شانگهای','سفر کاری و نمایشگاهی به چین با تمرکز بر پکن و شانگهای.','بهار و پاییز','یوان چین','استعلامی','بسته به نمایشگاه و فصل','۹ مهر ۱۴۰۵'),
  ('uae','امارات متحده عربی','United Arab Emirates','country',NULL,'شهری','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop','امارات؛ دبی','دبی برای سفر کوتاه شهری و خرید؛ پروازهای متعدد روزانه.','پاییز و زمستان','درهم امارات','از ۲۲ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('istanbul','استانبول','Istanbul','city','turkey','شهری','https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop','استانبول؛ پل دو قاره','استانبول با بافت تاریخی، بازارها و مراکز خرید؛ مناسب سفر ۴ تا ۷ روزه.','بهار و پاییز','لیر ترکیه','از ۲۸ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('antalya','آنتالیا','Antalya','city','turkey','ساحلی','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop','آنتالیا؛ ریزورت ساحلی','آنتالیا با ریزورت‌های ساحلی و خدمات UALL؛ مناسب استراحت خانوادگی.','بهار تا پاییز','لیر ترکیه','از ۳۵ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('phuket','پوکت','Phuket','city','thailand','ساحلی','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop','پوکت؛ سواحل آندامان','پوکت با سواحل آندامان و گشت جزایر؛ قابل ترکیب با بانکوک.','پاییز و زمستان','بات تایلند','از ۴۸ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('dubai','دبی','Dubai','city','uae','شهری','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop','دبی؛ شهر خرید و تفریح','دبی برای سفر کوتاه ۳ تا ۵ روزه با تمرکز بر خرید و تفریح.','پاییز و زمستان','درهم امارات','از ۲۴ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('kish','کیش','Kish Island','city','iran','ساحلی','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop','کیش؛ جزیرهٔ آرام','کیش با هتل‌های ساحلی و تفریحات دریایی؛ مناسب سفر ۳ تا ۴ روزه.','پاییز تا بهار','تومان','از ۹ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵'),
  ('mashhad','مشهد','Mashhad','city','iran','زیارتی','https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop','مشهد؛ سفر زیارتی','مشهد با هتل‌های نزدیک حرم؛ گزینهٔ هوایی و قطار ۵ ستاره.','همهٔ فصل‌ها','تومان','از ۸ میلیون تومان','برای هر نفر در اتاق دبل','۹ مهر ۱۴۰۵')
ON CONFLICT DO NOTHING;

-- لندینگ‌های Published اولیه (P0 + موجودی اثبات‌شده فعلی)
-- بقیه خوشه‌ها (ژاپن/کره/اروپا/قشم/چابهار) تا ورود موجودی در Draft می‌مانند.
INSERT INTO seo_landings (query_owner, url_path, canonical_path, page_type, title_fa, meta_description_fa, h1_fa, workflow, index_status) VALUES
  ('home:ریوان سفر', '/', '/', 'home', 'ریوان سفر | تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف', 'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید و برای تأیید مسیر و ظرفیت با کارشناس در تماس باشید.', 'سفر خوب، از انتخاب روشن شروع می‌شود', 'published', 'index'),
  ('tours:همه تورها', '/tours', '/tours', 'tours_all', 'همه تورهای داخلی، خارجی و نمایشگاهی | ریوان سفر', 'فهرست تورهای فعال داخلی، خارجی و نمایشگاهی با فیلتر مقصد، تاریخ و قیمت پایه.', 'تورهای داخلی، خارجی و نمایشگاهی', 'published', 'index'),
  ('tours:تور خارجی', '/tours/foreign', '/tours/foreign', 'tours_foreign', 'تورهای خارجی؛ ترکیه، تایلند و مقاصد فعال | ریوان سفر', 'پکیج‌های تور خارجی فعال را با تفکیک مقصد، ویزا، ایرلاین و هتل بررسی کنید.', 'تورهای خارجی', 'published', 'index'),
  ('tours:تور داخلی', '/tours/domestic', '/tours/domestic', 'tours_domestic', 'تورهای داخلی؛ کیش و مشهد | ریوان سفر', 'تورهای داخلی فعال کیش و مشهد با هتل منتخب و قیمت پایه شفاف.', 'تورهای داخلی', 'published', 'index'),
  ('dest:تور ترکیه', '/destination/turkey', '/destination/turkey', 'country', 'تور ترکیه؛ استانبول و آنتالیا با قیمت و تاریخ | ریوان سفر', 'تورهای فعال ترکیه (استانبول، آنتالیا) با تاریخ حرکت، هتل و قیمت پایه.', 'تور ترکیه', 'published', 'index'),
  ('dest:تور استانبول', '/destination/turkey/istanbul', '/destination/turkey/istanbul', 'destination_city', 'تور استانبول؛ تاریخ‌ها، قیمت و شرایط سفر | ریوان سفر', 'تورهای فعال استانبول با تاریخ، مدت، هتل و قیمت پایه؛ ظرفیت هر حرکت پیش از اقدام تأیید می‌شود.', 'تور استانبول؛ تاریخ‌ها، قیمت و شرایط سفر', 'published', 'index'),
  ('dest:تور آنتالیا', '/destination/turkey/antalya', '/destination/turkey/antalya', 'destination_city', 'تور آنتالیا؛ ریزورت ساحلی UALL با قیمت | ریوان سفر', 'ریزورت‌های ساحلی آنتالیا با خدمات UALL، تاریخ حرکت و قیمت پایه هر نفر.', 'تور آنتالیا', 'published', 'index'),
  ('dest:تور تایلند', '/destination/thailand', '/destination/thailand', 'country', 'تور تایلند؛ بانکوک و پوکت | ریوان سفر', 'تورهای فعال تایلند با ویزا، پرواز و هتل؛ مناسب سفر ترکیبی.', 'تور تایلند', 'published', 'index'),
  ('dest:تور پوکت', '/destination/thailand/phuket', '/destination/thailand/phuket', 'destination_city', 'تور پوکت؛ سواحل و تورهای ترکیبی | ریوان سفر', 'تور پوکت با سواحل آندامان و گشت جزایر؛ تاریخ و قیمت پایه هر حرکت.', 'تور پوکت', 'published', 'index'),
  ('dest:تور کیش', '/destination/iran/kish', '/destination/iran/kish', 'destination_city', 'تور کیش؛ هتل ساحلی با قیمت | ریوان سفر', 'تورهای فعال کیش با هتل ساحلی، ترانسفر و قیمت پایه شفاف.', 'تور کیش', 'published', 'index'),
  ('dest:تور مشهد', '/destination/iran/mashhad', '/destination/iran/mashhad', 'destination_city', 'تور مشهد؛ هتل نزدیک حرم هوایی و ریلی | ریوان سفر', 'تور مشهد با هتل نزدیک حرم، گزینه هوایی و قطار ۵ ستاره.', 'تور مشهد', 'published', 'index')
ON CONFLICT DO NOTHING;

-- بلوک محتوای لندینگ‌های seed: هر لندینگ seed یک بلوک بخش می‌گیرد تا گیت انتشار
-- (دست‌کم ۱ بلوک) را واقعاً رد کند؛ بدون این بلوک‌ها باید draft می‌ماندند.
-- گارد یافتهٔ ۲: فقط روی لندینگ‌های خودِ seed (نه لندینگ‌های کاربر).
INSERT INTO content_blocks (landing_id, block_order, block_kind, body_fa)
SELECT id, 1, 'section',
  json_build_object(
    'heading', h1_fa,
    'content', meta_description_fa || ' برای مشاوره، استعلام ظرفیت و رزرو با کارشناسان ریوان سفر در تماس باشید.'
  )::text
FROM seo_landings
WHERE workflow = 'published'
  AND url_path IN ('/', '/tours', '/tours/foreign', '/tours/domestic', '/destination/turkey',
    '/destination/turkey/istanbul', '/destination/turkey/antalya', '/destination/thailand',
    '/destination/thailand/phuket', '/destination/iran/kish', '/destination/iran/mashhad')
  AND NOT EXISTS (SELECT 1 FROM content_blocks cb WHERE cb.landing_id = seo_landings.id);

-- لینک خروجی هر لندینگ seed به صفحهٔ خانه (فقط seed — یافتهٔ ۲)
INSERT INTO seo_internal_links (from_landing_id, to_path, anchor_fa)
SELECT id, '/', 'ریوان سفر'
FROM seo_landings
WHERE url_path <> '/'
  AND url_path IN ('/tours', '/tours/foreign', '/tours/domestic', '/destination/turkey',
    '/destination/turkey/istanbul', '/destination/turkey/antalya', '/destination/thailand',
    '/destination/thailand/phuket', '/destination/iran/kish', '/destination/iran/mashhad')
  AND NOT EXISTS (
    SELECT 1 FROM seo_internal_links l
    WHERE l.from_landing_id = seo_landings.id AND l.to_path = '/'
  );

-- لینک ورودی: از خانه به هر لندینگ seed، و از «همه تورها» به خانه
-- (تا شرط «دست‌کم ۱ لینک ورودی» گیت برای همه — از جمله خود خانه — برقرار شود)
-- یافتهٔ ۱۴: مبدأ با JOIN گرفته می‌شود تا اگر خانه/«همه تورها» حذف شده بود،
-- ردیفی با from_landing_id=NULL تکثیر نشود. یافتهٔ ۲: فقط مقصدهای seed.
INSERT INTO seo_internal_links (from_landing_id, to_path, anchor_fa)
SELECT home.id, s.url_path, s.title_fa
FROM seo_landings s
JOIN seo_landings home ON home.url_path = '/'
WHERE s.url_path IN ('/tours', '/tours/foreign', '/tours/domestic', '/destination/turkey',
    '/destination/turkey/istanbul', '/destination/turkey/antalya', '/destination/thailand',
    '/destination/thailand/phuket', '/destination/iran/kish', '/destination/iran/mashhad')
  AND NOT EXISTS (
    SELECT 1 FROM seo_internal_links l
    WHERE l.to_path = s.url_path
      AND l.from_landing_id = home.id
  );

INSERT INTO seo_internal_links (from_landing_id, to_path, anchor_fa)
SELECT tours.id, '/', 'ریوان سفر'
FROM seo_landings tours
WHERE tours.url_path = '/tours'
  AND NOT EXISTS (
    SELECT 1 FROM seo_internal_links l
    WHERE l.to_path = '/'
      AND l.from_landing_id = tours.id
  );
