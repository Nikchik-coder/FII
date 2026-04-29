import { FileText, ExternalLink } from 'lucide-react';

export default function Articles({ id }: { id: string }) {
  return (
    <section id={id} className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Research Articles</h2>
        <div className="h-1 w-24 bg-slate-700 mx-auto rounded mb-6"></div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Published papers and preprints detailing our findings in advanced spacetime physics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Article Card 1 */}
        <a 
          href="https://arxiv.org/abs/2604.00071" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block bg-slate-900 border border-slate-800 rounded-xl p-8 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400">
              <FileText size={24} />
            </div>
            <ExternalLink size={20} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
          
          <h3 className="text-xl font-bold font-orbitron mb-3 group-hover:text-blue-400 transition-colors">
            Wormhole Dynamics: Nonlinear Collapse and Gravitational-Wave Emission
          </h3>
          
          <p className="text-sm text-slate-400 mb-6 line-clamp-3">
            We present 3D numerical-relativity evolutions of the unstable Ellis-Bronnikov wormhole using GRTeclyn, starting from exact isotropic initial data for the coupled Einstein-phantom-scalar system.
          </p>
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>arXiv:2604.00071</span>
            <span>April 2026</span>
          </div>
        </a>

        {/* Placeholder for future articles */}
        <div className="block bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-50">
          <FileText size={32} className="text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-400 font-orbitron mb-2">Future Publications</h3>
          <p className="text-sm text-slate-500">More research papers are currently in progress.</p>
        </div>
      </div>
    </section>
  );
}
