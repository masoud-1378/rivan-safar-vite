const fs = require('fs');

let content = fs.readFileSync('src/components/TravelNeeds.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-4 lg:gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {TRAVEL_NEEDS.map((item, idx) => (
             <motion.a 
               key={item.id}
               href={\`#\${item.id}\`}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.05, duration: 0.4 }}
               className="card-need"
             >
               <div className="card-need-header">
                 <div className="card-need-icon-wrapper">
                   <item.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-orange" strokeWidth={1.75} />
                 </div>
                 <ArrowLeft className="w-4 h-4 card-need-arrow md:hidden" />
               </div>
               
               <div className="card-need-content">
                 <h3 className="card-need-title">
                   {item.title}
                 </h3>
                 <p className="card-need-desc">
                   {item.desc}
                 </p>
               </div>
               
               <ArrowLeft className="w-5 h-5 card-need-arrow hidden md:block shrink-0 ml-2" />
             </motion.a>
          ))}
        </div>
      </div>
    </section>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/TravelNeeds.tsx', content, 'utf8');

