import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Presentation, Video } from 'lucide-react';

const LECTURES = [
  {
    title: 'Slicing Spacetime',
    description: 'Interactive presentation on numerical relativity & GPUs',
    href: '/lectures/nrlecture/presentation.html',
    external: true,
    icon: Presentation,
  },
  {
    title: 'Warp Drive Physics',
    description: 'Warp factory toolkit tutorial',
    href: 'https://www.youtube.com/watch?v=-JUgMG99Las',
    external: true,
    icon: Video,
  },
  {
    title: 'Wormhole Physics',
    description: 'Traversable wormhole stability',
    href: 'https://www.youtube.com/watch?v=Gsu741Uslvk',
    external: true,
    icon: Video,
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLecturesOpen, setIsLecturesOpen] = useState(false);
  const [isMobileLecturesOpen, setIsMobileLecturesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLecturesOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#lectures-dropdown')) {
        setIsLecturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isLecturesOpen]);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileLecturesOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" onClick={closeMenu} className="font-orbitron font-bold text-xl tracking-wider text-white z-50">
          FII
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <a href="#about" className="text-sm font-medium text-[#e8e4df]/80 hover:text-white transition-colors">About</a>

          {/* Lectures Dropdown */}
          <div
            id="lectures-dropdown"
            className="relative"
            onMouseEnter={() => setIsLecturesOpen(true)}
            onMouseLeave={() => setIsLecturesOpen(false)}
          >
            <button
              onClick={() => setIsLecturesOpen(!isLecturesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-[#e8e4df]/80 hover:text-white transition-colors"
            >
              Lectures
              <ChevronDown size={16} className={`transition-transform duration-200 ${isLecturesOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 origin-top transition-all duration-200 ${
                isLecturesOpen
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="bg-[#222] border border-white/10 rounded-md shadow-2xl overflow-hidden">
                <a
                  href="#lectures"
                  onClick={() => setIsLecturesOpen(false)}
                  className="block px-4 py-3 text-xs uppercase tracking-wider text-[#888] hover:text-[#e8e4df] border-b border-white/10 bg-[#1a1a1a]/80"
                >
                  View All Lectures
                </a>
                {LECTURES.map((lecture) => {
                  const Icon = lecture.icon;
                  return (
                    <a
                      key={lecture.title}
                      href={lecture.href}
                      target={lecture.external ? '_blank' : undefined}
                      rel={lecture.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsLecturesOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                    >
                      <div className="mt-0.5 text-white/60 group-hover:scale-110 transition-transform">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#e8e4df] group-hover:text-white transition-colors">
                          {lecture.title}
                        </div>
                        <div className="text-xs text-[#888] truncate">
                          {lecture.description}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <a href="#articles" className="text-sm font-medium text-[#e8e4df]/80 hover:text-white transition-colors">Articles</a>
          <a href="#support" className="text-sm font-medium text-[#e8e4df]/80 hover:text-white transition-colors">Support</a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden text-[#e8e4df]/80 hover:text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[32rem] py-4' : 'max-h-0 py-0 border-transparent'}`}>
        <div className="flex flex-col items-center gap-4">
          <a href="#about" onClick={closeMenu} className="text-base font-medium text-[#e8e4df]/80 hover:text-white transition-colors">About</a>

          {/* Mobile Lectures Expandable */}
          <div className="w-full px-6 flex flex-col items-center">
            <button
              onClick={() => setIsMobileLecturesOpen(!isMobileLecturesOpen)}
              className="flex items-center gap-1 text-base font-medium text-[#e8e4df]/80 hover:text-white transition-colors"
            >
              Lectures
              <ChevronDown size={18} className={`transition-transform duration-200 ${isMobileLecturesOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileLecturesOpen ? 'max-h-96 mt-3' : 'max-h-0'}`}>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <a
                  href="#lectures"
                  onClick={closeMenu}
                  className="text-xs uppercase tracking-wider text-[#888] hover:text-[#e8e4df] text-center"
                >
                  View All Lectures
                </a>
                {LECTURES.map((lecture) => {
                  const Icon = lecture.icon;
                  return (
                    <a
                      key={lecture.title}
                      href={lecture.href}
                      target={lecture.external ? '_blank' : undefined}
                      rel={lecture.external ? 'noopener noreferrer' : undefined}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Icon size={18} className="text-white/60 shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium text-[#e8e4df] truncate">{lecture.title}</div>
                        <div className="text-xs text-[#888] truncate">{lecture.description}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <a href="#articles" onClick={closeMenu} className="text-base font-medium text-[#e8e4df]/80 hover:text-white transition-colors">Articles</a>
          <a href="#support" onClick={closeMenu} className="text-base font-medium text-[#e8e4df]/80 hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </nav>
  );
}
