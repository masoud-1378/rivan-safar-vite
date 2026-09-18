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

-- مکان‌های P0/P1 (فقط سبد واقعی؛ دبی عمداً نیست — قرنطینه تا اثبات موجودی)
INSERT INTO places (slug, name_fa, name_en, type) VALUES
  ('turkey','ترکیه','Turkey','country'),
  ('thailand','تایلند','Thailand','country'),
  ('iran','ایران','Iran','country'),
  ('china','چین','China','country'),
  ('uae','امارات متحده عربی','United Arab Emirates','country'),
  ('istanbul','استانبول','Istanbul','city'),
  ('antalya','آنتالیا','Antalya','city'),
  ('phuket','پوکت','Phuket','city'),
  ('dubai','دبی','Dubai','city'),
  ('kish','کیش','Kish Island','island'),
  ('mashhad','مشهد مقدس','Mashhad','city')
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
