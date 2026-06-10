import { useState } from 'react';
import { X, Image, MessageSquare, Eye, Sparkles, Settings, Download, Key, Save, CircleAlert as AlertCircle, Eye as EyeOn, EyeOff, Copy, Check, FileCode, ChevronRight, FileSliders as Sliders } from 'lucide-react';
import { AI_MODELS, type APIKeys, type ModelType, type TabId } from '../types/models';

/* ================================================================== */
/*  WorkflowModal - unified modal for Models, Settings, Export, Advanced  */
/* ================================================================== */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  onSelectModel: (id: string) => void;
  apiKeys: APIKeys;
  onSaveKeys: (k: APIKeys) => void;
  negPrompt: string;
  onSetNegPrompt: (v: string) => void;
  width: number; onSetWidth: (v: number) => void;
  height: number; onSetHeight: (v: number) => void;
  steps: number; onSetSteps: (v: number) => void;
  guidance: number; onSetGuidance: (v: number) => void;
}

const TYPE_META: Record<ModelType, { label: string; Icon: typeof Image }> = {
  image: { label: 'Image Generation', Icon: Image },
  text: { label: 'Text Models', Icon: MessageSquare },
  vision: { label: 'Vision Models', Icon: Eye },
};

const KEY_FIELDS: { key: keyof APIKeys; label: string; hint: string; ph: string; url: string; link: string }[] = [
  { key: 'huggingface', label: 'HuggingFace', hint: 'SDXL, LoRa, Pony, InPaint, ControlNet, CodeFormer, Lustify', ph: 'hf_...', url: 'https://huggingface.co/settings/tokens', link: 'Get key' },
  { key: 'openrouter', label: 'OpenRouter', hint: 'Multiple LLMs through one API', ph: 'sk-or-...', url: 'https://openrouter.ai/keys', link: 'Get key' },
  { key: 'qwen', label: 'Qwen', hint: 'Qwen Vision multimodal', ph: 'sk-...', url: 'https://dashscope.console.aliyun.com/apiKey', link: 'Get key' },
  { key: 'flux', label: 'Flux (BFL)', hint: 'Flux Pro/Dev/Schnell', ph: '...', url: 'https://api.bfl.ml', link: 'Get key' },
  { key: 'venice', label: 'Venice AI', hint: 'Uncensored Llama 3.3 70B', ph: '...', url: 'https://venice.ai/api', link: 'Get key' },
];

const EXPORT_TABS = [
  { id: 'colab' as const, label: 'Google Colab' },
  { id: 'kaggle' as const, label: 'Kaggle' },
  { id: 'a1111' as const, label: 'Automatic1111' },
];

function colabCode(m: string) {
  return `# AI MultiModel Hub - Google Colab\n# Model: ${m} | Uncensored & Unrestricted\n\n!pip install -q transformers diffusers torch accelerate xformers\n\nimport torch\nfrom diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler\n\npipe = StableDiffusionXLPipeline.from_pretrained(\n    "stabilityai/stable-diffusion-xl-base-1.0",\n    torch_dtype=torch.float16, variant="fp16", use_safetensors=True\n)\npipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)\npipe.to("cuda")\n\nimage = pipe(\n    prompt="Your prompt here",\n    negative_prompt="low quality, blurry, distorted",\n    num_inference_steps=30, guidance_scale=7.5, width=1024, height=1024\n).images[0]\n\nfrom IPython.display import display\ndisplay(image)\nimage.save("output.png")`;
}

function kaggleCode(m: string) {
  return `# AI MultiModel Hub - Kaggle Notebook\n# Model: ${m} | Uncensored & Unrestricted\n\nimport sys\n!{sys.executable} -m pip install -q transformers diffusers torch accelerate xformers\n\nimport torch\nfrom diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler\n\npipe = StableDiffusionXLPipeline.from_pretrained(\n    "stabilityai/stable-diffusion-xl-base-1.0",\n    torch_dtype=torch.float16, variant="fp16", use_safetensors=True\n)\npipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)\npipe.to("cuda")\n\nimage = pipe(\n    prompt="Your prompt here",\n    negative_prompt="low quality, blurry, distorted",\n    num_inference_steps=30, guidance_scale=7.5, width=1024, height=1024\n).images[0]\n\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(12, 12)); plt.imshow(image); plt.axis("off"); plt.show()\nimage.save("/kaggle/working/output.png")`;
}

function a1111Code() {
  return `# Automatic1111 Stable Diffusion WebUI - Colab\n# Based on ddPn08/automatic1111-colab | Uncensored & Unrestricted\n\n%cd /content/\n!git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui\n%cd /content/stable-diffusion-webui\n!git checkout master\n\nimport os\ndata_dir = "/content/data"\nfor d in [f"{data_dir}/models/Stable-diffusion", f"{data_dir}/outputs"]:\n    os.makedirs(d, exist_ok=True)\n\nmodel_url = "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"\n!curl -LJ {model_url} -o {data_dir}/models/Stable-diffusion/sd_xl_base_1.0.safetensors\n\n!rm -Rf stable-diffusion-webui/models/Stable-diffusion && ln -s {data_dir}/models/Stable-diffusion stable-diffusion-webui/models/Stable-diffusion\n!rm -Rf stable-diffusion-webui/outputs && ln -s {data_dir}/outputs stable-diffusion-webui/outputs\n\nos.environ["COMMANDLINE_ARGS"] = "--share --no-half-vae --xformers --gradio-queue"\n!cd /content/stable-diffusion-webui && python launch.py`;
}

export function WorkflowModal({
  isOpen, onClose, model, onSelectModel, apiKeys, onSaveKeys,
  negPrompt, onSetNegPrompt, width, onSetWidth, height, onSetHeight,
  steps, onSetSteps, guidance, onSetGuidance
}: Props) {
  const [tab, setTab] = useState<TabId>('models');
  const [keys, setKeys] = useState<APIKeys>(apiKeys);
  const [vis, setVis] = useState<Record<string, boolean>>({});
  const [expType, setExpType] = useState<ModelType>('image');
  const [expTab, setExpTab] = useState<'colab' | 'kaggle' | 'a1111'>('colab');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const m = AI_MODELS.find(x => x.id === model);
  const isImg = m?.type === 'image';

  const saveKeys = (e: React.FormEvent) => { e.preventDefault(); onSaveKeys(keys); };
  const copyCode = async () => { await navigator.clipboard.writeText(getCode()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dlCode = () => {
    const b = new Blob([getCode()], { type: 'text/plain' }), u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = `${model}_${expTab}.py`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
  };
  const getCode = () => expTab === 'colab' ? colabCode(model) : expTab === 'kaggle' ? kaggleCode(model) : a1111Code();

  const TABS: { id: TabId; label: string; Icon: typeof Settings }[] = [
    { id: 'models', label: 'Models', Icon: Sparkles },
    { id: 'advanced', label: 'Advanced', Icon: Sliders },
    { id: 'settings', label: 'API Keys', Icon: Key },
    { id: 'export', label: 'Export', Icon: Download },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="workflow-modal" onClick={e => e.stopPropagation()}>
        <div className="wm-head">
          <h2><FileCode size={18} /> Workflow</h2>
          <button className="wm-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="wm-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`wm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <t.Icon size={14} />{t.label}
            </button>
          ))}
        </div>

        <div className="wm-body">
          {/* ---- MODELS TAB ---- */}
          {tab === 'models' && (
            <div className="wm-section">
              <div className="wm-current">
                <span className="wm-current-label">Active Model</span>
                <span className="wm-current-name">{m?.name}</span>
                <span className="wm-current-prov">{m?.provider}</span>
                {m?.free && <span className="tag tag-free">FREE</span>}
              </div>
              {(Object.keys(TYPE_META) as ModelType[]).map(t => {
                const { label, Icon } = TYPE_META[t];
                const models = AI_MODELS.filter(x => x.type === t);
                const open = expType === t;
                return (
                  <div key={t} className="wm-group">
                    <button className={`wm-group-header ${open ? 'open' : ''}`} onClick={() => setExpType(open ? '' as ModelType : t)}>
                      <Icon size={15} /><span>{label}</span><span className="group-count">{models.length}</span>
                      <ChevronRight size={13} className={`chev ${open ? 'rotated' : ''}`} />
                    </button>
                    {open && (
                      <div className="wm-model-list">
                        {models.map(x => (
                          <button key={x.id} className={`wm-model-btn ${model === x.id ? 'active' : ''}`} onClick={() => { onSelectModel(x.id); }}>
                            <div className="wm-mb-info"><span className="wm-mb-name">{x.name}</span><span className="wm-mb-prov">{x.provider}</span></div>
                            <div className="wm-mb-tags">
                              {x.free && <span className="tag tag-free">FREE</span>}
                              {x.streaming && <span className="tag tag-stream">STREAM</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- ADVANCED TAB ---- */}
          {tab === 'advanced' && (
            <div className="wm-section">
              <div className="wm-field">
                <label>Negative Prompt</label>
                <input type="text" value={negPrompt} onChange={e => onSetNegPrompt(e.target.value)} placeholder="What to avoid..." className="wm-input" />
              </div>
              {isImg && (
                <>
                  <div className="wm-field"><label>Width: {width}px</label><input type="range" min={512} max={2048} step={64} value={width} onChange={e => onSetWidth(+e.target.value)} className="wm-range" /></div>
                  <div className="wm-field"><label>Height: {height}px</label><input type="range" min={512} max={2048} step={64} value={height} onChange={e => onSetHeight(+e.target.value)} className="wm-range" /></div>
                  <div className="wm-field"><label>Steps: {steps}</label><input type="range" min={10} max={100} step={1} value={steps} onChange={e => onSetSteps(+e.target.value)} className="wm-range" /></div>
                  <div className="wm-field"><label>Guidance: {guidance}</label><input type="range" min={1} max={20} step={0.5} value={guidance} onChange={e => onSetGuidance(+e.target.value)} className="wm-range" /></div>
                </>
              )}
              {!isImg && <p className="wm-note">Advanced image parameters available when an image model is selected.</p>}
            </div>
          )}

          {/* ---- API KEYS TAB ---- */}
          {tab === 'settings' && (
            <div className="wm-section">
              <div className="info-banner"><AlertCircle size={14} /><span>Keys stored locally in your browser. Never sent to any server.</span></div>
              <form onSubmit={saveKeys} className="wm-keys-form">
                {KEY_FIELDS.map(f => (
                  <div className="wm-field" key={f.key}>
                    <label>{f.label}<span className="wm-hint">{f.hint}</span></label>
                    <div className="wm-key-row">
                      <input type={vis[f.key] ? 'text' : 'password'} value={keys[f.key]} onChange={e => setKeys({ ...keys, [f.key]: e.target.value })} placeholder={f.ph} className="wm-input" />
                      <button type="button" className="wm-vis-btn" onClick={() => setVis(v => ({ ...v, [f.key]: !v[f.key] }))}>
                        {vis[f.key] ? <EyeOff size={14} /> : <EyeOn size={14} />}
                      </button>
                    </div>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="helper-link">{f.link} &rarr;</a>
                  </div>
                ))}
                <button type="submit" className="wm-save-btn"><Save size={14} /> Save Keys</button>
              </form>
            </div>
          )}

          {/* ---- EXPORT TAB ---- */}
          {tab === 'export' && (
            <div className="wm-section">
              <div className="export-tabs">
                {EXPORT_TABS.map(t => (
                  <button key={t.id} className={`export-tab ${expTab === t.id ? 'active' : ''}`} onClick={() => setExpTab(t.id)}>{t.label}</button>
                ))}
              </div>
              <div className="code-block"><pre>{getCode()}</pre></div>
              <div className="export-actions">
                <button className="export-btn" onClick={copyCode}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy Code'}</button>
                <button className="export-btn primary" onClick={dlCode}><Download size={14} />Download .py</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
