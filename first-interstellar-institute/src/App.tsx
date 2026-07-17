import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CosmicDistances from './components/CosmicDistances';
import About from './components/About';
import Lectures from './components/Lectures';
import Articles from './components/Articles';
import Preprint from './components/Preprint';
import Support from './components/Support';
import Footer from './components/Footer';


function App() {
  return (
    <div className="relative min-h-screen font-sans bg-[#1a1a1a] text-[#e8e4df] selection:bg-white/20 overflow-x-hidden">

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <CosmicDistances id="motivation" />
          <About id="about" />
          <Lectures id="lectures" />
          <Articles id="articles" />
          <Preprint id="preprint" />
          <Support id="support" />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
