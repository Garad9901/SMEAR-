import { useEffect, useRef, useState } from 'react';

const SKILL_CATEGORIES = [
  {
    label: 'Programming Languages',
    icon: '💻',
    color: '#00d4ff',
    skills: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'R', 'Dart', 'Go', 'SQL', 'HTML5', 'PowerShell'],
  },
  {
    label: 'AI / ML & Data Science',
    icon: '🧠',
    color: '#7c3aed',
    skills: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-Learn', 'NumPy', 'Pandas', 'Matplotlib', 'Plotly', 'SciPy',
             'Machine Learning', 'Deep Learning', 'Gen AI', 'RAG', 'LangChain', 'LangGraph', 'MCP',
             'GNNs', 'Transformers', 'NLP', 'Computer Vision'],
  },
  {
    label: 'Frameworks & Backend',
    icon: '⚡',
    color: '#00d4ff',
    skills: ['FastAPI', 'Flask', 'Django', 'Express.js', 'NestJS', 'Fastify', 'Streamlit', 'Gunicorn', '.NET', 'React', 'React Native', 'Flutter'],
  },
  {
    label: 'Data Engineering & Big Data',
    icon: '📦',
    color: '#7c3aed',
    skills: ['Apache Spark', 'Apache Hadoop', 'Snowflake', 'Apache Kafka', 'Airflow', 'MLflow'],
  },
  {
    label: 'Data Analytics & Visualization',
    icon: '📊',
    color: '#00d4ff',
    skills: ['Power BI', 'Tableau', 'Excel', 'Matplotlib', 'Plotly', 'Statistical Analysis', 'EDA', 'Dashboarding'],
  },
  {
    label: 'Databases',
    icon: '🗄️',
    color: '#7c3aed',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Cassandra', 'PostGIS'],
  },
  {
    label: 'Cloud, DevOps & Deployment',
    icon: '☁️',
    color: '#00d4ff',
    skills: ['Docker', 'Kubernetes', 'OCI', 'AWS', 'GitHub Actions', 'Vercel', 'Netlify', 'Render', 'Terraform', 'Datadog'],
  },
  {
    label: 'Tools & Utilities',
    icon: '🛠️',
    color: '#7c3aed',
    skills: ['GitHub', 'Postman', 'NPM', 'JWT', 'Nodemon', 'Puppeteer', 'Gradle', 'Twilio', 'ZigBee', 'Windows Terminal'],
  },
  {
    label: 'Core CS Concepts',
    icon: '🎯',
    color: '#00d4ff',
    skills: ['DSA', 'Geospatial AI', 'Probability & Statistics', 'OS', 'Networking', 'System Design'],
  },
];

const SOFT_SKILLS = ['Problem Solving', 'Critical Thinking', 'Adaptability', 'Teamwork', 'Communication', 'Research'];

const useReveal = (ref) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
};

const SkillBadge = ({ name, color }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        padding: '0.38rem 0.9rem',
        borderRadius: '50px',
        fontSize: '0.76rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500,
        cursor: 'none',
        transition: 'all 0.22s ease',
        border: `1px solid ${hovered ? color : `${color}35`}`,
        background: hovered ? `${color}18` : `${color}07`,
        color: hovered ? color : 'rgba(255,255,255,0.6)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 6px 18px ${color}28, 0 0 10px ${color}18` : 'none',
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      {name}
    </span>
  );
};

const CategoryCard = ({ cat, index, visible }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 5)} ${visible ? 'visible' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '1.5rem 1.75rem',
        borderRadius: '20px',
        background: hovered ? `${cat.color}06` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? cat.color + '40' : cat.color + '18'}`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Category header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.1rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: cat.color,
          fontWeight: 700,
        }}>
          {cat.label}
        </span>
        <div style={{
          flex: 1, height: '1px',
          background: `linear-gradient(to right, ${cat.color}30, transparent)`,
        }} />
        <span style={{
          fontSize: '0.6rem', padding: '0.1rem 0.5rem', borderRadius: '50px',
          background: `${cat.color}15`, color: cat.color,
          fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${cat.color}25`,
        }}>
          {cat.skills.length}
        </span>
      </div>

      {/* Skill badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
        {cat.skills.map(skill => (
          <SkillBadge key={skill} name={skill} color={cat.color} />
        ))}
      </div>
    </div>
  );
};

const Skills = () => {
  const ref = useRef(null);
  const visible = useReveal(ref);

  const totalSkills = SKILL_CATEGORIES.reduce((acc, c) => acc + c.skills.length, 0);

  return (
    <section id="skills" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
      <div className="container">
        {/* Header */}
        <div className={`reveal ${visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>tech stack</p>
          <h2 className="section-title">
            Tools of the <span className="gradient-text">Trade</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            A curated arsenal of {totalSkills}+ technologies I use to architect intelligent, scalable systems.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            {[
              { label: 'Languages', count: 12, color: '#00d4ff' },
              { label: 'ML/AI Tools', count: 20, color: '#7c3aed' },
              { label: 'Frameworks', count: 12, color: '#00d4ff' },
              { label: 'Databases', count: 6, color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '0.5rem 1.25rem', borderRadius: '50px',
                background: `${s.color}10`, border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: s.color, fontSize: '0.9rem' }}>{s.count}+</span>
                <span style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {SKILL_CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i} visible={visible} />
          ))}
        </div>

        {/* Soft skills */}
        <div
          className={`reveal ${visible ? 'visible' : ''}`}
          style={{ marginTop: '1.5rem' }}
        >
          <div style={{
            padding: '1.4rem 1.75rem', borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.03), rgba(124,58,237,0.03))',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.1rem' }}>✨</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)', fontWeight: 700,
              }}>
                Soft Skills
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {SOFT_SKILLS.map(skill => (
                <span key={skill} style={{
                  padding: '0.38rem 0.9rem', borderRadius: '50px',
                  fontSize: '0.76rem', fontFamily: 'Inter, sans-serif',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
