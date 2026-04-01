/**
 * Shared math utilities for interactive demo components.
 * Provides deterministic pseudo-random data generation and basic matrix operations.
 */

/**
 * Seed-based pseudo-random values in [0, 1) range.
 * Used by QKVLinearProjection.
 */
export function seededValues01(rows: number, cols: number, seed: number): number[][] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return parseFloat(((s % 100) / 100).toFixed(2));
  };
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => next()),
  );
}

/**
 * Seed-based pseudo-random values in [-1, 1) range.
 * Used by AttentionStepAnimation, KVCacheDemo, FlashAttentionTiling.
 */
export function seededValuesSigned(rows: number, cols: number, seed: number): number[][] {
  let s = seed;
  const next = () => {
    s = (s * 16807 + 11) % 2147483647;
    return parseFloat(((s % 200 - 100) / 100).toFixed(2));
  };
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => next()),
  );
}

/** Matrix multiply (rounded to 2 decimal places). */
export function matmul(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += a[i][k] * b[k][j];
      return parseFloat(sum.toFixed(2));
    }),
  );
}

/** Transpose a matrix. */
export function transpose(m: number[][]): number[][] {
  return Array.from({ length: m[0].length }, (_, j) =>
    Array.from({ length: m.length }, (_, i) => m[i][j]),
  );
}

/** Dot product of two vectors, rounded to 2 decimal places. */
export function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return parseFloat(sum.toFixed(2));
}

/** Softmax of a 1D array with numerical stability. */
export function softmax1d(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => parseFloat((e / sum).toFixed(2)));
}
