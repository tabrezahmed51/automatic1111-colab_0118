import { useState } from 'react';
import { Send, Loader, ChevronUp } from 'lucide-react';
import { AI_MODELS } from '../types/models';
import type { GenerationRequest } from '../types/models';

interface Props {
  model: string;
  onGenerate: (req: GenerationRequest) => Promise<void>;
  isGenerating: boolean;
  onOpenWorkflow: () => void;
}

export function PromptBar({ model, onGenerate, isGenerating, onOpenWorkflow }: Props) {
  const [prompt, setPrompt] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [showNeg, setShowNeg] = useState(false);

  const m = AI_MODELS.find(x => x.id === model);
  const isImg = m?.type === 'image';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({
      model,
      prompt,
      negativePrompt: isImg && negPrompt ? negPrompt : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      submit(e);
    }
  };

  return (
    <div className="prompt-bar">
      <div className="prompt-model-indicator">
        <span className="pm-dot" />
        <span className="pm-name">{m?.name ?? 'Select Model'}</span>
        {m?.free && <span className="pm-free">FREE</span>}
      </div>

      <form onSubmit={submit} className="prompt-form">
        <div className="prompt-input-wrap">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to generate..."
            rows={1}
            disabled={isGenerating}
            className="prompt-input"
          />
          <button type="submit" className="prompt-send" disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>

        {isImg && (
          <div className="prompt-neg-row">
            <button type="button" className="neg-toggle" onClick={() => setShowNeg(v => !v)}>
              <ChevronUp size={12} className={`neg-chev ${showNeg ? 'open' : ''}`} />
              Negative Prompt
            </button>
            {showNeg && (
              <input
                type="text"
                value={negPrompt}
                onChange={e => setNegPrompt(e.target.value)}
                placeholder="What to avoid..."
                className="neg-input"
                disabled={isGenerating}
              />
            )}
          </div>
        )}
      </form>

      <div className="prompt-footer">
        <button className="pf-link" onClick={onOpenWorkflow}>Models & Settings</button>
        <span className="pf-hint">Ctrl+Enter to generate</span>
      </div>
    </div>
  );
}
