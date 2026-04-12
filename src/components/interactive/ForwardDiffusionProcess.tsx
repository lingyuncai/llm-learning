import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;
const GRID = 8;
const T_MAX = 50;

// Seeded pseudo-random number generator for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate base image colors (a simple gradient pattern)
function generateBaseImage(): string[][] {
  const colors: string[][] = [];
  for (let r = 0; r < GRID; r++) {
    const row: string[] = [];
    for (let c = 0; c < GRID; c++) {
      const red = Math.floor(60 + (r / GRID) * 140 + (c / GRID) * 40);
      const green = Math.floor(100 + Math.sin((r + c) / GRID * Math.PI) * 100);
      const blue = Math.floor(200 - (r / GRID) * 120 + (c / GRID) * 40);
      row.push(`${Math.min(255, red)},${Math.min(255, green)},${Math.min(255, blue)}`);
    }
    colors.push(row);
  }
  return colors;
}

// Pre-compute Gaussian noise targets per pixel
function generateNoiseTargets(): string[][] {
  const rng = seededRandom(42);
  const targets: string[][] = [];
  for (let r = 0; r < GRID; r++) {
    const row: string[] = [];
    for (let c = 0; c < GRID; c++) {
      const gray = Math.floor(100 + rng() * 80);
      row.push(`${gray},${gray + Math.floor(rng() * 20 - 10)},${gray + Math.floor(rng() * 20 - 10)}`);
    }
    targets.push(row);
  }
  return targets;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendColor(baseRgb: string, noiseRgb: string, ratio: number): string {
  const [br, bg, bb] = baseRgb.split(',').map(Number);
  const [nr, ng, nb] = noiseRgb.split(',').map(Number);
  const r = Math.round(lerp(br, nr, ratio));
  const g = Math.round(lerp(bg, ng, ratio));
  const b = Math.round(lerp(bb, nb, ratio));
  return `rgb(${r},${g},${b})`;
}

export default function ForwardDiffusionProcess({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '前向扩散过程',
      timestep: '时间步 t',
      original: '原始图像',
      pureNoise: '纯噪声',
      alphaBar: 'ᾱₜ (信号保留率)',
      signal: '信号',
      noise: '噪声',
      formula: 'q(xₜ | x₀) = N(xₜ; √ᾱₜ · x₀, (1 − ᾱₜ) · I)',
    },
    en: {
      title: 'Forward Diffusion Process',
      timestep: 'Timestep t',
      original: 'Original image',
      pureNoise: 'Pure noise',
      alphaBar: 'ᾱₜ (signal retention)',
      signal: 'Signal',
      noise: 'Noise',
      formula: 'q(xₜ | x₀) = N(xₜ; √ᾱₜ · x₀, (1 − ᾱₜ) · I)',
    },
  }[locale]!;

  const [timestep, setTimestep] = useState(0);

  const baseImage = useMemo(() => generateBaseImage(), []);
  const noiseTargets = useMemo(() => generateNoiseTargets(), []);

  // Linear schedule: β from 0.0001 to 0.02 over T_MAX steps
  const alphaBar = useMemo(() => {
    const betas: number[] = [];
    for (let i = 0; i <= T_MAX; i++) {
      betas.push(0.0001 + (0.02 - 0.0001) * (i / T_MAX));
    }
    const bars: number[] = [1.0];
    let prod = 1.0;
    for (let i = 1; i <= T_MAX; i++) {
      prod *= (1 - betas[i]);
      bars.push(prod);
    }
    return bars;
  }, []);

  const currentAlphaBar = alphaBar[timestep];
  const noiseRatio = 1 - currentAlphaBar;
  const signalPct = Math.round(currentAlphaBar * 100);
  const noisePct = Math.round(noiseRatio * 100);

  // Grid positioning
  const gridX = 250;
  const gridY = 50;
  const cellSize = 30;
  const gridTotalSize = GRID * cellSize;

  // Bar chart area
  const barX = 580;
  const barY = 80;
  const barW = 160;
  const barH = 20;

  return (
    <div className="my-6">
      {/* Slider control */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">
          {t.timestep}: <span className="font-mono font-bold text-blue-700">{timestep}</span>
        </label>
        <input
          type="range"
          min={0}
          max={T_MAX}
          value={timestep}
          onChange={(e) => setTimestep(Number(e.target.value))}
          className="flex-1 max-w-xs"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={30} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* 8x8 grid */}
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const color = blendColor(baseImage[r][c], noiseTargets[r][c], noiseRatio);
            return (
              <motion.rect
                key={`cell-${r}-${c}`}
                x={gridX + c * cellSize}
                y={gridY + r * cellSize}
                width={cellSize - 1}
                height={cellSize - 1}
                fill={color}
                rx={2}
                animate={{ fill: color }}
                transition={{ duration: 0.1 }}
              />
            );
          })
        )}

        {/* Grid border */}
        <rect
          x={gridX - 1} y={gridY - 1}
          width={gridTotalSize + 2} height={gridTotalSize + 2}
          fill="none" stroke={COLORS.light} strokeWidth={1} rx={3}
        />

        {/* Labels below grid */}
        <text
          x={gridX}
          y={gridY + gridTotalSize + 20}
          fontSize="11" fill={timestep === 0 ? COLORS.green : COLORS.mid}
          fontWeight={timestep === 0 ? '600' : '400'}
        >
          t=0: {t.original}
        </text>
        <text
          x={gridX + gridTotalSize}
          y={gridY + gridTotalSize + 20}
          textAnchor="end"
          fontSize="11" fill={timestep === T_MAX ? COLORS.red : COLORS.mid}
          fontWeight={timestep === T_MAX ? '600' : '400'}
        >
          t={T_MAX}: {t.pureNoise}
        </text>

        {/* Progress bar under grid */}
        <rect
          x={gridX} y={gridY + gridTotalSize + 30}
          width={gridTotalSize} height={6}
          fill={COLORS.light} rx={3}
        />
        <motion.rect
          x={gridX} y={gridY + gridTotalSize + 30}
          width={gridTotalSize * (timestep / T_MAX)}
          height={6}
          fill={COLORS.primary} rx={3}
          animate={{ width: gridTotalSize * (timestep / T_MAX) }}
          transition={{ duration: 0.1 }}
        />

        {/* Right side: alpha bar value */}
        <text x={barX} y={barY - 20} fontSize="13" fontWeight="600" fill={COLORS.dark}>
          {t.alphaBar}
        </text>
        <text x={barX} y={barY} fontSize="24" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
          {currentAlphaBar.toFixed(4)}
        </text>

        {/* Signal bar */}
        <text x={barX} y={barY + 40} fontSize="12" fontWeight="500" fill={COLORS.green}>
          {t.signal}: {signalPct}%
        </text>
        <rect x={barX} y={barY + 48} width={barW} height={barH} fill={COLORS.light} rx={4} />
        <motion.rect
          x={barX} y={barY + 48}
          width={barW * (signalPct / 100)}
          height={barH}
          fill={COLORS.green} rx={4}
          animate={{ width: barW * (signalPct / 100) }}
          transition={{ duration: 0.15 }}
        />

        {/* Noise bar */}
        <text x={barX} y={barY + 95} fontSize="12" fontWeight="500" fill={COLORS.red}>
          {t.noise}: {noisePct}%
        </text>
        <rect x={barX} y={barY + 103} width={barW} height={barH} fill={COLORS.light} rx={4} />
        <motion.rect
          x={barX} y={barY + 103}
          width={barW * (noisePct / 100)}
          height={barH}
          fill={COLORS.red} rx={4}
          animate={{ width: barW * (noisePct / 100) }}
          transition={{ duration: 0.15 }}
        />

        {/* Formula */}
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="13" fill={COLORS.dark}
          fontFamily={FONTS.mono}>
          {t.formula}
        </text>

        {/* Visual timeline with markers */}
        <g>
          {[0, Math.round(T_MAX * 0.25), Math.round(T_MAX * 0.5), Math.round(T_MAX * 0.75), T_MAX].map((step, i) => {
            const mx = gridX + (step / T_MAX) * gridTotalSize;
            const my = gridY + gridTotalSize + 42;
            return (
              <g key={`marker-${i}`}>
                <line x1={mx} y1={my} x2={mx} y2={my + 6} stroke={COLORS.mid} strokeWidth={1} />
                <text x={mx} y={my + 16} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
                  {step}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
