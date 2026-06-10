import { Image, MessageSquare, Eye, Loader, Sparkles } from 'lucide-react';
import type { ModelType, HistoryItem } from '../types/models';

interface Props {
  result: string | null;
  error: string | null;
  isGenerating: boolean;
  modelType: ModelType;
  selectedItem: HistoryItem | null;
}

const TYPE_ICONS: Record<ModelType, typeof Image> = { image: Image, text: MessageSquare, vision: Eye };

export function CanvasArea({ result, error, isGenerating, modelType, selectedItem }: Props) {
  const displayResult = selectedItem?.result ?? result;
  const displayType = selectedItem?.type ?? modelType;
  const Icon = TYPE_ICONS[displayType] ?? Image;

  return (
    <div className="canvas">
      {isGenerating && (
        <div className="canvas-generating">
          <div className="gen-ring"><Loader size={40} className="spin" /></div>
          <span className="gen-label">Generating with AI...</span>
          <div className="gen-particles">
            {[...Array(6)].map((_, i) => <div key={i} className="particle" style={{ animationDelay: `${i * 0.3}s` }} />)}
          </div>
        </div>
      )}

      {error && !isGenerating && (
        <div className="canvas-error">
          <div className="error-icon">!</div>
          <p>{error}</p>
        </div>
      )}

      {!isGenerating && !error && displayResult && (
        <div className="canvas-result">
          {displayResult.startsWith('blob:') || displayResult.startsWith('http') ? (
            <img src={displayResult} alt="Generated" className="canvas-image" />
          ) : (
            <div className="canvas-text-result">
              <Icon size={18} className="text-icon" />
              <pre>{displayResult}</pre>
            </div>
          )}
        </div>
      )}

      {!isGenerating && !error && !displayResult && (
        <div className="canvas-empty">
          <div className="empty-icon-wrap"><Sparkles size={48} /></div>
          <h2>Ready to Create</h2>
          <p>Type a prompt below and hit Generate.<br />Open Workflow to pick models & configure APIs.</p>
          <div className="empty-hints">
            <span className="hint-chip">Image Generation</span>
            <span className="hint-chip">Text Chat</span>
            <span className="hint-chip">Vision Analysis</span>
          </div>
        </div>
      )}
    </div>
  );
}
