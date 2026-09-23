import React, { useState, useMemo } from 'react';
import { Search, MapPin, Globe, ChevronLeft, Phone, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { type Place } from '../data/destinationsData';
import { useContent } from '@/src/lib/content-context';
import { useContact } from '@/src/lib/contact-context';
import SmartImage from './SmartImage';

interface DestinationsCatalogPageProps {
  onNavigate: (path: string) => void;
}

export default function DestinationsCatalogPage({ onNavigate }: DestinationsCatalogPageProps) {
  const contact = useContact();
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'همه مقصدها' },
    { id: 'turkey', label: 'ترکیه و مقاصد نزدیک' },
    { id: 'domestic', label: 'تورهای داخلی' },
    { id: 'middle_east', label: 'امارات و خاورمیانه' },
    { id: 'asia', label: 'شرق آسیا' },
    { id: 'exhibition', label: 'مقاصد تجاری و نمایشگاهی' },
  ];

  const allDestinations = useMemo(() => {
    return Object.values(cities);
  }, [cities]);

  const filteredDestinations = useMemo(() => {
    return allDestinations.filter((dest) => {
      const matchSearch = 
        dest.name.includes(searchTerm) || 
        dest.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dest.parentCountryName && dest.parentCountryName.includes(searchTerm));
      
      const matchCategory = selectedCategory === 'all' || dest.category === selectedCategory;
      
      return matchSearch && matchCategory;
    });
  }, [allDestinations, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Header & Search ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-right">
          <div className="max-w-3xl">
            <span className="badge badge-standard mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>فهرست کامل مقاصد گردشگری</span>
            </span>
            <h1 className="text-h1 text-text-heading font-extrabold mb-3">
              مقصدهای تور داخلی و خارجی ریوان سفر
            </h1>
            <p className="text-body text-text-secondary leading-relaxed mb-6">
              جهان مقصدهای ریوان سفر را بر اساس سبک سفر، نیاز به ویزا و بودجه بررسی کنید. برای هر مقصد، اطلاعات دقیق پروازها، هتل‌ها، بهترین فصل سفر و شروع قیمت پایه درج شده است.
            </p>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی نام شهر، کشور یا مقصد..."
                  className="w-full bg-surface-secondary border border-border-default rounded-control pr-11 pl-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`chip ${
                    selectedCategory === cat.id ? 'chip-active' : 'chip-standard'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Destinations Grid ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        {filteredDestinations.length === 0 ? (
          <div className="bg-surface-primary border border-border-default rounded-card p-10 text-center max-w-lg mx-auto">
            <p className="text-h4 font-bold text-text-heading mb-2">مقصدی با این مشخصات یافت نشد</p>
            <p className="text-body-sm text-text-secondary mb-4">
              لطفاً املای عبارت جستجو را بررسی کرده یا دسته‌بندی دیگری را انتخاب کنید.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-medium btn-secondary text-btn"
            >
              حذف فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <a
                key={dest.id}
                href={`/destination/${dest.parentCountrySlug || dest.slug}/${dest.slug}`}
                onClick={(e) => { e.preventDefault(); onNavigate(`/destination/${dest.parentCountrySlug || dest.slug}/${dest.slug}`); }}
                className="group bg-surface-primary border border-border-default rounded-card overflow-hidden shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <SmartImage
                    src={dest.image}
                    alt={`تور ${dest.name}`}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-brand-navy/90 text-white px-2.5 py-1 rounded-md text-caption font-bold">
                    {dest.parentCountryName || dest.name}
                  </div>
                  {!dest.visaRequired && (
                    <div className="absolute bottom-3 right-3 bg-emerald-700/90 text-white px-2.5 py-0.5 rounded-md text-caption font-medium">
                      بدون ویزا
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-h4 font-bold text-text-heading mb-1.5 group-hover:text-brand-orange transition-colors">
                      تور {dest.name}
                    </h3>
                    <p className="text-body-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {dest.heroTagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border-default/60 flex items-center justify-between">
                    <div>
                      <span className="block text-caption text-text-secondary">شروع قیمت از:</span>
                      <span className="text-body font-extrabold text-brand-orange">{dest.startingPrice}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-caption font-bold text-text-heading group-hover:text-brand-orange transition-colors">
                      <span>مشاهده جزئیات</span>
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Help & Phone Consultation ---------------- */}
      <section className="bg-surface-primary border-t border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h3 className="text-h3 text-text-heading font-bold mb-2">نیاز به راهنمایی در انتخاب مقصد دارید؟</h3>
          <p className="text-body text-text-secondary max-w-lg mb-5">
            کارشناسان ریوان سفر بر اساس علایق شما، فصل سفر و بودجه در نظر گرفته شده، گزینه‌های متناسب را به شما پیشنهاد می‌کنند.
          </p>
          <a
            href={contact.phoneHref}
            className="btn btn-medium btn-primary text-btn inline-flex items-center gap-2.5 font-bold shadow-subtle"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">{contact.phoneDisplay}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
