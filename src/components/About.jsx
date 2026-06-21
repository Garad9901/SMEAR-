import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Hackathons Top', value: 15, suffix: '+' },
  { label: 'Projects', value: 5, suffix: '+' },
  { label: 'Certifications', value: 8, suffix: '+' },
];

const useReveal = (ref) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
};

const Counter = ({ value, suffix, visible }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(start);
    }, 50);
    return () => clearInterval(interval);
  }, [visible, value]);
  return <span>{count}{suffix}</span>;
};

/* AI Neural Network SVG Illustration */
const AIIllustration = () => (
  <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="180" stroke="rgba(0,212,255,0.1)" strokeWidth="1" strokeDasharray="8 4" />
      <circle cx="200" cy="200" r="140" stroke="rgba(124,58,237,0.1)" strokeWidth="1" strokeDasharray="4 8" />
      <polygon points="200,130 255,162 255,230 200,262 145,230 145,162" fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.35)" strokeWidth="1.5" />
      {[[200,200,100,100],[200,200,300,100],[200,200,80,220],[200,200,320,220],[200,200,140,320],[200,200,260,320]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i%2===0?'rgba(0,212,255,0.18)':'rgba(124,58,237,0.18)'} strokeWidth="1" />
      ))}
      {[[100,100],[300,100],[80,220],[320,220],[140,320],[260,320]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="12" fill="rgba(10,10,15,0.9)" stroke={i%2===0?'rgba(0,212,255,0.6)':'rgba(124,58,237,0.6)'} strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="4" fill={i%2===0?'#00d4ff':'#7c3aed'} />
        </g>
      ))}
      <circle cx="200" cy="200" r="28" fill="rgba(10,10,15,0.9)" stroke="rgba(0,212,255,0.6)" strokeWidth="2" />
      <circle cx="200" cy="200" r="14" fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.8)" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="5" fill="#00d4ff" />
      <circle r="3" fill="#00d4ff" opacity="0.9">
        <animateMotion dur="3s" repeatCount="indefinite" path="M200,200 L100,100" />
      </circle>
      <circle r="3" fill="#7c3aed" opacity="0.9">
        <animateMotion dur="2.5s" repeatCount="indefinite" path="M200,200 L300,100" />
      </circle>
      <circle r="3" fill="#00d4ff" opacity="0.9">
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M200,200 L320,220" />
      </circle>
      <circle r="3" fill="#7c3aed" opacity="0.9">
        <animateMotion dur="2.8s" repeatCount="indefinite" path="M200,200 L140,320" />
      </circle>
      {[[100,86,'ML'],[300,86,'AI'],[64,224,'RAG'],[326,224,'GNN'],[140,338,'LLM'],[260,338,'NLP']].map(([x,y,label],i)=>(
        <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill={i%2===0?'rgba(0,212,255,0.7)':'rgba(124,58,237,0.7)'}>{label}</text>
      ))}
    </svg>
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)', width: '180px', height: '180px',
      background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite',
    }} />
  </div>
);

const About = () => {
  const ref = useRef(null);
  const visible = useReveal(ref);

  return (
    <section id="about" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }} className="about-grid">
          {/* Text */}
          <div className={`reveal ${visible ? 'visible' : ''}`}>
            <p className="section-label">about me</p>
            <h2 className="section-title">
              Building <span className="gradient-text">Intelligence</span><br />
              for the Real World
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '1.25rem', fontSize: '0.98rem' }}>
              I'm an <span style={{ color: '#00d4ff', fontWeight: 600 }}>AI/ML Engineering undergraduate</span> at{' '}
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>St. Vincent Pallotti College of Engineering & Technology, Nagpur</span>,
              with expertise in AI engineering, predictive analytics, anomaly detection, Generative AI, and intelligent automation.
            </p>

            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '1.25rem', fontSize: '0.93rem' }}>
              Experienced in building <strong style={{ color: 'rgba(255,255,255,0.75)' }}>scalable AI systems</strong>,{' '}
              <strong style={{ color: 'rgba(255,255,255,0.75)' }}>geospatial intelligence platforms</strong>, and{' '}
              <strong style={{ color: 'rgba(255,255,255,0.75)' }}>digital public infrastructure</strong>. Strong foundation in software engineering,
              cloud-native development, and analytical problem-solving with proven success in hackathons, research, and internships.
            </p>

            {/* Education card */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>🎓</span>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#f0f0ff', marginBottom: '0.15rem' }}>
                  Bachelor of Engineering in Artificial Intelligence
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                  St. Vincent Pallotti College • Nagpur &nbsp;·&nbsp;
                  <span style={{ color: '#7c3aed' }}>Expected 2027</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {stats.map(({ label, value, suffix }) => (
                <div key={label} style={{
                  textAlign: 'center',
                  padding: '1.1rem 1.25rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '14px',
                  minWidth: '95px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
                    e.currentTarget.style.background = 'rgba(0,212,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    marginBottom: '0.35rem',
                  }}>
                    <Counter value={value} suffix={suffix} visible={visible} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className={`reveal reveal-delay-2 ${visible ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'center' }}>
            <AIIllustration />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
};

export default About;
