import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { TopBar } from './components/TopBar';
import { CanvasArea } from './components/CanvasArea';
import { PromptBar } from './components/PromptBar';
import { HistoryPanel } from './components/HistoryPanel';
import { WorkflowModal } from './components/WorkflowModal';
import { dispatch } from './services/api';
import { AI_MODELS } from './types/models';
import type { GenerationRequest, APIKeys, HistoryItem } from './types/models';
import './App.css';

const EMPTY_KEYS: APIKeys = { huggingface: '', openrouter: '', qwen: '', flux: '', venice: '' };

function AppInner() {
  const [model, setModel] = useState('flux-schnell');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistId, setSelectedHistId] = useState<string | null>(null);
  const [negPrompt, setNegPrompt] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [keys, setKeys] = useState<APIKeys>(() => {
    const s = localStorage.getItem('aimh-keys');
    return s ? { ...EMPTY_KEYS, ...JSON.parse(s) } : EMPTY_KEYS;
  });

  useEffect(() => { localStorage.setItem('aimh-keys', JSON.stringify(keys)); }, [keys]);

  const m = AI_MODELS.find(x => x.id === model);
  const modelType = m?.type ?? 'image';

  const gen = useCallback(async (req: GenerationRequest) => {
    setBusy(true); setResult(null); setError(null); setSelectedHistId(null);
    try {
      const r = await dispatch({ ...req, negativePrompt: req.negativePrompt || negPrompt || undefined, width, height, steps, guidance }, keys);
      setResult(r.result);
      setHistory(h => [{ id: r.id, model: req.model, prompt: req.prompt, result: r.result, type: modelType, timestamp: new Date(), provider: r.provider }, ...h].slice(0, 50));
    } catch (e: any) { setError(e.message || 'Generation failed'); }
    finally { setBusy(false); }
  }, [keys, negPrompt, width, height, steps, guidance, modelType]);

  const selectHistItem = (item: HistoryItem) => {
    setSelectedHistId(item.id);
    setResult(item.result);
    setError(null);
  };

  return (
    <div className="app">
      <TopBar model={model} onOpenWorkflow={() => setShowWorkflow(true)} onToggleHistory={() => setShowHistory(v => !v)} showHistory={showHistory} />
      <div className="app-body">
        <CanvasArea result={result} error={error} isGenerating={busy} modelType={modelType} selectedItem={selectedHistId ? history.find(h => h.id === selectedHistId) ?? null : null} />
        <HistoryPanel items={history} isOpen={showHistory} onClose={() => setShowHistory(false)} onSelect={selectHistItem} onClear={() => setHistory([])} selectedId={selectedHistId} />
      </div>
      <PromptBar model={model} onGenerate={gen} isGenerating={busy} onOpenWorkflow={() => setShowWorkflow(true)} />
      <WorkflowModal
        isOpen={showWorkflow} onClose={() => setShowWorkflow(false)}
        model={model} onSelectModel={setModel}
        apiKeys={keys} onSaveKeys={setKeys}
        negPrompt={negPrompt} onSetNegPrompt={setNegPrompt}
        width={width} onSetWidth={setWidth}
        height={height} onSetHeight={setHeight}
        steps={steps} onSetSteps={setSteps}
        guidance={guidance} onSetGuidance={setGuidance}
      />
    </div>
  );
}

export default function App() {
  return <ThemeProvider><AppInner /></ThemeProvider>;
}
