import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LOCAL_PORTFOLIO = [
  { id: 'local-1', type: 'Videography', category: 'Videography', title: 'A Well-Executed Project', url: '/portfolio-media/portfolio-well-executed.mp4' },
  { id: 'local-2', type: 'Videography', category: 'Commercial', title: 'TV Commercial', url: '/portfolio-media/portfolio-tv-commercial.mp4' },
  { id: 'local-3', type: 'Videography', category: 'Branding', title: 'Branding Identity', url: '/portfolio-media/portfolio-branding.mp4' },
  { id: 'local-4', type: 'Videography', category: 'Commercial', title: 'Car Tint Promotion', url: '/portfolio-media/portfolio-car-tint.mp4' },
  { id: 'local-5', type: 'Videography', category: 'Events', title: 'Promote Your Event', url: '/portfolio-media/portfolio-promote-event.mp4' },
  { id: 'local-6', type: 'Videography', category: 'Videography', title: 'Ride. Shoot. Repeat.', url: '/portfolio-media/portfolio-ride-shoot-repeat.mp4' },
  { id: 'local-7', type: 'Videography', category: 'Events', title: 'Film Events', url: '/portfolio-media/portfolio-film-events.mp4' },
  { id: 'local-8', type: 'Videography', category: 'Events', title: 'Your Event, My Lens', url: '/portfolio-media/portfolio-your-event.mp4' },
  { id: 'local-9', type: 'Photography', category: 'Photography', title: '2B Vision', url: '/portfolio-media/portfolio-photo-1.jpg' },
  { id: 'local-10', type: 'Photography', category: 'Photography', title: '2B Vision', url: '/portfolio-media/portfolio-photo-2.jpg' },
  { id: 'local-11', type: 'Photography', category: 'Photography', title: '2B Vision', url: '/portfolio-media/portfolio-photo-3.jpg' },
];

export function Portfolio() {
  const [filter, setFilter] = useState('All');
  const [portfolioItems, setPortfolioItems] = useState(LOCAL_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setPortfolioItems([...LOCAL_PORTFOLIO, ...data]);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };
    fetchPortfolio();
  }, []);

  const filteredItems = filter === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.type === filter);

  const handleProjectClick = (id) => {
    if (String(id).startsWith('local-')) return;
    navigate(`/project/${id}`);
  };

  return (
    <section id="portfolio" className="min-h-screen bg-white flex flex-col py-24 relative overflow-hidden selection:bg-[#1e1e1e] selection:text-white">
      
      {/* Header & Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold uppercase tracking-widest text-[#2d2d2d] mb-8"
        >
          Portfolio
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          {['All', 'Photography', 'Videography'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                filter === tab 
                  ? 'bg-[#1e1e1e] text-white shadow-xl scale-105' 
                  : 'bg-zinc-100 text-[#707070] hover:bg-zinc-200 hover:text-[#2d2d2d]'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Grid Layout */}
      <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64 w-full">
            <Loader2 className="w-12 h-12 text-[#c8c8c8] animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-slate-400 font-light text-lg">
              {portfolioItems.length === 0 ? 'Portfolio është duke u ndërtuar. Kthehuni së shpejti!' : 'Nuk ka projekte për këtë kategori.'}
            </div>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative group cursor-pointer overflow-hidden bg-zinc-100 aspect-[4/5] md:aspect-square"
                  onClick={() => handleProjectClick(item.id)}
                >
                  {item.type === 'Videography' ? (
                    <div className="w-full h-full relative">
                      <video 
                        src={item.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                        <Play className="w-12 h-12 text-white/80" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-zinc-300 text-xs font-bold uppercase tracking-[0.2em]">{item.category}</span>
                        <h3 className="text-2xl font-bold text-white mt-1 leading-tight">{item.title}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
