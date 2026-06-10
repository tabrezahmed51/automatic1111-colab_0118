import { X, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../types/models';

interface Props {
  items: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  selectedId: string | null;
}

export function HistoryPanel({ items, isOpen, onClose, onSelect, onClear, selectedId }: Props) {
  if (!isOpen) return null;

  return (
    <div className="history-panel">
      <div className="history-head">
        <h3>History</h3>
        <div className="history-actions">
          {items.length > 0 && <button className="history-clear" onClick={onClear}><Trash2 size={13} />Clear All</button>}
          <button className="history-close" onClick={onClose}><X size={16} /></button>
        </div>
      </div>
      <div className="history-list">
        {items.length === 0 && <p className="history-empty">No generations yet</p>}
        {items.map(item => (
          <button
            key={item.id}
            className={`history-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
          >
            <div className="hi-thumb">
              {item.result.startsWith('blob:') || item.result.startsWith('http') ? (
                <img src={item.result} alt="" />
              ) : (
                <div className="hi-text-icon">T</div>
              )}
            </div>
            <div className="hi-info">
              <span className="hi-prompt">{item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '...' : ''}</span>
              <span className="hi-meta">{item.provider} &bull; {new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
