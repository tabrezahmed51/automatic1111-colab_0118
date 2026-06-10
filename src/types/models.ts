export type ThemeMode = 'day' | 'night';
export type ModelType = 'image' | 'text' | 'vision';
export type TabId = 'models' | 'settings' | 'export' | 'advanced';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  description: string;
  free: boolean;
  streaming?: boolean;
}

export interface GenerationResult {
  id: string;
  model: string;
  prompt: string;
  result: string;
  timestamp: Date;
  provider: string;
  type: ModelType;
}

export interface GenerationRequest {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  apiKey?: string;
}

export interface HistoryItem {
  id: string;
  model: string;
  prompt: string;
  result: string;
  type: ModelType;
  timestamp: Date;
  provider: string;
}

export interface APIKeys {
  huggingface: string;
  openrouter: string;
  qwen: string;
  flux: string;
  venice: string;
}

export const AI_MODELS: AIModel[] = [
  { id: 'qwen-vl-plus', name: 'Qwen VL Plus', provider: 'Qwen AI', type: 'vision', description: 'Multimodal vision-language model', free: true, streaming: true },
  { id: 'sdxl-base', name: 'SDXL Base 1.0', provider: 'Stability AI', type: 'image', description: 'Stable Diffusion XL high-quality generation', free: true },
  { id: 'sdxl-lora', name: 'SDXL + LoRa', provider: 'Stability AI', type: 'image', description: 'SDXL with LoRa fine-tuned adaptations', free: true },
  { id: 'pony-diffusion', name: 'Pony Diffusion V6 XL', provider: 'HuggingFace', type: 'image', description: 'Specialized diffusion model', free: true },
  { id: 'flux-pro', name: 'Flux Pro', provider: 'Black Forest Labs', type: 'image', description: 'Premium Flux professional generation', free: false },
  { id: 'flux-dev', name: 'Flux Dev', provider: 'Black Forest Labs', type: 'image', description: 'Flux development open-weight model', free: true },
  { id: 'flux-schnell', name: 'Flux Schnell', provider: 'Black Forest Labs', type: 'image', description: 'Fast Flux optimized for speed', free: true },
  { id: 'controlnet', name: 'ControlNet', provider: 'HuggingFace', type: 'image', description: 'Precise generation with conditioning', free: true },
  { id: 'codeformer', name: 'CodeFormer', provider: 'HuggingFace', type: 'image', description: 'Face restoration and enhancement', free: true },
  { id: 'inpaint', name: 'InPaint SDXL', provider: 'HuggingFace', type: 'image', description: 'Fill masked regions in images', free: true },
  { id: 'outpaint', name: 'OutPaint', provider: 'HuggingFace', type: 'image', description: 'Extend images beyond boundaries', free: true },
  { id: 'lustify', name: 'Lustify', provider: 'HuggingFace', type: 'image', description: 'Artistic style transfer model', free: true },
  { id: 'textaligner', name: 'TextAligner', provider: 'HuggingFace', type: 'text', description: 'Text alignment and typography', free: true },
  { id: 'openrouter-auto', name: 'OpenRouter Auto', provider: 'OpenRouter', type: 'text', description: 'Auto-route to best LLM', free: true, streaming: true },
  { id: 'venice-llama', name: 'Venice Llama 3.3 70B', provider: 'Venice AI', type: 'text', description: 'Uncensored Llama 3.3 70B', free: true, streaming: true },
];

export const HF_MODELS: Record<string, string> = {
  'sdxl-base': 'stabilityai/stable-diffusion-xl-base-1.0',
  'sdxl-lora': 'stabilityai/stable-diffusion-xl-base-1.0',
  'pony-diffusion': 'AstraliteHeart/pony-diffusion-v6-xl',
  'controlnet': 'lllyasviel/control_v11p_sd15_canny',
  'codeformer': 'sczhou/CodeFormer',
  'inpaint': 'diffusers/stable-diffusion-xl-1.0-inpainting-0.1',
  'outpaint': 'fantasy-studio/Paint-by-Example',
  'lustify': 'stabilityai/stable-diffusion-xl-base-1.0',
  'textaligner': 'stabilityai/stable-diffusion-xl-base-1.0',
};
