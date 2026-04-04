// src/components/interactive/NaiveGemmAnimation.tsx
// StepNavigator: naive GEMM computation visualization
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

const N = 4; // 4x4 matrices
const CELL = 32;
const GAP = 1;

function MatrixGrid({ x, y, label, rows, cols, highlightRow, highlightCol, values, activeCell }: {
  x: number; y: number; label: string; rows: number; cols: number;
  highlightRow?: number; highlightCol?: number;
  values?: number[][]; activeCell?: { r: number; c: number };
}) {
  return (
    <g>
      <text x={x + (cols * (CELL + GAP) - GAP) / 2} y={y - 8} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const cx = x + c * (CELL + GAP);
          const cy = y + r * (CELL + GAP);
          const isRowHL = highlightRow === r;
          const isColHL = highlightCol === c;
          const isActive = activeCell?.r === r && activeCell?.c === c;
          let fill: string = '#f8fafc';
          let stroke: string = '#cbd5e1';
          let textColor: string = COLORS.dark;
          if (isActive) { fill = '#fef3c7'; stroke = COLORS.orange; textColor = COLORS.orange; }
          else if (isRowHL && isColHL) { fill = '#dbeafe'; stroke = COLORS.primary; textColor = COLORS.primary; }
          else if (isRowHL) { fill = '#dbeafe'; stroke = COLORS.primary; }
          else if (isColHL) { fill = '#dcfce7'; stroke = COLORS.green; }
          return (
            <g key={`${r}-${c}`}>
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={2}
                fill={fill} stroke={stroke} strokeWidth={isActive ? 2 : 0.5} />
              <text x={cx + CELL / 2} y={cy + CELL / 2} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={textColor} fontFamily={FONTS.mono}>
                {values ? values[r][c] : `${label[0]}${r}${c}`}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
}

// Example 4x4 matrices
const A = [[2, 1, 3, 0], [1, 0, 2, 1], [0, 3, 1, 2], [2, 1, 0, 3]];
const B = [[1, 0, 2, 1], [3, 1, 0, 2], [0, 2, 1, 0], [1, 1, 3, 1]];

// C[1][2] = A[1][0]*B[0][2] + A[1][1]*B[1][2] + A[1][2]*B[2][2] + A[1][3]*B[3][2]
// = 1*2 + 0*0 + 2*1 + 1*3 = 2 + 0 + 2 + 3 = 7
const targetR = 1;
const targetC = 2;

const steps = [
  {
    title: 'Naive GEMM: 一个线程算一个输出元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          C = A x B (4x4) — 每个线程计算 C 的一个元素
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          高亮线程负责计算 C[{targetR}][{targetC}]
        </text>

        <MatrixGrid x={30} y={60} label="A (4x4)" rows={N} cols={N}
          highlightRow={targetR} values={A} />
        <text x={175} y={100} fontSize="16" fill={COLORS.dark}>x</text>
        <MatrixGrid x={200} y={60} label="B (4x4)" rows={N} cols={N}
          highlightCol={targetC} values={B} />
        <text x={345} y={100} fontSize="16" fill={COLORS.dark}>=</text>
        <MatrixGrid x={370} y={60} label="C (4x4)" rows={N} cols={N}
          activeCell={{ r: targetR, c: targetC }} />

        <rect x={40} y={220} width={500} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={240} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive kernel: 每个线程的工作
        </text>
        <text x={60} y={260} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          C[row][col] = 0;
        </text>
        <text x={60} y={276} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          for (k = 0; k {'<'} K; k++)
        </text>
        <text x={60} y={292} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
          {'  '}C[row][col] += A[row][k] * B[k][col];  // 2 global reads per iteration
        </text>
        <text x={60} y={308} fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
          每个输出元素需要 2K 次全局内存读取 → 总共 2MNK 次 → 严重 memory-bound
        </text>
      </StepSvg>
    ),
  },
  {
    title: '逐步计算 C[1][2]',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          C[{targetR}][{targetC}] = A 的第 {targetR} 行 * B 的第 {targetC} 列
        </text>

        <MatrixGrid x={30} y={50} label="A" rows={N} cols={N}
          highlightRow={targetR} values={A} />
        <MatrixGrid x={200} y={50} label="B" rows={N} cols={N}
          highlightCol={targetC} values={B} />

        {/* Dot product calculation */}
        <rect x={370} y={50} width={190} height={130} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
        <text x={465} y={70} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>Dot Product</text>

        {Array.from({ length: N }).map((_, k) => {
          const y = 86 + k * 22;
          const product = A[targetR][k] * B[k][targetC];
          return (
            <g key={k}>
              <text x={380} y={y} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.mono}>
                A[{targetR}][{k}]
              </text>
              <text x={420} y={y} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                x
              </text>
              <text x={432} y={y} fontSize="8" fill={COLORS.green} fontFamily={FONTS.mono}>
                B[{k}][{targetC}]
              </text>
              <text x={480} y={y} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                = {A[targetR][k]} x {B[k][targetC]} = {product}
              </text>
            </g>
          );
        })}

        {/* Sum */}
        <line x1={380} y1={168} x2={550} y2={168} stroke={COLORS.orange} strokeWidth={1} />
        {(() => {
          const sum = A[targetR].reduce((s, a, k) => s + a * B[k][targetC], 0);
          return (
            <text x={465} y={184} textAnchor="middle" fontSize="10" fontWeight="700"
              fill={COLORS.orange} fontFamily={FONTS.mono}>
              C[{targetR}][{targetC}] = {sum}
            </text>
          );
        })()}

        {/* Memory access count */}
        <rect x={40} y={210} width={500} height={55} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          全局内存访问 (这一个线程)
        </text>
        <text x={W / 2} y={248} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          读 A 的 {N} 个元素 + 读 B 的 {N} 个元素 = {2 * N} 次 global memory load
        </text>
        <text x={W / 2} y={260} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>
          {N * N} 个线程 x {2 * N} 次读取 = {N * N * 2 * N} 次总访问 → 同一行/列被不同线程重复读取!
        </text>

        {/* Key point */}
        <rect x={40} y={280} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={298} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          问题: A[{targetR}][:] 被 C 的第 {targetR} 行的所有 {N} 个线程重复读取
        </text>
        <text x={W / 2} y={312} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.sans}>
          解决方案: 加载到 Shared Memory 后共享 → Tiling 优化
        </text>
      </StepSvg>
    ),
  },
  {
    title: '性能分析: 和理论峰值的差距',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive GEMM 性能分析 (4096x4096, H100)
        </text>

        {/* Performance bar */}
        <text x={40} y={50} fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          FP32 性能对比:
        </text>

        {[
          { label: 'Naive GEMM', gflops: 400, color: COLORS.red, pct: '0.6%' },
          { label: '+ Tiling', gflops: 8000, color: COLORS.orange, pct: '12%' },
          { label: '+ Thread Tile', gflops: 25000, color: '#ca8a04', pct: '37%' },
          { label: '+ Vec Load + Double Buf', gflops: 45000, color: COLORS.green, pct: '67%' },
          { label: 'Tensor Core (FP16)', gflops: 60000, color: COLORS.primary, pct: '~90%' },
          { label: 'cuBLAS (参考)', gflops: 65000, color: COLORS.purple, pct: '97%' },
        ].map((item, i) => {
          const y = 68 + i * 34;
          const maxW = 360;
          const barW = Math.max(4, (item.gflops / 65000) * maxW);
          return (
            <g key={i}>
              <text x={40} y={y + 12} fontSize="7.5" fontWeight="500"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{item.label}</text>
              <rect x={190} y={y} width={maxW} height={18} rx={3}
                fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
              <rect x={190} y={y} width={barW} height={18} rx={3}
                fill={item.color} opacity={0.7} />
              <text x={195} y={y + 12} fontSize="7" fontWeight="600"
                fill="white" fontFamily={FONTS.mono}>
                {item.gflops >= 1000 ? `${(item.gflops / 1000).toFixed(0)}K` : item.gflops} GFLOPS ({item.pct})
              </text>
            </g>
          );
        })}

        {/* Key insight */}
        <rect x={40} y={SVG_H - 80} width={500} height={65} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={SVG_H - 58} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          优化核心思路
        </text>
        <text x={W / 2} y={SVG_H - 42} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          1. 减少全局内存访问 (Tiling → Shared Memory)
        </text>
        <text x={W / 2} y={SVG_H - 28} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          2. 提高数据复用 (Thread Tiling → 寄存器)
        </text>
        <text x={W / 2} y={SVG_H - 14} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          3. 利用专用硬件 (Tensor Core → 一条指令完成矩阵块乘)
        </text>
      </StepSvg>
    ),
  },
];

export default function NaiveGemmAnimation() {
  return <StepNavigator steps={steps} />;
}
