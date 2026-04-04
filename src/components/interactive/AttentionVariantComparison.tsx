import { useState } from 'react';
import { COLORS } from './shared/colors';

interface Variant {
  name: string;
  complexity: string;
  kvCache: string;
  coreIdea: string;
  models: string;
  extrapolation: string;
}

const VARIANTS: Variant[] = [
  {
    name: 'Full MHA',
    complexity: 'O(n²d)',
    kvCache: '2 × n_heads × d_head × seq',
    coreIdea: '每个 head 独立 Q/K/V，完整注意力',
    models: 'GPT-2/3, LLaMA-1, BERT',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'GQA',
    complexity: 'O(n²d)',
    kvCache: '2 × n_kv_heads × d_head × seq',
    coreIdea: '多个 Q head 共享 KV head，减少 KV 缓存',
    models: 'LLaMA-2/3, Gemma, Qwen',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'Sliding Window',
    complexity: 'O(nwd)',
    kvCache: '2 × n_heads × d_head × w',
    coreIdea: '每个 token 只 attend 前 w 个，堆叠扩大感受野',
    models: 'Mistral 7B, Mixtral, Gemma 2 (交替层)',
    extrapolation: '理论上无限长（滑动窗口）',
  },
  {
    name: 'Cross Attention',
    complexity: 'O(n·m·d)',
    kvCache: '2 × n_heads × d_head × m (encoder)',
    coreIdea: 'Q 来自 decoder，KV 来自 encoder/视觉',
    models: 'T5, BART, Flamingo, LLaVA',
    extrapolation: '取决于 encoder 序列长度',
  },
  {
    name: 'MLA',
    complexity: 'O(n²d)',
    kvCache: 'latent_dim × seq (极小)',
    coreIdea: '低秩压缩 KV cache，存 compressed latent',
    models: 'DeepSeek-V2, V3, R1',
    extrapolation: '受限于训练长度',
  },
  {
    name: 'Hybrid',
    complexity: '混合',
    kvCache: '分层不同',
    coreIdea: '混合不同 attention 类型（full + SWA / SSM）',
    models: 'Gemma 2, Jamba, Command-R',
    extrapolation: '取长补短',
  },
];

const columns: { key: keyof Variant; label: string; width: string }[] = [
  { key: 'name', label: '方法', width: 'w-28' },
  { key: 'complexity', label: '计算复杂度', width: 'w-24' },
  { key: 'kvCache', label: 'KV Cache', width: 'w-40' },
  { key: 'coreIdea', label: '核心思想', width: 'flex-1' },
];

export default function AttentionVariantComparison() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map(col => (
              <th key={col.key} className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 ${col.width}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((v, i) => (
            <tr key={i}
              className={`border-b last:border-b-0 transition-colors cursor-pointer
                ${hoveredIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}>
              <td className="px-3 py-2 font-semibold text-gray-800">{v.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-gray-600">{v.complexity}</td>
              <td className="px-3 py-2 font-mono text-xs text-gray-600">{v.kvCache}</td>
              <td className="px-3 py-2 text-gray-700">{v.coreIdea}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail panel */}
      {hoveredIdx !== null && (
        <div className="px-4 py-3 bg-blue-50 border-t text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-gray-500">代表模型：</span>
              <span className="ml-1 font-medium" style={{ color: COLORS.primary }}>
                {VARIANTS[hoveredIdx].models}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">长度外推：</span>
              <span className="ml-1">{VARIANTS[hoveredIdx].extrapolation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
