import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

type VectorWidth = 1 | 2 | 4;

interface VectorConfig {
  width: VectorWidth;
  label: string;
  bytesPerLoad: number;
  loadsNeeded: number;
  instrReduction: string;
  efficiency: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const CONFIGS: VectorConfig[] = [
  { width: 1, label: 'Scalar (float)', bytesPerLoad: 4, loadsNeeded: 16, instrReduction: '1x (baseline)', efficiency: 0.25 },
  { width: 2, label: 'float2 (8B)', bytesPerLoad: 8, loadsNeeded: 8, instrReduction: '2x fewer loads', efficiency: 0.5 },
  { width: 4, label: 'float4 (16B)', bytesPerLoad: 16, loadsNeeded: 4, instrReduction: '4x fewer loads', efficiency: 1.0 },
];

const NUM_ELEMENTS = 16;

/* ─── Colors for load groups ─── */

function getGroupColor(groupIdx: number, totalGroups: number): string {
  if (totalGroups <= 4) return HEAD_COLORS[groupIdx % HEAD_COLORS.length];
  if (totalGroups <= 8) {
    const palette = [HEAD_COLORS[0], HEAD_COLORS[1], HEAD_COLORS[2], HEAD_COLORS[3], HEAD_COLORS[4], HEAD_COLORS[5], HEAD_COLORS[6], HEAD_COLORS[7]];
    return palette[groupIdx % palette.length];
  }
  // 16 loads: cycle through a rainbow
  const hue = (groupIdx / totalGroups) * 360;
  return `hsl(${hue}, 60%, 50%)`;
}

/* ─── Component ─── */

export default function VectorizationDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Vectorization：标量 vs 向量化内存访问',
      scalarBtn: 'Scalar',
      float2Btn: 'float2',
      float4Btn: 'float4',
      memoryStrip: '内存布局（16 个 FP32 元素，64 字节）',
      loadLabel: 'Load',
      codeComparison: '代码对比',
      scalarCode: '标量代码',
      vectorCode: '向量化代码',
      metrics: '效率指标',
      loadsNeeded: 'Load 指令数',
      bytesPerInstr: '每指令字节数',
      bandwidthUtil: '带宽利用率',
      fewer: '更少',
      note: '注：向量化减少的是 load 指令条数，不是 32B sector transactions',
    },
    en: {
      title: 'Vectorization: Scalar vs Vectorized Memory Access',
      scalarBtn: 'Scalar',
      float2Btn: 'float2',
      float4Btn: 'float4',
      memoryStrip: 'Memory Layout (16 FP32 elements, 64 bytes)',
      loadLabel: 'Load',
      codeComparison: 'Code Comparison',
      scalarCode: 'Scalar Code',
      vectorCode: 'Vectorized Code',
      metrics: 'Efficiency Metrics',
      loadsNeeded: 'Load Instructions',
      bytesPerInstr: 'Bytes per Instruction',
      bandwidthUtil: 'Bandwidth Utilization',
      fewer: 'fewer',
      note: 'Note: vectorization reduces load instruction count, not 32-byte sector transactions',
    },
  }[locale]!;

  const [widthIdx, setWidthIdx] = useState(0);
  const config = CONFIGS[widthIdx];

  // Memory cell layout
  const cellW = 40;
  const cellH = 36;
  const cellGap = 3;
  const stripX = 50;
  const stripY = 100;

  // Group cells by vector width
  const groups: number[][] = [];
  for (let i = 0; i < NUM_ELEMENTS; i += config.width) {
    const group: number[] = [];
    for (let j = 0; j < config.width && i + j < NUM_ELEMENTS; j++) {
      group.push(i + j);
    }
    groups.push(group);
  }

  // Code examples
  const scalarCode = [
    'for i in range(16):',
    '  x = tl.load(ptr + i)',
    '  y = x * alpha + beta',
    '  tl.store(out + i, y)',
  ];

  const vectorCode: Record<VectorWidth, string[]> = {
    1: [
      '# Scalar (no vectorization)',
      'x = tl.load(ptr + offset)',
      'y = x * alpha + beta',
      'tl.store(out + offset, y)',
    ],
    2: [
      '# float2: 2 elements per load',
      'x = tl.load(ptr + offset,',
      '           width=2)  # 8B',
      'y = x * alpha + beta',
    ],
    4: [
      '# float4: 4 elements per load',
      'x = tl.load(ptr + offset,',
      '           width=4)  # 16B',
      'y = x * alpha + beta',
    ],
  };

  // Metric bar dimensions
  const metricX = 50;
  const metricY = 365;
  const metricBarW = 600;
  const metricBarH = 16;
  const metricSpacing = 28;

  return (
    <div className="my-6">
      {/* Title and vector width selector */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="text-sm font-semibold" style={{ color: COLORS.dark }}>
          {t.title}
        </h4>
        <div className="flex gap-1.5">
          {CONFIGS.map((c, i) => (
            <button
              key={c.width}
              onClick={() => setWidthIdx(i)}
              className="px-3 py-1.5 text-xs rounded-md transition-colors font-medium"
              style={{
                backgroundColor: i === widthIdx ? COLORS.primary : COLORS.bgAlt,
                color: i === widthIdx ? '#fff' : COLORS.dark,
                border: `1px solid ${i === widthIdx ? COLORS.primary : COLORS.light}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={widthIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 800 460" className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            {/* ─── Upper Section: Memory Access Pattern ─── */}
            <text x={stripX} y={78} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {t.memoryStrip}
            </text>

            {/* Load arrows and labels above cells */}
            {groups.map((group, gi) => {
              const startX = stripX + group[0] * (cellW + cellGap);
              const endX = stripX + (group[group.length - 1] + 1) * (cellW + cellGap) - cellGap;
              const midX = (startX + endX) / 2;
              const color = getGroupColor(gi, groups.length);
              const arrowY = stripY - 20;

              // Only show labels for up to 8 loads to avoid clutter
              if (gi >= 8) return null;

              return (
                <motion.g
                  key={`arrow-${gi}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: gi * 0.05 }}
                >
                  {/* Load label */}
                  <text
                    x={midX}
                    y={arrowY - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill={color}
                  >
                    {t.loadLabel} {gi + 1}
                  </text>
                  {/* Arrow down to cells */}
                  <line
                    x1={midX}
                    y1={arrowY}
                    x2={midX}
                    y2={stripY - 2}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                  />
                  {/* Arrow head */}
                  <polygon
                    points={`${midX - 3},${stripY - 5} ${midX + 3},${stripY - 5} ${midX},${stripY - 1}`}
                    fill={color}
                    fillOpacity={0.6}
                  />
                  {/* Bracket above cells */}
                  {config.width > 1 && (
                    <>
                      <line x1={startX} y1={arrowY + 2} x2={startX} y2={arrowY + 6} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                      <line x1={endX} y1={arrowY + 2} x2={endX} y2={arrowY + 6} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                      <line x1={startX} y1={arrowY + 4} x2={endX} y2={arrowY + 4} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                    </>
                  )}
                </motion.g>
              );
            })}

            {/* "..." indicator if >8 loads */}
            {groups.length > 8 && (
              <text
                x={stripX + 8 * (cellW + cellGap) + cellW / 2}
                y={stripY - 26}
                textAnchor="middle"
                fontSize="10"
                fill={COLORS.mid}
              >
                ...+{groups.length - 8} more loads
              </text>
            )}

            {/* Memory cells */}
            {Array.from({ length: NUM_ELEMENTS }).map((_, i) => {
              const groupIdx = Math.floor(i / config.width);
              const color = getGroupColor(groupIdx, groups.length);
              const x = stripX + i * (cellW + cellGap);

              return (
                <motion.g
                  key={`cell-${i}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                >
                  <rect
                    x={x}
                    y={stripY}
                    width={cellW}
                    height={cellH}
                    rx={4}
                    fill={color}
                    fillOpacity={0.15}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                  />
                  <text
                    x={x + cellW / 2}
                    y={stripY + 14}
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily={FONTS.mono}
                    fill={color}
                    fontWeight="600"
                  >
                    [{i}]
                  </text>
                  <text
                    x={x + cellW / 2}
                    y={stripY + 27}
                    textAnchor="middle"
                    fontSize="7"
                    fill={COLORS.mid}
                  >
                    4B
                  </text>
                </motion.g>
              );
            })}

            {/* Group brackets below cells */}
            {config.width > 1 && groups.map((group, gi) => {
              const startX = stripX + group[0] * (cellW + cellGap);
              const endX = stripX + (group[group.length - 1] + 1) * (cellW + cellGap) - cellGap;
              const midX = (startX + endX) / 2;
              const color = getGroupColor(gi, groups.length);
              const bracketY = stripY + cellH + 4;

              return (
                <g key={`bracket-${gi}`}>
                  <line x1={startX} y1={bracketY} x2={startX} y2={bracketY + 6} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                  <line x1={endX} y1={bracketY} x2={endX} y2={bracketY + 6} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                  <line x1={startX} y1={bracketY + 4} x2={endX} y2={bracketY + 4} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                  <text x={midX} y={bracketY + 16} textAnchor="middle" fontSize="7" fill={color} fontWeight="500">
                    {config.bytesPerLoad}B
                  </text>
                </g>
              );
            })}

            {/* ─── Middle Section: Code Comparison ─── */}
            <text x={50} y={195} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {t.codeComparison}
            </text>

            {/* Scalar code box */}
            <rect x={50} y={205} width={340} height={90} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={65} y={220} fontSize="9" fontWeight="600" fill={COLORS.mid}>
              {t.scalarCode}
            </text>
            {scalarCode.map((line, i) => (
              <text
                key={`sc-${i}`}
                x={65}
                y={236 + i * 14}
                fontSize="10"
                fontFamily={FONTS.mono}
                fill={COLORS.dark}
                fillOpacity={widthIdx === 0 ? 1 : 0.4}
              >
                {line}
              </text>
            ))}

            {/* Vectorized code box */}
            <rect
              x={410}
              y={205}
              width={340}
              height={90}
              rx={6}
              fill={widthIdx > 0 ? COLORS.primary : COLORS.bgAlt}
              fillOpacity={widthIdx > 0 ? 0.04 : 1}
              stroke={widthIdx > 0 ? COLORS.primary : COLORS.light}
              strokeWidth={widthIdx > 0 ? 1.5 : 1}
              strokeOpacity={widthIdx > 0 ? 0.4 : 1}
            />
            <text x={425} y={220} fontSize="9" fontWeight="600" fill={widthIdx > 0 ? COLORS.primary : COLORS.mid}>
              {t.vectorCode}
            </text>
            {vectorCode[config.width].map((line, i) => (
              <text
                key={`vc-${i}`}
                x={425}
                y={236 + i * 14}
                fontSize="10"
                fontFamily={FONTS.mono}
                fill={COLORS.dark}
                fillOpacity={widthIdx > 0 ? 1 : 0.4}
              >
                {line}
              </text>
            ))}

            {/* ─── Lower Section: Efficiency Metrics ─── */}
            <text x={metricX} y={metricY - 12} fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {t.metrics}
            </text>

            {/* Metric 1: Load instructions needed */}
            <text x={metricX} y={metricY + 10} fontSize="10" fill={COLORS.dark} fontWeight="500">
              {t.loadsNeeded}: {config.loadsNeeded}
            </text>
            <rect x={metricX + 180} y={metricY} width={metricBarW - 180} height={metricBarH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
            <motion.rect
              x={metricX + 180}
              y={metricY}
              height={metricBarH}
              rx={3}
              fill={COLORS.orange}
              fillOpacity={0.5}
              animate={{ width: (config.loadsNeeded / 16) * (metricBarW - 180) }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            <text
              x={metricX + 180 + (config.loadsNeeded / 16) * (metricBarW - 180) + 5}
              y={metricY + 12}
              fontSize="9"
              fontWeight="600"
              fill={COLORS.orange}
            >
              {config.instrReduction}
            </text>

            {/* Metric 2: Bytes per instruction */}
            <text x={metricX} y={metricY + 10 + metricSpacing} fontSize="10" fill={COLORS.dark} fontWeight="500">
              {t.bytesPerInstr}: {config.bytesPerLoad}B
            </text>
            <rect x={metricX + 180} y={metricY + metricSpacing} width={metricBarW - 180} height={metricBarH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
            <motion.rect
              x={metricX + 180}
              y={metricY + metricSpacing}
              height={metricBarH}
              rx={3}
              fill={COLORS.primary}
              fillOpacity={0.5}
              animate={{ width: (config.bytesPerLoad / 16) * (metricBarW - 180) }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            <text
              x={metricX + 180 + (config.bytesPerLoad / 16) * (metricBarW - 180) + 5}
              y={metricY + metricSpacing + 12}
              fontSize="9"
              fontWeight="600"
              fill={COLORS.primary}
            >
              {config.bytesPerLoad}B / instr
            </text>

            {/* Metric 3: Bandwidth utilization */}
            <text x={metricX} y={metricY + 10 + metricSpacing * 2} fontSize="10" fill={COLORS.dark} fontWeight="500">
              {t.bandwidthUtil}: {(config.efficiency * 100).toFixed(0)}%
            </text>
            <rect x={metricX + 180} y={metricY + metricSpacing * 2} width={metricBarW - 180} height={metricBarH} rx={3} fill={COLORS.light} fillOpacity={0.5} />
            <motion.rect
              x={metricX + 180}
              y={metricY + metricSpacing * 2}
              height={metricBarH}
              rx={3}
              fill={COLORS.green}
              fillOpacity={0.5}
              animate={{ width: config.efficiency * (metricBarW - 180) }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            <text
              x={metricX + 180 + config.efficiency * (metricBarW - 180) + 5}
              y={metricY + metricSpacing * 2 + 12}
              fontSize="9"
              fontWeight="600"
              fill={COLORS.green}
            >
              {(config.efficiency * 100).toFixed(0)}%
            </text>

            {/* Note */}
            <text x={metricX} y={metricY + metricSpacing * 3 + 8} fontSize="9" fill={COLORS.mid} fontStyle="italic">
              {t.note}
            </text>
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
