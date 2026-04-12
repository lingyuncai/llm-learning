import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;
const LAYERS = 4;
const STEPS = 8;

const layerColors = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple];

export default function CodebookInterleaving({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'MusicGen Delay Pattern：多码本交错',
      flat: '扁平模式 (Flat)',
      delay: '延迟模式 (Delay)',
      flatDesc: '每个时间步先填完所有层，再到下一步。需要 K 个独立模型。',
      delayDesc: '每层偏移 1 步，形成对角线模式。单个 Transformer 处理全部。',
      codebook: '码本',
      timeStep: '时间步',
      slow: '慢: K 个模型',
      fast: '快: 1 个模型',
      playing: '播放中...',
      play: '播放动画',
      reset: '重置',
    },
    en: {
      title: 'MusicGen Delay Pattern: Multi-Codebook Interleaving',
      flat: 'Flat Pattern',
      delay: 'Delay Pattern',
      flatDesc: 'Fill all layers at each timestep before moving to the next. Requires K separate models.',
      delayDesc: 'Each layer offset by 1 step, forming a diagonal. Single Transformer handles all.',
      codebook: 'Codebook',
      timeStep: 'Time Step',
      slow: 'Slow: K models',
      fast: 'Fast: 1 model',
      playing: 'Playing...',
      play: 'Play Animation',
      reset: 'Reset',
    },
  }[locale]!;

  const [patternType, setPatternType] = useState<'flat' | 'delay'>('delay');
  const [currentTimestep, setCurrentTimestep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxStep = patternType === 'flat' ? STEPS * LAYERS : STEPS + LAYERS - 1;

  const resetAnim = useCallback(() => {
    setCurrentTimestep(-1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    resetAnim();
  }, [patternType, resetAnim]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentTimestep >= maxStep) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentTimestep(s => s + 1), 350);
    return () => clearTimeout(timer);
  }, [isPlaying, currentTimestep, maxStep]);

  const startPlay = () => {
    setCurrentTimestep(0);
    setIsPlaying(true);
  };

  // Determine if a cell is filled at the current animation step
  const isFilled = (layer: number, step: number): boolean => {
    if (currentTimestep < 0) return false;
    if (patternType === 'flat') {
      // Flat: fill layer 0..K-1 at time step 0, then layer 0..K-1 at time step 1, etc.
      const fillOrder = step * LAYERS + layer;
      return fillOrder <= currentTimestep;
    } else {
      // Delay: layer i at time step t is filled at animation step t + i
      const fillOrder = step + layer;
      return fillOrder <= currentTimestep;
    }
  };

  const isCurrentFill = (layer: number, step: number): boolean => {
    if (currentTimestep < 0) return false;
    if (patternType === 'flat') {
      return step * LAYERS + layer === currentTimestep;
    } else {
      return step + layer === currentTimestep;
    }
  };

  const gridX = 180, gridY = 80;
  const cellW = 60, cellH = 50;
  const gridW = STEPS * cellW, gridH = LAYERS * cellH;

  return (
    <div className="my-6">
      <div className="flex gap-2 mb-3">
        {(['delay', 'flat'] as const).map((pt) => (
          <button key={pt}
            onClick={() => setPatternType(pt)}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              patternType === pt
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {pt === 'flat' ? t.flat : t.delay}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={startPlay}
            disabled={isPlaying}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-40">
            {isPlaying ? t.playing : t.play}
          </button>
          <button onClick={resetAnim}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-600 rounded font-medium hover:bg-gray-300">
            {t.reset}
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <text x={W / 2} y={24} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={COLORS.dark}>{t.title}</text>

        {/* Description */}
        <text x={W / 2} y={50} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {patternType === 'flat' ? t.flatDesc : t.delayDesc}
        </text>

        {/* Row labels (codebook layers) */}
        {Array.from({ length: LAYERS }, (_, l) => (
          <text key={l} x={gridX - 10} y={gridY + l * cellH + cellH / 2 + 1}
            textAnchor="end" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill={layerColors[l]}>
            {t.codebook} {l + 1}
          </text>
        ))}

        {/* Column labels (time steps) */}
        {Array.from({ length: STEPS }, (_, s) => (
          <text key={s} x={gridX + s * cellW + cellW / 2} y={gridY - 8}
            textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            t={s}
          </text>
        ))}

        {/* Grid cells */}
        {Array.from({ length: LAYERS }, (_, l) =>
          Array.from({ length: STEPS }, (_, s) => {
            const filled = isFilled(l, s);
            const current = isCurrentFill(l, s);
            let cellFill: string = COLORS.masked;
            if (filled) cellFill = layerColors[l];

            return (
              <motion.g key={`${l}-${s}`}>
                <motion.rect
                  x={gridX + s * cellW + 2}
                  y={gridY + l * cellH + 2}
                  width={cellW - 4}
                  height={cellH - 4}
                  rx={4}
                  fill={cellFill}
                  opacity={filled ? 0.8 : 0.3}
                  stroke={current ? COLORS.dark : 'none'}
                  strokeWidth={current ? 2 : 0}
                  animate={{
                    fill: cellFill,
                    opacity: filled ? 0.8 : 0.3,
                  }}
                  transition={{ duration: 0.2 }}
                />
                {filled && (
                  <text
                    x={gridX + s * cellW + cellW / 2}
                    y={gridY + l * cellH + cellH / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontWeight="600" fill={COLORS.bg}>
                    {`C${l + 1}[${s}]`}
                  </text>
                )}
              </motion.g>
            );
          })
        )}

        {/* Grid border */}
        <rect x={gridX} y={gridY} width={gridW} height={gridH}
          fill="none" stroke={COLORS.light} strokeWidth={1} rx={4} />

        {/* Diagonal indicator for delay pattern */}
        {patternType === 'delay' && currentTimestep >= 0 && (
          <motion.line
            x1={gridX + Math.max(0, currentTimestep - LAYERS + 1) * cellW + cellW / 2}
            y1={gridY + Math.min(currentTimestep, LAYERS - 1) * cellH + cellH / 2}
            x2={gridX + Math.min(currentTimestep, STEPS - 1) * cellW + cellW / 2}
            y2={gridY + Math.max(0, currentTimestep - STEPS + 1) * cellH + cellH / 2}
            stroke={COLORS.red}
            strokeWidth={2}
            strokeDasharray="4,3"
            opacity={0.6}
          />
        )}

        {/* Speed label */}
        <rect x={gridX + gridW / 2 - 60} y={gridY + gridH + 15} width={120} height={26}
          rx={4} fill={patternType === 'delay' ? '#e8f5e9' : COLORS.waste}
          stroke={patternType === 'delay' ? COLORS.green : COLORS.red} strokeWidth={1.5} />
        <text x={gridX + gridW / 2} y={gridY + gridH + 32} textAnchor="middle"
          fontSize="10" fontWeight="700"
          fill={patternType === 'delay' ? COLORS.green : COLORS.red}>
          {patternType === 'delay' ? t.fast : t.slow}
        </text>
      </svg>
    </div>
  );
}
