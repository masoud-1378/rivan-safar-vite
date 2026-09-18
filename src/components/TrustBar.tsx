import React from 'react';
import { ShieldCheck, FileText, Headset, FileCheck } from 'lucide-react';

export default function TrustBar() {
  const items = [
    {
      id: 'license',
      icon: ShieldCheck,
      title: 'مجوز رسمی',
      desc: 'استعلام آسان از وزارتخانه',
      href: '#licenses'
    },
    {
      id: 'price',
      icon: FileText,
      title: 'قیمت شفاف',
      desc: 'بدون هزینه‌های پنهان',
    },
    {
      id: 'support',
      icon: Headset,
      title: 'پشتیبانی ۲۴/۷',
      desc: 'همراه شما در تمام طول سفر',
    },
    {
      id: 'contract',
      icon: FileCheck,
      title: 'قرارداد رسمی',
      desc: 'خدمات تور در قرارداد مکتوب',
    }
  ];

  return (
    <section className="w-full bg-surface-primary border-y border-border-default/80 relative z-20 py-3 sm:py-3.5">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 items-center">
          {items.map((item) => {
            const Content = () => (
              <div className="flex items-center gap-2.5 sm:gap-3 group py-1 px-2 rounded-control transition-colors hover:bg-page-background">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-orange-soft/70 flex items-center justify-center shrink-0 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all shadow-subtle">
                  <item.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col min-w-0 text-right">
                  <span className="text-body-sm font-bold text-text-heading group-hover:text-brand-orange transition-colors truncate">
                    {item.title}
                  </span>
                  <span className="text-[11.5px] leading-tight text-text-secondary truncate hidden xl:inline-block">
                    {item.desc}
                  </span>
                </div>
              </div>
            );

            return (
              <React.Fragment key={item.id}>
                {item.href ? (
                  <a href={item.href} className="block focus:outline-none">
                    <Content />
                  </a>
                ) : (
                  <div>
                    <Content />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

