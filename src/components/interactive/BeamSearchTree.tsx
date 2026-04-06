// src/components/interactive/BeamSearchTree.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

interface TreeNode {
  id: string;
  token: string;
  score: number;
  x: number;
  y: number;
  parentId?: string;
  pruned?: boolean;
}

const B = 2; // beam width
const SVG_W = 480;
const SVG_H = 220;
const COL_W = 110;
const START_X = 30;

// Pre-computed beam search tree
// Step 0: [START]
// Step 1: expand → "I" (−0.5), "The" (−0.3) → keep both
// Step 2: "The" → "cat"(−0.7), "dog"(−0.9); "I" → "like"(−0.8), "am"(−1.1) → keep "The cat"(−1.0), "I like"(−1.3)
// Step 3: "The cat" → "sat"(−1.3), "is"(−1.5); "I like" → "cats"(−1.6), "dogs"(−1.8) → keep "The cat sat"(−1.3), "The cat is"(−1.5)

function buildTree(step: number): { nodes: TreeNode[]; edges: { from: string; to: string; pruned: boolean }[] } {
  const nodes: TreeNode[] = [];
  const edges: { from: string; to: string; pruned: boolean }[] = [];

  // Root
  const rootY = SVG_H / 2;
  nodes.push({ id: 'root', token: '[START]', score: 0, x: START_X, y: rootY });

  if (step >= 1) {
    // Step 1: expand root → 4 candidates, keep top-2
    const step1 = [
      { id: 's1-0', token: 'The', score: -0.3, kept: true },
      { id: 's1-1', token: 'I', score: -0.5, kept: true },
      { id: 's1-2', token: 'A', score: -1.2, kept: false },
      { id: 's1-3', token: 'We', score: -1.5, kept: false },
    ];
    const keptCount = step1.filter(s => s.kept).length;
    const totalNodes = step1.length;
    step1.forEach((n, i) => {
      const y = 30 + (i / (totalNodes - 1)) * (SVG_H - 60);
      nodes.push({ ...n, x: START_X + COL_W, y, parentId: 'root', pruned: !n.kept });
      edges.push({ from: 'root', to: n.id, pruned: !n.kept });
    });

    if (step >= 2) {
      // Step 2: expand each kept beam
      const step2 = [
        { id: 's2-0', token: 'cat', score: -1.0, parentId: 's1-0', kept: true },
        { id: 's2-1', token: 'dog', score: -1.2, parentId: 's1-0', kept: false },
        { id: 's2-2', token: 'like', score: -1.3, parentId: 's1-1', kept: true },
        { id: 's2-3', token: 'am', score: -1.6, parentId: 's1-1', kept: false },
      ];
      step2.forEach((n, i) => {
        const y = 20 + (i / (step2.length - 1)) * (SVG_H - 40);
        nodes.push({ ...n, x: START_X + COL_W * 2, y, pruned: !n.kept });
        edges.push({ from: n.parentId!, to: n.id, pruned: !n.kept });
      });

      if (step >= 3) {
        // Step 3: final expansion
        const step3 = [
          { id: 's3-0', token: 'sat', score: -1.3, parentId: 's2-0', kept: true },
          { id: 's3-1', token: 'is', score: -1.5, parentId: 's2-0', kept: false },
          { id: 's3-2', token: 'cats', score: -1.6, parentId: 's2-2', kept: false },
          { id: 's3-3', token: 'dogs', score: -1.8, parentId: 's2-2', kept: false },
        ];
        step3.forEach((n, i) => {
          const y = 20 + (i / (step3.length - 1)) * (SVG_H - 40);
          nodes.push({ ...n, x: START_X + COL_W * 3, y, pruned: !n.kept });
          edges.push({ from: n.parentId!, to: n.id, pruned: !n.kept });
        });
      }
    }
  }

  return { nodes, edges };
}

function TreeSVG({ step }: { step: number }) {
  const { nodes, edges } = useMemo(() => buildTree(step), [step]);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
      {/* Edges */}
      {edges.map(e => {
        const from = nodeMap[e.from];
        const to = nodeMap[e.to];
        if (!from || !to) return null;
        return (
          <line key={`${e.from}-${e.to}`}
            x1={from.x + 30} y1={from.y}
            x2={to.x - 30} y2={to.y}
            stroke={e.pruned ? '#d1d5db' : COLORS.primary}
            strokeWidth={e.pruned ? 1 : 2}
            strokeDasharray={e.pruned ? '4,3' : 'none'}
            opacity={e.pruned ? 0.5 : 1}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map(n => {
        const isRoot = n.id === 'root';
        const fill = n.pruned ? '#f9fafb' : isRoot ? COLORS.bgAlt : '#dbeafe';
        const stroke = n.pruned ? '#d1d5db' : COLORS.primary;
        const textColor = n.pruned ? COLORS.mid : COLORS.dark;
        return (
          <g key={n.id}>
            <rect
              x={n.x - 28} y={n.y - 14}
              width={56} height={28}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={n.pruned ? 1 : 1.5}
            />
            <text x={n.x} y={n.y - 1}
              textAnchor="middle" fontSize="10" fontWeight="600"
              fill={textColor} fontFamily="system-ui">
              {n.token}
            </text>
            {!isRoot && (
              <text x={n.x} y={n.y + 10}
                textAnchor="middle" fontSize="7" fill={n.pruned ? '#d1d5db' : COLORS.orange}
                fontFamily="monospace">
                {n.score.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function BeamSearchTree({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step0Title: '初始: [START]',
      step0Desc: `从起始 token 开始，准备展开 top-${B} 个候选`,
      step1Title: 'Step 1: 展开 + 剪枝',
      step1Desc: `展开 4 个候选，保留分数最高的 B=${B} 条 beam（"The" 和 "I"）`,
      step1Note: '灰色虚线 = 被剪枝的路径',
      step2Title: 'Step 2: 继续展开',
      step2Desc: `每条 beam 各展开 2 个候选（共 4 个），保留全局最优的 B=${B} 条`,
      step2Result: '"The cat" (−1.0) 和 "I like" (−1.3) 胜出',
      step3Title: 'Step 3: 最终结果',
      step3Desc: '最终选择总分数最高的序列: "The cat sat" (score = −1.3)',
      step3Note: 'Beam Search 能找到比 Greedy 更优的全局序列，但计算量是 B 倍',
    },
    en: {
      step0Title: 'Initial: [START]',
      step0Desc: `Start from initial token, prepare to expand top-${B} candidates`,
      step1Title: 'Step 1: Expand + Prune',
      step1Desc: `Expand 4 candidates, keep top-${B} beams by score ("The" and "I")`,
      step1Note: 'Gray dashed lines = pruned paths',
      step2Title: 'Step 2: Continue Expansion',
      step2Desc: `Each beam expands 2 candidates (4 total), keep globally best B=${B}`,
      step2Result: '"The cat" (−1.0) and "I like" (−1.3) win',
      step3Title: 'Step 3: Final Result',
      step3Desc: 'Select sequence with highest total score: "The cat sat" (score = −1.3)',
      step3Note: 'Beam Search finds better global sequences than Greedy, but B× compute',
    },
  }[locale];

  const steps = [
    {
      title: t.step0Title,
      content: (
        <div className="space-y-2">
          <TreeSVG step={0} />
          <p className="text-sm text-gray-600 text-center">
            {t.step0Desc}
          </p>
        </div>
      ),
    },
    {
      title: t.step1Title,
      content: (
        <div className="space-y-2">
          <TreeSVG step={1} />
          <p className="text-sm text-gray-600 text-center">
            {t.step1Desc}
            <br />
            <span className="text-xs text-gray-400">{t.step1Note}</span>
          </p>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div className="space-y-2">
          <TreeSVG step={2} />
          <p className="text-sm text-gray-600 text-center">
            {t.step2Desc}
            <br />
            <span className="text-xs">{t.step2Result}</span>
          </p>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div className="space-y-2">
          <TreeSVG step={3} />
          <p className="text-sm text-gray-600 text-center">
            <strong>{t.step3Desc}</strong>
            <br />
            <span className="text-xs">{t.step3Note}</span>
          </p>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
