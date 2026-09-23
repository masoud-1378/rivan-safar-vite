import React, { useState } from 'react';
import { useContact } from '@/src/lib/contact-context';
import {
  Phone,
  Clock,
  MapPin,
  Mail,
  ChevronDown,
  Instagram,
  Send,
  MessageCircle,
  Linkedin,
  ShieldCheck,
  Award,
  FileCheck2,
  Plane
} from 'lucide-react';

const FOOTER_GROUPS = [
  {
    title: 'تورها',
    links: [
      { label: 'تورهای خارجی', path: '/tours/foreign' },
      { label: 'تورهای داخلی', path: '/tours/domestic' },
      { label: 'تورهای نمایشگاهی', path: '/exhibitions' },
      { label: 'همه مقاصد سفر', path: '/destinations' },
      { label: 'مشاهده همه تورها', path: '/tours' },
    ]
  },
  {
    title: 'مقصدهای محبوب',
    links: [
      { label: 'تور استانبول', path: '/destination/turkey/istanbul' },
      { label: 'تور آنتالیا', path: '/destination/turkey/antalya' },
      { label: 'تور دبی', path: '/destination/uae/dubai' },
      { label: 'تور تایلند (پوکت)', path: '/destination/thailand/phuket' },
      { label: 'تور مسکو و سنت پترزبورگ', path: '/tour/russia-moscow' },
    ]
  },
  {
    title: 'خدمات و راهنما',
    links: [
      { label: 'راهنمای ویزای چین', path: '/visa/china' },
      { label: 'راهنمای ویزای امارات', path: '/visa/uae' },
      { label: 'راهنمای سفر و مقالات', path: '/guides' },
      { label: 'شرایط و مقررات', path: '/terms' },
      { label: 'حریم خصوصی', path: '/privacy' },
    ]
  },
  {
    title: 'ریوان سفر',
    links: [
      { label: 'درباره ریوان سفر', path: '/about' },
      { label: 'مجوزها و اصالت ثبتی', path: '/licenses' },
      { label: 'قوانین و شرایط خرید', path: '/terms' },
      { label: 'تماس با ما', path: '/contact' },
    ]
  }
];

const BADGES = [
  {
    title: 'مجوز گردشگری',
    subtitle: 'سازمان میراث فرهنگی',
    icon: Award,
  },
  {
    title: 'نماد اعتماد الکترونیکی',
    subtitle: 'وزارت صمت (اینماد)',
    icon: ShieldCheck,
  },
  {
    title: 'عضو سازمان هواپیمایی',
    subtitle: 'مجوز رسمی بند الف و ب',
    icon: FileCheck2,
  }
];

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const contact = useContact();
  // Mobile accordion state (all closed by default or multiple openable)
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({});

  const toggleAccordion = (index: number) => {
    setOpenAccordions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <footer className="bg-surface-dark text-text-on-dark-secondary relative overflow-hidden text-right font-sans">
      {/* Top Accent Line */}
      <div className="h-[3px] bg-brand-orange w-full" />

      <div className="container-main px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-8">

        {/* Top Info Section: Brand + Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10 items-start">

          {/* Brand Intro (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-control bg-brand-orange flex items-center justify-center text-on-brand shadow-subtle">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-extrabold text-white tracking-tight leading-none">
                  ریوان سفر
                </span>
                <span className="text-caption text-brand-orange font-medium tracking-wide mt-1">
                  آژانس مسافرتی و گردشگری
                </span>
              </div>
            </div>

            <p className="text-body leading-[1.9] text-text-on-dark-secondary max-w-[580px]">
              ریوان سفر؛ همراه شما برای انتخاب، برنامه‌ریزی و بررسی تورهای خارجی، داخلی و نمایشگاهی.
            </p>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-body-sm text-white/70 font-medium ml-2">شبکه‌های اجتماعی:</span>
              <a
                href="#instagram"
                aria-label="اینستاگرام ریوان سفر"
                className="w-9 h-9 rounded-small bg-white/5 hover:bg-brand-orange hover:text-on-brand text-text-on-dark-secondary flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#telegram"
                aria-label="تلگرام ریوان سفر"
                className="w-9 h-9 rounded-small bg-white/5 hover:bg-brand-orange hover:text-on-brand text-text-on-dark-secondary flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="#whatsapp"
                aria-label="واتساپ ریوان سفر"
                className="w-9 h-9 rounded-small bg-white/5 hover:bg-brand-orange hover:text-on-brand text-text-on-dark-secondary flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#linkedin"
                aria-label="لینكدین ریوان سفر"
                className="w-9 h-9 rounded-small bg-white/5 hover:bg-brand-orange hover:text-on-brand text-text-on-dark-secondary flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Details Box (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white/5 rounded-control p-5 sm:p-6 border border-white/10 space-y-3.5">
            <h3 className="text-h4 text-white mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-orange" />
              مشاوره تلفنی
            </h3>

            <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-control border border-white/5">
              <span className="text-body-sm text-text-on-dark-secondary">شماره تماس:</span>
              {contact.showFooterPhone && (
              <a
                href={contact.phoneHref}
                dir="ltr"
                className="text-body-lg font-bold text-white hover:text-brand-orange transition-colors"
              >
                {contact.phoneDisplay}
              </a>
              )}
            </div>

            <div className="space-y-2 text-body-sm text-text-on-dark-secondary/90 pt-1">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                <span>ساعت پاسخگویی: {contact.workingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>نشانی: {contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <span>ایمیل: {contact.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Section: Navigation Columns (Desktop Grid / Mobile Accordion) */}
        <div className="py-10 border-b border-white/10">

          {/* Desktop View (4 columns) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOOTER_GROUPS.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-h4 text-white">
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.path}
                        onClick={(e) => handleNav(link.path, e)}
                        className="text-body-sm text-text-on-dark-secondary hover:text-brand-orange transition-colors inline-block hover:translate-x-[-2px] duration-150 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile View (Accordions) */}
          <div className="md:hidden space-y-1">
            {FOOTER_GROUPS.map((group, idx) => {
              const isOpen = !!openAccordions[idx];
              return (
                <div key={idx} className="border-b border-white/10 last:border-b-0">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full py-3.5 flex items-center justify-between text-right text-white text-body font-medium focus:outline-none"
                  >
                    <span>{group.title}</span>
                    <ChevronDown className={`w-4 h-4 text-brand-orange transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <ul className="pb-4 space-y-2.5 pr-2">
                      {group.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <a
                            href={link.path}
                            onClick={(e) => handleNav(link.path, e)}
                            className="text-body-sm text-text-on-dark-secondary hover:text-brand-orange transition-colors block py-0.5 cursor-pointer"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Official Badges Section */}
        <div className="section-compact border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <span className="text-body-sm text-text-muted font-medium shrink-0">
              مجوزها و نمادهای رسمی:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {BADGES.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-surface-primary text-text-heading px-4 py-2.5 rounded-control border border-white/20 shadow-subtle min-w-[180px]"
                >
                  <div className="w-8 h-8 rounded-small bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                    <badge.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-caption font-bold text-text-heading leading-tight">
                      {badge.title}
                    </span>
                    <span className="text-caption text-text-secondary/80 leading-tight mt-0.5">
                      {badge.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-text-muted">
          <div>
            تمامی حقوق این وب‌سایت متعلق به <span className="text-white font-medium">ریوان سفر</span> است. © ۱۴۰۳
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              onClick={(e) => handleNav('/privacy', e)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              حریم خصوصی
            </a>
            <span className="text-white/20">•</span>
            <a
              href="/terms"
              onClick={(e) => handleNav('/terms', e)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              قوانین استفاده
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
