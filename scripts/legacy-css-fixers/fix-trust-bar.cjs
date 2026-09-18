const fs = require('fs');
let content = fs.readFileSync('src/components/TrustBar.tsx', 'utf8');

const replacement = `import React from 'react';
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
      desc: 'تضمین کتبی خدمات تور',
    }
  ];

  return (
    <section className="w-full bg-surface-primary border-y border-border-default relative z-20 py-8">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item, index) => {
            const Content = () => (
              <div className="info-item">
                <div className="info-item-icon group-hover:bg-brand-orange/20 transition-colors">
                  <item.icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h4 className="info-item-title group-hover:text-brand-orange transition-colors">
                  {item.title}
                </h4>
                <p className="info-item-desc">
                  {item.desc}
                </p>
              </div>
            );

            return (
              <React.Fragment key={item.id}>
                {item.href ? (
                  <a href={item.href} className="group block focus:outline-none focus-visible:bg-brand-orange/5 p-2 rounded-control -m-2 transition-colors hover:bg-surface-secondary/50">
                    <Content />
                  </a>
                ) : (
                  <div className="group p-2">
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
`;

fs.writeFileSync('src/components/TrustBar.tsx', replacement, 'utf8');
