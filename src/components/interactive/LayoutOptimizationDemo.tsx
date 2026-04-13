import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

type Layout = 'NCHW' | 'NHWC';

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const EXAMPLE = { N: 1, C: 4, H: 2, W: 2 };

// Element ordering in memory for each layout
function getMemoryOrder(layout: Layout): number[] {
  const { N, C, H, W } = EXAMPLE;
  const order: number[] = [];

  if (layout === 'NCHW') {
    for (let n = 0; n < N; n++) {
      for (let c = 0; c < C; c++) {
        for (let h = 0; h < H; h++) {
          for (let w = 0; w < W; w++) {
            order.push(c * H * W + h * W + w);
          }
        }
      }
    }
  } else { // NHWC
    for (let n = 0; n < N; n++) {
      for (let h = 0; h < H; h++) {
        for (let w = 0; w < W; w++) {
          for (let c = 0; c < C; c++) {
            order.push(h * W * C + w * C + c);
          }
        }
      }
    }
  }

  return order;
}

/* ─── SVG Constants ─── */

const W = 800;
const H = 500;
const TENSOR_LEFT = 40;
const TENSOR_TOP = 100;
const CHANNEL_SIZE = 50;
const CHANNEL_GAP = 8;
const MEMORY_LEFT = 450;
const MEMORY_TOP = 140;
const MEMORY_WIDTH = 320;
const MEMORY_HEIGHT = 40;
const ELEMENT_SIZE = 18;

/* ─── Component ─── */

export default function LayoutOptimizationDemo({ locale = 'zh' }: Props) {
  const [layout, setLayout] = useState<Layout>('NCHW');

  const t = {
    zh: {
      title: 'Data Layout 优化：NCHW vs NHWC',
      subtitle: '内存布局如何影响性能',
      nchw: 'NCHW（通道优先）',
      nhwc: 'NHWC（空间优先）',
      tensor3d: '3D Tensor 表示',
      memoryLayout: '线性内存布局',
      stats: '性能指标',
      cacheUtil: 'Cache 命中率',
      tensorCore: 'Tensor Core 兼容性',
      contiguous: '连续访问',
      strided: '跨步访问',
      channel: '通道',
      high: '高',
      low: '低',
      yes: '是',
      no: '否',
      explanation: 'NCHW 将同一通道的空间位置连续存储，cache 命中率高。NHWC 将同一位置的所有通道连续存储，适合 Tensor Core 的隐式 GEMM 加载。',
    },
    en: {
      title: 'Data Layout Optimization: NCHW vs NHWC',
      subtitle: 'How memory layout affects performance',
      nchw: 'NCHW (Channel-first)',
      nhwc: 'NHWC (Spatial-first)',
      tensor3d: '3D Tensor View',
      memoryLayout: 'Linear Memory Layout',
      stats: 'Performance Stats',
      cacheUtil: 'Cache Utilization',
      tensorCore: 'Tensor Core Compatible',
      contiguous: 'contiguous',
      strided: 'strided',
      channel: 'Channel',
      high: 'High',
      low: 'Low',
      yes: 'Yes',
      no: 'No',
      explanation: 'NCHW stores spatial positions of the same channel contiguously, yielding high cache hit rates. NHWC stores all channels at each position contiguously, ideal for Tensor Core implicit GEMM loading.',
    },
  }[locale]!;

  const memoryOrder = useMemo(() => getMemoryOrder(layout), [layout]);

  // Stats based on layout
  const stats = useMemo(() => {
    if (layout === 'NCHW') {
      return {
        cacheUtil: t.high,
        cacheColor: COLORS.green,
        tensorCore: t.no,
        tcColor: COLORS.red,
      };
    } else {
      return {
        cacheUtil: t.low,
        cacheColor: COLORS.orange,
        tensorCore: t.yes,
        tcColor: COLORS.green,
      };
    }
  }, [layout, t]);

  // Example contiguous read pattern (first 4 elements)
  const highlightedElements = memoryOrder.slice(0, 4);
  const isContiguous = layout === 'NCHW';

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Layout toggle buttons */}
        <g transform="translate(250, 60)">
          {(['NCHW', 'NHWC'] as Layout[]).map((l, i) => {
            const isActive = layout === l;
            return (
              <g
                key={l}
                transform={`translate(${i * 160}, 0)`}
                onClick={() => setLayout(l)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={0}
                  y={0}
                  width={150}
                  height={28}
                  rx={6}
                  fill={isActive ? COLORS.primary : COLORS.bgAlt}
                  stroke={COLORS.primary}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={isActive ? 1 : 0.5}
                />
                <text
                  x={75}
                  y={18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={isActive ? COLORS.bg : COLORS.primary}
                >
                  {l === 'NCHW' ? t.nchw : t.nhwc}
                </text>
              </g>
            );
          })}
        </g>

        {/* Left: 3D Tensor visualization */}
        <g>
          <text
            x={TENSOR_LEFT + 80}
            y={TENSOR_TOP - 10}
            fontSize="10"
            fontWeight="600"
            fill={COLORS.mid}
          >
            {t.tensor3d}
          </text>

          <AnimatePresence mode="wait">
            <motion.g
              key={layout}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {Array.from({ length: EXAMPLE.C }).map((_, c) => {
                const offsetX = c * 6;
                const offsetY = c * -6;
                return (
                  <g key={c} transform={`translate(${TENSOR_LEFT + offsetX}, ${TENSOR_TOP + offsetY})`}>
                    {/* Channel label */}
                    <text
                      x={CHANNEL_SIZE / 2}
                      y={-4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill={HEAD_COLORS[c]}
                    >
                      {t.channel} {c}
                    </text>

                    {/* 2D grid */}
                    {Array.from({ length: EXAMPLE.H }).map((_, h) => (
                      Array.from({ length: EXAMPLE.W }).map((_, w) => {
                        const elementIdx = layout === 'NCHW'
                          ? c * EXAMPLE.H * EXAMPLE.W + h * EXAMPLE.W + w
                          : h * EXAMPLE.W * EXAMPLE.C + w * EXAMPLE.C + c;
                        const isHighlighted = highlightedElements.includes(elementIdx);

                        return (
                          <rect
                            key={`${h}-${w}`}
                            x={w * (ELEMENT_SIZE + 2)}
                            y={h * (ELEMENT_SIZE + 2)}
                            width={ELEMENT_SIZE}
                            height={ELEMENT_SIZE}
                            rx={2}
                            fill={HEAD_COLORS[c]}
                            fillOpacity={isHighlighted ? 0.8 : 0.3}
                            stroke={isHighlighted ? (isContiguous ? COLORS.green : COLORS.orange) : 'none'}
                            strokeWidth={isHighlighted ? 2 : 0}
                          />
                        );
                      })
                    ))}
                  </g>
                );
              })}
            </motion.g>
          </AnimatePresence>

          {/* Dimension labels */}
          <text
            x={TENSOR_LEFT + 80}
            y={TENSOR_TOP + 90}
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.mid}
            style={{ fontFamily: FONTS.mono }}
          >
            {layout === 'NCHW' ? 'C × H × W' : 'H × W × C'}
          </text>
        </g>

        {/* Right: Memory layout bar */}
        <g>
          <text
            x={MEMORY_LEFT + MEMORY_WIDTH / 2}
            y={MEMORY_TOP - 10}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={COLORS.mid}
          >
            {t.memoryLayout}
          </text>

          {/* Memory bar background */}
          <rect
            x={MEMORY_LEFT}
            y={MEMORY_TOP}
            width={MEMORY_WIDTH}
            height={MEMORY_HEIGHT}
            rx={4}
            fill={COLORS.bgAlt}
            stroke={COLORS.light}
            strokeWidth={1}
          />

          {/* Memory elements */}
          <AnimatePresence mode="wait">
            {memoryOrder.map((elementIdx, i) => {
              const channel = layout === 'NCHW'
                ? Math.floor(elementIdx / (EXAMPLE.H * EXAMPLE.W))
                : elementIdx % EXAMPLE.C;
              const isHighlighted = highlightedElements.includes(elementIdx);
              const elemWidth = MEMORY_WIDTH / memoryOrder.length;

              return (
                <motion.rect
                  key={`${layout}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  x={MEMORY_LEFT + i * elemWidth}
                  y={MEMORY_TOP + 2}
                  width={elemWidth - 1}
                  height={MEMORY_HEIGHT - 4}
                  fill={HEAD_COLORS[channel]}
                  fillOpacity={isHighlighted ? 0.9 : 0.5}
                  stroke={isHighlighted ? (isContiguous ? COLORS.green : COLORS.orange) : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                />
              );
            })}
          </AnimatePresence>

          {/* Access pattern label */}
          <g transform={`translate(${MEMORY_LEFT}, ${MEMORY_TOP + MEMORY_HEIGHT + 20})`}>
            <rect
              x={0}
              y={0}
              width={120}
              height={18}
              rx={9}
              fill={isContiguous ? COLORS.valid : COLORS.highlight}
            />
            <text
              x={60}
              y={13}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={isContiguous ? COLORS.green : COLORS.orange}
            >
              {isContiguous ? t.contiguous : t.strided}
            </text>
          </g>
        </g>

        {/* Bottom: Stats */}
        <g transform={`translate(${MEMORY_LEFT}, ${MEMORY_TOP + 100})`}>
          <text
            x={0}
            y={0}
            fontSize="11"
            fontWeight="600"
            fill={COLORS.dark}
          >
            {t.stats}
          </text>

          {/* Cache utilization */}
          <g transform="translate(0, 20)">
            <text x={0} y={0} fontSize="9" fill={COLORS.mid}>
              {t.cacheUtil}:
            </text>
            <text x={130} y={0} fontSize="9" fontWeight="700" fill={stats.cacheColor}>
              {stats.cacheUtil}
            </text>
          </g>

          {/* Tensor Core compatibility */}
          <g transform="translate(0, 40)">
            <text x={0} y={0} fontSize="9" fill={COLORS.mid}>
              {t.tensorCore}:
            </text>
            <text x={130} y={0} fontSize="9" fontWeight="700" fill={stats.tcColor}>
              {stats.tensorCore}
            </text>
          </g>
        </g>

        {/* Bottom explanation */}
        <g transform={`translate(${W / 2}, ${H - 40})`}>
          <rect
            x={-W / 2 + 20}
            y={-25}
            width={W - 40}
            height={50}
            rx={6}
            fill={COLORS.bgAlt}
            stroke={COLORS.light}
            strokeWidth={1}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.dark}
          >
            {t.explanation.split(/[。.]\s?/)[0]}
          </text>
          <text
            x={0}
            y={14}
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.dark}
          >
            {t.explanation.split(/[。.]\s?/)[1]}
          </text>
        </g>
      </svg>
    </div>
  );
}
