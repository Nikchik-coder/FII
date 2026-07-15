export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/headerimage.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Dark overlay for readability — semi-transparent so mesh bleeds in */}
      <div className="absolute inset-0 bg-[#1a1a1a]/60 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a1a]/30 to-[#1a1a1a] z-[1]" />

      {/* Content */}
      <div className="relative z-[2] text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-semibold text-white mb-6 tracking-wide">
          FIRST INTERSTELLAR INSTITUTE
        </h1>
        <div className="w-16 h-px bg-white/20 mx-auto mb-6" />
        <p className="text-lg sm:text-xl md:text-2xl text-[#888] italic max-w-2xl mx-auto leading-relaxed">
          Advancing human understanding of warp drives, wormholes, and the physics of tomorrow to reach interstellar travel.
        </p>
      </div>
    </section>
  );
}
