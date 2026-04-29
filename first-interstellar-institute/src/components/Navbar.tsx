import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-black/95 backdrop-blur-md border-b border-slate-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" onClick={closeMenu} className="font-orbitron font-bold text-xl tracking-wider text-white z-50">
          FII
        </a>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#lectures" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Lectures</a>
          <a href="#articles" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Articles</a>
          <a href="#support" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Support</a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-slate-300 hover:text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md border-b border-slate-800 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 py-4' : 'max-h-0 py-0 border-transparent'}`}>
        <div className="flex flex-col items-center gap-6">
          <a href="#about" onClick={closeMenu} className="text-base font-medium text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#lectures" onClick={closeMenu} className="text-base font-medium text-slate-300 hover:text-white transition-colors">Lectures</a>
          <a href="#articles" onClick={closeMenu} className="text-base font-medium text-slate-300 hover:text-white transition-colors">Articles</a>
          <a href="#support" onClick={closeMenu} className="text-base font-medium text-slate-300 hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </nav>
  );
}
