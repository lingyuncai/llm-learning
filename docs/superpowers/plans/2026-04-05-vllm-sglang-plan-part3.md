# vLLM + SGLang Plan — Part 3 (Tasks 21-34)

> Continuation of `2026-04-05-vllm-sglang-plan-part2.md`. Same conventions apply.

---

## Task 21: PrefixReuseMotivation

**Files:**
- Create: `src/components/interactive/PrefixReuseMotivation.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Verify (Task 21)**

Run: `npx tsc --noEmit src/components/interactive/PrefixReuseMotivation.tsx`
Expected: no errors

---

## Task 22: HashPrefixCaching

**Files:**
- Create: `src/components/interactive/HashPrefixCaching.tsx`

- [ ] **Step 1: Create the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;

function TokenBlocks() {
  const tokens = ['You', ' are', ' a', ' helpful', ' assistant', '.', ' What', ' is', ' Paged', 'Attention', '?'];
  const blockSize = 4;
  const blocks: string[][] = [];
  for (let i = 0; i < tokens.length; i += blockSize) {
    blocks.push(tokens.slice(i, i + blockSize));
  }

  return (
    <svg width={W} height={120} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 1: Token 序列分块 (block_size = 4)
      </text>
      {blocks.map((block, bi) => {
        const x = 10 + bi * 180;
        return (
          <g key={bi}>
            <rect x={x} y={35} width={170} height={40} rx={4}
              fill={bi < blocks.length - 1 ? COLORS.valid : COLORS.highlight}
              stroke={COLORS.primary} strokeWidth={1} />
            <text x={x + 8} y={60} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>
              [{block.join(', ')}]
            </text>
            <text x={x + 70} y={90} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="middle">
              Block {bi}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HashComputation() {
  const hashes = [
    { block: 'Block 0', tokens: '["You"," are"," a"," helpful"]', hash: '0xa3f2', status: 'new' },
    { block: 'Block 1', tokens: '["assistant","."," What"," is"]', hash: '0x7b1c', status: 'new' },
    { block: 'Block 2', tokens: '[" Paged","Attention","?"]', hash: '0xd4e8', status: 'new' },
  ];

  return (
    <svg width={W} height={200} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 2: 每块计算 Hash 值
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        hash = SHA256(layer_id + block_tokens + prefix_hash)
      </text>
      {hashes.map((h, i) => {
        const y = 55 + i * 48;
        return (
          <g key={i}>
            <rect x={10} y={y} width={300} height={36} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
            <text x={20} y={y + 15} fontSize={11} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
              {h.block}
            </text>
            <text x={20} y={y + 28} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
              {h.tokens}
            </text>
            {/* Arrow */}
            <line x1={320} y1={y + 18} x2={370} y2={y + 18} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowH)" />
            {/* Hash */}
            <rect x={380} y={y + 4} width={80} height={28} rx={14} fill={COLORS.primary} />
            <text x={420} y={y + 23} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">
              {h.hash}
            </text>
          </g>
        );
      })}
      <defs>
        <marker id="arrowH" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
        </marker>
      </defs>
    </svg>
  );
}

function HashTableLookup() {
  const entries = [
    { hash: '0xa3f2', physBlock: 'Phys 5', hit: true },
    { hash: '0x7b1c', physBlock: 'Phys 12', hit: true },
    { hash: '0xd4e8', physBlock: '—', hit: false },
  ];

  return (
    <svg width={W} height={220} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 3: Hash Table 查表 → 命中复用 / 未命中计算
      </text>
      {/* Hash table header */}
      <rect x={10} y={35} width={W - 20} height={28} rx={4} fill={COLORS.dark} />
      <text x={80} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Hash</text>
      <text x={220} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Physical Block</text>
      <text x={380} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Status</text>

      {entries.map((e, i) => {
        const y = 68 + i * 36;
        return (
          <g key={i}>
            <rect x={10} y={y} width={W - 20} height={32} rx={0}
              fill={e.hit ? '#ecfdf5' : COLORS.waste} />
            <text x={80} y={y + 20} fontSize={12} fill={COLORS.dark} fontFamily={FONTS.mono} textAnchor="middle">
              {e.hash}
            </text>
            <text x={220} y={y + 20} fontSize={12} fill={COLORS.dark} fontFamily={FONTS.mono} textAnchor="middle">
              {e.physBlock}
            </text>
            <text x={380} y={y + 20} fontSize={12} fontWeight={600}
              fill={e.hit ? COLORS.green : COLORS.red} fontFamily={FONTS.sans} textAnchor="middle">
              {e.hit ? '✓ HIT — 复用' : '✗ MISS — 计算'}
            </text>
          </g>
        );
      })}

      <text x={10} y={190} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        优点：实现简单，O(1) 查找。缺点：只能匹配精确前缀（hash 依赖 prefix_hash 链式计算），
      </text>
      <text x={10} y={205} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        无法处理非前缀位置的共享（如中间片段相同但开头不同）。
      </text>
    </svg>
  );
}

export default function HashPrefixCaching() {
  return (
    <StepNavigator
      steps={[
        { title: '分块', content: <TokenBlocks /> },
        { title: '计算 Hash', content: <HashComputation /> },
        { title: '查表复用', content: <HashTableLookup /> },
      ]}
    />
  );
}
```

- [ ] **Step 2: Verify (Task 22)**

Run: `npx tsc --noEmit src/components/interactive/HashPrefixCaching.tsx`
Expected: no errors

---

## Task 23: RadixTreeViz

**Files:**
- Create: `src/components/interactive/RadixTreeViz.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface TreeNode {
  id: string;
  tokens: string;
  children: TreeNode[];
  kvBlocks: number;
  refCount: number;
}

const SCENARIOS: { label: string; tree: TreeNode }[] = [
  {
    label: '单轮对话',
    tree: {
      id: 'root', tokens: '[SYS] You are helpful...', children: [
        { id: 'q1', tokens: '[USER] 什么是 PagedAttention？', children: [
          { id: 'a1', tokens: '[ASST] PagedAttention 是...', children: [], kvBlocks: 3, refCount: 0 },
        ], kvBlocks: 2, refCount: 1 },
      ], kvBlocks: 4, refCount: 1,
    },
  },
  {
    label: '多轮对话',
    tree: {
      id: 'root', tokens: '[SYS] You are helpful...', children: [
        { id: 'q1', tokens: '[USER] 什么是 PA？', children: [
          { id: 'a1', tokens: '[ASST] PA 是...', children: [
            { id: 'q2', tokens: '[USER] 和虚拟内存？', children: [
              { id: 'a2', tokens: '[ASST] 类比...', children: [], kvBlocks: 2, refCount: 0 },
            ], kvBlocks: 2, refCount: 1 },
          ], kvBlocks: 2, refCount: 1 },
        ], kvBlocks: 2, refCount: 1 },
      ], kvBlocks: 4, refCount: 1,
    },
  },
  {
    label: '分支共享 (few-shot)',
    tree: {
      id: 'root', tokens: '[SYS] You are helpful...', children: [
        { id: 'fs', tokens: '[FEW-SHOT] examples...', children: [
          { id: 'u1', tokens: '[USER] 问题 A', children: [
            { id: 'a1', tokens: '[ASST] 回答 A', children: [], kvBlocks: 2, refCount: 0 },
          ], kvBlocks: 1, refCount: 1 },
          { id: 'u2', tokens: '[USER] 问题 B', children: [
            { id: 'a2', tokens: '[ASST] 回答 B', children: [], kvBlocks: 2, refCount: 0 },
          ], kvBlocks: 1, refCount: 1 },
          { id: 'u3', tokens: '[USER] 问题 C', children: [
            { id: 'a3', tokens: '[ASST] 回答 C', children: [], kvBlocks: 2, refCount: 0 },
          ], kvBlocks: 1, refCount: 1 },
        ], kvBlocks: 6, refCount: 3 },
      ], kvBlocks: 4, refCount: 1,
    },
  },
];

function layoutTree(node: TreeNode, x: number, y: number, width: number): { id: string; x: number; y: number; node: TreeNode; children: { parentX: number; parentY: number; childX: number; childY: number }[] }[] {
  const result: any[] = [];
  const nodeH = 50;
  const gapY = 70;

  result.push({ id: node.id, x, y, node, children: [] });

  const childCount = node.children.length;
  if (childCount > 0) {
    const childWidth = width / childCount;
    node.children.forEach((child, i) => {
      const cx = x - width / 2 + childWidth * i + childWidth / 2;
      const cy = y + gapY;
      result[0].children.push({ parentX: x, parentY: y + nodeH / 2, childX: cx, childY: cy - nodeH / 2 + 5 });
      result.push(...layoutTree(child, cx, cy, childWidth));
    });
  }
  return result;
}

export default function RadixTreeViz() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const scenario = SCENARIOS[scenarioIdx];

  const nodes = layoutTree(scenario.tree, W / 2, 50, W - 60);
  const allEdges = nodes.flatMap(n => n.children);

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setScenarioIdx(i); setHoveredNode(null); }}
            style={{
              padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === scenarioIdx ? COLORS.primary : COLORS.light,
              color: i === scenarioIdx ? '#fff' : COLORS.dark,
              fontSize: 13, fontFamily: FONTS.sans,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Edges */}
        {allEdges.map((e, i) => (
          <line key={i} x1={e.parentX} y1={e.parentY} x2={e.childX} y2={e.childY}
            stroke={COLORS.mid} strokeWidth={1.5} opacity={0.4} />
        ))}

        {/* Nodes */}
        {nodes.map((n) => {
          const isHovered = hoveredNode === n.id;
          const isShared = n.node.refCount > 1;
          const nodeW = 140;
          const nodeH = 50;
          return (
            <g key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={n.x - nodeW / 2} y={n.y - nodeH / 2}
                width={nodeW} height={nodeH} rx={6}
                fill={isHovered ? COLORS.highlight : isShared ? '#ecfdf5' : COLORS.valid}
                stroke={isShared ? COLORS.green : COLORS.primary}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text x={n.x} y={n.y - 5} fontSize={10} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {n.node.tokens.length > 20 ? n.node.tokens.slice(0, 20) + '...' : n.node.tokens}
              </text>
              <text x={n.x} y={n.y + 12} fontSize={10} fill={COLORS.mid}
                fontFamily={FONTS.sans} textAnchor="middle">
                {n.node.kvBlocks} KV blocks | ref={n.node.refCount}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredNode && (() => {
          const n = nodes.find(nd => nd.id === hoveredNode);
          if (!n) return null;
          const tipW = 200;
          const tipH = 60;
          const tipX = Math.min(n.x + 80, W - tipW - 10);
          const tipY = Math.max(n.y - 30, 10);
          return (
            <g>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={tipX + 10} y={tipY + 18} fontSize={11} fill="#fff" fontFamily={FONTS.mono}>
                {n.node.tokens}
              </text>
              <text x={tipX + 10} y={tipY + 35} fontSize={11} fill={COLORS.light} fontFamily={FONTS.sans}>
                KV Blocks: {n.node.kvBlocks} | Refs: {n.node.refCount}
              </text>
              <text x={tipX + 10} y={tipY + 50} fontSize={11}
                fill={n.node.refCount > 1 ? '#4ade80' : COLORS.light} fontFamily={FONTS.sans}>
                {n.node.refCount > 1 ? '共享节点 — 多个序列复用' : '叶节点 — 独占'}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <g transform={`translate(10, ${H - 35})`}>
          <rect width={12} height={12} rx={2} fill="#ecfdf5" stroke={COLORS.green} strokeWidth={1} />
          <text x={18} y={10} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>共享前缀节点 (ref {'>'} 1)</text>
          <rect x={170} width={12} height={12} rx={2} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={188} y={10} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>独占节点</text>
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 23)**

Run: `npx tsc --noEmit src/components/interactive/RadixTreeViz.tsx`
Expected: no errors

---

## Task 24: RadixTreeEviction

**Files:**
- Create: `src/components/interactive/RadixTreeEviction.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface EvictNode {
  id: string;
  label: string;
  lastAccess: number; // timestamp (seconds ago)
  kvBlocks: number;
  children: string[];
  x: number;
  y: number;
  evicted: boolean;
}

const INITIAL_NODES: EvictNode[] = [
  { id: 'root', label: '[SYS] prompt', lastAccess: 0, kvBlocks: 4, children: ['a', 'b'], x: 290, y: 40, evicted: false },
  { id: 'a', label: '[USER] 问题A', lastAccess: 30, kvBlocks: 2, children: ['a1', 'a2'], x: 150, y: 130, evicted: false },
  { id: 'b', label: '[USER] 问题B', lastAccess: 5, kvBlocks: 2, children: ['b1'], x: 430, y: 130, evicted: false },
  { id: 'a1', label: '[ASST] 回答A1', lastAccess: 60, kvBlocks: 3, children: [], x: 80, y: 220, evicted: false },
  { id: 'a2', label: '[ASST] 回答A2', lastAccess: 45, kvBlocks: 2, children: [], x: 220, y: 220, evicted: false },
  { id: 'b1', label: '[ASST] 回答B1', lastAccess: 10, kvBlocks: 3, children: [], x: 430, y: 220, evicted: false },
];

const EDGES: [string, string][] = [
  ['root', 'a'], ['root', 'b'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1'],
];

export default function RadixTreeEviction() {
  const [nodes, setNodes] = useState<EvictNode[]>(INITIAL_NODES);
  const [evictionLog, setEvictionLog] = useState<string[]>([]);
  const [memoryUsed, setMemoryUsed] = useState(
    INITIAL_NODES.reduce((s, n) => s + n.kvBlocks, 0)
  );
  const memoryTotal = 20;

  const evictNext = () => {
    // Find leaf nodes that haven't been evicted
    const leaves = nodes.filter(
      n => !n.evicted && !nodes.some(other => !other.evicted && other.children.includes(n.id))
    );
    if (leaves.length === 0) return;

    // LRU: pick the leaf with the largest lastAccess (oldest)
    const victim = leaves.reduce((oldest, n) => n.lastAccess > oldest.lastAccess ? n : oldest);

    setNodes(prev => prev.map(n => n.id === victim.id ? { ...n, evicted: true } : n));
    setEvictionLog(prev => [...prev, `淘汰 "${victim.label}" (${victim.lastAccess}s ago, ${victim.kvBlocks} blocks)`]);
    setMemoryUsed(prev => prev - victim.kvBlocks);
  };

  const reset = () => {
    setNodes(INITIAL_NODES);
    setEvictionLog([]);
    setMemoryUsed(INITIAL_NODES.reduce((s, n) => s + n.kvBlocks, 0));
  };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button
          onClick={evictNext}
          style={{
            padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: COLORS.red, color: '#fff', fontSize: 13, fontFamily: FONTS.sans,
          }}
        >
          LRU 淘汰下一个
        </button>
        <button
          onClick={reset}
          style={{
            padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: COLORS.light, color: COLORS.dark, fontSize: 13, fontFamily: FONTS.sans,
          }}
        >
          重置
        </button>
        <span style={{ fontSize: 12, color: COLORS.mid, marginLeft: 8 }}>
          显存: {memoryUsed}/{memoryTotal} blocks
        </span>
        {/* Memory bar */}
        <svg width={120} height={16}>
          <rect width={120} height={16} rx={3} fill={COLORS.light} />
          <rect width={(memoryUsed / memoryTotal) * 120} height={16} rx={3}
            fill={memoryUsed > memoryTotal * 0.8 ? COLORS.red : COLORS.green} opacity={0.8} />
        </svg>
      </div>

      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Edges */}
        {EDGES.map(([from, to]) => {
          const f = nodeMap[from];
          const t = nodeMap[to];
          if (!f || !t) return null;
          return (
            <line key={`${from}-${to}`}
              x1={f.x} y1={f.y + 22} x2={t.x} y2={t.y - 5}
              stroke={t.evicted ? '#e5e7eb' : COLORS.mid}
              strokeWidth={1.5} opacity={t.evicted ? 0.3 : 0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const nW = 130;
          const nH = 44;
          return (
            <g key={n.id} opacity={n.evicted ? 0.25 : 1}>
              <rect x={n.x - nW / 2} y={n.y - nH / 2} width={nW} height={nH} rx={6}
                fill={n.evicted ? COLORS.masked : COLORS.valid}
                stroke={n.evicted ? '#e5e7eb' : COLORS.primary} strokeWidth={1}
              />
              <text x={n.x} y={n.y - 3} fontSize={10} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {n.label.length > 16 ? n.label.slice(0, 16) + '...' : n.label}
              </text>
              <text x={n.x} y={n.y + 12} fontSize={9} fill={COLORS.mid}
                fontFamily={FONTS.sans} textAnchor="middle">
                {n.kvBlocks} blocks | {n.lastAccess}s ago
              </text>
              {n.evicted && (
                <text x={n.x} y={n.y + 25} fontSize={10} fill={COLORS.red}
                  fontFamily={FONTS.sans} textAnchor="middle" fontWeight={600}>
                  已淘汰
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Eviction log */}
      {evictionLog.length > 0 && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: COLORS.bgAlt, borderRadius: 6, fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: COLORS.dark }}>淘汰日志:</div>
          {evictionLog.map((log, i) => (
            <div key={i} style={{ color: COLORS.red, fontFamily: FONTS.mono, fontSize: 11 }}>
              {i + 1}. {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 24)**

Run: `npx tsc --noEmit src/components/interactive/RadixTreeEviction.tsx`
Expected: no errors

---

## Task 25: CacheHitHeatmap

**Files:**
- Create: `src/components/interactive/CacheHitHeatmap.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

interface Pattern {
  label: string;
  description: string;
  hitRates: number[]; // per-request cache hit rates (0-1)
}

const PATTERNS: Pattern[] = [
  {
    label: '单轮独立',
    description: '每个请求完全独立，无共享前缀',
    hitRates: [0, 0, 0, 0.05, 0, 0, 0.02, 0, 0, 0],
  },
  {
    label: '多轮对话',
    description: '同一用户连续对话，共享 system prompt + 历史',
    hitRates: [0, 0.4, 0.55, 0.65, 0.72, 0.76, 0.79, 0.82, 0.84, 0.86],
  },
  {
    label: 'Few-shot',
    description: '多个请求共享相同的 few-shot examples',
    hitRates: [0, 0.7, 0.7, 0.7, 0.71, 0.7, 0.72, 0.7, 0.71, 0.7],
  },
  {
    label: 'Tree-of-Thought',
    description: '分支推理，共享前缀 + 部分中间路径',
    hitRates: [0, 0.5, 0.5, 0.35, 0.6, 0.45, 0.55, 0.4, 0.5, 0.65],
  },
];

const CELL_W = 42;
const CELL_H = 42;
const LABEL_W = 110;
const TOP_MARGIN = 50;
const LEFT_MARGIN = 15;

function hitColor(rate: number): string {
  if (rate === 0) return COLORS.waste;
  if (rate < 0.3) return '#fde68a';
  if (rate < 0.6) return '#fbbf24';
  if (rate < 0.8) return '#34d399';
  return COLORS.green;
}

export default function CacheHitHeatmap() {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Title */}
        <text x={W / 2} y={22} fontSize={13} fontWeight={600} fill={COLORS.dark}
          fontFamily={FONTS.sans} textAnchor="middle">
          不同对话模式下的缓存命中率
        </text>

        {/* Column headers */}
        {Array.from({ length: 10 }, (_, i) => (
          <text key={i}
            x={LEFT_MARGIN + LABEL_W + i * CELL_W + CELL_W / 2}
            y={TOP_MARGIN - 8}
            fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono} textAnchor="middle">
            R{i + 1}
          </text>
        ))}

        {/* Rows */}
        {PATTERNS.map((pattern, row) => {
          const y = TOP_MARGIN + row * (CELL_H + 4);
          return (
            <g key={row}>
              {/* Row label */}
              <text x={LEFT_MARGIN} y={y + CELL_H / 2 + 4} fontSize={11} fill={COLORS.dark}
                fontFamily={FONTS.sans} fontWeight={500}>
                {pattern.label}
              </text>

              {/* Cells */}
              {pattern.hitRates.map((rate, col) => {
                const x = LEFT_MARGIN + LABEL_W + col * CELL_W;
                const isHovered = hovered?.row === row && hovered?.col === col;
                return (
                  <g key={col}
                    onMouseEnter={() => setHovered({ row, col })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <rect x={x} y={y} width={CELL_W - 2} height={CELL_H - 2} rx={4}
                      fill={hitColor(rate)}
                      stroke={isHovered ? COLORS.dark : 'none'} strokeWidth={isHovered ? 2 : 0}
                    />
                    <text x={x + CELL_W / 2 - 1} y={y + CELL_H / 2 + 3}
                      fontSize={11} fill={rate > 0.6 ? '#fff' : COLORS.dark}
                      fontFamily={FONTS.mono} textAnchor="middle" fontWeight={500}>
                      {Math.round(rate * 100)}%
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const pattern = PATTERNS[hovered.row];
          const rate = pattern.hitRates[hovered.col];
          const tipW = 240;
          const tipH = 52;
          const tipX = Math.min(LEFT_MARGIN + LABEL_W + hovered.col * CELL_W, W - tipW - 10);
          const tipY = TOP_MARGIN + (hovered.row + 1) * (CELL_H + 4) + 4;
          return (
            <g>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={tipX + 10} y={tipY + 18} fontSize={11} fill="#fff" fontFamily={FONTS.sans}>
                {pattern.label} — 请求 #{hovered.col + 1}: {Math.round(rate * 100)}% 命中
              </text>
              <text x={tipX + 10} y={tipY + 36} fontSize={10} fill={COLORS.light} fontFamily={FONTS.sans}>
                {pattern.description}
              </text>
            </g>
          );
        })()}

        {/* Legend */}
        <g transform={`translate(${LEFT_MARGIN}, ${H - 30})`}>
          {[
            { label: '0%', color: COLORS.waste },
            { label: '< 30%', color: '#fde68a' },
            { label: '30-60%', color: '#fbbf24' },
            { label: '60-80%', color: '#34d399' },
            { label: '> 80%', color: COLORS.green },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 100}, 0)`}>
              <rect width={14} height={14} rx={2} fill={item.color} />
              <text x={18} y={11} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.sans}>{item.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 25)**

Run: `npx tsc --noEmit src/components/interactive/CacheHitHeatmap.tsx`
Expected: no errors

---

## Task 26: PrefixCachingCompare

**Files:**
- Create: `src/components/interactive/PrefixCachingCompare.tsx`

- [ ] **Step 1: Create the component**

```tsx
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

export default function PrefixCachingCompare() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: W }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1,
        background: COLORS.dark, borderRadius: '8px 8px 0 0', overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#fff' }}>维度</div>
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
        点击任一行展开详细说明。vLLM 从 v0.6 开始也实验性支持 tree-based caching。
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 26)**

Run: `npx tsc --noEmit src/components/interactive/PrefixCachingCompare.tsx`
Expected: no errors

---

## Task 27: Article 4 — prefix-caching.mdx

**Files:**
- Create: `src/content/articles/zh/prefix-caching.mdx`

- [ ] **Step 1: Create the article**

```mdx
---
title: "前缀缓存与 RadixAttention"
slug: prefix-caching
locale: zh
tags: [prefix-caching, radix-attention, sglang, vllm, kv-cache]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [paged-attention]
references:
  - type: paper
    title: "SGLang: Efficient Execution of Structured Language Model Programs"
    url: "https://arxiv.org/abs/2312.07104"
  - type: website
    title: "vLLM Automatic Prefix Caching"
    url: "https://docs.vllm.ai/en/latest/automatic_prefix_caching/apc.html"
  - type: paper
    title: "Trie Memory"
    url: "https://dl.acm.org/doi/10.1145/367390.367400"
---

import PrefixReuseMotivation from '../../../components/interactive/PrefixReuseMotivation.tsx';
import HashPrefixCaching from '../../../components/interactive/HashPrefixCaching.tsx';
import RadixTreeViz from '../../../components/interactive/RadixTreeViz.tsx';
import RadixTreeEviction from '../../../components/interactive/RadixTreeEviction.tsx';
import CacheHitHeatmap from '../../../components/interactive/CacheHitHeatmap.tsx';
import PrefixCachingCompare from '../../../components/interactive/PrefixCachingCompare.tsx';

## 前缀复用的动机

在 [PagedAttention](./paged-attention) 中，我们解决了 KV Cache 的**内存管理**问题。但还有一个被忽视的性能瓶颈：**重复计算**。

考虑多轮对话场景：每一轮都需要处理完整的 system prompt + 所有历史消息 + 新消息。随着对话轮次增加，重复的 prefill 计算量线性增长——第 10 轮对话中可能 90% 的 token 是前 9 轮已经计算过的。

<PrefixReuseMotivation client:visible />

类似的情况在 few-shot prompting（所有请求共享相同 examples）、self-consistency（同一个 prompt 并行采样多次）、tree-of-thought（共享推理前缀）中都普遍存在。

核心思想很直接：**如果两个请求的前缀相同，已经计算好的 KV Cache 不要丢掉，缓存起来给后续请求复用**。

## vLLM 的 Automatic Prefix Caching

vLLM 的方案优雅而简单——借鉴了文件系统中 **content-addressable storage** 的思路：

<HashPrefixCaching client:visible />

具体来说：
1. 将 token 序列按 block_size 分块（通常 16 tokens）
2. 对每个块计算 hash：`hash(block_i) = SHA256(layer_id, tokens[0..i*block_size], prefix_hash)`
3. 在全局 Hash Table 中查找：命中则直接复用对应的物理 KV 块，未命中则计算并插入

**关键设计**：hash 值包含了前面所有块的信息（通过 `prefix_hash` 链式传递），确保只有**完全相同的前缀**才会匹配。这避免了错误匹配，但也意味着：
- 两个序列即使只有第一个 token 不同，后续所有块的 hash 都不同
- 无法匹配非前缀位置的共享（如中间段相同但开头不同）

## RadixAttention 核心思想

SGLang 选择了不同的路径——用 **Radix Tree**（基数树）管理所有已缓存的 KV 前缀。

Radix Tree 是 Trie 的压缩版本：把只有一个子节点的路径合并为单个节点，大幅减少树的深度。在 RadixAttention 中，每个节点存储一段 token 序列对应的 KV Cache 块。

<RadixTreeViz client:visible />

树结构天然表达了序列之间的**共享关系**：
- **根节点**通常是 system prompt 的 KV Cache——几乎所有请求都会复用
- **内部节点**是对话历史的各个片段——多轮对话共享前几轮
- **叶节点**是每个请求独有的新增部分

查找过程就是从根节点出发做**最长前缀匹配** (Longest Prefix Match)：沿着树逐节点比较 token 序列，直到遇到分叉或匹配结束。匹配到的部分直接复用 KV Cache，只需计算未匹配的尾部。

## LRU 淘汰

GPU 显存有限，不可能缓存所有历史 KV。当显存不足时，RadixAttention 使用 **LRU 策略从叶节点开始淘汰**：

<RadixTreeEviction client:visible />

为什么从叶节点开始？因为叶节点通常是最**特化**的序列尾部，复用概率最低。而根节点和内部节点是共享前缀，被多个序列引用，淘汰它们会影响更多后续请求。

LRU 的实现也很自然：每个节点记录最后一次被访问的时间戳，淘汰时选择最久未被访问的叶节点。当一个叶节点被淘汰后，如果其父节点变成了新的叶节点（无其他子节点），下一轮可能淘汰父节点——这形成了一种**自底向上的渐进淘汰**。

## 多场景复用效果

不同的使用模式下，前缀缓存的效果差异很大：

<CacheHitHeatmap client:visible />

观察规律：
- **单轮独立请求**：几乎无缓存命中（每个请求的 prompt 都不同）
- **多轮对话**：命中率随轮次递增（累积的共享前缀越来越长）
- **Few-shot**：从第 2 个请求起就稳定在高命中率（所有请求共享相同 examples）
- **Tree-of-thought**：命中率波动（取决于分支点的位置和探索路径）

这说明前缀缓存不是万能的——它的收益完全取决于请求之间的前缀重叠程度。

## vLLM vs SGLang 缓存对比

两种方案各有优劣：

<PrefixCachingCompare client:visible />

实际选择取决于场景：
- **高并发 API 服务**（大量独立请求）：vLLM 的 hash-based 方案更简单高效
- **多轮对话/复杂 pipeline**（大量前缀共享）：SGLang 的 RadixAttention 能更灵活地复用
- **混合场景**：两者的性能差距在逐渐缩小，vLLM 也在实验 tree-based caching

## 总结

前缀缓存的核心是一个简单直觉：**避免重复计算已经算过的 KV Cache**。vLLM 用 hash table 实现了简洁高效的精确匹配，SGLang 用 radix tree 实现了灵活的最长前缀匹配。两者都选择 LRU 淘汰策略来管理有限显存。

从更大的视角看，前缀缓存是推理引擎从"单次请求优化"走向"跨请求优化"的关键一步——它让引擎能够利用**请求之间的计算冗余**，这在实际部署中（多轮对话、batch processing、pipeline）带来的收益远比单纯优化 PagedAttention 更大。

## 延伸阅读

- 想了解 SGLang 如何利用前缀缓存构建可编程推理？阅读 [SGLang 编程模型](./sglang-programming-model)
- 想回顾 KV Cache 的内存管理基础？阅读 [PagedAttention 与 Continuous Batching](./paged-attention)
```

- [ ] **Step 2: Verify (Task 27)**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit (Article 4)**

```bash
git add src/components/interactive/PrefixReuseMotivation.tsx \
  src/components/interactive/HashPrefixCaching.tsx \
  src/components/interactive/RadixTreeViz.tsx \
  src/components/interactive/RadixTreeEviction.tsx \
  src/components/interactive/CacheHitHeatmap.tsx \
  src/components/interactive/PrefixCachingCompare.tsx \
  src/content/articles/zh/prefix-caching.mdx
git commit -m "feat: add prefix-caching article with 6 components"
```

---

## Task 28: SGLangExecutionFlow

**Files:**
- Create: `src/components/interactive/SGLangExecutionFlow.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface CodeLine {
  code: string;
  type: 'gen' | 'select' | 'fork' | 'join' | 'append' | 'comment';
  highlight?: boolean;
}

interface FlowNode {
  id: string;
  label: string;
  type: 'gen' | 'select' | 'fork' | 'join' | 'append';
  x: number;
  y: number;
  width: number;
}

const CODE_LINES: CodeLine[] = [
  { code: '# SGLang DSL 示例: 多步推理', type: 'comment' },
  { code: 's = sgl.gen("分析", max_tokens=100)', type: 'gen' },
  { code: 's = sgl.select("判断", ["正面","负面","中性"])', type: 'select' },
  { code: 's1, s2 = sgl.fork(s, 2)', type: 'fork' },
  { code: 's1 = sgl.gen("解释1", max_tokens=50)', type: 'gen' },
  { code: 's2 = sgl.gen("解释2", max_tokens=50)', type: 'gen' },
  { code: 'result = sgl.join([s1, s2])', type: 'join' },
  { code: 'result = sgl.append("综合结论:")', type: 'append' },
  { code: 'result = sgl.gen("结论", max_tokens=80)', type: 'gen' },
];

const FLOW_NODES: FlowNode[] = [
  { id: 'gen1', label: 'gen("分析")\n→ token 流', type: 'gen', x: 320, y: 30, width: 130 },
  { id: 'sel', label: 'select("判断")\n正面/负面/中性', type: 'select', x: 320, y: 90, width: 130 },
  { id: 'fork', label: 'fork(2)', type: 'fork', x: 320, y: 150, width: 80 },
  { id: 'gen2', label: 'gen("解释1")', type: 'gen', x: 270, y: 210, width: 100 },
  { id: 'gen3', label: 'gen("解释2")', type: 'gen', x: 400, y: 210, width: 100 },
  { id: 'join', label: 'join()', type: 'join', x: 340, y: 270, width: 80 },
  { id: 'app', label: 'append("综合结论:")', type: 'append', x: 340, y: 320, width: 140 },
  { id: 'gen4', label: 'gen("结论")\n→ token 流', type: 'gen', x: 340, y: 370, width: 130 },
];

const FLOW_EDGES: [string, string][] = [
  ['gen1', 'sel'], ['sel', 'fork'],
  ['fork', 'gen2'], ['fork', 'gen3'],
  ['gen2', 'join'], ['gen3', 'join'],
  ['join', 'app'], ['app', 'gen4'],
];

const TYPE_COLORS: Record<string, string> = {
  gen: COLORS.primary,
  select: COLORS.purple,
  fork: COLORS.orange,
  join: COLORS.orange,
  append: COLORS.green,
  comment: COLORS.mid,
};

export default function SGLangExecutionFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Map code line index to flow node IDs to highlight
  const stepToNodes: Record<number, string[]> = {
    1: ['gen1'],
    2: ['sel'],
    3: ['fork'],
    4: ['gen2'],
    5: ['gen3'],
    6: ['join'],
    7: ['app'],
    8: ['gen4'],
  };

  const activeNodes = activeStep !== null ? (stepToNodes[activeStep] || []) : [];
  const nodeMap = Object.fromEntries(FLOW_NODES.map(n => [n.id, n]));

  return (
    <div style={{ display: 'flex', gap: 12, fontFamily: FONTS.sans }}>
      {/* Left: Code */}
      <div style={{
        width: 240, background: COLORS.dark, borderRadius: 8, padding: '12px 0',
        fontFamily: FONTS.mono, fontSize: 11, lineHeight: 1.8, flexShrink: 0,
      }}>
        {CODE_LINES.map((line, i) => {
          const isActive = activeStep === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                padding: '1px 12px', cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: TYPE_COLORS[line.type] || '#fff',
                opacity: line.type === 'comment' ? 0.5 : 1,
              }}
            >
              {line.code}
            </div>
          );
        })}
      </div>

      {/* Right: Flow visualization */}
      <svg width={W - 260} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* Edges */}
        {FLOW_EDGES.map(([from, to]) => {
          const f = nodeMap[from];
          const t = nodeMap[to];
          if (!f || !t) return null;
          const fx = f.x - 280;
          const tx = t.x - 280;
          return (
            <line key={`${from}-${to}`}
              x1={fx} y1={f.y + 20} x2={tx} y2={t.y - 5}
              stroke={COLORS.mid} strokeWidth={1.5} opacity={0.3}
              markerEnd="url(#arrowFlow)"
            />
          );
        })}

        {/* Nodes */}
        {FLOW_NODES.map(n => {
          const isActive = activeNodes.includes(n.id);
          const nx = n.x - 280;
          const nH = 32;
          return (
            <g key={n.id}>
              <rect
                x={nx - n.width / 2} y={n.y - nH / 2}
                width={n.width} height={nH} rx={n.type === 'fork' || n.type === 'join' ? 16 : 6}
                fill={isActive ? COLORS.highlight : COLORS.bgAlt}
                stroke={isActive ? TYPE_COLORS[n.type] : COLORS.mid}
                strokeWidth={isActive ? 2.5 : 1}
              />
              <text x={nx} y={n.y + 4} fontSize={10} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {n.label.split('\n')[0]}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="arrowFlow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Legend */}
        {[
          { label: 'gen', color: COLORS.primary },
          { label: 'select', color: COLORS.purple },
          { label: 'fork/join', color: COLORS.orange },
          { label: 'append', color: COLORS.green },
        ].map((item, i) => (
          <g key={i} transform={`translate(10, ${H - 30 + 0})`}>
            <rect x={i * 75} width={10} height={10} rx={2} fill={item.color} />
            <text x={i * 75 + 14} y={9} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.sans}>
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 28)**

Run: `npx tsc --noEmit src/components/interactive/SGLangExecutionFlow.tsx`
Expected: no errors

---

## Task 29: FSMConstrainedDecoding

**Files:**
- Create: `src/components/interactive/FSMConstrainedDecoding.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface FsmState {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface FsmTransition {
  from: string;
  to: string;
  label: string;
}

// Simplified JSON FSM: { "name": "..." }
const STATES: FsmState[] = [
  { id: 'start', label: 'START', x: 60, y: 100 },
  { id: 'open', label: '{ 已打开', x: 180, y: 100 },
  { id: 'key_q1', label: '"key', x: 300, y: 60 },
  { id: 'key_name', label: '"name"', x: 400, y: 60 },
  { id: 'colon', label: ': 分隔', x: 500, y: 100 },
  { id: 'val_q1', label: '"val', x: 500, y: 200 },
  { id: 'val_str', label: '字符串内容', x: 380, y: 250 },
  { id: 'val_q2', label: '"val 结束', x: 240, y: 250 },
  { id: 'close', label: '} 关闭', x: 120, y: 250 },
  { id: 'end', label: 'END', x: 60, y: 200 },
];

const TRANSITIONS: FsmTransition[] = [
  { from: 'start', to: 'open', label: '{' },
  { from: 'open', to: 'key_q1', label: '"' },
  { from: 'key_q1', to: 'key_name', label: 'n,a,m,e' },
  { from: 'key_name', to: 'colon', label: '":' },
  { from: 'colon', to: 'val_q1', label: '"' },
  { from: 'val_q1', to: 'val_str', label: 'a-z...' },
  { from: 'val_str', to: 'val_str', label: 'a-z...' },
  { from: 'val_str', to: 'val_q2', label: '"' },
  { from: 'val_q2', to: 'close', label: '}' },
  { from: 'close', to: 'end', label: 'EOS' },
];

const ALL_TOKENS = ['{', '"', 'name', '":', ' "', 'Alice', '"', '}', 'hello', '[', '123', 'true'];

export default function FSMConstrainedDecoding() {
  const [currentState, setCurrentState] = useState('start');
  const [generated, setGenerated] = useState<string[]>([]);

  const stateMap = Object.fromEntries(STATES.map(s => [s.id, s]));

  // Get valid transitions from current state
  const validTransitions = TRANSITIONS.filter(t => t.from === currentState);
  const validTargets = new Set(validTransitions.map(t => t.to));

  // Determine which tokens are valid
  const validTokenMap: Record<string, string> = {};
  for (const t of validTransitions) {
    // Map transition labels to actual tokens
    if (t.label === '{') validTokenMap['{'] = t.to;
    if (t.label === '"') validTokenMap['"'] = t.to;
    if (t.label === 'n,a,m,e') validTokenMap['name'] = t.to;
    if (t.label === '":') validTokenMap['":'] = t.to;
    if (t.label === '"') { validTokenMap['"'] = t.to; validTokenMap[' "'] = t.to; }
    if (t.label === 'a-z...') { validTokenMap['Alice'] = t.to; }
    if (t.label === '}') validTokenMap['}'] = t.to;
    if (t.label === 'EOS') validTokenMap['EOS'] = t.to;
  }

  const clickToken = (token: string) => {
    const target = validTokenMap[token];
    if (target) {
      setCurrentState(target);
      setGenerated(prev => [...prev, token]);
    }
  };

  const reset = () => {
    setCurrentState('start');
    setGenerated([]);
  };

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Generated output */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 12px', background: COLORS.bgAlt, borderRadius: 6,
      }}>
        <span style={{ fontSize: 12, color: COLORS.mid }}>输出:</span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.dark }}>
          {generated.length > 0 ? generated.join('') : '(点击合法 token 开始生成)'}
        </span>
        <button onClick={reset} style={{
          marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: 'none',
          background: COLORS.light, cursor: 'pointer', fontSize: 11, fontFamily: FONTS.sans,
        }}>重置</button>
      </div>

      <svg width={W} height={280} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* FSM States */}
        {STATES.map(s => {
          const isCurrent = s.id === currentState;
          const isReachable = validTargets.has(s.id);
          const r = 28;
          return (
            <g key={s.id}>
              <circle cx={s.x} cy={s.y} r={r}
                fill={isCurrent ? COLORS.highlight : isReachable ? '#ecfdf5' : COLORS.bgAlt}
                stroke={isCurrent ? COLORS.orange : isReachable ? COLORS.green : COLORS.mid}
                strokeWidth={isCurrent ? 2.5 : 1}
              />
              {s.id === 'end' && <circle cx={s.x} cy={s.y} r={r - 4} fill="none" stroke={COLORS.mid} strokeWidth={1} />}
              <text x={s.x} y={s.y + 4} fontSize={9} fill={COLORS.dark}
                fontFamily={FONTS.sans} textAnchor="middle" fontWeight={isCurrent ? 600 : 400}>
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Transitions (simplified: straight lines) */}
        {TRANSITIONS.filter(t => t.from !== t.to).map((t, i) => {
          const from = stateMap[t.from];
          const to = stateMap[t.to];
          if (!from || !to) return null;
          const isValid = t.from === currentState;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / dist) * 28;
          const offsetY = (dy / dist) * 28;
          return (
            <g key={i}>
              <line
                x1={from.x + offsetX} y1={from.y + offsetY}
                x2={to.x - offsetX} y2={to.y - offsetY}
                stroke={isValid ? COLORS.green : COLORS.mid}
                strokeWidth={isValid ? 2 : 1}
                opacity={isValid ? 1 : 0.3}
                markerEnd="url(#arrowFSM)"
              />
              <text
                x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                fontSize={9} fill={isValid ? COLORS.green : COLORS.mid}
                fontFamily={FONTS.mono} textAnchor="middle">
                {t.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="arrowFSM" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
          </marker>
        </defs>
      </svg>

      {/* Token vocabulary */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.mid, marginBottom: 6 }}>Token 词表（绿色=合法，灰色=非法）:</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ALL_TOKENS.map((token, i) => {
            const isValid = token in validTokenMap;
            return (
              <button
                key={i}
                onClick={() => clickToken(token)}
                disabled={!isValid}
                style={{
                  padding: '4px 10px', borderRadius: 4,
                  border: `1px solid ${isValid ? COLORS.green : '#e5e7eb'}`,
                  background: isValid ? '#ecfdf5' : COLORS.masked,
                  color: isValid ? COLORS.green : '#ccc',
                  cursor: isValid ? 'pointer' : 'not-allowed',
                  fontSize: 12, fontFamily: FONTS.mono, fontWeight: 500,
                }}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 29)**

Run: `npx tsc --noEmit src/components/interactive/FSMConstrainedDecoding.tsx`
Expected: no errors

---

## Task 30: JumpForwardCompare

**Files:**
- Create: `src/components/interactive/JumpForwardCompare.tsx`

- [ ] **Step 1: Create the component**

```tsx
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;

function NaiveGeneration() {
  const tokens = ['{', '"', 'n', 'a', 'm', 'e', '"', ':', ' ', '"', 'A', 'l', 'i', 'c', 'e', '"', '}'];
  const totalSteps = tokens.length;
  return (
    <svg width={W} height={160} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 1: 无约束逐 token 生成
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        每个 token 都需要采样 → 可能产出非法 JSON → {totalSteps} 次采样
      </text>

      {tokens.map((t, i) => {
        const x = 10 + i * 32;
        const isControl = ['{', '"', ':', '}', ' '].includes(t);
        return (
          <g key={i}>
            <rect x={x} y={50} width={28} height={28} rx={4}
              fill={isControl ? COLORS.waste : COLORS.valid}
              stroke={COLORS.mid} strokeWidth={0.5} />
            <text x={x + 14} y={69} fontSize={12} fill={COLORS.dark}
              fontFamily={FONTS.mono} textAnchor="middle">
              {t}
            </text>
            <text x={x + 14} y={96} fontSize={8} fill={COLORS.red}
              fontFamily={FONTS.sans} textAnchor="middle">
              sample
            </text>
          </g>
        );
      })}

      <text x={10} y={125} fontSize={12} fill={COLORS.red} fontFamily={FONTS.sans} fontWeight={600}>
        问题: 可能生成 {"name: Alice} 等非法 JSON
      </text>
      <text x={10} y={145} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        速度: {totalSteps} 次 LLM forward pass
      </text>
    </svg>
  );
}

function FSMGeneration() {
  const tokens = ['{', '"', 'n', 'a', 'm', 'e', '"', ':', ' ', '"', 'A', 'l', 'i', 'c', 'e', '"', '}'];
  const totalSteps = tokens.length;
  return (
    <svg width={W} height={160} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 2: FSM 约束逐 token 生成
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        每步用 FSM mask 非法 token → 保证正确 → 但仍需 {totalSteps} 次采样
      </text>

      {tokens.map((t, i) => {
        const x = 10 + i * 32;
        const isControl = ['{', '"', ':', '}', ' '].includes(t);
        return (
          <g key={i}>
            <rect x={x} y={50} width={28} height={28} rx={4}
              fill={isControl ? '#ecfdf5' : COLORS.valid}
              stroke={isControl ? COLORS.green : COLORS.primary} strokeWidth={1} />
            <text x={x + 14} y={69} fontSize={12} fill={COLORS.dark}
              fontFamily={FONTS.mono} textAnchor="middle">
              {t}
            </text>
            <text x={x + 14} y={96} fontSize={8}
              fill={isControl ? COLORS.green : COLORS.primary}
              fontFamily={FONTS.sans} textAnchor="middle">
              {isControl ? 'mask' : 'sample'}
            </text>
          </g>
        );
      })}

      <text x={10} y={125} fontSize={12} fill={COLORS.green} fontFamily={FONTS.sans} fontWeight={600}>
        正确性: ✓ 保证合法 JSON
      </text>
      <text x={10} y={145} fontSize={11} fill={COLORS.orange} fontFamily={FONTS.sans}>
        速度: 仍需 {totalSteps} 次 LLM forward pass（每步都走 LLM）
      </text>
    </svg>
  );
}

function JumpForwardGeneration() {
  const segments: { tokens: string; type: 'jump' | 'sample'; steps: number }[] = [
    { tokens: '{"name": "', type: 'jump', steps: 1 },
    { tokens: 'Alice', type: 'sample', steps: 5 },
    { tokens: '"}', type: 'jump', steps: 1 },
  ];
  const totalSteps = segments.reduce((s, seg) => s + seg.steps, 0);

  return (
    <svg width={W} height={180} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 3: Jump-Forward 优化
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        FSM 中确定性片段直接跳过，不走 LLM → 只需 {totalSteps} 次 forward pass
      </text>

      {(() => {
        let xOffset = 10;
        return segments.map((seg, i) => {
          const segW = seg.tokens.length * 16 + 20;
          const el = (
            <g key={i}>
              <rect x={xOffset} y={50} width={segW} height={36} rx={6}
                fill={seg.type === 'jump' ? '#ecfdf5' : COLORS.valid}
                stroke={seg.type === 'jump' ? COLORS.green : COLORS.primary}
                strokeWidth={1.5}
              />
              <text x={xOffset + segW / 2} y={73} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {seg.tokens}
              </text>
              <text x={xOffset + segW / 2} y={105} fontSize={10}
                fill={seg.type === 'jump' ? COLORS.green : COLORS.primary}
                fontFamily={FONTS.sans} textAnchor="middle" fontWeight={600}>
                {seg.type === 'jump' ? `⚡ JUMP (${seg.steps} step)` : `sample (${seg.steps} steps)`}
              </text>
              {i < segments.length - 1 && (
                <line x1={xOffset + segW + 2} y1={68} x2={xOffset + segW + 14} y2={68}
                  stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowJF)" />
              )}
            </g>
          );
          xOffset += segW + 18;
          return el;
        });
      })()}

      <text x={10} y={135} fontSize={12} fill={COLORS.green} fontFamily={FONTS.sans} fontWeight={600}>
        正确性: ✓ 保证合法 JSON | 速度: 只需 {totalSteps} 次 forward pass
      </text>
      <text x={10} y={155} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        加速比: 对于结构化输出，通常 2-5x 加速（确定性片段占比越高越快）
      </text>
      <text x={10} y={173} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        原理: FSM 遇到只有一条出边的状态 → 输出确定 → 跳过 LLM 采样
      </text>

      <defs>
        <marker id="arrowJF" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
        </marker>
      </defs>
    </svg>
  );
}

export default function JumpForwardCompare() {
  return (
    <StepNavigator
      steps={[
        { title: '无约束', content: <NaiveGeneration /> },
        { title: 'FSM 约束', content: <FSMGeneration /> },
        { title: 'Jump-Forward', content: <JumpForwardGeneration /> },
      ]}
    />
  );
}
```

- [ ] **Step 2: Verify (Task 30)**

Run: `npx tsc --noEmit src/components/interactive/JumpForwardCompare.tsx`
Expected: no errors

---

## Task 31: TokenMaskGeneration

**Files:**
- Create: `src/components/interactive/TokenMaskGeneration.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface MaskStep {
  fsmState: string;
  validChars: string;
  tokenMask: { token: string; allowed: boolean }[];
  generated: string;
  explanation: string;
}

const SCHEMA_TEXT = '{ "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] }';

const STEPS: MaskStep[] = [
  {
    fsmState: 'OBJECT_START',
    validChars: '{',
    tokenMask: [
      { token: '{', allowed: true },
      { token: '"', allowed: false },
      { token: 'hello', allowed: false },
      { token: '[', allowed: false },
      { token: '123', allowed: false },
      { token: 'true', allowed: false },
    ],
    generated: '',
    explanation: 'JSON Object 必须以 { 开头，只有 { 合法',
  },
  {
    fsmState: 'KEY_START',
    validChars: '"',
    tokenMask: [
      { token: '{"', allowed: false },
      { token: '"name"', allowed: true },
      { token: '"age"', allowed: false },
      { token: '"', allowed: false },
      { token: 'name', allowed: false },
      { token: '}', allowed: false },
    ],
    generated: '{',
    explanation: 'Schema 要求 key 为 "name"，只允许包含 "name" 的 token',
  },
  {
    fsmState: 'COLON',
    validChars: ':',
    tokenMask: [
      { token: ':', allowed: true },
      { token: '": "', allowed: true },
      { token: ',', allowed: false },
      { token: '}', allowed: false },
      { token: '"', allowed: false },
      { token: ' ', allowed: false },
    ],
    generated: '{"name"',
    explanation: 'Key 后面必须是冒号分隔符',
  },
  {
    fsmState: 'VALUE_STRING_START',
    validChars: '"...',
    tokenMask: [
      { token: '"Alice"', allowed: true },
      { token: '"Bob"', allowed: true },
      { token: '"', allowed: true },
      { token: '123', allowed: false },
      { token: 'null', allowed: false },
      { token: 'true', allowed: false },
    ],
    generated: '{"name": ',
    explanation: 'Schema 指定 type: "string"，值必须是字符串（" 开头）',
  },
  {
    fsmState: 'OBJECT_END',
    validChars: '}',
    tokenMask: [
      { token: '}', allowed: true },
      { token: ', "', allowed: false },
      { token: '"', allowed: false },
      { token: ']', allowed: false },
      { token: 'EOS', allowed: false },
      { token: ' ', allowed: false },
    ],
    generated: '{"name": "Alice"',
    explanation: '没有其他 required 字段，Object 必须关闭',
  },
];

export default function TokenMaskGeneration() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: W }}>
      {/* Schema */}
      <div style={{
        padding: '8px 12px', background: COLORS.dark, borderRadius: '8px 8px 0 0',
        fontFamily: FONTS.mono, fontSize: 10, color: COLORS.light, overflowX: 'auto',
      }}>
        <span style={{ color: COLORS.mid }}>JSON Schema: </span>{SCHEMA_TEXT}
      </div>

      {/* Progress bar */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 12px',
        background: COLORS.bgAlt, borderBottom: '1px solid #e5e7eb',
      }}>
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)} style={{
            flex: 1, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
            background: i <= stepIdx ? COLORS.primary : COLORS.light,
          }} />
        ))}
      </div>

      {/* Current state */}
      <div style={{ padding: '12px 16px', background: COLORS.bg, border: '1px solid #e5e7eb', borderTop: 'none' }}>
        {/* Generated so far */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: COLORS.mid }}>已生成: </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.dark, fontWeight: 600 }}>
            {step.generated || '(空)'}
            <span style={{ color: COLORS.orange }}>▌</span>
          </span>
        </div>

        {/* FSM state & valid chars */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: COLORS.mid, marginBottom: 2 }}>FSM 状态</div>
            <div style={{
              padding: '4px 10px', background: COLORS.highlight, borderRadius: 4,
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, color: COLORS.dark,
            }}>
              {step.fsmState}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: COLORS.mid, marginBottom: 2 }}>合法字符集</div>
            <div style={{
              padding: '4px 10px', background: '#ecfdf5', borderRadius: 4,
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, color: COLORS.green,
            }}>
              {step.validChars}
            </div>
          </div>
        </div>

        {/* Token mask */}
        <div style={{ fontSize: 11, color: COLORS.mid, marginBottom: 6 }}>Token Mask:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {step.tokenMask.map((t, i) => (
            <div key={i} style={{
              padding: '5px 10px', borderRadius: 4,
              border: `1.5px solid ${t.allowed ? COLORS.green : '#e5e7eb'}`,
              background: t.allowed ? '#ecfdf5' : COLORS.masked,
              color: t.allowed ? COLORS.green : '#bbb',
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 500,
              textDecoration: t.allowed ? 'none' : 'line-through',
            }}>
              {t.token}
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div style={{
          padding: '8px 12px', background: COLORS.bgAlt, borderRadius: 6,
          fontSize: 12, color: COLORS.dark, lineHeight: 1.5,
        }}>
          💡 {step.explanation}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: COLORS.bgAlt,
        borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb', borderTop: 'none',
      }}>
        <button
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          style={{
            padding: '4px 12px', borderRadius: 4, border: 'none', cursor: stepIdx > 0 ? 'pointer' : 'not-allowed',
            background: stepIdx > 0 ? COLORS.primary : COLORS.light,
            color: stepIdx > 0 ? '#fff' : COLORS.mid, fontSize: 12, fontFamily: FONTS.sans,
          }}
        >
          ← 上一步
        </button>
        <span style={{ fontSize: 11, color: COLORS.mid }}>
          {stepIdx + 1} / {STEPS.length}
        </span>
        <button
          onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))}
          disabled={stepIdx === STEPS.length - 1}
          style={{
            padding: '4px 12px', borderRadius: 4, border: 'none',
            cursor: stepIdx < STEPS.length - 1 ? 'pointer' : 'not-allowed',
            background: stepIdx < STEPS.length - 1 ? COLORS.primary : COLORS.light,
            color: stepIdx < STEPS.length - 1 ? '#fff' : COLORS.mid,
            fontSize: 12, fontFamily: FONTS.sans,
          }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 31)**

Run: `npx tsc --noEmit src/components/interactive/TokenMaskGeneration.tsx`
Expected: no errors

---

## Task 32: StructuredOutputAccuracy

**Files:**
- Create: `src/components/interactive/StructuredOutputAccuracy.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface MethodData {
  name: string;
  color: string;
  accuracy: number; // 0-100
  speed: number;    // tokens/s
  description: string;
}

const METHODS: MethodData[] = [
  {
    name: '无约束',
    color: COLORS.red,
    accuracy: 45,
    speed: 120,
    description: '直接让 LLM 生成 JSON，通过 prompt 指示格式。经常缺少引号、多余逗号、字段遗漏。',
  },
  {
    name: 'Regex-guided',
    color: COLORS.orange,
    accuracy: 82,
    speed: 95,
    description: '用正则表达式约束每一步的合法 token。可以保证基本格式，但复杂嵌套结构难以用正则表达。',
  },
  {
    name: 'FSM-guided',
    color: COLORS.primary,
    accuracy: 99,
    speed: 85,
    description: 'JSON Schema → 正则 → FSM，每步精确 mask 非法 token。保证 100% 格式合规（误差来自极端 edge case）。',
  },
  {
    name: 'FSM + Jump-Forward',
    color: COLORS.green,
    accuracy: 99,
    speed: 160,
    description: 'FSM 约束 + 确定性片段跳过。同等正确率下速度最快，确定性部分不走 LLM，节省 40-70% forward pass。',
  },
];

const BAR_LEFT = 160;
const BAR_MAX_W = 350;
const BAR_H = 26;

export default function StructuredOutputAccuracy() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [metric, setMetric] = useState<'accuracy' | 'speed'>('accuracy');

  const maxVal = metric === 'accuracy' ? 100 : Math.max(...METHODS.map(m => m.speed));

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['accuracy', 'speed'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)} style={{
            padding: '4px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: metric === m ? COLORS.primary : COLORS.light,
            color: metric === m ? '#fff' : COLORS.dark,
            fontSize: 13, fontFamily: FONTS.sans,
          }}>
            {m === 'accuracy' ? '输出合规率 (%)' : '生成速度 (tokens/s)'}
          </button>
        ))}
      </div>

      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        <text x={W / 2} y={25} fontSize={13} fontWeight={600} fill={COLORS.dark}
          fontFamily={FONTS.sans} textAnchor="middle">
          {metric === 'accuracy' ? '结构化输出合规率对比' : '生成速度对比'}
        </text>

        {METHODS.map((m, i) => {
          const y = 50 + i * (BAR_H + 30);
          const val = metric === 'accuracy' ? m.accuracy : m.speed;
          const barW = (val / maxVal) * BAR_MAX_W;
          const isHovered = hovered === i;

          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Label */}
              <text x={BAR_LEFT - 8} y={y + BAR_H / 2 + 4} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.sans} textAnchor="end" fontWeight={isHovered ? 600 : 400}>
                {m.name}
              </text>

              {/* Bar */}
              <rect x={BAR_LEFT} y={y} width={barW} height={BAR_H} rx={4}
                fill={m.color} opacity={isHovered ? 1 : 0.75}
              />

              {/* Value */}
              <text x={BAR_LEFT + barW + 8} y={y + BAR_H / 2 + 4} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.mono} fontWeight={600}>
                {val}{metric === 'accuracy' ? '%' : ' t/s'}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const m = METHODS[hovered];
          const tipW = W - 40;
          const tipH = 48;
          const tipY = 50 + METHODS.length * (BAR_H + 30) + 10;
          return (
            <g>
              <rect x={20} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={30} y={tipY + 18} fontSize={12} fill="#fff" fontFamily={FONTS.sans} fontWeight={600}>
                {m.name}
              </text>
              <text x={30} y={tipY + 36} fontSize={11} fill={COLORS.light} fontFamily={FONTS.sans}>
                {m.description}
              </text>
            </g>
          );
        })()}

        {/* Axis label */}
        <text x={BAR_LEFT + BAR_MAX_W / 2} y={H - 15} fontSize={11} fill={COLORS.mid}
          fontFamily={FONTS.sans} textAnchor="middle">
          {metric === 'accuracy' ? '合规率 (%)' : '生成速度 (tokens/s)'}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify (Task 32)**

Run: `npx tsc --noEmit src/components/interactive/StructuredOutputAccuracy.tsx`
Expected: no errors

---

## Task 33: Article 5 — sglang-programming-model.mdx

**Files:**
- Create: `src/content/articles/zh/sglang-programming-model.mdx`

- [ ] **Step 1: Create the article**

```mdx
---
title: "SGLang 编程模型与结构化输出"
slug: sglang-programming-model
locale: zh
tags: [sglang, structured-output, constrained-decoding, fsm, dsl]
difficulty: advanced
created: "2026-04-05"
updated: "2026-04-05"
prerequisites: [prefix-caching]
references:
  - type: paper
    title: "SGLang: Efficient Execution of Structured Language Model Programs"
    url: "https://arxiv.org/abs/2312.07104"
  - type: paper
    title: "Efficient Guided Generation for Large Language Models"
    url: "https://arxiv.org/abs/2307.09702"
  - type: website
    title: "Fast JSON Decoding for Local LLMs with Compressed Finite State Machine"
    url: "https://lmsys.org/blog/2024-02-05-compressed-fsm/"
---

import SGLangExecutionFlow from '../../../components/interactive/SGLangExecutionFlow.tsx';
import FSMConstrainedDecoding from '../../../components/interactive/FSMConstrainedDecoding.tsx';
import JumpForwardCompare from '../../../components/interactive/JumpForwardCompare.tsx';
import TokenMaskGeneration from '../../../components/interactive/TokenMaskGeneration.tsx';
import StructuredOutputAccuracy from '../../../components/interactive/StructuredOutputAccuracy.tsx';

## 为什么需要编程模型

现实中的 LLM 应用很少是"输入 prompt → 输出文本"这么简单。一个典型的 RAG pipeline 可能是：

1. 用户提问 → LLM 生成搜索 query
2. 检索文档 → 拼接到上下文
3. LLM 基于上下文生成答案
4. 对答案做自我检查（self-consistency：同一问题采样 3 次取多数）

传统做法是多次调用 API，每次手动拼接上下文。问题：
- **重复计算**：每次调用都要重新处理整个 prompt（包括已经算过的前缀）
- **串行等待**：即使步骤 4 的三次采样可以并行，也只能逐次调用
- **格式不可靠**：要求 LLM 输出 JSON，但它经常格式错误

SGLang 的核心洞察：**如果推理引擎能理解应用的执行逻辑，就能端到端优化整个 pipeline**。

## SGLang DSL 核心原语

SGLang 定义了一组简洁的原语来描述 LLM 程序：

| 原语 | 作用 | 示例 |
|------|------|------|
| `gen` | 生成文本 | `s = sgl.gen("分析", max_tokens=100)` |
| `select` | 从选项中选择 | `s = sgl.select("判断", ["正面","负面"])` |
| `fork` | 并行分支 | `s1, s2 = sgl.fork(s, 2)` |
| `join` | 汇合分支 | `result = sgl.join([s1, s2])` |
| `append` | 拼接上下文 | `s = sgl.append("额外信息...")` |

这些原语看起来简单，但组合起来能表达复杂的推理流程：

<SGLangExecutionFlow client:visible />

关键在于：这不只是语法糖。SGLang 的执行引擎会分析 DSL 程序的结构，自动进行优化：
- **fork** 的两个分支共享前缀 → RadixAttention 自动复用 KV Cache
- **select** 的所有候选项共享前缀 → batch 化处理
- **append** 不触发重新计算 → 直接在已有 KV Cache 上追加

## 约束解码的问题

让 LLM 输出结构化数据（如 JSON）是最常见的需求之一。但自由生成的问题很多：

```json
// 期望的输出
{"name": "Alice", "age": 30}

// 实际 LLM 可能生成的
{"name": Alice, "age": "thirty"}   // 缺引号，类型错误
{"name": "Alice" "age": 30}         // 缺逗号
{"name": "Alice"}                    // 缺少 required 字段
```

Prompt engineering 只能缓解但无法根除这个问题——LLM 的 token 采样过程本质上是概率性的，没有结构约束。

## FSM-Guided Generation

SGLang 的解决方案是在 token 采样阶段引入**有限状态机 (FSM)** 约束：

1. **JSON Schema → 正则表达式**：将用户定义的输出格式转化为正则表达式
2. **正则 → FSM**：编译为有限状态机，每个状态对应解析器的一个位置
3. **FSM 指导采样**：每步根据当前 FSM 状态，计算合法 token 集合，将非法 token 的 logit 设为 -∞

<FSMConstrainedDecoding client:visible />

结果：**100% 格式合规**。无论 LLM 的"创造力"如何发挥，FSM mask 保证了每个输出 token 都符合目标 schema。

## Token Mask 生成过程

具体来看 FSM 如何在每一步决定合法 token：

<TokenMaskGeneration client:visible />

整个过程是**预编译**的：FSM 在首次加载 schema 时就构建好，运行时只需 O(1) 查表获取当前状态的合法 token 集合，几乎不增加推理延迟。

## Jump-Forward 优化

FSM 约束虽然保证了正确性，但每个 token 仍需走完整的 LLM forward pass——即使某些位置的输出是确定的（如 JSON 的 `{`, `"`, `:` 等结构字符）。

SGLang 的 **Jump-Forward** 优化识别 FSM 中的**确定性状态**（只有一条出边的状态），直接跳过这些位置，不走 LLM：

<JumpForwardCompare client:visible />

对于结构化输出，确定性片段占比通常 40-70%（JSON 的大量结构字符都是确定的），这意味着 Jump-Forward 可以跳过大量 forward pass，实现 **2-5x 加速**。

## 性能对比

综合正确率和速度：

<StructuredOutputAccuracy client:visible />

核心取舍：
- **无约束**最快但不可靠——适合对格式要求宽松的场景
- **FSM-guided**几乎完美但略慢——token mask 计算和 vocabulary 扫描有开销
- **FSM + Jump-Forward**兼顾正确率和速度——是 SGLang 的默认推荐方案

## 总结

SGLang 的编程模型解决了两个核心问题：

1. **执行效率**：通过 DSL 原语（gen/select/fork/join）让引擎理解应用逻辑，配合 RadixAttention 最大化前缀复用
2. **输出可靠性**：通过 FSM-guided generation + Jump-Forward 优化，实现 100% 格式合规且速度更快

从更大的视角看，SGLang 代表了 LLM 推理引擎从"通用 API 服务"向"可编程推理平台"的演进——它不只是更快地生成文本，而是让推理引擎理解并优化整个 LLM 应用的执行流程。

## 延伸阅读

- 想回顾前缀缓存的基础？阅读 [前缀缓存与 RadixAttention](./prefix-caching)
- 想了解推理引擎的全景？阅读 [推理引擎全景](./inference-engine-landscape)
```

- [ ] **Step 2: Verify (Task 33)**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Commit (Article 5)**

```bash
git add src/components/interactive/SGLangExecutionFlow.tsx \
  src/components/interactive/FSMConstrainedDecoding.tsx \
  src/components/interactive/JumpForwardCompare.tsx \
  src/components/interactive/TokenMaskGeneration.tsx \
  src/components/interactive/StructuredOutputAccuracy.tsx \
  src/content/articles/zh/sglang-programming-model.mdx
git commit -m "feat: add sglang-programming-model article with 5 components"
```

---

## Task 34: inference-serving.yaml 路径定义 + 最终提交

**Files:**
- Create: `src/content/paths/inference-serving.yaml`

- [ ] **Step 1: Create the path YAML**

```yaml
id: inference-serving
title: "vLLM + SGLang 推理引擎深度解析"
titleEn: "vLLM + SGLang Inference Engine Deep Dive"
description: "从 PagedAttention 到 RadixAttention，从调度抢占到结构化输出，系统理解现代 LLM 推理引擎的核心算法与设计哲学。"
level: advanced
articles:
  - inference-engine-landscape
  - paged-attention
  - inference-scheduling
  - prefix-caching
  - sglang-programming-model
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: PASS

- [ ] **Step 3: Final commit**

```bash
git add src/content/paths/inference-serving.yaml
git commit -m "feat: add inference-serving learning path (5 articles, 28 components)"
```

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: All pages build successfully including the 5 new articles
