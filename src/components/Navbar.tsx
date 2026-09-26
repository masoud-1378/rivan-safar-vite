import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, Menu, X, ChevronDown, Map, Globe, Compass,
  MapPin, Plane, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import SmartImage from './SmartImage';
import AnnouncementBar from './AnnouncementBar';
import { useContact } from '@/src/lib/contact-context';

interface NavbarProps {
  showAnnouncement: boolean;
  setShowAnnouncement: (val: boolean) => void;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

const navigation = [
  { name: 'تورهای خارجی', path: '/tours/foreign', hasMegamenu: true },
  { name: 'تورهای داخلی', path: '/tours/domestic', hasMegamenu: true },
  { name: 'تورهای نمایشگاهی', path: '/exhibitions', hasMegamenu: true },
  { name: 'راهنمای سفر و تور', path: '/guides', hasMegamenu: false },
];

const foreignToursData = [
  {
    title: 'تورهای ترکیه',
    links: [
      { name: 'تور استانبول', path: '/destination/turkey/istanbul' },
      { name: 'تور آنتالیا', path: '/destination/turkey/antalya' },
    ],
    viewAll: 'همه تورهای ترکیه',
    path: '/destination/turkey'
  },
  {
    title: 'شرق آسیا',
    links: [
      { name: 'تور تایلند و پوکت', path: '/destination/thailand/phuket' },
      { name: 'تور مالزی', path: '/tour/malaysia-kl' },
    ],
    viewAll: 'همه مقاصد شرق آسیا',
    path: '/destination/thailand'
  },
  {
    title: 'اروپا و روسیه',
    links: [
      { name: 'تور مسکو و سنت پترزبورگ', path: '/tour/russia-moscow' },
      { name: 'تور پاریس و رم', path: '/tour/paris-rome' },
    ],
    viewAll: 'همه تورهای خارجی',
    path: '/tours/foreign'
  },
  {
    title: 'امارات و قفقاز',
    links: [
      { name: 'تور دبی', path: '/destination/uae/dubai' },
      { name: 'تور گرجستان', path: '/tour/georgia-tbilisi' },
      { name: 'تور ارمنستان', path: '/tour/armenia-yerevan' },
    ],
    viewAll: 'همه تورهای خاورمیانه',
    path: '/destination/uae'
  }
];

const domesticToursData = [
  {
    title: 'شهرهای زیارتی و تاریخی',
    links: [
      { name: 'تور مشهد مقدس', path: '/destination/iran/mashhad' },
      { name: 'تور شیراز و اصفهان', path: '/tours/domestic' },
    ],
  },
  {
    title: 'جزیره و ساحلی',
    links: [
      { name: 'تور کیش هتل‌های ساحلی', path: '/destination/iran/kish' },
      { name: 'تور قشم', path: '/tours/domestic' },
    ],
  }
];

const exhibitionToursData = {
  title: 'نمایشگاه‌های بین‌المللی',
  links: [
    { name: 'تور نمایشگاه کنتون فیر چین', path: '/exhibition/canton-fair' },
    { name: 'تور نمایشگاه گلفود دبی', path: '/exhibition/gulfood' },
    { name: 'تور نمایشگاه جیتکس دبی', path: '/exhibition/gitex-global' }
  ]
};

const mobileNavData = [
  {
    name: 'تورهای خارجی',
    path: '/tours/foreign',
    subcategories: [
      {
        title: 'تورهای ترکیه',
        links: [
          { name: 'تور استانبول', path: '/destination/turkey/istanbul' },
          { name: 'تور آنتالیا', path: '/destination/turkey/antalya' }
        ],
        viewAll: 'همه تورهای ترکیه',
        path: '/destination/turkey'
      },
      {
        title: 'شرق آسیا',
        links: [
          { name: 'تور تایلند و پوکت', path: '/destination/thailand/phuket' }
        ],
        viewAll: 'همه تورهای شرق آسیا',
        path: '/destination/thailand'
      },
      {
        title: 'اروپا و روسیه',
        links: [
          { name: 'تور مسکو و روسیه', path: '/tour/russia-moscow' },
          { name: 'تور پاریس و رم', path: '/tour/paris-rome' }
        ],
        viewAll: 'همه تورهای خارجی',
        path: '/tours/foreign'
      },
      {
        title: 'خاورمیانه و قفقاز',
        links: [
          { name: 'تور دبی', path: '/destination/uae/dubai' }
        ],
        viewAll: 'همه تورهای دبی و خاورمیانه',
        path: '/destination/uae'
      }
    ],
    viewAll: 'همه تورهای خارجی'
  },
  {
    name: 'تورهای داخلی',
    path: '/tours/domestic',
    subcategories: [
      {
        title: 'شهرهای زیارتی و فرهنگی',
        links: [
          { name: 'تور مشهد', path: '/destination/iran/mashhad' }
        ],
      },
      {
        title: 'جزیره و ساحلی',
        links: [
          { name: 'تور کیش', path: '/destination/iran/kish' }
        ],
      }
    ],
    viewAll: 'همه تورهای داخلی'
  },
  {
    name: 'تورهای نمایشگاهی',
    path: '/exhibitions',
    subcategories: [
      {
        title: 'نمایشگاه‌های نزدیک',
        links: [
          { name: 'تور نمایشگاه کنتون فیر چین', path: '/exhibition/canton-fair' },
          { name: 'تور نمایشگاه گلفود دبی', path: '/exhibition/gulfood' },
          { name: 'تور نمایشگاه جیتکس دبی', path: '/exhibition/gitex-global' }
        ],
        viewAll: 'مشاهده همه تورهای نمایشگاهی',
        path: '/exhibitions'
      }
    ]
  },
  { name: 'راهنمای سفر و مقالات', path: '/guides' },
];

export default function Navbar({ showAnnouncement, setShowAnnouncement, onNavigate, currentPath = '/' }: NavbarProps) {
  const contact = useContact();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState<string | null>(null);

  // Megamenu state
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuName: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setActiveMenu(menuName);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const handleNavClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveMenu(null);
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  // Close megamenu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close megamenu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.megamenu-container')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[51]">
          <AnnouncementBar onClose={() => setShowAnnouncement(false)} />
        </div>
      )}

      {/* Desktop & Tablet Navbar */}
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b border-border-default ${
          showAnnouncement ? 'top-[38px] md:top-[34px]' : 'top-0'
        } ${
          isScrolled
            ? 'bg-surface-primary/95 backdrop-blur-md shadow-subtle h-[70px]'
            : 'bg-surface-primary h-[80px] md:h-[90px]'
        }`}
      >
        <div className="container-main px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full relative">

          {/* Right Section: Logo */}
          <a
            href="/"
            onClick={(e) => handleNavClick('/', e)}
            className="flex items-center shrink-0 z-10"
            title="صفحه اصلی ریوان سفر"
          >
            <Image
              src="/logo.png"
              alt="آژانس مسافرتی ریوان سفر"
              width={170}
              height={44}
              className="h-[40px] md:h-[44px] w-auto max-w-[150px] md:max-w-[170px] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center gap-2 md:gap-3 group">
              <div className="relative text-brand-orange">
                <span className="text-3xl md:text-5xl font-black font-sans tracking-tighter">R</span>
                <Plane className="w-4 h-4 md:w-5 md:h-5 absolute -top-1 -right-3 md:-right-5 transform rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <div className="flex flex-col border-r-2 border-border-default pr-2 md:pr-3">
                <span className="text-base md:text-price-lg text-text-heading tracking-tight leading-tight">ریوان سفر</span>
              </div>
            </div>
          </a>

          {/* Center Section: Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center flex-1 megamenu-container h-full">
            <ul className="flex items-center gap-6 h-full">
              {navigation.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                return (
                  <li
                    key={item.name}
                    className={`group h-full flex items-center ${item.name === 'تورهای خارجی' ? '' : 'relative'}`}
                    onMouseEnter={item.hasMegamenu ? () => handleMouseEnter(item.name) : undefined}
                    onMouseLeave={item.hasMegamenu ? handleMouseLeave : undefined}
                  >
                    <a
                      href={item.path}
                      onClick={(e) => handleNavClick(item.path, e)}
                      onFocus={item.hasMegamenu ? () => handleMouseEnter(item.name) : undefined}
                      onBlur={item.hasMegamenu ? handleMouseLeave : undefined}
                      className={`flex items-center gap-1.5 h-full text-[15px] font-semibold transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:rounded-small px-2.5 -mx-1 ${
                        isActive ? 'text-brand-orange' : 'text-surface-dark-raised hover:text-brand-orange'
                      }`}
                    >
                      {item.name}
                      {item.hasMegamenu && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                          activeMenu === item.name ? 'rotate-180 text-brand-orange' : 'opacity-70'
                        }`} />
                      )}

                      {/* Active/Hover Line */}
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-brand-orange transition-all duration-300 ${
                        isActive || activeMenu === item.name ? 'w-full' : 'w-0 group-hover:w-6'
                      }`} />
                    </a>

                    {/* Mega Menu */}
                    {item.hasMegamenu && item.name === 'تورهای خارجی' && (
                      <div
                        className={`absolute top-[100%] left-1/2 -translate-x-1/2 w-[1000px] xl:w-[1200px] bg-surface-primary rounded-b-[14px] shadow-floating transition-all duration-300 z-50 overflow-hidden border-t border-border-default ${
                          activeMenu === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                        }`}
                      >
                        <div className="p-7 lg:p-8 grid grid-cols-5 gap-6">
                          {foreignToursData.map((col) => (
                            <div key={col.title}>
                              <h3 className="text-[15px] font-bold text-text-heading mb-4 border-r-2 border-border-brand pr-2.5 leading-snug">
                                {col.title}
                              </h3>
                              <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                  <li key={link.name}>
                                    <a
                                      href={link.path}
                                      onClick={(e) => handleNavClick(link.path, e)}
                                      className="block text-[14px] text-text-secondary hover:text-brand-orange transition-colors leading-relaxed"
                                    >
                                      {link.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                              <a
                                href={col.path}
                                onClick={(e) => handleNavClick(col.path, e)}
                                className="inline-flex items-center gap-1.5 mt-3.5 text-[13px] font-semibold text-text-heading hover:text-brand-orange transition-colors"
                              >
                                <span>{col.viewAll}</span>
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}

                          {/* Offer Column */}
                          <div className="relative w-full h-full min-h-[240px] rounded-control overflow-hidden group/card bg-surface-dark flex flex-col justify-end">
                            <SmartImage
                              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop"
                              alt="مشاوره سفر"
                              className="absolute inset-0 object-cover transition-transform duration-700 group-hover/card:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/40 to-transparent" />
                            <div className="absolute inset-0 p-5 flex flex-col justify-end z-10">
                              <span className="text-white font-bold text-[15px] mb-1.5 leading-tight">مقصدتان را انتخاب نکرده‌اید؟</span>
                              <span className="text-white/80 text-[13px] leading-relaxed mb-4">فقط بودجه و زمان سفرتان را بگویید.</span>
                              <a
                                href={contact.phoneHref}
                                className="btn btn-primary btn-medium w-full text-[13.5px] font-bold shadow-card py-2"
                              >
                                دریافت پیشنهاد از کارشناس
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Foreign Mega Menu Footer */}
                        <div className="bg-page-background border-t border-border-default py-3.5 px-8 flex items-center justify-between">
                          <p className="text-[13.5px] font-medium text-text-heading">مقصد موردنظرتان را در فهرست کامل تورهای خارجی پیدا کنید.</p>
                          <a
                            href="/tours/foreign"
                            onClick={(e) => handleNavClick('/tours/foreign', e)}
                            className="inline-flex items-center gap-2 border-2 border-border-brand text-brand-orange text-[13px] font-bold py-1.5 px-4 rounded-small hover:bg-brand-orange-soft transition-colors whitespace-nowrap"
                          >
                            همه تورهای خارجی
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {item.hasMegamenu && item.name === 'تورهای داخلی' && (
                      <div
                        className={`absolute top-[100%] right-0 w-[560px] bg-surface-primary rounded-b-[14px] shadow-floating transition-all duration-300 z-50 overflow-hidden border-t border-border-default ${
                          activeMenu === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                        }`}
                      >
                        <div className="p-7 grid grid-cols-2 gap-8">
                          {domesticToursData.map((col) => (
                            <div key={col.title}>
                              <h3 className="text-[15px] font-bold text-text-heading mb-4 border-r-2 border-border-brand pr-2.5 leading-snug">
                                {col.title}
                              </h3>
                              <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                  <li key={link.name}>
                                    <a
                                      href={link.path}
                                      onClick={(e) => handleNavClick(link.path, e)}
                                      className="block text-[14px] text-text-secondary hover:text-brand-orange transition-colors leading-relaxed"
                                    >
                                      {link.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Domestic Mega Menu Footer */}
                        <div className="bg-page-background border-t border-border-default py-3.5 px-6 flex items-center justify-between gap-4">
                          <p className="text-[13.5px] font-medium text-text-heading">مقصد موردنظرتان را در فهرست کامل تورهای داخلی پیدا کنید.</p>
                          <a
                            href="/tours/domestic"
                            onClick={(e) => handleNavClick('/tours/domestic', e)}
                            className="inline-flex items-center justify-center shrink-0 gap-2 border-2 border-border-brand text-brand-orange text-[13px] font-bold py-1.5 px-4 rounded-small hover:bg-brand-orange-soft transition-colors whitespace-nowrap"
                          >
                            همه تورهای داخلی
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {item.hasMegamenu && item.name === 'تورهای نمایشگاهی' && (
                      <div
                        className={`absolute top-[100%] right-0 w-[500px] bg-surface-primary rounded-b-[14px] shadow-floating transition-all duration-300 z-50 overflow-hidden border-t border-border-default ${
                          activeMenu === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                        }`}
                      >
                        <div className="p-7 grid grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-[15px] font-bold text-text-heading mb-4 border-r-2 border-border-brand pr-2.5 leading-snug">
                              {exhibitionToursData.title}
                            </h3>
                            <ul className="flex flex-col gap-3">
                              {exhibitionToursData.links.map((link) => (
                                <li key={link.name}>
                                  <a
                                    href={link.path}
                                    onClick={(e) => handleNavClick(link.path, e)}
                                    className="block text-[14px] text-text-secondary hover:text-brand-orange transition-colors leading-relaxed"
                                  >
                                    {link.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Promo Box */}
                          <div className="bg-page-background rounded-control p-5 flex flex-col justify-center text-center border border-border-default/50">
                            <p className="text-[13.5px] font-medium text-text-heading leading-relaxed mb-4">
                              برای سفرهای تجاری و نمایشگاهی به تور اختصاصی نیاز دارید؟
                            </p>
                            <a
                              href={contact.phoneHref}
                              className="btn btn-primary btn-medium text-[13px] font-bold shadow-subtle inline-flex justify-center py-2"
                            >
                              مشاوره تور نمایشگاهی
                            </a>
                          </div>
                        </div>

                        {/* Exhibition Mega Menu Footer */}
                        <div className="bg-page-background border-t border-border-default py-3.5 px-6 flex items-center justify-between gap-4">
                          <p className="text-[13.5px] font-medium text-text-heading">فهرست کامل تورهای نمایشگاهی را ببینید.</p>
                          <a
                            href="/exhibitions"
                            onClick={(e) => handleNavClick('/exhibitions', e)}
                            className="inline-flex items-center justify-center shrink-0 gap-2 border-2 border-border-brand text-brand-orange text-[13px] font-bold py-1.5 px-4 rounded-small hover:bg-brand-orange-soft transition-colors whitespace-nowrap"
                          >
                            تورهای نمایشگاهی
                            <ArrowLeft className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Left Section: Contact Block & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {contact.showHeaderPhone && (
            <a
              href={contact.phoneHref}
              className="hidden sm:flex items-center gap-3 group px-3 py-1.5 hover:bg-page-background rounded-control transition-colors"
            >
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[12px] font-medium text-text-secondary transition-colors">مشاوره و ثبت درخواست</span>
                <span className="text-[15px] font-bold text-text-heading mt-0.5 group-hover:text-brand-orange transition-colors" dir="ltr">{contact.phoneDisplay}</span>
              </div>
              <Phone className="w-5 h-5 text-brand-orange" strokeWidth={1.5} />
            </a>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              className="lg:!hidden flex items-center justify-center w-11 h-11 rounded-control text-text-heading hover:text-brand-orange hover:bg-page-background transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[400px] bg-surface-primary z-[70] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-center p-5 border-b border-border-default relative">
                <div className="flex items-center gap-2 relative text-brand-orange">
                  <span className="text-3xl font-black font-sans tracking-tighter">R</span>
                  <Plane className="w-4 h-4 absolute -top-1 -right-3 transform rotate-45" />
                  <span className="text-lg font-black text-text-heading mr-2 border-r-2 border-border-default pr-2">ریوان سفر</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="icon-btn icon-btn-medium absolute left-5 bg-page-background text-text-secondary hover:bg-brand-orange-soft hover:text-brand-orange"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <nav className="space-y-3">
                  {mobileNavData.map((item) => (
                    <div key={item.name} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (item.subcategories) {
                            setMobileExpanded(mobileExpanded === item.name ? null : item.name);
                            setMobileSubExpanded(null);
                          } else {
                            handleNavClick(item.path);
                          }
                        }}
                        className={`flex items-center justify-between p-4 rounded-card font-bold transition-colors ${
                          mobileExpanded === item.name
                            ? 'bg-brand-orange-soft text-brand-orange'
                            : 'bg-page-background text-text-heading hover:bg-brand-orange-soft hover:text-brand-orange'
                        }`}
                      >
                        {item.name}
                        {item.subcategories && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpanded === item.name ? 'rotate-180 text-brand-orange' : 'opacity-50'}`} />
                        )}
                      </button>

                      <AnimatePresence>
                        {item.subcategories && mobileExpanded === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 pb-2 pl-4 pr-2 space-y-2 border-r-2 border-border-brand/30 mr-2 mt-2">
                              {item.subcategories.map((sub) => {
                                const isAlwaysOpen = item.name === 'تورهای نمایشگاهی';
                                const isExpanded = isAlwaysOpen || mobileSubExpanded === sub.title;

                                return (
                                <div key={sub.title} className="flex flex-col">
                                  {isAlwaysOpen ? (
                                    <div className="flex items-center justify-between p-3 rounded-control text-body-sm font-bold text-text-heading">
                                      {sub.title}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setMobileSubExpanded(mobileSubExpanded === sub.title ? null : sub.title)}
                                      className={`flex items-center justify-between p-3 rounded-control text-body-sm font-semibold transition-colors ${
                                        mobileSubExpanded === sub.title ? 'text-brand-orange bg-brand-orange-soft/50' : 'text-text-primary hover:bg-page-background'
                                      }`}
                                    >
                                      {sub.title}
                                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSubExpanded === sub.title ? 'rotate-180 text-brand-orange' : 'opacity-50'}`} />
                                    </button>
                                  )}

                                  <AnimatePresence initial={false}>
                                    {isExpanded && (
                                      <motion.div
                                        initial={isAlwaysOpen ? false : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={isAlwaysOpen ? undefined : { height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="flex flex-col gap-2 pt-2 pb-1 pr-4">
                                          {sub.links.map(link => (
                                            <button
                                              key={link.name}
                                              onClick={() => handleNavClick(link.path)}
                                              className="text-body-sm text-right text-text-secondary hover:text-brand-orange py-1.5 transition-colors"
                                            >
                                              {link.name}
                                            </button>
                                          ))}
                                          {sub.viewAll && sub.path && (
                                            <button
                                              onClick={() => handleNavClick(sub.path!)}
                                              className="text-body-sm font-medium text-text-heading hover:text-brand-orange py-1.5 transition-colors inline-flex items-center gap-1.5 mt-3"
                                            >
                                              <span>{sub.viewAll}</span>
                                              <ArrowLeft className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )})}

                              {item.viewAll && (
                                <button
                                  onClick={() => handleNavClick(item.path)}
                                  className="btn btn-outline btn-medium w-full mt-3 text-btn border-border-brand text-brand-orange"
                                >
                                  {item.viewAll}
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-5 border-t border-border-default bg-surface-primary shadow-subtle">
                <div className="bg-page-background rounded-card p-4 border border-border-default text-center">
                  <p className="text-body-sm text-text-heading font-bold mb-3">برای انتخاب تور نیاز به راهنمایی داری؟</p>
                  <a
                    href={contact.phoneHref}
                    className="btn btn-primary btn-medium text-btn w-full shadow-subtle mb-2.5"
                  >
                    <Phone className="w-4 h-4 animate-pulse" />
                    <span className="text-body-lg tracking-wider font-semibold mt-0.5" dir="ltr">{contact.phoneDisplay}</span>
                  </a>
                  <p className="text-caption text-text-secondary font-medium">{contact.workingHours}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Persistent across all pages) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-primary shadow-card z-[45] rounded-t-2xl border-t border-border-default h-14 px-6 flex justify-between items-center pb-safe">

          {/* Menu Button (Opens Drawer) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-brand-orange transition-colors"
          >
            <Compass className="w-5 h-5" />
            <span className="text-caption font-bold">منو</span>
          </button>

          {/* Main CTA: Call */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center gap-1.5 pointer-events-none">
            <a
              href={contact.phoneHref}
              className="pointer-events-auto bg-brand-orange text-on-brand w-14 h-14 rounded-card flex items-center justify-center shadow-card border-[3px] border-white hover:scale-105 transition-transform"
            >
              <Phone className="w-6 h-6" />
            </a>
          </div>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/982633350139"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-[#25D366] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.177-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="text-caption font-bold">واتس‌اپ</span>
          </a>

      </div>
    </>
  );
}

