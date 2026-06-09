import { useState } from 'react';
import { Send, Loader, Wand2, Sliders, AlertCircle } from 'lucide-react';
import { AI_MODELS } from '../types/models';
import type { GenerationRequest } from '../types/models';

interface Props { selectedModel: string; onGenerate: (req: GenerationRequest) => Promise<void>; isGenerating: boolean; result: string | null; error: string | null }

export function GenerationPanel({ selectedModel, onGenerate, isGenerating, result, error }: Props) {
  const [prompt, setPrompt] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [showAdv, setShowAdv] = useState(false);

  const model = AI_MODELS.find(m => m.id === selectedModel);
  const isImg = model?.type === 'image';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ model: selectedModel, prompt, negativePrompt: isImg ? negPrompt : undefined, width: isImg ? width : undefined, height: isImg ? height : undefined, steps: isImg ? steps : undefined, guidance: isImg ? guidance : undefined });
  };

  return (
    <div className="gen-panel">
      <div className="gen-header">
        <div className="gen-title-row"><Wand2 size={22} className="gen-icon" /><h2>{model?.name ?? 'Select a Model'}</h2>{model && <span className="prov-badge">{model.provider}</span>}</div>
        <p className="gen-desc">{model?.description}</p>
        {isImg && <button className="adv-toggle" onClick={() => setShowAdv(v => !v)}><Sliders size={14} />{showAdv ? 'Hide' : 'Show'} Advanced</button>}
      </div>
      <form onSubmit={submit} className="gen-form">
        <div className="field"><label>Prompt</label><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={isImg ? 'Describe the image...' : 'Enter your text prompt...'} rows={4} disabled={isGenerating} /></div>
        {isImg && <div className="field"><label>Negative Prompt</label><textarea value={negPrompt} onChange={e => setNegPrompt(e.target.value)} placeholder="What to avoid..." rows={2} disabled={isGenerating} /></div>}
        {isImg && showAdv && (
          <div className="adv-grid">
            <div className="field"><label>Width: {width}px</label><input type="range" min={512} max={2048} step={64} value={width} onChange={e => setWidth(+e.target.value)} disabled={isGenerating} /></div>
            <div className="field"><label>Height: {height}px</label><input type="range" min={512} max={2048} step={64} value={height} onChange={e => setHeight(+e.target.value)} disabled={isGenerating} /></div>
            <div className="field"><label>Steps: {steps}</label><input type="range" min={10} max={100} step={1} value={steps} onChange={e => setSteps(+e.target.value)} disabled={isGenerating} /></div>
            <div className="field"><label>Guidance: {guidance}</label><input type="range" min={1} max={20} step={0.5} value={guidance} onChange={e => setGuidance(+e.target.value)} disabled={isGenerating} /></div>
          </div>
        )}
        <button type="submit" className="gen-btn" disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? <><Loader size={18} className="spin" /> Generating...</> : <><Send size={18} /> Generate</>}
        </button>
      </form>
      {error && <div className="result-box result-error"><AlertCircle size={16} /><span>{error}</span></div>}
      {result && !error && (
        <div className="result-box">
          {result.startsWith('blob:') || result.startsWith('http') ? <img src={result} alt="Generated" className="result-img" /> : <pre className="result-text">{result}</pre>}
        </div>
      )}
    </div>
  );
}
