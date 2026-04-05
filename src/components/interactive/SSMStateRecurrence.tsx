import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StateVector({ x, y, values, label, dim }: {
  x: number; y: number; values: number[]; label: string; dim: number;
}) {
  const cellW = 36;
  const cellH = 28;
  return (
    <g>
      <text x={x} y={y - 8} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x + i * cellW} y={y} width={cellW - 2} height={cellH}
            fill={Math.abs(v) > 0.01 ? COLORS.valid : COLORS.bgAlt}
            stroke={COLORS.light} strokeWidth="1" rx="3" />
          <text x={x + i * cellW + cellW / 2} y={y + cellH / 2 + 4}
            textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      <text x={x + dim * cellW + 8} y={y + cellH / 2 + 4} fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.mono}>∈ ℝ^{dim}</text>
    </g>
  );
}

function TokenBox({ x, y, token, active }: {
  x: number; y: number; token: string; active: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={50} height={28} rx={4}
        fill={active ? COLORS.highlight : COLORS.bgAlt}
        stroke={active ? COLORS.primary : COLORS.light} strokeWidth={active ? 2 : 1} />
      <text x={x + 25} y={y + 18} textAnchor="middle" fontSize="11"
        fontWeight={active ? '700' : '500'}
        fill={active ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>
        {token}
      </text>
    </g>
  );
}

export default function SSMStateRecurrence() {
  const N = 4; // state dim

  const steps = [
    {
      title: '1. 初始状态 x₀ = 0',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 初始化：空状态向量
          </text>
          <StateVector x={120} y={60} values={[0, 0, 0, 0]} label="x₀ (state)" dim={N} />
          <text x={W / 2} y={130} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            状态向量 x ∈ ℝᴺ 是 SSM 的"记忆"— 固定大小，不随序列增长
          </text>
          <text x={W / 2} y={155} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            N 通常为 16-64，远小于序列长度
          </text>
        </svg>
      ),
    },
    {
      title: '2. 输入 u₁ → 更新状态',
      content: (
        <svg viewBox={`0 0 ${W} 240`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            x₁ = B̄ · u₁
          </text>
          <TokenBox x={30} y={55} token="The" active={true} />
          <text x={100} y={74} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <text x={120} y={74} fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>B̄ 投影</text>
          <text x={180} y={74} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <StateVector x={200} y={55} values={[0.12, -0.08, 0.35, 0.21]} label="x₁" dim={N} />
          <rect x={40} y={120} width={500} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={140} textAnchor="middle" fontSize="11"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            B̄ 矩阵将输入 token 的 embedding 映射到状态空间
          </text>
          <text x={290} y={158} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            "写入"操作：决定输入信息如何编码到状态中
          </text>
          <text x={290} y={200} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            输出 y₁ = C · x₁（C 矩阵"读出"状态信息）
          </text>
        </svg>
      ),
    },
    {
      title: '3. 输入 u₂ → 混合新旧信息',
      content: (
        <svg viewBox={`0 0 ${W} 260`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            x₂ = Ā · x₁ + B̄ · u₂
          </text>
          {/* Old state */}
          <StateVector x={30} y={55} values={[0.12, -0.08, 0.35, 0.21]} label="x₁ (旧状态)" dim={N} />
          <text x={240} y={80} fontSize="11" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>× Ā (衰减)</text>
          {/* New input */}
          <TokenBox x={30} y={120} token="cat" active={true} />
          <text x={100} y={139} fontSize="16" fill={COLORS.primary} fontFamily={FONTS.mono}>→</text>
          <text x={120} y={139} fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>B̄ 投影</text>
          <text x={350} y={110} fontSize="20" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>+</text>
          {/* Result */}
          <StateVector x={120} y={170} values={[0.09, 0.24, 0.18, 0.43]} label="x₂ (新状态)" dim={N} />
          <text x={290} y={235} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Ā 控制旧信息保留多少，B̄ 控制新信息写入多少
          </text>
        </svg>
      ),
    },
    {
      title: '4. 对比 Attention：内存开销',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            推理缓存对比
          </text>
          {/* Attention side */}
          <text x={145} y={55} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>Attention (KV Cache)</text>
          {['K₁V₁', 'K₂V₂', 'K₃V₃', '...', 'KₙVₙ'].map((label, i) => (
            <g key={`kv-${i}`}>
              <rect x={40 + i * 52} y={70} width={48} height={28} rx={3}
                fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" />
              <text x={64 + i * 52} y={88} textAnchor="middle" fontSize="9"
                fill={COLORS.dark} fontFamily={FONTS.mono}>{label}</text>
            </g>
          ))}
          <text x={145} y={120} textAnchor="middle" fontSize="10"
            fill={COLORS.red} fontFamily={FONTS.sans}>
            缓存 O(n) — 每个 token 都要存
          </text>
          {/* SSM side */}
          <text x={435} y={55} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>SSM (State)</text>
          <rect x={370} y={70} width={130} height={28} rx={3}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
          <text x={435} y={88} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.mono}>x ∈ ℝᴺ (N=16~64)</text>
          <text x={435} y={120} textAnchor="middle" fontSize="10"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            缓存 O(1) — 固定大小
          </text>
          {/* Bar chart */}
          {[
            { label: '1K tokens', attn: 60, ssm: 8 },
            { label: '10K', attn: 140, ssm: 8 },
            { label: '100K', attn: 200, ssm: 8 },
          ].map((d, i) => {
            const bx = 80 + i * 170;
            return (
              <g key={`bar-${i}`}>
                <text x={bx + 30} y={155} textAnchor="middle" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.sans}>{d.label}</text>
                <rect x={bx} y={265 - d.attn} width={25} height={d.attn}
                  fill={COLORS.orange} opacity={0.7} rx={2} />
                <rect x={bx + 30} y={265 - d.ssm} width={25} height={d.ssm}
                  fill={COLORS.primary} opacity={0.7} rx={2} />
              </g>
            );
          })}
          <text x={290} y={250} textAnchor="middle" fontSize="9"
            fill={COLORS.orange} fontFamily={FONTS.sans}>■ KV Cache</text>
          <text x={290} y={265} textAnchor="middle" fontSize="9"
            fill={COLORS.primary} fontFamily={FONTS.sans}>■ SSM State</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
