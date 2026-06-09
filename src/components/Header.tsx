import { Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { mode, toggle } = useTheme();
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-icon"><Zap size={22} /></div>
          <div className="logo-text">
            <h1>MultiModel<span className="neon-text">Hub</span></h1>
            <span className="logo-sub">Uncensored &bull; Unrestricted &bull; Open Source</span>
          </div>
          <span className="badge-free">FREE</span>
        </div>
        <div className="header-actions">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="header-btn" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3-.5 6-2.5 6-6a6 6 0 0 0-1.5-4A5.6 5.6 0 0 0 18 2c-1 0-2 .5-3 1.5A9.4 9.4 0 0 0 9 3.5c-1-1-2-1.5-3-1.5A5.6 5.6 0 0 0 1.5 6 6 6 0 0 0 0 10c0 3.5 3 5.5 6 6a4.8 4.8 0 0 0-1 3.5V22"/><path d="M9 22c-2 0-4-1-5-2.5"/></svg>
          </a>
          <button onClick={toggle} className="header-btn theme-btn" title={`Switch to ${mode === 'day' ? 'night' : 'day'}`}>
            {mode === 'day' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="theme-label">{mode === 'day' ? 'Night' : 'Day'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
