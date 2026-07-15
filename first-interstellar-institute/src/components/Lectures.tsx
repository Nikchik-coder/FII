import { Presentation, ArrowRight } from 'lucide-react';

export default function Lectures({ id }: { id: string }) {
  return (
    <section id={id} className="py-16 md:py-24 px-6 border-y border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="part-label block mb-4">02 — Lectures</span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-white">Video Lectures</h2>
          <div className="sep mb-6" />
          <p className="text-[#e8e4df]/60 max-w-2xl mx-auto">
            In-depth explorations of advanced physics concepts, from warp drive mechanics to wormhole dynamics.
          </p>
        </div>

        {/* Interactive Lecture Feature */}
        <a
          href="/lectures/nrlecture/presentation.html"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-12 flex flex-col md:flex-row items-center gap-6 bg-white/[0.03] border border-white/10 rounded-md p-8 hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300"
        >
          <div className="text-white/60 group-hover:scale-110 group-hover:text-white transition-all duration-300">
            <Presentation size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-semibold mb-2 group-hover:text-white transition-colors text-[#e8e4df]">
              Slicing Spacetime
            </h3>
            <p className="text-[#e8e4df]/60 max-w-2xl">
              An interactive 40-minute presentation on how supercomputers and GPUs unlock the universe's deepest
              secrets — from Einstein's equations to numerical relativity and wormhole dynamics.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-5 py-3 border border-white/15 text-[#e8e4df] rounded-md font-medium group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-300">
            Open Lecture
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Lecture 1 */}
          <div className="flex flex-col">
            <div className="aspect-video w-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/u8vp9aRIVas"
                title="Why Einstein's Gravity Needed Supercomputers"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <h3 className="text-xl mt-6 mb-2 font-serif font-semibold text-[#e8e4df]">
              Why Einstein&apos;s Gravity Needed Supercomputers
            </h3>
            <p className="text-[#e8e4df]/60">
              How numerical relativity and supercomputers make Einstein&apos;s gravity computable.
            </p>
          </div>

          {/* Lecture 2 */}
          <div className="flex flex-col">
            <div className="aspect-video w-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/-JUgMG99Las"
                title="Warp Drive Physics | Warp factory toolkit tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <h3 className="text-xl mt-6 mb-2 font-serif font-semibold text-[#e8e4df]">Warp Drive Physics</h3>
            <p className="text-[#e8e4df]/60">Warp factory toolkit tutorial and analysis of Alcubierre-like metrics.</p>
          </div>

          {/* Lecture 3 */}
          <div className="flex flex-col">
            <div className="aspect-video w-full rounded-md overflow-hidden shadow-2xl border border-white/10 bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Gsu741Uslvk"
                title="Wormholes physics lecture"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <h3 className="text-xl mt-6 mb-2 font-serif font-semibold text-[#e8e4df]">Wormhole Physics</h3>
            <p className="text-[#e8e4df]/60">Comprehensive lecture on the physics and stability of traversable wormholes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
