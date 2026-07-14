export default function About({ id }: { id: string }) {
  return (
    <section id={id} className="py-16 md:py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <span className="part-label block mb-4">01 — About</span>
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 text-white">About the Institute</h2>
        <div className="sep" />
      </div>

      <div className="mx-auto text-[#e8e4df]/80 leading-relaxed text-base md:text-lg text-center">
        <p className="mb-6">
          The First Interstellar Institute is dedicated to the rigorous scientific exploration of advanced propulsion concepts and spacetime metrics. Our mission is to bridge the gap between theoretical physics and practical engineering for interstellar travel.
        </p>
        <p>
          Through open-source research, comprehensive video lectures, and detailed publications, we aim to educate and inspire the next generation of physicists and engineers who will build the technologies to take humanity to the stars.
        </p>
      </div>
    </section>
  );
}
