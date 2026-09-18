export interface TourItem {
  id: string;
  title: string;
  type: 'foreign' | 'domestic' | 'exhibition';
  typeLabel: string; // e.g. "پکیج آماده", "تور گروهی", "پرواز + هتل"
  destination: string;
  origin: string;
  route: string;
  duration: string; // e.g. "۴ شب و ۵ روز"
  nights: number;
  closestDeparture: string;
  price: number;
  formattedPrice: string;
  priceNote: string;
  status: 'confirmed' | 'pending' | 'updating' | 'full';
  statusLabel: string;
  updatedAt: string;
  image: string;
  badge?: string;
  features: string[];
  visaRequired: boolean;
  hotelStars: number;
  airline: string;
  includedServices: string[];
  excludedServices: string[];
  hotelOptions: Array<{ name: string; stars: number; board: string; pricePerPerson: string }>;
  description: string;
}

export const SAMPLE_TOURS: TourItem[] = [
  {
    id: 'istanbul-sep',
    title: 'تور استانبول ویژه شهریور',
    type: 'foreign',
    typeLabel: 'پکیج آماده',
    destination: 'استانبول',
    origin: 'تهران',
    route: 'تهران به استانبول',
    duration: '۴ شب و ۵ روز',
    nights: 4,
    closestDeparture: '۱۸ شهریور',
    price: 35800000,
    formattedPrice: '۳۵٬۸۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۴:۳۰',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=600&auto=format&fit=crop',
    badge: undefined,
    features: ['پرواز مستقیم ماهان', 'هتل‌های ۴ و ۵ ستاره مرکز شهر'],
    visaRequired: false,
    hotelStars: 4,
    airline: 'ماهان',
    includedServices: ['بلیط رفت و برگشت پرواز', 'اقامت در هتل با صبحانه', 'ترانسفر فرودگاهی رفت و برگشت', 'گشت شهری با ناهار', 'بیمه مسافرتی'],
    excludedServices: ['عوارض خروج از کشور', 'هزینه ورودی جاذبه‌های گردشگری شخصی'],
    hotelOptions: [
      { name: 'هتل کرون پلاتزا تکسیم', stars: 5, board: 'صبحانه (BB)', pricePerPerson: '۴۲٬۵۰۰٬۰۰۰ تومان' },
      { name: 'هتل گرند اوزتانیک', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۳۵٬۸۰۰٬۰۰۰ تومان' },
      { name: 'هتل سیتادل نیاوران', stars: 3, board: 'صبحانه (BB)', pricePerPerson: '۲۹٬۴۰۰٬۰۰۰ تومان' },
    ],
    description: 'تور استانبول با پرواز مستقیم ماهان ایر و همراهی لیدر فارسی‌زبان در گشت‌ها. اقامت در هتل‌های منتخب منطقه تکسیم و شیشلی با دسترسی مناسب به مراکز خرید.'
  },
  {
    id: 'antalya-summer',
    title: 'تور لوکس آنتالیا (خدمات All Inclusive)',
    type: 'foreign',
    typeLabel: 'پکیج لوکس',
    destination: 'آنتالیا',
    origin: 'تهران',
    route: 'تهران به آنتالیا',
    duration: '۶ شب و ۷ روز',
    nights: 6,
    closestDeparture: '۲۲ شهریور',
    price: 58900000,
    formattedPrice: '۵۸٬۹۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۵:۱۰',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop',
    badge: 'UALL / All Inclusive',
    features: ['ریزورت‌های ۵ ستاره ساحلی', 'پرواز مستقیم ترکیش'],
    visaRequired: false,
    hotelStars: 5,
    airline: 'ترکیش ایرلاینز',
    includedServices: ['پرواز مستقیم', '۷ روز اقامت با تمام وعده‌های غذایی و نوشیدنی (Ultra All)', 'ترانسفر اختصاصی', 'بیمه مسافرتی کرونا'],
    excludedServices: ['عوارض خروج از کشور', 'خدمات ماساژ و اسپا اختصاصی'],
    hotelOptions: [
      { name: 'ریزورت ۵ ستاره ریکسوس سان‌گیت', stars: 5, board: 'Ultra All Inclusive', pricePerPerson: '۶۸٬۵۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۵ ستاره تایتانیک دلتا', stars: 5, board: 'All Inclusive', pricePerPerson: '۵۸٬۹۰۰٬۰۰۰ تومان' },
    ],
    description: 'اقامت ساحلی در سواحل مدیترانه آنتالیا با خدمات غذا و نوشیدنی فراگیر (UALL) در طول اقامت، استخر، پارک آبی و برنامه شبانه.'
  },
  {
    id: 'dubai-autumn',
    title: 'تور دبی پرواز ماهان',
    type: 'foreign',
    typeLabel: 'پرواز + هتل',
    destination: 'دبی',
    origin: 'تهران',
    route: 'تهران به دبی',
    duration: '۳ شب و ۴ روز',
    nights: 3,
    closestDeparture: '۱۵ شهریور',
    price: 32500000,
    formattedPrice: '۳۲٬۵۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'pending',
    statusLabel: 'نیازمند تأیید ظرفیت',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۲:۰۰',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
    badge: 'ویزای فوری',
    features: ['ویزای سریع امارات', 'هتل‌های نزدیک دبی مال'],
    visaRequired: true,
    hotelStars: 4,
    airline: 'ماهان',
    includedServices: ['بلیط رفت و برگشت ماهان', 'ویزای توریستی امارات', 'اقامت با صبحانه', 'بیمه مسافرتی'],
    excludedServices: ['مالیات هتل (Tourism Dirham)', 'ترانسفر شخصی'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره ماریوت مارکیز', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۳۲٬۵۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۵ ستاره آدرس دیوان', stars: 5, board: 'صبحانه (BB)', pricePerPerson: '۴۷٬۲۰۰٬۰۰۰ تومان' },
    ],
    description: 'سفر به پایتخت مدرن خاورمیانه دبی. اخذ سریع ویزا، پرواز صبح به شب و امکان رزرو بلیط پارک‌های تفریحی با تخفیف ویژه.'
  },
  {
    id: 'kish-island',
    title: 'تور کیش هتل‌های ۵ ستاره ساحلی',
    type: 'domestic',
    typeLabel: 'پکیج داخلی',
    destination: 'کیش',
    origin: 'تهران',
    route: 'تهران به کیش',
    duration: '۳ شب و ۴ روز',
    nights: 3,
    closestDeparture: '۲۰ شهریور',
    price: 14800000,
    formattedPrice: '۱۴٬۸۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۳:۴۵',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    badge: 'پیشنهاد اقتصادی',
    features: ['گشت جزیره رایگان', 'تخفیف شومانس و تفریحات دریایی'],
    visaRequired: false,
    hotelStars: 5,
    airline: 'ایران ایرلاینز',
    includedServices: ['بلیط رفت و برگشت هواپیما', 'اقامت با صبحانه بوفه', 'ترانسفر استقبال فرودگاهی', 'کوپن تخفیف تفریحات'],
    excludedServices: ['ناهارهای تفریحی و شخصی'],
    hotelOptions: [
      { name: 'هتل ۵ ستاره داریوش', stars: 5, board: 'صبحانه بوفه', pricePerPerson: '۱۸٬۹۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۵ ستاره ترنج روی آب', stars: 5, board: 'صبحانه بوفه', pricePerPerson: '۲۶٬۵۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۴ ستاره مریم', stars: 4, board: 'صبحانه بوفه', pricePerPerson: '۱۴٬۸۰۰٬۰۰۰ تومان' },
    ],
    description: 'استراحت و تفریح در جزیره زیبای کیش. اقامت در هتل‌های مدرن ساحلی همراه با استقبال فرودگاهی و گشت جزیره.'
  },
  {
    id: 'mashhad-pilgrim',
    title: 'تور مشهد مقدس (پرواز + هتل نزدیک حرم)',
    type: 'domestic',
    typeLabel: 'پکیج زیارتی',
    destination: 'مشهد',
    origin: 'تهران',
    route: 'تهران به مشهد',
    duration: '۲ شب و ۳ روز',
    nights: 2,
    closestDeparture: '۱۶ شهریور',
    price: 9500000,
    formattedPrice: '۹٬۵۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۱:۲۰',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop',
    badge: 'گزینه اقتصادی',
    features: ['فاصله ۵ دقیقه‌ای تا حرم', 'صبحانه، ناهار و شام (FB)'],
    visaRequired: false,
    hotelStars: 4,
    airline: 'زاگرس',
    includedServices: ['بلیط رفت و برگشت هواپیما', 'اقامت با فولبرد (۳ وعده غذا)', 'ترانسفر فرودگاهی'],
    excludedServices: ['خریدهای سوغات شخصی'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره الماس ۱', stars: 4, board: 'فولبرد (FB)', pricePerPerson: '۱۲٬۴۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۳ ستاره اترک', stars: 3, board: 'فولبرد (FB)', pricePerPerson: '۹٬۵۰۰٬۰۰۰ تومان' },
    ],
    description: 'زیارت باشکوه مشهد مقدس. اقامت در هتل‌های کیفی نزدیک به باب‌الرضا با خدمات پذیرایی کامل سه وعده.'
  },
  {
    id: 'canton-exhibition',
    title: 'تور نمایشگاهی کنتون فیر چین (گوانگجو)',
    type: 'exhibition',
    typeLabel: 'تور تخصصی تجاری',
    destination: 'گوانگجو (چین)',
    origin: 'تهران',
    route: 'تهران به گوانگجو',
    duration: '۷ شب و ۸ روز',
    nights: 7,
    closestDeparture: '۲۵ مهر',
    price: 115000000,
    formattedPrice: '۱۱۵٬۰۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'pending',
    statusLabel: 'نیازمند تأیید ظرفیت',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۰:۰۰',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop',
    badge: 'نمایشگاهی ویژه',
    features: ['کارت ورود به نمایشگاه Canton Fair', 'مترجم تخصصی تجاری و ویزا'],
    visaRequired: true,
    hotelStars: 5,
    airline: 'ماهان / قطر ایرویز',
    includedServices: ['بلیط رفت و برگشت پرواز', 'ویزای تجاری چین', 'کارت ثبت‌نام نمایشگاه', 'اقامت ۵ ستاره با صبحانه', 'ترانسفر روزانه به مرکز نمایشگاه', 'مترجم فارسی‌زبان'],
    excludedServices: ['عوارض خروج', 'هزینه‌های مذاکره تجاری خاص'],
    hotelOptions: [
      { name: 'هتل ۵ ستاره وستین گوانگجو', stars: 5, board: 'صبحانه بوفه', pricePerPerson: '۱۳۵٬۰۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۵ ستاره کرون پلاتزا گوانگجو', stars: 5, board: 'صبحانه بوفه', pricePerPerson: '۱۱۵٬۰۰۰٬۰۰۰ تومان' },
    ],
    description: 'پکیج کامل حضور در بزرگ‌ترین نمایشگاه تجاری جهان Canton Fair گوانگجو. خدمات ویزا، ترانسفر اختصاصی نمایشگاهی و مترجم همراه.'
  },
  {
    id: 'thailand-phuket',
    title: 'تور تایلند ترکیب بانکوک و پوکت',
    type: 'foreign',
    typeLabel: 'پکیج ترکیبی',
    destination: 'پوکت',
    origin: 'تهران',
    route: 'تهران به بانکوک و پوکت',
    duration: '۷ شب و ۸ روز',
    nights: 7,
    closestDeparture: '۰۵ مهر',
    price: 64500000,
    formattedPrice: '۶۴٬۵۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۰۹:۱۵',
    image: 'https://images.unsplash.com/photo-1506665531195-3566af294710?q=80&w=600&auto=format&fit=crop',
    badge: 'سفر استوایی',
    features: ['پرواز داخلی بین بانکوک و پوکت', 'گشت جزایر فی‌فی و جیمز باند'],
    visaRequired: true,
    hotelStars: 4,
    airline: 'سلام ایر / ماهان',
    includedServices: ['پرواز بین‌المللی و داخلی', 'ویزای توریستی تایلند', 'هتل‌های ۴ ستاره با صبحانه', 'سیم‌کارت اعتباری رایگان', 'گشت شهری'],
    excludedServices: ['عوارض خروج از کشور'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره دیوا نوانا پوکت', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۶۴٬۵۰۰٬۰۰۰ تومان' },
      { name: 'هتل ۵ ستاره آماری پوکت', stars: 5, board: 'صبحانه (BB)', pricePerPerson: '۷۸٬۰۰۰٬۰۰۰ تومان' },
    ],
    description: 'سفر به سرزمین لبخندها. ترکیب ۴ شب پوکت ساحلی و ۳ شب بانکوک مدرن همراه با ویزای آسان و گشت‌های جذاب طبیعت‌گردی.'
  },
  {
    id: 'russia-moscow',
    title: 'تور روسیه مسکو و سنت پترزبورگ',
    type: 'foreign',
    typeLabel: 'تور گروهی فرهنگی',
    destination: 'مسکو',
    origin: 'تهران',
    route: 'تهران به مسکو و سنت پترزبورگ',
    duration: '۷ شب و ۸ روز',
    nights: 7,
    closestDeparture: '۱۲ مهر',
    price: 72000000,
    formattedPrice: '۷۲٬۰۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۶:۰۰',
    image: 'https://images.unsplash.com/photo-1513326718677-b964603b136b?q=80&w=600&auto=format&fit=crop',
    badge: 'ویزای الکترونیکی',
    features: ['قطار سریع‌السیر سابسان', 'گشت موزه هرمیتاژ و کاخ کرملین'],
    visaRequired: true,
    hotelStars: 4,
    airline: 'ایران ایرلاینز',
    includedServices: ['بلیط هواپیما', 'ویزای الکترونیکی روسیه', 'قطار مسکو-پترزبورگ', 'اقامت با صبحانه', 'گشت‌های کامل با لیدر مجرب'],
    excludedServices: ['عوارض خروج از کشور'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره رادیسون بلو مسکو', stars: 4, board: 'صبحانه بوفه', pricePerPerson: '۷۲٬۰۰۰٬۰۰۰ تومان' },
    ],
    description: 'تور کامل شب‌های روشن و معماری باشکوه روسیه. بازدید از کرملین، میدان سرخ، موزه آرمیتاژ و کاخ‌های تاریخی با لیدر تخصصی.'
  },
  {
    id: 'paris-rome',
    title: 'تور اروپایی پاریس و رم',
    type: 'foreign',
    typeLabel: 'تور ترکیبی اروپا',
    destination: 'پاریس',
    origin: 'تهران',
    route: 'تهران به پاریس و رم',
    duration: '۷ شب و ۸ روز',
    nights: 7,
    closestDeparture: '۲۸ شهریور',
    price: 98000000,
    formattedPrice: '۹۸٬۰۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۵:۳۰',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop',
    badge: 'ویزای شنگن',
    features: ['پرواز مستقیم ایران ایر', 'اقامت در هتل‌های ۴ ستاره مرکز شهر'],
    visaRequired: true,
    hotelStars: 4,
    airline: 'ایران ایرلاینز',
    includedServices: ['بلیط رفت و برگشت', 'ویزای شنگن', 'اقامت با صبحانه', 'ترانسفر بین شهری', 'گشت شهری'],
    excludedServices: ['عوارض خروج از کشور', 'ورودی موزه‌ها'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره نووتل پاریس', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۹۸٬۰۰۰٬۰۰۰ تومان' },
    ],
    description: 'سفر به زیباترین شهرهای اروپا؛ بازدید از برج ایفل، موزه لوور، کولوسئوم و واتیکان با خدمات کامل ویزای شنگن.'
  },
  {
    id: 'georgia-tbilisi',
    title: 'تور گرجستان تفلیس و باتومی',
    type: 'foreign',
    typeLabel: 'پکیج آماده',
    destination: 'تفلیس',
    origin: 'تهران',
    route: 'تهران به تفلیس و باتومی',
    duration: '۵ شب و ۶ روز',
    nights: 5,
    closestDeparture: '۲۱ شهریور',
    price: 21500000,
    formattedPrice: '۲۱٬۵۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۶:۲۰',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop',
    badge: 'بدون ویزا',
    features: ['پرواز مستقیم وارش', 'ترانسفر بین تفلیس و باتومی'],
    visaRequired: false,
    hotelStars: 4,
    airline: 'وارش',
    includedServices: ['بلیط رفت و برگشت', 'اقامت با صبحانه', 'ترانسفر فرودگاهی و بین شهری', 'بیمه مسافرتی'],
    excludedServices: ['عوارض خروج از کشور'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره ماریوت تفلیس', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۲۱٬۵۰۰٬۰۰۰ تومان' },
    ],
    description: 'سفر به کشور زیبای گرجستان بدون نیاز به ویزا. طبیعت سرسبز تفلیس و سواحل زیبای دریای سیاه در باتومی.'
  },
  {
    id: 'armenia-yerevan',
    title: 'تور ارمنستان ایروان',
    type: 'foreign',
    typeLabel: 'پکیج اقتصادی',
    destination: 'ایروان',
    origin: 'تهران',
    route: 'تهران به ایروان',
    duration: '۳ شب و ۴ روز',
    nights: 3,
    closestDeparture: '۲۴ شهریور',
    price: 16900000,
    formattedPrice: '۱۶٬۹۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۰۸:۴۵',
    image: 'https://images.unsplash.com/photo-1580837119756-563d608dd119?q=80&w=600&auto=format&fit=crop',
    badge: 'بدون ویزا',
    features: ['پرواز مستقیم آسمان', 'گشت شهری با ناهار'],
    visaRequired: false,
    hotelStars: 3,
    airline: 'آسمان',
    includedServices: ['بلیط هواپیما', 'اقامت با صبحانه', 'گشت شهری', 'ترانسفر فرودگاهی'],
    excludedServices: ['عوارض خروج از کشور'],
    hotelOptions: [
      { name: 'هتل ۴ ستاره آنی پلازا', stars: 4, board: 'صبحانه (BB)', pricePerPerson: '۱۶٬۹۰۰٬۰۰۰ تومان' },
    ],
    description: 'سفر اقتصادی به ایروان ارمنستان. بازدید از کاسکاد، هزارپله و دریاچه سوان با لیدر فارسی زبان.'
  },
  {
    id: 'malaysia-kl',
    title: 'تور مالزی کوالالامپور و لنکاوی',
    type: 'foreign',
    typeLabel: 'پکیج ترکیبی',
    destination: 'کوالالامپور',
    origin: 'تهران',
    route: 'تهران به کوالالامپور و لنکاوی',
    duration: '۷ شب و ۸ روز',
    nights: 7,
    closestDeparture: '۳۰ شهریور',
    price: 52000000,
    formattedPrice: '۵۲٬۰۰۰٬۰۰۰',
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: 'confirmed',
    statusLabel: 'قیمت و ظرفیت تأییدشده',
    updatedAt: 'به‌روزرسانی امروز، ساعت ۱۷:۰۰',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600&auto=format&fit=crop',
    badge: 'استوایی',
    features: ['برج‌های دوقلوی پتروناس', 'پرواز داخلی لنکاوی'],
    visaRequired: false,
    hotelStars: 5,
    airline: 'ماهان',
    includedServices: ['پرواز رفت و برگشت ماهان', 'پرواز داخلی', 'اقامت با صبحانه بوفه', 'گشت شهری', 'سیم‌کارت'],
    excludedServices: ['عوارض خروج از کشور', 'مالیات توریستی مالزی'],
    hotelOptions: [
      { name: 'هتل ۵ ستاره شانگری‌لا کوالالامپور', stars: 5, board: 'صبحانه (BB)', pricePerPerson: '۵۲٬۰۰۰٬۰۰۰ تومان' },
    ],
    description: 'ترکیب مدرنیته و طبیعت مالزی؛ ۴ شب در کوالالامپور و ۳ شب در سواحل آرام جزیره لنکاوی.'
  }
];

export const TOUR_FAQ_ITEMS = [
  {
    q: 'قیمت نمایش داده شده تور برای یک نفر است؟',
    a: 'بله، تمامی قیمت‌های درج شده بر اساس محاسبه «یک نفر بزرگسال در اتاق دو تخته» است. در صورتی که به صورت تکی (اتاق یک تخته) یا همراه کودک سفر می‌کنید، نرخ اتاق و تخت اضافه به صورت دقیق محاسبه خواهد شد.'
  },
  {
    q: 'قیمت تور چه زمانی قطعی می‌شود؟',
    a: 'قیمت تور پس از ثبت درخواست اولیه و استعلام لحظه‌ای پرواز و ظرفیت خالی هتل توسط کارشناسان ریوان سفر قطعی شده و پیش‌فاکتور رسمی صادر می‌گردد.'
  },
  {
    q: 'آیا امکان هماهنگی تلفنی تور وجود دارد؟',
    a: 'بله، شما می‌توانید علاوه بر ثبت درخواست آنلاین در سایت، از طریق تماس تلفنی با شماره ۰۲۶-۳۳۳۵۰۱۳۹ مستقیماً با کارشناسان تور مشورت کنید و درخواست خود را تلفنی ثبت نمایید.'
  },
  {
    q: 'پس از ثبت درخواست چه اتفاقی می‌افتد؟',
    a: 'کارشناس مربوطه حداکثر ظرف ۱۵ الی ۳۰ دقیقه با شما تماس گرفته، شرایط پرواز، مدارک لازم و قیمت نهایی را هماهنگ کرده و لینک پرداخت و مدارک پیش‌قرارداد را برای شما ارسال می‌نماید.'
  },
  {
    q: 'برای تور خارجی چه مدارکی لازم است؟',
    a: 'برای مقاصد بدون ویزا (مانند ترکیه، ارمنستان و گرجستان) داشتن گذرنامه با حداقل ۷ ماه اعتبار کافی است. برای سایر مقاصد (مانند امارات، تایلند، چین و روسیه) مدارک ویزا توسط کارشناسان دریافت و اقدام می‌شود.'
  },
  {
    q: 'شرایط کنسلی تور چگونه محاسبه می‌شود؟',
    a: 'شرایط کنسلی تابع قوانین سازمان هواپیمایی کشوری و مقررات ابلاغی هتل طرف قرارداد است. جریمه کنسلی با توجه به فاصله زمانی تا پرواز و نوع بلیط (سیستمی یا چارتری) متغیر خواهد بود.'
  },
  {
    q: 'هزینه ویزا داخل قیمت تور است؟',
    a: 'در پکیج‌هایی که نیاز به ویزا دارند (مانند دبی، تایلند و چین)، هزینه صدور ویزا در متن پکیج شفاف ذکر شده و معمولاً همراه با پرواز و هتل محاسبه شده است.'
  },
  {
    q: 'برای کودک و نوزاد چگونه قیمت محاسبه می‌شود؟',
    a: 'نرخ نوزاد (زیر ۲ سال) بسیار ناچیز و مربوط به بیمه و بلیط نوزاد است. نرخ کودک ۲ تا ۱۲ سال بر اساس داشتن تخت اضافه یا بدون تخت در هتل محاسبه می‌گردد.'
  },
  {
    q: 'آیا امکان پرداخت اندازه‌ای یا اقساطی وجود دارد؟',
    a: 'برای برخی پکیج‌های پیش‌خرید یا سفر با فاصله زمانی زیاد، امکان پیش‌پرداخت درصد مشخصی در زمان عقد قرارداد و تسویه مابقی تا قبل از پرواز فراهم است.'
  },
  {
    q: 'اگر ظرفیت هتل یا پرواز تأیید نشود چه می‌شود؟',
    a: 'در صورتی که هتل انتخابی پر باشد، کارشناس ما گزینه‌های جایگزین با همان درجه کیفی و موقعیت مکانی را به شما پیشنهاد می‌دهد و در صورت عدم رضایت، کل مبلغ پرداختی بازگردانده می‌شود.'
  }
];

export const RELATED_GUIDE_ARTICLES = [
  {
    id: 'budget-guide',
    title: 'چگونه تور مناسب بودجه خود را انتخاب کنیم؟',
    excerpt: 'راهنمای کاربردی مدیریت هزینه پرواز، انتخاب درجه هتل و زمان مناسب خرید تور برای حداکثر صرفه‌جویی.',
    readTime: '۴ دقیقه',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400&auto=format&fit=crop',
    url: '#budget-guide'
  },
  {
    id: 'package-vs-flight',
    title: 'تفاوت پکیج تور با پرواز و هتل جداگانه چیست؟',
    excerpt: 'چرا خرید پکیج آماده تور در بیشتر موارد ارزان‌تر و امن‌تر از رزرو جداگانه پرواز و هتل آنلاین است؟',
    readTime: '۵ دقیقه',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=400&auto=format&fit=crop',
    url: '#package-vs-flight'
  },
  {
    id: 'foreign-documents',
    title: 'پیش از ثبت درخواست تور خارجی چه مدارکی آماده کنیم؟',
    excerpt: 'چک‌لیست کامل گذرنامه، مدارک شغلی، گواهی تمکن مالی و شرایط اخذ ویزای توریستی کشورهای مختلف.',
    readTime: '۶ دقیقه',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=400&auto=format&fit=crop',
    url: '#foreign-documents'
  }
];
