// src/components/interactive/BottleneckDiagnosisTree.tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface TreeNode {
  id: number;
  textKey: string;
  x: number;
  y: number;
  children?: number[];
  isLeaf?: boolean;
  recommendationKey?: string;
}

interface BottleneckDiagnosisTreeProps {
  locale?: 'zh' | 'en';
}

const nodeConfig: TreeNode[] = [
  { id: 0, textKey: 'node0', x: 290, y: 30 },
  { id: 1, textKey: 'node1', x: 290, y: 100, children: [2, 3] },
  { id: 2, textKey: 'node2', x: 140, y: 170, children: [4, 5] },
  {
    id: 4,
    textKey: 'node4',
    x: 70,
    y: 240,
    isLeaf: true,
    recommendationKey: 'rec4',
  },
  {
    id: 5,
    textKey: 'node5',
    x: 210,
    y: 240,
    isLeaf: true,
    recommendationKey: 'rec5',
  },
  { id: 3, textKey: 'node3', x: 440, y: 170, children: [6, 7] },
  {
    id: 6,
    textKey: 'node6',
    x: 370,
    y: 240,
    isLeaf: true,
    recommendationKey: 'rec6',
  },
  {
    id: 7,
    textKey: 'node7',
    x: 510,
    y: 240,
    isLeaf: true,
    recommendationKey: 'rec7',
  },
];

const edges = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 3, to: 7 },
];

const BottleneckDiagnosisTree: React.FC<BottleneckDiagnosisTreeProps> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: '性能瓶颈诊断决策树',
      clickHint: '点击节点切换诊断路径',
      optimizationSuggestion: '优化建议：',
      node0: '性能不达标',
      node1: 'GPU 利用率高吗？',
      node2: '是：Arithmetic Intensity 高吗？',
      node3: '否：CPU 占比高吗？',
      node4: '是：Compute-bound',
      node5: '否：Memory-bound',
      node6: '是：Host-bound',
      node7: '否：Throttling?',
      rec4: '降低精度 (FP16/INT8)\n使用 XMX 矩阵引擎\n优化算法复杂度',
      rec5: '减少内存搬运\n使用 blocked format\nFuse 相邻 ops\n提高 data reuse',
      rec6: '减少同步点\n异步推理 API\nBatch 多次调用\n减少 host-device 拷贝',
      rec7: '检查功耗限制\n检查温度墙\n检查 DVFS 策略\n确保 turbo 开启',
    },
    en: {
      title: 'Performance Bottleneck Diagnosis Tree',
      clickHint: 'Click nodes to switch diagnosis path',
      optimizationSuggestion: 'Optimization Suggestions:',
      node0: 'Performance issue',
      node1: 'High GPU utilization?',
      node2: 'Yes: High Arithmetic Intensity?',
      node3: 'No: High CPU usage?',
      node4: 'Yes: Compute-bound',
      node5: 'No: Memory-bound',
      node6: 'Yes: Host-bound',
      node7: 'No: Throttling?',
      rec4: 'Reduce precision (FP16/INT8)\nUse XMX matrix engine\nOptimize algorithm complexity',
      rec5: 'Reduce memory transfer\nUse blocked format\nFuse adjacent ops\nIncrease data reuse',
      rec6: 'Reduce sync points\nAsync inference API\nBatch multiple calls\nReduce host-device copies',
      rec7: 'Check power limits\nCheck thermal throttling\nCheck DVFS policy\nEnsure turbo is enabled',
    },
  }[locale];

  const [currentNode, setCurrentNode] = useState<number>(0);

  const W = 580;
  const H = 400;

  // Get active path (all ancestors of current node)
  const getActivePath = (nodeId: number): Set<number> => {
    const path = new Set<number>();
    const findPath = (id: number): boolean => {
      if (id === nodeId) {
        path.add(id);
        return true;
      }
      const node = nodeConfig.find((n) => n.id === id);
      if (node?.children) {
        for (const childId of node.children) {
          if (findPath(childId)) {
            path.add(id);
            return true;
          }
        }
      }
      return false;
    };
    findPath(0);
    return path;
  };

  const activePath = getActivePath(currentNode);

  const currentNodeData = nodeConfig.find((n) => n.id === currentNode);

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <marker
            id="arrow-tree"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Title */}
        <text
          x={W / 2}
          y={20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill={COLORS.dark}
          fontFamily={FONTS.sans}
        >
          {t.title}
        </text>

        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodeConfig.find((n) => n.id === edge.from);
          const toNode = nodeConfig.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isActive = activePath.has(edge.from) && activePath.has(edge.to);

          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y + 15}
              x2={toNode.x}
              y2={toNode.y - 15}
              stroke={isActive ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2.5 : 1.5}
              markerEnd={isActive ? 'url(#arrow-tree)' : undefined}
              opacity={isActive ? 1 : 0.4}
            />
          );
        })}

        {/* Nodes */}
        {nodeConfig.map((node) => {
          const isActive = activePath.has(node.id);
          const isCurrent = node.id === currentNode;

          return (
            <g
              key={node.id}
              onClick={() => setCurrentNode(node.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={node.x - 60}
                y={node.y - 12}
                width={120}
                height={24}
                rx={4}
                fill={isCurrent ? COLORS.primary : isActive ? COLORS.bgAlt : COLORS.bg}
                stroke={isCurrent ? COLORS.primary : isActive ? COLORS.primary : COLORS.light}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.5}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="9"
                fill={isCurrent ? COLORS.bg : COLORS.dark}
                fontFamily={FONTS.sans}
                fontWeight={isCurrent ? '600' : '400'}
              >
                {t[node.textKey as keyof typeof t]}
              </text>
            </g>
          );
        })}

        {/* Recommendation panel */}
        {currentNodeData?.isLeaf && currentNodeData.recommendationKey && (
          <g transform={`translate(30, 300)`}>
            <rect
              x={0}
              y={0}
              width={520}
              height={80}
              rx={4}
              fill={COLORS.highlight}
              stroke={COLORS.orange}
              strokeWidth={1.5}
            />
            <text
              x={10}
              y={18}
              fontSize="10"
              fontWeight="600"
              fill={COLORS.dark}
              fontFamily={FONTS.sans}
            >
              {t.optimizationSuggestion}
            </text>
            {t[currentNodeData.recommendationKey as keyof typeof t].split('\n').map((line: string, idx: number) => (
              <text
                key={idx}
                x={10}
                y={35 + idx * 14}
                fontSize="9"
                fill={COLORS.dark}
                fontFamily={FONTS.sans}
              >
                • {line}
              </text>
            ))}
          </g>
        )}
      </svg>
      <div className="mt-3 text-xs text-gray-600 text-center" style={{ fontFamily: FONTS.sans }}>
        {t.clickHint}
      </div>
    </div>
  );
};

export default BottleneckDiagnosisTree;
