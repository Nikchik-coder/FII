import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-slate-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="font-orbitron font-bold text-xl tracking-wider text-white">
          FII
        </a>
        <div className="hidden md:flex gap-8">
          <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#lectures" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Lectures</a>
          <a href="#articles" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Articles</a>
          <a href="#support" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </nav>
  );
}
