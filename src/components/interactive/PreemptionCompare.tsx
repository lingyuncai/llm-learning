import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function PreemptionCompare() {
  const steps = [
    {
      title: '触发抢占：显存不足',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>场景：新高优先级请求到达，GPU 显存不足</text>
          <rect x={60} y={50} width={200} height={80} rx={6}
            fill={COLORS.green} opacity={0.15} stroke={COLORS.green} strokeWidth="2" />
          <text x={160} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Running 请求 A</text>
          <text x={160} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>KV Cache: 2GB (20 blocks)</text>
          <text x={160} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>已生成 80% tokens</text>
          <text x={330} y={85} fontSize="18" fill={COLORS.red}>⚡</text>
          <rect x={360} y={50} width={170} height={80} rx={6}
            fill={COLORS.orange} opacity={0.15} stroke={COLORS.orange} strokeWidth="2" />
          <text x={445} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>新请求 B (VIP)</text>
          <text x={445} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>需要 KV Cache: 3GB</text>
          <text x={445} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.red} fontFamily={FONTS.sans}>GPU 显存不足!</text>
          <text x={W / 2} y={160} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Scheduler 必须抢占请求 A 来腾出显存 — 但 A 的 KV Cache 不能丢？
          </text>
          <text x={W / 2} y={180} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            两种策略：Swap（搬到 CPU）vs Recompute（丢弃重算）
          </text>
        </svg>
      ),
    },
    {
      title: 'Swap：KV Cache 搬到 CPU',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Swap 策略：GPU → CPU → GPU</text>
          <rect x={40} y={50} width={140} height={90} rx={6}
            fill={COLORS.green} opacity={0.1} stroke={COLORS.green} strokeWidth="1.5" />
          <text x={110} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>GPU 显存</text>
          <text x={110} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>请求 B 运行中</text>
          <text x={110} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的空间已释放</text>
          <text x={230} y={80} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>PCIe 传输</text>
          <line x1={180} y1={95} x2={280} y2={95}
            stroke={COLORS.orange} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={110} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~500ms (2GB)</text>
          <rect x={290} y={50} width={140} height={90} rx={6}
            fill={COLORS.purple} opacity={0.1} stroke={COLORS.purple} strokeWidth="1.5" />
          <text x={360} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.purple} fontFamily={FONTS.sans}>CPU 内存</text>
          <text x={360} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的 KV Cache</text>
          <text x={360} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>完整保存</text>
          <line x1={280} y1={130} x2={180} y2={130}
            stroke={COLORS.green} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={148} textAnchor="middle" fontSize="8"
            fill={COLORS.green} fontFamily={FONTS.sans}>恢复时搬回 GPU</text>
          <rect x={60} y={165} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={183} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            无需重算 | PCIe 带宽是瓶颈（~32GB/s）| 适合：已生成大量 token 的请求
          </text>
        </svg>
      ),
    },
    {
      title: 'Recompute：丢弃并重算',
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Recompute 策略：丢弃 → 重新 Prefill</text>
          <rect x={40} y={50} width={150} height={80} rx={6}
            fill={COLORS.red} opacity={0.1} stroke={COLORS.red} strokeWidth="1.5" />
          <text x={115} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>丢弃 KV Cache</text>
          <text x={115} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>A 的 20 blocks</text>
          <text x={115} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>立即释放显存</text>
          <text x={230} y={90} fontSize="14" fill={COLORS.mid}>→</text>
          <rect x={260} y={50} width={150} height={80} rx={6}
            fill={COLORS.orange} opacity={0.1} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x={335} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.orange} fontFamily={FONTS.sans}>恢复时重算</text>
          <text x={335} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>重跑 Prefill</text>
          <text x={335} y={108} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~200ms (prompt re-encode)</text>
          <rect x={60} y={145} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={163} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            无 PCIe 传输 | 浪费 prefill 计算 | 适合：生成较少 token 的请求（重算成本低）
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
