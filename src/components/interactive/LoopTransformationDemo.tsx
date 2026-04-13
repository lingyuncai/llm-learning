import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

type Category = 'reorder' | 'partition' | 'restructure';

interface TransformData {
  id: string;
  name: { zh: string; en: string };
  category: Category;
  before: string;
  after: string;
  localityEffect: {
    before: { l1Hits: number; l1Misses: number };
    after: { l1Hits: number; l1Misses: number };
  };
}

/* ─── Data ─── */

const TRANSFORMS: TransformData[] = [
  {
    id: 'interchange',
    name: { zh: '循环交换', en: 'Loop Interchange' },
    category: 'reorder',
    before: `for (i=0; i<M; i++)\n  for (j=0; j<N; j++)\n    B[j][i] = A[j][i]*2; // stride-N`,
    after: `for (j=0; j<N; j++)\n  for (i=0; i<M; i++)\n    B[j][i] = A[j][i]*2; // stride-1`,
    localityEffect: { before: { l1Hits: 25, l1Misses: 75 }, after: { l1Hits: 90, l1Misses: 10 } },
  },
  {
    id: 'tiling',
    name: { zh: 'Tiling', en: 'Tiling' },
    category: 'partition',
    before: `for (i=0; i<1024; i++)\n  for (j=0; j<1024; j++)\n    C[i][j] += A[i][k]*B[k][j];`,
    after: `for (ii=0; ii<1024; ii+=32)\n  for (jj=0; jj<1024; jj+=32)\n    for (i=ii; i<ii+32; i++)\n      for (j=jj; j<jj+32; j++)\n        C[i][j] += ...;`,
    localityEffect: { before: { l1Hits: 10, l1Misses: 90 }, after: { l1Hits: 85, l1Misses: 15 } },
  },
  {
    id: 'unroll',
    name: { zh: '循环展开', en: 'Loop Unrolling' },
    category: 'restructure',
    before: `for (i=0; i<N; i++)\n  sum += a[i];`,
    after: `for (i=0; i<N; i+=4) {\n  sum += a[i]; sum += a[i+1];\n  sum += a[i+2]; sum += a[i+3];\n}`,
    localityEffect: { before: { l1Hits: 95, l1Misses: 5 }, after: { l1Hits: 98, l1Misses: 2 } },
  },
  {
    id: 'fusion',
    name: { zh: '循环融合', en: 'Loop Fusion' },
    category: 'restructure',
    before: `for (i=0; i<N; i++)\n  B[i] = A[i]*2;\nfor (i=0; i<N; i++)\n  C[i] = B[i]+1;`,
    after: `for (i=0; i<N; i++) {\n  B[i] = A[i]*2;\n  C[i] = B[i]+1; // B in register\n}`,
    localityEffect: { before: { l1Hits: 50, l1Misses: 50 }, after: { l1Hits: 95, l1Misses: 5 } },
  },
];

const CATEGORIES: { id: Category; label: { zh: string; en: string } }[] = [
  { id: 'reorder', label: { zh: '重排序', en: 'Reordering' } },
  { id: 'partition', label: { zh: '分区', en: 'Partitioning' } },
  { id: 'restructure', label: { zh: '重构', en: 'Restructuring' } },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 500;
const CODE_PANEL_Y = 100;
const CODE_PANEL_W = 350;
const CODE_PANEL_H = 200;
const CHART_Y = 330;
const CHART_H = 120;
const CHART_W = 700;

/* ─── Component ─── */

export default function LoopTransformationDemo({ locale = 'zh' }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('reorder');
  const [selectedTransform, setSelectedTransform] = useState<string>('interchange');

  const t = {
    zh: {
      title: '循环变换实战：Cache Locality 优化',
      before: '变换前',
      after: '变换后',
      cacheLocality: 'Cache 局部性统计',
      l1Hits: 'L1 命中',
      l1Misses: 'L1 缺失',
      selectTransform: '选择变换',
    },
    en: {
      title: 'Loop Transformations: Cache Locality Optimization',
      before: 'Before',
      after: 'After',
      cacheLocality: 'Cache Locality Statistics',
      l1Hits: 'L1 Hits',
      l1Misses: 'L1 Misses',
      selectTransform: 'Select Transformation',
    },
  }[locale]!;

  const currentTransforms = TRANSFORMS.filter(tr => tr.category === selectedCategory);
  const currentTransform = TRANSFORMS.find(tr => tr.id === selectedTransform) || currentTransforms[0];

  const renderCodePanel = (code: string, x: number, label: string, color: string) => {
    const lines = code.split('\n');
    return (
      <g>
        <rect x={x} y={CODE_PANEL_Y} width={CODE_PANEL_W} height={CODE_PANEL_H} rx={6} fill="#1e1e2e" stroke={color} strokeWidth={1.5} strokeOpacity={0.4} />
        <rect x={x} y={CODE_PANEL_Y} width={CODE_PANEL_W} height={26} rx={6} fill={color} fillOpacity={0.15} />
        <rect x={x} y={CODE_PANEL_Y + 12} width={CODE_PANEL_W} height={14} fill={color} fillOpacity={0.15} />
        <text x={x + CODE_PANEL_W / 2} y={CODE_PANEL_Y + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
          {label}
        </text>
        {lines.map((line, idx) => (
          <text
            key={idx}
            x={x + 12}
            y={CODE_PANEL_Y + 46 + idx * 18}
            fontSize="10"
            fill="#ccc"
            style={{ fontFamily: FONTS.mono }}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  const renderCacheChart = () => {
    const barW = 140;
    const barH = 30;
    const gap = 40;
    const startX = (W - (barW * 2 + gap)) / 2;

    const renderBar = (x: number, y: number, hits: number, misses: number, label: string) => {
      const total = hits + misses;
      const hitsWidth = (hits / total) * barW;
      const missesWidth = (misses / total) * barW;

      return (
        <g>
          <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {label}
          </text>
          <motion.rect
            x={x}
            y={y}
            width={hitsWidth}
            height={barH}
            fill={COLORS.green}
            initial={{ width: 0 }}
            animate={{ width: hitsWidth }}
            transition={{ duration: 0.5 }}
          />
          <motion.rect
            x={x + hitsWidth}
            y={y}
            width={missesWidth}
            height={barH}
            fill={COLORS.red}
            initial={{ width: 0 }}
            animate={{ width: missesWidth }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <text x={x + hitsWidth / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
            {hits}%
          </text>
          <text x={x + hitsWidth + missesWidth / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
            {misses}%
          </text>
        </g>
      );
    };

    return (
      <g>
        <text x={W / 2} y={CHART_Y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.cacheLocality}
        </text>
        {renderBar(startX, CHART_Y + 10, currentTransform.localityEffect.before.l1Hits, currentTransform.localityEffect.before.l1Misses, t.before)}
        {renderBar(startX + barW + gap, CHART_Y + 10, currentTransform.localityEffect.after.l1Hits, currentTransform.localityEffect.after.l1Misses, t.after)}

        {/* Legend */}
        <g transform={`translate(${W / 2 - 80}, ${CHART_Y + 60})`}>
          <rect x={0} y={0} width={14} height={14} fill={COLORS.green} />
          <text x={18} y={10} fontSize="10" fill={COLORS.dark}>
            {t.l1Hits}
          </text>
          <rect x={90} y={0} width={14} height={14} fill={COLORS.red} />
          <text x={108} y={10} fontSize="10" fill={COLORS.dark}>
            {t.l1Misses}
          </text>
        </g>

        {/* Arrow */}
        <defs>
          <marker id="improvement-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,1 L9,4 L0,7" fill={COLORS.green} />
          </marker>
        </defs>
        <line
          x1={startX + barW + 10}
          y1={CHART_Y + 25}
          x2={startX + barW + gap - 10}
          y2={CHART_Y + 25}
          stroke={COLORS.green}
          strokeWidth={2}
          markerEnd="url(#improvement-arrow)"
        />
      </g>
    );
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Category tabs */}
        <g transform="translate(150, 45)">
          {CATEGORIES.map((cat, idx) => {
            const active = cat.id === selectedCategory;
            return (
              <g key={cat.id} transform={`translate(${idx * 170}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={160}
                  height={32}
                  rx={6}
                  fill={active ? COLORS.primary : COLORS.bgAlt}
                  stroke={active ? COLORS.primary : COLORS.light}
                  strokeWidth={1.5}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const firstInCategory = TRANSFORMS.find(tr => tr.category === cat.id);
                    if (firstInCategory) setSelectedTransform(firstInCategory.id);
                  }}
                />
                <text
                  x={80}
                  y={17}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={active ? COLORS.bg : COLORS.dark}
                  style={{ pointerEvents: 'none' }}
                >
                  {cat.label[locale]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Transform selector dropdown */}
        <g transform="translate(50, 88)">
          <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.mid}>
            {t.selectTransform}:
          </text>
          {currentTransforms.map((tr, idx) => {
            const active = tr.id === selectedTransform;
            return (
              <g key={tr.id} transform={`translate(${120 + idx * 160}, -6)`}>
                <rect
                  x={0}
                  y={0}
                  width={150}
                  height={22}
                  rx={4}
                  fill={active ? COLORS.primary : COLORS.bg}
                  stroke={active ? COLORS.primary : COLORS.light}
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedTransform(tr.id)}
                />
                <text
                  x={75}
                  y={12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight={active ? '700' : '400'}
                  fill={active ? COLORS.bg : COLORS.dark}
                  style={{ pointerEvents: 'none' }}
                >
                  {tr.name[locale]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Code panels */}
        {renderCodePanel(currentTransform.before, 30, t.before, COLORS.orange)}
        {renderCodePanel(currentTransform.after, 420, t.after, COLORS.green)}

        {/* Cache statistics chart */}
        {renderCacheChart()}
      </svg>
    </div>
  );
}
