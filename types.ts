import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export enum AppMode {
  GENERATE = 'generate',
  EDIT = 'edit',
  ANALYZE = 'analyze',
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export const GENERATION_MODELS = [
  'gemini-2.5-flash-image',
  'imagen-3.0-generate-001',
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
  'imagen-4.0-fast-generate-001',
] as const;

export const EDIT_MODELS = [
  'gemini-2.5-flash-image',
] as const;

export type GenerationModel = typeof GENERATION_MODELS[number];

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
  type: 'generated' | 'edited';
  aspectRatio?: string;
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}

export const STYLE_PRESETS = [
  { id: 'none', label: 'No Style' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'anime', label: 'Anime / Manga' },
  { id: 'digital-art', label: 'Digital Art' },
  { id: 'oil-painting', label: 'Oil Painting' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'charcoal', label: 'Charcoal Sketch' },
  { id: '3d-render', label: '3D Render' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'vintage', label: 'Vintage Photo' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'neon-punk', label: 'Neon Punk' },
  { id: 'isometric', label: 'Isometric' },
  { id: 'low-poly', label: 'Low Poly' },
  { id: 'origami', label: 'Origami' },
  { id: 'line-art', label: 'Line Art' },
  { id: 'surrealism', label: 'Surrealism' },
  { id: 'pop-art', label: 'Pop Art' },
  { id: 'steampunk', label: 'Steampunk' },
  { id: 'fantasy', label: 'Fantasy RPG' },
] as const;

export type StylePreset = typeof STYLE_PRESETS[number]['id'];

export interface PromptTemplateSection {
  category: string;
  prompts: string[];
}

export const PROMPT_TEMPLATES: PromptTemplateSection[] = [
  {
    category: 'Cinematic & Realistic',
    prompts: [
      "A futuristic cityscape at sunset, neon lights reflecting on wet pavement, cinematic lighting, highly detailed, 8k resolution, photorealistic.",
      "Close-up portrait of an old sailor with a white beard, weathering storm on a boat, dramatic lighting, detailed skin texture, intense eyes.",
      "A cozy cabin in a snowy forest during twilight, warm light coming from windows, smoke rising from chimney, magical atmosphere."
    ]
  },
  {
    category: '3D & CGI',
    prompts: [
      "A cute isometric living room with plants, a cat sleeping on the sofa, pastel colors, 3d render, blender style, soft lighting.",
      "A transparent glass robot with glowing internal circuits, standing in a laboratory, depth of field, octane render, ray tracing.",
      "Low poly floating island with a castle, waterfall cascading down into clouds, vibrant colors, game asset style."
    ]
  },
  {
    category: 'Artistic & Abstract',
    prompts: [
      "Oil painting of a bustling market in Morocco, vibrant spices, dappled sunlight, expressive brushstrokes, impressionist style.",
      "A surreal dreamscape with melting clocks and floating elephants, dali style, desert background, vivid colors.",
      "Cyberpunk samurai standing in rain, watercolor style, dripping paint effects, neon red and blue palette."
    ]
  },
  {
    category: 'Character Design',
    prompts: [
      "A fantasy elf warrior queen, wearing silver armor with intricate leaf patterns, glowing magical staff, forest background, digital art.",
      "Steampunk inventor with brass goggles, messy hair, holding a glowing gadget, workshop background, intricate details.",
      "A cute anthropomorphic fox wearing a detective coat and hat, rainy city street background, pixar style animation."
    ]
  }
];
