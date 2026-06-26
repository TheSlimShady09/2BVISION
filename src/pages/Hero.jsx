
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

export function Hero() {
  const { setHovering, setDefault } = useCursor();

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
          <source src="/2B Intro.mp4" type="video/mp4" />
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
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight drop-shadow-lg">
            Where your vision becomes <br />
            <span className="italic font-serif font-light text-zinc-200">timeless art.</span>
          </h1>
          <div className="flex justify-center items-center mt-12">
            <a 
              href="#booking"
              onClick={scrollToBooking}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className="group relative px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-none hover:bg-slate-900 transition-colors flex items-center gap-3 overflow-hidden shadow-2xl shadow-black/50"
            >
              <span className="relative z-10 tracking-widest uppercase text-sm">Book a Session</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
