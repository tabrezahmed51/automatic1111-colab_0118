export type NodeCategory = 'input' | 'processing' | 'generation' | 'output' | 'logic' | 'model';
export type PortType = 'image' | 'text' | 'any' | 'condition' | 'model' | 'latent';
export type PortDir = 'in' | 'out';

export interface Port {
  id: string;
  label: string;
  type: PortType;
  dir: PortDir;
}

export interface CanvasNode {
  id: string;
  type: string;
  label: string;
  category: NodeCategory;
  x: number;
  y: number;
  ports: Port[];
  data: Record<string, any>;
  width: number;
}

export interface Connection {
  id: string;
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: CanvasNode[];
  connections: Connection[];
  createdAt: Date;
}

export interface NodeTemplate {
  type: string;
  label: string;
  category: NodeCategory;
  ports: Port[];
  defaultData: Record<string, any>;
  width: number;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const PORT_COLORS: Record<PortType, string> = {
  image: '#00ff88',
  text: '#00ccff',
  any: '#ffaa00',
  condition: '#ff6688',
  model: '#aa88ff',
  latent: '#88ddff',
};

let _nid = 0;
export const uid = () => `n-${Date.now()}-${++_nid}`;

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'text-prompt', label: 'Text Prompt', category: 'input',
    ports: [{ id: 'out', label: 'Prompt', type: 'text', dir: 'out' }],
    defaultData: { prompt: '' }, width: 200,
  },
  {
    type: 'neg-prompt', label: 'Negative Prompt', category: 'input',
    ports: [{ id: 'out', label: 'Neg', type: 'text', dir: 'out' }],
    defaultData: { prompt: 'low quality, blurry, distorted' }, width: 200,
  },
  {
    type: 'load-image', label: 'Load Image', category: 'input',
    ports: [{ id: 'out', label: 'Image', type: 'image', dir: 'out' }],
    defaultData: { url: '' }, width: 200,
  },
  {
    type: 'load-model', label: 'Load Model', category: 'model',
    ports: [
      { id: 'out-model', label: 'Model', type: 'model', dir: 'out' },
      { id: 'out-clip', label: 'CLIP', type: 'model', dir: 'out' },
      { id: 'out-vae', label: 'VAE', type: 'model', dir: 'out' },
    ],
    defaultData: { modelId: 'sdxl-base' }, width: 200,
  },
  {
    type: 'sampler', label: 'KSampler', category: 'generation',
    ports: [
      { id: 'in-model', label: 'Model', type: 'model', dir: 'in' },
      { id: 'in-pos', label: 'Positive', type: 'condition', dir: 'in' },
      { id: 'in-neg', label: 'Negative', type: 'condition', dir: 'in' },
      { id: 'in-latent', label: 'Latent', type: 'latent', dir: 'in' },
      { id: 'out', label: 'Latent', type: 'latent', dir: 'out' },
    ],
    defaultData: { steps: 30, cfg: 7.5, sampler: 'euler_ancestral', scheduler: 'normal', seed: -1 }, width: 220,
  },
  {
    type: 'clip-encode', label: 'CLIP Text Encode', category: 'processing',
    ports: [
      { id: 'in-clip', label: 'CLIP', type: 'model', dir: 'in' },
      { id: 'in-text', label: 'Text', type: 'text', dir: 'in' },
      { id: 'out', label: 'Conditioning', type: 'condition', dir: 'out' },
    ],
    defaultData: {}, width: 200,
  },
  {
    type: 'vae-decode', label: 'VAE Decode', category: 'processing',
    ports: [
      { id: 'in-latent', label: 'Latent', type: 'latent', dir: 'in' },
      { id: 'in-vae', label: 'VAE', type: 'model', dir: 'in' },
      { id: 'out', label: 'Image', type: 'image', dir: 'out' },
    ],
    defaultData: {}, width: 200,
  },
  {
    type: 'save-image', label: 'Save Image', category: 'output',
    ports: [{ id: 'in', label: 'Image', type: 'image', dir: 'in' }],
    defaultData: { filename: 'output' }, width: 200,
  },
  {
    type: 'preview', label: 'Preview', category: 'output',
    ports: [{ id: 'in', label: 'Image', type: 'image', dir: 'in' }],
    defaultData: {}, width: 180,
  },
  {
    type: 'upscale', label: 'Upscale (RealESRGAN)', category: 'processing',
    ports: [
      { id: 'in', label: 'Image', type: 'image', dir: 'in' },
      { id: 'out', label: 'Image', type: 'image', dir: 'out' },
    ],
    defaultData: { scale: 2 }, width: 200,
  },
  {
    type: 'controlnet-apply', label: 'ControlNet Apply', category: 'processing',
    ports: [
      { id: 'in-cond', label: 'Conditioning', type: 'condition', dir: 'in' },
      { id: 'in-image', label: 'Image', type: 'image', dir: 'in' },
      { id: 'out', label: 'Conditioning', type: 'condition', dir: 'out' },
    ],
    defaultData: { strength: 1.0 }, width: 200,
  },
  {
    type: 'inpaint', label: 'InPaint', category: 'processing',
    ports: [
      { id: 'in-image', label: 'Image', type: 'image', dir: 'in' },
      { id: 'in-mask', label: 'Mask', type: 'image', dir: 'in' },
      { id: 'out', label: 'Image', type: 'image', dir: 'out' },
    ],
    defaultData: {}, width: 200,
  },
  {
    type: 'if-branch', label: 'IF Branch', category: 'logic',
    ports: [
      { id: 'in', label: 'Input', type: 'any', dir: 'in' },
      { id: 'out-true', label: 'True', type: 'any', dir: 'out' },
      { id: 'out-false', label: 'False', type: 'any', dir: 'out' },
    ],
    defaultData: { condition: '' }, width: 180,
  },
  {
    type: 'llm-chat', label: 'LLM Chat', category: 'generation',
    ports: [
      { id: 'in-text', label: 'Prompt', type: 'text', dir: 'in' },
      { id: 'out', label: 'Response', type: 'text', dir: 'out' },
    ],
    defaultData: { model: 'venice-llama', temperature: 0.7, maxTokens: 2048 }, width: 200,
  },
  {
    type: 'vision-analyze', label: 'Vision Analyze', category: 'generation',
    ports: [
      { id: 'in-image', label: 'Image', type: 'image', dir: 'in' },
      { id: 'in-text', label: 'Question', type: 'text', dir: 'in' },
      { id: 'out', label: 'Analysis', type: 'text', dir: 'out' },
    ],
    defaultData: { model: 'qwen-vl-plus' }, width: 200,
  },
];

export const DEFAULT_TEMPLATES: { name: string; description: string; nodes: Omit<CanvasNode, 'id'>[]; connections: Omit<Connection, 'id'>[] }[] = [
  {
    name: 'Text to Image',
    description: 'Standard SDXL text-to-image pipeline',
    nodes: [
      { type: 'load-model', label: 'Load Model', category: 'model', x: 100, y: 100, ports: NODE_TEMPLATES.find(t => t.type === 'load-model')!.ports, data: { modelId: 'sdxl-base' }, width: 200 },
      { type: 'text-prompt', label: 'Positive Prompt', category: 'input', x: 100, y: 350, ports: NODE_TEMPLATES.find(t => t.type === 'text-prompt')!.ports, data: { prompt: 'A cyberpunk cityscape at night' }, width: 200 },
      { type: 'neg-prompt', label: 'Negative Prompt', category: 'input', x: 100, y: 500, ports: NODE_TEMPLATES.find(t => t.type === 'neg-prompt')!.ports, data: { prompt: 'low quality' }, width: 200 },
      { type: 'clip-encode', label: 'CLIP Encode+', category: 'processing', x: 400, y: 280, ports: NODE_TEMPLATES.find(t => t.type === 'clip-encode')!.ports, data: {}, width: 200 },
      { type: 'clip-encode', label: 'CLIP Encode-', category: 'processing', x: 400, y: 450, ports: NODE_TEMPLATES.find(t => t.type === 'clip-encode')!.ports, data: {}, width: 200 },
      { type: 'sampler', label: 'KSampler', category: 'generation', x: 700, y: 300, ports: NODE_TEMPLATES.find(t => t.type === 'sampler')!.ports, data: { steps: 30, cfg: 7.5, sampler: 'euler_ancestral', scheduler: 'normal', seed: -1 }, width: 220 },
      { type: 'vae-decode', label: 'VAE Decode', category: 'processing', x: 1000, y: 350, ports: NODE_TEMPLATES.find(t => t.type === 'vae-decode')!.ports, data: {}, width: 200 },
      { type: 'save-image', label: 'Save Image', category: 'output', x: 1300, y: 380, ports: NODE_TEMPLATES.find(t => t.type === 'save-image')!.ports, data: { filename: 'output' }, width: 200 },
    ],
    connections: [
      { fromNode: 'n0', fromPort: 'out-clip', toNode: 'n3', toPort: 'in-clip' },
      { fromNode: 'n0', fromPort: 'out-clip', toNode: 'n4', toPort: 'in-clip' },
      { fromNode: 'n0', fromPort: 'out-model', toNode: 'n5', toPort: 'in-model' },
      { fromNode: 'n0', fromPort: 'out-vae', toNode: 'n6', toPort: 'in-vae' },
      { fromNode: 'n1', fromPort: 'out', toNode: 'n3', toPort: 'in-text' },
      { fromNode: 'n2', fromPort: 'out', toNode: 'n4', toPort: 'in-text' },
      { fromNode: 'n3', fromPort: 'out', toNode: 'n5', toPort: 'in-pos' },
      { fromNode: 'n4', fromPort: 'out', toNode: 'n5', toPort: 'in-neg' },
      { fromNode: 'n5', fromPort: 'out', toNode: 'n6', toPort: 'in-latent' },
      { fromNode: 'n6', fromPort: 'out', toNode: 'n7', toPort: 'in' },
    ],
  },
  {
    name: 'LLM Chat Pipeline',
    description: 'Uncensored LLM chat with Venice AI',
    nodes: [
      { type: 'text-prompt', label: 'User Input', category: 'input', x: 100, y: 200, ports: NODE_TEMPLATES.find(t => t.type === 'text-prompt')!.ports, data: { prompt: 'Tell me about...' }, width: 200 },
      { type: 'llm-chat', label: 'Venice Llama 3.3', category: 'generation', x: 400, y: 200, ports: NODE_TEMPLATES.find(t => t.type === 'llm-chat')!.ports, data: { model: 'venice-llama', temperature: 0.7 }, width: 200 },
    ],
    connections: [
      { fromNode: 'n0', fromPort: 'out', toNode: 'n1', toPort: 'in-text' },
    ],
  },
  {
    name: 'Image Upscale Pipeline',
    description: 'Upscale an image with RealESRGAN',
    nodes: [
      { type: 'load-image', label: 'Input Image', category: 'input', x: 100, y: 200, ports: NODE_TEMPLATES.find(t => t.type === 'load-image')!.ports, data: { url: '' }, width: 200 },
      { type: 'upscale', label: 'Upscale 2x', category: 'processing', x: 400, y: 200, ports: NODE_TEMPLATES.find(t => t.type === 'upscale')!.ports, data: { scale: 2 }, width: 200 },
      { type: 'save-image', label: 'Save HD', category: 'output', x: 700, y: 200, ports: NODE_TEMPLATES.find(t => t.type === 'save-image')!.ports, data: { filename: 'upscaled' }, width: 200 },
    ],
    connections: [
      { fromNode: 'n0', fromPort: 'out', toNode: 'n1', toPort: 'in' },
      { fromNode: 'n1', fromPort: 'out', toNode: 'n2', toPort: 'in' },
    ],
  },
];

export const CATEGORY_META: Record<NodeCategory, { label: string; color: string }> = {
  input: { label: 'Input', color: '#00ccff' },
  processing: { label: 'Processing', color: '#ffaa00' },
  generation: { label: 'Generation', color: '#00ff88' },
  output: { label: 'Output', color: '#ff6688' },
  logic: { label: 'Logic', color: '#aa88ff' },
  model: { label: 'Model', color: '#88ddff' },
};
