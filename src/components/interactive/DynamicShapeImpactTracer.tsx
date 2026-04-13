import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

type CompilerStage = 'capture' | 'ir' | 'passes' | 'fusion' | 'tiling' | 'codegen';

interface StageComparison {
  stage: CompilerStage;
  label: { zh: string; en: string };
  staticCase: {
    description: { zh: string; en: string };
    capabilities: string[];
    codeSnippet: string;
    statusColor: string;
  };
  dynamicCase: {
    description: { zh: string; en: string };
    capabilities: string[];
    limitations: string[];
    codeSnippet: string;
    statusColor: string;
  };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const STAGES: StageComparison[] = [
  {
    stage: 'capture',
    label: { zh: '图捕获 (Capture)', en: 'Graph Capture' },
    staticCase: {
      description: { zh: 'FX trace 一次，shape 固定，guard 检查精确匹配', en: 'FX trace once, shape fixed, guards check exact match' },
      capabilities: ['Single trace', 'Exact-match guards', 'Deterministic graph'],
      codeSnippet: 'tensor<32x512x768xf32>',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: 'SymInt 表示维度，guard 检查 shape 匹配', en: 'SymInt for dimensions, guard checks shape match' },
      capabilities: ['Symbolic tracing', 'Guard-based recompilation'],
      limitations: ['Guard overhead per call', 'Recompilation on shape change'],
      codeSnippet: 'tensor<s0 x s1 x 768xf32>\n# guard: s0 > 0, s1 > 0',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'ir',
    label: { zh: 'IR 表示', en: 'IR Representation' },
    staticCase: {
      description: { zh: '所有维度为常量，循环边界固定', en: 'All dims are constants, loop bounds fixed' },
      capabilities: ['Constant loop bounds', 'Precomputed strides', 'Static allocation'],
      codeSnippet: 'linalg.matmul\n  ins(%A: tensor<128x768xf32>,\n      %B: tensor<768x512xf32>)\n  outs(%C: tensor<128x512xf32>)',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '维度为符号变量，需要运行时间接索引', en: 'Dims are symbolic, require runtime indirect indexing' },
      capabilities: ['Symbolic constraints', 'Rank known'],
      limitations: ['No constant folding of shapes', 'Runtime stride computation'],
      codeSnippet: 'linalg.matmul\n  ins(%A: tensor<?x768xf32>,\n      %B: tensor<768x512xf32>)\n  outs(%C: tensor<?x512xf32>)',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'passes',
    label: { zh: '优化 Pass', en: 'Optimization Passes' },
    staticCase: {
      description: { zh: '所有 Pass 正常工作：常量折叠、layout 优化、memory planning', en: 'All passes work: constant folding, layout opt, memory planning' },
      capabilities: ['Constant folding', 'Layout optimization', 'Static memory planning', 'Loop unrolling'],
      codeSnippet: '# buffer = alloc(128 * 512 * 4)\n# layout: NHWC (chosen by cost model)',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '部分 Pass 失效：shape 相关常量无法折叠，内存无法预分配', en: "Some passes disabled: shape-dependent constants can't fold, memory can't preallocate" },
      capabilities: ['DCE', 'CSE (shape-independent)'],
      limitations: ['No constant folding (shape-dependent)', 'No static memory planning', 'Layout choice deferred'],
      codeSnippet: '# buffer = alloc(s0 * 512 * 4)  // runtime\n# layout: deferred to runtime',
      statusColor: COLORS.red,
    },
  },
  {
    stage: 'fusion',
    label: { zh: '算子融合', en: 'Operator Fusion' },
    staticCase: {
      description: { zh: '精确判断融合合法性，SRAM 容量检查确定', en: 'Precise legality check, SRAM capacity check definite' },
      capabilities: ['Exact SRAM budget check', 'Aggressive fusion', 'Shape-based cost model'],
      codeSnippet: '# fuse(relu, matmul): 14 KB < 164 KB ✓',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '无法确定中间结果大小，融合策略保守', en: 'Cannot determine intermediate sizes, conservative fusion' },
      capabilities: ['Element-wise fusion (safe)', 'Known-rank fusion'],
      limitations: ['Conservative SRAM budget (assume worst case)', 'May miss fusion opportunities'],
      codeSnippet: '# fuse(relu, matmul): s0*512*4 < 164KB ?\n# unknown → skip fusion (conservative)',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'tiling',
    label: { zh: 'Tiling', en: 'Tiling' },
    staticCase: {
      description: { zh: '编译时选择最优 tile size，循环完全展开', en: 'Compile-time optimal tile size, loops fully unrolled' },
      capabilities: ['Optimal tile size', 'Full unrolling', 'Perfect occupancy tuning'],
      codeSnippet: 'BLOCK_M=128, BLOCK_N=128, BLOCK_K=32\n# grid = (1, 4, 1)  // precomputed',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: 'Tile size 需要兼顾多种 shape，或运行时决定', en: 'Tile size must accommodate multiple shapes, or decided at runtime' },
      capabilities: ['Conservative tile size', 'Runtime grid computation'],
      limitations: ['Suboptimal tile for some shapes', 'No loop unrolling', 'Runtime overhead for grid calc'],
      codeSnippet: 'BLOCK_M=64  // conservative\n# grid = (ceildiv(s0,64), 4, 1)  // runtime',
      statusColor: COLORS.orange,
    },
  },
  {
    stage: 'codegen',
    label: { zh: '代码生成', en: 'Code Generation' },
    staticCase: {
      description: { zh: '特化 kernel，所有分支消除，向量化最优', en: 'Specialized kernel, all branches eliminated, optimal vectorization' },
      capabilities: ['Specialized kernel', 'Dead branch elimination', 'Optimal vectorization width'],
      codeSnippet: '@triton.jit  # compiled for (32, 512, 768)\ndef kernel_32_512_768(...):\n  # no bounds checks needed',
      statusColor: COLORS.green,
    },
    dynamicCase: {
      description: { zh: '通用 kernel，需要边界检查，可能有 warp divergence', en: 'Generic kernel, needs bounds checks, potential warp divergence' },
      capabilities: ['Generic kernel works for all shapes'],
      limitations: ['Bounds checks (mask)', 'Warp divergence', 'Suboptimal vectorization', 'Compilation cache needed'],
      codeSnippet: '@triton.jit  # generic\ndef kernel(N: tl.constexpr, ...):\n  mask = offs < N  # bounds check\n  x = tl.load(ptr, mask=mask)',
      statusColor: COLORS.red,
    },
  },
];

/* ─── Component ─── */

export default function DynamicShapeImpactTracer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Dynamic Shape 对编译各阶段的影响',
      staticLabel: 'Static Shape',
      dynamicLabel: 'Dynamic Shape',
      capabilities: '可用优化',
      limitations: '受限/无法执行',
    },
    en: {
      title: 'Dynamic Shape Impact Across Compiler Stages',
      staticLabel: 'Static Shape',
      dynamicLabel: 'Dynamic Shape',
      capabilities: 'Available Optimizations',
      limitations: 'Limited / Unavailable',
    },
  }[locale]!;

  const [activeStage, setActiveStage] = useState<CompilerStage>('capture');
  const stageData = STAGES.find(s => s.stage === activeStage)!;
  const stageIndex = STAGES.findIndex(s => s.stage === activeStage);

  /* ── Render code snippet as multi-line SVG text ── */
  function renderCodeSnippet(lines: string[], x: number, y: number, maxWidth: number) {
    return (
      <g>
        <rect
          x={x} y={y} width={maxWidth} height={lines.length * 14 + 10}
          rx="4" fill={COLORS.dark} fillOpacity={0.05}
        />
        {lines.map((line, i) => (
          <text
            key={i}
            x={x + 6} y={y + 14 + i * 14}
            fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark} fillOpacity={0.8}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  /* ── Render capability/limitation list ── */
  function renderList(
    items: string[],
    x: number,
    y: number,
    type: 'check' | 'cross',
    color: string,
  ) {
    return items.map((item, i) => (
      <g key={i}>
        {type === 'check' ? (
          <text x={x} y={y + i * 16} fontSize="10" fill={color} fontWeight="700">✓</text>
        ) : (
          <text x={x} y={y + i * 16} fontSize="10" fill={color} fontWeight="700">✗</text>
        )}
        <text x={x + 14} y={y + i * 16} fontSize="9.5" fill={COLORS.dark} fillOpacity={0.75}>
          {item}
        </text>
      </g>
    ));
  }

  /* ── Left card (Static) ── */
  function renderStaticCard() {
    const sc = stageData.staticCase;
    const cx = 20, cy = 95, cw = 365, ch = 370;
    const codeLines = sc.codeSnippet.split('\n');
    const capsEndY = 165 + sc.capabilities.length * 16;

    return (
      <motion.g
        key={`static-${activeStage}`}
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -15 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card bg */}
        <rect x={cx} y={cy} width={cw} height={ch} rx="8"
          fill={sc.statusColor} fillOpacity={0.04}
          stroke={sc.statusColor} strokeWidth="1.5" strokeOpacity={0.3}
        />
        {/* Header */}
        <rect x={cx} y={cy} width={cw} height={30} rx="8" fill={sc.statusColor} fillOpacity={0.15} />
        <rect x={cx} y={cy + 22} width={cw} height={8} fill={sc.statusColor} fillOpacity={0.15} />
        <text x={cx + cw / 2} y={cy + 19} textAnchor="middle" fontSize="12" fontWeight="700" fill={sc.statusColor}>
          {t.staticLabel}
        </text>

        {/* Description */}
        <text x={cx + 12} y={cy + 50} fontSize="10" fill={COLORS.dark} fillOpacity={0.85}>
          {sc.description[locale]}
        </text>

        {/* Capabilities */}
        <text x={cx + 12} y={cy + 72} fontSize="10" fontWeight="600" fill={COLORS.dark}>
          {t.capabilities}
        </text>
        {renderList(sc.capabilities, cx + 12, cy + 88, 'check', sc.statusColor)}

        {/* Code snippet */}
        {renderCodeSnippet(codeLines, cx + 12, capsEndY + 12, cw - 24)}
      </motion.g>
    );
  }

  /* ── Right card (Dynamic) ── */
  function renderDynamicCard() {
    const dc = stageData.dynamicCase;
    const cx = 415, cy = 95, cw = 365, ch = 370;
    const codeLines = dc.codeSnippet.split('\n');
    const capsEndY = 165 + dc.capabilities.length * 16;
    const limsEndY = capsEndY + 20 + dc.limitations.length * 16;

    return (
      <motion.g
        key={`dynamic-${activeStage}`}
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 15 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card bg */}
        <rect x={cx} y={cy} width={cw} height={ch} rx="8"
          fill={dc.statusColor} fillOpacity={0.04}
          stroke={dc.statusColor} strokeWidth="1.5" strokeOpacity={0.3}
        />
        {/* Header */}
        <rect x={cx} y={cy} width={cw} height={30} rx="8" fill={dc.statusColor} fillOpacity={0.15} />
        <rect x={cx} y={cy + 22} width={cw} height={8} fill={dc.statusColor} fillOpacity={0.15} />
        <text x={cx + cw / 2} y={cy + 19} textAnchor="middle" fontSize="12" fontWeight="700" fill={dc.statusColor}>
          {t.dynamicLabel}
        </text>

        {/* Description */}
        <text x={cx + 12} y={cy + 50} fontSize="10" fill={COLORS.dark} fillOpacity={0.85}>
          {dc.description[locale]}
        </text>

        {/* Capabilities */}
        <text x={cx + 12} y={cy + 72} fontSize="10" fontWeight="600" fill={COLORS.dark}>
          {t.capabilities}
        </text>
        {renderList(dc.capabilities, cx + 12, cy + 88, 'check', dc.statusColor)}

        {/* Limitations */}
        <text x={cx + 12} y={capsEndY + 4} fontSize="10" fontWeight="600" fill={COLORS.dark}>
          {t.limitations}
        </text>
        {renderList(dc.limitations, cx + 12, capsEndY + 20, 'cross', COLORS.red)}

        {/* Code snippet */}
        {renderCodeSnippet(codeLines, cx + 12, limsEndY + 8, cw - 24)}
      </motion.g>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 520" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Stage selector tabs */}
        {STAGES.map((stage, i) => {
          const bw = 120;
          const gap = 6;
          const totalW = STAGES.length * bw + (STAGES.length - 1) * gap;
          const startX = (800 - totalW) / 2;
          const bx = startX + i * (bw + gap);
          const isActive = activeStage === stage.stage;
          return (
            <g key={stage.stage} onClick={() => setActiveStage(stage.stage)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={38} width={bw} height={28} rx="6"
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                fillOpacity={isActive ? 0.15 : 1}
                stroke={isActive ? COLORS.primary : COLORS.light}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={bx + bw / 2} y={56} textAnchor="middle" fontSize="10" fontWeight={isActive ? '700' : '500'}
                fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.sans}>
                {stage.label[locale]}
              </text>
            </g>
          );
        })}

        {/* Separator line */}
        <line x1="400" y1="80" x2="400" y2="470" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4,3" />

        {/* Cards with AnimatePresence */}
        <AnimatePresence mode="wait">
          {renderStaticCard()}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {renderDynamicCard()}
        </AnimatePresence>

        {/* Bottom: progress dots */}
        {STAGES.map((_, i) => {
          const dotX = 400 - (STAGES.length - 1) * 12 / 2 + i * 12;
          const isCurrent = i === stageIndex;
          return (
            <circle
              key={i}
              cx={dotX} cy={490}
              r={isCurrent ? 5 : 3}
              fill={isCurrent ? COLORS.primary : COLORS.light}
              stroke={isCurrent ? COLORS.primary : COLORS.mid}
              strokeWidth={isCurrent ? 0 : 0.5}
              strokeOpacity={0.4}
            />
          );
        })}

        {/* Current stage label at bottom */}
        <text x="400" y="510" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {stageData.label[locale]} ({stageIndex + 1}/{STAGES.length})
        </text>
      </svg>
    </div>
  );
}
