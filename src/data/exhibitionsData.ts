export interface ExhibitionSeries {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  country: string;
  countrySlug: string;
  city: string;
  citySlug: string;
  venue: string;
  officialWebsite: string;
  industry: string;
  industrySlug: string;
  heroTagline: string;
  description: string;
  image: string;
  upcomingEdition: {
    editionSlug: string;
    solarDate: string;
    gregorianDate: string;
    phases: Array<{ name: string; date: string; categories: string[] }>;
    visaDeadline: string;
    flightDuration?: string;
    hotelArea: string;
    startingPrice: string;
    startingPriceNote: string;
  };
  servicesIncluded: string[];
  businessTips: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const EXHIBITION_SERIES: Record<string, ExhibitionSeries> = {
  'canton-fair': {
    id: 'ex-canton-fair',
    slug: 'canton-fair',
    title: 'نمایشگاه بین‌المللی واردات و صادرات چین (کانتون فیر)',
    titleEn: 'China Import and Export Fair (Canton Fair)',
    country: 'چین',
    countrySlug: 'china',
    city: 'گوانگجو',
    citySlug: 'guangzhou',
    venue: 'مجتمع نمایشگاهی پاژو (Pazhou Complex)',
    officialWebsite: 'https://www.cantonfair.org.cn',
    industry: 'بازرگانی، صنایع، الکترونیک و کالاهای مصرفی',
    industrySlug: 'trade-industry',
    heroTagline: 'بزرگ‌ترین رویداد تجاری جهان در گوانگجو چین؛ در ۳ فاز تخصصی',
    description: 'نمایشگاه کانتون فیر گوانگجو معتبرترین و کهن‌ترین نمایشگاه تجاری چین با بیش از ۲۵٬۰۰۰ غرفه‌دار و بیش از ۲۰۰٬۰۰۰ خریدار بین‌المللی از سراسر جهان است. این رویداد در دو نوبت بهاره (آوریل/اردیبهشت) و پاییزه (اکتبر/مهر) در سه فاز کالایی مختلف برگزار می‌شود.',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop',
    upcomingEdition: {
      editionSlug: '2026-autumn',
      solarDate: '۲۴ مهر تا ۱۴ آبان ۱۴۰۵',
      gregorianDate: '15 October – 4 November 2026',
      phases: [
        {
          name: 'فاز ۱ (۱۵ تا ۱۹ اکتبر / ۲۴ تا ۲۸ مهر)',
          date: '۲۴ تا ۲۸ مهر ۱۴۰۵',
          categories: ['الکترونیک و لوازم خانگی', 'تجهیزات روشنایی', 'ماشین‌آلات و تجهیزات صنعتی', 'سخت‌افزار و ابزارآلات', 'خودرو و قطعات یدکی']
        },
        {
          name: 'فاز ۲ (۲۳ تا ۲۷ اکتبر / ۲ تا ۶ آبان)',
          date: '۲ تا ۶ آبان ۱۴۰۵',
          categories: ['کالاهای مصرفی خانگی', 'سرامیک و ظروف', 'دکوراسیون و ساعت', 'هدایا و صنایع دستی', 'مبلمان و تجهیزات باغبانی']
        },
        {
          name: 'فاز ۳ (۳۱ اکتبر تا ۴ نوامبر / ۱۰ تا ۱۴ آبان)',
          date: '۱۰ تا ۱۴ آبان ۱۴۰۵',
          categories: ['منسوجات، پوشاک و کفش', 'محصولات دارویی، بهداشتی و تجهیزات پزشکی', 'محصولات غذایی', 'کیف و لوازم التحریر']
        }
      ],
      visaDeadline: 'حداقل ۳۰ روز کاری پیش از تاریخ پرواز انتخابی',
      hotelArea: 'هتل‌های ۴ و ۵ ستاره مرکز گوانگجو با شاتل رایگان به مجتمع نمایشگاهی Pazhou',
      startingPrice: '۱۱۹٬۰۰۰٬۰۰۰ تومان',
      startingPriceNote: 'برای هر نفر در اتاق دوتخته شامل پرواز، ویزای تجاری، ترانسفر و هتل'
    },
    servicesIncluded: [
      'بلیط رفت و برگشت هواپیمایی ماهان مستقیم به گوانگجو/شنژن',
      'ویزای تجاری یا توریستی گروهی چین',
      'اقامت در هتل‌های ۵ ستاره همراه با صبحانه بوفه',
      'شاتل روزانه رفت و برگشت اختصاصی به نمایشگاه Pazhou',
      'ثبت‌نام آنلاین و صدور کارت خریدار (Buyer Badge)',
      'راهنمای محلی و مترجم فارسی/چینی در صورت درخواست',
      'سیم‌کارت چین با اینترنت پرسرعت',
      'بیمه مسافرتی بین‌المللی با پوشش درمانی کامل'
    ],
    businessTips: [
      'حداقل ۲ ماه قبل از تاریخ شروع نمایشگاه اقدام به تشکیل پرونده ویزای چین نمایید.',
      'حتماً اپلیکیشن‌های WeChat و Alipay را روی گوشی همراه نصب کرده و احراز هویت اولیه را انجام دهید.',
      'کارت ویزیت انگلیسی به تعداد کافی (حداقل ۳۰۰ عدد) همراه داشته باشید.'
    ],
    faqs: [
      {
        question: 'چگونه فاز مناسب حوزه کاری خود را در کانتون فیر انتخاب کنم؟',
        answer: 'کانتون فیر در ۳ فاز مجزا برگزار می‌شود. فاز ۱ برای الکترونیک، ماشین‌آلات و قطعات؛ فاز ۲ برای دکوراسیون، سرامیک و هدایا؛ فاز ۳ برای پوشاک، منسوجات، مواد غذایی و پزشکی است. کارشناسان ما حوزه دقیق صنعت شما را تطبیق می‌دهند.'
      },
      {
        question: 'آیا برای کارت ورود به نمایشگاه باید هزینه جداگانه پرداخت کنیم؟',
        answer: 'در پکیج ریوان سفر، هماهنگی و پیش‌ثبت‌نام اینترنتی کارت ورود خریدار بدون هزینه اضافه انجام می‌شود.'
      }
    ]
  },
  'gulfood': {
    id: 'ex-gulfood',
    slug: 'gulfood',
    title: 'نمایشگاه بین‌المللی صنایع غذایی و نوشیدنی دبی (گلفود)',
    titleEn: 'Gulfood Dubai',
    country: 'امارات',
    countrySlug: 'uae',
    city: 'دبی',
    citySlug: 'dubai',
    venue: 'مرکز تجارت جهانی دبی (Dubai World Trade Centre - DWTC)',
    officialWebsite: 'https://www.gulfood.com',
    industry: 'صنایع غذایی، نوشیدنی، فرآوری و بسته‌بندی',
    industrySlug: 'food-beverage',
    heroTagline: 'بزرگ‌ترین نمایشگاه سالانه مواد غذایی و نوشیدنی جهان در مرکز تجارت جهانی دبی',
    description: 'نمایشگاه گلفود دبی گردهمایی سالانه برترین تولیدکنندگان، توزیع‌کنندگان، زنجیره‌های تأمین و خریداران صنایع غذایی از بیش از ۱۲۰ کشور جهان است.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    upcomingEdition: {
      editionSlug: '2027-annual',
      solarDate: '۲۸ بهمن تا ۲ اسفند ۱۴۰۵',
      gregorianDate: '16 – 20 February 2027',
      phases: [
        {
          name: 'رویداد اصلی گلفود ۵ روزه',
          date: '۲۸ بهمن تا ۲ اسفند ۱۴۰۵',
          categories: ['غلات و دانه‌های روغنی', 'نوشیدنی‌ها', 'لبنیات و فرآورده‌های شیری', 'گوشت و مرغ', 'چربی‌ها و روغن‌های خوراکی', 'محصولات ارگانیک و سلامت']
        }
      ],
      visaDeadline: 'حداقل ۱۰ روز کاری پیش از سفر',
      hotelArea: 'هتل‌های اطراف خیابان شیخ زاید و نزدیک به ایستگاه مترو DWTC',
      startingPrice: '۵۴٬۰۰۰٬۰۰۰ تومان',
      startingPriceNote: 'برای هر نفر در اتاق دوتخته هتل ۴ ستاره نزدیک نمایشگاه با ویزا و بلیط'
    },
    servicesIncluded: [
      'بلیط رفت و برگشت پرواز ماهان / فلای‌دبی',
      'ویزای توریستی امارات',
      'اقامت در هتل‌های منتخب با دسترسی پیاده یا مترو به مرکز تجارت جهانی',
      'ترانسفر فرودگاهی اختصاصی',
      'بیمه مسافرتی معتبر'
    ],
    businessTips: [
      'به دلیل ازدحام شدید اطراف DWTC، رزرو هتل‌های متصل به خط قرمز مترو بیشترین صرفه‌جویی در زمان را به همراه دارد.'
    ],
    faqs: [
      {
        question: 'آیا امکان رزرو بلیت ورودی گلفود از طریق ریوان سفر وجود دارد؟',
        answer: 'بله، کارشناسان بخش نمایشگاهی می‌توانند ثبت‌نام رسمی بج ورود به گلفود را در کنار پکیج اقامتی شما انجام دهند.'
      }
    ]
  },
  'gitex-global': {
    id: 'ex-gitex',
    slug: 'gitex-global',
    title: 'نمایشگاه بین‌المللی فناوری و هوش مصنوعی دبی (جیتکس گلوبال)',
    titleEn: 'GITEX GLOBAL Dubai',
    country: 'امارات',
    countrySlug: 'uae',
    city: 'دبی',
    citySlug: 'dubai',
    venue: 'مرکز تجارت جهانی دبی و دبی هاربر (DWTC & Dubai Harbour)',
    officialWebsite: 'https://www.gitex.com',
    industry: 'فناوری اطلاعات، هوش مصنوعی، ارتباطات و استارتاپ‌ها',
    industrySlug: 'tech-ai',
    heroTagline: 'برترین رویداد فناوری، هوش مصنوعی، امنیت سایبری و اقتصاد دیجیتال خاورمیانه و جهان',
    description: 'جیتکس گلوبال جامع‌ترین نمایشگاه فناوری منطقه برای مشاهده جدیدترین دستاوردهای هوش مصنوعی، مخابرات، محاسبات ابری، استارتاپ‌ها و نرم‌افزارهای سازمانی است.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    upcomingEdition: {
      editionSlug: '2026-autumn',
      solarDate: '۲۱ تا ۲۵ مهر ۱۴۰۵',
      gregorianDate: '12 – 16 October 2026',
      phases: [
        {
          name: 'بخش اصلی جیتکس گلوبال و Expand North Star',
          date: '۲۱ تا ۲۵ مهر ۱۴۰۵',
          categories: ['هوش مصنوعی و یادگیری ماشین', 'امنیت سایبری و شبکه', 'فین‌تک و بلاکچین', 'نرم‌افزارهای ابری و دیتاسنتر', 'استارتاپ‌ها و سرمایه‌گذاری خطرپذیر']
        }
      ],
      visaDeadline: 'حداقل ۱۰ روز کاری قبل از شروع رویداد',
      hotelArea: 'هتل‌های محدوده جاده شیخ زاید، مرکز شهر و دبی مارینا',
      startingPrice: '۴۸٬۵۰۰٬۰۰۰ تومان',
      startingPriceNote: 'برای هر نفر در اتاق دوتخته با ویزا، بلیط و اقامت با صبحانه'
    },
    servicesIncluded: [
      'بلیط هواپیما رفت و برگشت ماهان / قشم ایر',
      'ویزای توریستی امارات',
      'اقامت در هتل‌های ۴ یا ۵ ستاره با صبحانه',
      'ترانسفر فرودگاهی و بیمه مسافرتی'
    ],
    businessTips: ['کارت نول مترو برای دسترسی مستقیم به ورودی DWTC بهترین روش حمل‌ونقل است.'],
    faqs: [
      {
        question: 'فاصله هتل‌ها تا نمایشگاه جیتکس چقدر است؟',
        answer: 'هتل‌های منتخب پکیج جیتکس ریوان سفر در فاصله کمتر از ۳ ایستگاه مترو یا دسترسی پیاده تا DWTC قرار دارند.'
      }
    ]
  }
};
