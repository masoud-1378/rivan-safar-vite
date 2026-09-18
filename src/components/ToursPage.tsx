import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, ChevronDown, Check, ArrowLeft, Phone, Calendar, 
  MapPin, SlidersHorizontal, Info, Clock, Sparkles, X, ShieldCheck, 
  HelpCircle, ChevronUp, Layers, Compass, Plane, FileText, ExternalLink,
  Users, CheckCircle2, AlertCircle, Building2, Headset, FileCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type TourItem, TOUR_FAQ_ITEMS } from '../data/toursData';
import { useContent } from '@/src/lib/content-context';
import { submitLead } from '../../app/actions/lead';
import { trackLeadSubmit } from '../lib/analytics';
import SmartImage from './SmartImage';
import TourListItem from './TourListItem';

interface ToursPageProps {
  onGoHome?: () => void;
}

export default function ToursPage({ onGoHome }: ToursPageProps) {
  const { tours, countries, cities, guides, exhibitions } = useContent();
  const router = useRouter();

  /** ناوبری به صفحه واقعی تور (سند ۰۳: لینک به صفحه پکیج) */
  const navigateToTour = (tourId: string) => {
    router.push(`/tour/${tourId}`);
  };

  // --- Search & Filter States ---
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPassengers, setSelectedPassengers] = useState<number>(1);
  const [flexibleDate, setFlexibleDate] = useState<boolean>(false);

  // Expanded filters
  const [priceRange, setPriceRange] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [visaFreeOnly, setVisaFreeOnly] = useState<boolean>(false);
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [hotelStarFilter, setHotelStarFilter] = useState<string>('all');
  const [airlineFilter, setAirlineFilter] = useState<string>('all');
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('default');

  // Comparison
  const [comparedTourIds, setComparedTourIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Modal / Drawer
  const [selectedDetailTour, setSelectedDetailTour] = useState<TourItem | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Booking Form Modal State inside Detail Modal
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    mobile: '',
    passengers: 2,
    selectedHotel: '',
    notes: ''
  });

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Destination Search Dropdown
  const [showDestDropdown, setShowDestDropdown] = useState<boolean>(false);

  const popularDestinations = ['استانبول', 'دبی', 'آنتالیا', 'کیش', 'مشهد', 'گوانگجو', 'پوکت', 'مسکو'];

  // --- Filter Logic ---
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Type
      if (selectedType !== 'all') {
        if (selectedType === 'foreign' && tour.type !== 'foreign') return false;
        if (selectedType === 'domestic' && tour.type !== 'domestic') return false;
        if (selectedType === 'exhibition' && tour.type !== 'exhibition') return false;
      }

      // Destination search
      if (searchDestination.trim()) {
        const destLower = searchDestination.trim().toLowerCase();
        const matchesDest = tour.destination.toLowerCase().includes(destLower);
        const matchesTitle = tour.title.toLowerCase().includes(destLower);
        if (!matchesDest && !matchesTitle) return false;
      }

      // Month
      if (selectedMonth !== 'all') {
        if (!tour.closestDeparture.includes(selectedMonth)) return false;
      }

      // Visa free
      if (visaFreeOnly && tour.visaRequired) return false;

      // Price Range
      if (priceRange === 'under-30m' && tour.price >= 30000000) return false;
      if (priceRange === '30m-60m' && (tour.price < 30000000 || tour.price > 60000000)) return false;
      if (priceRange === 'above-60m' && tour.price <= 60000000) return false;

      // Duration
      if (durationFilter === 'short' && tour.nights > 3) return false;
      if (durationFilter === 'medium' && (tour.nights < 4 || tour.nights > 6)) return false;
      if (durationFilter === 'long' && tour.nights < 7) return false;

      // Origin
      if (originFilter !== 'all' && tour.origin !== originFilter) return false;

      // Hotel Stars
      if (hotelStarFilter !== 'all' && tour.hotelStars.toString() !== hotelStarFilter) return false;

      // Airline
      if (airlineFilter !== 'all' && !tour.airline.includes(airlineFilter)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'duration-short') return a.nights - b.nights;
      return 0; // default order
    });
  }, [
    tours, selectedType, searchDestination, selectedMonth, visaFreeOnly,
    priceRange, durationFilter, originFilter, hotelStarFilter, airlineFilter, sortBy
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (searchDestination) count++;
    if (selectedMonth !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (durationFilter !== 'all') count++;
    if (visaFreeOnly) count++;
    if (originFilter !== 'all') count++;
    if (hotelStarFilter !== 'all') count++;
    if (airlineFilter !== 'all') count++;
    return count;
  }, [
    selectedType, searchDestination, selectedMonth, priceRange, 
    durationFilter, visaFreeOnly, originFilter, hotelStarFilter, airlineFilter
  ]);

  const clearAllFilters = () => {
    setSelectedType('all');
    setSearchDestination('');
    setSelectedMonth('all');
    setPriceRange('all');
    setDurationFilter('all');
    setVisaFreeOnly(false);
    setOriginFilter('all');
    setHotelStarFilter('all');
    setAirlineFilter('all');
    setFlexibleDate(false);
  };

  const handleToggleCompare = (id: string) => {
    if (comparedTourIds.includes(id)) {
      setComparedTourIds(prev => prev.filter(item => item !== id));
    } else {
      if (comparedTourIds.length >= 3) {
        alert('حداکثر ۳ تور را می‌توانید همزمان مقایسه کنید.');
        return;
      }
      setComparedTourIds(prev => [...prev, id]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitLead({
      fullName: bookingForm.name,
      phone: bookingForm.mobile,
      sourcePath: '/tours',
      tourContext: selectedDetailTour?.title,
      destinationHint: selectedDetailTour?.destination,
      passengers: String(bookingForm.passengers),
      notes: bookingForm.selectedHotel ? `هتل: ${bookingForm.selectedHotel}` : undefined,
    });
    setSelectedDetailTour(null);
    setBookingForm({ name: '', mobile: '', passengers: 2, selectedHotel: '', notes: '' });
    if (result.ok) trackLeadSubmit('/tours', result.stored);
    alert(result.message);
  };

  return (
    <div className="bg-page-background text-text-primary min-h-screen pb-24 lg:pb-12 dir-rtl">
      
      {/* ---------------- 1. Breadcrumb ---------------- */}
      <div className="container-main px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        <nav className="flex items-center gap-2 text-caption md:text-body-sm text-text-secondary font-medium">
          <button 
            onClick={onGoHome}
            className="hover:text-brand-orange transition-colors focus:outline-none"
          >
            صفحه اصلی
          </button>
          <span className="text-text-secondary/50">←</span>
          <span className="text-text-heading font-semibold">تورها</span>
        </nav>
      </div>

      {/* ---------------- 2. Compact Hero ---------------- */}
      <section className="bg-page-background border-b border-border-default/60 relative overflow-hidden section-standard">
        {/* Subtle background flight path graphic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
          <svg className="w-full h-full max-w-[1200px]" viewBox="0 0 1000 300" fill="none" stroke="currentColor">
            <path d="M 50 250 Q 300 50, 600 200 T 950 50" strokeWidth="3" strokeDasharray="8 8" className="text-text-heading" />
          </svg>
        </div>

        <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <h1 className="text-h1 text-text-heading mb-6 md:mb-8">
            تورهای مسافرتی داخلی و خارجی
          </h1>

          <p className="text-body text-text-secondary max-w-subtitle mx-auto leading-relaxed mb-6">
            تورهای داخلی، خارجی و نمایشگاهی را بررسی کنید، تاریخ‌ها و قیمت‌ها را مقایسه کنید و برای گزینه مناسب، درخواست تماس ثبت نمایید.
          </p>



        </div>
      </section>

      {/* ---------------- 6 & 7. Main Tour Catalog Section & Layout ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-standard">
        
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-default/70">
          <div>
            <h2 className="text-h2 text-text-heading">
              {searchDestination 
                ? `تورهای ${searchDestination}` 
                : selectedType === 'foreign' ? 'تورهای خارجی فعال'
                : selectedType === 'domestic' ? 'تورهای داخلی فعال'
                : selectedType === 'exhibition' ? 'تورهای نمایشگاهی فعال'
                : 'تورهای فعال'}
            </h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {filteredTours.length > 0 
                ? `${filteredTours.length} تور متناسب با جست‌وجوی شما پیدا شد.`
                : 'هیچ توری مطابق با فیلترهای انتخابی یافت نشد.'}
            </p>
          </div>

          {/* Controls: Sorting + Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            
            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-surface-primary border border-border-default px-3.5 py-2 rounded-control text-body-sm font-bold text-text-heading shadow-subtle"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
              <span>فیلترها ({activeFiltersCount})</span>
            </button>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-body-sm">
              <span className="text-text-secondary font-medium shrink-0 hidden sm:inline">مرتب‌سازی:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input form-select font-bold shadow-subtle !h-10"
              >
                <option value="default">پیشنهاد ریوان سفر</option>
                <option value="price-low">قیمت پایه (کم به زیاد)</option>
                <option value="price-high">قیمت پایه (زیاد به کم)</option>
                <option value="duration-short">کوتاه‌ترین مدت سفر</option>
              </select>
            </div>

          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mb-6 bg-surface-primary p-3 md:p-4 rounded-control border border-border-default overflow-x-auto whitespace-nowrap scrollbar-hide">
            {selectedType !== 'all' && (
              <span className="chip chip-small chip-selected">
                {selectedType === 'foreign' ? 'خارجی' : selectedType === 'domestic' ? 'داخلی' : 'نمایشگاهی'}
                <button onClick={() => setSelectedType('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {searchDestination && (
              <span className="chip chip-small chip-selected">
                {searchDestination}
                <button onClick={() => setSearchDestination('')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {selectedMonth !== 'all' && (
              <span className="chip chip-small chip-selected">
                {selectedMonth}
                <button onClick={() => setSelectedMonth('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {visaFreeOnly && (
              <span className="chip chip-small chip-selected">
                بدون ویزا
                <button onClick={() => setVisaFreeOnly(false)} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="chip chip-small chip-selected">
                {priceRange === 'under-30m' ? 'تا ۳۰ میلیون' : priceRange === '30m-60m' ? '۳۰ تا ۶۰ میلیون' : 'بالای ۶۰ میلیون'}
                <button onClick={() => setPriceRange('all')} className="mr-1 hover:text-brand-orange-hover"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-link text-caption mr-auto mr-4 shrink-0"
            >
              پاک کردن همه
            </button>
          </div>
        )}
        
        {/* Catalog 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ---------------- 8. Sidebar Filters (Desktop) ---------------- */}
          <aside className="hidden lg:block lg:col-span-3 filter-sidebar sticky top-28 shadow-subtle">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-default">
              <h3 className="text-h4 text-text-heading flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                فیلترهای تور
              </h3>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearAllFilters} 
                  className="text-link text-[11.5px]"
                >
                  حذف همه
                </button>
              )}
            </div>

            <div className="space-y-5 text-right">
              {/* Filter 1: Travel Type */}
              <div>
                <label className="text-body-sm font-bold text-text-heading mb-2 block">نوع سفر</label>
                <div className="space-y-1.5 text-body-sm">
                  {[
                    { id: 'all', label: 'همه تورها' },
                    { id: 'foreign', label: 'تورهای خارجی' },
                    { id: 'domestic', label: 'تورهای داخلی' },
                    { id: 'exhibition', label: 'تورهای نمایشگاهی' },
                  ].map(item => (
                    <label key={item.id} className="form-control-wrap text-text-primary hover:text-brand-orange font-medium">
                      <input 
                        type="radio" 
                        name="sideType" 
                        checked={selectedType === item.id}
                        onChange={() => setSelectedType(item.id)}
                        className="form-radio"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 2: Price Range */}
              <div className="pt-4 border-t border-border-default/60">
                <label className="text-body-sm font-bold text-text-heading mb-2 block">بازه قیمت (برای هر نفر)</label>
                <div className="space-y-1.5 text-body-sm">
                  {[
                    { id: 'all', label: 'همه قیمت‌ها' },
                    { id: 'under-30m', label: 'تا ۳۰ میلیون تومان' },
                    { id: '30m-60m', label: '۳۰ تا ۶۰ میلیون تومان' },
                    { id: 'above-60m', label: 'بالای ۶۰ میلیون تومان' },
                  ].map(item => (
                    <label key={item.id} className="form-control-wrap text-text-primary hover:text-brand-orange font-medium">
                      <input 
                        type="radio" 
                        name="sidePrice" 
                        checked={priceRange === item.id}
                        onChange={() => setPriceRange(item.id)}
                        className="form-radio"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 3: Duration */}
              <div className="pt-4 border-t border-border-default/60">
                <label className="text-body-sm font-bold text-text-heading mb-2 block">مدت سفر</label>
                <div className="space-y-1.5 text-body-sm">
                  {[
                    { id: 'all', label: 'همه مدت‌ها' },
                    { id: 'short', label: 'تا ۳ شب (سفر کوتاه)' },
                    { id: 'medium', label: '۴ تا ۶ شب' },
                    { id: 'long', label: '۷ شب و بیشتر' },
                  ].map(item => (
                    <label key={item.id} className="form-control-wrap text-text-primary hover:text-brand-orange font-medium">
                      <input 
                        type="radio" 
                        name="sideDuration" 
                        checked={durationFilter === item.id}
                        onChange={() => setDurationFilter(item.id)}
                        className="form-radio"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 4: Visa Free Switch */}
              <div className="pt-4 border-t border-border-default/60">
                <label className="form-control-wrap justify-between">
                  <span className="text-form-label text-text-heading">فقط تورهای بدون ویزا</span>
                  <input 
                    type="checkbox"
                    checked={visaFreeOnly}
                    onChange={(e) => setVisaFreeOnly(e.target.checked)}
                    className="form-checkbox"
                  />
                </label>
              </div>

              {/* Collapsible Additional Filters */}
              <div className="pt-4 border-t border-border-default/60">
                <button
                  type="button"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className="flex items-center justify-between w-full text-body-sm font-bold text-brand-orange"
                >
                  <span>فیلترهای بیشتر (مبدأ، هتل، ایرلاین)</span>
                  {showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMoreFilters && (
                  <div className="mt-3 space-y-4 pt-2 border-t border-border-default/40 text-caption">
                    
                    {/* Origin */}
                    <div>
                      <label className="form-label mb-2 block">شهر مبدأ:</label>
                      <select 
                        value={originFilter}
                        onChange={(e) => setOriginFilter(e.target.value)}
                        className="form-input form-select text-body-sm"
                      >
                        <option value="all">همه مبدأها</option>
                        <option value="تهران">تهران</option>
                        <option value="مشهد">مشهد</option>
                        <option value="اصفهان">اصفهان</option>
                      </select>
                    </div>

                    {/* Hotel Star */}
                    <div>
                      <label className="form-label mb-2 block">درجه هتل:</label>
                      <select 
                        value={hotelStarFilter}
                        onChange={(e) => setHotelStarFilter(e.target.value)}
                        className="form-input form-select text-body-sm"
                      >
                        <option value="all">همه درجه‌ها</option>
                        <option value="5">هتل‌های ۵ ستاره</option>
                        <option value="4">هتل‌های ۴ ستاره</option>
                        <option value="3">هتل‌های ۳ ستاره</option>
                      </select>
                    </div>

                    {/* Airline */}
                    <div>
                      <label className="form-label mb-2 block">ایرلاین:</label>
                      <select 
                        value={airlineFilter}
                        onChange={(e) => setAirlineFilter(e.target.value)}
                        className="form-input form-select text-body-sm"
                      >
                        <option value="all">همه ایرلاین‌ها</option>
                        <option value="ماهان">ماهان ایر</option>
                        <option value="ترکیش">ترکیش ایرلاینز</option>
                        <option value="ایران ایرلاینز">ایران ایرلاینز</option>
                      </select>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ---------------- 10 & 11. Tour Cards Results Grid ---------------- */}
          <main className="lg:col-span-9">
            
            {filteredTours.length > 0 ? (
              <div className="flex flex-col gap-4 sm:gap-5 pt-2 pb-6">
                {filteredTours.slice(0, visibleCount).map((tour) => (
                  <TourListItem
                    key={tour.id}
                    title={tour.title}
                    image={tour.image}
                    duration={tour.duration}
                    badge={tour.badge === 'بدون ویزا' ? undefined : tour.badge}
                    visaRequired={tour.visaRequired}
                    visaFree={!tour.visaRequired}
                    price={tour.formattedPrice}
                    pricePending={tour.status === 'pending'}
                    soldOut={tour.status === 'full'}
                    closestDeparture={tour.closestDeparture}
                    origin={tour.origin}
                    href={`/tour/${tour.id}`}
                    onClick={() => navigateToTour(tour.id)}
                  />
                ))}
              </div>
            ) : (
              /* ---------------- 14 & 15. Limited / Zero Results State ---------------- */
              <div className="bg-surface-primary rounded-card border border-border-default p-8 text-center max-w-xl mx-auto">
                <AlertCircle className="w-12 h-12 text-brand-orange mx-auto mb-3 opacity-80" />
                <h3 className="text-h3 text-text-heading mb-2">برای این ترکیب، تور فعالی پیدا نکردیم</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
                  تاریخ یا بودجه را تغییر بده یا اجازه بده کارشناس ریوان سفر گزینه‌های نزدیک را بررسی کند.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={clearAllFilters}
                    className="btn btn-primary btn-medium text-btn w-full sm:w-auto"
                  >
                    پاک‌کردن فیلترها
                  </button>
                  <a 
                    href="tel:02633350139"
                    className="btn btn-outline btn-medium text-btn w-full sm:w-auto"
                  >
                    درخواست بررسی توسط کارشناس
                  </a>
                </div>

                  {/* Alternative destination options */}
                  <div className="mt-8 pt-6 border-t border-border-default text-right">
                    <span className="text-caption font-bold text-text-heading block mb-3">مقصدهای جایگزین پیشنهادی:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {tours.slice(0, 3).map(alt => (
                      <button
                        key={alt.id}
                        onClick={() => setSelectedDetailTour(alt)}
                        className="bg-page-background p-3 rounded-control border border-border-default/60 hover:border-border-brand transition-colors text-right"
                      >
                        <span className="font-bold text-body-sm text-text-heading block">{alt.title}</span>
                        <span className="text-caption text-brand-orange font-semibold">{alt.formattedPrice} تومان</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- 13. Load More Pagination ---------------- */}
            {filteredTours.length > visibleCount && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="btn btn-outline btn-medium text-btn px-8 shadow-subtle bg-surface-primary"
                >
                  نمایش تورهای بیشتر ({filteredTours.length - visibleCount} تور باقی‌مانده)
                </button>
              </div>
            )}

          </main>

        </div>

      </section>

      {/* ---------------- 12. Comparison Floating Bar & Modal ---------------- */}
      {comparedTourIds.length > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-dark text-white px-5 py-3 rounded-card shadow-2xl border border-white/20 flex items-center gap-4 dir-rtl">
          <span className="text-body-sm font-bold">
            {comparedTourIds.length} تور برای مقایسه انتخاب شده
          </span>
          <button
            onClick={() => setShowCompareModal(true)}
            className="btn btn-primary btn-small text-btn"
          >
            مشاهده مقایسه
          </button>
          <button
            onClick={() => setComparedTourIds([])}
            className="text-link !text-white/80 hover:!text-white text-caption"
          >
            انصراف
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 dir-rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-primary rounded-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-right shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-default">
                <h3 className="text-h3 text-text-heading">جدول مقایسه تورهای انتخابی</h3>
                <button onClick={() => setShowCompareModal(false)} className="icon-btn icon-btn-small text-text-secondary hover:text-text-heading">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-body-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border-default bg-page-background">
                      <th className="p-3 font-bold text-text-heading">معیار مقایسه</th>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return item ? (
                          <th key={id} className="p-3 font-bold text-text-heading min-w-[200px]">
                            {item.title}
                          </th>
                        ) : null;
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 font-medium">
                    <tr>
                      <td className="p-3 font-bold text-text-secondary bg-page-background/50">قیمت شروع</td>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return <td key={id} className="p-3 text-price text-brand-orange">{item?.formattedPrice} تومان</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-text-secondary bg-page-background/50">مدت سفر</td>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return <td key={id} className="p-3 text-text-heading">{item?.duration}</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-text-secondary bg-page-background/50">ایرلاین / پرواز</td>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return <td key={id} className="p-3 text-text-heading">{item?.airline}</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-text-secondary bg-page-background/50">وضعیت ویزا</td>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return <td key={id} className="p-3 text-text-heading">{item?.visaRequired ? 'نیازمند ویزا' : 'بدون نیاز به ویزا'}</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-text-secondary bg-page-background/50">خدمات شامل</td>
                      {comparedTourIds.map(id => {
                        const item = tours.find(t => t.id === id);
                        return (
                          <td key={id} className="p-3 text-text-primary text-caption leading-relaxed">
                            {item?.includedServices.slice(0, 3).join(' • ')}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- 16. Haven't Chosen a Destination Yet? Block ---------------- */}
      <section className="bg-surface-primary border-y border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h3 className="text-h3 text-text-heading mb-2">هنوز تور یا مقصدتان را انتخاب نکردید؟</h3>
          <p className="text-body text-text-secondary mb-5">با کارشناس ریوان سفر تماس بگیرید</p>
          <a
            href="tel:02633350139"
            className="btn btn-medium btn-primary text-btn font-bold inline-flex items-center gap-2.5 shadow-subtle hover:shadow-card transition-all"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">۰۲۶ - ۳۳۳۵۰۱۳۹</span>
          </a>
        </div>
      </section>

      {/* ---------------- 17. How is a Tour Booked at Rivan Safar? ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-compact bg-page-background rounded-feature border border-border-default/80">
        <div className="text-center mb-8">
          <h2 className="text-h2 text-text-heading mb-2">
            ثبت درخواست تور در ریوان سفر چگونه انجام می‌شود؟
          </h2>
          <p className="text-body-sm text-text-secondary">فرایند ۴ مرحله‌ای شفاف ثبت درخواست تا عقد قرارداد تور</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '۱', title: '۱. تور را انتخاب کنید', desc: 'مقصد، تاریخ و پکیج مناسب را بررسی نمایید.' },
            { step: '۲', title: '۲. درخواست تماس ثبت کنید', desc: 'اطلاعات تماس و تعداد مسافران را وارد نمایید.' },
            { step: '۳', title: '۳. قیمت و ظرفیت تأیید می‌شود', desc: 'کارشناس وضعیت پرواز، هتل و ظرفیت را بررسی می‌کند.' },
            { step: '۴', title: '۴. قرارداد و هماهنگی نهایی انجام می‌شود', desc: 'پس از تأیید شرایط، قرارداد و مدارک سفر را دریافت می‌نمایید.' }
          ].map((item) => (
            <div key={item.step} className="bg-surface-primary p-5 rounded-card border border-border-default/60 shadow-subtle text-right relative">
              <span className="w-8 h-8 rounded-full bg-brand-orange text-on-brand font-black text-body-sm flex items-center justify-center mb-3">
                {item.step}
              </span>
              <h3 className="text-h4 text-text-heading mb-1.5">{item.title}</h3>
              <p className="text-body-sm text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 19. Tour Selection Guide ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-compact">
        <h2 className="text-h2 text-text-heading mb-6 md:mb-8 text-right">برای انتخاب تور به چه چیزهایی توجه کنیم؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right text-body-sm text-text-primary leading-relaxed">
          <div className="bg-surface-primary p-4 rounded-control border border-border-default">
            <h4 className="text-h4 text-text-heading mb-1">تفاوت پکیج آماده و پرواز + هتل</h4>
            <p className="text-text-secondary">پکیج آماده شامل لیدر، گشت و ترانسفر است در حالی که ترکیب پرواز و هتل انعطاف برنامه‌ریزی شخصی بیشتری به شما می‌دهد.</p>
          </div>
          <div className="bg-surface-primary p-4 rounded-control border border-border-default">
            <h4 className="text-h4 text-text-heading mb-1">تأثیر تاریخ و هتل بر قیمت</h4>
            <p className="text-text-secondary">سفر در ایام وسط هفته یا اوایل فصل پاییز تا ۳۰٪ هزینه‌های تور را نسبت به ایام پیک تعطیلات کاهش می‌دهد.</p>
          </div>
          <div className="bg-surface-primary p-4 rounded-control border border-border-default">
            <h4 className="text-h4 text-text-heading mb-1">مدارک و زمان موردنیاز ویزا</h4>
            <p className="text-text-secondary">برای مقاصد با ویزا حتماً از ۱۰ تا ۱۴ روز قبل مدارک شغلی و پاسپورت با ۷ ماه اعتبار آماده شود.</p>
          </div>
        </div>
      </section>

      {/* ---------------- 20. Related Guides (real, from GUIDES registry) ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-compact">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-text-heading mb-6 md:mb-8">راهنماهای مرتبط انتخاب تور</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(guides).map(guide => (
            <article key={guide.id} className="bg-surface-primary rounded-card border border-border-default overflow-hidden text-right shadow-subtle flex flex-col justify-between">
              <div>
                <div className="relative w-full h-40">
                  <SmartImage src={guide.heroImage} alt={guide.title} className="object-cover" />
                </div>
                <div className="p-4">
                  <span className="text-caption font-bold text-brand-orange block mb-1">{guide.categoryLabel} · {guide.readTime}</span>
                  <h3 className="font-bold text-[14.5px] text-text-heading mb-2 leading-snug">{guide.title}</h3>
                  <p className="text-caption text-text-secondary leading-relaxed">{guide.summary}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <a href={`/guide/${guide.slug}`} className="text-link text-btn">
                  مطالعه راهنما <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- 21. SEO Content ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-compact">
        <div className="bg-surface-primary rounded-card border border-border-default p-6 md:p-8 text-right leading-relaxed">
          <h2 className="text-h2 text-text-heading mb-6 md:mb-8">بررسی و انتخاب تور مسافرتی با ریوان سفر</h2>
          <p className="text-body-sm text-text-secondary mb-4">
            بررسی و مقایسه تور مسافرتی پیش از سفر، به برنامه‌ریزی بدون دغدغه کمک می‌کند. آژانس مسافرتی ریوان سفر با ارائه تنوع وسیعی از تورهای داخلی (کیش، مشهد، قشم)، تورهای خارجی (ترکیه، دبی، تایلند، روسیه، اروپا) و تورهای تخصصی نمایشگاهی، شرایطی را فراهم کرده تا مسافران عزیز بتوانند مناسب‌ترین گزینه را بر اساس بودجه و سلیقه خود انتخاب کنند.
          </p>
          <p className="text-body-sm text-text-secondary">
            تمامی پکیج‌های ارائه‌شده شامل شفافیت کامل در خصوص نوع پرواز، درجه کیفی هتل‌ها، خدمات جانبی (ترانسفر، بیمه، گشت و ویزا) بوده و پشتیبانی کامل کارشناسان از زمان مشاوره تا پایان سفر همراه شماست.
          </p>
        </div>
      </section>

      {/* ---------------- 22. Tour Reservation FAQ Section ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 section-compact">
        <div className="text-center mb-8">
          <h2 className="text-h2 text-text-heading mb-2">سؤالات متداول ثبت درخواست تور</h2>
          <p className="text-body-sm text-text-secondary">پاسخ شفاف به متداول‌ترین ابهامات مسافران پیش از ثبت درخواست تماس</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 dir-rtl text-right">
          {TOUR_FAQ_ITEMS.map((faq, idx) => (
            <div key={idx} className="bg-surface-primary rounded-control border border-border-default overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 font-bold text-[14px] text-text-heading flex items-center justify-between text-right hover:text-brand-orange transition-colors"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-brand-orange" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-body-sm text-text-secondary leading-relaxed border-t border-border-default/40 pt-3 bg-page-background/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Tour Detail & Reservation Modal ---------------- */}
      <AnimatePresence>
        {selectedDetailTour && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[90] flex items-center justify-center p-4 dir-rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-primary rounded-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-right shadow-2xl"
            >
              <button 
                onClick={() => setSelectedDetailTour(null)}
                className="absolute top-4 left-4 icon-btn icon-btn-medium bg-page-background text-text-secondary hover:text-text-heading rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-caption font-bold text-brand-orange mb-1">
                <span>{selectedDetailTour.typeLabel}</span>
                <span>•</span>
                <span>{selectedDetailTour.route}</span>
              </div>

              <h2 className="text-h2 text-text-heading mb-6 md:mb-8">{selectedDetailTour.title}</h2>

              <div className="aspect-video w-full rounded-control overflow-hidden mb-6 relative">
                <SmartImage src={selectedDetailTour.image} alt={selectedDetailTour.title} className="object-cover" />
              </div>

              <p className="text-body-sm text-text-primary leading-relaxed mb-6">
                {selectedDetailTour.description}
              </p>

              {/* Hotel options */}
              <div className="mb-6">
                <h4 className="text-h4 text-text-heading mb-6 md:mb-8">هتل‌های قابل انتخاب در این پکیج:</h4>
                <div className="space-y-2">
                  {selectedDetailTour.hotelOptions.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-control border border-border-default bg-page-background text-body-sm">
                      <div>
                        <span className="font-bold text-text-heading">{h.name}</span>
                        <span className="text-amber-500 font-bold ml-2">({'★'.repeat(h.stars)})</span>
                        <span className="text-caption text-text-secondary block">{h.board}</span>
                      </div>
                      <span className="font-bold text-brand-orange">{h.pricePerPerson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-caption">
                <div className="bg-emerald-50/60 p-3 rounded-control border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-2">خدمات شامل:</span>
                  <ul className="space-y-1">
                    {selectedDetailTour.includedServices.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-emerald-900">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50/60 p-3 rounded-control border border-rose-200">
                  <span className="font-bold text-rose-800 block mb-2">خدمات غیرشامل:</span>
                  <ul className="space-y-1">
                    {selectedDetailTour.excludedServices.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-rose-900">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Booking Request Form */}
              <form onSubmit={handleBookingSubmit} className="bg-surface-dark text-white p-5 rounded-card text-right">
                <h3 className="text-h4 mb-3">ثبت درخواست تماس برای این تور</h3>
                <p className="text-caption text-white/80 mb-4">
                  با ثبت این فرم، کارشناسان ریوان سفر در ساعات کاری ظرفیت نهایی و قیمت را با شما هماهنگ می‌کنند.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-field">
                    <label className="form-label form-label-required !text-white">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      required
                      placeholder="مثلاً علی احمدی" 
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                      className="form-input !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 focus:!border-brand-orange"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required !text-white">شماره موبایل</label>
                    <input 
                      type="tel" 
                      required
                      dir="ltr"
                      placeholder="مثلاً 09123456789" 
                      value={bookingForm.mobile}
                      onChange={(e) => setBookingForm({...bookingForm, mobile: e.target.value})}
                      className="form-input !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 focus:!border-brand-orange text-left"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={bookingSubmitted}
                  className="btn btn-primary btn-large text-btn w-full"
                >
                  {bookingSubmitted ? 'در حال ارسال...' : 'ثبت درخواست تماس برای این تور'}
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- Mobile Bottom Sheet Filters ---------------- */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/60 z-[95] flex items-end dir-rtl">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-surface-primary rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 text-right"
            >
              <div className="filter-panel-header">
                <h3 className="text-h4 text-text-heading">فیلترهای انتخاب تور</h3>
                <button onClick={() => setShowMobileFilters(false)} className="icon-btn icon-btn-medium text-text-secondary hover:text-text-heading">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="filter-panel-body space-y-4 text-body-sm">
                <div>
                  <label className="form-label mb-2 block">نوع سفر:</label>
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="all">همه تورها</option>
                    <option value="foreign">خارجی</option>
                    <option value="domestic">داخلی</option>
                    <option value="exhibition">نمایشگاهی</option>
                  </select>
                </div>

                <div>
                  <label className="form-label mb-2 block">بازه قیمت:</label>
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="all">همه قیمت‌ها</option>
                    <option value="under-30m">تا ۳۰ میلیون تومان</option>
                    <option value="30m-60m">۳۰ تا ۶۰ میلیون تومان</option>
                    <option value="above-60m">بالای ۶۰ میلیون تومان</option>
                  </select>
                </div>

              </div>
              <div className="filter-panel-footer">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="btn btn-primary w-full"
                >
                  نمایش نتایج ({filteredTours.length} تور)
                </button>
                <button 
                  onClick={clearAllFilters}
                  className="btn btn-secondary"
                >
                  پاک کردن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
