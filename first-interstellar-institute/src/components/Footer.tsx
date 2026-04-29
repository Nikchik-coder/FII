import { FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-8 relative flex items-center justify-center bg-black">
      {/* Centered Text */}
      <p className="text-sm text-slate-500 font-orbitron tracking-widest text-center">
        FIRST INTERSTELLAR INSTITUTE © 2026
      </p>
      
      {/* Bottom Right Icon */}
      <div className="absolute right-8 md:right-12">
        <a 
          href="https://www.youtube.com/@First_Interstellar_Institute" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-red-500 transition-colors block p-2"
        >
          <FaYoutube size={32} />
        </a>
      </div>
    </footer>
  );
}
