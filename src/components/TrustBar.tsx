import React from 'react';
import { ShieldCheck, MapPin, PhoneCall, Clock, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TrustBar() {
  const items = [
    {
      id: 'license',
      icon: ShieldCheck,
      title: 'مجوز رسمی گردشگری',
      desc: 'بند الف و ب از وزارت میراث',
      badge: 'استعلام‌پذیر',
      href: '/licenses',
    },
    {
      id: 'location',
      icon: MapPin,
      title: 'دفتر مرکزی مهرشهر',
      desc: 'کرج، بلوار شهرداری، خیابان ۱۰۷',
      badge: 'حضوری',
      href: '/contact',
    },
    {
      id: 'support',
      icon: PhoneCall,
      title: 'پشتیبانی و مشاوره',
      desc: '۰۲۶-۳۳۳۵۰۱۳۹ | مستقیم کارشناسان',
      badge: 'پاسخگویی',
      href: 'tel:02633350139',
    },
    {
      id: 'hours',
      icon: Clock,
      title: 'ساعت کاری شفاف',
      desc: 'شنبه تا چهارشنبه ۹ تا ۱۷ | پنج‌شنبه ۹ تا ۱۳',
      badge: 'رسمی',
    },
  ];

  return (
    <section className="w-full bg-card/90 border-y border-border backdrop-blur-sm relative z-20 py-3 sm:py-3.5">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
          {items.map((item) => {
            const Content = () => (
              <div className="flex items-center justify-between gap-2.5 group p-2 rounded-xl transition-colors hover:bg-muted/70 border border-transparent hover:border-border/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                    <item.icon className="size-5 stroke-[1.8]" />
                  </div>
                  <div className="flex flex-col min-w-0 text-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-[13px] font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border border-border/60 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] leading-tight text-muted-foreground truncate mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
                {item.href && (
                  <ChevronLeft className="size-4 text-muted-foreground/60 group-hover:text-primary group-hover:-translate-x-0.5 transition-all shrink-0 ms-0.5" />
                )}
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
