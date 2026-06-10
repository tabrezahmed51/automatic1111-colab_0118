import { Sun, Moon, Zap, Workflow, History } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AI_MODELS } from '../types/models';

interface Props {
  model: string;
  onOpenWorkflow: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export function TopBar({ model, onOpenWorkflow, onToggleHistory, showHistory }: Props) {
  const { mode, toggle } = useTheme();
  const m = AI_MODELS.find(x => x.id === model);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo"><Zap size={18} /></div>
        <span className="topbar-title">MultiModel<span className="neon-text">Hub</span></span>
        <span className="topbar-model-badge">{m?.name ?? 'Select Model'}</span>
        <span className="topbar-prov">{m?.provider}</span>
      </div>
      <div className="topbar-right">
        <button className={`topbar-btn ${showHistory ? 'active' : ''}`} onClick={onToggleHistory} title="History">
          <History size={16} />
        </button>
        <button className="topbar-btn workflow-btn" onClick={onOpenWorkflow} title="Workflow & Settings">
          <Workflow size={16} />
          <span>Workflow</span>
        </button>
        <button className="topbar-btn" onClick={toggle} title={`Switch to ${mode === 'day' ? 'night' : 'day'}`}>
          {mode === 'day' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
