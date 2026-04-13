import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  op: string;
  inputs: string[];
  label: string;
  x?: number;
  y?: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const DCE_GRAPH: GraphNode[] = [
  { id: 'a', op: 'input', inputs: [], label: 'a' },
  { id: 'b', op: 'input', inputs: [], label: 'b' },
  { id: 'c', op: 'add', inputs: ['a', 'b'], label: 'a + b' },
  { id: 'd', op: 'mul', inputs: ['c', 'const2'], label: 'c × 2' },
  { id: 'const2', op: 'const', inputs: [], label: '2' },
  { id: 'e', op: 'sub', inputs: ['a', 'b'], label: 'a − b' },
  { id: 'f', op: 'mul', inputs: ['e', 'const3'], label: 'e × 3' },
  { id: 'const3', op: 'const', inputs: [], label: '3' },
  { id: 'out', op: 'output', inputs: ['d'], label: 'output' },
];

// Assign positions
const POSITIONS: Record<string, { x: number; y: number }> = {
  a: { x: 150, y: 50 },
  b: { x: 250, y: 50 },
  c: { x: 200, y: 120 },
  const2: { x: 320, y: 120 },
  d: { x: 260, y: 190 },
  e: { x: 500, y: 120 },
  const3: { x: 620, y: 120 },
  f: { x: 560, y: 190 },
  out: { x: 260, y: 260 },
};

DCE_GRAPH.forEach(n => {
  const pos = POSITIONS[n.id];
  if (pos) {
    n.x = pos.x;
    n.y = pos.y;
  }
});

/* ─── SVG Constants ─── */

const W = 800;
const H = 450;

/* ─── Component ─── */

export default function DCEAnimation({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '死代码消除（Dead Code Elimination）',
      step0: '1. 初始计算图',
      step0Desc: '图中存在未被使用的节点（e, f, const3）',
      step1: '2. 标记输出节点',
      step1Desc: '从 output 节点开始',
      step2: '3. 后向遍历标记活跃节点',
      step2Desc: '沿着依赖关系向上追踪',
      step3: '4. 识别死节点',
      step3Desc: '未被标记的节点为死节点（红色）',
      step4: '5. 移除死节点',
      step4Desc: '安全删除所有死节点',
      step5: '6. 优化后的图',
      step5Desc: '仅保留对输出有贡献的节点',
      live: '活跃',
      dead: '死代码',
    },
    en: {
      title: 'Dead Code Elimination (DCE)',
      step0: '1. Initial Graph',
      step0Desc: 'Unused nodes exist (e, f, const3)',
      step1: '2. Mark Output Node',
      step1Desc: 'Start from output node',
      step2: '3. Backward Traversal',
      step2Desc: 'Trace dependencies upward',
      step3: '4. Identify Dead Nodes',
      step3Desc: 'Unmarked nodes are dead (red)',
      step4: '5. Remove Dead Nodes',
      step4Desc: 'Safely delete all dead nodes',
      step5: '6. Optimized Graph',
      step5Desc: 'Only nodes contributing to output remain',
      live: 'Live',
      dead: 'Dead Code',
    },
  }[locale]!;

  const steps = useMemo(() => {
    // Step 0: Initial graph
    const step0 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step0Desc}</p>
        <GraphView graph={DCE_GRAPH} highlightNodes={[]} deadNodes={[]} locale={locale} />
      </div>
    );

    // Step 1: Mark output
    const step1 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step1Desc}</p>
        <GraphView graph={DCE_GRAPH} highlightNodes={['out']} deadNodes={[]} locale={locale} />
      </div>
    );

    // Step 2: Backward traversal
    const step2 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step2Desc}</p>
        <GraphView graph={DCE_GRAPH} highlightNodes={['out', 'd', 'c', 'const2', 'a', 'b']} deadNodes={[]} locale={locale} />
      </div>
    );

    // Step 3: Identify dead
    const step3 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step3Desc}</p>
        <GraphView graph={DCE_GRAPH} highlightNodes={['out', 'd', 'c', 'const2', 'a', 'b']} deadNodes={['e', 'f', 'const3']} locale={locale} />
      </div>
    );

    // Step 4: Remove dead
    const step4 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step4Desc}</p>
        <GraphView graph={DCE_GRAPH} highlightNodes={['out', 'd', 'c', 'const2', 'a', 'b']} deadNodes={['e', 'f', 'const3']} fadeOut locale={locale} />
      </div>
    );

    // Step 5: Clean result
    const step5 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step5Desc}</p>
        <GraphView graph={DCE_GRAPH.filter(n => !['e', 'f', 'const3'].includes(n.id))} highlightNodes={[]} deadNodes={[]} locale={locale} />
      </div>
    );

    return [
      { title: t.step0, content: step0 },
      { title: t.step1, content: step1 },
      { title: t.step2, content: step2 },
      { title: t.step3, content: step3 },
      { title: t.step4, content: step4 },
      { title: t.step5, content: step5 },
    ];
  }, [locale, t]);

  return (
    <div className="my-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
      </div>
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}

/* ─── Graph View ─── */

interface GraphViewProps {
  graph: GraphNode[];
  highlightNodes: string[];
  deadNodes: string[];
  fadeOut?: boolean;
  locale: 'zh' | 'en';
}

function GraphView({ graph, highlightNodes, deadNodes, fadeOut = false, locale }: GraphViewProps) {
  const t = {
    zh: { live: '活跃', dead: '死代码' },
    en: { live: 'Live', dead: 'Dead Code' },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <style>{`text { font-family: ${FONTS.sans}; }`}</style>

      <defs>
        <marker id="dce-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <path d="M0,1 L8,4 L0,7" fill={COLORS.light} />
        </marker>
      </defs>

      {/* Edges */}
      {graph.map(node => {
        return node.inputs.map(inputId => {
          const source = graph.find(n => n.id === inputId);
          if (!source || !node.x || !node.y || !source.x || !source.y) return null;
          return (
            <motion.line
              key={`${inputId}-${node.id}`}
              x1={source.x}
              y1={source.y + 15}
              x2={node.x}
              y2={node.y - 15}
              stroke={COLORS.light}
              strokeWidth={1.5}
              markerEnd="url(#dce-arrow)"
              initial={{ opacity: 1 }}
              animate={{ opacity: fadeOut && deadNodes.includes(node.id) ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            />
          );
        });
      })}

      {/* Nodes */}
      {graph.map(node => {
        if (!node.x || !node.y) return null;
        const isHighlight = highlightNodes.includes(node.id);
        const isDead = deadNodes.includes(node.id);
        const fillColor = isDead ? COLORS.waste : isHighlight ? COLORS.valid : COLORS.bg;
        const strokeColor = isDead ? COLORS.red : isHighlight ? COLORS.green : COLORS.primary;

        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: fadeOut && isDead ? 0 : 1,
              scale: fadeOut && isDead ? 0.5 : 1,
              x: node.x,
              y: node.y,
            }}
            transition={{ duration: 0.5 }}
          >
            <rect
              x={-35}
              y={-15}
              width={70}
              height={30}
              rx={4}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={2}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill={isDead ? COLORS.red : COLORS.dark}
              style={{ fontFamily: FONTS.mono }}
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}

      {/* Legend */}
      <g transform="translate(20, 350)">
        <rect x={0} y={0} width={80} height={24} rx={4} fill={COLORS.valid} stroke={COLORS.green} strokeWidth={1.5} />
        <text x={40} y={12} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill={COLORS.green}>
          {t.live}
        </text>

        <rect x={100} y={0} width={80} height={24} rx={4} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
        <text x={140} y={12} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill={COLORS.red}>
          {t.dead}
        </text>
      </g>
    </svg>
  );
}
