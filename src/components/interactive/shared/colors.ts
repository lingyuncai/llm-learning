// src/components/interactive/shared/colors.ts

// Global semantic colors (consistent across all diagrams)
export const COLORS = {
  // Primary palette
  primary: '#1565c0',
  dark: '#1a1a2e',
  mid: '#666666',
  light: '#e2e8f0',
  bg: '#ffffff',
  bgAlt: '#f8fafc',

  // Semantic accents
  green: '#2e7d32',   // positive / Prefill
  red: '#c62828',     // warning / Decode
  orange: '#e65100',  // neutral emphasis
  purple: '#6a1b9a',  // output / result

  // Functional colors (per-element state within a diagram)
  masked: '#f3f4f6',     // masked / invalid cells
  valid: '#dbeafe',      // valid / normalized
  highlight: '#fef3c7',  // current step highlight
  waste: '#fee2e2',      // redundant / wasted computation
} as const;

// Head colors for multi-head visualizations
export const HEAD_COLORS = [
  '#1565c0', // blue
  '#2e7d32', // green
  '#e65100', // orange
  '#6a1b9a', // purple
  '#c62828', // red
  '#00838f', // teal
  '#4527a0', // deep purple
  '#ef6c00', // dark orange
] as const;

export type ColorKey = keyof typeof COLORS;

// Font stacks for SVG text elements (mirrors Tailwind's font-mono / font-sans)
export const FONTS = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
} as const;
