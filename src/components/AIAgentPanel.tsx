import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Bot, Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import { sendAgentMessage, parseWorkflowFromResponse } from '../services/agent';
import type { AgentMessage } from '../types/canvas';
import type { APIKeys } from '../types/models';

interface Props {
  messages: AgentMessage[];
  onAddMessages: (user: AgentMessage, assistant: AgentMessage) => void;
  onApplyWorkflow: (nodes: any[], connections: any[]) => void;
  apiKeys: APIKeys;
}

export function AIAgentPanel({ messages, onAddMessages, onApplyWorkflow, apiKeys }: Props) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamText]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg: AgentMessage = { id: `u-${Date.now()}`, role: 'user', content: input, timestamp: new Date() };
    setInput(''); setBusy(true); setError(null); setStreamText('');

    try {
      const assistantMsg = await sendAgentMessage(messages, input, apiKeys, setStreamText);
      onAddMessages(userMsg, assistantMsg);

      // Check if response contains a workflow
      const workflow = parseWorkflowFromResponse(assistantMsg.content);
      if (workflow) {
        onApplyWorkflow(workflow.nodes, workflow.connections);
      }
    } catch (e: any) {
      setError(e.message || 'Agent failed');
    } finally {
      setBusy(false); setStreamText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="ai-agent-panel">
      <div className="aap-head">
        <Bot size={16} className="aap-icon" />
        <span className="aap-title">AI Agent</span>
        <span className="aap-badge">UNCENSORED</span>
      </div>

      <div className="aap-messages" ref={scrollRef}>
        {messages.length === 0 && !busy && (
          <div className="aap-empty">
            <Sparkles size={24} />
            <p>I can help you build workflows. Tell me what you want to create.</p>
            <div className="aap-suggestions">
              <button onClick={() => setInput('Create a text-to-image pipeline with SDXL')}>Text to Image</button>
              <button onClick={() => setInput('Build an image upscale workflow')}>Upscale Pipeline</button>
              <button onClick={() => setInput('Make an LLM chat workflow with Venice AI')}>LLM Chat</button>
              <button onClick={() => setInput('Create an inpainting workflow with mask support')}>InPaint</button>
            </div>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`aap-msg ${m.role}`}>
            {m.role === 'assistant' && <Bot size={14} className="aap-msg-icon" />}
            <div className="aap-msg-content">{m.content}</div>
          </div>
        ))}
        {busy && streamText && (
          <div className="aap-msg assistant streaming">
            <Bot size={14} className="aap-msg-icon" />
            <div className="aap-msg-content">{streamText}</div>
          </div>
        )}
        {busy && !streamText && (
          <div className="aap-msg assistant">
            <Bot size={14} className="aap-msg-icon" />
            <div className="aap-msg-content aap-thinking"><Loader size={14} className="spin" /> Thinking...</div>
          </div>
        )}
        {error && <div className="aap-error"><AlertCircle size={12} />{error}</div>}
      </div>

      <div className="aap-input-area">
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your workflow or ask anything..." rows={2} disabled={busy} className="aap-input" />
        <button className="aap-send" onClick={send} disabled={busy || !input.trim()}>
          {busy ? <Loader size={16} className="spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
