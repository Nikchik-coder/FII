import { FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-6 bg-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center relative gap-6 md:gap-0">
        {/* Centered Text */}
        <p className="text-xs sm:text-sm text-slate-500 font-orbitron tracking-widest text-center">
          FIRST INTERSTELLAR INSTITUTE © 2026
        </p>
        
        {/* Bottom Right Icon (Desktop) / Bottom Icon (Mobile) */}
        <div className="md:absolute md:right-0">
          <a 
            href="https://www.youtube.com/@First_Interstellar_Institute" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-red-500 transition-colors block p-2"
          >
            <FaYoutube size={28} className="sm:w-8 sm:h-8" />
          </a>
        </div>
      </div>
    </footer>
  );
}
