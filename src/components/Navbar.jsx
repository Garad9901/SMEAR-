import { useEffect, useRef, useState } from 'react';

const SECTIONS = ['home', 'about', 'skills', 'projects', 'certifications', 'achievements', 'contact'];

const Navbar = () => {
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const current = SECTIONS.find(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });
      if (current) setActive(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 2rem',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.4s ease',
          background: scrolled
            ? 'rgba(10, 10, 15, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => scrollTo('home')}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.2rem',
            fontWeight: 700,
            cursor: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>YG</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>// portfolio</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          className="desktop-nav">
          {SECTIONS.map(id => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: active === id ? 600 : 400,
                padding: '0.45rem 1rem',
                borderRadius: '50px',
                cursor: 'none',
                border: 'none',
                transition: 'all 0.3s ease',
                background: active === id
                  ? 'rgba(0, 212, 255, 0.12)'
                  : 'transparent',
                color: active === id ? '#00d4ff' : 'rgba(255,255,255,0.55)',
                letterSpacing: '0.04em',
                textTransform: 'capitalize',
                boxShadow: active === id
                  ? 'inset 0 0 12px rgba(0,212,255,0.1), 0 0 8px rgba(0,212,255,0.1)'
                  : 'none',
              }}
            >
              {id}
            </button>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger-btn"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
            cursor: 'pointer',
            padding: '8px',
            background: 'transparent',
            border: 'none',
          }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block',
              width: '22px',
              height: '2px',
              background: '#00d4ff',
              borderRadius: '2px',
              transition: 'all 0.3s',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 15, 0.97)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: '1rem 2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(0,212,255,0.15)',
        }}>
          {SECTIONS.map(id => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                padding: '0.85rem 1rem',
                textAlign: 'left',
                background: active === id ? 'rgba(0,212,255,0.08)' : 'transparent',
                color: active === id ? '#00d4ff' : 'rgba(255,255,255,0.7)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: active === id ? 600 : 400,
              }}
            >
              {id}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
