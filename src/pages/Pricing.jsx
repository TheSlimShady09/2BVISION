
import { motion } from 'framer-motion';
import { Check, Camera, Video, Star, MessageCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useCursor } from '../context/CursorContext';

const packages = [
  {
    id: 'essential-story',
    name: 'Essential Story',
    price: '$499',
    icon: <Camera className="w-6 h-6 text-[#a0a0a0]" />,
    description: 'Perfect for intimate portraits and short sessions.',
    features: [
      '2 Hour Studio Session',
      '2 Wardrobe Changes',
      '15 Retouched High-Res Images',
      'Online Private Gallery',
      'Print Release'
    ]
  },
  {
    id: 'cinematic-legacy',
    name: 'Cinematic Legacy',
    price: '$3,499',
    popular: true,
    icon: <Star className="w-6 h-6 text-[#2d2d2d]" />,
    description: 'Comprehensive coverage for your special day with premium edits.',
    features: [
      '8 Hours of Coverage',
      '2 Cinematographers',
      '5-7 Minute Highlight Film',
      'Full Ceremony Video',
      'Drone Footage (weather permitting)',
      'Digital Delivery via USB & Online'
    ]
  },
  {
    id: 'commercial-vision',
    name: 'Commercial Vision',
    price: '$1,899',
    icon: <Video className="w-6 h-6 text-[#a0a0a0]" />,
    description: 'Elevate your brand with high-end commercial photo and video.',
    features: [
      'Half-day Shoot (4 Hours)',
      'Photo & Video Coverage',
      '30-second Promo Video',
      '30 Edited Product/Brand Photos',
      'Commercial Usage License',
      'Creative Direction Consultation'
    ]
  }
];

export function Pricing() {
  const { setGlobalSelectedPackage } = useBooking();
  const { setHovering, setDefault } = useCursor();

  const handleSelectPackage = (pkg) => {
    setGlobalSelectedPackage(pkg.id);
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="min-h-screen bg-[#1e1e1e] py-24 px-4 sm:px-6 lg:px-8 border-t border-[#383838]">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white mb-4"
        >
          Investment
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#a0a0a0] max-w-2xl mx-auto text-lg font-light"
        >
          Choose the package that best fits your vision.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className={`relative p-8 rounded-none border ${
              pkg.popular 
                ? 'border-white bg-white shadow-2xl scale-105 z-10 text-[#2d2d2d]' 
                : 'border-[#444444] bg-[#2d2d2d] hover:border-[#555555] text-white'
            } flex flex-col min-h-[500px]`}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2d2d2d] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest border border-[#444444]">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-2xl font-bold ${pkg.popular ? 'text-[#2d2d2d]' : 'text-white'}`}>{pkg.name}</h3>
                {pkg.icon}
              </div>
              <p className={`text-sm h-10 ${pkg.popular ? 'text-[#555555]' : 'text-[#a0a0a0]'}`}>{pkg.description}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 shrink-0 mt-0.5 ${pkg.popular ? 'text-[#555555]' : 'text-[#a0a0a0]'}`} />
                  <span className={`text-sm ${pkg.popular ? 'text-[#444444]' : 'text-[#c8c8c8]'}`}>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPackage(pkg)}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className={`w-full py-4 font-bold tracking-widest uppercase text-sm transition-all border ${
                pkg.popular 
                  ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] hover:bg-[#383838]' 
                  : 'bg-white text-[#2d2d2d] border-white hover:bg-[#e8e8e8]'
              }`}
            >
              Select Package
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto text-center"
      >
        <p className="text-sm text-[#a0a0a0] mb-3">
          Për të marrë çmimet dhe për detaje të mëtejshme rreth paketave:
        </p>
        <a 
          href="https://wa.me/355695620202?text=P%C3%ABrsh%C3%ABndetje!%20D%C3%ABshiroj%20t%C3%AB%20informohem%20mbi%20%C3%A7mimet%20e%20paketave%20tuaja."
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={setHovering}
          onMouseLeave={setDefault}
          className="inline-flex items-center gap-2 text-white hover:text-[#25D366] transition-colors border border-[#444444] hover:border-[#25D366]/50 bg-[#2d2d2d] px-6 py-3 text-xs font-bold uppercase tracking-widest"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          Na Kontaktoni në WhatsApp
        </a>
      </motion.div>
    </section>
  );
}
