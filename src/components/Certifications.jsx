import { useState } from 'react';

const CERTS = [
  {
    name: 'Oracle Cloud Infrastructure 2025 Certified Generative AI Professional',
    short: 'OCI GenAI Professional',
    issuer: 'Oracle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    logoBg: '#ffffff',
    color: '#F80000',
    date: 'Oct 2025',
    expires: 'Oct 2027',
    credId: '103031071OCI25GAIOCP',
    tier: 'Pro',
  },
  {
    name: 'Fundamentals of Deep Learning',
    short: 'NVIDIA Deep Learning',
    issuer: 'NVIDIA',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0a/NVIDIA_logo.svg',
    logoBg: '#000000',
    color: '#76B900',
    date: 'Jan 2026',
    credId: '1tO0Ys3ITkGJkXM3sgBKrQ',
    tier: 'Pro',
  },
  {
    name: 'Career Essentials in Generative AI by Microsoft and LinkedIn',
    short: 'Microsoft GenAI Essentials',
    issuer: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    logoBg: '#ffffff',
    color: '#00BCF2',
    date: 'May 2026',
    credId: 'e135a79473…bd6fd6',
    tier: 'Pro',
  },
  {
    name: 'Introduction to Machine Learning',
    short: 'NPTEL ML',
    issuer: 'NPTEL',
    logo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/NPTEL_logo.svg',
    logoBg: '#ffffff',
    color: '#FF6B35',
    date: 'Sep 2025',
    credId: 'NPTEL25CS149S642901901',
    tier: 'Academic',
  },
  {
    name: 'Foundation: Introduction to LangGraph – Python',
    short: 'LangGraph Python',
    issuer: 'LangChain',
    logo: 'https://avatars.githubusercontent.com/u/126733545?v=4',
    logoBg: '#1C1C1C',
    color: '#00d4ff',
    date: 'Jan 2026',
    credId: 'l7nfq2klux',
    tier: 'GenAI',
  },
  {
    name: 'Quickstart: LangSmith Essentials',
    short: 'LangSmith Essentials',
    issuer: 'LangChain',
    logo: 'https://avatars.githubusercontent.com/u/126733545?v=4',
    logoBg: '#1C1C1C',
    color: '#00d4ff',
    date: 'Jun 2026',
    credId: 'vcntc6pdkr',
    tier: 'GenAI',
  },
  {
    name: 'Foundation: Introduction to Agent Observability & Evaluations',
    short: 'Agent Observability',
    issuer: 'LangChain',
    logo: 'https://avatars.githubusercontent.com/u/126733545?v=4',
    logoBg: '#1C1C1C',
    color: '#00d4ff',
    date: 'Jun 2026',
    credId: 'buv46ziyvm',
    tier: 'GenAI',
  },
  {
    name: 'Introduction to Model Context Protocol (MCP)',
    short: 'Intro to MCP',
    issuer: 'Anthropic',
    logo: 'https://avatars.githubusercontent.com/u/76263028?v=4',
    logoBg: '#CC785C',
    color: '#CC785C',
    date: 'May 2026',
    credId: 'nmgmiik2noey',
    tier: 'GenAI',
  },
  {
    name: 'Claude With The Anthropic API',
    short: 'Claude API',
    issuer: 'Anthropic',
    logo: 'https://avatars.githubusercontent.com/u/76263028?v=4',
    logoBg: '#CC785C',
    color: '#CC785C',
    date: 'Apr 2026',
    credId: 'gxhbzyuwupwd',
    tier: 'GenAI',
  },
  {
    name: 'Foundations of Prompt Engineering',
    short: 'AWS Prompt Engineering',
    issuer: 'Amazon Web Services',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    logoBg: '#232F3E',
    color: '#FF9900',
    date: 'Dec 2025',
    tier: 'GenAI',
  },
  {
    name: 'AI Appreciate',
    short: 'AI Appreciate',
    issuer: 'Intel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
    logoBg: '#ffffff',
    color: '#0071C5',
    date: 'Dec 2025',
    tier: 'AI',
  },
  {
    name: 'AI for Entrepreneurship',
    short: 'AI for Entrepreneurship',
    issuer: 'Intel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
    logoBg: '#ffffff',
    color: '#0071C5',
    date: 'Jul 2025',
    credId: '045thytuihy',
    tier: 'AI',
  },
  {
    name: 'Chatbot or Smart Assistant Development',
    short: 'Chatbot Development',
    issuer: 'Nasscom Foundation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Nasscom-logo.png',
    logoBg: '#ffffff',
    color: '#7c3aed',
    date: 'Jun 2026',
    credId: '1780985449784',
    tier: 'GenAI',
  },
  {
    name: 'Machine Learning – Dimensionality Reduction',
    short: 'ML Dimensionality Reduction',
    issuer: 'Cognitive Class (IBM)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    logoBg: '#ffffff',
    color: '#BE95FF',
    date: 'Oct 2025',
    credId: 'cbdadd144aab…a419dc7',
    tier: 'AI',
  },
  {
    name: 'Overview of Geocomputation and Geo-web Services',
    short: 'Geocomputation (ISRO)',
    issuer: 'IIRS, ISRO',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/ISRO_Logo.svg',
    logoBg: '#ffffff',
    color: '#00A550',
    date: 'Nov 2025',
    credId: '027a8e88…648945',
    tier: 'Geospatial',
  },
  {
    name: 'AI in Pharma: Transforming Life Sciences Through Technology',
    short: 'AI in Pharma',
    issuer: 'NCVET, MSDE, Govt. of India',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg',
    logoBg: '#ffffff',
    color: '#E91E8C',
    date: 'Mar 2026',
    credId: '2025072683840777-061505',
    tier: 'AI',
  },
];

const TIERS = ['All', 'Pro', 'GenAI', 'AI', 'Academic', 'Geospatial'];

const TIER_COLORS = {
  Pro: '#FFD700',
  GenAI: '#00d4ff',
  AI: '#7c3aed',
  Academic: '#FF6B35',
  Geospatial: '#00A550',
};

/* Logo image component with fallback */
const LogoImg = ({ cert, size = 32 }) => {
  const [errored, setErrored] = useState(false);
  if (errored) {
    // Fallback: first letter of issuer
    return (
      <div style={{
        width: size, height: size,
        borderRadius: '8px',
        background: `${cert.color}25`,
        border: `1px solid ${cert.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 800,
        color: cert.color,
        fontFamily: 'Inter, sans-serif',
      }}>
        {cert.issuer[0]}
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '8px',
      background: cert.logoBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      padding: '4px',
      flexShrink: 0,
    }}>
      <img
        src={cert.logo}
        alt={cert.issuer}
        onError={() => setErrored(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};

const CertCard = ({ cert }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '1.25rem 1.4rem',
        borderRadius: '18px',
        background: hovered ? `${cert.color}08` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? cert.color + '50' : cert.color + '20'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 10px 35px ${cert.color}15` : 'none',
      }}
    >
      {/* Logo */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '13px',
        border: `1px solid ${cert.color}30`,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: cert.logoBg,
        padding: '6px', flexShrink: 0,
        boxShadow: hovered ? `0 0 16px ${cert.color}25` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <img
          src={cert.logo}
          alt={cert.issuer}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<span style="font-size:1.2rem;font-weight:800;color:${cert.color};font-family:Inter,sans-serif">${cert.issuer[0]}</span>`;
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <p style={{
            fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.45,
          }}>
            {cert.name}
          </p>
          {cert.tier !== 'All' && (
            <span style={{
              flexShrink: 0,
              fontSize: '0.6rem', padding: '0.15rem 0.5rem', borderRadius: '50px',
              background: `${TIER_COLORS[cert.tier] || '#888'}18`,
              color: TIER_COLORS[cert.tier] || '#888',
              fontFamily: 'JetBrains Mono, monospace',
              border: `1px solid ${TIER_COLORS[cert.tier] || '#888'}30`,
            }}>
              {cert.tier}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', color: cert.color, fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: 0.9 }}>
            {cert.issuer}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'JetBrains Mono, monospace' }}>
            {cert.date}{cert.expires ? ` → ${cert.expires}` : ''}
          </span>
        </div>

        {cert.credId && (
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem' }}>
            ID: {cert.credId}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: cert.color, display: 'inline-block',
            boxShadow: `0 0 5px ${cert.color}`,
          }} />
          <span style={{ fontSize: '0.65rem', color: cert.color, fontFamily: 'JetBrains Mono, monospace', opacity: 0.8 }}>
            Certified
          </span>
        </div>
      </div>
    </div>
  );
};

const MarqueeStrip = () => {
  const [paused, setPaused] = useState(false);
  const doubled = [...CERTS, ...CERTS];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', overflow: 'hidden', padding: '1.25rem 0', marginBottom: '3rem' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '120px',
        background: 'linear-gradient(90deg, #0a0a0f, transparent)', zIndex: 10, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '120px',
        background: 'linear-gradient(-90deg, #0a0a0f, transparent)', zIndex: 10, pointerEvents: 'none',
      }} />
      <div style={{
        display: 'flex',
        animationName: 'marquee',
        animationDuration: '55s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationPlayState: paused ? 'paused' : 'running',
        width: 'max-content',
        alignItems: 'center',
      }}>
        {doubled.map((cert, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.55rem 1.1rem', marginRight: '0.85rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${cert.color}25`,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {/* Logo pill */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '5px',
              background: cert.logoBg, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2px', flexShrink: 0,
            }}>
              <img
                src={cert.logo}
                alt={cert.issuer}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.76rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>
              {cert.short}
            </span>
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: cert.color, display: 'inline-block',
              boxShadow: `0 0 5px ${cert.color}`,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Certifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? CERTS
    : CERTS.filter(c => c.tier === activeFilter);

  return (
    <section id="certifications" style={{ position: 'relative', zIndex: 2 }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>credentials</p>
          <h2 className="section-title">
            Licenses & <span className="gradient-text">Certifications</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {CERTS.length} industry-recognized credentials from Oracle, NVIDIA, AWS, Intel, Anthropic, LangChain & more.
          </p>
        </div>
      </div>

      <MarqueeStrip />

      <div className="container">
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => setActiveFilter(tier)}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '50px',
                border: `1px solid ${activeFilter === tier
                  ? (TIER_COLORS[tier] || 'rgba(0,212,255,0.6)')
                  : 'rgba(255,255,255,0.1)'}`,
                background: activeFilter === tier
                  ? `${TIER_COLORS[tier] || '#00d4ff'}15`
                  : 'rgba(255,255,255,0.03)',
                color: activeFilter === tier
                  ? (TIER_COLORS[tier] || '#00d4ff')
                  : 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'none',
                transition: 'all 0.25s ease',
                fontWeight: activeFilter === tier ? 600 : 400,
              }}
              onMouseEnter={e => {
                if (activeFilter !== tier) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }
              }}
              onMouseLeave={e => {
                if (activeFilter !== tier) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }
              }}
            >
              {tier === 'All' ? `All (${CERTS.length})` : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: TIER_COLORS[tier], display: 'inline-block',
                  }} />
                  {tier}
                </span>
              )}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '2rem' }}>
          Showing {filtered.length} of {CERTS.length} credentials
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((cert, i) => <CertCard key={i} cert={cert} />)}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
