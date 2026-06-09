import axios from 'axios';
import type { GenerationRequest, GenerationResult, APIKeys } from '../types/models';
import { HF_MODELS } from '../types/models';

let _id = 0;
const uid = () => `g-${Date.now()}-${++_id}`;

export async function callHuggingFace(req: GenerationRequest, slug: string): Promise<GenerationResult> {
  if (!req.apiKey) throw new Error('HuggingFace API key required');
  const isImg = slug.includes('diffusion') || slug.includes('stable') || slug.includes('pony') || slug.includes('Paint') || slug.includes('CodeFormer');
  if (isImg) {
    const { data } = await axios.post(`https://api-inference.huggingface.co/models/${slug}`, {
      inputs: req.prompt,
      parameters: { negative_prompt: req.negativePrompt || undefined, num_inference_steps: req.steps || 30, guidance_scale: req.guidance || 7.5, width: req.width || 1024, height: req.height || 1024 }
    }, { headers: { Authorization: `Bearer ${req.apiKey}`, 'Content-Type': 'application/json' }, responseType: 'blob' });
    return { id: uid(), model: req.model, prompt: req.prompt, result: URL.createObjectURL(data), timestamp: new Date(), provider: 'HuggingFace', type: 'image' };
  }
  const { data } = await axios.post(`https://api-inference.huggingface.co/models/${slug}`, { inputs: req.prompt }, { headers: { Authorization: `Bearer ${req.apiKey}`, 'Content-Type': 'application/json' } });
  const text = Array.isArray(data) ? data[0]?.generated_text ?? String(data) : String(data);
  return { id: uid(), model: req.model, prompt: req.prompt, result: text, timestamp: new Date(), provider: 'HuggingFace', type: 'text' };
}

export async function callOpenRouter(req: GenerationRequest): Promise<GenerationResult> {
  if (!req.apiKey) throw new Error('OpenRouter API key required');
  const { data } = await axios.post('https://openrouter.ai/api/v1/chat/completions', { model: 'openrouter/auto', messages: [{ role: 'user', content: req.prompt }] }, { headers: { Authorization: `Bearer ${req.apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.origin, 'X-Title': 'AI MultiModel Hub' } });
  return { id: uid(), model: req.model, prompt: req.prompt, result: data?.choices?.[0]?.message?.content ?? 'No response', timestamp: new Date(), provider: 'OpenRouter', type: 'text' };
}

export async function callQwen(req: GenerationRequest): Promise<GenerationResult> {
  if (!req.apiKey) throw new Error('Qwen API key required');
  const { data } = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', { model: 'qwen-vl-plus', input: { messages: [{ role: 'user', content: [{ text: req.prompt }] }] } }, { headers: { Authorization: `Bearer ${req.apiKey}`, 'Content-Type': 'application/json' } });
  return { id: uid(), model: req.model, prompt: req.prompt, result: data?.output?.choices?.[0]?.message?.content?.[0]?.text ?? 'No response', timestamp: new Date(), provider: 'Qwen AI', type: 'vision' };
}

export async function callFlux(req: GenerationRequest): Promise<GenerationResult> {
  if (!req.apiKey) throw new Error('Flux API key required');
  const path = req.model === 'flux-pro' ? 'flux-pro' : req.model === 'flux-dev' ? 'flux-dev' : 'flux-schnell';
  const { data } = await axios.post(`https://api.bfl.ml/v1/${path}`, { prompt: req.prompt, width: req.width || 1024, height: req.height || 1024, steps: req.steps || (path === 'flux-schnell' ? 4 : 50), guidance: req.guidance || 3.5, seed: req.seed }, { headers: { 'x-key': req.apiKey, 'Content-Type': 'application/json' } });
  return { id: uid(), model: req.model, prompt: req.prompt, result: data?.result?.sample ?? data?.image ?? data?.url ?? 'Check Flux dashboard', timestamp: new Date(), provider: 'Black Forest Labs', type: 'image' };
}

export async function callVenice(req: GenerationRequest): Promise<GenerationResult> {
  if (!req.apiKey) throw new Error('Venice AI API key required');
  const { data } = await axios.post('https://api.venice.ai/api/v1/chat/completions', { model: 'llama-3.3-70b', messages: [{ role: 'user', content: req.prompt }], temperature: 0.7 }, { headers: { Authorization: `Bearer ${req.apiKey}`, 'Content-Type': 'application/json' } });
  return { id: uid(), model: req.model, prompt: req.prompt, result: data?.choices?.[0]?.message?.content ?? 'No response', timestamp: new Date(), provider: 'Venice AI', type: 'text' };
}

export async function dispatch(req: GenerationRequest, keys: APIKeys): Promise<GenerationResult> {
  const m = req.model;
  if (m === 'qwen-vl-plus') return callQwen({ ...req, apiKey: keys.qwen });
  if (m.startsWith('flux-')) return callFlux({ ...req, apiKey: keys.flux });
  if (m === 'openrouter-auto') return callOpenRouter({ ...req, apiKey: keys.openrouter });
  if (m === 'venice-llama') return callVenice({ ...req, apiKey: keys.venice });
  const slug = HF_MODELS[m];
  if (slug) return callHuggingFace({ ...req, apiKey: keys.huggingface }, slug);
  throw new Error(`Unknown model: ${m}`);
}
