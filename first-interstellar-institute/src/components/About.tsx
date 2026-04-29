export default function About({ id }: { id: string }) {
  return (
    <section id={id} className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">About the Institute</h2>
        <div className="h-1 w-24 bg-slate-700 mx-auto rounded"></div>
      </div>
      
      <div className="mx-auto text-slate-300 leading-relaxed text-base md:text-lg">
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
