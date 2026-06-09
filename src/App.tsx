import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GenerationPanel } from './components/GenerationPanel';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { dispatch } from './services/api';
import type { GenerationRequest, APIKeys } from './types/models';
import './App.css';

const EMPTY_KEYS: APIKeys = { huggingface: '', openrouter: '', qwen: '', flux: '', venice: '' };

function AppInner() {
  const [model, setModel] = useState('flux-schnell');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [keys, setKeys] = useState<APIKeys>(() => {
    const s = localStorage.getItem('aimh-keys');
    return s ? { ...EMPTY_KEYS, ...JSON.parse(s) } : EMPTY_KEYS;
  });

  useEffect(() => { localStorage.setItem('aimh-keys', JSON.stringify(keys)); }, [keys]);

  const gen = async (req: GenerationRequest) => {
    setBusy(true); setResult(null); setError(null);
    try { const r = await dispatch(req, keys); setResult(r.result); }
    catch (e: any) { setError(e.message || 'Generation failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="app">
      <Header />
      <div className="layout">
        <Sidebar selected={model} onSelect={setModel} onOpenSettings={() => setShowSettings(true)} onOpenExport={() => setShowExport(true)} />
        <main className="main">
          <GenerationPanel selectedModel={model} onGenerate={gen} isGenerating={busy} result={result} error={error} />
        </main>
      </div>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={setKeys} current={keys} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} selectedModel={model} />
    </div>
  );
}

export default function App() {
  return <ThemeProvider><AppInner /></ThemeProvider>;
}
