// src/components/interactive/EncodingComparison.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface EncodingMethod {
  name: string;
  type: '绝对' | '相对';
  params: string;
  extrapolation: string;
  extrapolationLevel: 'low' | 'medium' | 'high';
  cost: string;
  models: string;
  summary: string;
}

const METHODS: EncodingMethod[] = [
  {
    name: 'Sinusoidal',
    type: '绝对',
    params: '无',
    extrapolation: '有限',
    extrapolationLevel: 'low',
    cost: '极低',
    models: 'Transformer (原始)',
    summary: '用不同频率的 sin/cos 函数生成固定编码，无需训练，理论可外推但实际效果有限',
  },
  {
    name: 'Learned',
    type: '绝对',
    params: 'L_max × d',
    extrapolation: '无',
    extrapolationLevel: 'low',
    cost: '极低',
    models: 'BERT, GPT-2',
    summary: '直接训练位置向量表，简单有效，但序列长度被训练时的 L_max 限死',
  },
  {
    name: 'Shaw (Relative)',
    type: '相对',
    params: '2K+1 个偏置',
    extrapolation: '中等',
    extrapolationLevel: 'medium',
    cost: '中等',
    models: 'Transformer-XL',
    summary: '在 Attention 分数中加入可学习的相对位置偏置，天然支持变长序列',
  },
  {
    name: 'ALiBi',
    type: '相对',
    params: '无',
    extrapolation: '强',
    extrapolationLevel: 'high',
    cost: '极低',
    models: 'BLOOM, MPT',
    summary: '直接在 Attention 分数上减去线性距离惩罚 m·|i−j|，零参数且外推能力极强',
  },
  {
    name: 'RoPE',
    type: '相对',
    params: '无',
    extrapolation: '中→强',
    extrapolationLevel: 'high',
    cost: '低',
    models: 'LLaMA, GPT-NeoX, Qwen',
    summary: '对 Q/K 向量做旋转变换，内积自然只依赖相对位置；配合 NTK/YaRN 可显著提升外推',
  },
];

const EXTRAP_COLORS: Record<string, string> = {
  low: COLORS.red,
  medium: COLORS.orange,
  high: COLORS.green,
};

export default function EncodingComparison() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {['方案', '类型', '训练参数', '外推能力', '计算开销', '代表模型'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m, i) => (
            <tr key={m.name}>
              <td colSpan={6} className="p-0">
                <div
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: hovered === i ? COLORS.highlight : expanded === i ? '#f0f7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="grid grid-cols-6 px-3 py-2.5 items-center border-b border-gray-100">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <span className="text-xs text-gray-400">{expanded === i ? '▼' : '▶'}</span>
                      {m.name}
                    </div>
                    <div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                        m.type === '绝对' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {m.type}
                      </span>
                    </div>
                    <div className="text-gray-600 font-mono text-xs">{m.params}</div>
                    <div>
                      <span className="font-medium" style={{ color: EXTRAP_COLORS[m.extrapolationLevel] }}>
                        {m.extrapolation}
                      </span>
                    </div>
                    <div className="text-gray-600">{m.cost}</div>
                    <div className="text-gray-600 text-xs">{m.models}</div>
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
