import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

const cities = [
  'کرج',
  'اصفهان',
  'شیراز',
  'مشهد',
  'یزد',
  'تبریز',
  'اهواز',
  'رشت'
];

function FlightPathsBackground() {
  // Distribute points across a 1000x1000 grid for better scaling on both tall (mobile) and wide (desktop) screens
  const flights = [
    // Center cluster (visible on both mobile and desktop)
    { id: 1, d: "M 350,450 Q 500,350 650,400", start: {cx: 350, cy: 450}, end: {cx: 650, cy: 400}, delay: 0 },
    { id: 2, d: "M 650,550 Q 500,650 350,600", start: {cx: 650, cy: 550}, end: {cx: 350, cy: 600}, delay: 1.5 },
    { id: 3, d: "M 400,350 Q 550,250 700,450", start: {cx: 400, cy: 350}, end: {cx: 700, cy: 450}, delay: 3.2 },
    
    // Desktop wide edges (might be cropped on mobile)
    { id: 4, d: "M 150,500 Q 300,400 450,550", start: {cx: 150, cy: 500}, end: {cx: 450, cy: 550}, delay: 0.8 },
    { id: 5, d: "M 850,450 Q 700,350 550,500", start: {cx: 850, cy: 450}, end: {cx: 550, cy: 500}, delay: 2.2 },
    
    // Mobile tall edges (might be cropped on desktop)
    { id: 6, d: "M 450,150 Q 550,300 400,450", start: {cx: 450, cy: 150}, end: {cx: 400, cy: 450}, delay: 3.5 },
    { id: 7, d: "M 550,850 Q 450,700 600,550", start: {cx: 550, cy: 850}, end: {cx: 600, cy: 550}, delay: 2.8 },

    // Diagonals (partially visible depending on aspect)
    { id: 8, d: "M 250,250 Q 400,350 550,250", start: {cx: 250, cy: 250}, end: {cx: 550, cy: 250}, delay: 4.0 },
    { id: 9, d: "M 750,750 Q 600,650 450,750", start: {cx: 750, cy: 750}, end: {cx: 450, cy: 750}, delay: 1.2 },
    { id: 10, d: "M 250,750 Q 400,650 550,750", start: {cx: 250, cy: 750}, end: {cx: 550, cy: 750}, delay: 2.5 },
    { id: 11, d: "M 750,250 Q 600,350 450,250", start: {cx: 750, cy: 250}, end: {cx: 450, cy: 250}, delay: 1.0 },
  ];

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.15]">
      <svg className="w-full h-full text-brand-orange" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {flights.map(flight => (
          <g key={flight.id}>
            <defs>
              <mask id={`mask-path-${flight.id}`}>
                <motion.path
                  d={flight.d}
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 0, 1, 1, 1] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: flight.delay,
                    times: [0, 0.05, 0.35, 0.8, 1],
                    ease: "easeInOut"
                  }}
                />
              </mask>
            </defs>

            {/* Visible dashed path */}
            <motion.path
              d={flight.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 8"
              mask={`url(#mask-path-${flight.id})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.8, 0, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: flight.delay,
                times: [0, 0.05, 0.8, 0.9, 1]
              }}
            />

            {/* Origin point outer pulse */}
            <motion.circle
              cx={flight.start.cx}
              cy={flight.start.cy}
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.2, 1, 1.2, 1.2, 0.2],
                opacity: [0, 0.6, 0, 0, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: flight.delay,
                times: [0, 0.05, 0.15, 0.8, 1]
              }}
            />

            {/* Origin point inner dot */}
            <motion.circle
              cx={flight.start.cx}
              cy={flight.start.cy}
              r="5"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 1, 1, 0],
                opacity: [0, 1, 1, 1, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: flight.delay,
                times: [0, 0.05, 0.8, 0.9, 1]
              }}
            />

            {/* Destination point inner dot */}
            <motion.circle
              cx={flight.end.cx}
              cy={flight.end.cy}
              r="5"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 0, 1, 1, 0],
                opacity: [0, 0, 1, 1, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: flight.delay,
                times: [0, 0.3, 0.35, 0.8, 1] // Matches when path reaches end
              }}
            />
            
            {/* Destination point outer pulse */}
            <motion.circle
              cx={flight.end.cx}
              cy={flight.end.cy}
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 0.2, 1, 1.2, 0.2],
                opacity: [0, 0, 0.6, 0, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: flight.delay,
                times: [0, 0.3, 0.35, 0.45, 1]
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function OriginCities() {
  return (
    <section className="section-standard bg-page-background relative overflow-hidden">
      <FlightPathsBackground />
      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
          <div className="badge badge-brand mb-4">
            <MapPin className="w-3.5 h-3.5" />
            شروع سفر از شهر شما
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-h2 text-text-heading"
          >
            از کدام شهر به سفر می‌روید؟
          </motion.h2>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {cities.map((city, index) => (
            <motion.a
              key={city}
              href={`#tour-from-${city}`}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative bg-surface-primary border border-border-default p-4 sm:p-5 rounded-control sm:rounded-card shadow-subtle hover:shadow-card hover:border-brand-orange/30 transition-all duration-300 flex items-center justify-between overflow-hidden cursor-pointer hover:-translate-y-1"
            >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-page-background group-hover:bg-brand-orange/10 rounded-control sm:rounded-control flex items-center justify-center text-text-secondary group-hover:text-brand-orange transition-colors duration-300 shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-caption sm:text-caption text-text-secondary font-medium mb-0.5">تور از</span>
                   <span className="text-body-sm font-black text-text-heading group-hover:text-brand-orange transition-colors duration-300">
                     {city}
                   </span>
                 </div>
               </div>
               
               {/* Arrow Icon */}
               <div className="text-gray-300 group-hover:text-brand-orange transition-colors duration-300">
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                 </svg>
               </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
