import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface CompareRow {
  dimension: string;
  vllm: string;
  sglang: string;
  detail: string;
}

const ROWS: CompareRow[] = [
  {
    dimension: '数据结构',
    vllm: 'Hash Table',
    sglang: 'Radix Tree',
    detail: 'vLLM 对每个 token block 计算 hash，在全局 hash table 中查找。SGLang 用 radix tree（基数树）组织所有已缓存的 KV 前缀，支持最长前缀匹配。',
  },
  {
    dimension: '匹配方式',
    vllm: '精确前缀匹配',
    sglang: '最长前缀匹配',
    detail: 'vLLM 的 hash 链式依赖（block N 的 hash 包含 block 0..N-1 的信息），只能匹配从头开始的精确前缀。SGLang 的 radix tree 天然支持任意长度的前缀匹配。',
  },
  {
    dimension: '匹配粒度',
    vllm: 'Block 级别',
    sglang: 'Token 级别',
    detail: 'vLLM 以 block（通常 16 tokens）为最小匹配单位，不足一个 block 的前缀无法匹配。SGLang 的 radix tree 可以匹配任意 token 级别的前缀。',
  },
  {
    dimension: '淘汰策略',
    vllm: '引用计数 + LRU',
    sglang: 'LRU 从叶节点开始',
    detail: 'vLLM 通过引用计数管理物理块，引用为 0 时进入 LRU 队列。SGLang 在 radix tree 上从最久未用的叶节点开始淘汰，自然保留高频共享前缀。',
  },
  {
    dimension: '非前缀共享',
    vllm: '不支持',
    sglang: '有限支持',
    detail: 'vLLM 的 hash 链式机制限制只能匹配前缀。SGLang 的 radix tree 可以在分叉点共享中间节点，但仍要求从 root 开始的公共路径。',
  },
  {
    dimension: '查找复杂度',
    vllm: 'O(1) per block',
    sglang: 'O(L) L=前缀长度',
    detail: 'vLLM 的 hash table 查找是常数时间。SGLang 的 radix tree 查找与前缀长度成正比，但实际中树的深度有限，性能差异不大。',
  },
];

export default function PrefixCachingCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      dimension: '维度',
      clickToExpand: '点击任一行展开详细说明。vLLM 从 v0.6 开始也实验性支持 tree-based caching。',
    },
    en: {
      dimension: 'Dimension',
      clickToExpand: 'Click any row to expand details. vLLM also experimentally supports tree-based caching from v0.6.',
    },
  }[locale];

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: W }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1,
        background: COLORS.dark, borderRadius: '8px 8px 0 0', overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#fff' }}>{t.dimension}</div>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
          vLLM (Hash-based)
        </div>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
          SGLang (RadixAttention)
        </div>
      </div>

      {/* Rows */}
      {ROWS.map((row, i) => {
        const isExpanded = expandedRow === i;
        return (
          <div key={i}>
            <div
              onClick={() => setExpandedRow(isExpanded ? null : i)}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1,
                cursor: 'pointer', background: '#e5e7eb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div style={{
                padding: '10px 12px', fontSize: 12, fontWeight: 500,
                background: isExpanded ? COLORS.highlight : COLORS.bgAlt,
                color: COLORS.dark,
              }}>
                {row.dimension} {isExpanded ? '▾' : '▸'}
              </div>
              <div style={{
                padding: '10px 12px', fontSize: 12, textAlign: 'center',
                background: isExpanded ? '#eff6ff' : COLORS.bg, color: COLORS.dark,
                fontFamily: FONTS.mono,
              }}>
                {row.vllm}
              </div>
              <div style={{
                padding: '10px 12px', fontSize: 12, textAlign: 'center',
                background: isExpanded ? '#ecfdf5' : COLORS.bg, color: COLORS.dark,
                fontFamily: FONTS.mono,
              }}>
                {row.sglang}
              </div>
            </div>
            {isExpanded && (
              <div style={{
                padding: '10px 16px', fontSize: 12, lineHeight: 1.6,
                background: COLORS.highlight, color: COLORS.dark,
                borderBottom: '1px solid #e5e7eb',
              }}>
                {row.detail}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        padding: '8px 12px', background: COLORS.bgAlt,
        borderRadius: '0 0 8px 8px', fontSize: 11, color: COLORS.mid,
        borderTop: '1px solid #e5e7eb',
      }}>
        {t.clickToExpand}
      </div>
    </div>
  );
}
