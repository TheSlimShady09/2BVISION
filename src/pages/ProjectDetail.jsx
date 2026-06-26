import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHovering, setDefault } = useCursor();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Projekti nuk u gjet ose ka ndodhur një gabim.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 text-white">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Error</h2>
        <p className="text-zinc-500 mb-8">{error || 'Project not found.'}</p>
        <button 
          onClick={() => navigate('/#portfolio')}
          className="px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs font-bold"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/#portfolio')}
          onMouseEnter={setHovering}
          onMouseLeave={setDefault}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 uppercase tracking-widest text-xs font-bold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kthehu te Portfolio
        </motion.button>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] block mb-4">
                {project.type} &bull; {project.category}
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight leading-none">
                {project.title}
              </h1>
            </div>
            <div className="text-zinc-500 text-sm font-light uppercase tracking-wider">
              {new Date(project.created_at).getFullYear()}
            </div>
          </div>
          
          <div className="w-full h-[60vh] md:h-[75vh] relative overflow-hidden bg-zinc-900 group">
            {project.type === 'Videography' ? (
              <video 
                src={project.url}
                autoPlay
                loop
                muted
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={project.url} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            )}
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-800 pt-16"
        >
          <div className="md:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Rreth Projektit</h3>
            <div className="space-y-4">
              <div>
                <span className="text-zinc-600 text-xs uppercase tracking-widest block mb-1">Klienti / Kategoria</span>
                <span className="text-lg">{project.category}</span>
              </div>
              <div>
                <span className="text-zinc-600 text-xs uppercase tracking-widest block mb-1">Shërbimi</span>
                <span className="text-lg">{project.type}</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-2xl md:text-4xl font-light leading-tight text-zinc-300">
              {project.description || 'Një vështrim kinematografik dhe një qasje unike për të kapur momentet më të rëndësishme. Ky projekt thekson dedikimin tonë ndaj detajeve dhe artit vizual.'}
            </h3>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
