
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import { useLanguage } from '../context/LanguageContext';

export function Hero() {
  const { setHovering, setDefault } = useCursor();
  const { t, language } = useLanguage();

  const scrollToBooking = (e) => {
    e.preventDefault();
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source src="/Studio Video.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight drop-shadow-lg">
            {language === 'en' ? (
              <>
                Where your{" "}
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: "1.15em",
                    display: "inline-block",
                  }}
                >
                  Vision
                </span>{" "}
                becomes <br />
                <span className="italic font-serif font-light text-zinc-200">timeless art.</span>
              </>
            ) : (
              <>
                Ku{" "}
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: "1.15em",
                    display: "inline-block",
                  }}
                >
                  Vizioni
                </span>{" "}
                juaj bëhet <br />
                <span className="italic font-serif font-light text-zinc-200">art i përjetshëm.</span>
              </>
            )}
          </h1>
          <div className="flex justify-center items-center mt-12">
            <a 
              href="#booking"
              onClick={scrollToBooking}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className="group relative px-8 py-4 bg-[#2d2d2d] text-white font-bold text-lg rounded-md hover:bg-[#1e1e1e] transition-colors flex items-center gap-3 overflow-hidden shadow-2xl shadow-black/50"
            >
              <span className="relative z-10 tracking-widest uppercase text-sm">{t('hero.bookSession')}</span>
              <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
