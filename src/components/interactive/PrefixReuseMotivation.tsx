import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Turn {
  label: string;
  systemPrompt: string;
  history: string[];
  newMessage: string;
}

const TURNS: Turn[] = [
  {
    label: '第 1 轮',
    systemPrompt: 'You are a helpful assistant...',
    history: [],
    newMessage: '什么是 PagedAttention？',
  },
  {
    label: '第 2 轮',
    systemPrompt: 'You are a helpful assistant...',
    history: ['什么是 PagedAttention？', 'PagedAttention 是一种...'],
    newMessage: '它和虚拟内存有什么关系？',
  },
  {
    label: '第 3 轮',
    systemPrompt: 'You are a helpful assistant...',
    history: ['什么是 PagedAttention？', 'PagedAttention 是一种...', '它和虚拟内存有什么关系？', '两者的核心思想...'],
    newMessage: '能举个具体例子吗？',
  },
];

const TOKEN_H = 22;
const TOKEN_GAP = 2;
const LEFT_X = 20;
const RIGHT_X = 300;
const BAR_W = 250;

export default function PrefixReuseMotivation() {
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [activeTurn, setActiveTurn] = useState(2);
  const turn = TURNS[activeTurn];

  // Build token blocks for display
  const blocks: { label: string; tokens: number; type: 'system' | 'history' | 'new' }[] = [
    { label: 'System Prompt', tokens: 50, type: 'system' },
  ];
  for (let i = 0; i < turn.history.length; i++) {
    blocks.push({ label: turn.history[i].slice(0, 15) + '...', tokens: 30 + i * 10, type: 'history' });
  }
  blocks.push({ label: turn.newMessage.slice(0, 15) + '...', tokens: 20, type: 'new' });

  const totalTokens = blocks.reduce((s, b) => s + b.tokens, 0);
  const reusableTokens = cacheEnabled ? totalTokens - blocks[blocks.length - 1].tokens : 0;
  const computeTokens = cacheEnabled ? blocks[blocks.length - 1].tokens : totalTokens;

  const typeColor = (t: string) =>
    t === 'system' ? COLORS.primary : t === 'history' ? COLORS.green : COLORS.orange;

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TURNS.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTurn(i)}
              style={{
                padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === activeTurn ? COLORS.primary : COLORS.light,
                color: i === activeTurn ? '#fff' : COLORS.dark,
                fontSize: 13, fontFamily: FONTS.sans,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={() => setCacheEnabled(!cacheEnabled)}
          />
          启用前缀缓存
        </label>
      </div>

      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Left: Token blocks */}
        <text x={LEFT_X} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
          输入 Token 序列
        </text>
        {blocks.map((block, i) => {
          const y = 35 + i * (TOKEN_H + TOKEN_GAP + 18);
          const barW = (block.tokens / totalTokens) * BAR_W;
          const isCached = cacheEnabled && block.type !== 'new';
          return (
            <g key={i}>
              <text x={LEFT_X} y={y} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>
                {block.label}
              </text>
              <rect
                x={LEFT_X} y={y + 4} width={barW} height={TOKEN_H} rx={3}
                fill={isCached ? COLORS.highlight : typeColor(block.type)}
                opacity={isCached ? 0.6 : 0.8}
                stroke={isCached ? COLORS.orange : 'none'}
                strokeWidth={isCached ? 1.5 : 0}
                strokeDasharray={isCached ? '4 2' : 'none'}
              />
              <text x={LEFT_X + barW + 6} y={y + 18} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>
                {block.tokens} tokens{isCached ? ' (cached)' : ''}
              </text>
            </g>
          );
        })}

        {/* Right: Compute comparison */}
        <text x={RIGHT_X} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
          Prefill 计算量
        </text>

        {/* Without cache */}
        <text x={RIGHT_X} y={50} fontSize={12} fill={COLORS.mid} fontFamily={FONTS.sans}>
          无缓存
        </text>
        <rect x={RIGHT_X} y={56} width={(totalTokens / totalTokens) * 230} height={24} rx={4} fill={COLORS.red} opacity={0.7} />
        <text x={RIGHT_X + 6} y={73} fontSize={11} fill="#fff" fontFamily={FONTS.mono}>
          {totalTokens} tokens
        </text>

        {/* With cache */}
        <text x={RIGHT_X} y={105} fontSize={12} fill={COLORS.mid} fontFamily={FONTS.sans}>
          有缓存
        </text>
        <rect
          x={RIGHT_X} y={111}
          width={(computeTokens / totalTokens) * 230}
          height={24} rx={4}
          fill={COLORS.green} opacity={0.8}
        />
        <text x={RIGHT_X + 6} y={128} fontSize={11} fill="#fff" fontFamily={FONTS.mono}>
          {computeTokens} tokens
        </text>

        {/* Savings */}
        {cacheEnabled && (
          <text x={RIGHT_X} y={158} fontSize={13} fontWeight={600} fill={COLORS.green} fontFamily={FONTS.sans}>
            节省 {Math.round((reusableTokens / totalTokens) * 100)}% 计算量
          </text>
        )}
        {!cacheEnabled && (
          <text x={RIGHT_X} y={158} fontSize={12} fill={COLORS.mid} fontFamily={FONTS.sans}>
            开启缓存以查看节省效果 ↑
          </text>
        )}

        {/* Legend */}
        {[
          { label: 'System Prompt', color: COLORS.primary },
          { label: 'History', color: COLORS.green },
          { label: 'New Message', color: COLORS.orange },
          { label: 'Cached (skip)', color: COLORS.highlight },
        ].map((item, i) => (
          <g key={i} transform={`translate(${RIGHT_X}, ${H - 80 + i * 18})`}>
            <rect width={12} height={12} rx={2} fill={item.color} opacity={0.8} />
            <text x={18} y={10} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
