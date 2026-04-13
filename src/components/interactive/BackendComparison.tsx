import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Backend {
  id: string;
  name: string;
  icon: string;
  ecosystem: string;
  target: string;
  compilationModel: string;
  fusionStrategy: string;
  strengths: { zh: string[]; en: string[] };
  weaknesses: { zh: string[]; en: string[] };
  bestFor: { zh: string; en: string };
  color: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const BACKENDS: Backend[] = [
  {
    id: 'inductor',
    name: 'TorchInductor + Triton',
    icon: '\ud83d\udd25',
    ecosystem: 'PyTorch',
    target: 'NVIDIA GPU (primary), CPU',
    compilationModel: 'JIT',
    fusionStrategy: 'Greedy (fast compile)',
    strengths: {
      zh: [
        '\u5355 kernel \u7f16\u8bd1\u901f\u5ea6\u5feb (< 100ms/kernel\uff0c\u6574\u4f53\u6a21\u578b\u79d2\u7ea7)',
        'Python-native\uff0c\u8c03\u8bd5\u53cb\u597d',
        '\u52a8\u6001 shape \u652f\u6301\u597d',
        '\u4e0e PyTorch \u751f\u6001\u65e0\u7f1d\u96c6\u6210',
      ],
      en: [
        'Fast per-kernel compilation (< 100ms/kernel, full model in seconds)',
        'Python-native, debug-friendly',
        'Good dynamic shape support',
        'Seamless PyTorch ecosystem integration',
      ],
    },
    weaknesses: {
      zh: ['\u4e3b\u8981\u652f\u6301 NVIDIA GPU', '\u878d\u5408\u7b56\u7565\u975e\u5168\u5c40\u6700\u4f18', '\u751f\u6210\u4ee3\u7801\u6027\u80fd\u7565\u4f4e\u4e8e\u624b\u5199 CUDA'],
      en: ['Primarily NVIDIA GPU', 'Fusion strategy not globally optimal', 'Generated code slightly slower than hand-written CUDA'],
    },
    bestFor: { zh: '\u7814\u53d1\u8fed\u4ee3\u3001\u52a8\u6001 shape \u6a21\u578b\u3001PyTorch \u7528\u6237', en: 'R&D iteration, dynamic shape models, PyTorch users' },
    color: HEAD_COLORS[0],
  },
  {
    id: 'xla',
    name: 'XLA',
    icon: 'X',
    ecosystem: 'TensorFlow / JAX',
    target: 'TPU, NVIDIA GPU, CPU',
    compilationModel: 'AOT (primarily)',
    fusionStrategy: 'Graph Coloring (globally optimal)',
    strengths: {
      zh: ['\u5168\u5c40\u6700\u4f18\u878d\u5408', 'TPU \u539f\u751f\u652f\u6301', '\u6210\u719f\u7a33\u5b9a', 'JAX \u751f\u6001\u6838\u5fc3'],
      en: ['Globally optimal fusion', 'Native TPU support', 'Mature and stable', 'Core of JAX ecosystem'],
    },
    weaknesses: {
      zh: ['\u7f16\u8bd1\u65f6\u95f4\u957f (> 1s)', '\u52a8\u6001 shape \u652f\u6301\u6709\u9650', 'PyTorch \u96c6\u6210\u9700\u8981\u989d\u5916\u6865\u63a5\u5c42'],
      en: ['Long compilation time (> 1s)', 'Limited dynamic shape support', 'PyTorch integration requires bridge layer'],
    },
    bestFor: { zh: '\u9759\u6001 shape \u6a21\u578b\u3001TPU \u8bad\u7ec3\u3001JAX \u7528\u6237', en: 'Static shape models, TPU training, JAX users' },
    color: HEAD_COLORS[1],
  },
  {
    id: 'tensorrt',
    name: 'TensorRT',
    icon: 'T',
    ecosystem: 'NVIDIA',
    target: 'NVIDIA GPU only',
    compilationModel: 'AOT',
    fusionStrategy: 'Rule-based + Cost model',
    strengths: {
      zh: ['NVIDIA GPU \u4e0a\u6027\u80fd\u6700\u4f18', '\u91cf\u5316\u652f\u6301\u5b8c\u5584 (INT8/FP8)', '\u63a8\u7406\u5ef6\u8fdf\u6781\u4f4e', '\u4e30\u5bcc\u7684\u9884\u4f18\u5316 kernel \u5e93'],
      en: ['Best performance on NVIDIA GPU', 'Excellent quantization (INT8/FP8)', 'Ultra-low inference latency', 'Rich pre-optimized kernel library'],
    },
    weaknesses: {
      zh: ['\u4ec5\u652f\u6301 NVIDIA GPU', '\u7f16\u8bd1\u65f6\u95f4\u5f88\u957f', '\u52a8\u6001 shape \u652f\u6301\u6709\u9650', '\u4e0d\u652f\u6301\u8bad\u7ec3'],
      en: ['NVIDIA GPU only', 'Very long compilation time', 'Limited dynamic shape support', 'No training support'],
    },
    bestFor: { zh: '\u751f\u4ea7\u63a8\u7406\u90e8\u7f72\u3001\u4f4e\u5ef6\u8fdf\u8981\u6c42\u3001NVIDIA \u786c\u4ef6', en: 'Production inference, low-latency requirements, NVIDIA hardware' },
    color: HEAD_COLORS[2],
  },
  {
    id: 'iree',
    name: 'IREE',
    icon: 'I',
    ecosystem: 'MLIR-native',
    target: 'CPU, GPU (Vulkan/CUDA/ROCm), mobile',
    compilationModel: 'AOT',
    fusionStrategy: 'MLIR-based (linalg fusion)',
    strengths: {
      zh: [
        '\u771f\u6b63\u7684\u8de8\u5e73\u53f0 (Vulkan/CUDA/ROCm/CPU)',
        'MLIR-native\uff0c\u65b9\u8a00\u6269\u5c55\u7075\u6d3b',
        '\u8f7b\u91cf\u7ea7\u8fd0\u884c\u65f6',
        '\u9002\u5408\u5d4c\u5165\u5f0f\u548c\u79fb\u52a8\u7aef',
      ],
      en: [
        'True cross-platform (Vulkan/CUDA/ROCm/CPU)',
        'MLIR-native, flexible dialect extension',
        'Lightweight runtime',
        'Suitable for embedded and mobile',
      ],
    },
    weaknesses: {
      zh: ['NVIDIA GPU \u6027\u80fd\u4e0d\u5982 TensorRT/Triton', '\u751f\u6001\u7cfb\u7edf\u8f83\u5c0f', '\u6587\u6863\u548c\u793e\u533a\u76f8\u5bf9\u4e0d\u6210\u719f'],
      en: ['Lower NVIDIA GPU perf than TensorRT/Triton', 'Smaller ecosystem', 'Documentation and community less mature'],
    },
    bestFor: { zh: '\u8de8\u5e73\u53f0\u90e8\u7f72\u3001MLIR \u7814\u7a76\u3001\u5d4c\u5165\u5f0f\u63a8\u7406', en: 'Cross-platform deployment, MLIR research, embedded inference' },
    color: HEAD_COLORS[3],
  },
];

/* ─── Component ─── */

export default function BackendComparison({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '\u7f16\u8bd1\u5668\u540e\u7aef\u5bf9\u6bd4',
      ecosystem: '\u751f\u6001',
      target: '\u76ee\u6807\u786c\u4ef6',
      compilation: '\u7f16\u8bd1\u6a21\u5f0f',
      fusion: '\u878d\u5408\u7b56\u7565',
      strengths: '\u4f18\u52bf',
      weaknesses: '\u52a3\u52bf',
      bestFor: '\u6700\u4f73\u573a\u666f',
      clickToExpand: '\u70b9\u51fb\u5361\u7247\u67e5\u770b\u8be6\u60c5',
    },
    en: {
      title: 'Compiler Backend Comparison',
      ecosystem: 'Ecosystem',
      target: 'Target Hardware',
      compilation: 'Compilation',
      fusion: 'Fusion Strategy',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      bestFor: 'Best For',
      clickToExpand: 'Click a card for details',
    },
  }[locale]!;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cardW = 370;
  const cardH = 110;
  const gap = 16;
  const gridStartX = 20;
  const gridStartY = 50;

  function getCardPos(i: number) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      x: gridStartX + col * (cardW + gap),
      y: gridStartY + row * (cardH + gap),
    };
  }

  const expandedBackend = BACKENDS.find(b => b.id === expandedId);

  // SVG height depends on whether expanded panel is showing
  const baseSvgH = gridStartY + 2 * (cardH + gap) + 10;
  const svgH = expandedBackend ? baseSvgH + 180 : baseSvgH + 30;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 800 ${svgH}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={400} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Hint */}
        {!expandedId && (
          <text x={400} y={svgH - 10} textAnchor="middle" fontSize="9.5" fill={COLORS.mid} fillOpacity={0.6}>
            {t.clickToExpand}
          </text>
        )}

        {/* 2x2 grid of cards */}
        {BACKENDS.map((backend, i) => {
          const { x, y } = getCardPos(i);
          const isExpanded = backend.id === expandedId;

          return (
            <motion.g
              key={backend.id}
              onClick={() => setExpandedId(isExpanded ? null : backend.id)}
              style={{ cursor: 'pointer' }}
              animate={{ opacity: expandedId && !isExpanded ? 0.5 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Card background */}
              <rect
                x={x}
                y={y}
                width={cardW}
                height={cardH}
                rx={8}
                fill={backend.color}
                fillOpacity={isExpanded ? 0.08 : 0.03}
                stroke={backend.color}
                strokeWidth={isExpanded ? 2 : 1}
                strokeOpacity={isExpanded ? 0.8 : 0.3}
              />

              {/* Colored header bar */}
              <rect
                x={x}
                y={y}
                width={cardW}
                height={28}
                rx={8}
                fill={backend.color}
                fillOpacity={0.12}
              />
              <rect
                x={x}
                y={y + 20}
                width={cardW}
                height={8}
                fill={backend.color}
                fillOpacity={0.12}
              />

              {/* Icon + Name */}
              <text x={x + 14} y={y + 19} fontSize="13" fill={backend.color}>
                {backend.icon}
              </text>
              <text x={x + 32} y={y + 19} fontSize="12" fontWeight="700" fill={backend.color}>
                {backend.name}
              </text>

              {/* Key-value pairs */}
              <text x={x + 14} y={y + 46} fontSize="9" fill={COLORS.mid}>
                <tspan fontWeight="600">{t.ecosystem}:</tspan> {backend.ecosystem}
              </text>
              <text x={x + 14} y={y + 60} fontSize="9" fill={COLORS.mid}>
                <tspan fontWeight="600">{t.target}:</tspan> {backend.target}
              </text>
              <text x={x + 14} y={y + 74} fontSize="9" fill={COLORS.mid}>
                <tspan fontWeight="600">{t.compilation}:</tspan> {backend.compilationModel}
              </text>
              <text x={x + 14} y={y + 88} fontSize="9" fill={COLORS.mid}>
                <tspan fontWeight="600">{t.fusion}:</tspan> {backend.fusionStrategy}
              </text>

              {/* Selection indicator */}
              {isExpanded && (
                <motion.rect
                  x={x + cardW - 24}
                  y={y + 6}
                  width={16}
                  height={16}
                  rx={8}
                  fill={backend.color}
                  fillOpacity={0.3}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.g>
          );
        })}

        {/* Expanded detail panel */}
        <AnimatePresence>
          {expandedBackend && (
            <motion.g
              key={`detail-${expandedBackend.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              <rect
                x={gridStartX}
                y={baseSvgH - 6}
                width={cardW * 2 + gap}
                height={170}
                rx={8}
                fill={expandedBackend.color}
                fillOpacity={0.03}
                stroke={expandedBackend.color}
                strokeWidth={1}
                strokeOpacity={0.25}
              />

              {/* Strengths */}
              <text x={gridStartX + 16} y={baseSvgH + 16} fontSize="11" fontWeight="700" fill={COLORS.green}>
                {t.strengths}
              </text>
              {expandedBackend.strengths[locale].map((s, i) => (
                <text key={`s-${i}`} x={gridStartX + 30} y={baseSvgH + 32 + i * 15} fontSize="9.5" fill={COLORS.dark}>
                  <tspan fill={COLORS.green} fontWeight="700">+ </tspan>
                  {s}
                </text>
              ))}

              {/* Weaknesses */}
              <text x={gridStartX + 400} y={baseSvgH + 16} fontSize="11" fontWeight="700" fill={COLORS.orange}>
                {t.weaknesses}
              </text>
              {expandedBackend.weaknesses[locale].map((w, i) => (
                <text key={`w-${i}`} x={gridStartX + 414} y={baseSvgH + 32 + i * 15} fontSize="9.5" fill={COLORS.dark}>
                  <tspan fill={COLORS.orange} fontWeight="700">- </tspan>
                  {w}
                </text>
              ))}

              {/* Best For bar */}
              <rect
                x={gridStartX + 16}
                y={baseSvgH + 130}
                width={cardW * 2 + gap - 32}
                height={28}
                rx={4}
                fill={expandedBackend.color}
                fillOpacity={0.08}
              />
              <text x={gridStartX + 30} y={baseSvgH + 149} fontSize="10.5" fontWeight="600" fill={expandedBackend.color}>
                {t.bestFor}: {expandedBackend.bestFor[locale]}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
