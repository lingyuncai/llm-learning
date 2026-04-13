import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

/* ─── Types ─── */

interface LoweringLevel {
  id: string;
  label: { zh: string; en: string };
  dialect: string;
  irSnippet: string;
  whatChanged: { zh: string; en: string };
  whatLost: { zh: string; en: string };
  whatGained: { zh: string; en: string };
}

interface LoweringExample {
  label: { zh: string; en: string };
  levels: LoweringLevel[];
}

/* ─── Data ─── */

const EXAMPLES: LoweringExample[] = [
  {
    label: { zh: '矩阵乘法 (matmul)', en: 'Matrix Multiplication (matmul)' },
    levels: [
      {
        id: 'linalg-tensor',
        label: { zh: 'Linalg on Tensors', en: 'Linalg on Tensors' },
        dialect: 'linalg + tensor',
        irSnippet: `%result = linalg.matmul
    ins(%A, %B : tensor<128x768xf32>, tensor<768x768xf32>)
    outs(%C : tensor<128x768xf32>) -> tensor<128x768xf32>`,
        whatChanged: { zh: '起点：tensor-level 的矩阵乘法', en: 'Starting point: tensor-level matmul' },
        whatLost: { zh: '（起点，无损失）', en: '(starting point, nothing lost)' },
        whatGained: { zh: '高层语义：编译器知道这是 matmul', en: 'High-level semantics: compiler knows this is matmul' },
      },
      {
        id: 'linalg-buffer',
        label: { zh: 'Linalg on Buffers', en: 'Linalg on Buffers' },
        dialect: 'linalg + memref',
        irSnippet: `%A_buf = memref.alloc() : memref<128x768xf32>
memref.copy %A_tensor, %A_buf
linalg.matmul
    ins(%A_buf, %B_buf : memref<128x768xf32>,
                         memref<768x768xf32>)
    outs(%C_buf : memref<128x768xf32>)`,
        whatChanged: { zh: 'Bufferization: tensor → memref', en: 'Bufferization: tensor → memref' },
        whatLost: { zh: '值语义（不可变性）', en: 'Value semantics (immutability)' },
        whatGained: { zh: '具体的内存 buffer 分配', en: 'Concrete memory buffer allocation' },
      },
      {
        id: 'scf-loops',
        label: { zh: 'SCF Loops', en: 'SCF Loops' },
        dialect: 'scf + memref + arith',
        irSnippet: `scf.for %i = 0 to 128 step 1 {
  scf.for %j = 0 to 768 step 1 {
    scf.for %k = 0 to 768 step 1 {
      %a = memref.load %A_buf[%i, %k]
      %b = memref.load %B_buf[%k, %j]
      %prev = memref.load %C_buf[%i, %j]
      %prod = arith.mulf %a, %b : f32
      %sum = arith.addf %prev, %prod : f32
      memref.store %sum, %C_buf[%i, %j]
    }
  }
}`,
        whatChanged: { zh: 'linalg.matmul → 三重嵌套循环', en: 'linalg.matmul → triple nested loop' },
        whatLost: { zh: '"这是 matmul" 的语义信息', en: '"This is matmul" semantic information' },
        whatGained: { zh: '循环结构，可以做 tiling/unrolling', en: 'Loop structure, enabling tiling/unrolling' },
      },
      {
        id: 'gpu-launch',
        label: { zh: 'GPU Launch', en: 'GPU Launch' },
        dialect: 'gpu + scf + memref',
        irSnippet: `gpu.launch blocks(%bx, %by) in (%gx=4, %gy=24)
    threads(%tx, %ty) in (%bdx=32, %bdy=32) {
  %i = %bx * 32 + %tx
  %j = %by * 32 + %ty
  scf.for %k = 0 to 768 step 1 {
    %a = memref.load %A_buf[%i, %k]
    %b = memref.load %B_buf[%k, %j]
    ...
  }
  gpu.terminator
}`,
        whatChanged: { zh: '循环 → GPU grid/block/thread 映射', en: 'Loops → GPU grid/block/thread mapping' },
        whatLost: { zh: '硬件无关性', en: 'Hardware independence' },
        whatGained: { zh: 'GPU 并行执行模型', en: 'GPU parallel execution model' },
      },
      {
        id: 'llvm',
        label: { zh: 'LLVM IR', en: 'LLVM IR' },
        dialect: 'llvm',
        irSnippet: `define void @matmul_kernel(
    float* %A, float* %B, float* %C) {
  %tid.x = call i32
    @llvm.nvvm.read.ptx.sreg.tid.x()
  %bid.x = call i32
    @llvm.nvvm.read.ptx.sreg.ctaid.x()
  %i = add i32 %tid.x, ...
  %a_ptr = getelementptr float, float* %A, i64 %idx
  %a = load float, float* %a_ptr
  %prod = fmul float %a, %b
  %acc = fadd float %prev, %prod
  store float %acc, float* %c_ptr
  ret void
}`,
        whatChanged: { zh: 'GPU dialect → LLVM + NVVM intrinsics', en: 'GPU dialect → LLVM + NVVM intrinsics' },
        whatLost: { zh: 'GPU 抽象（变成 NVVM intrinsic call）', en: 'GPU abstraction (becomes NVVM intrinsic calls)' },
        whatGained: { zh: '可以直接生成 PTX', en: 'Can directly generate PTX' },
      },
    ],
  },
  {
    label: { zh: 'LayerNorm', en: 'LayerNorm' },
    levels: [
      {
        id: 'linalg-tensor',
        label: { zh: 'Linalg Generic', en: 'Linalg Generic' },
        dialect: 'linalg',
        irSnippet: `// mean = reduce_sum(x) / N
%sum = linalg.generic
  {iterator_types = ["reduction"]}
  ins(%x) ...
%mean = arith.divf %sum, %N
// var = reduce_sum((x - mean)^2) / N
%var = linalg.generic {...}
  ins(%x, %mean) ...
// result = (x - mean) / sqrt(var+eps)
//          * gamma + beta
%norm = linalg.generic
  {iterator_types = ["parallel"]}
  ins(%x, %mean, %var, %gamma, %beta) ...`,
        whatChanged: { zh: '起点：LayerNorm 分解为 reduce + elementwise', en: 'Start: LayerNorm decomposed to reduce + elementwise' },
        whatLost: { zh: '（起点）', en: '(starting point)' },
        whatGained: { zh: '可以分别优化 reduce 和 elementwise 部分', en: 'Can optimize reduce and elementwise parts separately' },
      },
      {
        id: 'fused',
        label: { zh: 'Fused Kernel', en: 'Fused Kernel' },
        dialect: 'scf + memref',
        irSnippet: `scf.for %i = 0 to %batch {
  %sum = 0.0, %sq_sum = 0.0
  scf.for %j = 0 to %hidden {
    %val = memref.load %x[%i, %j]
    %sum += %val
    %sq_sum += %val * %val
  }
  %mean = %sum / %hidden
  %var = %sq_sum/%hidden - %mean*%mean
  scf.for %j = 0 to %hidden {
    %val = memref.load %x[%i, %j]
    %norm = (%val-%mean) / sqrt(%var+%eps)
    %out = %norm * %gamma[%j] + %beta[%j]
    memref.store %out, %result[%i, %j]
  }
}`,
        whatChanged: { zh: '多个 linalg op → 融合为单循环', en: 'Multiple linalg ops → fused into single loop' },
        whatLost: { zh: '独立算子的模块性', en: 'Individual operator modularity' },
        whatGained: { zh: '只读一次 HBM，性能大幅提升', en: 'Single HBM read, major performance gain' },
      },
    ],
  },
];

/* ─── Color Gradient from blue (high) to red (low) ─── */

const LEVEL_COLORS = [
  '#1565c0', // blue - highest
  '#0277bd', // light blue
  '#00838f', // teal
  '#e65100', // orange
  '#c62828', // red - lowest
];

/* ─── Props ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── IR Code Block (SVG foreignObject) ─── */

function IRCodeBlock({ code, color, width, height }: { code: string; color: string; width: number; height: number }) {
  return (
    <foreignObject x={0} y={0} width={width} height={height}>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: '10.5px',
          lineHeight: '1.45',
          color: COLORS.dark,
          background: `${color}08`,
          border: `1.5px solid ${color}40`,
          borderRadius: '6px',
          padding: '10px 12px',
          overflowX: 'auto',
          overflowY: 'auto',
          whiteSpace: 'pre',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {code}
      </div>
    </foreignObject>
  );
}

/* ─── Info Card ─── */

function InfoCard({ level, color, locale }: { level: LoweringLevel; color: string; locale: 'zh' | 'en' }) {
  const labels = {
    zh: { changed: '发生了什么', lost: '失去了什么', gained: '获得了什么' },
    en: { changed: 'What Changed', lost: 'What Was Lost', gained: 'What Was Gained' },
  }[locale];

  return (
    <div style={{ fontSize: '12px', lineHeight: '1.5', color: COLORS.dark }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        marginBottom: '8px', paddingBottom: '6px',
        borderBottom: `2px solid ${color}`,
      }}>
        <span style={{
          display: 'inline-block', padding: '1px 8px',
          background: `${color}18`, border: `1px solid ${color}50`,
          borderRadius: '4px', fontFamily: FONTS.mono, fontSize: '10px', color,
        }}>
          {level.dialect}
        </span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong style={{ color }}>{labels.changed}:</strong>{' '}
        <span>{level.whatChanged[locale]}</span>
      </div>
      <div style={{ marginBottom: '6px' }}>
        <strong style={{ color: COLORS.red }}>{labels.lost}:</strong>{' '}
        <span>{level.whatLost[locale]}</span>
      </div>
      <div>
        <strong style={{ color: COLORS.green }}>{labels.gained}:</strong>{' '}
        <span>{level.whatGained[locale]}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ProgressiveLoweringAnimation({ locale = 'zh' }: Props) {
  const [exampleIdx, setExampleIdx] = useState(0);
  const example = EXAMPLES[exampleIdx];

  const t = {
    zh: { selectExample: '选择示例' },
    en: { selectExample: 'Select Example' },
  }[locale];

  const steps = useMemo(() => {
    return example.levels.map((level, i) => {
      const color = LEVEL_COLORS[Math.min(i, LEVEL_COLORS.length - 1)];
      return {
        title: level.label[locale],
        content: (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* IR Code */}
            <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
              <div style={{
                marginBottom: '6px', fontSize: '11px', fontWeight: 700, color,
              }}>
                {level.label[locale]}
              </div>
              <svg viewBox={`0 0 420 ${Math.max(180, level.irSnippet.split('\n').length * 16 + 24)}`} className="w-full">
                <style>{`text { font-family: ${FONTS.sans}; }`}</style>
                <IRCodeBlock
                  code={level.irSnippet}
                  color={color}
                  width={420}
                  height={Math.max(180, level.irSnippet.split('\n').length * 16 + 24)}
                />
              </svg>
            </div>

            {/* Info card */}
            <div style={{
              flex: '0 0 260px',
              padding: '12px',
              background: COLORS.bgAlt,
              borderRadius: '8px',
              border: `1px solid ${COLORS.light}`,
            }}>
              <InfoCard level={level} color={color} locale={locale} />
            </div>
          </div>
        ),
      };
    });
  }, [example, locale]);

  return (
    <div className="my-6">
      {/* Example selector tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: COLORS.mid, fontWeight: 600 }}>
          {t.selectExample}:
        </span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setExampleIdx(i)}
            style={{
              padding: '4px 14px',
              fontSize: '12px',
              fontWeight: exampleIdx === i ? 700 : 500,
              color: exampleIdx === i ? COLORS.bg : COLORS.dark,
              background: exampleIdx === i ? COLORS.primary : `${COLORS.light}80`,
              border: `1px solid ${exampleIdx === i ? COLORS.primary : COLORS.light}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {ex.label[locale]}
          </button>
        ))}
      </div>

      {/* Level gradient indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginBottom: '12px', fontSize: '10px', color: COLORS.mid,
      }}>
        <span style={{ fontWeight: 600 }}>{locale === 'zh' ? '抽象层级' : 'Abstraction'}:</span>
        <span style={{ color: LEVEL_COLORS[0] }}>{locale === 'zh' ? '高' : 'High'}</span>
        <div style={{
          flex: '0 0 120px', height: '6px', borderRadius: '3px',
          background: `linear-gradient(to right, ${LEVEL_COLORS[0]}, ${LEVEL_COLORS[2]}, ${LEVEL_COLORS[4]})`,
        }} />
        <span style={{ color: LEVEL_COLORS[4] }}>{locale === 'zh' ? '低' : 'Low'}</span>
      </div>

      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}
