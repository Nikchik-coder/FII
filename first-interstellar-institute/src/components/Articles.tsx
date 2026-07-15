import { FileText, ExternalLink } from 'lucide-react';

export default function Articles({ id }: { id: string }) {
  return (
    <section id={id} className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="part-label block mb-4">03 — Articles</span>
        <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-white">Research Articles</h2>
        <div className="sep mb-6" />
        <p className="text-[#e8e4df]/60 max-w-2xl mx-auto">
          Published papers and preprints detailing our findings in advanced spacetime physics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Article Card 1 */}
        <a
          href="https://arxiv.org/abs/2604.00071"
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white/[0.03] border border-white/10 rounded-md p-8 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-white/60 p-3 rounded-md bg-white/5">
              <FileText size={24} />
            </div>
            <ExternalLink size={20} className="text-[#888] group-hover:text-[#e8e4df] transition-colors" />
          </div>

          <h3 className="text-xl font-serif font-semibold mb-3 group-hover:text-white transition-colors text-[#e8e4df]">
            Wormhole Dynamics: Nonlinear Collapse and Gravitational-Wave Emission
          </h3>

          <p className="text-sm text-[#e8e4df]/60 mb-6 line-clamp-3">
            We present 3D numerical-relativity evolutions of the unstable Ellis-Bronnikov wormhole using GRTeclyn, starting from exact isotropic initial data for the coupled Einstein-phantom-scalar system.
          </p>

          <div className="flex items-center justify-between text-xs text-[#888] font-mono">
            <span>arXiv:2604.00071</span>
            <span>April 2026</span>
          </div>
        </a>

        {/* Placeholder for future articles */}
        <div className="block bg-white/[0.01] border border-white/10 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center opacity-50">
          <FileText size={32} className="text-[#888] mb-4" />
          <h3 className="text-lg text-[#e8e4df]/80 font-serif font-semibold mb-2">Future Publications</h3>
          <p className="text-sm text-[#888]">More research papers are currently in progress.</p>
        </div>
      </div>
    </section>
  );
}
