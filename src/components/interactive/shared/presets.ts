// src/components/interactive/shared/presets.ts
import type { ModelConfig, HardwareConfig } from './types';

export const MODEL_PRESETS: Record<string, ModelConfig> = {
  'LLaMA-2 7B': {
    name: 'LLaMA-2 7B',
    layers: 32,
    hiddenDim: 4096,
    heads: 32,
    kvHeads: 32,  // MHA
    headDim: 128,
    intermediateDim: 11008,
  },
  'LLaMA-2 13B': {
    name: 'LLaMA-2 13B',
    layers: 40,
    hiddenDim: 5120,
    heads: 40,
    kvHeads: 40,
    headDim: 128,
    intermediateDim: 13824,
  },
  'LLaMA-2 70B': {
    name: 'LLaMA-2 70B',
    layers: 80,
    hiddenDim: 8192,
    heads: 64,
    kvHeads: 8,   // GQA with 8 KV heads
    headDim: 128,
    intermediateDim: 28672,
  },
  'Mistral 7B': {
    name: 'Mistral 7B',
    layers: 32,
    hiddenDim: 4096,
    heads: 32,
    kvHeads: 8,   // GQA with 8 KV heads
    headDim: 128,
    intermediateDim: 14336,
  },
};

export const HARDWARE_PRESETS: Record<string, HardwareConfig> = {
  'A100 80GB': {
    name: 'A100 80GB',
    peakTFLOPS: 312,
    memoryGB: 80,
    bandwidthTBs: 2.0,
    sramKB: 192,  // 192KB per SM
  },
  'H100 80GB': {
    name: 'H100 80GB',
    peakTFLOPS: 989,
    memoryGB: 80,
    bandwidthTBs: 3.35,
    sramKB: 256,
  },
};
