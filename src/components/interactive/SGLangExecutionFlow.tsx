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
      <svg viewBox={`0 0 ${W - 260} ${H}`} className="w-full" style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
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
