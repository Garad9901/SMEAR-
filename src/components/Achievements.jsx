import { useEffect, useRef, useState } from 'react';

const ACHIEVEMENTS = [
  {
    year: 'Oct 2025',
    title: 'Government of India Software Copyright',
    description: 'Registered official copyright for "DATABASE MANAGEMENT SYSTEM LAB (24AI303P) LAB MANUAL" with the Copyright Office, Intellectual Property India (Diary No: LD-42590/2025-CO).',
    icon: '⚖️',
    color: '#00d4ff',
    tags: ['Copyright', 'Intellectual Property', 'DBMS'],
  },
  {
    year: 'Oct 2025',
    title: 'Oracle OCI GenAI Certified Professional',
    description: 'Successfully cracked the industry-standard Oracle Cloud Infrastructure (OCI) 2025 Generative AI Professional certification, demonstrating advanced expertise in LLMs, RAG, and fine-tuning configurations.',
    icon: '🔴',
    color: '#7c3aed',
    tags: ['Oracle OCI', 'GenAI', 'Professional'],
  },
  {
    year: '2024–2025',
    title: 'National Hackathon Rankings (Top 15)',
    description: 'Ranked in the Top 15 in multiple national-level coding hackathons, building geospatial planning tools, risk forecasting dashboards, and decentralized biometrics verifying audits.',
    icon: '🏆',
    color: '#00d4ff',
    tags: ['Hackathons', 'Top 15', 'AI'],
  },
  {
    year: '2025',
    title: 'AI & Machine Learning Internships',
    description: 'Developed production-grade generative pipeline integrations, automated resume screening matches with custom Word2Vec embeddings, and built fullstack portals hosted on Railway/Hostinger.',
    icon: '💼',
    color: '#7c3aed',
    tags: ['Internship', 'ML', 'Fullstack'],
  },
];

const useReveal = (ref) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
};

const Achievements = () => {
  const ref = useRef(null);
  const visible = useReveal(ref);

  return (
    <section id="achievements" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>milestones</p>
          <h2 className="section-title">
            Key <span className="gradient-text">Achievements</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            A journey of impact — from competitive hackathons to industry internships.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', maxWidth: '820px', margin: '0 auto' }}>
          {/* Animated vertical line */}
          <div style={{
            position: 'absolute',
            left: '28px',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)',
              height: visible ? '100%' : '0%',
              transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '0.3s',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {ACHIEVEMENTS.map((item, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${Math.min(i + 1, 5)} ${visible ? 'visible' : ''}`}
                style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}
              >
                {/* Node */}
                <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    background: `${item.color}15`,
                    border: `2px solid ${item.color}50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: `0 0 20px ${item.color}25`,
                    transition: 'all 0.3s ease',
                  }}>
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    padding: '1.5rem',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid ${item.color}20`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${item.color}50`;
                    e.currentTarget.style.background = `${item.color}06`;
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = `0 8px 30px ${item.color}12`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${item.color}20`;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#f0f0ff' }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: item.color, opacity: 0.85,
                      background: `${item.color}12`, padding: '0.25rem 0.75rem', borderRadius: '50px',
                      border: `1px solid ${item.color}25`,
                    }}>
                      {item.year}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {item.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: '50px',
                        background: `${item.color}12`, color: item.color, fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
