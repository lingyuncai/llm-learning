import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface StackLayer {
  id: string;
  label: { zh: string; en: string };
  track: 'pytorch' | 'mlir' | 'both' | 'convergence';
  articles: { slug: string; title: { zh: string; en: string }; type: 'horizontal' | 'vertical' | 'advanced' }[];
  color: string;
}

interface CrossCuttingArticle {
  slug: string;
  title: { zh: string; en: string };
  type: 'vertical' | 'advanced';
  layers: string[];
}

interface Props {
  locale?: 'zh' | 'en';
  currentArticle?: string;
  mode?: 'full' | 'compact';
}

/* ─── Track Colors ─── */

const TRACK_COLORS = {
  pytorch: '#1976d2',
  mlir: '#7b1fa2',
  both: '#00838f',
  convergence: '#00838f',
} as const;

/* ─── Data ─── */

const STACK_LAYERS: StackLayer[] = [
  {
    id: 'user-code',
    label: { zh: '用户代码', en: 'User Code' },
    track: 'both',
    articles: [],
    color: COLORS.bgAlt,
  },
  {
    id: 'panorama',
    label: { zh: '全景图', en: 'Panorama' },
    track: 'both',
    articles: [
      { slug: 'ml-compiler-landscape', title: { zh: '1. ML 编译器的世界', en: '1. ML Compiler Landscape' }, type: 'horizontal' },
    ],
    color: COLORS.primary,
  },
  {
    id: 'graph-capture',
    label: { zh: '计算图捕获', en: 'Graph Capture' },
    track: 'pytorch',
    articles: [
      { slug: 'graph-capture-dynamo', title: { zh: '2. TorchDynamo & AOTAutograd', en: '2. TorchDynamo & AOTAutograd' }, type: 'horizontal' },
    ],
    color: '#1976d2',
  },
  {
    id: 'ir-design',
    label: { zh: 'IR 设计', en: 'IR Design' },
    track: 'both',
    articles: [
      { slug: 'ir-design-basics', title: { zh: '3. SSA, FX IR & MLIR Dialect', en: '3. SSA, FX IR & MLIR Dialect' }, type: 'horizontal' },
      { slug: 'ir-progressive-lowering', title: { zh: '4. Progressive Lowering', en: '4. Progressive Lowering' }, type: 'horizontal' },
    ],
    color: '#7b1fa2',
  },
  {
    id: 'optimization-passes',
    label: { zh: '优化 Pass', en: 'Optimization Passes' },
    track: 'both',
    articles: [
      { slug: 'graph-passes-foundations', title: { zh: '5. 数据流分析 & Pass 基础', en: '5. Dataflow Analysis & Pass Basics' }, type: 'horizontal' },
      { slug: 'graph-passes-advanced', title: { zh: '6. 高级优化 & Pattern Matching', en: '6. Advanced Optimization' }, type: 'horizontal' },
      { slug: 'graph-passes-polyhedral', title: { zh: '7. Polyhedral 优化', en: '7. Polyhedral Optimization' }, type: 'horizontal' },
    ],
    color: '#00838f',
  },
  {
    id: 'operator-fusion',
    label: { zh: '算子融合', en: 'Operator Fusion' },
    track: 'both',
    articles: [
      { slug: 'operator-fusion-taxonomy', title: { zh: '8. 融合类型学', en: '8. Fusion Taxonomy' }, type: 'horizontal' },
      { slug: 'operator-fusion-cost-model', title: { zh: '9. Cost Model', en: '9. Cost Model' }, type: 'horizontal' },
    ],
    color: '#e65100',
  },
  {
    id: 'codegen',
    label: { zh: '代码生成', en: 'Code Generation' },
    track: 'both',
    articles: [
      { slug: 'codegen-instruction-selection', title: { zh: '12. 指令选择 & Vectorization', en: '12. Instruction Selection' }, type: 'horizontal' },
      { slug: 'codegen-triton-backend', title: { zh: '13. Triton & 编译器后端', en: '13. Triton & Backends' }, type: 'horizontal' },
    ],
    color: '#2e7d32',
  },
  {
    id: 'scheduling',
    label: { zh: '调度与执行', en: 'Scheduling & Execution' },
    track: 'both',
    articles: [
      { slug: 'scheduling-execution', title: { zh: '16. 调度与执行优化', en: '16. Scheduling' }, type: 'horizontal' },
      { slug: 'autotuning-end-to-end', title: { zh: '17. 自动调优 & 端到端', en: '17. Autotuning & E2E' }, type: 'horizontal' },
    ],
    color: '#c62828',
  },
  {
    id: 'hardware',
    label: { zh: '硬件执行', en: 'Hardware Execution' },
    track: 'both',
    articles: [],
    color: COLORS.mid,
  },
];

const CROSS_CUTTING: CrossCuttingArticle[] = [
  { slug: 'tiling-memory-hierarchy', title: { zh: '10. Tiling & 内存层次', en: '10. Tiling & Memory' }, type: 'vertical', layers: ['optimization-passes', 'operator-fusion', 'codegen', 'scheduling'] },
  { slug: 'dynamic-shapes-challenge', title: { zh: '11. Dynamic Shapes', en: '11. Dynamic Shapes' }, type: 'vertical', layers: ['graph-capture', 'ir-design', 'optimization-passes', 'operator-fusion', 'codegen'] },
  { slug: 'quantization-compilation', title: { zh: '14. 量化编译', en: '14. Quantization Compilation' }, type: 'advanced', layers: ['operator-fusion', 'codegen'] },
  { slug: 'distributed-compilation', title: { zh: '15. 分布式编译', en: '15. Distributed Compilation' }, type: 'advanced', layers: ['optimization-passes', 'scheduling'] },
];

/* ─── Helpers ─── */

function findCurrentLayer(currentArticle: string | undefined): string | null {
  if (!currentArticle) return null;
  for (const layer of STACK_LAYERS) {
    if (layer.articles.some(a => a.slug === currentArticle)) return layer.id;
  }
  // Check cross-cutting articles — return first spanned layer
  const cc = CROSS_CUTTING.find(a => a.slug === currentArticle);
  if (cc && cc.layers.length > 0) return cc.layers[0];
  return null;
}

/* ─── Full Mode ─── */

const FULL_W = 800;
const FULL_H = 600;
const LAYER_LEFT = 80;
const LAYER_WIDTH = 480;
const LAYER_GAP = 4;
const TOP_PAD = 30;
const CROSS_LEFT = LAYER_LEFT + LAYER_WIDTH + 20;
const CROSS_COL_W = 50;

function FullMode({ locale, currentArticle }: { locale: 'zh' | 'en'; currentArticle?: string }) {
  const t = {
    zh: { vertical: '纵向', advanced: '进阶' },
    en: { vertical: 'Vert.', advanced: 'Adv.' },
  }[locale];

  const layerCount = STACK_LAYERS.length;
  const layerH = Math.floor((FULL_H - TOP_PAD - (layerCount - 1) * LAYER_GAP - 20) / layerCount);

  // Build layer Y positions
  const layerYMap: Record<string, { y: number; h: number }> = {};
  STACK_LAYERS.forEach((layer, i) => {
    const y = TOP_PAD + i * (layerH + LAYER_GAP);
    layerYMap[layer.id] = { y, h: layerH };
  });

  return (
    <svg viewBox={`0 0 ${FULL_W} ${FULL_H}`} className="w-full">
      <style>{`text { font-family: ${FONTS.sans}; } a text { cursor: pointer; } a:hover text { text-decoration: underline; }`}</style>

      {/* Layers */}
      {STACK_LAYERS.map((layer, i) => {
        const y = layerYMap[layer.id].y;
        const hasCurrentArticle = layer.articles.some(a => a.slug === currentArticle);
        const isCrossCurrent = CROSS_CUTTING.some(cc => cc.slug === currentArticle && cc.layers.includes(layer.id));
        const isHighlighted = hasCurrentArticle || isCrossCurrent;

        return (
          <g key={layer.id}>
            {/* Track indicator bar */}
            <rect
              x={LAYER_LEFT - 8}
              y={y}
              width={6}
              height={layerH}
              rx={3}
              fill={TRACK_COLORS[layer.track]}
              opacity={0.7}
            />

            {/* Layer background */}
            {isHighlighted ? (
              <motion.rect
                x={LAYER_LEFT}
                y={y}
                width={LAYER_WIDTH}
                height={layerH}
                rx={6}
                fill={layer.color}
                fillOpacity={0.08}
                stroke={layer.color}
                strokeWidth={2.5}
                animate={{ strokeOpacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect
                x={LAYER_LEFT}
                y={y}
                width={LAYER_WIDTH}
                height={layerH}
                rx={6}
                fill={layer.color}
                fillOpacity={0.06}
                stroke={layer.color}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            )}

            {/* Layer label */}
            <text
              x={LAYER_LEFT + 10}
              y={y + 16}
              fontSize="11"
              fontWeight="700"
              fill={layer.color}
              opacity={0.9}
            >
              {layer.label[locale]}
            </text>

            {/* Articles inside layer */}
            {layer.articles.map((article, ai) => {
              const isCurrent = article.slug === currentArticle;
              const artX = LAYER_LEFT + 12;
              const artY = y + 24 + ai * 18;
              return (
                <g key={article.slug}>
                  {isCurrent && (
                    <motion.rect
                      x={artX - 4}
                      y={artY - 10}
                      width={LAYER_WIDTH - 24}
                      height={16}
                      rx={3}
                      fill={layer.color}
                      fillOpacity={0.15}
                      stroke={layer.color}
                      strokeWidth={1.5}
                      animate={{ strokeOpacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <a href={`/${locale}/articles/${article.slug}`}>
                    <text
                      x={artX}
                      y={artY}
                      fontSize="10"
                      fontWeight={isCurrent ? '700' : '500'}
                      fill={isCurrent ? layer.color : COLORS.dark}
                    >
                      {article.title[locale]}
                    </text>
                  </a>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Cross-cutting / vertical articles on the right */}
      {CROSS_CUTTING.map((cc, ci) => {
        const x = CROSS_LEFT + ci * CROSS_COL_W;
        const spanLayers = cc.layers.map(lid => layerYMap[lid]).filter(Boolean);
        if (spanLayers.length === 0) return null;

        const minY = Math.min(...spanLayers.map(l => l.y));
        const maxY = Math.max(...spanLayers.map(l => l.y + l.h));
        const isCurrent = cc.slug === currentArticle;
        const barColor = cc.type === 'vertical' ? '#546e7a' : COLORS.purple;

        return (
          <g key={cc.slug}>
            {/* Vertical spanning bar */}
            {isCurrent ? (
              <motion.rect
                x={x + 6}
                y={minY}
                width={10}
                height={maxY - minY}
                rx={5}
                fill={barColor}
                fillOpacity={0.5}
                animate={{ fillOpacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect
                x={x + 6}
                y={minY}
                width={10}
                height={maxY - minY}
                rx={5}
                fill={barColor}
                fillOpacity={0.25}
              />
            )}

            {/* Connecting dots at each spanned layer */}
            {spanLayers.map((sl, si) => (
              <circle
                key={si}
                cx={x + 11}
                cy={sl.y + sl.h / 2}
                r={3}
                fill={barColor}
                opacity={isCurrent ? 0.9 : 0.5}
              />
            ))}

            {/* Type badge + title (rotated text) */}
            <a href={`/${locale}/articles/${cc.slug}`}>
              <text
                x={x + 22}
                y={minY + 2}
                fontSize="8.5"
                fontWeight={isCurrent ? '700' : '500'}
                fill={isCurrent ? barColor : COLORS.dark}
                transform={`rotate(90, ${x + 22}, ${minY + 2})`}
              >
                {cc.type === 'vertical' ? `[${t.vertical}] ` : `[${t.advanced}] `}
                {cc.title[locale]}
              </text>
            </a>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${LAYER_LEFT}, ${FULL_H - 14})`}>
        {([
          { color: TRACK_COLORS.pytorch, label: 'PyTorch' },
          { color: TRACK_COLORS.mlir, label: 'MLIR' },
          { color: TRACK_COLORS.both, label: locale === 'zh' ? '共同' : 'Both' },
        ] as const).map((item, i) => (
          <g key={item.label} transform={`translate(${i * 100}, 0)`}>
            <rect x={0} y={-8} width={14} height={8} rx={2} fill={item.color} opacity={0.7} />
            <text x={18} y={0} fontSize="9" fill={COLORS.mid}>{item.label}</text>
          </g>
        ))}

        <g transform="translate(310, 0)">
          <rect x={0} y={-8} width={14} height={8} rx={2} fill="#546e7a" opacity={0.4} />
          <text x={18} y={0} fontSize="9" fill={COLORS.mid}>{locale === 'zh' ? '纵向' : 'Vertical'}</text>
        </g>
        <g transform="translate(390, 0)">
          <rect x={0} y={-8} width={14} height={8} rx={2} fill={COLORS.purple} opacity={0.4} />
          <text x={18} y={0} fontSize="9" fill={COLORS.mid}>{locale === 'zh' ? '进阶' : 'Advanced'}</text>
        </g>
      </g>
    </svg>
  );
}

/* ─── Compact Mode ─── */

const COMPACT_W = 800;
const COMPACT_H = 120;
const COMPACT_LEFT = 10;
const COMPACT_RIGHT = 790;
const COMPACT_BAR_H = 8;
const COMPACT_TOP = 20;
const COMPACT_GAP = 2;

function CompactMode({ locale, currentArticle }: { locale: 'zh' | 'en'; currentArticle?: string }) {
  const t = {
    zh: { here: '你在这里', viewFull: '查看全景图' },
    en: { here: 'You are here', viewFull: 'View full map' },
  }[locale];

  const currentLayerId = findCurrentLayer(currentArticle);

  // Find current article info
  const currentInfo = useMemo(() => {
    if (!currentArticle) return null;
    for (const layer of STACK_LAYERS) {
      const art = layer.articles.find(a => a.slug === currentArticle);
      if (art) return { title: art.title[locale], layerId: layer.id, color: layer.color };
    }
    const cc = CROSS_CUTTING.find(a => a.slug === currentArticle);
    if (cc) {
      const firstLayer = STACK_LAYERS.find(l => l.id === cc.layers[0]);
      return { title: cc.title[locale], layerId: cc.layers[0], color: firstLayer?.color || COLORS.mid };
    }
    return null;
  }, [currentArticle, locale]);

  const layerCount = STACK_LAYERS.length;
  const expandedH = 22;
  const normalH = COMPACT_BAR_H;
  const totalExpanded = currentLayerId ? 1 : 0;
  const totalNormal = layerCount - totalExpanded;
  const totalAvailable = COMPACT_H - COMPACT_TOP - 14 - (layerCount - 1) * COMPACT_GAP;
  const normalBarH = totalExpanded > 0
    ? Math.floor((totalAvailable - expandedH * totalExpanded) / totalNormal)
    : Math.floor(totalAvailable / layerCount);

  let yOffset = COMPACT_TOP;
  const layerBars = STACK_LAYERS.map((layer) => {
    const isExpanded = layer.id === currentLayerId;
    const h = isExpanded ? expandedH : Math.min(normalBarH, normalH);
    const y = yOffset;
    yOffset += h + COMPACT_GAP;
    return { layer, y, h, isExpanded };
  });

  return (
    <svg viewBox={`0 0 ${COMPACT_W} ${COMPACT_H}`} className="w-full">
      <style>{`text { font-family: ${FONTS.sans}; } a text { cursor: pointer; }`}</style>

      {/* Panorama link */}
      <a href={`/${locale}/articles/ml-compiler-landscape`}>
        <text
          x={COMPACT_RIGHT}
          y={12}
          textAnchor="end"
          fontSize="9"
          fill={COLORS.primary}
          opacity={0.7}
        >
          {t.viewFull} →
        </text>
      </a>

      {/* Layer bars */}
      {layerBars.map(({ layer, y, h, isExpanded }) => (
        <g key={layer.id}>
          {isExpanded ? (
            <motion.rect
              x={COMPACT_LEFT}
              y={y}
              width={COMPACT_RIGHT - COMPACT_LEFT}
              height={h}
              rx={4}
              fill={layer.color}
              fillOpacity={0.12}
              stroke={layer.color}
              strokeWidth={1.5}
              animate={{ strokeOpacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <rect
              x={COMPACT_LEFT}
              y={y}
              width={COMPACT_RIGHT - COMPACT_LEFT}
              height={h}
              rx={3}
              fill={layer.color}
              fillOpacity={0.15}
            />
          )}

          {/* Layer label (always shown) */}
          <text
            x={COMPACT_LEFT + 6}
            y={y + h / 2 + 1}
            fontSize={isExpanded ? '9' : '7'}
            fontWeight={isExpanded ? '700' : '500'}
            fill={isExpanded ? layer.color : COLORS.mid}
            dominantBaseline="middle"
          >
            {layer.label[locale]}
          </text>

          {/* Current article name + indicator (only in expanded layer) */}
          {isExpanded && currentInfo && (
            <>
              <text
                x={COMPACT_LEFT + 120}
                y={y + h / 2 + 1}
                fontSize="9"
                fontWeight="600"
                fill={COLORS.dark}
                dominantBaseline="middle"
              >
                {currentInfo.title}
              </text>

              {/* "You are here" badge */}
              <motion.g
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <rect
                  x={COMPACT_RIGHT - 110}
                  y={y + h / 2 - 7}
                  width={100}
                  height={14}
                  rx={7}
                  fill={currentInfo.color}
                  fillOpacity={0.15}
                  stroke={currentInfo.color}
                  strokeWidth={1}
                />
                <circle
                  cx={COMPACT_RIGHT - 100}
                  cy={y + h / 2}
                  r={3}
                  fill={currentInfo.color}
                />
                <text
                  x={COMPACT_RIGHT - 92}
                  y={y + h / 2 + 1}
                  fontSize="8"
                  fontWeight="600"
                  fill={currentInfo.color}
                  dominantBaseline="middle"
                >
                  {t.here}
                </text>
              </motion.g>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Main Component ─── */

export default function CompilerStackMap({
  locale = 'zh',
  currentArticle,
  mode = 'full',
}: Props) {
  return (
    <div className="my-6">
      {mode === 'full' ? (
        <FullMode locale={locale} currentArticle={currentArticle} />
      ) : (
        <CompactMode locale={locale} currentArticle={currentArticle} />
      )}
    </div>
  );
}
