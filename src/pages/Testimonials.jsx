import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import { useLanguage } from '../context/LanguageContext';

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const { setHovering, setDefault } = useCursor();
  const { t } = useLanguage();

  const testimonialItems = t('testimonials.items');

  useEffect(() => {
    if (!Array.isArray(testimonialItems) || testimonialItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonialItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonialItems]);

  if (!Array.isArray(testimonialItems) || testimonialItems.length === 0) {
    return null;
  }

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
                "{testimonialItems[current].text}"
              </p>
              <div>
                <h4 className="text-sm font-bold tracking-widest uppercase text-slate-200">{testimonialItems[current].name}</h4>
                <p className="text-sm text-[#707070] mt-1">{testimonialItems[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonialItems.map((_, idx) => (
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
