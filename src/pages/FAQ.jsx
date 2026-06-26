import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

const faqs = [
  {
    question: "How far in advance should we book?",
    answer: "For weddings, we recommend booking 9-12 months in advance as our calendar fills quickly. For portraits and commercial sessions, 4-6 weeks is usually sufficient."
  },
  {
    question: "Do you travel for destination weddings?",
    answer: "Absolutely. We are available for assignments worldwide. Travel and accommodation fees are calculated based on the destination and added to your package."
  },
  {
    question: "When will we receive our final photos/video?",
    answer: "Portrait galleries are delivered within 2 weeks. Full wedding galleries and cinematic films are typically delivered within 6-8 weeks, ensuring meticulous attention to editing."
  },
  {
    question: "Do we get raw, unedited files?",
    answer: "We do not provide raw files. Editing is half the magic of our cinematic style, and we only deliver finished, color-graded masterpieces that represent our brand standard."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { setHovering, setDefault } = useCursor();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-slate-900 mb-4">FAQ</h2>
          <p className="text-slate-500">Common questions about our process.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
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
                <span className="text-lg font-medium text-slate-800">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-800 shrink-0" />
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
                    <p className="pb-6 text-slate-600 leading-relaxed font-light">
                      {faq.answer}
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
