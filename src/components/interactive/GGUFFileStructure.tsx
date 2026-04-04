import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Region {
  id: string;
  label: string;
  y: number;
  h: number;
  color: string;
  fill: string;
  details: string[];
  annotation: string;
}

const REGIONS: Region[] = [
  {
    id: 'header', label: 'Header', y: 45, h: 50, color: '#7c3aed', fill: '#ede9fe',
    details: [
      'Magic: "GGUF" (4 bytes)',
      'Version: 3 (uint32)',
      'Tensor count: 291 (uint64)',
      'Metadata KV count: 26 (uint64)',
    ],
    annotation: '固定 24 bytes',
  },
  {
    id: 'metadata', label: 'Metadata KV', y: 100, h: 70, color: COLORS.primary, fill: '#dbeafe',
    details: [
      'general.architecture = "qwen3"',
      'general.name = "Qwen3-4B"',
      'qwen3.block_count = 36',
      'qwen3.embedding_length = 2560',
      'tokenizer.ggml.model = "gpt2"',
      'tokenizer.ggml.tokens = [array of 151665]',
      'tokenizer.chat_template = "{% for message in..."',
    ],
    annotation: '类型化 KV: string, uint32, float32, array...',
  },
  {
    id: 'tensorinfo', label: 'Tensor Info', y: 175, h: 60, color: COLORS.orange, fill: '#fef3c7',
    details: [
      '每个 tensor: name + shape + type + offset',
      'blk.0.attn_q.weight: [2560, 2560], Q4_K_M, offset=0',
      'blk.0.attn_k.weight: [512, 2560], Q4_K_M, offset=3440640',
      '... (共 291 个 tensor)',
    ],
    annotation: '描述每个 tensor 的元数据, 不含实际数据',
  },
  {
    id: 'tensordata', label: 'Tensor Data', y: 240, h: 90, color: COLORS.green, fill: '#dcfce7',
    details: [
      '按 32 字节对齐 (mmap + SIMD 友好)',
      '实际量化后的权重数据',
      '直接 mmap 映射, 按需访问, 无需全部加载',
      'Qwen3-4B Q4_K_M: ~2.6 GB',
    ],
    annotation: '文件主体, 占 >95% 文件大小',
  },
];

export default function GGUFFileStructure() {
  const [selected, setSelected] = useState<string | null>(null);
  const selRegion = REGIONS.find(r => r.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          GGUF 文件结构 (以 Qwen3-4B Q4_K_M 为例)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          点击各区域查看详情 | 单文件自包含: 权重 + tokenizer + 模型配置 + prompt template
        </text>

        {REGIONS.map(r => (
          <g key={r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={100} y={r.y} width={300} height={r.h} rx={6}
              fill={selected === r.id ? r.fill : r.fill}
              stroke={r.color}
              strokeWidth={selected === r.id ? 2.5 : 1.2}
              opacity={selected && selected !== r.id ? 0.4 : 1} />
            <text x={250} y={r.y + r.h / 2 + 4} textAnchor="middle"
              fontSize="10" fontWeight="700" fill={r.color} fontFamily={FONTS.sans}>
              {r.label}
            </text>
            {/* Right annotation */}
            <text x={415} y={r.y + r.h / 2 + 3} fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.sans}>
              {r.annotation}
            </text>
          </g>
        ))}

        {/* File size annotation */}
        <text x={250} y={H - 30} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Qwen3-4B Q4_K_M: 291 tensors, 26 metadata KV, ~2.6 GB 总大小
        </text>
      </svg>

      {/* Detail panel */}
      {selRegion && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
          <p className="font-semibold mb-1" style={{ color: selRegion.color }}>
            {selRegion.label}
          </p>
          <ul className="space-y-0.5 text-gray-600 text-xs">
            {selRegion.details.map((d, i) => (
              <li key={i} className="font-mono">{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
