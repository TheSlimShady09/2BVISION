import React from 'react';
import { Camera, MessageCircle, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';

export function Footer() {
  const { setHovering, setDefault } = useCursor();

  return (
    <footer className="bg-slate-800 border-t border-slate-700 pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <a 
              href="#home" 
              className="flex items-center gap-2 mb-4 w-fit"
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
            >
              <Camera className="w-6 h-6 text-white" />
              <span className="font-bold text-lg tracking-widest text-white uppercase">2B Vision</span>
            </a>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Capturing moments with cinematic precision. Premium photography and videography for weddings, commercial projects, and high-end portraits.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:+1234567890" 
                  className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors w-fit"
                  onMouseEnter={setHovering}
                  onMouseLeave={setDefault}
                >
                  <Phone className="w-4 h-4" />
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a 
                  href="mailto:hello@2bvision.com" 
                  className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors w-fit"
                  onMouseEnter={setHovering}
                  onMouseLeave={setDefault}
                >
                  <Mail className="w-4 h-4" />
                  hello@2bvision.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Social</h3>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 transition-all"
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
              >
                <ImageIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-700 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 transition-all"
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} 2B Vision. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a 
              href="#" 
              className="text-slate-400 hover:text-white transition-colors"
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-slate-400 hover:text-white transition-colors"
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
