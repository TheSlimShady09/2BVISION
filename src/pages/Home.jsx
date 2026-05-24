import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// A simple counter component that animates from 0 to `end`
function Counter({ end, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60); // 60 frames per second
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export function Home() {
  const scrollToBooking = (e) => {
    e.preventDefault();
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop" 
            alt="Cinematic photography setup" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 uppercase leading-tight">
              Where your vision becomes <span className="text-zinc-400 italic">timeless art.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light italic">
              Aty ku vizioni juaj kthehet në art të përjetshëm.
            </p>
            <div className="flex justify-center items-center">
              <a 
                href="#booking"
                onClick={scrollToBooking}
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Book a Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">Our Story</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Every masterpiece starts with a <span className="italic text-zinc-400">single vision.</span>
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                2B Vision was founded by passionate creators who believed that photography and videography aren't just about capturing images, but about telling stories that outlast time.
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Starting with just one camera and a grand dream, our path to success was paved with endless dedication, an eye for raw emotion, and a cinematic approach to every project. Today, we are a premier studio trusted by hundreds to document their legacy.
              </p>
              <div className="w-24 h-1 bg-white"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-zinc-900/50"
            >
              <img 
                src="https://images.unsplash.com/photo-1554046920-90dcac824bd1?q=80&w=1000&auto=format&fit=crop" 
                alt="2B Vision Team Cinematic" 
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tighter">
                <Counter end={5} suffix="+" />
              </div>
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Years of Experience</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tighter">
                <Counter end={450} suffix="+" />
              </div>
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Projects Completed</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tighter">
                <Counter end={100} suffix="%" />
              </div>
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Happy Clients</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tighter">
                <Counter end={20} suffix="M+" />
              </div>
              <div className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Video Views</div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
