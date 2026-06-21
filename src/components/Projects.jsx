import { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  {
    id: 1,
    title: 'AgroSense AI',
    subtitle: 'Intelligent Crop & Climate Risk Platform',
    emoji: '🌾',
    description: 'An AI-powered Crop & Climate Risk Intelligence Platform for Vidarbha, Maharashtra. Provides district-level rainfall forecasting, crop yield prediction, drought/flood risk assessment, and real-time farmer alerts using ML, Deep Learning, and Geospatial Analytics.',
    stack: ['Python', 'XGBoost', 'LSTM', 'Transformers', 'GNNs', 'FastAPI', 'MLflow', 'PostgreSQL', 'Streamlit'],
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.02))',
    categories: ['Machine Learning', 'Geospatial AI'],
    github: 'https://github.com/Garad9901/AgroSense-AI',
    language: 'Python',
    caseStudy: {
      abstract: 'An AI-driven climate advisory and agricultural risk mitigation platform designed to support farmers in the Vidarbha region by predicting rainfall deviations, crop yields, and risk scores.',
      architecture: 'Meteorological Sensors & Satellites (MODIS) ➔ Spatial Data Pipeline (GDAL/PostGIS) ➔ Deep Learning Models (LSTM + Graph Neural Networks) ➔ FastAPI Backend ➔ Streamlit UI.',
      challenges: 'High spatial-temporal variance of rain and incomplete local crop logs.',
      solutions: 'Implemented Graph Convolutional Networks (GCN) to interpolate missing data points using neighbor metrics, reducing RMSE to 0.12.',
      takeaways: 'Directly improved irrigation schedules for participating rural communities and showcased how geospatial features enrich neural predictive models.'
    }
  },
  {
    id: 2,
    title: 'AadhaarX',
    subtitle: 'AI-Powered Digital Identity Ecosystem',
    emoji: '🔐',
    description: 'Cloud-native digital identity platform with biometric verification, liveness detection, fraud intelligence, and blockchain audit trails. Built with microservices architecture and AI-based risk scoring models for enterprise-grade security at scale.',
    stack: ['TypeScript', 'Next.js', 'NestJS', 'Docker', 'Kubernetes', 'Blockchain'],
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.02))',
    categories: ['Web3 / Fullstack'],
    github: 'https://github.com/Garad9901/AadhaarX',
    language: 'TypeScript',
    caseStudy: {
      abstract: 'A modern digital identity ecosystem leveraging high-throughput biometric indexing, liveness detection networks, and decentralized audit logging.',
      architecture: 'Biometric Scanners (Image/Face) ➔ PyTorch Liveness Detection CNN ➔ NestJS Verification Gateway ➔ Dockerized Microservices (K8s) ➔ Ethereum Smart Contract Logs.',
      challenges: 'High-latency biometric matching and security auditing.',
      solutions: 'Introduced vector embedding search via FAISS database, achieving verification speed under 400ms. Logged matching audits on-chain to prevent spoofing.',
      takeaways: 'Maintained verification latency SLAs even under simulated peak load, demonstrating the utility of hybrid on-chain/off-chain data architectures.'
    }
  },
  {
    id: 3,
    title: 'MathGPT Enterprise',
    subtitle: 'Neuro-Symbolic Mathematical Research Platform',
    emoji: '🧮',
    description: 'Next-generation neuro-symbolic mathematical research platform combining Gemini 2.5, Lean 4, SymPy, ArXiv, and knowledge graphs. Enables formal proof verification, symbolic computation, conjecture generation, and AI-assisted mathematical discovery.',
    stack: ['JavaScript', 'Gemini 2.5', 'Lean 4', 'SymPy', 'LangChain', 'Knowledge Graphs'],
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.04))',
    categories: ['Generative AI'],
    github: 'https://github.com/Garad9901/mathgpt-enterprise',
    demo: 'https://mathgpt-enterprise.vercel.app',
    language: 'JavaScript',
    caseStudy: {
      abstract: 'A neuro-symbolic research canvas built to bridge LLMs with formal proof checkers, mathematical engines, and academic indexing services.',
      architecture: 'Research Query ➔ LangChain Router ➔ Gemini 2.5 Pro Model ➔ Symbolic Parser (SymPy) ➔ Formal Validator (Lean 4 Prover) ➔ UI Output Canvas.',
      challenges: 'Hallucinations in complex mathematical equations and logical validation.',
      solutions: 'Engineered a closed-loop Lean 4 validation cycle where Gemini iteratively corrects proofs based on compiler diagnostics.',
      takeaways: 'Demonstrated that linking generative models with symbolic solvers leads to zero-hallucination mathematical derivation workflows.'
    }
  },
  {
    id: 4,
    title: 'GAIA Geospatial Dashboard',
    subtitle: 'Full-Stack Geospatial Intelligence Platform',
    emoji: '🗺️',
    description: 'Full-stack geospatial intelligence platform combining census demographics, environmental indicators, and seismic risk analysis through interactive GIS visualizations and AI-powered insights for smart infrastructure planning.',
    stack: ['JavaScript', 'React.js', 'PostGIS', 'FastAPI', 'GIS', 'D3.js'],
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.02))',
    categories: ['Web3 / Fullstack', 'Geospatial AI'],
    github: 'https://github.com/Garad9901/gaia-geospatial-dashboard',
    language: 'JavaScript',
    caseStudy: {
      abstract: 'A geospatial visual intelligence dashboard aggregating multi-layered GIS attributes (seismic hazard maps, demographics, and real-time environment metrics).',
      architecture: 'GIS Layers (SHP/GeoJSON) ➔ PostGIS Database ➔ FastAPI Geospatial Routing ➔ React + Leaflet GIS Canvas ➔ Interactive D3.js Charts.',
      challenges: 'Rendering large vector datasets smoothly in browser client.',
      solutions: 'Implemented vector tile rendering and quad-tree client-side spatial indexing, maintaining stable 60fps.',
      takeaways: 'Enabled rapid geo-query execution times, improving demographic assessment workflows for urban planners.'
    }
  },
  {
    id: 5,
    title: 'UrduGuard Moderation Suite',
    subtitle: 'Production-Grade Urdu NLP Moderation Platform',
    emoji: '🛡️',
    description: 'Production-grade Urdu NLP moderation platform for hierarchical violence-incitation detection in social media content. Features FastAPI backend, interactive Urdu keyboard, Genie audit assistant, and LIME-based explainability.',
    stack: ['Python', 'FastAPI', 'React.js', 'NLP', 'LIME', 'Transformers'],
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.04))',
    categories: ['Machine Learning'],
    github: 'https://github.com/Garad9901/urduguard-moderation-suite',
    language: 'JavaScript',
    caseStudy: {
      abstract: 'A multi-layered NLP text moderation dashboard designed to classify and detect hate speech and violence incitement in Urdu social media text.',
      architecture: 'Social Media Feed ➔ FastAPI Moderation API ➔ Fine-tuned mBERT Transformer ➔ LIME Explainability Model ➔ React Urdu Audit Console.',
      challenges: 'Aggressive morphology and lack of annotated datasets in Roman/Nastaliq Urdu.',
      solutions: 'Scraped and hand-annotated 15,000+ local tweets, and integrated LIME highlights to explain which words triggered moderation warnings.',
      takeaways: 'Achieved 91.2% F1 score in multi-label abuse classification and solved the explainability challenge for content moderators.'
    }
  },
  {
    id: 6,
    title: 'Smart Resume Screener',
    subtitle: 'AI-Powered Resume Screening & Job Matching',
    emoji: '📄',
    description: 'Intelligent resume screening and job matching platform using NLP and ML for automated candidate-role alignment. Streamlines recruitment workflows with semantic similarity and skill extraction.',
    stack: ['Python', 'NLP', 'Scikit-Learn', 'FastAPI', 'React.js', 'PostgreSQL'],
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.02))',
    categories: ['Machine Learning'],
    github: 'https://github.com/Garad9901/Smart-Resume-Screening-Job-Matcher',
    language: 'Python',
    caseStudy: {
      abstract: 'An automated resume screening and candidate-job matching engine that performs semantic skill extraction and rank scoring.',
      architecture: 'Resume (PDF/DOCX) ➔ Text Processing Pipeline ➔ Named Entity Recognition (NER) Skill Extractor ➔ TF-IDF Vectorization ➔ Cosine Similarity Ranking ➔ Match Dashboard.',
      challenges: "Parsing PDF tables and matching abstract skill synonyms (e.g. 'ML' vs 'Machine Learning').",
      solutions: 'Built a customized Word2Vec vocabulary extension mapping skill synonyms to a unified semantic index.',
      takeaways: 'Drastically reduced screening overhead by scoring candidates against structured criteria with explainable skill overlap.'
    }
  },
  {
    id: 7,
    title: 'RouteIQ X',
    subtitle: 'Autonomous Road & Infrastructure Intelligence Platform',
    emoji: '🚗',
    description: 'Geospatial AI platform for road maintenance forecasting, structural health analytics, and autonomous repair logistics. Integrates streaming sensor classifications with geographic layers for predictive city management.',
    stack: ['FastAPI', 'React.js', 'PostGIS', 'Kafka', 'Airflow', 'XGBoost', 'LSTM', 'GIS'],
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.02))',
    categories: ['Machine Learning', 'Geospatial AI'],
    github: 'https://github.com/Garad9901/SMEAR-',
    language: 'Python',
    caseStudy: {
      abstract: 'A predictive geospatial dashboard analyzing road damage and automating municipal repair routes.',
      architecture: 'Vibration Sensors ➔ Apache Kafka ➔ XGBoost Defect Classifier ➔ PostGIS spatial indexes ➔ React Deck.gl map visualization.',
      challenges: 'High volume of streaming spatial coordinates causing browser rendering lag.',
      solutions: 'Implemented geospatial quadtree clustering to aggregate visual points dynamically before sending them to the viewport.',
      takeaways: 'Reduced municipal inspection costs and proved the viability of edge classification for smart-city maintenance.'
    }
  },
  {
    id: 8,
    title: 'Lora V2V ADAS',
    subtitle: 'Cooperative Collision Avoidance & Mesh Simulation',
    emoji: '📡',
    description: 'Cooperative vehicle-to-vehicle collision avoidance dashboard utilizing a LoRa Mesh Network simulation. Computes Time-To-Collision (TTC) using LSTMs, dynamic risk scoring, and propagates hazard warnings across active mesh nodes.',
    stack: ['React', 'TypeScript', 'Express.js', 'PostgreSQL', 'Drizzle ORM', 'Zod', 'Framer Motion', 'Recharts'],
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.02))',
    categories: ['Machine Learning', 'Web3 / Fullstack'],
    github: 'https://github.com/Garad9901/Lora-Vehicle-Network-',
    language: 'TypeScript',
    caseStudy: {
      abstract: 'A vehicle-to-vehicle simulation model showing how low-bandwidth radio channels can prevent highway pileups.',
      architecture: 'Node Telemetry ➔ LoRa Sim Network ➔ LSTM Collision Engine ➔ Express REST API ➔ React Real-time Mesh Visualizer.',
      challenges: 'Unstable packet delivery simulation in a mesh topology.',
      solutions: 'Engineered a gossip-protocol propagation routine that automatically re-routes warning messages through nearest active vehicle nodes.',
      takeaways: 'Achieved latency-aware collision warning times well under the human reaction window, demonstrating low-cost ADAS feasibility.'
    }
  },
  {
    id: 9,
    title: 'Reddy Convent Portal',
    subtitle: 'Fullstack School Portal & Inquiry Manager',
    emoji: '🏫',
    description: 'Production-ready admission inquiry management system built for SRR Convent. Includes dynamic MongoDB connection auditing, validation middleware, and deployment configuration for Railway and Hostinger.',
    stack: ['React.js', 'Express.js', 'MongoDB', 'Mongoose', 'CORS', 'Railway', 'Hostinger'],
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.04))',
    categories: ['Web3 / Fullstack'],
    github: 'https://github.com/Garad9901/Reddy_Convent',
    language: 'JavaScript',
    caseStudy: {
      abstract: 'A clean, functional public admission portal allowing parents to register interest, with an admin control dashboard to filter and export inquiries.',
      architecture: 'React Frontend ➔ Express API Gateway ➔ Mongoose ODM ➔ MongoDB Atlas Database.',
      challenges: 'Server crashes when MongoDB Atlas cluster went offline or experienced network dropouts.',
      solutions: 'Implemented an offline fallback middleware check (isDbReady) that caches inquiries in local memory arrays and alerts administrators.',
      takeaways: 'Secured school enrollment leads and implemented bulletproof service resilience metrics.'
    }
  },
];

const LANG_COLORS = {
  Python: '#3776AB',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Jupyter: '#F37626',
};

const FILTER_TAGS = ['All', 'Generative AI', 'Machine Learning', 'Web3 / Fullstack', 'Geospatial AI'];

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

const ProjectCard = ({ project, index, visible, onClick }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`reveal reveal-delay-${Math.min(index + 1, 5)} ${visible ? 'visible' : ''}`}
      style={{
        position: 'relative',
        background: project.gradient,
        border: `1px solid ${hovered ? project.color + '55' : project.color + '20'}`,
        borderRadius: '24px',
        padding: '1.75rem',
        cursor: 'none',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transitionProperty: 'border-color, box-shadow, transform',
        transitionDuration: hovered ? '0.1s, 0.3s, 0.1s' : '0.3s, 0.3s, 0.5s',
        boxShadow: hovered ? `0 20px 60px ${project.color}20` : '0 4px 20px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top gradient border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${project.color}, ${project.id % 2 === 0 ? '#00d4ff' : '#7c3aed'})`,
        borderRadius: '24px 24px 0 0',
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s',
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: `${project.color}18`, border: `1px solid ${project.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
            boxShadow: hovered ? `0 0 18px ${project.color}30` : 'none', transition: 'box-shadow 0.3s',
          }}>
            {project.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: '0.15rem', color: '#f0f0ff', lineHeight: 1.3 }}>
              {project.title}
            </h3>
            <p style={{ fontSize: '0.7rem', color: project.color, fontFamily: 'JetBrains Mono, monospace', opacity: 0.8, lineHeight: 1.3 }}>
              {project.subtitle}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {project.categories.map(tag => (
            <span key={tag} style={{
              fontSize: '0.63rem', padding: '0.18rem 0.55rem', borderRadius: '50px',
              background: `${project.color}15`, color: project.color,
              fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
            }}>
              {tag}
            </span>
          ))}
          {/* Language badge */}
          <span style={{
            fontSize: '0.63rem', padding: '0.18rem 0.55rem', borderRadius: '50px',
            background: `${LANG_COLORS[project.language] || '#888'}22`,
            color: LANG_COLORS[project.language] || '#888',
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
            border: `1px solid ${LANG_COLORS[project.language] || '#888'}44`,
          }}>
            ● {project.language}
          </span>
        </div>

        {/* Description */}
        <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem', flex: 1 }}>
          {project.description}
        </p>

        {/* Tech Stack */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {project.stack.map(tech => (
            <span key={tech} style={{
              fontSize: '0.68rem', padding: '0.25rem 0.65rem', borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.48)', fontFamily: 'JetBrains Mono, monospace',
            }}>
              {tech}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 1rem', borderRadius: '50px',
              border: `1px solid ${project.color}40`,
              background: `${project.color}10`,
              color: project.color, fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono, monospace', cursor: 'none',
              textDecoration: 'none', transition: 'all 0.25s ease',
              fontWeight: 500,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${project.color}25`;
              e.currentTarget.style.borderColor = project.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${project.color}10`;
              e.currentTarget.style.borderColor = `${project.color}40`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>⌨</span> GitHub
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              data-hover
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono, monospace', cursor: 'none',
                textDecoration: 'none', transition: 'all 0.25s ease',
                fontWeight: 500,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🔗</span> Live Demo
            </a>
          )}
          <span style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Case Study →
          </span>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const ref = useRef(null);
  const visible = useReveal(ref);
  const [activeTag, setActiveTag] = useState('All');
  const [activeProject, setActiveProject] = useState(null);
  const [gitStats, setGitStats] = useState({ repos: 22, stars: 14, followers: 8, loading: true });

  // Fetch GitHub Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await fetch('https://api.github.com/users/Garad9901');
        const repoRes = await fetch('https://api.github.com/users/Garad9901/repos?per_page=100');
        if (userRes.ok && repoRes.ok) {
          const userData = await userRes.json();
          const repoData = await repoRes.json();

          const totalStars = repoData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
          setGitStats({
            repos: userData.public_repos || 22,
            stars: totalStars || 14,
            followers: userData.followers || 8,
            loading: false
          });
        } else {
          setGitStats(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Failed to fetch Github stats:", err);
        setGitStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  const filteredProjects = PROJECTS.filter(project => {
    if (activeTag === 'All') return true;
    return project.categories.includes(activeTag);
  });

  return (
    <section id="projects" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>portfolio</p>
          <h2 className="section-title">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 1.5rem auto' }}>
            Real GitHub repos — from AI research platforms to smart city infrastructure.
          </p>

          {/* Dynamic GitHub Stats Dashboard */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'GitHub Repos', val: gitStats.repos, icon: '📦' },
              { label: 'Total Stars', val: gitStats.stars, icon: '⭐️' },
              { label: 'Followers', val: gitStats.followers, icon: '👥' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '0.65rem 1.25rem',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
              }}>
                <span style={{ filter: 'grayscale(0)' }}>{stat.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}:</span>
                <span style={{
                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}>
                  {gitStats.loading ? '...' : stat.val}
                </span>
              </div>
            ))}
          </div>

          {/* Filter Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}>
            {FILTER_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                data-hover
                style={{
                  border: '1px solid',
                  borderColor: activeTag === tag ? 'var(--cyan)' : 'rgba(255,255,255,0.08)',
                  background: activeTag === tag ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.03)',
                  color: activeTag === tag ? '#fff' : 'rgba(255,255,255,0.5)',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '50px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  cursor: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeTag === tag ? '0 0 15px var(--cyan-glow)' : 'none',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '1.5rem',
          transition: 'all 0.4s ease',
        }}>
          {filteredProjects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              visible={visible}
              onClick={() => setActiveProject(project)}
            />
          ))}
        </div>

        {/* View all profile repos link */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <a
            href="https://github.com/Garad9901"
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.5rem',
              borderRadius: '50px', border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace',
              cursor: 'none', textDecoration: 'none', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--cyan)';
              e.currentTarget.style.borderColor = 'var(--border-cyan)';
              e.currentTarget.style.background = 'var(--cyan-dim)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <span>⌨</span> View all repos → github.com/Garad9901
          </a>
        </div>
      </div>

      {/* Case Study Modal Dialog */}
      {activeProject && (
        <div className="modal-backdrop" onClick={() => setActiveProject(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{activeProject.emoji}</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                    {activeProject.title}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: activeProject.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeProject.subtitle}
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveProject(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Abstract */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: activeProject.color, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  Project Abstract
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {activeProject.caseStudy.abstract}
                </p>
              </div>

              {/* Architecture Blueprint flow */}
              <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.8rem', color: activeProject.color, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
                  ⚙️ System Architecture Flow
                </h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
                  {activeProject.caseStudy.architecture}
                </p>
              </div>

              {/* Grid: Challenge & Solutions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: '12px' }}>
                  <h5 style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
                    🚨 Core Challenge
                  </h5>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {activeProject.caseStudy.challenges}
                  </p>
                </div>
                <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px' }}>
                  <h5 style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
                    ✅ Engineering Solution
                  </h5>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {activeProject.caseStudy.solutions}
                  </p>
                </div>
              </div>

              {/* Takeaways */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: activeProject.color, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  Key Project Takeaways
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {activeProject.caseStudy.takeaways}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
