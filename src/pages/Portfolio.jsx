import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Portfolio() {
  const [filter, setFilter] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = filter === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.type === filter);

  const nextSlide = () => {
    if (filteredItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = () => {
    if (filteredItems.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const openLightbox = (item) => {
    if (!item) return;
    setActiveMedia(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setTimeout(() => setActiveMedia(null), 300);
  };

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  return (
    <section id="portfolio" className="min-h-screen bg-white flex flex-col py-24 relative overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-slate-900 mb-8">Portfolio</h2>
        
        <div className="flex justify-center gap-4 flex-wrap">
          {['All', 'Photography', 'Videography'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wider uppercase transition-all ${
                filter === tab 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'bg-zinc-100 text-slate-500 hover:bg-zinc-200 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="flex-grow flex items-center justify-center relative w-full h-[60vh] perspective-1000">
        
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="w-12 h-12 text-slate-300 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-slate-400 font-light text-lg">No portfolio items found.</div>
        ) : (
          <>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`${filter}-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="absolute w-[85%] md:w-[60%] h-[50vh] md:h-[60vh] max-w-5xl rounded-none shadow-2xl overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(filteredItems[currentIndex])}
              >
                {filteredItems[currentIndex]?.type === 'Videography' ? (
                  <div className="w-full h-full relative">
                    <video 
                      src={filteredItems[currentIndex].url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={filteredItems[currentIndex]?.url} 
                    alt={filteredItems[currentIndex]?.title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                )}

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">{filteredItems[currentIndex]?.category}</span>
                  <h3 className="text-3xl font-bold text-white mt-2">{filteredItems[currentIndex]?.title}</h3>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 md:left-12 z-20 p-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 md:right-12 z-20 p-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4"
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50"
            >
              <X className="w-10 h-10" />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-7xl w-full h-[85vh] flex items-center justify-center"
            >
              {activeMedia.type === 'Videography' ? (
                <video 
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full shadow-2xl"
                />
              ) : (
                <img 
                  src={activeMedia.url} 
                  alt={activeMedia.title}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              )}
              
              <div className="absolute bottom-[-40px] left-0 text-white">
                <h3 className="text-xl font-bold tracking-wider">{activeMedia.title}</h3>
                <p className="text-zinc-500 text-sm">{activeMedia.type} &bull; {activeMedia.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
