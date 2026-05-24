import React from 'react';
import { motion } from 'framer-motion';

export function Story() {
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
            <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Our Story</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              Every masterpiece starts with a <span className="italic font-serif font-light text-slate-500">single vision.</span>
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed mb-6 font-light">
              2B Vision was founded by passionate creators who believed that photography and videography aren't just about capturing images, but about telling stories that outlast time.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 font-light">
              Starting with just one camera and a grand dream, our path to success was paved with endless dedication, an eye for raw emotion, and a cinematic approach to every project. Today, we are a premier studio trusted by hundreds to document their legacy.
            </p>
            <div className="w-24 h-[1px] bg-slate-300"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] lg:aspect-square bg-white border border-zinc-200 p-4 shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1554046920-90dcac824bd1?q=80&w=1000&auto=format&fit=crop" 
              alt="2B Vision Team" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
