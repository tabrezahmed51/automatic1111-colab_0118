import { useState } from 'react';
import { Image, MessageSquare, Eye, Sparkles, Settings, Download, ChevronRight } from 'lucide-react';
import { AI_MODELS, type ModelType } from '../types/models';

interface Props { selected: string; onSelect: (id: string) => void; onOpenSettings: () => void; onOpenExport: () => void }

const META: Record<ModelType, { label: string; Icon: typeof Image }> = {
  image: { label: 'Image Generation', Icon: Image },
  text: { label: 'Text Models', Icon: MessageSquare },
  vision: { label: 'Vision Models', Icon: Eye },
};

export function Sidebar({ selected, onSelect, onOpenSettings, onOpenExport }: Props) {
  const [expanded, setExpanded] = useState<ModelType>('image');
  const types = (Object.keys(META) as ModelType[]);

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        <h3 className="sidebar-heading"><Sparkles size={14} /><span>AI MODELS</span></h3>
        {types.map(t => {
          const { label, Icon } = META[t];
          const models = AI_MODELS.filter(m => m.type === t);
          const open = expanded === t;
          return (
            <div key={t} className="model-group">
              <button className={`group-header ${open ? 'open' : ''}`} onClick={() => setExpanded(open ? '' as ModelType : t)}>
                <Icon size={15} /><span>{label}</span>
                <span className="group-count">{models.length}</span>
                <ChevronRight size={13} className={`chev ${open ? 'rotated' : ''}`} />
              </button>
              {open && (
                <div className="model-list">
                  {models.map(m => (
                    <button key={m.id} className={`model-btn ${selected === m.id ? 'active' : ''}`} onClick={() => onSelect(m.id)} title={m.description}>
                      <div className="model-btn-info">
                        <span className="model-btn-name">{m.name}</span>
                        <span className="model-btn-prov">{m.provider}</span>
                      </div>
                      <div className="model-btn-tags">
                        {m.free && <span className="tag tag-free">FREE</span>}
                        {m.streaming && <span className="tag tag-stream">STREAM</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sidebar-footer">
        <button className="sidebar-action" onClick={onOpenExport}><Download size={15} /><span>Export Code</span></button>
        <button className="sidebar-action" onClick={onOpenSettings}><Settings size={15} /><span>API Settings</span></button>
      </div>
    </aside>
  );
}
