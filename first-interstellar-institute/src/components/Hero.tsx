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
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-orbitron font-bold text-white mb-6 tracking-wider shadow-sm">
          FIRST INTERSTELLAR INSTITUTE
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light max-w-2xl mx-auto">
          Advancing human understanding of warp drives, wormholes, and the physics of tomorrow.
        </p>
      </div>
    </section>
  );
}
