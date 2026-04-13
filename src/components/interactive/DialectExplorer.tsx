import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Dialect {
  id: string;
  name: string;
  level: 'high' | 'mid' | 'low' | 'hardware';
  description: { zh: string; en: string };
  exampleOps: string[];
  lowerTo: string[];
  color: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const DIALECTS: Dialect[] = [
  {
    id: 'linalg', name: 'Linalg', level: 'high',
    description: { zh: '线性代数运算的 tensor-level 抽象，对矩阵乘法、卷积等操作提供高层表示', en: 'Tensor-level linear algebra abstractions for matmul, convolution, and other operations' },
    exampleOps: ['linalg.matmul', 'linalg.generic', 'linalg.fill', 'linalg.conv_2d'],
    lowerTo: ['scf', 'memref'],
    color: '#1565c0',
  },
  {
    id: 'tensor', name: 'Tensor', level: 'high',
    description: { zh: 'Tensor 类型操作（值语义），提供切片、插入等张量操作', en: 'Tensor type operations with value semantics, providing slicing and insertion' },
    exampleOps: ['tensor.empty', 'tensor.extract_slice', 'tensor.insert_slice', 'tensor.cast'],
    lowerTo: ['memref'],
    color: '#1976d2',
  },
  {
    id: 'scf', name: 'SCF', level: 'mid',
    description: { zh: '结构化控制流（for、while、if），保留循环结构便于分析优化', en: 'Structured Control Flow (for, while, if), preserving loop structure for analysis' },
    exampleOps: ['scf.for', 'scf.while', 'scf.if', 'scf.yield'],
    lowerTo: ['cf'],
    color: '#7b1fa2',
  },
  {
    id: 'memref', name: 'MemRef', level: 'mid',
    description: { zh: '内存引用类型（引用语义），表示指向内存 buffer 的指针和布局信息', en: 'Memory reference types with reference semantics, representing buffer pointers and layout' },
    exampleOps: ['memref.alloc', 'memref.load', 'memref.store', 'memref.dealloc'],
    lowerTo: ['llvm'],
    color: '#00838f',
  },
  {
    id: 'arith', name: 'Arith', level: 'mid',
    description: { zh: '标量算术运算，包括浮点和整数的基本数学操作', en: 'Scalar arithmetic operations including basic float and integer math' },
    exampleOps: ['arith.addf', 'arith.mulf', 'arith.constant', 'arith.cmpf'],
    lowerTo: ['llvm'],
    color: '#e65100',
  },
  {
    id: 'cf', name: 'CF', level: 'low',
    description: { zh: '非结构化控制流（br、cond_br），对应传统编译器的基本块跳转', en: 'Unstructured control flow (br, cond_br), corresponding to basic block jumps' },
    exampleOps: ['cf.br', 'cf.cond_br'],
    lowerTo: ['llvm'],
    color: '#6a1b9a',
  },
  {
    id: 'gpu', name: 'GPU', level: 'mid',
    description: { zh: 'GPU 编程抽象（kernel launch、barrier、线程 ID），不绑定具体硬件', en: 'GPU programming abstractions (kernel launch, barrier, thread ID), hardware-agnostic' },
    exampleOps: ['gpu.launch', 'gpu.barrier', 'gpu.thread_id', 'gpu.block_id'],
    lowerTo: ['nvvm', 'rocdl', 'spirv'],
    color: '#2e7d32',
  },
  {
    id: 'llvm', name: 'LLVM', level: 'low',
    description: { zh: 'LLVM IR 的 MLIR 表示，可直接翻译为 LLVM bitcode 进行后端代码生成', en: 'LLVM IR representation in MLIR, directly translatable to LLVM bitcode for codegen' },
    exampleOps: ['llvm.load', 'llvm.store', 'llvm.fadd', 'llvm.call'],
    lowerTo: [],
    color: '#c62828',
  },
  {
    id: 'nvvm', name: 'NVVM', level: 'hardware',
    description: { zh: 'NVIDIA GPU 特定指令集，对应 PTX 底层操作', en: 'NVIDIA GPU specific instructions, corresponding to PTX operations' },
    exampleOps: ['nvvm.read.ptx.sreg.tid.x', 'nvvm.barrier0'],
    lowerTo: [],
    color: '#76b900',
  },
];

const LEVEL_ORDER: Dialect['level'][] = ['high', 'mid', 'low', 'hardware'];

const LEVEL_LABELS: Record<string, { zh: string; en: string }> = {
  high: { zh: '高层抽象', en: 'High-Level' },
  mid: { zh: '中层抽象', en: 'Mid-Level' },
  low: { zh: '低层抽象', en: 'Low-Level' },
  hardware: { zh: '硬件特定', en: 'Hardware-Specific' },
};

const LEVEL_COLORS: Record<string, string> = {
  high: '#1565c0',
  mid: '#7b1fa2',
  low: '#c62828',
  hardware: '#2e7d32',
};

/* ─── SVG Layout Constants ─── */

const W = 800;
const H = 550;
const CARD_W = 90;
const CARD_H = 36;
const LAYER_Y: Record<string, number> = {
  high: 60,
  mid: 175,
  low: 320,
  hardware: 430,
};

/* ─── Component ─── */

export default function DialectExplorer({ locale = 'zh' }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const t = {
    zh: {
      title: 'MLIR Dialect 层次结构',
      clickHint: '点击 Dialect 查看详情',
      ops: '主要操作',
      lowersTo: '可下降到',
      noTarget: '（终端 Dialect）',
      description: '描述',
    },
    en: {
      title: 'MLIR Dialect Hierarchy',
      clickHint: 'Click a dialect to see details',
      ops: 'Key Operations',
      lowersTo: 'Lowers To',
      noTarget: '(Terminal dialect)',
      description: 'Description',
    },
  }[locale]!;

  const selected = DIALECTS.find((d) => d.id === selectedId) ?? null;

  // Compute card positions by level
  const cardPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const level of LEVEL_ORDER) {
      const group = DIALECTS.filter((d) => d.level === level);
      const totalW = group.length * CARD_W + (group.length - 1) * 20;
      const startX = (W - totalW) / 2;
      group.forEach((d, i) => {
        positions[d.id] = {
          x: startX + i * (CARD_W + 20),
          y: LAYER_Y[level],
        };
      });
    }
    return positions;
  }, []);

  // Compute lowering arrows
  const arrows = useMemo(() => {
    const result: { from: string; to: string; fromPos: { x: number; y: number }; toPos: { x: number; y: number } }[] = [];
    for (const d of DIALECTS) {
      for (const targetId of d.lowerTo) {
        const fromPos = cardPositions[d.id];
        const toPos = cardPositions[targetId];
        if (fromPos && toPos) {
          result.push({
            from: d.id,
            to: targetId,
            fromPos: { x: fromPos.x + CARD_W / 2, y: fromPos.y + CARD_H },
            toPos: { x: toPos.x + CARD_W / 2, y: toPos.y },
          });
        }
      }
    }
    return result;
  }, [cardPositions]);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <defs>
          <marker id="dialect-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,1 L7,4 L0,7" fill={COLORS.mid} opacity={0.5} />
          </marker>
          <marker id="dialect-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,1 L7,4 L0,7" fill={COLORS.primary} opacity={0.9} />
          </marker>
          <filter id="dialect-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.clickHint}
        </text>

        {/* Level labels */}
        {LEVEL_ORDER.map((level) => (
          <g key={level}>
            <rect
              x={8}
              y={LAYER_Y[level] - 2}
              width={68}
              height={CARD_H + 4}
              rx={4}
              fill={LEVEL_COLORS[level]}
              fillOpacity={0.06}
              stroke={LEVEL_COLORS[level]}
              strokeWidth={1}
              strokeOpacity={0.2}
            />
            <text
              x={42}
              y={LAYER_Y[level] + CARD_H / 2 + 1}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={LEVEL_COLORS[level]}
              dominantBaseline="middle"
            >
              {LEVEL_LABELS[level][locale]}
            </text>
          </g>
        ))}

        {/* Arrows (lowering edges) */}
        {arrows.map((a, i) => {
          const isActive = selectedId === a.from || selectedId === a.to;
          const midY = (a.fromPos.y + a.toPos.y) / 2;
          return (
            <path
              key={i}
              d={`M${a.fromPos.x},${a.fromPos.y} C${a.fromPos.x},${midY} ${a.toPos.x},${midY} ${a.toPos.x},${a.toPos.y}`}
              fill="none"
              stroke={isActive ? COLORS.primary : COLORS.mid}
              strokeWidth={isActive ? 2 : 1}
              strokeOpacity={isActive ? 0.8 : 0.25}
              markerEnd={isActive ? 'url(#dialect-arrow-active)' : 'url(#dialect-arrow)'}
              style={{ transition: 'all 0.2s' }}
            />
          );
        })}

        {/* Dialect cards */}
        {DIALECTS.map((d) => {
          const pos = cardPositions[d.id];
          const isSelected = d.id === selectedId;
          const isTarget = selected?.lowerTo.includes(d.id);
          const isSource = d.lowerTo.includes(selectedId ?? '');

          return (
            <g
              key={d.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => setSelectedId(isSelected ? null : d.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={0}
                y={0}
                width={CARD_W}
                height={CARD_H}
                rx={6}
                fill={isSelected ? d.color : COLORS.bg}
                stroke={d.color}
                strokeWidth={isSelected ? 2.5 : isTarget || isSource ? 2 : 1.2}
                strokeOpacity={isSelected ? 1 : isTarget || isSource ? 0.8 : 0.5}
                filter="url(#dialect-shadow)"
                style={{ transition: 'all 0.2s' }}
              />
              <text
                x={CARD_W / 2}
                y={CARD_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="700"
                fill={isSelected ? '#fff' : d.color}
                style={{ transition: 'fill 0.2s' }}
              >
                {d.name}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {selected && (
          <g>
            {/* Panel background */}
            <rect
              x={20}
              y={H - 95}
              width={W - 40}
              height={85}
              rx={8}
              fill={COLORS.bg}
              stroke={selected.color}
              strokeWidth={1.5}
              filter="url(#dialect-shadow)"
            />
            {/* Color accent bar */}
            <rect
              x={20}
              y={H - 95}
              width={6}
              height={85}
              rx={3}
              fill={selected.color}
            />

            {/* Dialect name */}
            <text x={40} y={H - 75} fontSize="13" fontWeight="700" fill={selected.color}>
              {selected.name} Dialect
            </text>

            {/* Description */}
            <text x={40} y={H - 58} fontSize="10.5" fill={COLORS.dark}>
              {selected.description[locale]}
            </text>

            {/* Example ops */}
            <text x={40} y={H - 40} fontSize="9" fontWeight="600" fill={COLORS.mid}>
              {t.ops}:
            </text>
            <text x={40 + (locale === 'zh' ? 55 : 90)} y={H - 40} fontSize="9.5" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
              {selected.exampleOps.join('  |  ')}
            </text>

            {/* Lowers to */}
            <text x={40} y={H - 22} fontSize="9" fontWeight="600" fill={COLORS.mid}>
              {t.lowersTo}:
            </text>
            <text x={40 + (locale === 'zh' ? 55 : 70)} y={H - 22} fontSize="10" fill={COLORS.dark}>
              {selected.lowerTo.length > 0
                ? selected.lowerTo.map((id) => DIALECTS.find((d) => d.id === id)?.name ?? id).join(', ')
                : t.noTarget}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
