import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

export default function PrefillVsDecode({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Prefill vs Decode: 两个阶段的本质区别',
      prefillStage: 'Prefill 阶段',
      nTokensParallel: 'N tokens 并行',
      computeBound: 'Compute-bound',
      highGpuUtilization: '高 GPU 利用率',
      fillKvCache: '填充 KV Cache',
      decodeStage: 'Decode 阶段',
      oneToken: '1 token',
      memoryBound: 'Memory-bound',
      kvCacheBottleneck: 'KV Cache 读取为瓶颈',
      perTokenGeneration: '逐 token 生成, 追加 KV',
      qwenParams: 'Qwen3-8B: hidden_dim=4096, num_heads=32, num_kv_heads=8 (GQA), num_layers=32',
    },
    en: {
      title: 'Prefill vs Decode: Core Differences',
      prefillStage: 'Prefill Phase',
      nTokensParallel: 'N tokens parallel',
      computeBound: 'Compute-bound',
      highGpuUtilization: 'High GPU utilization',
      fillKvCache: 'Fill KV Cache',
      decodeStage: 'Decode Phase',
      oneToken: '1 token',
      memoryBound: 'Memory-bound',
      kvCacheBottleneck: 'KV Cache read bottleneck',
      perTokenGeneration: 'Per-token generation, append KV',
      qwenParams: 'Qwen3-8B: hidden_dim=4096, num_heads=32, num_kv_heads=8 (GQA), num_layers=32',
    },
  }[locale];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Prefill side (left) */}
      <text x={145} y={42} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.prefillStage}</text>

      {/* Wide batch visualization */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={30 + i * 38} y={52} width={34} height={50} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
      ))}
      <text x={145} y={80} textAnchor="middle" fontSize="7" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.nTokensParallel}</text>

      <text x={145} y={118} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.computeBound}</text>
      <text x={145} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.highGpuUtilization}</text>
      <text x={145} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.fillKvCache}</text>

      {/* Divider */}
      <line x1={290} y1={35} x2={290} y2={165} stroke="#e2e8f0" strokeWidth={1}
        strokeDasharray="4,3" />

      {/* Decode side (right) */}
      <text x={435} y={42} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.decodeStage}</text>

      {/* Narrow batch visualization */}
      <rect x={415} y={52} width={40} height={50} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={435} y={80} textAnchor="middle" fontSize="7" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.oneToken}</text>

      <text x={435} y={118} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.memoryBound}</text>
      <text x={435} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.kvCacheBottleneck}</text>
      <text x={435} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.perTokenGeneration}</text>

      {/* Qwen3 params annotation */}
      <rect x={100} y={H - 30} width={380} height={22} rx={4}
        fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.8} />
      <text x={W / 2} y={H - 15} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.qwenParams}
      </text>
    </svg>
  );
}
