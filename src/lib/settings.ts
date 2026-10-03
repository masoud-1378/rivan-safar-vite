export type SettingKind = 'text' | 'url' | 'email' | 'phone' | 'number' | 'boolean' | 'select' | 'textarea';

export type SettingTab = 'general' | 'contact' | 'seo' | 'notify' | 'advanced';

export interface SettingDef {
  key: string;
  label: string;
  hint: string;
  kind: SettingKind;
  tab: SettingTab;
  defaultValue: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  ownerOnly?: boolean;
  ltr?: boolean;
}

export const SETTING_TABS: Array<{ id: SettingTab; label: string }> = [
  { id: 'general', label: 'عمومی' },
  { id: 'contact', label: 'تماس و دفتر' },
  { id: 'seo', label: 'سئو و ایندکس' },
  { id: 'notify', label: 'اعلان‌ها' },
  { id: 'advanced', label: 'پیشرفته' },
];

export const SETTINGS_REGISTRY: SettingDef[] = [
  { key: 'site.brand', label: 'نام برند', hint: 'در عنوان‌ها و فوتر نمایش داده می‌شود.', kind: 'text', tab: 'general', defaultValue: 'ریوان سفر' },
  { key: 'site.url', label: 'دامنه اصلی سایت', hint: 'در آدرس‌های canonical، نقشهٔ سایت و متادیتای پایه به کار می‌رود. بدون اسلش پایانی، مثل https://rivansafar.ir', kind: 'url', tab: 'general', defaultValue: 'https://rivansafar.ir', ltr: true },
  { key: 'site.tagline', label: 'شعار سایت', hint: 'زیر نام برند در فوتر نمایش داده می‌شود.', kind: 'text', tab: 'general', defaultValue: 'سفر خوب، از انتخاب روشن شروع می‌شود' },
  { key: 'business.phone', label: 'تلفن اصلی', hint: 'شماره ۱۱ رقمی با صفر اول، مثل 02633350139', kind: 'phone', tab: 'contact', defaultValue: '02633350139', ltr: true },
  { key: 'business.phone_display', label: 'نمایش تلفن', hint: 'قالب نمایشی شماره در سایت.', kind: 'text', tab: 'contact', defaultValue: '۰۲۶ — ۳۳۳۵۰۱۳۹' },
  { key: 'business.phone_secondary', label: 'تلفن اضطراری', hint: 'اختیاری؛ در صفحه تماس نمایش داده می‌شود.', kind: 'phone', tab: 'contact', defaultValue: '', ltr: true },
  { key: 'business.email', label: 'ایمیل کسب‌وکار', hint: 'برای نمایش در فوتر و صفحه تماس.', kind: 'email', tab: 'contact', defaultValue: 'info@rivansafar.com', ltr: true },
  { key: 'business.address', label: 'نشانی دفتر', hint: 'نشانی کامل دفتر مرکزی.', kind: 'textarea', tab: 'contact', defaultValue: 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷' },
  { key: 'business.working_hours', label: 'ساعات پاسخگویی', hint: 'مثل شنبه تا پنجشنبه، ۹ تا ۲۱', kind: 'text', tab: 'contact', defaultValue: 'شنبه تا پنجشنبه، ۹ تا ۲۱' },
  { key: 'contact.show_header_phone', label: 'نمایش تلفن در هدر', hint: 'دکمه تماس در نوار بالایی سایت.', kind: 'boolean', tab: 'contact', defaultValue: 'true' },
  { key: 'contact.show_footer_phone', label: 'نمایش تلفن در فوتر', hint: 'بخش تماس در پابرگ سایت.', kind: 'boolean', tab: 'contact', defaultValue: 'true' },
  { key: 'social.instagram', label: 'اینستاگرام', hint: 'نشانی کامل صفحه اینستاگرام؛ خالی یعنی عدم نمایش.', kind: 'url', tab: 'contact', defaultValue: '', ltr: true },
  { key: 'social.telegram', label: 'تلگرام', hint: 'نشانی کامل کانال یا صفحه تلگرام؛ خالی یعنی عدم نمایش.', kind: 'url', tab: 'contact', defaultValue: '', ltr: true },
  { key: 'social.whatsapp', label: 'واتس‌اپ', hint: 'نشانی wa.me یا شماره؛ برای دکمه واتس‌اپ سایت.', kind: 'url', tab: 'contact', defaultValue: '', ltr: true },
  { key: 'social.linkedin', label: 'لینکدین', hint: 'نشانی کامل صفحه لینکدین؛ خالی یعنی عدم نمایش.', kind: 'url', tab: 'contact', defaultValue: '', ltr: true },
  { key: 'site.announcement_text', label: 'متن بنر اطلاع‌رسانی', hint: 'متن نوار بالای سایت؛ خالی یعنی متن پیش‌فرض.', kind: 'text', tab: 'general', defaultValue: '' },
  { key: 'seo.indexing_enabled', label: 'ایندکس گوگل فعال', hint: 'روشن یعنی موتورهای جست‌وجو اجازه خزش دارند.', kind: 'boolean', tab: 'seo', defaultValue: 'false' },
  { key: 'seo.default_title', label: 'عنوان پیش‌فرض', hint: 'برای صفحه‌هایی که عنوان اختصاصی ندارند.', kind: 'text', tab: 'seo', defaultValue: 'ریوان سفر | تورهای داخلی، خارجی و نمایشگاهی با مسیر شفاف' },
  { key: 'seo.default_description', label: 'توضیح پیش‌فرض', hint: 'متای پیش‌فرض صفحه‌ها.', kind: 'textarea', tab: 'seo', defaultValue: 'تورهای داخلی، خارجی و نمایشگاهی را با تاریخ، خدمات و قیمت پایه بررسی کنید.' },
  { key: 'seo.ga_id', label: 'شناسه گوگل آنالیتیکس', hint: 'مثل G-XXXXXXXXXX؛ خالی یعنی غیرفعال.', kind: 'text', tab: 'seo', defaultValue: '', ltr: true },
  { key: 'tours.default_price_note', label: 'یادداشت پیش‌فرض قیمت', hint: 'زیر قیمت هر تور نمایش داده می‌شود.', kind: 'text', tab: 'general', defaultValue: 'برای هر بزرگسال در اتاق دو تخته' },
  { key: 'tours.page_size', label: 'تعداد تور در هر صفحه', hint: 'بین ۴ تا ۴۸', kind: 'number', tab: 'general', defaultValue: '12', min: 4, max: 48 },
  { key: 'tours.default_sort', label: 'مرتب‌سازی پیش‌فرض', hint: 'ترتیب نمایش فهرست تورها.', kind: 'select', tab: 'general', defaultValue: 'default', options: [{ value: 'default', label: 'پیش‌فرض' }, { value: 'price_asc', label: 'ارزان‌ترین' }, { value: 'price_desc', label: 'گران‌ترین' }] },
  // قلم ۴ موج ۱ (تصمیم ۴، ۱۴۰۵/۰۷/۱۱): وقتی هیچ تور منتشرشده‌ای روی سایت نیست،
  // سایت بر اساس همین جوابِ ذخیره‌شده رفتار می‌کند. 'unanswered' یعنی مدیر هنوز
  // جواب نداده — پنل همان لحظه از او می‌پرسد، نه این‌که حدس بزند.
  { key: 'tours.all_draft_fallback', label: 'سایت وقتی هیچ توری منتشر نیست', hint: 'وقتی آخرین تور منتشرشده هم از سایت برداشته شود، این انتخاب اعمال می‌شود.', kind: 'select', tab: 'general', defaultValue: 'unanswered', options: [{ value: 'unanswered', label: 'هنوز انتخاب نشده' }, { value: 'sample', label: 'تور نمونه نمایش داده شود' }, { value: 'empty', label: 'صفحه خالی بماند' }] },
  { key: 'leads.success_message', label: 'پیام موفقیت فرم', hint: 'بعد از ثبت درخواست تماس نمایش داده می‌شود.', kind: 'text', tab: 'notify', defaultValue: 'درخواست شما ثبت شد؛ کارشناس ما به‌زودی تماس می‌گیرد.' },
  { key: 'leads.auto_assign', label: 'تخصیص خودکار', hint: 'نام کارشناس پیش‌فرض برای لیدهای جدید.', kind: 'text', tab: 'notify', defaultValue: '' },
  { key: 'leads.page_size', label: 'تعداد لید در هر صفحه', hint: 'بین ۵ تا ۱۰۰', kind: 'number', tab: 'notify', defaultValue: '20', min: 5, max: 100 },
  { key: 'site.maintenance', label: 'حالت تعمیرات', hint: 'روشن یعنی سایت برای بازدیدکننده پیام تعمیرات نشان می‌دهد.', kind: 'boolean', tab: 'advanced', defaultValue: 'false', ownerOnly: true },
  { key: 'site.maintenance_message', label: 'پیام تعمیرات', hint: 'متن نمایشی در حالت تعمیرات.', kind: 'textarea', tab: 'advanced', defaultValue: 'سایت در حال به‌روزرسانی است؛ به‌زودی برمی‌گردیم.', ownerOnly: true },
];

const byKey = new Map(SETTINGS_REGISTRY.map((d) => [d.key, d]));

export function settingDef(key: string): SettingDef | undefined {
  return byKey.get(key);
}

export function validateSetting(key: string, value: string): string | null {
  const def = byKey.get(key);
  if (!def) return 'کلید تنظیمات ناشناخته است.';
  const v = value.trim();
  // SEC-03: seo.ga_id مستقیم داخل اسکریپت inline در app/layout.tsx درون‌ریزی
  // می‌شود؛ فقط قالب‌های رسمی گوگل آنالیتیکس (یا خالی = غیرفعال) قبول است تا
  // ویراستار نتواند رشتهٔ JS تزریق کند. این مجموعه‌کاراکتر (' و < را ندارد)
  // سینک درون‌ریزی رشته‌ای را هم امن می‌کند.
  if (key === 'seo.ga_id') {
    if (!v) return null;
    if (!/^G-[A-Z0-9-]+$/.test(v) && !/^UA-[0-9]+-[0-9]+$/.test(v)) {
      return 'شناسه گوگل آنالیتیکس معتبر نیست؛ مثل G-XXXXXXXXXX وارد کنید.';
    }
    return null;
  }
  switch (def.kind) {
    case 'url':
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v)) return 'آدرس اینترنتی معتبر وارد کنید (با https شروع شود).';
      return null;
    case 'email':
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'ایمیل معتبر وارد کنید.';
      return null;
    case 'phone':
      if (v && !/^09\d{9}$/.test(v.replace(/[\s-]/g, '')) && !/^0\d{10}$/.test(v.replace(/[\s-]/g, ''))) return 'شماره تلفن معتبر وارد کنید.';
      return null;
    case 'number': {
      const n = Number(v);
      if (!Number.isFinite(n)) return 'عدد معتبر وارد کنید.';
      if (def.min !== undefined && n < def.min) return `عدد باید حداقل ${def.min} باشد.`;
      if (def.max !== undefined && n > def.max) return `عدد باید حداکثر ${def.max} باشد.`;
      return null;
    }
    case 'boolean':
      if (v !== 'true' && v !== 'false') return 'مقدار نامعتبر است.';
      return null;
    case 'select':
      if (def.options && !def.options.some((o) => o.value === v)) return 'گزینه انتخاب‌شده معتبر نیست.';
      return null;
    default:
      return null;
  }
}

export function withDefaults(rows: Array<{ settingKey: string; settingValue: string }>): Record<string, string> {
  const merged: Record<string, string> = Object.fromEntries(
    SETTINGS_REGISTRY.map((d) => [d.key, d.defaultValue]),
  );
  for (const r of rows) {
    if (byKey.has(r.settingKey)) merged[r.settingKey] = r.settingValue;
  }
  return merged;
}
