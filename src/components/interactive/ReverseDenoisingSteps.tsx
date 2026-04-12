import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;
const GRID = 8;
const TOTAL_STEPS = 10;

// Seeded RNG
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate target clean image (same pattern as ForwardDiffusionProcess)
function generateCleanImage(): number[][][] {
  const img: number[][][] = [];
  for (let r = 0; r < GRID; r++) {
    const row: number[][] = [];
    for (let c = 0; c < GRID; c++) {
      const red = Math.min(255, Math.floor(60 + (r / GRID) * 140 + (c / GRID) * 40));
      const green = Math.min(255, Math.floor(100 + Math.sin((r + c) / GRID * Math.PI) * 100));
      const blue = Math.min(255, Math.floor(200 - (r / GRID) * 120 + (c / GRID) * 40));
      row.push([red, green, blue]);
    }
    img.push(row);
  }
  return img;
}

// Generate noise image
function generateNoise(): number[][][] {
  const rng = seededRandom(42);
  const img: number[][][] = [];
  for (let r = 0; r < GRID; r++) {
    const row: number[][] = [];
    for (let c = 0; c < GRID; c++) {
      const g = Math.floor(100 + rng() * 80);
      row.push([g, g + Math.floor(rng() * 20 - 10), g + Math.floor(rng() * 20 - 10)]);
    }
    img.push(row);
  }
  return img;
}

function lerpColor(a: number[], b: number[], ratio: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * ratio);
  const g = Math.round(a[1] + (b[1] - a[1]) * ratio);
  const bl = Math.round(a[2] + (b[2] - a[2]) * ratio);
  return `rgb(${r},${g},${bl})`;
}

// Predicted noise: difference between current noisy and slightly less noisy
function predictedNoiseColor(noise: number[], clean: number[], step: number): string {
  const strength = (TOTAL_STEPS - step) / TOTAL_STEPS;
  const r = Math.round(128 + (noise[0] - clean[0]) * strength * 0.5);
  const g = Math.round(128 + (noise[1] - clean[1]) * strength * 0.5);
  const b = Math.round(128 + (noise[2] - clean[2]) * strength * 0.5);
  return `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
}

export default function ReverseDenoisingSteps({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '反向去噪过程',
      step: '去噪步骤',
      prevStep: '上一步',
      nextStep: '下一步',
      reset: '重置',
      currentImage: '当前图像 xₜ',
      predictedNoise: '预测噪声 εθ',
      result: '去噪结果 xₜ₋₁',
      formula: 'xₜ₋₁ = f(xₜ, εθ(xₜ, t))',
      keyInsight: '模型预测的是噪声，不是图像本身',
      pureNoise: '纯噪声',
      cleanImage: '恢复图像',
    },
    en: {
      title: 'Reverse Denoising Process',
      step: 'Denoising Step',
      prevStep: 'Previous',
      nextStep: 'Next Step',
      reset: 'Reset',
      currentImage: 'Current xₜ',
      predictedNoise: 'Predicted εθ',
      result: 'Denoised xₜ₋₁',
      formula: 'xₜ₋₁ = f(xₜ, εθ(xₜ, t))',
      keyInsight: 'Model predicts noise, not the image itself',
      pureNoise: 'Pure noise',
      cleanImage: 'Recovered image',
    },
  }[locale]!;

  const [currentStep, setCurrentStep] = useState(0);

  const cleanImage = useMemo(() => generateCleanImage(), []);
  const noiseImage = useMemo(() => generateNoise(), []);

  // At step 0 = pure noise, step TOTAL_STEPS = clean image
  const noiseRatio = 1 - currentStep / TOTAL_STEPS;
  const nextNoiseRatio = 1 - Math.min(currentStep + 1, TOTAL_STEPS) / TOTAL_STEPS;

  const cellSize = 18;
  const gap = 1;

  // Three grids side by side
  const gridW = GRID * (cellSize + gap);
  const grid1X = 80;
  const grid2X = 320;
  const grid3X = 560;
  const gridY = 130;

  return (
    <div className="my-6">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">
          {t.step}: <span className="font-mono font-bold text-blue-700">{currentStep}/{TOTAL_STEPS}</span>
        </span>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded border border-gray-300"
        >
          {t.prevStep}
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(TOTAL_STEPS, currentStep + 1))}
          disabled={currentStep === TOTAL_STEPS}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 rounded"
        >
          {t.nextStep}
        </button>
        <button
          onClick={() => setCurrentStep(0)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
        >
          {t.reset}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Step progress bar */}
        <g>
          {Array.from({ length: TOTAL_STEPS + 1 }, (_, i) => {
            const dotX = 100 + (i / TOTAL_STEPS) * 600;
            const dotY = 60;
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <g key={`step-${i}`}>
                <motion.circle
                  cx={dotX} cy={dotY} r={isCurrent ? 7 : 5}
                  fill={isActive ? COLORS.primary : COLORS.light}
                  stroke={isCurrent ? COLORS.primary : 'none'}
                  strokeWidth={isCurrent ? 2 : 0}
                  animate={{
                    r: isCurrent ? 7 : 5,
                    fill: isActive ? COLORS.primary : COLORS.light,
                  }}
                  transition={{ duration: 0.2 }}
                />
                {i < TOTAL_STEPS && (
                  <line
                    x1={dotX + 6} y1={dotY}
                    x2={dotX + (600 / TOTAL_STEPS) - 6} y2={dotY}
                    stroke={i < currentStep ? COLORS.primary : COLORS.light}
                    strokeWidth={2}
                  />
                )}
              </g>
            );
          })}
          <text x={100} y={82} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            {t.pureNoise}
          </text>
          <text x={700} y={82} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            {t.cleanImage}
          </text>
        </g>

        {/* Arrow markers */}
        <defs>
          <marker id="rds-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Grid 1: Current image xₜ */}
        <text x={grid1X + gridW / 2} y={gridY - 12} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}>
          {t.currentImage}
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => (
            <motion.rect
              key={`g1-${r}-${c}`}
              x={grid1X + c * (cellSize + gap)}
              y={gridY + r * (cellSize + gap)}
              width={cellSize} height={cellSize}
              fill={lerpColor(cleanImage[r][c], noiseImage[r][c], noiseRatio)}
              rx={2}
              animate={{ fill: lerpColor(cleanImage[r][c], noiseImage[r][c], noiseRatio) }}
              transition={{ duration: 0.3 }}
            />
          ))
        )}
        <rect x={grid1X - 2} y={gridY - 2} width={gridW + 4} height={gridW + 4}
          fill="none" stroke={COLORS.primary} strokeWidth={1.5} rx={4} />

        {/* Arrow 1 → 2 */}
        <line x1={grid1X + gridW + 15} y1={gridY + gridW / 2}
          x2={grid2X - 15} y2={gridY + gridW / 2}
          stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#rds-arrow)" />
        <text x={(grid1X + gridW + grid2X) / 2} y={gridY + gridW / 2 - 10}
          textAnchor="middle" fontSize="10" fill={COLORS.purple} fontWeight="500">
          εθ(xₜ, t)
        </text>

        {/* Grid 2: Predicted noise */}
        <text x={grid2X + gridW / 2} y={gridY - 12} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.purple}>
          {t.predictedNoise}
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => (
            <motion.rect
              key={`g2-${r}-${c}`}
              x={grid2X + c * (cellSize + gap)}
              y={gridY + r * (cellSize + gap)}
              width={cellSize} height={cellSize}
              fill={predictedNoiseColor(noiseImage[r][c], cleanImage[r][c], currentStep)}
              rx={2}
              animate={{ fill: predictedNoiseColor(noiseImage[r][c], cleanImage[r][c], currentStep) }}
              transition={{ duration: 0.3 }}
            />
          ))
        )}
        <rect x={grid2X - 2} y={gridY - 2} width={gridW + 4} height={gridW + 4}
          fill="none" stroke={COLORS.purple} strokeWidth={1.5} rx={4} />

        {/* Arrow 2 → 3 */}
        <line x1={grid2X + gridW + 15} y1={gridY + gridW / 2}
          x2={grid3X - 15} y2={gridY + gridW / 2}
          stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#rds-arrow)" />
        <text x={(grid2X + gridW + grid3X) / 2} y={gridY + gridW / 2 - 10}
          textAnchor="middle" fontSize="10" fill={COLORS.green} fontWeight="500">
          {locale === 'zh' ? '减去噪声' : 'subtract'}
        </text>

        {/* Grid 3: Denoised result */}
        <text x={grid3X + gridW / 2} y={gridY - 12} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.green}>
          {t.result}
        </text>
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => (
            <motion.rect
              key={`g3-${r}-${c}`}
              x={grid3X + c * (cellSize + gap)}
              y={gridY + r * (cellSize + gap)}
              width={cellSize} height={cellSize}
              fill={lerpColor(cleanImage[r][c], noiseImage[r][c], nextNoiseRatio)}
              rx={2}
              animate={{ fill: lerpColor(cleanImage[r][c], noiseImage[r][c], nextNoiseRatio) }}
              transition={{ duration: 0.3 }}
            />
          ))
        )}
        <rect x={grid3X - 2} y={gridY - 2} width={gridW + 4} height={gridW + 4}
          fill="none" stroke={COLORS.green} strokeWidth={1.5} rx={4} />

        {/* Formula */}
        <rect x={W / 2 - 160} y={gridY + gridW + 25} width={320} height={30}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} rx={6} />
        <text x={W / 2} y={gridY + gridW + 45} textAnchor="middle" fontSize="13" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.mono}>
          {t.formula}
        </text>

        {/* Key insight */}
        <text x={W / 2} y={H - 25} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.red}>
          {t.keyInsight}
        </text>
      </svg>
    </div>
  );
}
