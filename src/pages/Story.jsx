
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
            <h2 className="text-sm font-bold tracking-widest text-[#707070] uppercase mb-4">Our Story</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#2d2d2d] mb-8 leading-tight">
              Every masterpiece starts with a <span className="italic font-serif font-light text-[#707070]">single vision.</span>
            </h3>
            <p className="text-[#555555] text-lg leading-relaxed mb-6 font-light">
              2B Vision was founded by passionate creators who believed that photography and videography aren't just about capturing images, but about telling stories that outlast time.
            </p>
            <p className="text-[#555555] text-lg leading-relaxed mb-8 font-light">
              Starting with just one camera and a grand dream, our path to success was paved with endless dedication, an eye for raw emotion, and a cinematic approach to every project. Today, we are a premier studio trusted by hundreds to document their legacy.
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
