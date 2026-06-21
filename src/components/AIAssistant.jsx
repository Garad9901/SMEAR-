import { useState, useRef, useEffect } from 'react';

const YASH_BIO = {
  education: 'AI/ML Engineering undergraduate student at Yeshwantrao Chavan College of Engineering (YCCE), Nagpur, Maharashtra, India.',
  skills: {
    languages: 'Python, JavaScript, TypeScript, C, C++, Java, R, Go, Dart, HTML5, PowerShell',
    frameworks: 'React, Next.js, Django, Flask, Express.js, NestJS, FastAPI, Flutter, Streamlit',
    ai_ml: 'PyTorch, TensorFlow, Keras, Scikit-Learn, SciPy, NumPy, Pandas, Matplotlib, Plotly, LangChain, RAG, Model Context Protocol (MCP)',
    devops_cloud: 'Docker, Kubernetes, AWS, Vercel, Netlify, Render, Datadog',
    databases: 'PostgreSQL, PostGIS, MongoDB, MySQL, Cassandra, Snowflake, Firebase',
    big_data: 'Apache Spark, Apache Hadoop, Apache Kafka, Airflow, MLflow',
  },
  projects: [
    { name: 'AgroSense AI', desc: 'Crop risk & precipitation forecasting platform for Vidarbha using ML, LSTMs, and GNNs.' },
    { name: 'AadhaarX', desc: 'Cloud-native digital identity system with biometric liveness detection and blockchain audit.' },
    { name: 'MathGPT Enterprise', desc: 'Neuro-symbolic math research tool integrating Gemini 2.5, Lean 4, SymPy, and LangChain.' },
    { name: 'GAIA Geospatial Dashboard', desc: 'Census GIS planning engine mapping demographic data & seismic hazard maps.' },
    { name: 'UrduGuard NLP Moderation', desc: 'FastAPI Urdu content moderation pipeline with LIME text explainability.' },
    { name: 'Smart Resume Screener', desc: 'NLP-based job matching parser aligning CV skills with description keywords.' }
  ],
  certifications: 'Oracle OCI GenAI Professional, NVIDIA Deep Learning, Anthropic MCP, LangChain Observability & LangSmith, ISRO/IIRS Geospatial.'
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi! I'm Yash's AI Assistant. Ask me anything about his projects, skills, or credentials!\n\nOr try these shortcuts:",
      isIntro: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key') || '';
    setApiKey(savedKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini-api-key', apiKey);
    setShowSettings(false);
    addBotMessage("🔑 Gemini API Key updated! I will now use real-time RAG inference for your questions.");
  };

  const addBotMessage = (text) => {
    setIsTyping(false);
    setMessages(prev => [...prev, { sender: 'bot', text }]);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInputValue('');
    setIsTyping(true);

    const savedKey = localStorage.getItem('gemini-api-key') || '';

    if (savedKey) {
      // Execute Real Gemini RAG API call
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are the AI Portfolio Assistant for Yash Rajesh Garad, a talented AI/ML Engineer, GenAI Specialist, and Geospatial AI Developer.
                
                Yash's profile metadata:
                - Education: ${YASH_BIO.education}
                - Skills: Languages: ${YASH_BIO.skills.languages}. AI/ML: ${YASH_BIO.skills.ai_ml}. Frameworks: ${YASH_BIO.skills.frameworks}. Databases/DevOps: ${YASH_BIO.skills.databases}, ${YASH_BIO.skills.devops_cloud}.
                - Top Projects:
                  ${YASH_BIO.projects.map(p => `* ${p.name}: ${p.desc}`).join('\n')}
                - Certifications: ${YASH_BIO.certifications}
                - Contacts: Email: yash.garad27@gmail.com, GitHub: github.com/Garad9901, LinkedIn: linkedin.com/in/yash-garad-23a315255, Tel: +91-9370471759.
                - Location: Nagpur, India.
                - Resume: Available for download at /resume.pdf.
                
                Answer the user's questions about Yash's credentials, portfolio, and experience professionally and enthusiastically. Keep answers brief (2-3 sentences max). Format key details with markdown list items. If the user asks general or unrelated questions, gently pivot the response back to showcasing Yash's qualifications.`
              }, {
                text: query
              }]
            }]
          })
        });

        const data = await response.json();
        const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I processed your request, but I didn't receive a response. Please check your Gemini API key or try again.";
        addBotMessage(botResponseText);
      } catch (err) {
        console.error("Gemini API Error:", err);
        executeHeuristicResponse(query);
      }
    } else {
      // Execute local heuristic response
      setTimeout(() => {
        executeHeuristicResponse(query);
      }, 700);
    }
  };

  const executeHeuristicResponse = (query) => {
    const q = query.toLowerCase();
    let reply = "";

    if (q.includes('project') || q.includes('work') || q.includes('build') || q.includes('create')) {
      reply = `**Yash's Top AI Projects:**\n\n` + 
        YASH_BIO.projects.map(p => `• **${p.name}**: ${p.desc}`).join('\n\n') +
        `\n\nScroll to the *Projects* section to view architecture blueprints, filters, and code repositories!`;
    } else if (q.includes('skill') || q.includes('language') || q.includes('python') || q.includes('javascript') || q.includes('stack') || q.includes('tech')) {
      reply = `**Yash's Tech Stack:**\n\n` +
        `• **Languages:** ${YASH_BIO.skills.languages}\n` +
        `• **AI/ML:** ${YASH_BIO.skills.ai_ml}\n` +
        `• **Backend/Frameworks:** ${YASH_BIO.skills.frameworks}\n` +
        `• **DevOps/Cloud:** ${YASH_BIO.skills.devops_cloud}\n\n` +
        `Check out the *Skills* section above for a full visual breakdown!`;
    } else if (q.includes('cert') || q.includes('credentials') || q.includes('license') || q.includes('oracle') || q.includes('nvidia') || q.includes('langchain')) {
      reply = `**Yash's Top Certifications (16 total):**\n\n` +
        `• **Oracle**: OCI 2025 GenAI Professional\n` +
        `• **NVIDIA**: Fundamentals of Deep Learning\n` +
        `• **LangChain**: Observability, Evaluations, & Essentials\n` +
        `• **Anthropic**: Model Context Protocol (MCP)\n` +
        `• **ISRO/IIRS**: Geocomputation & Geo-Web Services\n\n` +
        `Scroll down to the *Certifications* section to view issuer badges and credential IDs!`;
    } else if (q.includes('resume') || q.includes('cv') || q.includes('pdf') || q.includes('download')) {
      reply = `You can download Yash Rajesh Garad's official resume by clicking the link below:\n\n` +
        `📥 **[Download Resume PDF](/resume.pdf)**\n\n` +
        `Or click the floating button in the *Hero* header section.`;
    } else if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('linkedin')) {
      reply = `**Get in Touch with Yash:**\n\n` +
        `• ✉️ **Email:** yash.garad27@gmail.com\n` +
        `• 📞 **Phone:** +91 9370471759\n` +
        `• 💼 **LinkedIn:** [linkedin.com/in/yash-garad-23a315255](https://linkedin.com/in/yash-garad-23a315255)\n` +
        `• ⌨️ **GitHub:** [github.com/Garad9901](https://github.com/Garad9901)\n\n` +
        `He is based in Nagpur, India, and open to AI/ML and software engineering opportunities!`;
    } else {
      reply = `Yash Rajesh Garad is an AI/ML Engineering student at YCCE, Nagpur. He builds Generative AI systems, RAG applications, and Geospatial AI models.\n\n` +
        `Try asking about: \n` +
        `• *"What projects has he built?"*\n` +
        `• *"Tell me about his certifications"* \n` +
        `• *"What is his technical stack?"*\n` +
        `• *"How can I contact him?"*`;
    }

    addBotMessage(reply);
  };

  return (
    <>
      {/* Chat Floating Button */}
      <button
        data-hover
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
          border: 'none',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#fff',
          cursor: 'none',
          zIndex: 1490,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(0.9) rotate(90deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window Panel */}
      <div className={`assistant-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="assistant-terminal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="terminal-dots">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
            </div>
            <span>yash_bot_agent.sh</span>
          </div>
          {/* Key / Settings Icon */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: 'none',
              color: apiKey ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
              cursor: 'none',
              fontSize: '1rem',
            }}
            title="Configure Gemini RAG API"
          >
            🔑
          </button>
        </div>

        {/* Settings Area */}
        {showSettings && (
          <form onSubmit={handleSaveKey} style={{
            background: 'rgba(5, 5, 10, 0.95)',
            borderBottom: '1px solid var(--border-cyan)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Enter a Gemini API Key to enable real cognitive responses:</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.5rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.72rem',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--cyan-dim)',
                  border: '1px solid var(--border-cyan)',
                  color: 'var(--cyan)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  cursor: 'none',
                  fontSize: '0.72rem',
                }}
              >
                Save
              </button>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>Key is saved securely in your browser's localStorage.</p>
          </form>
        )}

        {/* Message Log */}
        <div className="assistant-terminal-body">
          {messages.map((msg, i) => (
            <div key={i} className={`assistant-message ${msg.sender}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text.split('\n').map((line, lineIdx) => {
                  // Support rendering bold text/markdown links
                  let content = line;
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const linkRegex = /\[(.*?)\]\((.*?)\)/g;

                  // Simple markdown bold parser
                  const parts = [];
                  let lastIndex = 0;
                  let match;

                  while ((match = boldRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(line.substring(lastIndex, match.index));
                    }
                    parts.push(<strong key={match.index} style={{ color: 'var(--cyan)' }}>{match[1]}</strong>);
                    lastIndex = boldRegex.lastIndex;
                  }
                  if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                  }

                  const renderedText = parts.length > 0 ? parts : line;

                  return (
                    <p key={lineIdx} style={{ marginBottom: '0.35rem' }}>
                      {renderedText}
                    </p>
                  );
                })}
              </div>

              {msg.isIntro && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginTop: '0.85rem'
                }}>
                  {[
                    { label: '🚀 View Projects', q: '/projects' },
                    { label: '🛠️ Technical Stack', q: '/skills' },
                    { label: '🎓 Certifications', q: '/certs' },
                    { label: '📥 Download CV', q: '/resume' },
                    { label: '📞 Contact Details', q: '/contact' }
                  ].map(btn => (
                    <button
                      key={btn.q}
                      onClick={() => handleSend(btn.q)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.75rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'var(--border-cyan)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="assistant-message bot" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <span className="terminal-prompt-prefix">&gt;</span>
              <span style={{ color: 'var(--cyan)' }}>Analyzing query...</span>
              <span className="terminal-caret-blink" style={{ display: 'inline-block', width: '6px', height: '12px', background: 'var(--cyan)' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="terminal-input-container">
          <span className="terminal-prompt-prefix">$</span>
          <input
            type="text"
            className="terminal-input-field"
            placeholder="Type a message (e.g. skills, contact)..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
