// src/components/interactive/SpecMethodComparison.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface SpecMethod {
  name: string;
  extraParams: string;
  trainingCost: string;
  trainingLevel: 'none' | 'low' | 'medium' | 'high';
  speedup: string;
  useCase: string;
  summary: string;
}

const TRAINING_COLORS: Record<string, string> = {
  none: COLORS.green,
  low: '#2196f3',
  medium: COLORS.orange,
  high: COLORS.red,
};

export default function SpecMethodComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      method: '方法',
      extraParams: '额外参数',
      trainingCost: '训练成本',
      speedup: '加速比',
      useCase: '适用场景',
      methods: [
        {
          name: 'Draft-then-Verify',
          extraParams: '独立 draft model',
          trainingCost: '需训练 draft',
          trainingLevel: 'high',
          speedup: '2-3x',
          useCase: '有配套小模型',
          summary: '经典方案：小模型自回归 draft，大模型一次验证，通过 rejection sampling 保证分布一致性',
        },
        {
          name: 'Medusa',
          extraParams: '多个轻量 head',
          trainingCost: '低',
          trainingLevel: 'low',
          speedup: '2-3x',
          useCase: '快速部署',
          summary: '在 target model 最后一层加多个预测 head，冻结主模型只训 head，用 tree attention 验证',
        },
        {
          name: 'MTP',
          extraParams: '训练时内置',
          trainingCost: '高（预训练）',
          trainingLevel: 'high',
          speedup: '2-3x',
          useCase: '从头训新模型',
          summary: '训练时联合优化多个预测头，推理时直接复用做 draft — 头和 backbone 一起训练，预测质量最高',
        },
        {
          name: 'Eagle',
          extraParams: '轻量 decoder',
          trainingCost: '低',
          trainingLevel: 'low',
          speedup: '3-4x',
          useCase: '追求最高加速比',
          summary: '用 target model 的 hidden state（而非 token embedding）做 draft，信息量远大于 token 级别 → 最高 acceptance rate',
        },
        {
          name: 'Eagle-3',
          extraParams: '轻量 draft model',
          trainingCost: '低',
          trainingLevel: 'low',
          speedup: '~6.5x',
          useCase: '最高加速比',
          summary: 'Direct token prediction + multi-layer feature fusion (Training-Time Test)，不再预测 feature 而是直接预测 token，比 EAGLE-2 提升约 1.4x',
        },
        {
          name: 'Lookahead',
          extraParams: '无',
          trainingCost: '零',
          trainingLevel: 'none',
          speedup: '1.5-2x',
          useCase: '即插即用',
          summary: '基于 Jacobi 迭代，同时猜测多个位置并行验证，不需要任何额外模型或训练 — 但加速比较低',
        },
      ] as SpecMethod[],
    },
    en: {
      method: 'Method',
      extraParams: 'Extra Params',
      trainingCost: 'Training Cost',
      speedup: 'Speedup',
      useCase: 'Use Case',
      methods: [
        {
          name: 'Draft-then-Verify',
          extraParams: 'Separate draft model',
          trainingCost: 'Train draft model',
          trainingLevel: 'high',
          speedup: '2-3x',
          useCase: 'With small model',
          summary: 'Classic approach: small model autoregressively drafts, large model verifies once, ensures distribution consistency via rejection sampling',
        },
        {
          name: 'Medusa',
          extraParams: 'Multiple lightweight heads',
          trainingCost: 'Low',
          trainingLevel: 'low',
          speedup: '2-3x',
          useCase: 'Quick deployment',
          summary: 'Add multiple prediction heads to last layer of target model, freeze main model and train only heads, verify with tree attention',
        },
        {
          name: 'MTP',
          extraParams: 'Built-in at training',
          trainingCost: 'High (pretrain)',
          trainingLevel: 'high',
          speedup: '2-3x',
          useCase: 'Train new model',
          summary: 'Jointly optimize multiple prediction heads during training, directly reuse for draft at inference — heads and backbone trained together, highest prediction quality',
        },
        {
          name: 'Eagle',
          extraParams: 'Lightweight decoder',
          trainingCost: 'Low',
          trainingLevel: 'low',
          speedup: '3-4x',
          useCase: 'Max acceleration',
          summary: 'Use target model hidden states (not token embeddings) for draft, far more information than token level → highest acceptance rate',
        },
        {
          name: 'Eagle-3',
          extraParams: 'Lightweight draft model',
          trainingCost: 'Low',
          trainingLevel: 'low',
          speedup: '~6.5x',
          useCase: 'Max acceleration',
          summary: 'Direct token prediction + multi-layer feature fusion (Training-Time Test), predicts tokens directly instead of features, ~1.4× faster than EAGLE-2',
        },
        {
          name: 'Lookahead',
          extraParams: 'None',
          trainingCost: 'Zero',
          trainingLevel: 'none',
          speedup: '1.5-2x',
          useCase: 'Plug-and-play',
          summary: 'Based on Jacobi iteration, simultaneously guesses multiple positions and verifies in parallel, no extra model or training needed — but lower speedup',
        },
      ] as SpecMethod[],
    },
  }[locale];

  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {[t.method, t.extraParams, t.trainingCost, t.speedup, t.useCase].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.methods.map((m, i) => (
            <tr key={m.name}>
              <td colSpan={5} className="p-0">
                <div
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: hovered === i ? COLORS.highlight : expanded === i ? '#f0f7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="grid grid-cols-5 px-3 py-2.5 items-center border-b border-gray-100">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <span className="text-xs text-gray-400">{expanded === i ? '▼' : '▶'}</span>
                      {m.name}
                    </div>
                    <div className="text-gray-600 text-xs">{m.extraParams}</div>
                    <div>
                      <span className="font-medium" style={{ color: TRAINING_COLORS[m.trainingLevel] }}>
                        {m.trainingCost}
                      </span>
                    </div>
                    <div className="font-mono font-bold" style={{ color: COLORS.primary }}>{m.speedup}</div>
                    <div className="text-gray-600 text-xs">{m.useCase}</div>
                  </div>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-100">
                          {m.summary}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
