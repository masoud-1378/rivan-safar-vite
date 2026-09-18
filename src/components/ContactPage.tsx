import React, { useState } from 'react';
import { 
  Phone, MapPin, Clock, Mail, MessageSquare, 
  Building2, Check, Send, ShieldCheck, Sparkles 
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'مشاوره عمومی تور',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Hero Section ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <span className="badge badge-standard mb-3">
            <Phone className="w-3.5 h-3.5" />
            <span>ارتباط با ریوان سفر</span>
          </span>
          <h1 className="text-h1 text-text-heading font-extrabold mb-3">
            تماس با کارشناسان و دفاتر ریوان سفر
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-4">
            برای استعلام تلفنی تورها، بررسی ظرفیت پرواز و هتل‌ها یا هماهنگی مراجعه حضوری، با ما در ارتباط باشید.
          </p>
        </div>
      </section>

      {/* ---------------- Contact Info & Form Grid ---------------- */}
      <section className="container-main px-4 sm:px-6 lg:px-8 max-w-5xl section-standard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right">
          
          {/* Left Column: Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <div className="bg-surface-primary border border-border-default rounded-card p-6 shadow-subtle">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-text-heading">شماره تلفن مستقیم</h3>
                  <span className="text-caption text-text-muted">پاسخگویی در ساعات کاری</span>
                </div>
              </div>
              <a
                href="tel:02633350139"
                className="text-h3 font-extrabold text-brand-navy hover:text-brand-orange transition-colors block font-mono"
                dir="ltr"
              >
                026 - 33350139
              </a>
            </div>

            {/* Address Card */}
            <div className="bg-surface-primary border border-border-default rounded-card p-6 shadow-subtle">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-text-heading">آدرس دفتر مرکزی</h3>
                  <span className="text-caption text-text-muted">جهت عقد قرارداد حضوری</span>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                استان البرز، کرج، گوهردشت، بلوار شهید مطهری، مجتمع گردشگری ریوان سفر
              </p>
            </div>

            {/* Working Hours */}
            <div className="bg-surface-primary border border-border-default rounded-card p-6 shadow-subtle">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-control bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-text-heading">ساعات کاری آژانس</h3>
                  <span className="text-caption text-text-muted">پشتیبانی و استعلام</span>
                </div>
              </div>
              <div className="space-y-1.5 text-body-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>شنبه تا چهارشنبه:</span>
                  <span className="font-bold text-text-heading">۹:۰۰ الی ۱۸:۰۰</span>
                </div>
                <div className="flex justify-between">
                  <span>پنج‌شنبه‌ها:</span>
                  <span className="font-bold text-text-heading">۹:۰۰ الی ۱۴:۰۰</span>
                </div>
                <div className="flex justify-between text-text-muted pt-1">
                  <span>جمعه‌ها و ایام تعطیل رسمی:</span>
                  <span>پشتیبانی اضطراری مسافران در سفر</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Callback & Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-surface-primary border border-border-default rounded-card p-6 md:p-8 shadow-subtle">
              <h2 className="text-h3 font-bold text-text-heading mb-2">ارسال پیام یا درخواست تماس</h2>
              <p className="text-body-sm text-text-secondary mb-6">
                پیام یا درخواست سفر خود را بنویسید؛ کارشناس مربوطه در سریع‌ترین زمان با شما تماس می‌گیرد.
              </p>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-card text-center text-emerald-900">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-h4 font-bold mb-2">پیام شما با موفقیت دریافت شد</h4>
                  <p className="text-body-sm text-emerald-800">
                    کارشناسان ریوان سفر در ساعات کاری پاسخگوی شما هستند.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-bold text-text-heading mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: رضا احمدی"
                        className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-caption font-bold text-text-heading mb-1">شماره تماس همراه <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="09123456789"
                        className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2.5 text-body-sm text-text-heading text-right focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-caption font-bold text-text-heading mb-1">موضوع درخواست</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2.5 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                    >
                      <option value="مشاوره عمومی تور">مشاوره عمومی تور و استعلام قیمت</option>
                      <option value="تورهای نمایشگاهی و تجاری">تورهای نمایشگاهی و تجاری (چین، دبی، اروپا)</option>
                      <option value="خدمات ویزا">خدمات ویزای توریستی و تجاری</option>
                      <option value="انتقادات و پیشنهادات">انتقادات، پیشنهادات و مدیریت</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-bold text-text-heading mb-1">متن پیام یا توضیحات سفر</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="مقصد، تاریخ مد نظر، تعداد نفرات یا سوال مورد نظر..."
                      className="w-full bg-surface-secondary border border-border-default rounded-control px-4 py-2 text-body-sm text-text-heading focus:border-brand-orange focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-medium btn-primary w-full text-btn font-bold inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'در حال ارسال...' : 'ارسال پیام به کارشناس ریوان سفر'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
