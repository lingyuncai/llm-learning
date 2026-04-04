// src/components/interactive/ExecutionModelCompare.tsx
// Static SVG: SIMD / SIMT / Intel iGPU three-column comparison table
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

const COL_X = [100, 245, 420]; // column centers
const COL_COLORS = [COLORS.primary, COLORS.green, COLORS.purple];
const HEADERS = ['SIMD (经典)', 'SIMT (NVIDIA)', 'Intel iGPU (混合)'];

const ROWS = [
  {
    dim: '编程视角',
    cells: [
      '显式向量指令\n(intrinsic / 编译器向量化)',
      '标量代码\n(硬件自动并行)',
      'SYCL work-item 标量代码\n(sub-group 暴露 SIMD)',
    ],
  },
  {
    dim: '硬件执行',
    cells: [
      '一条指令操作\nN-wide 向量寄存器',
      'Warp (32 threads)\n锁步执行同一指令',
      'EU Thread 驱动\n8/16-wide SIMD ALU',
    ],
  },
  {
    dim: '分支处理',
    cells: [
      '需要显式 mask\n或 blend 指令',
      '硬件自动 mask\n(warp divergence)',
      '硬件 mask\n(channel enable)',
    ],
  },
  {
    dim: '向量宽度',
    cells: [
      '程序员必须知道\n(8/16/32)',
      '对程序员透明\n(始终 32-wide warp)',
      '部分可见\n(sub-group size)',
    ],
  },
  {
    dim: '典型硬件',
    cells: [
      'CPU (SSE/AVX)\nIntel EU (底层)',
      'NVIDIA SM\n(FP32 / INT32 Core)',
      'Intel Xe-Core\n(Vector Engine + XMX)',
    ],
  },
];

const ROW_START = 80;
const ROW_H = 52;

export default function ExecutionModelCompare() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="SIMD vs SIMT vs Intel iGPU comparison table">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        三种并行执行模型对比
      </text>

      {/* Column headers */}
      {HEADERS.map((h, i) => (
        <g key={`h-${i}`}>
          <rect x={COL_X[i] - 70} y={42} width={140} height={26} rx={4}
            fill={COL_COLORS[i]} fillOpacity={0.08} stroke={COL_COLORS[i]} strokeWidth={1} />
          <text x={COL_X[i]} y={58} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COL_COLORS[i]} fontFamily={FONTS.sans}>{h}</text>
        </g>
      ))}

      {/* Row dimension label column */}
      {ROWS.map((row, ri) => {
        const y = ROW_START + ri * ROW_H;
        return (
          <g key={`r-${ri}`}>
            {/* Alternating row bg */}
            {ri % 2 === 0 && (
              <rect x={0} y={y - 4} width={W} height={ROW_H} fill="#fafbfc" />
            )}
            {/* Dimension label */}
            <text x={18} y={y + ROW_H / 2 - 4} fontSize="8" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>
              {row.dim}
            </text>
            {/* Cell content */}
            {row.cells.map((cell, ci) => {
              const lines = cell.split('\n');
              return (
                <g key={`c-${ci}`}>
                  {lines.map((line, li) => (
                    <text key={li} x={COL_X[ci]} y={y + ROW_H / 2 - 6 + li * 13}
                      textAnchor="middle" fontSize="7.5"
                      fill={li === 0 ? COLORS.dark : '#64748b'} fontFamily={FONTS.sans}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Separator lines between columns */}
      <line x1={170} y1={42} x2={170} y2={ROW_START + ROWS.length * ROW_H - 10}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <line x1={330} y1={42} x2={330} y2={ROW_START + ROWS.length * ROW_H - 10}
        stroke="#e2e8f0" strokeWidth={0.5} />
    </svg>
  );
}
