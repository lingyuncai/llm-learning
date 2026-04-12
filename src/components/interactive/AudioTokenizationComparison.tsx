import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

function Box({ x, y, w, h, label, sublabel, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 6 : h / 2 + 1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle"
          dominantBaseline="middle" fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function ArrowDown({ cx, y1, y2 }: { cx: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={cx} y1={y1} x2={cx} y2={y2 - 4} stroke={COLORS.mid} strokeWidth={1.5} />
      <polygon points={`${cx - 4},${y2 - 6} ${cx + 4},${y2 - 6} ${cx},${y2}`} fill={COLORS.mid} />
    </g>
  );
}

// Mini waveform drawing
function Waveform({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const mid = y + h / 2;
  const points: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const px = x + (i / 60) * w;
    const amp = Math.sin(i * 0.5) * Math.sin(i * 0.15) * (h * 0.35);
    points.push(`${px},${mid - amp}`);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
      <polyline points={points.join(' ')} fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
    </g>
  );
}

// Mini heatmap grid
function HeatmapGrid({ x, y, w, h, cols, rows, colorFn }: {
  x: number; y: number; w: number; h: number;
  cols: number; rows: number;
  colorFn: (r: number, c: number) => string;
}) {
  const cw = w / cols;
  const ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect key={`${r}-${c}`}
          x={x + c * cw} y={y + r * ch} width={cw} height={ch}
          fill={colorFn(r, c)} stroke={COLORS.bg} strokeWidth={0.3} />
      );
    }
  }
  return <g>{cells}</g>;
}

// Discrete token grid (codebook matrix)
function TokenGrid({ x, y, w, h, layers, steps }: {
  x: number; y: number; w: number; h: number;
  layers: number; steps: number;
}) {
  const cw = w / steps;
  const ch = h / layers;
  const cells: React.ReactNode[] = [];
  const palette = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red];
  let seed = 7;
  const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let l = 0; l < layers; l++) {
    for (let s = 0; s < steps; s++) {
      const idx = Math.floor(rng() * palette.length);
      cells.push(
        <rect key={`${l}-${s}`}
          x={x + s * cw} y={y + l * ch} width={cw - 1} height={ch - 1} rx={2}
          fill={palette[idx]} opacity={0.6 + rng() * 0.4} />
      );
    }
  }
  return <g>{cells}</g>;
}

export default function AudioTokenizationComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '音频 Tokenization 两条路',
      spectrogram: '频谱图路线',
      codec: '神经编解码路线',
      waveform: '原始波形',
      stft: 'STFT',
      melFilter: 'Mel 滤波器组',
      melSpec: 'Mel 频谱图',
      encoder: 'EnCodec 编码器',
      rvq: 'RVQ 量化',
      tokenGrid: '离散 Token 矩阵',
      continuous: '连续',
      discrete: '离散',
      specDesc: '连续浮点值',
      codecDesc: '离散码本索引',
      resolution: '分辨率',
      specRes: '80 mel bins × T frames',
      codecRes: '8 codebooks × T steps',
      compression: '压缩比',
      specComp: '~10x',
      codecComp: '~300x (6kbps)',
      feature: '特征',
      specLabel: '频谱图',
      codecLabel: '编解码',
      representation: '表示',
      timeAxis: '时间',
      freqAxis: '频率 / 层',
    },
    en: {
      title: 'Two Paths to Audio Tokenization',
      spectrogram: 'Spectrogram Path',
      codec: 'Neural Codec Path',
      waveform: 'Raw Waveform',
      stft: 'STFT',
      melFilter: 'Mel Filterbank',
      melSpec: 'Mel Spectrogram',
      encoder: 'EnCodec Encoder',
      rvq: 'RVQ',
      tokenGrid: 'Discrete Token Matrix',
      continuous: 'Continuous',
      discrete: 'Discrete',
      specDesc: 'Continuous floats',
      codecDesc: 'Discrete codebook indices',
      resolution: 'Resolution',
      specRes: '80 mel bins × T frames',
      codecRes: '8 codebooks × T steps',
      compression: 'Compression',
      specComp: '~10x',
      codecComp: '~300x (6kbps)',
      feature: 'Feature',
      specLabel: 'Spectrogram',
      codecLabel: 'Codec',
      representation: 'Representation',
      timeAxis: 'Time',
      freqAxis: 'Freq / Layer',
    },
  }[locale]!;

  const [activeTab, setActiveTab] = useState<'spectrogram' | 'codec'>('spectrogram');

  // Mel spectrogram color function - mimic speech harmonics
  const melColor = (r: number, c: number) => {
    const energy = Math.exp(-r * 0.15) * (0.5 + 0.5 * Math.sin(c * 0.4 + r * 0.3));
    const intensity = Math.floor(energy * 220 + 35);
    return `rgb(${intensity}, ${Math.floor(intensity * 0.4)}, ${Math.floor(intensity * 0.2)})`;
  };

  const leftX = 50, rightX = 420;
  const pipeW = 150, pipeH = 36;

  return (
    <div className="my-6">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-3">
        {(['spectrogram', 'codec'] as const).map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {tab === 'spectrogram' ? t.spectrogram : t.codec}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.dark}>{t.title}</text>

        {/* Spectrogram path (left) */}
        <motion.g animate={{ opacity: activeTab === 'spectrogram' ? 1 : 0.2 }}
          transition={{ duration: 0.3 }}>
          <text x={leftX + pipeW / 2} y={52} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.primary}>{t.spectrogram}</text>

          <Waveform x={leftX} y={65} w={pipeW} h={36} />
          <text x={leftX + pipeW / 2} y={78} textAnchor="middle" fontSize="8"
            fill={COLORS.dark}>{t.waveform}</text>

          <ArrowDown cx={leftX + pipeW / 2} y1={101} y2={118} />
          <Box x={leftX} y={118} w={pipeW} h={pipeH} label={t.stft}
            fill={COLORS.valid} stroke={COLORS.primary} />

          <ArrowDown cx={leftX + pipeW / 2} y1={154} y2={170} />
          <Box x={leftX} y={170} w={pipeW} h={pipeH} label={t.melFilter}
            fill={COLORS.valid} stroke={COLORS.primary} />

          <ArrowDown cx={leftX + pipeW / 2} y1={206} y2={222} />

          {/* Mel spectrogram heatmap */}
          <text x={leftX + pipeW / 2} y={234} textAnchor="middle" fontSize="9"
            fontWeight="600" fill={COLORS.primary}>{t.melSpec}</text>
          <HeatmapGrid x={leftX + 5} y={242} w={pipeW - 10} h={100}
            cols={30} rows={12} colorFn={melColor} />
          <text x={leftX} y={355} fontSize="7" fill={COLORS.mid}>{t.timeAxis} →</text>
          <text x={leftX - 4} y={290} fontSize="7" fill={COLORS.mid}
            transform={`rotate(-90, ${leftX - 4}, 290)`}>{t.freqAxis}</text>
        </motion.g>

        {/* Codec path (right) */}
        <motion.g animate={{ opacity: activeTab === 'codec' ? 1 : 0.2 }}
          transition={{ duration: 0.3 }}>
          <text x={rightX + pipeW / 2} y={52} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.green}>{t.codec}</text>

          <Waveform x={rightX} y={65} w={pipeW} h={36} />
          <text x={rightX + pipeW / 2} y={78} textAnchor="middle" fontSize="8"
            fill={COLORS.dark}>{t.waveform}</text>

          <ArrowDown cx={rightX + pipeW / 2} y1={101} y2={118} />
          <Box x={rightX} y={118} w={pipeW} h={pipeH} label={t.encoder}
            fill="#e8f5e9" stroke={COLORS.green} />

          <ArrowDown cx={rightX + pipeW / 2} y1={154} y2={170} />
          <Box x={rightX} y={170} w={pipeW} h={pipeH} label={t.rvq}
            fill="#e8f5e9" stroke={COLORS.green} />

          <ArrowDown cx={rightX + pipeW / 2} y1={206} y2={222} />

          {/* Discrete token grid */}
          <text x={rightX + pipeW / 2} y={234} textAnchor="middle" fontSize="9"
            fontWeight="600" fill={COLORS.green}>{t.tokenGrid}</text>
          <TokenGrid x={rightX + 5} y={242} w={pipeW - 10} h={100}
            layers={8} steps={20} />
          <text x={rightX} y={355} fontSize="7" fill={COLORS.mid}>{t.timeAxis} →</text>
          <text x={rightX - 4} y={290} fontSize="7" fill={COLORS.mid}
            transform={`rotate(-90, ${rightX - 4}, 290)`}>{t.freqAxis}</text>
        </motion.g>

        {/* VS divider */}
        <text x={W / 2} y={200} textAnchor="middle" fontSize="16" fontWeight="800"
          fill={COLORS.light}>VS</text>

        {/* Comparison table at bottom */}
        <g transform="translate(80, 380)">
          {/* Header row */}
          <rect x={0} y={0} width={640} height={28} rx={4} fill={COLORS.dark} />
          <text x={120} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.feature}</text>
          <text x={320} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.specLabel}</text>
          <text x={520} y={18} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.bg}>{t.codecLabel}</text>

          {/* Row 1: Representation */}
          <rect x={0} y={30} width={640} height={26} rx={0} fill={COLORS.bgAlt} />
          <text x={120} y={47} textAnchor="middle" fontSize="9" fill={COLORS.dark}>{t.representation}</text>
          <text x={320} y={47} textAnchor="middle" fontSize="9" fill={COLORS.primary}>{t.specDesc}</text>
          <text x={520} y={47} textAnchor="middle" fontSize="9" fill={COLORS.green}>{t.codecDesc}</text>

          {/* Row 2: Resolution */}
          <rect x={0} y={58} width={640} height={26} rx={0} fill={COLORS.bg} />
          <text x={120} y={75} textAnchor="middle" fontSize="9" fill={COLORS.dark}>{t.resolution}</text>
          <text x={320} y={75} textAnchor="middle" fontSize="9" fill={COLORS.primary}>{t.specRes}</text>
          <text x={520} y={75} textAnchor="middle" fontSize="9" fill={COLORS.green}>{t.codecRes}</text>

          {/* Row 3: Compression */}
          <rect x={0} y={88} width={640} height={26} rx={4} fill={COLORS.bgAlt} />
          <text x={120} y={105} textAnchor="middle" fontSize="9" fill={COLORS.dark}>{t.compression}</text>
          <text x={320} y={105} textAnchor="middle" fontSize="9" fill={COLORS.primary}>{t.specComp}</text>
          <text x={520} y={105} textAnchor="middle" fontSize="9" fill={COLORS.green}>{t.codecComp}</text>
        </g>
      </svg>
    </div>
  );
}
