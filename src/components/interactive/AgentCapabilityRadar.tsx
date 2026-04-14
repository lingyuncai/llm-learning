// src/components/interactive/AgentCapabilityRadar.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type Dimension = 'functionCalling' | 'multiStep' | 'planning' | 'errorRecovery' | 'efficiency';

const DIMENSION_LABELS: Record<Dimension, { zh: string[]; en: string[] }> = {
  functionCalling: { zh: ['Function Calling', '准确率'], en: ['Function Calling', 'Accuracy'] },
  multiStep:       { zh: ['多步任务', '成功率'], en: ['Multi-Step', 'Success Rate'] },
  planning:        { zh: ['规划能力'], en: ['Planning', 'Ability'] },
  errorRecovery:   { zh: ['纠错恢复'], en: ['Error', 'Recovery'] },
  efficiency:      { zh: ['效率', '(步骤/token)'], en: ['Efficiency', '(Steps/Tokens)'] },
};

const DIMENSION_SOURCES: Record<Dimension, string> = {
  functionCalling: 'BFCL v3',
  multiStep: 'τ-bench / AgentBench',
  planning: 'GAIA / AgentBench',
  errorRecovery: 'τ-bench',
  efficiency: 'GAIA / SWE-bench',
};

const DIMENSIONS: Dimension[] = ['functionCalling', 'multiStep', 'planning', 'errorRecovery', 'efficiency'];

interface ModelScores {
  name: string;
  color: string;
  scores: Record<Dimension, number>;
}

const ALL_MODELS: ModelScores[] = [
  { name: 'GPT-4o', color: '#10a37f',
    scores: { functionCalling: 88, multiStep: 72, planning: 78, errorRecovery: 75, efficiency: 65 } },
  { name: 'Claude 3.5 Sonnet', color: '#d4a574',
    scores: { functionCalling: 85, multiStep: 75, planning: 80, errorRecovery: 78, efficiency: 70 } },
  { name: 'Gemini 1.5 Pro', color: '#4285f4',
    scores: { functionCalling: 82, multiStep: 70, planning: 76, errorRecovery: 72, efficiency: 68 } },
  { name: 'Llama 3.1 70B', color: '#0467df',
    scores: { functionCalling: 75, multiStep: 55, planning: 60, errorRecovery: 58, efficiency: 72 } },
  { name: 'Qwen 2.5 72B', color: '#6f42c1',
    scores: { functionCalling: 78, multiStep: 58, planning: 62, errorRecovery: 55, efficiency: 70 } },
];

const W = 500;
const H = 450;
const CX = W / 2;
const CY = 210;
const R = 150;
const LEVELS = [20, 40, 60, 80, 100];

function polarToCart(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function getAxisAngle(index: number): number {
  return (360 / DIMENSIONS.length) * index;
}

function polygonPoints(scores: Record<Dimension, number>): string {
  return DIMENSIONS.map((dim, i) => {
    const angle = getAxisAngle(i);
    const value = scores[dim] / 100;
    const [x, y] = polarToCart(angle, R * value);
    return `${x},${y}`;
  }).join(' ');
}

export default function AgentCapabilityRadar({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const [selected, setSelected] = useState<Set<string>>(
    new Set(['GPT-4o', 'Claude 3.5 Sonnet'])
  );
  const [hoveredVertex, setHoveredVertex] = useState<{ model: string; dim: Dimension; x: number; y: number } | null>(null);

  const selectedModels = useMemo(
    () => ALL_MODELS.filter(m => selected.has(m.name)),
    [selected]
  );

  const handleToggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size > 1) next.delete(name);
      } else {
        if (next.size < 3) next.add(name);
      }
      return next;
    });
  };

  // Concentric pentagons
  const gridPolygons = LEVELS.map(level => {
    const r = (level / 100) * R;
    return DIMENSIONS.map((_, i) => {
      const [x, y] = polarToCart(getAxisAngle(i), r);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div style={{
      fontFamily: FONTS.sans,
      background: COLORS.bgAlt,
      borderRadius: 12,
      border: `1px solid ${COLORS.light}`,
      padding: '20px 16px 16px',
      maxWidth: W + 32,
      margin: '24px auto',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 15, fontWeight: 600, color: COLORS.dark }}>
        {t('Agent 能力雷达图', 'Agent Capability Radar Chart')}
      </div>

      {/* Model checkboxes */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 16,
      }}>
        {ALL_MODELS.map(model => {
          const isSelected = selected.has(model.name);
          const disabled = !isSelected && selected.size >= 3;
          return (
            <label
              key={model.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                fontSize: 13,
                color: COLORS.dark,
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={disabled}
                onChange={() => handleToggle(model.name)}
                style={{ accentColor: model.color }}
              />
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: model.color, display: 'inline-block',
              }} />
              {model.name}
            </label>
          );
        })}
        <span style={{ fontSize: 11, color: COLORS.mid, alignSelf: 'center' }}>
          ({t('最多选 3 个', 'max 3')})
        </span>
      </div>

      {/* SVG Radar */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* Grid pentagons */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke={COLORS.light}
            strokeWidth={i === gridPolygons.length - 1 ? 1.5 : 0.8}
          />
        ))}

        {/* Axes */}
        {DIMENSIONS.map((_, i) => {
          const [x, y] = polarToCart(getAxisAngle(i), R);
          return (
            <line
              key={i}
              x1={CX} y1={CY} x2={x} y2={y}
              stroke={COLORS.light}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Level labels */}
        {LEVELS.map(level => {
          const [x, y] = polarToCart(getAxisAngle(0), (level / 100) * R);
          return (
            <text
              key={level}
              x={x + 4} y={y - 3}
              fontSize={9}
              fill={COLORS.mid}
              fontFamily={FONTS.mono}
            >
              {level}
            </text>
          );
        })}

        {/* Axis labels with tspan for multi-line */}
        {DIMENSIONS.map((dim, i) => {
          const angle = getAxisAngle(i);
          const labelR = R + 28;
          const [x, y] = polarToCart(angle, labelR);
          const labels = DIMENSION_LABELS[dim][locale];

          // Adjust text-anchor based on position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (angle > 30 && angle < 150) textAnchor = 'start';
          if (angle > 210 && angle < 330) textAnchor = 'end';

          // Adjust vertical offset for top/bottom labels
          const dy = angle === 0 ? -8 : angle > 150 && angle < 210 ? 8 : 0;

          return (
            <text
              key={dim}
              x={x} y={y + dy}
              textAnchor={textAnchor}
              fontSize={11}
              fontWeight={500}
              fill={COLORS.dark}
              fontFamily={FONTS.sans}
            >
              {labels.map((line, li) => (
                <tspan key={li} x={x} dy={li === 0 ? 0 : 14}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* Model polygons */}
        <AnimatePresence>
          {selectedModels.map(model => (
            <motion.polygon
              key={model.name}
              points={polygonPoints(model.scores)}
              fill={model.color}
              fillOpacity={0.12}
              stroke={model.color}
              strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </AnimatePresence>

        {/* Vertex dots (interactive) */}
        {selectedModels.map(model =>
          DIMENSIONS.map((dim, i) => {
            const angle = getAxisAngle(i);
            const value = model.scores[dim] / 100;
            const [x, y] = polarToCart(angle, R * value);
            return (
              <circle
                key={`${model.name}-${dim}`}
                cx={x} cy={y} r={5}
                fill={model.color}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredVertex({ model: model.name, dim, x, y })}
                onMouseLeave={() => setHoveredVertex(null)}
              />
            );
          })
        )}

        {/* Tooltip */}
        {hoveredVertex && (() => {
          const model = ALL_MODELS.find(m => m.name === hoveredVertex.model)!;
          const score = model.scores[hoveredVertex.dim];
          const dimLabel = DIMENSION_LABELS[hoveredVertex.dim][locale].join(' ');
          const source = DIMENSION_SOURCES[hoveredVertex.dim];

          // Position tooltip away from edges
          const tooltipW = 160;
          const tooltipH = 52;
          let tx = hoveredVertex.x + 12;
          let ty = hoveredVertex.y - tooltipH - 8;
          if (tx + tooltipW > W - 10) tx = hoveredVertex.x - tooltipW - 12;
          if (ty < 5) ty = hoveredVertex.y + 16;

          return (
            <g>
              <rect
                x={tx} y={ty}
                width={tooltipW} height={tooltipH}
                rx={6}
                fill={COLORS.dark}
                fillOpacity={0.92}
              />
              <text x={tx + 8} y={ty + 17} fontSize={11} fontWeight={600} fill="#fff" fontFamily={FONTS.sans}>
                {model.name}: {score}
              </text>
              <text x={tx + 8} y={ty + 31} fontSize={10} fill="#ccc" fontFamily={FONTS.sans}>
                {dimLabel}
              </text>
              <text x={tx + 8} y={ty + 44} fontSize={9} fill="#999" fontFamily={FONTS.mono}>
                {t('来源', 'Source')}: {source}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        {selectedModels.map((model, i) => {
          const lx = CX - (selectedModels.length * 80) / 2 + i * 80;
          const ly = H - 40;
          return (
            <g key={model.name}>
              <rect x={lx} y={ly} width={12} height={12} rx={2} fill={model.color} />
              <text x={lx + 16} y={ly + 10} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.sans}>
                {model.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Caption */}
      <div style={{
        textAlign: 'center', fontSize: 11, color: COLORS.mid, marginTop: 8,
        lineHeight: 1.5,
      }}>
        {t(
          '数据来源：BFCL v3、GAIA、τ-bench、AgentBench 等排行榜，经归一化至 0-100 分。仅供定性比较，不同 benchmark 量纲不同。',
          'Sources: BFCL v3, GAIA, τ-bench, AgentBench leaderboards, normalized to 0-100. For qualitative comparison only — different benchmarks use different scales.'
        )}
      </div>
    </div>
  );
}
