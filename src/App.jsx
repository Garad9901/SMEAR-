import './index.css';
import Cursor from './components/Cursor';
import MatrixRain from './components/MatrixRain';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import ThemeSwitcher from './components/ThemeSwitcher';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <>
      {/* Background layers */}
      <div className="grid-bg" />
      <div className="orb orb-cyan" />
      <div className="orb orb-violet" />
      <MatrixRain />

      {/* Custom cursor */}
      <Cursor />

      {/* Floating Theme Switcher & AI RAG Assistant */}
      <ThemeSwitcher />
      <AIAssistant />

      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 2 }}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certifications />
        <Achievements />
        <Contact />
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.25)',
      }}>
        <span>© 2026 </span>
        <span style={{
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Yash Rajesh Garad
        </span>
      </footer>
    </>
  );
}

export default App;
