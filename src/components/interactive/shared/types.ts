// src/components/interactive/shared/types.ts

export interface ModelConfig {
  name: string;
  layers: number;        // L
  hiddenDim: number;     // d (or H in some notations)
  heads: number;         // h (query heads)
  kvHeads: number;       // h_kv (KV heads, = h for MHA, < h for GQA, = 1 for MQA)
  headDim: number;       // d_k = hiddenDim / heads
  intermediateDim: number; // FFN intermediate dimension (typically 4*hiddenDim)
}

export interface HardwareConfig {
  name: string;
  peakTFLOPS: number;    // FP16 peak compute (TFLOPS)
  memoryGB: number;      // HBM capacity (GB)
  bandwidthTBs: number;  // HBM bandwidth (TB/s)
  sramKB: number;        // SRAM per SM (KB)
}

export type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4';

export const BYTES_PER_PARAM: Record<Precision, number> = {
  FP32: 4,
  FP16: 2,
  INT8: 1,
  INT4: 0.5,
};
