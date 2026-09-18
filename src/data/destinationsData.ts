export interface Place {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  type: 'country' | 'city' | 'island' | 'region';
  parentCountrySlug?: string;
  parentCountryName?: string;
  category: 'domestic' | 'turkey' | 'middle_east' | 'asia' | 'europe' | 'exhibition';
  image: string;
  heroTagline: string;
  description: string;
  bestSeason: string;
  visaRequired: boolean;
  visaType?: string;
  flightDuration?: string;
  currency: string;
  startingPrice: string;
  startingPriceNote: string;
  lastVerifiedAt: string;
  activeToursCount: number;
  popularDistricts?: string[];
  keyHighlights: string[];
  travelTips: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedGuides?: string[];
}

export const COUNTRIES: Record<string, Place> = {
  turkey: {
    id: 'country-turkey',
    slug: 'turkey',
    name: 'ترکیه',
    nameEn: 'Turkey',
    type: 'country',
    category: 'turkey',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'سفرهای متنوع شهری، ساحلی و خرید با پروازهای مستقیم روزانه',
    description: 'ترکیه یکی از محبوب‌ترین مقاصد سفر مسافران ایرانی است. شهرهای استانبول، آنتالیا، وان، ترابزون، کوش‌آداسی و بدروم هرکدام سبک متفاوتی از سفر شهری، خرید، طبیعت یا استراحت ساحلی ارائه می‌دهند. برای دارندگان گذرنامه ایرانی، ورود به ترکیه تا ۹۰ روز نیازی به ویزا ندارد.',
    bestSeason: 'بهار و پاییز برای استانبول و شهرهای تاریخی؛ تابستان برای سواحل مدیترانه و اژه',
    visaRequired: false,
    visaType: 'بدون نیاز به ویزا (تا ۹۰ روز)',
    flightDuration: 'حدود ۳ تا ۳.۵ ساعت پرواز از تهران',
    currency: 'لیر ترکیه (TRY) / دلار و یورو',
    startingPrice: '۲۸٬۵۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته با صبحانه',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۱:۰۰',
    activeToursCount: 6,
    keyHighlights: ['بدون نیاز به ویزا', 'پروازهای مستقیم روزانه از تهران', 'تنوع اقامت از هتل اقتصادی تا ریزورت لوکس UALL', 'امکان خریدهای فصلی و مراکز خرید معتبر'],
    travelTips: [
      'برای تردد در استانبول حتما استانبول‌کارت تهیه کنید.',
      'در هتل‌های آنتالیا تفاوت خدمات All و UAll را پیش از انتخاب نهایی بررسی کنید.',
      'همیشه مقداری لیر نقد برای حمل‌ونقل شهری همراه داشته باشید.'
    ],
    faqs: [
      {
        question: 'آیا برای سفر به ترکیه به ویزا نیاز داریم؟',
        answer: 'خیر، دارندگان گذرنامه ایرانی برای اقامت توریستی تا ۹۰ روز نیازی به ویزا ندارند. فقط گذرنامه شما باید حداقل ۶ ماه اعتبار داشته باشد.'
      },
      {
        question: 'تفاوت تورهای استانبول با پروازهای ایرانی و ترک چیست؟',
        answer: 'پروازهای ایرانی معمولاً در فرودگاه استانبول (IST) یا صبیحه فرود می‌آیند و قیمت مقرون‌به‌صرفه‌تری دارند. پرواز ترکیش ایرلاینز ساعات پروازی متنوع‌تر و پذیرایی استاندارد بین‌المللی دارد.'
      }
    ],
    relatedGuides: ['istanbul-districts', 'turkey-visa-rules']
  },
  uae: {
    id: 'country-uae',
    slug: 'uae',
    name: 'امارات متحده عربی',
    nameEn: 'United Arab Emirates',
    type: 'country',
    category: 'middle_east',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'تجربه سفر مدرن، مراکز خرید جهانی، تفریحات خانوادگی و رویدادهای بین‌المللی',
    description: 'امارات با مرکزیت دبی، مقصدی ایده‌آل برای سفرهای لوکس، خرید، رویدادهای تجاری و نمایشگاهی مانند گلفود و جیتکس است. ویزای توریستی امارات به‌صورت الکترونیکی و سریع صادر می‌شود.',
    bestSeason: 'آبان تا فروردین (هوای معتدل و مطبوع)',
    visaRequired: true,
    visaType: 'ویزای الکترونیکی توریستی (۱۴ روزه / ۳۰ روزه)',
    flightDuration: 'حدود ۲ ساعت از تهران',
    currency: 'درهم امارات (AED)',
    startingPrice: '۳۲٬۵۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته با صبحانه و ویزا',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۱:۳۰',
    activeToursCount: 3,
    keyHighlights: ['ویزای سریع الکترونیکی', 'هتل‌های مدرن با دسترسی مترو', 'مقصدی امن و استاندارد برای خانواده‌ها', 'برگزاری بزرگ‌ترین نمایشگاه‌های تجاری منطقه'],
    travelTips: [
      'هزینه مالیات هتل (Tourism Dirham) در هتل‌ها مستقیماً دریافت می‌شود و روی پکیج پایه نیست.',
      'استفاده از متروی دبی با کارت نول بسیار سریع و اقتصادی است.'
    ],
    faqs: [
      {
        question: 'ویزای توریستی دبی چقدر زمان می‌برد؟',
        answer: 'ویزای عادی توریستی دبی معمولاً ظرف ۱ تا ۳ روز کاری صادر می‌شود. برای سفرهای فوری، امکان اقدام سریع وجود دارد.'
      }
    ],
    relatedGuides: ['dubai-budget-guide', 'uae-visa-guide']
  },
  thailand: {
    id: 'country-thailand',
    slug: 'thailand',
    name: 'تایلند',
    nameEn: 'Thailand',
    type: 'country',
    category: 'asia',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'سواحل استوایی، معابد باستانی و تلفیق طبیعت بکر با زندگی شهری پویا',
    description: 'تایلند با شهرهای بانکوک، پوکت و پاتایا یکی از جذاب‌ترین مقاصد شرق آسیا برای سفرهای تفریحی، استراحت ساحلی و تورهای ترکیبی است. ویزای توریستی تایلند نیازمند مدارک شغلی و تمکن مالی متعارف است.',
    bestSeason: 'آبان تا فروردین (فصل خشک و خنک)',
    visaRequired: true,
    visaType: 'ویزای توریستی یک‌بار ورود',
    flightDuration: 'حدود ۶.۵ تا ۷.۵ ساعت پرواز مستقیم',
    currency: 'بات تایلند (THB)',
    startingPrice: '۶۸٬۰۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در تور ترکیبی با پرواز ماهان',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۰:۰۰',
    activeToursCount: 2,
    keyHighlights: ['سواحل زیبای پوکت و جزایر اطراف', 'فرهنگ غنی و معابد باشکوه', 'تنوع غذایی و تفریحات آبی'],
    travelTips: [
      'برای گشت‌های جزیره همیشه کرم ضدآفتاب و لباس ضدآب همراه داشته باشید.',
      'در معابد بودایی پوشش مناسب زانو و شانه الزامی است.'
    ],
    faqs: [
      {
        question: 'مدارک لازم برای ویزای تایلند چیست؟',
        answer: 'اصل گذرنامه با ۷ ماه اعتبار، تمکن مالی به زبان انگلیسی (حداقل ۵۰ میلیون تومان به ازای هر نفر)، عکس پرسنلی، بلیط و واچر هتل.'
      }
    ],
    relatedGuides: ['thailand-first-time', 'thailand-visa-guide']
  },
  iran: {
    id: 'country-iran',
    slug: 'iran',
    name: 'ایران',
    nameEn: 'Iran',
    type: 'country',
    category: 'domestic',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'تورهای داخلی با کیفیت: جزایر خلیج فارس، شهرهای زیارتی و تاریخی',
    description: 'ریوان سفر پکیج‌های منظم تورهای داخلی شامل کیش، مشهد، قشم، شیراز و اصفهان را با انتخاب هتل‌های منتخب و بهترین خطوط پروازی و ریلی ارائه می‌دهد.',
    bestSeason: 'تمام فصول بر اساس مقصد (پاییز و زمستان برای جنوب، بهار برای شیراز و اصفهان)',
    visaRequired: false,
    currency: 'تومان',
    startingPrice: '۹٬۸۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در پکیج ۳ شب کیش',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۲:۳۰',
    activeToursCount: 4,
    keyHighlights: ['برگزاری منظم پروازها', 'امکان انتخاب هتل از ۳ تا ۵ ستاره', 'گزینه‌های متنوع هوایی و ریلی'],
    travelTips: ['در فصول شلوغ مانند تعطیلات نوروز و پاییز، حداقل ۲ هفته زودتر هماهنگی کنید.'],
    faqs: [
      {
        question: 'آیا تورهای مشهد امکان انتخاب قطار ۵ ستاره فدک را دارند؟',
        answer: 'بله، در کنار پرواز، پکیج‌های ریلی مشهد با قطارهای ۵ ستاره فدک، زندگی و نورالرضا قابل انتخاب هستند.'
      }
    ],
    relatedGuides: ['kish-hotel-guide', 'mashhad-train-tips']
  },
  china: {
    id: 'country-china',
    slug: 'china',
    name: 'چین',
    nameEn: 'China',
    type: 'country',
    category: 'exhibition',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'مرکز بازرگانی و صنایع جهان؛ پکیج‌های تخصصی سفر به نمایشگاه کانتون فیر و شهرهای تجاری',
    description: 'چین قطب اصلی سفرهای تجاری و نمایشگاهی است. ریوان سفر مجری مستقیم پکیج‌های سفر به نمایشگاه کانتون فیر گوانگجو، شانگهای و پکن همراه با خدمات اخذ ویزای تجاری، ترانسفر فرودگاهی و مترجم تخصصی است.',
    bestSeason: 'بهار و پاییز (هم‌زمان با فازهای کانتون فیر)',
    visaRequired: true,
    visaType: 'ویزای تجاری (M) یا توریستی (L)',
    flightDuration: 'حدود ۸.۵ ساعت پرواز مستقیم به پکن/گوانگجو',
    currency: 'یوآن چین (CNY)',
    startingPrice: '۱۱۹٬۰۰۰٬۰۰۰ تومان',
    startingPriceNote: 'پکیج تخصصی کانتون فیر با ترانسفر و ویزا',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۴:۰۰',
    activeToursCount: 2,
    keyHighlights: ['پکیج اختصاصی فازهای ۱ و ۲ و ۳ کانتون فیر', 'اخذ ویزای گروهی و انفرادی چین', 'هتل‌های دارای شاتل اختصاصی به نمایشگاه Pazhou'],
    travelTips: [
      'نصب اپلیکیشن‌های پرداخت WeChat Pay و Alipay پیش از سفر به چین اکیداً پیشنهاد می‌شود.',
      'کارت ورود به نمایشگاه کانتون (Buyer Badge) را قبل از سفر ثبت‌نام آنلاین کنید.'
    ],
    faqs: [
      {
        question: 'مهلت اقدام برای ویزای نمایشگاه کانتون فیر چه زمانی است؟',
        answer: 'به دلیل زمان‌بر بودن بررسی مدارک و انگشت‌نگاری، حداقل ۴ تا ۶ هفته قبل از شروع فاز مورد نظر باید پرونده تشکیل شود.'
      }
    ],
    relatedGuides: ['canton-fair-guide', 'china-visa-guide']
  }
};

export const CITIES: Record<string, Place> = {
  istanbul: {
    id: 'city-istanbul',
    slug: 'istanbul',
    name: 'استانبول',
    nameEn: 'Istanbul',
    type: 'city',
    parentCountrySlug: 'turkey',
    parentCountryName: 'ترکیه',
    category: 'turkey',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'پل میان دو قاره؛ پیوند بافت تاریخی، خرید مدرن و کافه‌گردی در بسفر',
    description: 'استانبول برای سفر شهری، خرید، گشت‌های تاریخی در ایاصوفیه و کاخ توپکاپی و تماشای غروب تنگه بسفر بهترین گزینه است. موقعیت هتل و نزدیکی به ایستگاه مترو مهم‌ترین معیار در انتخاب پکیج مناسب است.',
    bestSeason: 'فروردین تا خرداد و شهریور تا آبان (هوای معتدل و مطبوع)',
    visaRequired: false,
    visaType: 'بدون ویزا',
    flightDuration: '۳ ساعت و ۱۵ دقیقه',
    currency: 'لیر ترکیه',
    startingPrice: '۳۵٬۸۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته هتل ۴ ستاره مرکز شهر',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۴:۳۰',
    activeToursCount: 3,
    popularDistricts: ['تکسیم و بی اوغلو', 'شیشلی و عثمان‌بی', 'فاتیح و سلطان‌احمد', 'کادیکوی (بخش آسیایی)'],
    keyHighlights: ['پرواز مستقیم ماهان و قشم‌ایر', 'اقامت در هتل‌های منتخب با صبحانه', 'گشت شهری نیم‌روزه همراه با ناهار', 'ترانسفر فرودگاهی رفت و برگشت'],
    travelTips: [
      'اگر اولین بار است به استانبول سفر می‌کنید، منطقه تکسیم یا شیشلی به دلیل دسترسی آسان به مترو مناسب‌تر است.',
      'فاصله هتل تا ایستگاه مترو را همیشه قبل از نهایی‌کردن هتل بررسی کنید.'
    ],
    faqs: [
      {
        question: 'قیمت تور استانبول شامل چه خدماتی است؟',
        answer: 'بلیط رفت و برگشت هواپیما، اقامت در هتل انتخابی با صبحانه، ترانسفر فرودگاهی، بیمه مسافرتی و یک گشت شهری.'
      },
      {
        question: 'آیا امکان تغییر هتل یا افزودن شب‌های اقامت وجود دارد؟',
        answer: 'بله، پکیج‌ها انعطاف‌پذیر بوده و می‌توانید مدت اقامت (از ۳ تا ۷ شب) و هتل مدنظرتان را با کارشناس تنظیم کنید.'
      }
    ],
    relatedGuides: ['istanbul-districts', 'turkey-visa-rules']
  },
  antalya: {
    id: 'city-antalya',
    slug: 'antalya',
    name: 'آنتالیا',
    nameEn: 'Antalya',
    type: 'city',
    parentCountrySlug: 'turkey',
    parentCountryName: 'ترکیه',
    category: 'turkey',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'پایتخت ریزورت‌های لوکس ساحلی مدیترانه با خدمات کامل Ultra All Inclusive',
    description: 'آنتالیا با ریزورت‌های باشکوه ۵ ستاره در مناطق لارا، بلک، کمر و بلدیبی، مقصدی ایده‌آل برای استراحت، تفریحات آبی خانوادگی و رهایی از دغدغه‌های روزمره است.',
    bestSeason: 'اردیبهشت تا مهر (فصل آفتاب و شنا)',
    visaRequired: false,
    visaType: 'بدون ویزا',
    flightDuration: '۳.۵ ساعت مستقیم یا با پرواز ترک',
    currency: 'لیر ترکیه / یورو',
    startingPrice: '۵۸٬۹۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته هتل ۵ ستاره ساحلی UALL',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۵:۱۰',
    activeToursCount: 2,
    popularDistricts: ['منطقه لارا (نزدیک فرودگاه و ساحل ماسه‌ای)', 'بلک (ریزورت‌های فوق لوکس و گلف)', 'کمر (طبیعت کوهستانی و دریایی)'],
    keyHighlights: ['ریزورت‌های ساحلی با وعده‌های غذایی فراگیر در طول اقامت (UALL)', 'پارک‌های آبی و کلوب‌های کودکان', 'پرواز مستقیم به فرودگاه آنتالیا'],
    travelTips: [
      'در هتل‌های UALL نیازی به هزینه‌های جانبی غذا و نوشیدنی داخل هتل نخواهید داشت.',
      'برای خانواده‌های دارای فرزند، هتل‌های منطقه لارا به دلیل نزدیکی به فرودگاه و ساحل شنی راحت‌ترند.'
    ],
    faqs: [
      {
        question: 'تفاوت پرواز مستقیم و پروازهای به فرودگاه دنیزلی/اسپارتا چیست؟',
        answer: 'پروازهای مستقیم مستقیماً در فرودگاه آنتالیا (AYT) فرود می‌آیند و ترانسفر تا هتل کوتاه است (۲۰ تا ۴۰ دقیقه). پرواز به فرودگاه‌های جایگزین معمولاً حدود ۳ تا ۴ ساعت ترانسفر زمینی با اتوبوس دارد.'
      }
    ],
    relatedGuides: ['antalya-resorts-guide', 'turkey-visa-rules']
  },
  dubai: {
    id: 'city-dubai',
    slug: 'dubai',
    name: 'دبی',
    nameEn: 'Dubai',
    type: 'city',
    parentCountrySlug: 'uae',
    parentCountryName: 'امارات متحده عربی',
    category: 'middle_east',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'شهر آسمان‌خراش‌ها، خرید جهانی، تفریحات مدرن و رویدادهای بین‌المللی',
    description: 'دبی مقصدی چهارفصل برای تجربه تفریحات روز دنیا، پارک‌های موضوعی، سافاری کویر و مراکز خرید مشهور مانند دبی مال و امارات مال است.',
    bestSeason: 'آبان تا فروردین',
    visaRequired: true,
    visaType: 'ویزای الکترونیکی توریستی',
    flightDuration: '۲ ساعت',
    currency: 'درهم امارات',
    startingPrice: '۳۲٬۵۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته با صبحانه و ویزا',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۲:۰۰',
    activeToursCount: 2,
    popularDistricts: ['دانتان و برج خلیفه', 'دبی مارینا و JBR', 'دیره و بر دبی (اقتصادی و تجاری)', 'جاده شیخ زاید'],
    keyHighlights: ['ویزای سریع توریستی', 'پرواز مستقیم ماهان، ایران‌ایر و فلای‌دبی', 'دسترسی سریع به مترو'],
    travelTips: ['برای جابه‌جایی در شهر از مترو و تراموا استفاده کنید تا در هزینه‌های تاکسی صرفه‌جویی شود.'],
    faqs: [
      {
        question: 'هزینه ویزای دبی روی تور محاسبه شده است؟',
        answer: 'بله، در پکیج‌های ریوان سفر هزینه ویزای توریستی در مبلغ کل لحاظ شده است.'
      }
    ],
    relatedGuides: ['dubai-budget-guide', 'uae-visa-guide']
  },
  kish: {
    id: 'city-kish',
    slug: 'kish',
    name: 'کیش',
    nameEn: 'Kish Island',
    type: 'island',
    parentCountrySlug: 'iran',
    parentCountryName: 'ایران',
    category: 'domestic',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'آرامش خلیج فارس، ورزش‌های آبی و خرید در منطقه آزاد بدون نیاز به روادید',
    description: 'جزیره کیش مقصدی محبوب برای سفرهای کوتاه، تفریحات آبی هیجان‌انگیز، غواصی و لذت بردن از ساحل آرام مرجانی است.',
    bestSeason: 'آبان تا اردیبهشت',
    visaRequired: false,
    currency: 'تومان',
    startingPrice: '۹٬۸۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در هتل ۴ ستاره با صبحانه و ترانسفر',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۲:۳۰',
    activeToursCount: 2,
    popularDistricts: ['میدان پردیس و مراکز خرید', 'ساحل مرجان', 'اسکله تفریحی'],
    keyHighlights: ['پروازهای روزانه از تهران و شهرهای اصلی', 'هتل‌های باکیفیت ساحلی', 'ترانسفر فرودگاهی و تخفیف تفریحات'],
    travelTips: ['اجاره خودرو در جزیره کیش نیازمند گواهینامه معتبر و ودیعه است.'],
    faqs: [
      {
        question: 'حداقل مدت تور کیش چقدر است؟',
        answer: 'تورهای کیش معمولاً به‌صورت ۳ شب و ۴ روز یا ۲ شب برگزار می‌شوند که امکان افزایش شب‌های اقامت نیز وجود دارد.'
      }
    ],
    relatedGuides: ['kish-hotel-guide']
  },
  mashhad: {
    id: 'city-mashhad',
    slug: 'mashhad',
    name: 'مشهد مقدس',
    nameEn: 'Mashhad',
    type: 'city',
    parentCountrySlug: 'iran',
    parentCountryName: 'ایران',
    category: 'domestic',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'سفر زیارتی آرام با انتخاب هتل‌های نزدیک به حرم و گزینه‌های ریلی و هوایی',
    description: 'مشهد مقدس با حرم مطهر رضوی مقصدی معنوی است. ریوان سفر هتل‌های نزدیک حرم در خیابان‌های امام رضا و شیرازی را همراه با بلیت رفت و برگشت پرواز یا قطار باکیفیت ارائه می‌دهد.',
    bestSeason: 'تمام ایام سال؛ بهار و پاییز از نظر آب‌وهوایی بسیار دلپذیرند',
    visaRequired: false,
    currency: 'تومان',
    startingPrice: '۶٬۵۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر با قطار ۵ ستاره و هتل نزدیک حرم',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۳:۰۰',
    activeToursCount: 2,
    popularDistricts: ['خیابان امام رضا (نزدیک به باب‌الرضا)', 'خیابان شیرازی', 'خیابان طبرسی'],
    keyHighlights: ['هتل‌های پیاده‌رو تا حرم', 'امکان رزرو هتل با صبحانه، ناهار و شام (فولبرد)', 'پکیج‌های متنوع ریلی و هوایی'],
    travelTips: ['اگر همراهی سالمند یا کودک دارید، هتل‌های دارای ویلچر یا سرویس ون به حرم را انتخاب کنید.'],
    faqs: [
      {
        question: 'آیا پکیج مشهد شامل غذا است؟',
        answer: 'بسته به هتل انتخابی، می‌توانید رزرو را با صبحانه (BB) یا به‌صورت فولبرد (صبحانه، ناهار و شام) انجام دهید.'
      }
    ],
    relatedGuides: ['mashhad-train-tips']
  },
  phuket: {
    id: 'city-phuket',
    slug: 'phuket',
    name: 'پوکت',
    nameEn: 'Phuket',
    type: 'island',
    parentCountrySlug: 'thailand',
    parentCountryName: 'تایلند',
    category: 'asia',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1200&auto=format&fit=crop',
    heroTagline: 'بزرگ‌ترین جزیره تایلند با سواحل نیلگون، صخره‌های آهکی و تورهای قایق‌سواری',
    description: 'پوکت نگین سواحل جنوب تایلند با آب‌های شفاف دریای آندامان، جزیره فی‌فی، خلیج مایا و ریزورت‌های ساحلی است.',
    bestSeason: 'آبان تا فروردین',
    visaRequired: true,
    visaType: 'ویزای توریستی تایلند',
    flightDuration: 'حدود ۷ ساعت',
    currency: 'بات تایلند',
    startingPrice: '۷۲٬۵۰۰٬۰۰۰ تومان',
    startingPriceNote: 'برای هر نفر در اتاق دوتخته با پرواز و صبحانه',
    lastVerifiedAt: '۲۲ مرداد ۱۴۰۵، ساعت ۱۱:۰۰',
    activeToursCount: 1,
    popularDistricts: ['ساحل پاتونگ (پرهیاهو و مراکز خرید)', 'ساحل کارون و کاتا (آرام‌تر و خانوادگی)', 'بنگ تائو (ریزورت‌های لوکس)'],
    keyHighlights: ['ریزورت‌های ساحلی دارای استخر', 'گشت جزایر فی‌فی و جیمز باند', 'طبیعت استوایی کم‌نظیر'],
    travelTips: ['برای تجربه ساحل آرام، سواحل کاتا یا کارون را به جای پاتونگ شلوغ انتخاب کنید.'],
    faqs: [
      {
        question: 'آیا پرواز به پوکت مستقیم است؟',
        answer: 'بسته به فصل و ایرلاین، پروازها می‌توانند مستقیم به پوکت باشند یا با یک توقف کوتاه در بانکوک یا دوحه انجام شوند.'
      }
    ],
    relatedGuides: ['thailand-first-time', 'thailand-visa-guide']
  }
};
