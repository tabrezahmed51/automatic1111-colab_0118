import { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { APIKeys } from '../types/models';

interface Props { isOpen: boolean; onClose: () => void; onSave: (k: APIKeys) => void; current: APIKeys }

const FIELDS: { key: keyof APIKeys; label: string; hint: string; ph: string; url: string; link: string }[] = [
  { key: 'huggingface', label: 'HuggingFace API Key', hint: 'SDXL, LoRa, Pony, InPaint, OutPaint, ControlNet, CodeFormer, Lustify', ph: 'hf_...', url: 'https://huggingface.co/settings/tokens', link: 'Get HuggingFace key' },
  { key: 'openrouter', label: 'OpenRouter API Key', hint: 'Multiple LLMs through one API', ph: 'sk-or-...', url: 'https://openrouter.ai/keys', link: 'Get OpenRouter key' },
  { key: 'qwen', label: 'Qwen API Key', hint: 'Qwen Vision multimodal models', ph: 'sk-...', url: 'https://dashscope.console.aliyun.com/apiKey', link: 'Get Qwen key' },
  { key: 'flux', label: 'Flux API Key (Black Forest Labs)', hint: 'Flux Pro, Flux Dev, Flux Schnell', ph: '...', url: 'https://api.bfl.ml', link: 'Get Flux key' },
  { key: 'venice', label: 'Venice AI API Key', hint: 'Uncensored Llama 3.3 70B', ph: '...', url: 'https://venice.ai/api', link: 'Get Venice key' },
];

export function SettingsModal({ isOpen, onClose, onSave, current }: Props) {
  const [keys, setKeys] = useState<APIKeys>(current);
  const [vis, setVis] = useState<Record<string, boolean>>({});
  useEffect(() => { setKeys(current); }, [current, isOpen]);
  const save = (e: React.FormEvent) => { e.preventDefault(); onSave(keys); onClose(); };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2><Key size={18} /> API Configuration</h2><button className="modal-close" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="info-banner"><AlertCircle size={14} /><span>API keys are stored locally. They never leave your browser.</span></div>
          <form onSubmit={save} className="settings-form">
            {FIELDS.map(f => (
              <div className="field" key={f.key}>
                <label>{f.label}<span className="hint">{f.hint}</span></label>
                <div className="key-row">
                  <input type={vis[f.key] ? 'text' : 'password'} value={keys[f.key]} onChange={e => setKeys({ ...keys, [f.key]: e.target.value })} placeholder={f.ph} />
                  <button type="button" className="vis-btn" onClick={() => setVis(v => ({ ...v, [f.key]: !v[f.key] }))}>{vis[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="helper-link">{f.link} &rarr;</a>
              </div>
            ))}
            <button type="submit" className="save-btn"><Save size={14} /> Save Configuration</button>
          </form>
        </div>
      </div>
    </div>
  );
}
