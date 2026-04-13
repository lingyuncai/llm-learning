import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface IRLevel {
  id: string;
  label: { zh: string; en: string };
  track: 'pytorch' | 'mlir' | 'llvm';
  code: string;
  highlights: { line: number; color: string; note: { zh: string; en: string } }[];
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const TRACK_COLORS = {
  pytorch: '#1976d2',
  mlir: '#7b1fa2',
  llvm: '#c62828',
} as const;

const TRACK_LABELS = {
  pytorch: { zh: 'PyTorch', en: 'PyTorch' },
  mlir: { zh: 'MLIR', en: 'MLIR' },
  llvm: { zh: 'LLVM', en: 'LLVM' },
} as const;

const IR_LEVELS: IRLevel[] = [
  {
    id: 'python',
    label: { zh: 'Python 源码', en: 'Python Source' },
    track: 'pytorch',
    code: `def fn(x, w):
    y = torch.matmul(x, w)
    return torch.relu(y)`,
    highlights: [],
  },
  {
    id: 'fx',
    label: { zh: 'FX Graph (PyTorch)', en: 'FX Graph (PyTorch)' },
    track: 'pytorch',
    code: `graph():
    %x : [#users=1] = placeholder[target=x]
    %w : [#users=1] = placeholder[target=w]
    %matmul : [#users=1] = call_function[target=torch.matmul](x, w)
    %relu : [#users=1] = call_function[target=torch.relu](matmul)
    return (relu,)`,
    highlights: [
      { line: 1, color: COLORS.primary, note: { zh: 'placeholder = 函数参数', en: 'placeholder = function arguments' } },
      { line: 3, color: COLORS.green, note: { zh: 'call_function = 算子调用', en: 'call_function = operator call' } },
    ],
  },
  {
    id: 'linalg',
    label: { zh: 'MLIR Linalg Dialect', en: 'MLIR Linalg Dialect' },
    track: 'mlir',
    code: `func.func @fn(%x: tensor<128x768xf32>,
               %w: tensor<768x768xf32>)
    -> tensor<128x768xf32> {
  %c0 = arith.constant 0.0 : f32
  %init = tensor.empty() : tensor<128x768xf32>
  %fill = linalg.fill ins(%c0)
      outs(%init) -> tensor<128x768xf32>
  %matmul = linalg.matmul
      ins(%x, %w : tensor<128x768xf32>,
                    tensor<768x768xf32>)
      outs(%fill) -> tensor<128x768xf32>
  %relu = linalg.generic {
    indexing_maps = [...],
    iterator_types = ["parallel", "parallel"]
  } ins(%matmul : tensor<128x768xf32>) {
    ^bb0(%in: f32):
      %zero = arith.constant 0.0 : f32
      %res = arith.maximumf %in, %zero : f32
      linalg.yield %res : f32
  } -> tensor<128x768xf32>
  return %relu : tensor<128x768xf32>
}`,
    highlights: [
      { line: 0, color: COLORS.purple, note: { zh: 'tensor 类型 = 值语义', en: 'tensor type = value semantics' } },
      { line: 7, color: COLORS.green, note: { zh: 'linalg.matmul = tensor-level 算子', en: 'linalg.matmul = tensor-level op' } },
    ],
  },
  {
    id: 'memref',
    label: { zh: 'MLIR Memref (Bufferized)', en: 'MLIR Memref (Bufferized)' },
    track: 'mlir',
    code: `func.func @fn(%x: memref<128x768xf32>,
               %w: memref<768x768xf32>,
               %out: memref<128x768xf32>) {
  linalg.matmul
      ins(%x, %w : memref<128x768xf32>,
                    memref<768x768xf32>)
      outs(%out : memref<128x768xf32>)
  linalg.generic {...}
      ins(%out : memref<128x768xf32>)
      outs(%out : memref<128x768xf32>)
  return
}`,
    highlights: [
      { line: 0, color: COLORS.orange, note: { zh: 'memref = 引用语义，指向内存 buffer', en: 'memref = reference semantics, points to memory buffer' } },
    ],
  },
  {
    id: 'llvm',
    label: { zh: 'LLVM IR', en: 'LLVM IR' },
    track: 'llvm',
    code: `define void @fn(float* %x, float* %w,
                float* %out) {
entry:
  ; nested loops for matmul
  br label %loop.i
loop.i:
  %i = phi i64 [0, %entry], [%i.next, %loop.i.end]
  ...
  %val = fmul float %a, %b
  %acc = fadd float %prev, %val
  ...
  ; relu: max(val, 0.0)
  %relu = call float @llvm.maximum.f32(
              float %acc, float 0.0)
  store float %relu, float* %out.ptr
  ...
}`,
    highlights: [
      { line: 6, color: COLORS.red, note: { zh: 'phi = SSA 控制流汇合', en: 'phi = SSA control flow merge' } },
    ],
  },
];

/* ─── Component ─── */

export default function IRLayerVisualizer({ locale = 'zh' }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoveredHighlight, setHoveredHighlight] = useState<number | null>(null);

  const t = {
    zh: {
      title: '多层 IR 对比：matmul + relu',
      abstraction: '抽象层次',
      high: '高',
      low: '低',
      track: '所属栈',
      notes: '注释',
      clickToSwitch: '点击左侧标签切换 IR 层级',
    },
    en: {
      title: 'Multi-level IR Comparison: matmul + relu',
      abstraction: 'Abstraction Level',
      high: 'High',
      low: 'Low',
      track: 'Stack',
      notes: 'Notes',
      clickToSwitch: 'Click tabs on the left to switch IR levels',
    },
  }[locale]!;

  const selected = IR_LEVELS[selectedIdx];
  const codeLines = selected.code.split('\n');

  // Determine highlighted line indices
  const highlightedLineMap = new Map<number, { color: string; note: string }>();
  selected.highlights.forEach((h) => {
    highlightedLineMap.set(h.line, { color: h.color, note: h.note[locale] });
  });

  return (
    <div className="my-6 rounded-lg border overflow-hidden" style={{ borderColor: COLORS.light, background: COLORS.bg }}>
      {/* Header */}
      <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: COLORS.light, background: COLORS.bgAlt }}>
        <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 14, color: COLORS.dark }}>
          {t.title}
        </span>
        <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.mid }}>
          {t.clickToSwitch}
        </span>
      </div>

      <div className="flex" style={{ minHeight: 420 }}>
        {/* Left: Tab selector */}
        <div className="flex flex-col border-r" style={{ width: 200, borderColor: COLORS.light, background: COLORS.bgAlt }}>
          {/* Abstraction arrow */}
          <div className="px-3 pt-3 pb-1 flex items-center justify-between" style={{ fontSize: 10, color: COLORS.mid, fontFamily: FONTS.sans }}>
            <span>{t.high} {t.abstraction}</span>
          </div>

          {IR_LEVELS.map((level, idx) => {
            const isSelected = idx === selectedIdx;
            const trackColor = TRACK_COLORS[level.track];
            return (
              <button
                key={level.id}
                onClick={() => { setSelectedIdx(idx); setHoveredHighlight(null); }}
                className="text-left px-3 py-2 border-b transition-colors relative"
                style={{
                  borderColor: COLORS.light,
                  background: isSelected ? COLORS.bg : 'transparent',
                  cursor: 'pointer',
                  borderLeft: isSelected ? `3px solid ${trackColor}` : '3px solid transparent',
                }}
              >
                <div style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? COLORS.dark : COLORS.mid }}>
                  {level.label[locale]}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="inline-block rounded px-1"
                    style={{
                      fontSize: 9,
                      fontFamily: FONTS.sans,
                      color: trackColor,
                      background: `${trackColor}15`,
                      fontWeight: 600,
                    }}
                  >
                    {TRACK_LABELS[level.track][locale]}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Low abstraction label */}
          <div className="px-3 pt-2 pb-3" style={{ fontSize: 10, color: COLORS.mid, fontFamily: FONTS.sans }}>
            <span>{t.low} {t.abstraction}</span>
          </div>

          {/* Downward arrow indicator */}
          <div className="flex-1 flex items-start justify-center">
            <svg width="20" height="80" viewBox="0 0 20 80">
              <defs>
                <linearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <line x1="10" y1="0" x2="10" y2="65" stroke="url(#arrowGrad)" strokeWidth="2" />
              <polygon points="5,60 10,72 15,60" fill={COLORS.red} opacity={0.6} />
            </svg>
          </div>
        </div>

        {/* Right: Code panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-auto p-4"
              style={{ background: '#1e1e2e' }}
            >
              {/* Track badge */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="inline-block rounded px-2 py-0.5"
                  style={{
                    fontSize: 11,
                    fontFamily: FONTS.sans,
                    fontWeight: 600,
                    color: '#fff',
                    background: TRACK_COLORS[selected.track],
                  }}
                >
                  {t.track}: {TRACK_LABELS[selected.track][locale]}
                </span>
                <span style={{ fontSize: 11, fontFamily: FONTS.sans, color: '#888' }}>
                  {selected.label[locale]}
                </span>
              </div>

              {/* Code with line numbers */}
              <pre style={{ margin: 0, padding: 0, background: 'transparent' }}>
                <code style={{ fontFamily: FONTS.mono, fontSize: 12, lineHeight: '20px' }}>
                  {codeLines.map((line, lineIdx) => {
                    const highlight = highlightedLineMap.get(lineIdx);
                    const isHighlightHovered = hoveredHighlight === lineIdx;
                    return (
                      <div
                        key={lineIdx}
                        className="flex"
                        style={{
                          background: highlight
                            ? isHighlightHovered
                              ? `${highlight.color}30`
                              : `${highlight.color}18`
                            : 'transparent',
                          borderLeft: highlight ? `3px solid ${highlight.color}` : '3px solid transparent',
                          paddingLeft: 8,
                          cursor: highlight ? 'pointer' : 'default',
                          borderRadius: 2,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={() => highlight && setHoveredHighlight(lineIdx)}
                        onMouseLeave={() => setHoveredHighlight(null)}
                      >
                        {/* Line number */}
                        <span
                          style={{
                            display: 'inline-block',
                            width: 28,
                            textAlign: 'right',
                            marginRight: 12,
                            color: '#555',
                            userSelect: 'none',
                            flexShrink: 0,
                          }}
                        >
                          {lineIdx + 1}
                        </span>
                        {/* Code text */}
                        <span style={{ color: highlight ? '#e0e0e0' : '#ccc', whiteSpace: 'pre' }}>
                          {line}
                        </span>
                        {/* Inline note */}
                        {highlight && isHighlightHovered && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                              marginLeft: 16,
                              fontSize: 11,
                              color: highlight.color,
                              fontFamily: FONTS.sans,
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            ← {highlight.note}
                          </motion.span>
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </motion.div>
          </AnimatePresence>

          {/* Bottom: Highlight notes summary */}
          {selected.highlights.length > 0 && (
            <div className="px-4 py-2 border-t" style={{ borderColor: COLORS.light, background: COLORS.bgAlt }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.mid, fontFamily: FONTS.sans, marginBottom: 4 }}>
                {t.notes}
              </div>
              <div className="flex flex-wrap gap-3">
                {selected.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 transition-colors"
                    style={{
                      background: hoveredHighlight === h.line ? `${h.color}15` : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredHighlight(h.line)}
                    onMouseLeave={() => setHoveredHighlight(null)}
                  >
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 8, height: 8, background: h.color, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 11, color: COLORS.dark, fontFamily: FONTS.sans }}>
                      L{h.line + 1}: {h.note[locale]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
