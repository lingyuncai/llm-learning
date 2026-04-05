import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const N = 6; // matrix size

function MatrixViz({ x, y, size, data, label, cellSize }: {
  x: number; y: number; size: number; data: (i: number, j: number) => number;
  label: string; cellSize: number;
}) {
  const maxVal = Math.max(
    ...Array.from({ length: size * size }, (_, k) =>
      Math.abs(data(Math.floor(k / size), k % size))
    )
  );
  return (
    <g>
      <text x={x} y={y - 8} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (__, j) => {
          const val = data(i, j);
          const t = Math.abs(val) / (maxVal || 1);
          const color = val === 0
            ? COLORS.masked
            : val > 0
              ? `rgba(21,101,192,${0.1 + t * 0.7})`
              : `rgba(198,40,40,${0.1 + t * 0.7})`;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + j * cellSize} y={y + i * cellSize}
                width={cellSize - 1} height={cellSize - 1}
                fill={color} stroke={COLORS.light} strokeWidth="0.5" rx="1" />
              {cellSize >= 24 && (
                <text x={x + j * cellSize + cellSize / 2} y={y + i * cellSize + cellSize / 2 + 3}
                  textAnchor="middle" fontSize="7" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {val.toFixed(1)}
                </text>
              )}
            </g>
          );
        })
      )}
    </g>
  );
}

// Semiseparable: M[i][j] = C[i] * A^(i-j) * B[j] for j <= i, 0 otherwise
function semiSep(i: number, j: number): number {
  if (j > i) return 0;
  return Math.pow(0.85, i - j) * (0.6 + 0.3 * Math.sin(j * 2.1));
}

// Dense attention-like scores
function denseAttn(i: number, j: number): number {
  if (j > i) return 0; // causal
  return 0.3 + 0.5 * Math.cos((i - j) * 0.8) + 0.2 * Math.sin(i * 0.5 + j * 0.3);
}

export default function SSDAttentionEquivalence() {
  const cell = 28;

  const steps = [
    {
      title: '1. SSM → Semiseparable Matrix',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 递推展开为矩阵乘法 Y = M · U
          </text>

          <MatrixViz x={50} y={55} size={N} data={semiSep} label="M (semiseparable)" cellSize={cell} />

          <text x={240} y={130} fontSize="18" fontWeight="700" fill={COLORS.dark}>·</text>

          {/* Input vector */}
          <g>
            <text x={270} y={47} fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>U (input)</text>
            {Array.from({ length: N }, (_, i) => (
              <g key={i}>
                <rect x={270} y={55 + i * cell} width={cell - 1} height={cell - 1}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" rx="1" />
                <text x={270 + cell / 2} y={55 + i * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>u{i + 1}</text>
              </g>
            ))}
          </g>

          {/* Annotation */}
          <rect x={330} y={60} width={220} height={80} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={340} y={80} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Semiseparable 结构：</text>
          <text x={340} y={96} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            M[i,j] = C·Ā^(i-j)·B̄  (j ≤ i)
          </text>
          <text x={340} y={112} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            M[i,j] = 0             (j {'>'} i)
          </text>
          <text x={340} y={130} fontSize="9" fill={COLORS.primary} fontFamily={FONTS.sans}>
            因果 + 指数衰减结构
          </text>

          <text x={W / 2} y={280} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            SSM 递推 xₖ = Āxₖ₋₁ + B̄uₖ 展开后等价于一个结构化矩阵乘法
          </text>
        </svg>
      ),
    },
    {
      title: '2. Attention → Dense Matrix',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 计算 Y = softmax(QK^T) · V
          </text>

          <MatrixViz x={50} y={55} size={N} data={denseAttn} label="softmax(QKᵀ) (dense)" cellSize={cell} />

          <text x={240} y={130} fontSize="18" fontWeight="700" fill={COLORS.dark}>·</text>

          <g>
            <text x={270} y={47} fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>V (value)</text>
            {Array.from({ length: N }, (_, i) => (
              <g key={i}>
                <rect x={270} y={55 + i * cell} width={cell - 1} height={cell - 1}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1" rx="1" />
                <text x={270 + cell / 2} y={55 + i * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>v{i + 1}</text>
              </g>
            ))}
          </g>

          <rect x={330} y={60} width={220} height={80} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={340} y={80} fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Dense 结构：</text>
          <text x={340} y={96} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            A[i,j] = softmax(qᵢ·kⱼ)  (j ≤ i)
          </text>
          <text x={340} y={112} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
            A[i,j] = 0                (j {'>'} i)
          </text>
          <text x={340} y={130} fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>
            因果 + 任意值（data-dependent）
          </text>

          <text x={W / 2} y={280} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Attention score matrix 是完全 dense 的 — 每对 token 独立计算权重
          </text>
        </svg>
      ),
    },
    {
      title: '3. SSM ≈ 结构化的 Attention',
      content: (
        <svg viewBox={`0 0 ${W} 300`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            State Space Duality (Mamba-2)
          </text>

          {/* SSM matrix */}
          <MatrixViz x={30} y={55} size={N} data={semiSep} label="SSM: Semiseparable" cellSize={24} />
          <text x={30} y={55 + N * 24 + 18} fontSize="9" fill={COLORS.primary} fontFamily={FONTS.sans}>
            低秩结构 → O(N) 计算
          </text>

          {/* vs */}
          <text x={W / 2} y={120} textAnchor="middle" fontSize="16" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>≈</text>

          {/* Attention matrix */}
          <MatrixViz x={320} y={55} size={N} data={denseAttn} label="Attention: Dense" cellSize={24} />
          <text x={320} y={55 + N * 24 + 18} fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>
            全秩 → O(N²) 计算
          </text>

          {/* Key insight box */}
          <rect x={50} y={210} width={480} height={70} rx={8}
            fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" />
          <text x={290} y={232} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            "SSM 是加了结构约束的 Attention"
          </text>
          <text x={290} y={252} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Semiseparable 结构 = 因果 mask + 指数衰减 → 用 chunk-wise 算法加速
          </text>
          <text x={290} y={268} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            Mamba-2 利用此对偶性，比 Mamba-1 快 2-8×
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
