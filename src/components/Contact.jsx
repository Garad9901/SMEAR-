import { useRef, useState } from 'react';

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'yash.garad27@gmail.com',
    href: 'mailto:yash.garad27@gmail.com',
    icon: '✉️',
    color: '#00d4ff',
    desc: 'Drop me a message anytime',
  },
  {
    label: 'Phone',
    value: '+91-9370471759',
    href: 'tel:+919370471759',
    icon: '📞',
    color: '#7c3aed',
    desc: 'Call or WhatsApp',
  },
  {
    label: 'GitHub',
    value: 'github.com/Garad9901',
    href: 'https://github.com/Garad9901',
    icon: '⌨️',
    color: '#00d4ff',
    desc: 'Check out my code',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/yash-garad-23a315255',
    href: 'https://linkedin.com/in/yash-garad-23a315255',
    icon: '💼',
    color: '#7c3aed',
    desc: 'Connect professionally',
  },
];

const ContactLink = ({ item }) => {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.12;
    const dy = (e.clientY - cy) * 0.12;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (ref.current) ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <a
      ref={ref}
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      data-hover
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.35rem 1.75rem',
        borderRadius: '18px',
        background: hovered ? `${item.color}08` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? item.color + '50' : item.color + '20'}`,
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        boxShadow: hovered ? `0 12px 40px ${item.color}20` : 'none',
        backdropFilter: 'blur(10px)',
        cursor: 'none',
        textDecoration: 'none',
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: `${item.color}15`, border: `1px solid ${item.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
        boxShadow: hovered ? `0 0 18px ${item.color}30` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.7rem', color: item.color,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '0.2rem', opacity: 0.85,
        }}>
          {item.label}
        </div>
        <div style={{
          fontSize: '0.92rem', fontWeight: 600, color: '#f0f0ff',
          fontFamily: 'Inter, sans-serif', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.15rem',
        }}>
          {item.value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'Inter, sans-serif' }}>
          {item.desc}
        </div>
      </div>
      <div style={{
        color: item.color, fontSize: '1.1rem',
        opacity: hovered ? 1 : 0.3,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        transition: 'all 0.3s ease', flexShrink: 0,
      }}>
        →
      </div>
    </a>
  );
};

const Contact = () => (
  <section id="contact" style={{ position: 'relative', zIndex: 2, paddingBottom: '6rem' }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <p className="section-label" style={{ justifyContent: 'center' }}>get in touch</p>
        <h2 className="section-title">
          Let's <span className="gradient-text">Connect</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Open to collaborations, research projects, AI Engineering roles, and exciting opportunities.
        </p>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Glassmorphism card */}
        <div style={{
          padding: '2.5rem',
          borderRadius: '28px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(0,212,255,0.1)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Corner glows */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.07), transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', left: '-60px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.07), transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 1rem', borderRadius: '50px',
            background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
            marginBottom: '2rem', position: 'relative',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              boxShadow: '0 0 8px #4ade80', animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.73rem',
              color: '#00d4ff', letterSpacing: '0.08em',
            }}>
              Available for opportunities
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
            {CONTACT_LINKS.map(item => <ContactLink key={item.label} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
