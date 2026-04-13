import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface IRNode {
  id: string;
  irOp: string;
  description: { zh: string; en: string };
}

interface InstructionOption {
  id: string;
  instruction: string;
  ptxEquivalent: string;
  unit: string;
  throughput: string;
  latency: string;
  isPreferred: boolean;
  reason: { zh: string; en: string };
}

interface SelectionStep {
  irNode: IRNode;
  options: InstructionOption[];
  selectedId: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const STEPS: SelectionStep[] = [
  {
    irNode: {
      id: 'matmul',
      irOp: 'linalg.matmul<f16>',
      description: { zh: 'FP16 矩阵乘法', en: 'FP16 matrix multiplication' },
    },
    options: [
      {
        id: 'hmma',
        instruction: 'HMMA.16816.F32',
        ptxEquivalent: 'mma.sync.aligned.m16n8k16.f32.f16',
        unit: 'Tensor Core',
        throughput: '1024 FLOPs/cycle/SM',
        latency: '16 cycles',
        isPreferred: true,
        reason: {
          zh: 'FP16 输入 + FP32 累加，Tensor Core 最佳选择',
          en: 'FP16 input + FP32 accumulation, best choice for Tensor Core',
        },
      },
      {
        id: 'ffma_f16',
        instruction: 'HFMA2 (FP16 FMA)',
        ptxEquivalent: 'fma.rn.f16x2',
        unit: 'FP16 ALU',
        throughput: '128 FLOPs/cycle/SM',
        latency: '4 cycles',
        isPreferred: false,
        reason: {
          zh: '标量 FP16 FMA，吞吐量只有 Tensor Core 的一半',
          en: 'Scalar FP16 FMA, half the throughput of Tensor Core',
        },
      },
    ],
    selectedId: 'hmma',
  },
  {
    irNode: {
      id: 'add',
      irOp: 'arith.addf<f32>',
      description: { zh: 'FP32 加法（bias add）', en: 'FP32 addition (bias add)' },
    },
    options: [
      {
        id: 'fadd',
        instruction: 'FADD',
        ptxEquivalent: 'add.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: true,
        reason: {
          zh: '标准 FP32 加法指令，直接映射',
          en: 'Standard FP32 add instruction, direct mapping',
        },
      },
      {
        id: 'ffma_bias',
        instruction: 'FFMA (a + b*1.0)',
        ptxEquivalent: 'fma.rn.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: false,
        reason: {
          zh: '可以用 FMA 模拟加法，但无性能优势',
          en: 'Can emulate add with FMA, but no performance benefit',
        },
      },
    ],
    selectedId: 'fadd',
  },
  {
    irNode: {
      id: 'exp',
      irOp: 'math.exp<f32>',
      description: { zh: 'FP32 指数函数（softmax 组件）', en: 'FP32 exponential (softmax component)' },
    },
    options: [
      {
        id: 'mufu',
        instruction: 'MUFU.EX2 + MUL',
        ptxEquivalent: 'ex2.approx.f32 + mul.f32',
        unit: 'SFU (Special Function Unit)',
        throughput: '16 ops/cycle/SM',
        latency: '~20 cycles',
        isPreferred: true,
        reason: {
          zh: 'SFU 硬件加速 exp2，再乘 log2(e) 系数得到 exp。吞吐量低但延迟可接受。',
          en: 'SFU hardware-accelerated exp2, then multiply by log2(e). Lower throughput but acceptable latency.',
        },
      },
      {
        id: 'poly',
        instruction: 'Polynomial Approx (6 FFMA)',
        ptxEquivalent: '6× fma.rn.f32',
        unit: 'FP32 ALU',
        throughput: '~10 ops/cycle/SM (effective)',
        latency: '~24 cycles',
        isPreferred: false,
        reason: {
          zh: '多项式逼近：更高精度但需要 6 条 FMA 指令，占用更多 ALU',
          en: 'Polynomial approx: higher precision but needs 6 FMA instructions, more ALU pressure',
        },
      },
    ],
    selectedId: 'mufu',
  },
  {
    irNode: {
      id: 'relu',
      irOp: 'arith.maxf(x, 0.0)<f32>',
      description: { zh: 'ReLU 激活', en: 'ReLU activation' },
    },
    options: [
      {
        id: 'fmnmx',
        instruction: 'FMNMX (fused min/max)',
        ptxEquivalent: 'max.f32',
        unit: 'FP32 ALU',
        throughput: '64 ops/cycle/SM',
        latency: '4 cycles',
        isPreferred: true,
        reason: {
          zh: '硬件 min/max 指令，单条指令完成 ReLU',
          en: 'Hardware min/max instruction, single instruction for ReLU',
        },
      },
      {
        id: 'branch',
        instruction: 'FSETP + SEL (branch)',
        ptxEquivalent: 'setp.gt.f32 + selp.f32',
        unit: 'FP32 ALU',
        throughput: '32 ops/cycle/SM',
        latency: '~8 cycles',
        isPreferred: false,
        reason: {
          zh: '条件分支实现：先比较再选择，2 条指令且可能 warp divergence',
          en: 'Conditional branch: compare then select, 2 instructions with potential warp divergence',
        },
      },
    ],
    selectedId: 'fmnmx',
  },
];

/* ─── Execution Units ─── */

interface ExecUnit {
  id: string;
  label: string;
  x: number;
  width: number;
}

const EXEC_UNITS: ExecUnit[] = [
  { id: 'Tensor Core', label: 'Tensor Core', x: 30, width: 160 },
  { id: 'FP32 ALU', label: 'FP32 ALU', x: 210, width: 140 },
  { id: 'FP16 ALU', label: 'FP16 ALU', x: 370, width: 120 },
  { id: 'SFU (Special Function Unit)', label: 'SFU', x: 510, width: 100 },
];

/* ─── IR Icons ─── */

function IRIcon({ id, x, y }: { id: string; x: number; y: number }) {
  const size = 30;
  const cx = x + size / 2;
  const cy = y + size / 2;

  switch (id) {
    case 'matmul':
      return (
        <g>
          {/* Grid icon for matrix */}
          {[0, 1, 2].map(r =>
            [0, 1, 2].map(c => (
              <rect
                key={`${r}-${c}`}
                x={x + c * 10 + 1}
                y={y + r * 10 + 1}
                width={8}
                height={8}
                rx={1}
                fill={COLORS.primary}
                fillOpacity={0.3 + (r + c) * 0.1}
              />
            ))
          )}
        </g>
      );
    case 'add':
      return (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="bold"
          fill={COLORS.primary}
          opacity={0.7}
        >
          +
        </text>
      );
    case 'exp':
      return (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fontFamily={FONTS.mono}
          fill={COLORS.primary}
          opacity={0.7}
        >
          {'eˣ'}
        </text>
      );
    case 'relu':
      return (
        <g>
          {/* Ramp shape for ReLU */}
          <polyline
            points={`${x + 5},${y + 25} ${x + 15},${y + 25} ${x + 25},${y + 5}`}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            strokeOpacity={0.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    default:
      return null;
  }
}

/* ─── Component ─── */

export default function InstructionSelectionDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '指令选择演示：IR → GPU 指令',
      step: '步骤',
      irOp: 'IR 操作',
      candidates: '候选指令',
      selected: '✓ 已选',
      notSelected: '未选',
      sass: 'SASS',
      ptx: 'PTX',
      execUnit: '执行单元',
      throughputLabel: '吞吐量',
      latencyLabel: '延迟',
      smDiagram: 'SM 执行单元',
      active: '活跃',
    },
    en: {
      title: 'Instruction Selection: IR → GPU Instructions',
      step: 'Step',
      irOp: 'IR Operation',
      candidates: 'Candidate Instructions',
      selected: '✓ Selected',
      notSelected: 'Not chosen',
      sass: 'SASS',
      ptx: 'PTX',
      execUnit: 'Exec Unit',
      throughputLabel: 'Throughput',
      latencyLabel: 'Latency',
      smDiagram: 'SM Execution Units',
      active: 'Active',
    },
  }[locale]!;

  const [stepIdx, setStepIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const step = STEPS[stepIdx];
  const preferred = step.options.find(o => o.isPreferred)!;

  useEffect(() => {
    setRevealed(false);
    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, [stepIdx]);

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    }
  };
  const goPrev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    }
  };

  return (
    <div className="my-6">
      {/* Header with step indicator */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="text-sm font-semibold" style={{ color: COLORS.dark }}>
          {t.title}
        </h4>
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className="w-7 h-7 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: i === stepIdx ? COLORS.primary : i < stepIdx ? '#dbeafe' : '#e5e7eb',
                color: i === stepIdx ? '#fff' : i < stepIdx ? COLORS.primary : COLORS.mid,
              }}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-xs ml-1" style={{ color: COLORS.mid }}>
            {t.step} {stepIdx + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <svg viewBox="0 0 800 520" className="w-full">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>

            <defs>
              <marker
                id="instrArrow"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.primary} fillOpacity="0.6" />
              </marker>
            </defs>

            {/* ─── Left Panel: IR Operation ─── */}
            <rect
              x={20}
              y={30}
              width={280}
              height={180}
              rx={10}
              fill={COLORS.primary}
              fillOpacity={0.05}
              stroke={COLORS.primary}
              strokeWidth={1.5}
              strokeOpacity={0.3}
            />
            <text x={160} y={55} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.primary}>
              {t.irOp}
            </text>

            {/* IR Icon */}
            <IRIcon id={step.irNode.id} x={65} y={75} />

            {/* IR Op Name */}
            <text
              x={110}
              y={92}
              fontSize="14"
              fontWeight="700"
              fontFamily={FONTS.mono}
              fill={COLORS.dark}
            >
              {step.irNode.irOp}
            </text>

            {/* Description */}
            <text x={45} y={130} fontSize="11" fill={COLORS.mid}>
              {step.irNode.description[locale]}
            </text>

            {/* Lowering label */}
            <rect x={55} y={155} width={190} height={28} rx={5} fill={COLORS.highlight} fillOpacity={0.6} />
            <text x={150} y={173} textAnchor="middle" fontSize="10" fill={COLORS.dark} fontWeight="500">
              {locale === 'zh' ? '需要映射到 GPU 硬件指令' : 'Must map to GPU hardware instruction'}
            </text>

            {/* ─── Center: Selection Arrow ─── */}
            <motion.path
              d="M 310 120 C 370 120, 380 120, 500 120"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth={2}
              strokeOpacity={revealed ? 0.7 : 0.3}
              strokeDasharray={revealed ? 'none' : '6,4'}
              markerEnd="url(#instrArrow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Center icon: ? → ✓ */}
            <motion.g
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <circle cx={405} cy={105} r={16} fill={revealed ? COLORS.green : COLORS.orange} fillOpacity={0.15} stroke={revealed ? COLORS.green : COLORS.orange} strokeWidth={1.5} strokeOpacity={0.5} />
              <text
                x={405}
                y={106}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="700"
                fill={revealed ? COLORS.green : COLORS.orange}
              >
                {revealed ? '✓' : '?'}
              </text>
            </motion.g>

            {/* ─── Right Panel: Instruction Candidates ─── */}
            {step.options.map((opt, i) => {
              const cardY = 20 + i * 195;
              const isSelected = opt.id === step.selectedId;
              const cardOpacity = revealed ? (isSelected ? 1 : 0.4) : 0.85;
              const borderColor = revealed && isSelected ? COLORS.green : COLORS.light;
              const borderOpacity = revealed && isSelected ? 0.8 : 0.5;

              return (
                <motion.g
                  key={opt.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: cardOpacity, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                >
                  {/* Card background */}
                  <rect
                    x={510}
                    y={cardY}
                    width={270}
                    height={180}
                    rx={8}
                    fill={COLORS.bgAlt}
                    stroke={borderColor}
                    strokeWidth={revealed && isSelected ? 2 : 1}
                    strokeOpacity={borderOpacity}
                  />

                  {/* Selection badge */}
                  {revealed && (
                    <g>
                      <rect
                        x={650}
                        y={cardY + 6}
                        width={isSelected ? 80 : 60}
                        height={20}
                        rx={10}
                        fill={isSelected ? COLORS.green : COLORS.mid}
                        fillOpacity={isSelected ? 0.15 : 0.1}
                      />
                      <text
                        x={isSelected ? 690 : 680}
                        y={cardY + 19}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill={isSelected ? COLORS.green : COLORS.mid}
                      >
                        {isSelected ? t.selected : t.notSelected}
                      </text>
                    </g>
                  )}

                  {/* SASS instruction name (primary) */}
                  <text
                    x={525}
                    y={cardY + 20}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily={FONTS.mono}
                    fill={COLORS.dark}
                  >
                    {opt.instruction}
                  </text>

                  {/* SASS label */}
                  <text x={525} y={cardY + 36} fontSize="8" fill={COLORS.mid} fontWeight="500">
                    {t.sass}
                  </text>

                  {/* PTX equivalent (secondary, smaller) */}
                  <text
                    x={555}
                    y={cardY + 36}
                    fontSize="9"
                    fontFamily={FONTS.mono}
                    fill={COLORS.mid}
                    fillOpacity={0.8}
                  >
                    {t.ptx}: {opt.ptxEquivalent}
                  </text>

                  {/* Execution unit */}
                  <text x={525} y={cardY + 56} fontSize="10" fill={COLORS.dark}>
                    <tspan fontWeight="600">{t.execUnit}: </tspan>
                    <tspan fill={COLORS.primary}>{opt.unit}</tspan>
                  </text>

                  {/* Throughput */}
                  <text x={525} y={cardY + 76} fontSize="10" fill={COLORS.dark}>
                    <tspan fontWeight="600">{t.throughputLabel}: </tspan>
                    {opt.throughput}
                  </text>

                  {/* Latency */}
                  <text x={525} y={cardY + 96} fontSize="10" fill={COLORS.dark}>
                    <tspan fontWeight="600">{t.latencyLabel}: </tspan>
                    {opt.latency}
                  </text>

                  {/* Reason */}
                  <line x1={525} y1={cardY + 108} x2={765} y2={cardY + 108} stroke={COLORS.light} strokeWidth={0.5} />
                  {/* Wrap reason text manually for SVG */}
                  {wrapText(opt.reason[locale], 30).map((line, li) => (
                    <text
                      key={li}
                      x={525}
                      y={cardY + 124 + li * 14}
                      fontSize="10"
                      fill={isSelected && revealed ? COLORS.green : COLORS.mid}
                      fillOpacity={0.9}
                    >
                      {line}
                    </text>
                  ))}
                </motion.g>
              );
            })}

            {/* ─── Bottom: SM Execution Unit Diagram ─── */}
            <rect
              x={20}
              y={435}
              width={760}
              height={70}
              rx={8}
              fill={COLORS.dark}
              fillOpacity={0.03}
              stroke={COLORS.dark}
              strokeWidth={1}
              strokeOpacity={0.15}
            />
            <text x={40} y={453} fontSize="10" fontWeight="600" fill={COLORS.dark} fillOpacity={0.6}>
              {t.smDiagram}
            </text>

            {EXEC_UNITS.map(unit => {
              const isActive = preferred.unit === unit.id;
              return (
                <g key={unit.id}>
                  <motion.rect
                    x={unit.x}
                    y={462}
                    width={unit.width}
                    height={32}
                    rx={5}
                    fill={isActive ? COLORS.primary : COLORS.bgAlt}
                    fillOpacity={isActive ? 0.15 : 0.6}
                    stroke={isActive ? COLORS.primary : COLORS.mid}
                    strokeWidth={isActive ? 2 : 0.8}
                    strokeOpacity={isActive ? 0.8 : 0.3}
                    animate={{
                      fillOpacity: isActive ? [0.1, 0.2, 0.1] : 0.6,
                    }}
                    transition={isActive ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                  />
                  <text
                    x={unit.x + unit.width / 2}
                    y={481}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isActive ? '700' : '500'}
                    fontFamily={FONTS.mono}
                    fill={isActive ? COLORS.primary : COLORS.mid}
                  >
                    {unit.label}
                  </text>
                  {isActive && (
                    <text
                      x={unit.x + unit.width / 2}
                      y={500}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="600"
                      fill={COLORS.green}
                    >
                      ▲ {t.active}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setStepIdx(0)}
          disabled={stepIdx === 0}
          className="text-sm disabled:opacity-30"
          style={{ color: COLORS.mid }}
        >
          {locale === 'zh' ? '重置' : 'Reset'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={stepIdx === 0}
            className="px-3 py-1 text-sm border rounded disabled:opacity-30"
            style={{ borderColor: COLORS.light, color: COLORS.dark }}
          >
            {locale === 'zh' ? '上一步' : 'Previous'}
          </button>
          <button
            onClick={goNext}
            disabled={stepIdx === STEPS.length - 1}
            className="px-3 py-1 text-sm rounded text-white disabled:opacity-30"
            style={{ backgroundColor: COLORS.primary }}
          >
            {locale === 'zh' ? '下一步' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function wrapText(text: string, maxChars: number): string[] {
  // For CJK text, split by characters at punctuation boundaries
  // For English text, split by words to avoid mid-word breaks
  const isCJK = /[\u4e00-\u9fff]/.test(text);
  const lines: string[] = [];
  let currentLine = '';

  if (isCJK) {
    for (const char of text) {
      if (currentLine.length >= maxChars && /[，。、；：！？ ]/.test(char)) {
        lines.push(currentLine + char);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
  } else {
    for (const word of text.split(/(\s+)/)) {
      if (currentLine.length + word.length > maxChars && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word.trimStart();
      } else {
        currentLine += word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // Max 3 lines
}
