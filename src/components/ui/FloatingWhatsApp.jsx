
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';

export function FloatingWhatsApp() {
  const { setHovering, setDefault } = useCursor();

  return (
    <motion.a
      href="https://wa.me/1234567890" // Replace with real number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      onMouseEnter={setHovering}
      onMouseLeave={setDefault}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
    >
      <MessageCircle className="w-6 h-6" />
    </motion.a>
  );
}
