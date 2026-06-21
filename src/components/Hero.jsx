import { useEffect, useRef, useState, useCallback } from 'react';

const ROLES = ['AI Engineer', 'ML Specialist', 'GenAI Builder', 'Geospatial AI Dev'];

/* ── Floating Particle ── */
const Particle = ({ x, y, size, duration, delay, color }) => (
  <div style={{
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    opacity: 0,
    animation: `particleFloat ${duration}s ${delay}s ease-in-out infinite`,
    pointerEvents: 'none',
    filter: 'blur(1px)',
  }} />
);

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const btnRef1 = useRef(null);
  const btnRef2 = useRef(null);

  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: `${Math.random() * 4 + 2}px`,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      color: i % 2 === 0
        ? `rgba(0, 212, 255, ${Math.random() * 0.5 + 0.1})`
        : `rgba(124, 58, 237, ${Math.random() * 0.4 + 0.1})`,
    }))
  );

  /* Typing effect */
  useEffect(() => {
    const current = ROLES[roleIndex];
    let timeout;
    if (!isDeleting && typedText.length < current.length) {
      timeout = setTimeout(() => setTypedText(current.slice(0, typedText.length + 1)), 80);
    } else if (!isDeleting && typedText.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typedText.length > 0) {
      timeout = setTimeout(() => setTypedText(typedText.slice(0, -1)), 40);
    } else if (isDeleting && typedText.length === 0) {
      setIsDeleting(false);
      setRoleIndex(prev => (prev + 1) % ROLES.length);
    }
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, roleIndex]);

  /* Magnetic button effect */
  const useMagnetic = (ref) => {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      };
      const onLeave = () => { el.style.transform = 'translate(0, 0)'; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    }, [ref]);
  };

  useMagnetic(btnRef1);
  useMagnetic(btnRef2);

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '72px',
      }}
    >
      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.current.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Large glow blob */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'pulse-glow 6s ease-in-out infinite',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Profile Photo */}
        <div style={{ marginBottom: '2rem', position: 'relative', display: 'inline-block' }}>
          <div style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #00d4ff, #7c3aed, #00d4ff)',
            animation: 'rotate 4s linear infinite',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            background: 'conic-gradient(from 180deg, #7c3aed, #00d4ff, #7c3aed)',
            animation: 'rotateReverse 6s linear infinite',
            zIndex: 0,
            opacity: 0.6,
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #0a0a0f',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(124,58,237,0.15)',
          }}>
            <img
              id="profile-photo"
              src="/profile.jpg"
              alt="Yash Rajesh Garad"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%' }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback avatar */}
            <div style={{
              display: 'none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>YG</div>
          </div>
        </div>

        {/* Location */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8rem',
          color: 'rgba(0,212,255,0.7)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          letterSpacing: '0.1em',
        }}>
          <span>📍</span> Nagpur, Maharashtra, India
        </div>

        {/* Name */}
        <h1 className="hero-name">
          <span style={{ color: '#f0f0ff' }}>Yash Rajesh</span>{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Garad</span>
        </h1>

        {/* Typing subtitle */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '2.5rem',
          minHeight: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ color: 'rgba(0,212,255,0.5)' }}>{'>'}</span>
          <span style={{ color: '#00d4ff' }}>{typedText}</span>
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: '1.4em',
            background: '#00d4ff',
            borderRadius: '2px',
            animation: 'blink 1s step-end infinite',
            verticalAlign: 'middle',
          }} />
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            ref={btnRef1}
            className="btn btn-primary"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ transition: 'transform 0.2s ease, box-shadow 0.3s ease' }}
          >
            <span>🚀</span> View Projects
          </button>
          <button
            ref={btnRef2}
            className="btn btn-outline"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ transition: 'transform 0.2s ease, box-shadow 0.3s ease' }}
          >
            <span>✉</span> Contact Me
          </button>
        </div>

        {/* Resume Download */}
        <div style={{ marginBottom: '3rem' }}>
          <a
            href="/resume.pdf"
            download="Yash_Rajesh_Garad_Resume.pdf"
            data-hover
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.7rem 1.75rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))',
              border: '1px solid rgba(0,212,255,0.3)',
              color: '#00d4ff',
              fontSize: '0.85rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'none',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.22), rgba(124,58,237,0.18))';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.25), 0 8px 30px rgba(0,212,255,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1rem' }}>⬇</span> Download Resume
          </a>
        </div>

        {/* Social Links */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub', href: 'https://github.com/Garad9901', icon: '⌨' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/yash-garad-23a315255', icon: '💼' },
            { label: 'Email', href: 'mailto:yash.garad27@gmail.com', icon: '✉' },
            { label: '+91-9370471759', href: 'tel:+919370471759', icon: '📞' },
          ].map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              data-hover
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                cursor: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#00d4ff';
                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
                e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,212,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>{icon}</span> {label}
            </a>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '-3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'rgba(255,255,255,0.3)',
          animation: 'float 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', fontFamily: 'JetBrains Mono, monospace' }}>SCROLL</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)' }} />
        </div>
      </div>

      <style>{`
        .hero-name {
          font-size: clamp(2.3rem, 5.5vw, 4.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
        }
        @media (max-width: 540px) {
          .hero-name {
            white-space: normal;
          }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.7; }
          50% { transform: translateY(-80px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
