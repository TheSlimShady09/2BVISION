import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import { useLanguage } from '../context/LanguageContext';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { setHovering, setDefault } = useCursor();
  const { t } = useLanguage();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = t('faq.items');

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-[#2d2d2d] mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-[#707070]">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {Array.isArray(faqItems) && faqItems.map((faq, index) => (
            <div 
              key={index} 
              className="border-b border-zinc-200 pb-4"
            >
              <button
                className="w-full flex items-center justify-between py-4 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
              >
                <span className="text-lg font-medium text-[#383838]">{faq.q}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-[#383838] shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-[#555555] leading-relaxed font-light">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
