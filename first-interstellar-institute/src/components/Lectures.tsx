export default function Lectures({ id }: { id: string }) {
  return (
    <section id={id} className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Video Lectures</h2>
          <div className="h-1 w-24 bg-slate-700 mx-auto rounded mb-6"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            In-depth explorations of advanced physics concepts, from warp drive mechanics to wormhole dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Lecture 1 */}
          <div className="flex flex-col">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
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
            <h3 className="text-xl font-bold mt-6 mb-2 font-orbitron">Warp Drive Physics</h3>
            <p className="text-slate-400">Warp factory toolkit tutorial and analysis of Alcubierre-like metrics.</p>
          </div>

          {/* Lecture 2 */}
          <div className="flex flex-col">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
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
            <h3 className="text-xl font-bold mt-6 mb-2 font-orbitron">Wormhole Physics</h3>
            <p className="text-slate-400">Comprehensive lecture on the physics and stability of traversable wormholes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
