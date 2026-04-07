import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Variant {
  id: string;
  nameZh: string;
  nameEn: string;
  year: string;
  paperZh: string;
  paperEn: string;
  formulaState: string;
  formulaOutput: string;
  highlightZh: string;
  highlightEn: string;
  innovationZh: string;
  innovationEn: string;
  limitZh: string;
  limitEn: string;
  color: string;
}

const variants: Variant[] = [
  {
    id: 'basic',
    nameZh: '基础 Linear Attention',
    nameEn: 'Basic Linear Attention',
    year: '2020',
    paperZh: 'Katharopoulos et al.',
    paperEn: 'Katharopoulos et al.',
    formulaState: 'Sₜ = Sₜ₋₁ + kₜ vₜᵀ',
    formulaOutput: 'oₜ = qₜ Sₜ',
    highlightZh: '+ kₜ vₜᵀ（直接累加）',
    highlightEn: '+ kₜ vₜᵀ (direct accumulation)',
    innovationZh: '去掉 softmax，利用矩阵乘法结合律将 O(n²) 降到 O(n)。可写成 RNN 递推形式，推理时只需维护固定大小的 d×d 状态矩阵',
    innovationEn: 'Remove softmax, exploit matrix associativity to reduce O(n²) to O(n). Can be written as RNN recurrence — inference only needs a fixed-size d×d state matrix',
    limitZh: '状态只累加、不遗忘 — 所有历史信息混在一起，注意力分布"平坦"，建模能力远弱于 softmax attention',
    limitEn: 'State only accumulates, never forgets — all history blends together, attention becomes "flat", much weaker than softmax attention',
    color: COLORS.primary,
  },
  {
    id: 'retnet',
    nameZh: 'RetNet（指数衰减）',
    nameEn: 'RetNet (exponential decay)',
    year: '2023',
    paperZh: 'Sun et al. (MSR)',
    paperEn: 'Sun et al. (MSR)',
    formulaState: 'Sₜ = γ · Sₜ₋₁ + kₜ vₜᵀ',
    formulaOutput: 'oₜ = qₜ Sₜ',
    highlightZh: 'γ ·（指数衰减因子）',
    highlightEn: 'γ · (exponential decay factor)',
    innovationZh: '加入衰减因子 γ（0 < γ < 1），旧状态每步自动缩小。越远的 token 影响越弱，模拟了 attention 的"近处更重要"偏好。同时支持 recurrence（O(1) 增量推理）、parallel 和 chunkwise 三种计算模式',
    innovationEn: 'Add decay factor γ (0 < γ < 1), old state automatically shrinks each step. More distant tokens have weaker influence, mimicking attention\'s "recency bias". Supports recurrence (O(1) incremental inference), parallel, and chunkwise computation modes',
    limitZh: 'γ 是固定超参数，不依赖输入 — 无法根据 token 重要性动态调整遗忘速度',
    limitEn: 'γ is a fixed hyperparameter, not input-dependent — cannot dynamically adjust forgetting based on token importance',
    color: COLORS.orange,
  },
  {
    id: 'deltanet',
    nameZh: 'DeltaNet（Delta Rule 纠错）',
    nameEn: 'DeltaNet (Delta Rule)',
    year: '2024',
    paperZh: 'Yang et al., 2024',
    paperEn: 'Yang et al., 2024',
    formulaState: 'Sₜ = Sₜ₋₁ + βₜ kₜ (vₜ − kₜᵀ Sₜ₋₁)ᵀ',
    formulaOutput: 'oₜ = qₜ Sₜ',
    highlightZh: 'vₜ − kₜᵀSₜ₋₁（纠错：只写入差值）',
    highlightEn: 'vₜ − kₜᵀSₜ₋₁ (error-correcting: write only delta)',
    innovationZh: 'Delta rule — 不盲目累加，而是先用 kₜ 查当前状态得到 kₜᵀSₜ₋₁（"已有什么"），再算差值 vₜ − kₜᵀSₜ₋₁（"还缺什么"），只写入纠错量。这等价于一种联想记忆的在线学习规则',
    innovationEn: 'Delta rule — instead of blind accumulation, first query the current state with kₜ to get kₜᵀSₜ₋₁ ("what we already have"), compute delta vₜ − kₜᵀSₜ₋₁ ("what\'s missing"), and write only the correction. Equivalent to an online learning rule for associative memory',
    limitZh: '遗忘仍依赖隐式覆盖（新的写入覆盖旧值），缺少显式的门控遗忘机制',
    limitEn: 'Forgetting still relies on implicit overwriting, lacks an explicit gated forgetting mechanism',
    color: COLORS.green,
  },
  {
    id: 'gdn',
    nameZh: 'GDN（门控 + Delta Rule）',
    nameEn: 'GDN (Gated + Delta Rule)',
    year: '2024',
    paperZh: 'Yang, Kautz, Hatamizadeh (ICLR 2025)',
    paperEn: 'Yang, Kautz, Hatamizadeh (ICLR 2025)',
    formulaState: 'Sₜ = αₜ ⊙ Sₜ₋₁ + βₜ kₜ (vₜ − kₜᵀ Sₜ₋₁)ᵀ',
    formulaOutput: 'oₜ = qₜ Sₜ',
    highlightZh: 'αₜ ⊙（输入依赖的门控遗忘）',
    highlightEn: 'αₜ ⊙ (input-dependent gated forgetting)',
    innovationZh: '结合两种互补机制：αₜ 门控（借鉴 Mamba2）实现快速、选择性遗忘；delta rule 实现精准写入。两者缺一不可 — 门控只管"擦除"，delta rule 只管"写入"。论文证明 GDN 在语言建模、上下文检索、长序列理解等任务上超越 Mamba2',
    innovationEn: 'Combines two complementary mechanisms: αₜ gating (inspired by Mamba2) for rapid, selective forgetting; delta rule for targeted writing. Both are necessary — gating handles "erasure", delta rule handles "writing". Paper shows GDN outperforms Mamba2 on language modeling, in-context retrieval, and long-context tasks',
    limitZh: '当前最优 linear attention 方案 — Hybrid 架构（GDN 层 + sliding window attention 层交替）效果最佳',
    limitEn: 'Current best linear attention approach — Hybrid architecture (alternating GDN layers + sliding window attention layers) achieves best results',
    color: COLORS.purple,
  },
];

export default function LinearAttentionFamily({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [selected, setSelected] = useState(0);
  const v = variants[selected];

  const t = locale === 'zh' ? {
    stateUpdate: '状态更新',
    output: '输出',
    keyChange: '关键变化',
    innovation: '核心创新',
    limitation: '局限 / 现状',
    paper: '论文',
  } : {
    stateUpdate: 'State Update',
    output: 'Output',
    keyChange: 'Key Change',
    innovation: 'Core Innovation',
    limitation: 'Limitation / Status',
    paper: 'Paper',
  };

  // Timeline layout
  const tlW = 600, tlH = 60;
  const nodePositions = [75, 225, 375, 525];

  return (
    <div className="not-prose my-6">
      {/* Timeline */}
      <svg viewBox={`0 0 ${tlW} ${tlH}`} className="w-full mb-3" style={{ maxWidth: tlW, fontFamily: FONTS.sans }}>
        {/* Line */}
        <line x1={nodePositions[0]} y1={18} x2={nodePositions[3]} y2={18}
              stroke={COLORS.light} strokeWidth={3} />
        {/* Progress line up to selected */}
        {selected > 0 && (
          <line x1={nodePositions[0]} y1={18} x2={nodePositions[selected]} y2={18}
                stroke={v.color} strokeWidth={3} strokeOpacity={0.4} />
        )}
        {/* Nodes */}
        {variants.map((vr, i) => {
          const x = nodePositions[i];
          const isSel = i === selected;
          return (
            <g key={vr.id} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={18} r={isSel ? 15 : 11}
                      fill={isSel ? vr.color : '#fff'}
                      stroke={vr.color} strokeWidth={2} />
              <text x={x} y={20} textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fontWeight={700}
                    fill={isSel ? '#fff' : vr.color}>
                {vr.year}
              </text>
              <text x={x} y={50} textAnchor="middle"
                    fontSize={9} fontWeight={isSel ? 700 : 400}
                    fill={isSel ? vr.color : COLORS.mid}
                    fontFamily={FONTS.sans}>
                {locale === 'zh' ? vr.nameZh : vr.nameEn}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="border rounded-lg p-5"
          style={{ borderColor: v.color + '30', backgroundColor: v.color + '06' }}
        >
          {/* State update formula */}
          <div className="mb-1">
            <span className="text-xs text-gray-500">{t.stateUpdate}</span>
          </div>
          <div className="font-mono text-lg font-bold mb-1" style={{ color: v.color }}>
            {v.formulaState}
          </div>
          <div className="mb-4">
            <span className="text-xs text-gray-500">{t.output}: </span>
            <span className="font-mono text-sm text-gray-600">{v.formulaOutput}</span>
          </div>

          {/* Key change highlight */}
          <div className="mb-4 px-3 py-2 rounded-md" style={{ backgroundColor: v.color + '10' }}>
            <span className="text-xs font-semibold" style={{ color: v.color }}>{t.keyChange}: </span>
            <span className="font-mono text-sm" style={{ color: v.color }}>
              {locale === 'zh' ? v.highlightZh : v.highlightEn}
            </span>
          </div>

          {/* Innovation */}
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1" style={{ color: v.color }}>{t.innovation}</div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {locale === 'zh' ? v.innovationZh : v.innovationEn}
            </div>
          </div>

          {/* Limitation */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-500 mb-1">{t.limitation}</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {locale === 'zh' ? v.limitZh : v.limitEn}
            </div>
          </div>

          {/* Paper */}
          <div className="text-xs text-gray-400">
            {t.paper}: {locale === 'zh' ? v.paperZh : v.paperEn}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
