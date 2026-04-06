// src/components/interactive/BottleneckDiagnosisTree.tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface TreeNode {
  id: number;
  text: string;
  x: number;
  y: number;
  children?: number[];
  isLeaf?: boolean;
  recommendation?: string;
}

const nodes: TreeNode[] = [
  { id: 0, text: '性能不达标', x: 290, y: 30 },
  { id: 1, text: 'GPU 利用率高吗？', x: 290, y: 100, children: [2, 3] },
  { id: 2, text: '是：Arithmetic Intensity 高吗？', x: 140, y: 170, children: [4, 5] },
  {
    id: 4,
    text: '是：Compute-bound',
    x: 70,
    y: 240,
    isLeaf: true,
    recommendation: '降低精度 (FP16/INT8)\n使用 XMX 矩阵引擎\n优化算法复杂度',
  },
  {
    id: 5,
    text: '否：Memory-bound',
    x: 210,
    y: 240,
    isLeaf: true,
    recommendation: '减少内存搬运\n使用 blocked format\nFuse 相邻 ops\n提高 data reuse',
  },
  { id: 3, text: '否：CPU 占比高吗？', x: 440, y: 170, children: [6, 7] },
  {
    id: 6,
    text: '是：Host-bound',
    x: 370,
    y: 240,
    isLeaf: true,
    recommendation: '减少同步点\n异步推理 API\nBatch 多次调用\n减少 host-device 拷贝',
  },
  {
    id: 7,
    text: '否：Throttling?',
    x: 510,
    y: 240,
    isLeaf: true,
    recommendation: '检查功耗限制\n检查温度墙\n检查 DVFS 策略\n确保 turbo 开启',
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

const BottleneckDiagnosisTree: React.FC = () => {
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
      const node = nodes.find((n) => n.id === id);
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

  const currentNodeData = nodes.find((n) => n.id === currentNode);

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
          性能瓶颈诊断决策树
        </text>

        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
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
        {nodes.map((node) => {
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
                {node.text}
              </text>
            </g>
          );
        })}

        {/* Recommendation panel */}
        {currentNodeData?.isLeaf && currentNodeData.recommendation && (
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
              优化建议：
            </text>
            {currentNodeData.recommendation.split('\n').map((line, idx) => (
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
        点击节点切换诊断路径
      </div>
    </div>
  );
};

export default BottleneckDiagnosisTree;
