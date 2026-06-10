import { useState } from 'react';
import { GripVertical, ChevronRight, Sparkles, LayoutTemplate } from 'lucide-react';
import { NODE_TEMPLATES, DEFAULT_TEMPLATES, CATEGORY_META, type NodeCategory, type NodeTemplate } from '../types/canvas';

interface Props {
  onAddNode: (template: NodeTemplate) => void;
  onLoadTemplate: (idx: number) => void;
}

export function NodesPanel({ onAddNode, onLoadTemplate }: Props) {
  const [expanded, setExpanded] = useState<NodeCategory | ''>('input');
  const [showTemplates, setShowTemplates] = useState(false);

  const categories = (Object.keys(CATEGORY_META) as NodeCategory[]);

  return (
    <div className="nodes-panel">
      <div className="np-section">
        <button className={`np-templates-toggle ${showTemplates ? 'active' : ''}`} onClick={() => setShowTemplates(v => !v)}>
          <LayoutTemplate size={14} />
          <span>Templates</span>
          <ChevronRight size={12} className={`chev ${showTemplates ? 'rotated' : ''}`} />
        </button>
        {showTemplates && (
          <div className="np-templates">
            {DEFAULT_TEMPLATES.map((t, i) => (
              <button key={i} className="np-template-btn" onClick={() => onLoadTemplate(i)}>
                <Sparkles size={12} />
                <div className="np-t-info">
                  <span className="np-t-name">{t.name}</span>
                  <span className="np-t-desc">{t.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="np-divider" />

      <h4 className="np-heading">Nodes</h4>
      {categories.map(cat => {
        const meta = CATEGORY_META[cat];
        const templates = NODE_TEMPLATES.filter(t => t.category === cat);
        const open = expanded === cat;
        return (
          <div key={cat} className="np-group">
            <button className={`np-group-header ${open ? 'open' : ''}`} onClick={() => setExpanded(open ? '' : cat)}>
              <span className="np-cat-dot" style={{ background: meta.color }} />
              <span>{meta.label}</span>
              <span className="np-count">{templates.length}</span>
              <ChevronRight size={11} className={`chev ${open ? 'rotated' : ''}`} />
            </button>
            {open && (
              <div className="np-nodes">
                {templates.map(t => (
                  <button key={t.type} className="np-node-btn" onClick={() => onAddNode(t)} draggable onDragStart={e => { e.dataTransfer.setData('nodeType', t.type); }}>
                    <GripVertical size={12} className="np-grip" />
                    <span className="np-node-name">{t.label}</span>
                    <div className="np-node-ports">
                      {t.ports.filter(p => p.dir === 'in').length > 0 && <span className="np-port-count in">{t.ports.filter(p => p.dir === 'in').length} in</span>}
                      {t.ports.filter(p => p.dir === 'out').length > 0 && <span className="np-port-count out">{t.ports.filter(p => p.dir === 'out').length} out</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
