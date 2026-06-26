import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Counter({ end, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60); 
    
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

export function Stats() {
  return (
    <section id="stats" className="py-20 bg-[#1e1e1e] border-y border-[#2d2d2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-5xl md:text-6xl font-light text-white mb-2 tracking-tighter">
              <Counter end={5} suffix="+" />
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Years of Experience</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-5xl md:text-6xl font-light text-white mb-2 tracking-tighter">
              <Counter end={450} suffix="+" />
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Projects Completed</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-5xl md:text-6xl font-light text-white mb-2 tracking-tighter">
              <Counter end={100} suffix="%" />
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Happy Clients</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-5xl md:text-6xl font-light text-white mb-2 tracking-tighter">
              <Counter end={20} suffix="M+" />
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Video Views</div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
