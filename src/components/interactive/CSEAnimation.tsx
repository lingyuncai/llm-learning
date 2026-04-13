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
  hash?: string;
  x?: number;
  y?: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const CSE_GRAPH: GraphNode[] = [
  { id: 'a', op: 'input', inputs: [], label: 'a' },
  { id: 'b', op: 'input', inputs: [], label: 'b' },
  { id: 'c1', op: 'add', inputs: ['a', 'b'], label: 'a + b', hash: 'add(a,b)' },
  { id: 'c2', op: 'add', inputs: ['a', 'b'], label: 'a + b', hash: 'add(a,b)' },
  { id: 'relu1', op: 'relu', inputs: ['c1'], label: 'relu', hash: 'relu(c1)' },
  { id: 'relu2', op: 'relu', inputs: ['c2'], label: 'relu', hash: 'relu(c2)' },
  { id: 'out', op: 'mul', inputs: ['relu1', 'relu2'], label: 'output' },
];

const POSITIONS: Record<string, { x: number; y: number }> = {
  a: { x: 200, y: 50 },
  b: { x: 350, y: 50 },
  c1: { x: 220, y: 130 },
  c2: { x: 480, y: 130 },
  relu1: { x: 220, y: 210 },
  relu2: { x: 480, y: 210 },
  out: { x: 350, y: 290 },
};

CSE_GRAPH.forEach(n => {
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

export default function CSEAnimation({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '公共子表达式消除（Common Subexpression Elimination）',
      step0: '1. 初始图',
      step0Desc: '存在重复计算：c1 和 c2 都是 a + b',
      step1: '2. 计算操作的哈希值',
      step1Desc: '基于操作类型和输入标识每个节点',
      step2: '3. 查找重复哈希',
      step2Desc: 'c1 和 c2 的哈希相同，可以合并',
      step3: '4. 合并 c2 → c1',
      step3Desc: '将 c2 的所有使用者指向 c1',
      step4: '5. relu2 的输入更新为 c1',
      step4Desc: 'relu2 现在依赖 c1 而非 c2',
      step5: '6. 发现 relu1 和 relu2 相同',
      step5Desc: '它们现在有相同的输入，哈希匹配',
      step6: '7. 优化后的图',
      step6Desc: '消除了所有冗余计算',
      hash: '哈希',
      merged: '已合并',
    },
    en: {
      title: 'Common Subexpression Elimination (CSE)',
      step0: '1. Initial Graph',
      step0Desc: 'Redundant computation: c1 and c2 both compute a + b',
      step1: '2. Compute Operation Hashes',
      step1Desc: 'Identify each node by operation type and inputs',
      step2: '3. Find Duplicate Hashes',
      step2Desc: 'c1 and c2 have identical hashes, can be merged',
      step3: '4. Merge c2 → c1',
      step3Desc: 'Redirect all users of c2 to c1',
      step4: '5. Update relu2 Input to c1',
      step4Desc: 'relu2 now depends on c1 instead of c2',
      step5: '6. Detect relu1 and relu2 Identical',
      step5Desc: 'They now have the same inputs, hashes match',
      step6: '7. Optimized Graph',
      step6Desc: 'All redundant computation eliminated',
      hash: 'Hash',
      merged: 'Merged',
    },
  }[locale]!;

  const steps = useMemo(() => {
    // Step 0: Initial
    const step0 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step0Desc}</p>
        <GraphView graph={CSE_GRAPH} showHashes={false} highlightNodes={[]} mergedNodes={[]} locale={locale} />
      </div>
    );

    // Step 1: Compute hashes
    const step1 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step1Desc}</p>
        <GraphView graph={CSE_GRAPH} showHashes={true} highlightNodes={[]} mergedNodes={[]} locale={locale} />
      </div>
    );

    // Step 2: Find duplicates
    const step2 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step2Desc}</p>
        <GraphView graph={CSE_GRAPH} showHashes={true} highlightNodes={['c1', 'c2']} mergedNodes={[]} locale={locale} />
      </div>
    );

    // Step 3: Merge c2 → c1
    const step3 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step3Desc}</p>
        <GraphView graph={CSE_GRAPH} showHashes={true} highlightNodes={['c1']} mergedNodes={['c2']} locale={locale} />
      </div>
    );

    // Step 4: relu2 updated
    const modifiedGraph4 = CSE_GRAPH.map(n =>
      n.id === 'relu2' ? { ...n, inputs: ['c1'], hash: 'relu(c1)' } : n
    );
    const step4 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step4Desc}</p>
        <GraphView graph={modifiedGraph4} showHashes={true} highlightNodes={['relu2']} mergedNodes={['c2']} locale={locale} />
      </div>
    );

    // Step 5: relu1 and relu2 identical
    const step5 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step5Desc}</p>
        <GraphView graph={modifiedGraph4} showHashes={true} highlightNodes={['relu1', 'relu2']} mergedNodes={['c2']} locale={locale} />
      </div>
    );

    // Step 6: Final optimized
    const finalGraph = [
      { id: 'a', op: 'input', inputs: [], label: 'a', x: 250, y: 50 },
      { id: 'b', op: 'input', inputs: [], label: 'b', x: 400, y: 50 },
      { id: 'c1', op: 'add', inputs: ['a', 'b'], label: 'a + b', x: 325, y: 130 },
      { id: 'relu1', op: 'relu', inputs: ['c1'], label: 'relu', x: 325, y: 210 },
      { id: 'out', op: 'mul', inputs: ['relu1', 'relu1'], label: 'output', x: 325, y: 290 },
    ];
    const step6 = (
      <div>
        <p className="text-sm text-gray-700 mb-2">{t.step6Desc}</p>
        <GraphView graph={finalGraph} showHashes={false} highlightNodes={[]} mergedNodes={[]} locale={locale} />
      </div>
    );

    return [
      { title: t.step0, content: step0 },
      { title: t.step1, content: step1 },
      { title: t.step2, content: step2 },
      { title: t.step3, content: step3 },
      { title: t.step4, content: step4 },
      { title: t.step5, content: step5 },
      { title: t.step6, content: step6 },
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
  showHashes: boolean;
  highlightNodes: string[];
  mergedNodes: string[];
  locale: 'zh' | 'en';
}

function GraphView({ graph, showHashes, highlightNodes, mergedNodes, locale }: GraphViewProps) {
  const t = {
    zh: { hash: '哈希', merged: '已合并' },
    en: { hash: 'Hash', merged: 'Merged' },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <style>{`text { font-family: ${FONTS.sans}; }`}</style>

      <defs>
        <marker id="cse-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
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
              markerEnd="url(#cse-arrow)"
              initial={{ opacity: 1 }}
              animate={{ opacity: mergedNodes.includes(node.id) ? 0.3 : 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        });
      })}

      {/* Nodes */}
      {graph.map(node => {
        if (!node.x || !node.y) return null;
        const isHighlight = highlightNodes.includes(node.id);
        const isMerged = mergedNodes.includes(node.id);
        const fillColor = isMerged ? COLORS.masked : isHighlight ? COLORS.highlight : COLORS.bg;
        const strokeColor = isMerged ? COLORS.mid : isHighlight ? COLORS.orange : COLORS.primary;

        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: isMerged ? 0.4 : 1,
              scale: isMerged ? 0.9 : 1,
              x: node.x,
              y: node.y,
            }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x={-45}
              y={-15}
              width={90}
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
              fill={isMerged ? COLORS.mid : COLORS.dark}
              style={{ fontFamily: FONTS.mono }}
            >
              {node.label}
            </text>

            {/* Hash badge */}
            {showHashes && node.hash && (
              <g>
                <rect
                  x={-42}
                  y={-35}
                  width={84}
                  height={16}
                  rx={8}
                  fill={COLORS.bgAlt}
                  stroke={isHighlight ? COLORS.orange : COLORS.mid}
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={-27}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill={COLORS.mid}
                  style={{ fontFamily: FONTS.mono }}
                >
                  {node.hash}
                </text>
              </g>
            )}

            {/* Merged label */}
            {isMerged && (
              <g>
                <rect
                  x={-30}
                  y={20}
                  width={60}
                  height={14}
                  rx={7}
                  fill={COLORS.red}
                  fillOpacity={0.15}
                />
                <text
                  x={0}
                  y={27}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={COLORS.red}
                >
                  {t.merged}
                </text>
              </g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
