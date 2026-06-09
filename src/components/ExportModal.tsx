import { useState } from 'react';
import { X, Download, Copy, Check, FileCode } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; selectedModel: string }

const colab = (m: string) => `# AI MultiModel Hub - Google Colab
# Model: ${m} | Uncensored & Unrestricted

!pip install -q transformers diffusers torch accelerate xformers

import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16, variant="fp16", use_safetensors=True
)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

image = pipe(
    prompt="Your prompt here",
    negative_prompt="low quality, blurry, distorted",
    num_inference_steps=30, guidance_scale=7.5, width=1024, height=1024
).images[0]

from IPython.display import display
display(image)
image.save("output.png")
`;

const kaggle = (m: string) => `# AI MultiModel Hub - Kaggle Notebook
# Model: ${m} | Uncensored & Unrestricted

import sys
!{sys.executable} -m pip install -q transformers diffusers torch accelerate xformers

import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16, variant="fp16", use_safetensors=True
)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

image = pipe(
    prompt="Your prompt here",
    negative_prompt="low quality, blurry, distorted",
    num_inference_steps=30, guidance_scale=7.5, width=1024, height=1024
).images[0]

import matplotlib.pyplot as plt
plt.figure(figsize=(12, 12)); plt.imshow(image); plt.axis("off"); plt.show()
image.save("/kaggle/working/output.png")
`;

const a1111 = () => `# Automatic1111 Stable Diffusion WebUI - Colab
# Based on ddPn08/automatic1111-colab | Uncensored & Unrestricted

%cd /content/
!git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
%cd /content/stable-diffusion-webui
!git checkout master

import os
data_dir = "/content/data"
for d in [f"{data_dir}/models/Stable-diffusion", f"{data_dir}/outputs"]:
    os.makedirs(d, exist_ok=True)

model_url = "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
!curl -LJ {model_url} -o {data_dir}/models/Stable-diffusion/sd_xl_base_1.0.safetensors

!rm -Rf stable-diffusion-webui/models/Stable-diffusion && ln -s {data_dir}/models/Stable-diffusion stable-diffusion-webui/models/Stable-diffusion
!rm -Rf stable-diffusion-webui/outputs && ln -s {data_dir}/outputs stable-diffusion-webui/outputs

os.environ["COMMANDLINE_ARGS"] = "--share --no-half-vae --xformers --gradio-queue"
!cd /content/stable-diffusion-webui && python launch.py
`;

export function ExportModal({ isOpen, onClose, selectedModel }: Props) {
  const [tab, setTab] = useState<'colab' | 'kaggle' | 'a1111'>('colab');
  const [copied, setCopied] = useState(false);

  const code = tab === 'colab' ? colab(selectedModel) : tab === 'kaggle' ? kaggle(selectedModel) : a1111();
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dl = () => {
    const b = new Blob([code], { type: 'text/plain' }), u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = `${selectedModel}_${tab}.py`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2><FileCode size={18} /> Export Code</h2><button className="modal-close" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="export-tabs">
            {(['colab', 'kaggle', 'a1111'] as const).map(t => (
              <button key={t} className={`export-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'colab' ? 'Google Colab' : t === 'kaggle' ? 'Kaggle' : 'Automatic1111'}
              </button>
            ))}
          </div>
          <div className="code-block"><pre>{code}</pre></div>
          <div className="export-actions">
            <button className="export-btn" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy Code'}</button>
            <button className="export-btn primary" onClick={dl}><Download size={14} />Download .py</button>
          </div>
        </div>
      </div>
    </div>
  );
}
