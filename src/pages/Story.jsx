
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export function Story() {
  const { t } = useLanguage();

  return (
    <section id="story" className="py-24 bg-zinc-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#707070] uppercase mb-4">{t('story.title')}</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#2d2d2d] mb-8 leading-tight">
              {t('story.subtitle')}{" "}
              <span className="italic font-serif font-light text-[#707070]">
                {t('story.subtitleHighlight')}
              </span>
            </h3>
            <p className="text-[#555555] text-lg leading-relaxed mb-6 font-light">
              {t('story.p1')}
            </p>
            <p className="text-[#555555] text-lg leading-relaxed mb-8 font-light">
              {t('story.p2')}
            </p>
            <div className="w-24 h-[1px] bg-zinc-300"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center"
          >
            <img
              src="/logo.png"
              alt="2B Vision"
              className="w-full max-w-sm object-contain invert"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
