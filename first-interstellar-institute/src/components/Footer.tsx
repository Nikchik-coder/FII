import { FaYoutube, FaGithub, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center relative gap-6 md:gap-0">
        {/* Centered Text */}
        <p className="text-xs sm:text-sm text-[#888] font-orbitron tracking-widest text-center">
          FIRST INTERSTELLAR INSTITUTE © 2026
        </p>

        {/* Bottom Right Icons (Desktop) / Bottom Icons (Mobile) */}
        <div className="md:absolute md:right-0 flex items-center gap-4">
          <a
            href="mailto:firstinterstellarinstitute@gmail.com"
            className="text-[#888] hover:text-white transition-colors block p-2"
            aria-label="Email Us"
          >
            <FaEnvelope size={28} className="sm:w-8 sm:h-8" />
          </a>
          <a
            href="https://github.com/Nikchik-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-white transition-colors block p-2"
            aria-label="GitHub Profile"
          >
            <FaGithub size={28} className="sm:w-8 sm:h-8" />
          </a>
          <a
            href="https://www.youtube.com/@First_Interstellar_Institute"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-red-400 transition-colors block p-2"
            aria-label="YouTube Channel"
          >
            <FaYoutube size={28} className="sm:w-8 sm:h-8" />
          </a>
        </div>
      </div>
    </footer>
  );
}
