import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 450;

// Seeded PRNG
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate synthetic signal data for each layer
function generateLayerSignals(): number[][] {
  const layers: number[][] = [];
  const rng = seededRandom(42);

  // Layer 1: coarse speech structure (low-freq envelope)
  const baseSignal: number[] = [];
  for (let i = 0; i < 60; i++) {
    baseSignal.push(Math.sin(i * 0.15) * 0.6 + Math.sin(i * 0.05) * 0.3 + rng() * 0.1);
  }
  layers.push(baseSignal);

  // Subsequent layers: progressively finer residual detail
  for (let l = 1; l < 8; l++) {
    const detail: number[] = [];
    const scale = 1 / (l + 1);
    for (let i = 0; i < 60; i++) {
      detail.push(
        Math.sin(i * (0.3 + l * 0.15)) * scale * 0.5 +
        Math.cos(i * (0.5 + l * 0.2)) * scale * 0.3 +
        rng() * scale * 0.4
      );
    }
    layers.push(detail);
  }
  return layers;
}

// Generate cumulative residuals for each visible layer count
function computeResiduals(signals: number[][]): number[] {
  const residuals: number[] = [];
  let cumEnergy = 0;
  const totalEnergy = signals.reduce((sum, layer) =>
    sum + layer.reduce((s, v) => s + v * v, 0), 0
  );
  for (let l = 0; l < 8; l++) {
    cumEnergy += signals[l].reduce((s, v) => s + v * v, 0);
    residuals.push(1 - cumEnergy / totalEnergy);
  }
  return residuals;
}

export default function RVQLayerVisualization({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'RVQ 逐层细化音频质量',
      layers: '可见层数',
      layerLabel: '层',
      residualTitle: '残差能量',
      residual: '剩余',
      quality: '累积质量',
      l1Desc: '第 1 层: 语音结构 (基频、节奏)',
      l23Desc: '第 2-3 层: 说话人身份 (音色、语调)',
      l48Desc: '第 4-8 层: 声学细节 (气息、环境)',
      coarse: '粗糙',
      fine: '精细',
      codebook: '码本',
      bitrate: '比特率: 6kbps (8 codebooks × 75Hz × 10 bits)',
    },
    en: {
      title: 'RVQ Progressive Audio Refinement',
      layers: 'Visible Layers',
      layerLabel: 'Layer',
      residualTitle: 'Residual Energy',
      residual: 'Remaining',
      quality: 'Cumulative Quality',
      l1Desc: 'Layer 1: Speech structure (pitch, rhythm)',
      l23Desc: 'Layers 2-3: Speaker identity (timbre, intonation)',
      l48Desc: 'Layers 4-8: Acoustic details (breath, ambience)',
      coarse: 'Coarse',
      fine: 'Fine',
      codebook: 'Codebook',
      bitrate: 'Bitrate: 6kbps (8 codebooks × 75Hz × 10 bits)',
    },
  }[locale]!;

  const [visibleLayers, setVisibleLayers] = useState(4);

  const signals = useMemo(() => generateLayerSignals(), []);
  const residuals = useMemo(() => computeResiduals(signals), [signals]);

  const barAreaX = 50, barAreaY = 60;
  const barW = 480, barH = 32, barGap = 6;
  const totalBarH = 8 * (barH + barGap);

  // Residual bar chart area
  const resX = 580, resW = 180, resBarH = 20;

  const layerColors = [
    COLORS.primary, COLORS.green, COLORS.green,
    COLORS.orange, COLORS.orange, COLORS.purple, COLORS.purple, COLORS.purple,
  ];

  return (
    <div className="my-6">
      {/* Slider control */}
      <div className="flex items-center gap-3 mb-3 px-2">
        <span className="text-sm font-medium text-gray-700">{t.layers}: {visibleLayers}</span>
        <input
          type="range" min={1} max={8} value={visibleLayers}
          onChange={(e) => setVisibleLayers(Number(e.target.value))}
          className="flex-1 max-w-xs"
        />
        <span className="text-xs text-gray-400">1 = {t.coarse}, 8 = {t.fine}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <text x={W / 2} y={28} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.dark}>{t.title}</text>

        {/* 8 layer bars */}
        {signals.map((signal, l) => {
          const y = barAreaY + l * (barH + barGap);
          const isVisible = l < visibleLayers;
          const points = signal.map((v, i) => {
            const px = barAreaX + (i / (signal.length - 1)) * barW;
            const py = y + barH / 2 - v * (barH * 0.4);
            return `${px},${py}`;
          }).join(' ');

          return (
            <motion.g key={l}
              animate={{ opacity: isVisible ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background bar */}
              <rect x={barAreaX} y={y} width={barW} height={barH} rx={4}
                fill={isVisible ? COLORS.bgAlt : COLORS.masked}
                stroke={isVisible ? layerColors[l] : COLORS.light}
                strokeWidth={isVisible ? 1.5 : 0.5} />

              {/* Signal waveform */}
              <polyline points={points} fill="none"
                stroke={isVisible ? layerColors[l] : COLORS.light}
                strokeWidth={isVisible ? 1.5 : 0.5} />

              {/* Layer label */}
              <text x={barAreaX - 8} y={y + barH / 2 + 1} textAnchor="end"
                fontSize="9" fontWeight="500"
                fill={isVisible ? COLORS.dark : COLORS.light}>
                {t.layerLabel} {l + 1}
              </text>

              {/* Codebook label */}
              <text x={barAreaX + barW + 8} y={y + barH / 2 + 1} textAnchor="start"
                fontSize="7" fill={isVisible ? COLORS.mid : COLORS.light}>
                {t.codebook} {l + 1}
              </text>
            </motion.g>
          );
        })}

        {/* Residual energy chart on the right */}
        <text x={resX + resW / 2} y={barAreaY - 8} textAnchor="middle" fontSize="10"
          fontWeight="600" fill={COLORS.dark}>{t.residualTitle}</text>

        {signals.map((_, l) => {
          const y = barAreaY + l * (barH + barGap) + (barH - resBarH) / 2;
          const isVisible = l < visibleLayers;
          const residualPct = l === 0 ? 1 : (1 - residuals[l - 1]);
          const currentResidual = residuals[l];
          const barFillW = resW * (1 - currentResidual);

          return (
            <motion.g key={`res-${l}`}
              animate={{ opacity: isVisible ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background */}
              <rect x={resX} y={y} width={resW} height={resBarH} rx={3}
                fill={COLORS.masked} stroke={COLORS.light} strokeWidth={0.5} />

              {/* Filled portion = quality captured so far */}
              <motion.rect x={resX} y={y} width={barFillW} height={resBarH} rx={3}
                fill={layerColors[l]} opacity={0.4}
                animate={{ width: isVisible ? barFillW : 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Percentage */}
              <text x={resX + resW + 8} y={y + resBarH / 2 + 1} textAnchor="start"
                fontSize="7" fill={isVisible ? COLORS.dark : COLORS.light}>
                {isVisible ? `${Math.round((1 - currentResidual) * 100)}%` : ''}
              </text>
            </motion.g>
          );
        })}

        {/* Quality indicator */}
        <motion.g>
          <rect x={resX} y={barAreaY + totalBarH + 10} width={resW} height={4} rx={2}
            fill={COLORS.light} />
          <motion.rect x={resX} y={barAreaY + totalBarH + 10}
            width={resW * (1 - residuals[visibleLayers - 1])}
            height={4} rx={2} fill={COLORS.green}
            animate={{ width: resW * (1 - residuals[visibleLayers - 1]) }}
            transition={{ duration: 0.4 }}
          />
          <text x={resX + resW / 2} y={barAreaY + totalBarH + 28} textAnchor="middle"
            fontSize="8" fill={COLORS.green}>
            {t.quality}: {Math.round((1 - residuals[visibleLayers - 1]) * 100)}%
          </text>
        </motion.g>

        {/* Bottom descriptions */}
        <g transform={`translate(0, ${H - 65})`}>
          <rect x={30} y={0} width={220} height={24} rx={4}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={140} y={16} textAnchor="middle" fontSize="8" fontWeight="500"
            fill={COLORS.primary}>{t.l1Desc}</text>

          <rect x={270} y={0} width={220} height={24} rx={4}
            fill="#e8f5e9" stroke={COLORS.green} strokeWidth={1} />
          <text x={380} y={16} textAnchor="middle" fontSize="8" fontWeight="500"
            fill={COLORS.green}>{t.l23Desc}</text>

          <rect x={510} y={0} width={250} height={24} rx={4}
            fill="#f3e5f5" stroke={COLORS.purple} strokeWidth={1} />
          <text x={635} y={16} textAnchor="middle" fontSize="8" fontWeight="500"
            fill={COLORS.purple}>{t.l48Desc}</text>

          {/* Bitrate info */}
          <rect x={W / 2 - 170} y={32} width={340} height={22} rx={4}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={47} textAnchor="middle" fontSize="8" fontWeight="600"
            fill={COLORS.orange}>{t.bitrate}</text>
        </g>
      </svg>
    </div>
  );
}
