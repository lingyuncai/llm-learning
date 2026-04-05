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

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
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
