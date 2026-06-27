import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

const testimonials = [
  {
    id: 1,
    name: "Arta & Besnik",
    role: "Klientë Dasme",
    text: "2B Vision nuk na filmoi vetëm dasmën; ata kapën thelbin e historisë sonë të dashurisë. Cilësia kinematografike e punës së tyre është e papërsëritshme. U mbetëm pa fjalë."
  },
  {
    id: 2,
    name: "Mirela",
    role: "Drejtoreshë Krijuese",
    text: "Bashkëpunimi me ta për fushatën tonë komerciale ishte një zbulim. Sjellin një nivel sofistikimi dhe elegance minimaliste që ngriti plotësisht markën tonë."
  },
  {
    id: 3,
    name: "Erion",
    role: "Seancë Portretesh",
    text: "Nuk jam ndjerë kurrë kaq rehat para kamerës. Drejtimi i ekipit është i butë, profesional, dhe rezulton në portrete që duken sikur i takojnë një reviste luksoze."
  }
];


export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const { setHovering, setDefault } = useCursor();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-[#1e1e1e] overflow-hidden relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <Quote className="w-16 h-16 text-[#383838] mx-auto mb-8" />
        
        <div className="relative h-[250px] sm:h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-xl md:text-3xl font-light text-white leading-relaxed italic mb-8">
                "{testimonials[current].text}"
              </p>
              <div>
                <h4 className="text-sm font-bold tracking-widest uppercase text-slate-200">{testimonials[current].name}</h4>
                <p className="text-sm text-[#707070] mt-1">{testimonials[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === current ? 'w-8 bg-white' : 'bg-[#383838] hover:bg-[#555555]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
