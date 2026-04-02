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

const METHODS: SpecMethod[] = [
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
    name: 'Lookahead',
    extraParams: '无',
    trainingCost: '零',
    trainingLevel: 'none',
    speedup: '1.5-2x',
    useCase: '即插即用',
    summary: '基于 Jacobi 迭代，同时猜测多个位置并行验证，不需要任何额外模型或训练 — 但加速比较低',
  },
];

const TRAINING_COLORS: Record<string, string> = {
  none: COLORS.green,
  low: '#2196f3',
  medium: COLORS.orange,
  high: COLORS.red,
};

export default function SpecMethodComparison() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {['方法', '额外参数', '训练成本', '加速比', '适用场景'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m, i) => (
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
                          💡 {m.summary}
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
