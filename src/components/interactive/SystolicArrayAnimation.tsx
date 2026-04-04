// src/components/interactive/SystolicArrayAnimation.tsx
// StepNavigator: 4×4 output-stationary systolic array, clock-by-clock
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const N = 4; // matrix dimension
const W = 580;
const SVG_H = 340;

// Input matrices
const A = [[2, 1, 0, 1], [1, 3, 1, 0], [0, 1, 2, 1], [1, 0, 1, 3]];
const B = [[1, 0, 2, 1], [2, 1, 0, 0], [0, 3, 1, 2], [1, 0, 0, 1]];

// Precompute C = A × B
function computeC(): number[][] {
  const C: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}
const C = computeC();

// Precompute partial sums at each cycle for each PE
// PE(i,j) processes k = t - i - j at cycle t (if 0 ≤ k < N)
function partialSumAt(i: number, j: number, upToCycle: number): number {
  let sum = 0;
  for (let t = 0; t <= upToCycle; t++) {
    const k = t - i - j;
    if (k >= 0 && k < N) {
      sum += A[i][k] * B[k][j];
    }
  }
  return sum;
}

// PE grid layout
const GRID_X = 160;
const GRID_Y = 60;
const PE_SIZE = 56;
const PE_GAP = 6;

interface PeState {
  active: boolean;
  partialSum: number;
  done: boolean; // all k processed
  currentK: number; // which k is being processed (-1 if not active)
}

function getPeStates(cycle: number): PeState[][] {
  return Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      const k = cycle - i - j;
      const active = k >= 0 && k < N;
      const done = cycle >= i + j + N; // all N values processed
      return {
        active,
        partialSum: partialSumAt(i, j, cycle),
        done,
        currentK: active ? k : -1,
      };
    })
  );
}

function PeGrid({ cycle, showResult }: { cycle: number; showResult?: boolean }) {
  const states = getPeStates(cycle);

  return (
    <g>
      {/* Column headers (B columns) */}
      {Array.from({ length: N }).map((_, j) => (
        <text key={`bh-${j}`}
          x={GRID_X + j * (PE_SIZE + PE_GAP) + PE_SIZE / 2} y={GRID_Y - 8}
          textAnchor="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
          B col {j} ↓
        </text>
      ))}

      {/* Row headers (A rows) */}
      {Array.from({ length: N }).map((_, i) => (
        <text key={`ah-${i}`}
          x={GRID_X - 8} y={GRID_Y + i * (PE_SIZE + PE_GAP) + PE_SIZE / 2}
          textAnchor="end" dominantBaseline="middle"
          fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          A row {i} →
        </text>
      ))}

      {/* PE cells */}
      {Array.from({ length: N }).map((_, i) =>
        Array.from({ length: N }).map((_, j) => {
          const px = GRID_X + j * (PE_SIZE + PE_GAP);
          const py = GRID_Y + i * (PE_SIZE + PE_GAP);
          const s = states[i][j];
          const bg = showResult ? '#dcfce7'
            : s.active ? '#fff7ed'
            : s.done ? '#dbeafe'
            : '#f8fafc';
          const border = s.active ? COLORS.orange : s.done ? COLORS.primary : '#cbd5e1';

          return (
            <g key={`pe-${i}-${j}`}>
              <rect x={px} y={py} width={PE_SIZE} height={PE_SIZE} rx={4}
                fill={bg} stroke={border} strokeWidth={s.active ? 2 : 1} />
              <text x={px + PE_SIZE / 2} y={py + 12} textAnchor="middle"
                fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
                PE({i},{j})
              </text>
              {(s.partialSum !== 0 || s.done || showResult) && (
                <text x={px + PE_SIZE / 2} y={py + PE_SIZE / 2 + 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="700"
                  fill={showResult ? COLORS.green : s.active ? COLORS.orange : COLORS.primary}
                  fontFamily={FONTS.mono}>
                  {showResult ? C[i][j] : s.partialSum}
                </text>
              )}
              {s.active && !showResult && (
                <text x={px + PE_SIZE / 2} y={py + PE_SIZE - 8} textAnchor="middle"
                  fontSize="6" fill={COLORS.orange} fontFamily={FONTS.mono}>
                  +A[{i}][{s.currentK}]×B[{s.currentK}][{j}]
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

function Legend({ label }: { label: string }) {
  const items = [
    { color: COLORS.orange, text: '当前活跃 (MAC)' },
    { color: COLORS.primary, text: '已完成部分累加' },
    { color: '#cbd5e1', text: '空闲' },
  ];
  return (
    <g>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
      {items.map((item, idx) => (
        <g key={idx}>
          <rect x={W / 2 - 160 + idx * 120} y={SVG_H - 20}
            width={8} height={8} rx={1} fill={item.color} />
          <text x={W / 2 - 148 + idx * 120} y={SVG_H - 12} fontSize="8"
            fill="#94a3b8" fontFamily={FONTS.sans}>{item.text}</text>
        </g>
      ))}
    </g>
  );
}

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img"
      aria-label="Systolic array animation">
      {children}
    </svg>
  );
}

// Show input matrices in intro step
function InputMatrices() {
  const matY = 50;
  const cellSz = 22;
  const gap = 1;

  function SmallMatrix({ x, y, data, label, color }: {
    x: number; y: number; data: number[][]; label: string; color: string;
  }) {
    return (
      <g>
        <text x={x + (cellSz * N + gap * (N - 1)) / 2} y={y - 6}
          textAnchor="middle" fontSize="10" fontWeight="600" fill={color}
          fontFamily={FONTS.sans}>{label}</text>
        {data.map((row, r) =>
          row.map((val, c) => (
            <g key={`${r}-${c}`}>
              <rect x={x + c * (cellSz + gap)} y={y + r * (cellSz + gap)}
                width={cellSz} height={cellSz} rx={2}
                fill="white" stroke={color} strokeWidth={0.5} />
              <text x={x + c * (cellSz + gap) + cellSz / 2}
                y={y + r * (cellSz + gap) + cellSz / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>
                {val}
              </text>
            </g>
          ))
        )}
      </g>
    );
  }

  return (
    <g>
      <SmallMatrix x={20} y={matY} data={A} label="A (输入)" color={COLORS.primary} />
      <text x={140} y={matY + 45} fontSize="16" fill={COLORS.dark}>×</text>
      <SmallMatrix x={160} y={matY} data={B} label="B (权重)" color={COLORS.green} />
      <text x={280} y={matY + 45} fontSize="16" fill={COLORS.dark}>=</text>
      <SmallMatrix x={300} y={matY} data={C} label="C (输出)" color={COLORS.orange} />
    </g>
  );
}

const selectedCycles = [
  { cycle: -1, label: '初始状态 — 输入矩阵与 PE 阵列' },
  { cycle: 0, label: 'Cycle 0 — 第一个 PE 开始计算' },
  { cycle: 1, label: 'Cycle 1 — 波前扩展' },
  { cycle: 3, label: 'Cycle 3 — 主对角线全部活跃' },
  { cycle: 5, label: 'Cycle 5 — 前排 PE 完成, 后排继续' },
  { cycle: 9, label: 'Cycle 9 — 最后一个 PE 完成' },
  { cycle: 100, label: '最终结果 — C = A × B' },
];

const steps = selectedCycles.map(({ cycle, label }) => ({
  title: label.split(' — ')[0],
  content: (
    <StepSvg>
      {cycle === -1 ? (
        <g>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Output-Stationary Systolic Array (4×4)
          </text>
          <InputMatrices />
          <text x={W / 2} y={180} textAnchor="middle" fontSize="10" fill="#64748b"
            fontFamily={FONTS.sans}>
            每个 PE 计算输出矩阵的一个元素。A 从左侧逐行流入，B 从顶部逐列流入
          </text>
          <text x={W / 2} y={200} textAnchor="middle" fontSize="10" fill="#64748b"
            fontFamily={FONTS.sans}>
            输入按行/列索引错开（stagger），保证同一 k 的 A[i][k] 和 B[k][j] 同时到达 PE(i,j)
          </text>
          <text x={W / 2} y={225} textAnchor="middle" fontSize="9" fill={COLORS.primary}
            fontFamily={FONTS.sans}>
            PE(i,j) 在 cycle t = i+j+k 时处理第 k 对输入 → 总共需要 10 个 cycle (0~9)
          </text>
        </g>
      ) : (
        <g>
          <Legend cycle={cycle} label={label} />
          <PeGrid cycle={Math.min(cycle, 9)} showResult={cycle > 9} />
        </g>
      )}
    </StepSvg>
  ),
}));

export default function SystolicArrayAnimation() {
  return <StepNavigator steps={steps} />;
}
