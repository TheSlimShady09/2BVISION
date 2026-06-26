import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useCursor } from '../../context/CursorContext';
import { useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { name: 'Home', path: 'home' },
  { name: 'Our Story', path: 'story' },
  { name: 'Portfolio', path: 'portfolio' },
  { name: 'Pricing', path: 'pricing' },
  { name: 'Booking', path: 'booking' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { setHovering, setDefault } = useCursor();
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection('dashboard');
      return;
    }

    const handleScroll = () => {
      const sections = ['home', 'story', 'portfolio', 'pricing', 'booking'];
      let current = '';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            current = section;
          }
        }
      }
        if (current) {
          setActiveSection(current);
        }

        if (window.scrollY > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (path === 'dashboard') {
      navigate('/dashboard');
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/#${path}`);
    } else {
      const element = document.getElementById(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${path}`);
      }
    }
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled && !isOpen;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isTransparent 
        ? "bg-transparent border-transparent py-2" 
        : "bg-white/90 backdrop-blur-xl border-b border-zinc-200 py-0"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a 
              href="/#home" 
              onClick={(e) => handleNavClick(e, 'home')}
              className="flex items-center gap-2 group"
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
            >
              <img
                src="/logo.png"
                alt="2B Vision Logo"
                className={cn(
                  "h-12 w-auto object-contain transition-all duration-300 group-hover:scale-110",
                  isTransparent ? "brightness-0 invert" : "brightness-0"
                )}
              />
              <span className={cn("font-bold text-xl tracking-widest uppercase transition-colors", isTransparent ? "text-white" : "text-[#383838]")}>
                2B Vision
              </span>
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/#${link.path}`}
                  onClick={(e) => handleNavClick(e, link.path)}
                  onMouseEnter={setHovering}
                  onMouseLeave={setDefault}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors relative",
                    isTransparent
                      ? (activeSection === link.path ? "text-white" : "text-white/70 hover:text-white")
                      : (activeSection === link.path ? "text-[#2d2d2d]" : "text-[#707070] hover:text-[#2d2d2d]")
                  )}
                >
                  {link.name}
                  {activeSection === link.path && (
                    <motion.div
                      layoutId="underline"
                      className={cn("absolute -bottom-1 left-0 right-0 h-0.5", isTransparent ? "bg-white" : "bg-white")}
                    />
                  )}
                </a>
              ))}
              
              <button
                onClick={(e) => handleNavClick(e, 'dashboard')}
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors",
                  isTransparent
                    ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                    : (activeSection === 'dashboard' ? "bg-[#2d2d2d] text-white" : "bg-[#383838] text-white hover:bg-[#2d2d2d]")
                )}
              >
                {user ? (
                  <>
                    <User className="w-4 h-4" />
                    Dashboard
                  </>
                ) : (
                  'Client Portal'
                )}
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn("inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors", 
                isTransparent ? "text-white hover:bg-white/10" : "text-[#707070] hover:text-[#2d2d2d] hover:bg-zinc-100"
              )}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/#${link.path}`}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    activeSection === link.path
                      ? "bg-zinc-100 text-[#2d2d2d]"
                      : "text-[#707070] hover:bg-zinc-50 hover:text-[#2d2d2d]"
                  )}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={(e) => handleNavClick(e, 'dashboard')}
                className="w-full block px-3 py-2 mt-4 rounded-md text-base font-semibold bg-[#2d2d2d] text-white text-center"
              >
                {user ? 'Dashboard' : 'Client Portal'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
