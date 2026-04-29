import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Lectures from './components/Lectures';
import Articles from './components/Articles';
import Support from './components/Support';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen font-sans bg-black text-slate-200 selection:bg-blue-500/30">
      <Navbar />
      <main>
        <Hero />
        <About id="about" />
        <Lectures id="lectures" />
        <Articles id="articles" />
        <Support id="support" />
      </main>
      <Footer />
    </div>
  );
}

export default App;
