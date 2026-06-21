import { useEffect, useState } from 'react';

export const THEMES = {
  cyberpunk: {
    label: 'Cyberpunk',
    icon: '⚡',
    cyan: '#00d4ff',
    violet: '#7c3aed',
    cyanGlow: 'rgba(0, 212, 255, 0.3)',
    cyanDim: 'rgba(0, 212, 255, 0.15)',
    borderCyan: 'rgba(0, 212, 255, 0.3)',
    violetGlow: 'rgba(124, 58, 237, 0.3)',
    violetDim: 'rgba(124, 58, 237, 0.15)',
    borderViolet: 'rgba(124, 58, 237, 0.3)',
  },
  matrix: {
    label: 'Matrix',
    icon: '🟢',
    cyan: '#00ff66',
    violet: '#059669',
    cyanGlow: 'rgba(0, 255, 102, 0.3)',
    cyanDim: 'rgba(0, 255, 102, 0.15)',
    borderCyan: 'rgba(0, 255, 102, 0.3)',
    violetGlow: 'rgba(5, 150, 105, 0.3)',
    violetDim: 'rgba(5, 150, 105, 0.15)',
    borderViolet: 'rgba(5, 150, 105, 0.3)',
  },
  volcanic: {
    label: 'Volcanic',
    icon: '🔥',
    cyan: '#ff5500',
    violet: '#dc2626',
    cyanGlow: 'rgba(255, 85, 0, 0.3)',
    cyanDim: 'rgba(255, 85, 0, 0.15)',
    borderCyan: 'rgba(255, 85, 0, 0.3)',
    violetGlow: 'rgba(220, 38, 38, 0.3)',
    violetDim: 'rgba(220, 38, 38, 0.15)',
    borderViolet: 'rgba(220, 38, 38, 0.3)',
  },
  midnight: {
    label: 'Midnight',
    icon: '❄️',
    cyan: '#a5b4fc',
    violet: '#475569',
    cyanGlow: 'rgba(165, 180, 252, 0.3)',
    cyanDim: 'rgba(165, 180, 252, 0.15)',
    borderCyan: 'rgba(165, 180, 252, 0.3)',
    violetGlow: 'rgba(71, 85, 105, 0.3)',
    violetDim: 'rgba(71, 85, 105, 0.15)',
    borderViolet: 'rgba(71, 85, 105, 0.3)',
  }
};

export const applyTheme = (themeKey) => {
  const theme = THEMES[themeKey] || THEMES.cyberpunk;
  const root = document.documentElement;
  root.style.setProperty('--cyan', theme.cyan);
  root.style.setProperty('--violet', theme.violet);
  root.style.setProperty('--cyan-glow', theme.cyanGlow);
  root.style.setProperty('--cyan-dim', theme.cyanDim);
  root.style.setProperty('--border-cyan', theme.borderCyan);
  root.style.setProperty('--violet-glow', theme.violetGlow);
  root.style.setProperty('--violet-dim', theme.violetDim);
  root.style.setProperty('--border-violet', theme.borderViolet);
  localStorage.setItem('portfolio-theme', themeKey);
};

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'cyberpunk';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleThemeChange = (key) => {
    setCurrentTheme(key);
    applyTheme(key);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 1400,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      {/* Floating Settings Button */}
      <button
        data-hover
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(10, 10, 15, 0.8)',
          border: '1px solid var(--border-cyan)',
          boxShadow: '0 0 15px var(--cyan-glow)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: 'var(--cyan)',
          cursor: 'none',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        🎨
      </button>

      {/* Palette Panel */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.4rem 0.6rem',
        background: 'rgba(10, 10, 15, 0.85)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.9)',
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            data-hover
            onClick={() => handleThemeChange(key)}
            title={theme.label}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.cyan}, ${theme.violet})`,
              border: currentTheme === key ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              cursor: 'none',
              transition: 'all 0.2s ease',
              boxShadow: currentTheme === key ? `0 0 12px ${theme.cyan}` : 'none',
              transform: currentTheme === key ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {theme.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
