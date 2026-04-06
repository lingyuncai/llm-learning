// src/components/interactive/PerformanceLadder.tsx
// Interactive: GEMM optimization stages bar chart with hover details
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

interface Stage {
  label: string;
  gflops: number;
  pct: string;
  color: string;
  detail: string;
  keyChange: string;
}

const STAGES: Stage[] = [
  {
    label: 'Naive',
    gflops: 400,
    pct: '0.6%',
    color: COLORS.red,
    detail: 'FP32 SGEMM: 一个线程算一个输出元素，每个元素 2K 次全局内存读取',
    keyChange: '基线: 简单但严重 memory-bound (vs FP32 peak 67 TFLOPS)',
  },
  {
    label: '+ Block Tiling',
    gflops: 8000,
    pct: '12%',
    color: COLORS.orange,
    detail: 'Tile 加载到 shared memory 后 BLOCK_SIZE 个线程共享复用',
    keyChange: 'HBM 访问减少 BLOCK_SIZE 倍 (如 32x)',
  },
  {
    label: '+ Thread Tile',
    gflops: 25000,
    pct: '37%',
    color: '#ca8a04',
    detail: '每线程算 TM x TN 个输出元素，数据加载到寄存器后复用',
    keyChange: 'Shared mem 访问减少 TM*TN/(TM+TN) 倍',
  },
  {
    label: '+ Vec Load',
    gflops: 35000,
    pct: '52%',
    color: '#65a30d',
    detail: 'float4 一次加载 128 bits，减少指令数和调度开销',
    keyChange: '指令数减少 4x，带宽利用率提高',
  },
  {
    label: '+ Double Buffer',
    gflops: 45000,
    pct: '67%',
    color: COLORS.green,
    detail: '计算当前 tile 时预加载下一个 tile，重叠访存和计算',
    keyChange: '隐藏内存延迟，流水线充分利用',
  },
  {
    label: 'Tensor Core (FP16)',
    gflops: 60000,
    pct: '~90%',
    color: COLORS.primary,
    detail: 'FP16 HGEMM: WMMA 一条指令完成 16x16x16 矩阵块乘加 (FP16 in, FP32 acc)',
    keyChange: '切换到 FP16 Tensor Core — 注意: 此处百分比基于 FP16 TC practical peak (~70K GFLOPS)',
  },
];

const CUBLAS = 65000;

export default function PerformanceLadder({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'GEMM 优化性能阶梯 (H100, 4096x4096)',
      subtitle: '每步优化的 GFLOPS (前 5 步: FP32 SGEMM, 最后一步: FP16 HGEMM) — 悬停查看详情',
      cuBlasRef: 'cuBLAS',
      hoverPrompt: '悬停各优化阶段查看详情',
      insight: '优化核心: 减少内存访问 → 提高数据复用 → 利用专用硬件 (Tensor Core) → 接近理论峰值',
      stages: [
        {
          label: 'Naive',
          detail: 'FP32 SGEMM: 一个线程算一个输出元素，每个元素 2K 次全局内存读取',
          keyChange: '基线: 简单但严重 memory-bound (vs FP32 peak 67 TFLOPS)',
        },
        {
          label: '+ Block Tiling',
          detail: 'Tile 加载到 shared memory 后 BLOCK_SIZE 个线程共享复用',
          keyChange: 'HBM 访问减少 BLOCK_SIZE 倍 (如 32x)',
        },
        {
          label: '+ Thread Tile',
          detail: '每线程算 TM x TN 个输出元素，数据加载到寄存器后复用',
          keyChange: 'Shared mem 访问减少 TM*TN/(TM+TN) 倍',
        },
        {
          label: '+ Vec Load',
          detail: 'float4 一次加载 128 bits，减少指令数和调度开销',
          keyChange: '指令数减少 4x，带宽利用率提高',
        },
        {
          label: '+ Double Buffer',
          detail: '计算当前 tile 时预加载下一个 tile，重叠访存和计算',
          keyChange: '隐藏内存延迟，流水线充分利用',
        },
        {
          label: 'Tensor Core (FP16)',
          detail: 'FP16 HGEMM: WMMA 一条指令完成 16x16x16 矩阵块乘加 (FP16 in, FP32 acc)',
          keyChange: '切换到 FP16 Tensor Core — 注意: 此处百分比基于 FP16 TC practical peak (~70K GFLOPS)',
        },
      ],
    },
    en: {
      title: 'GEMM Optimization Performance Ladder (H100, 4096x4096)',
      subtitle: 'GFLOPS at each step (first 5: FP32 SGEMM, last: FP16 HGEMM) — hover for details',
      cuBlasRef: 'cuBLAS',
      hoverPrompt: 'Hover over optimization stages for details',
      insight: 'Core optimization: reduce memory access → increase data reuse → leverage specialized hardware (Tensor Core) → approach theoretical peak',
      stages: [
        {
          label: 'Naive',
          detail: 'FP32 SGEMM: one thread per output element, 2K global memory reads per element',
          keyChange: 'Baseline: simple but severely memory-bound (vs FP32 peak 67 TFLOPS)',
        },
        {
          label: '+ Block Tiling',
          detail: 'Load tiles to shared memory, shared by BLOCK_SIZE threads',
          keyChange: 'HBM access reduced by BLOCK_SIZE (e.g., 32x)',
        },
        {
          label: '+ Thread Tile',
          detail: 'Each thread computes TM x TN output elements, data reused from registers',
          keyChange: 'Shared mem access reduced by TM*TN/(TM+TN)',
        },
        {
          label: '+ Vec Load',
          detail: 'float4 loads 128 bits at once, reducing instruction count and scheduling overhead',
          keyChange: 'Instruction count reduced by 4x, bandwidth utilization improved',
        },
        {
          label: '+ Double Buffer',
          detail: 'Prefetch next tile while computing current tile, overlap memory and compute',
          keyChange: 'Hide memory latency, pipeline fully utilized',
        },
        {
          label: 'Tensor Core (FP16)',
          detail: 'FP16 HGEMM: WMMA instruction completes 16x16x16 matrix multiply-add (FP16 in, FP32 acc)',
          keyChange: 'Switch to FP16 Tensor Core — note: percentages based on FP16 TC practical peak (~70K GFLOPS)',
        },
      ],
    },
  }[locale];

  const [hover, setHover] = useState<number | null>(null);

  const barMaxW = 340;
  const barH = 28;
  const barGap = 8;
  const barX = 170;
  const barStartY = 60;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
      <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.subtitle}
        </text>

        {/* cuBLAS reference line */}
        {(() => {
          const refX = barX + barMaxW;
          return (
            <g>
              <line x1={refX} y1={barStartY - 8} x2={refX}
                y2={barStartY + STAGES.length * (barH + barGap)}
                stroke={COLORS.purple} strokeWidth={1.5} strokeDasharray="4 2" />
              <text x={refX + 4} y={barStartY - 2} fontSize="7" fontWeight="600"
                fill={COLORS.purple} fontFamily={FONTS.mono}>
                {t.cuBlasRef} ~{(CUBLAS / 1000).toFixed(0)}K ({((CUBLAS / 67000) * 100).toFixed(0)}%)
              </text>
            </g>
          );
        })()}

        {/* Bars */}
        {STAGES.map((stage, i) => {
          const y = barStartY + i * (barH + barGap);
          const barW = (stage.gflops / CUBLAS) * barMaxW;
          const isHovered = hover === i;
          const stageT = t.stages[i];
          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}>
              {/* Label */}
              <text x={barX - 6} y={y + barH / 2 + 1} textAnchor="end"
                fontSize="7.5" fontWeight={isHovered ? '700' : '500'}
                fill={isHovered ? stage.color : COLORS.dark} fontFamily={FONTS.sans}>
                {stageT.label}
              </text>
              {/* Background */}
              <rect x={barX} y={y} width={barMaxW} height={barH} rx={3}
                fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
              {/* Fill */}
              <rect x={barX} y={y} width={barW} height={barH} rx={3}
                fill={stage.color} opacity={isHovered ? 0.9 : 0.6}
                stroke={stage.color} strokeWidth={isHovered ? 2 : 0} />
              {/* Value */}
              <text x={barX + barW + 6} y={y + barH / 2 + 1} dominantBaseline="middle"
                fontSize="7.5" fontWeight="600" fill={stage.color} fontFamily={FONTS.mono}>
                {stage.gflops >= 1000 ? `${(stage.gflops / 1000).toFixed(0)}K` : stage.gflops} ({stage.pct})
              </text>
            </g>
          );
        })}

        {/* Hover detail */}
        {hover !== null && (
          <g>
            <rect x={30} y={barStartY + STAGES.length * (barH + barGap) + 10}
              width={520} height={58} rx={5}
              fill={STAGES[hover].color} fillOpacity={0.08}
              stroke={STAGES[hover].color} strokeWidth={1} />
            <text x={W / 2}
              y={barStartY + STAGES.length * (barH + barGap) + 30}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={STAGES[hover].color} fontFamily={FONTS.sans}>
              {t.stages[hover].label}: {t.stages[hover].detail}
            </text>
            <text x={W / 2}
              y={barStartY + STAGES.length * (barH + barGap) + 50}
              textAnchor="middle" fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {locale === 'zh' ? '核心变化: ' : 'Key change: '}{t.stages[hover].keyChange}
            </text>
          </g>
        )}

        {hover === null && (
          <rect x={30} y={barStartY + STAGES.length * (barH + barGap) + 10}
            width={520} height={58} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1}>
          </rect>
        )}
        {hover === null && (
          <text x={W / 2}
            y={barStartY + STAGES.length * (barH + barGap) + 44}
            textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily={FONTS.sans}>
            {t.hoverPrompt}
          </text>
        )}

        {/* Key insight */}
        <rect x={30} y={SVG_H - 35} width={520} height={28} rx={4}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={W / 2} y={SVG_H - 18} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.insight}
        </text>
      </svg>
    </div>
  );
}
