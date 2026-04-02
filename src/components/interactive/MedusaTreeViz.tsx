// src/components/interactive/MedusaTreeViz.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

interface TreeNode {
  id: string;
  token: string;
  head: number; // 0=root, 1=head1, 2=head2
  conf: number;
  children: string[];
  accepted?: boolean;
}

const TREE: Record<string, TreeNode> = {
  root: { id: 'root', token: 'cat', head: 0, conf: 1.0, children: ['h1-0', 'h1-1'] },
  'h1-0': { id: 'h1-0', token: 'sat', head: 1, conf: 0.72, children: ['h2-00', 'h2-01'] },
  'h1-1': { id: 'h1-1', token: 'is', head: 1, conf: 0.61, children: ['h2-10', 'h2-11'] },
  'h2-00': { id: 'h2-00', token: 'on', head: 2, conf: 0.68, children: [] },
  'h2-01': { id: 'h2-01', token: 'by', head: 2, conf: 0.31, children: [] },
  'h2-10': { id: 'h2-10', token: 'a', head: 2, conf: 0.55, children: [] },
  'h2-11': { id: 'h2-11', token: 'very', head: 2, conf: 0.22, children: [] },
};

// Acceptance results: longest accepted path is root → h1-0 → h2-00
const ACCEPTED_IDS = new Set(['root', 'h1-0', 'h2-00']);

const POSITIONS: Record<string, { x: number; y: number }> = {
  root: { x: 50, y: 110 },
  'h1-0': { x: 170, y: 60 },
  'h1-1': { x: 170, y: 160 },
  'h2-00': { x: 300, y: 30 },
  'h2-01': { x: 300, y: 90 },
  'h2-10': { x: 300, y: 130 },
  'h2-11': { x: 300, y: 190 },
};

const SVG_W = 420;
const SVG_H = 220;
const NODE_W = 56;
const NODE_H = 28;

const HEAD_LABELS = ['Current', 'Head 1', 'Head 2'];
const HEAD_LABEL_COLORS = [COLORS.dark, HEAD_COLORS[0], HEAD_COLORS[1]];

export default function MedusaTreeViz() {
  const [verified, setVerified] = useState(false);

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
  }, []);

  return (
    <div className="space-y-3">
      {/* Head labels */}
      <div className="flex items-center justify-center gap-4">
        {HEAD_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{
              backgroundColor: `${HEAD_LABEL_COLORS[i]}20`,
              border: `1.5px solid ${HEAD_LABEL_COLORS[i]}`,
            }} />
            <span style={{ color: HEAD_LABEL_COLORS[i] }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Edges */}
          {Object.values(TREE).flatMap(node =>
            node.children.map(childId => {
              const from = POSITIONS[node.id];
              const to = POSITIONS[childId];
              const isAccepted = verified && ACCEPTED_IDS.has(node.id) && ACCEPTED_IDS.has(childId);
              const isRejected = verified && !isAccepted;
              return (
                <motion.line
                  key={`${node.id}-${childId}`}
                  x1={from.x + NODE_W / 2} y1={from.y}
                  x2={to.x - NODE_W / 2} y2={to.y}
                  stroke={isRejected ? '#d1d5db' : isAccepted ? COLORS.green : COLORS.primary}
                  strokeWidth={isAccepted ? 2.5 : isRejected ? 1 : 1.5}
                  strokeDasharray={isRejected ? '4,3' : 'none'}
                  animate={{
                    stroke: isRejected ? '#d1d5db' : isAccepted ? COLORS.green : COLORS.primary,
                    strokeWidth: isAccepted ? 2.5 : isRejected ? 1 : 1.5,
                  }}
                  transition={{ duration: 0.4 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {Object.values(TREE).map(node => {
            const pos = POSITIONS[node.id];
            const isAccepted = verified && ACCEPTED_IDS.has(node.id);
            const isRejected = verified && !ACCEPTED_IDS.has(node.id);
            const headColor = HEAD_LABEL_COLORS[node.head];

            return (
              <motion.g key={node.id}
                animate={{
                  opacity: isRejected ? 0.35 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <rect
                  x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2}
                  width={NODE_W} height={NODE_H}
                  rx={6}
                  fill={isAccepted ? '#dcfce7' : isRejected ? '#f9fafb' : `${headColor}12`}
                  stroke={isAccepted ? COLORS.green : isRejected ? '#d1d5db' : headColor}
                  strokeWidth={isAccepted ? 2 : 1.5}
                />
                <text x={pos.x} y={pos.y + 1}
                  textAnchor="middle" fontSize="11" fontWeight="600"
                  fill={isRejected ? COLORS.mid : COLORS.dark} fontFamily="system-ui">
                  {node.token}
                </text>
                <text x={pos.x} y={pos.y + NODE_H / 2 + 12}
                  textAnchor="middle" fontSize="7"
                  fill={isRejected ? '#d1d5db' : COLORS.mid} fontFamily="monospace">
                  conf: {node.conf.toFixed(2)}
                </text>
                {/* Accept/reject marker */}
                {verified && (
                  <motion.text
                    x={pos.x + NODE_W / 2 - 2} y={pos.y - NODE_H / 2 + 2}
                    textAnchor="middle" fontSize="12"
                    fill={isAccepted ? COLORS.green : COLORS.red}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isAccepted ? '✓' : '✗'}
                  </motion.text>
                )}
              </motion.g>
            );
          })}

          {/* Accepted path label */}
          {verified && (
            <motion.text
              x={SVG_W / 2} y={SVG_H - 4}
              textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.green}
              fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              最长接受路径: cat → sat → on（3 tokens）
            </motion.text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!verified ? (
          <button onClick={handleVerify}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Tree Attention 验证
          </button>
        ) : (
          <button onClick={handleReset}
            className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
            重置
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center">
        Medusa 的多个 head 组合成候选树，Tree Attention 一次验证所有路径，选择最长被接受分支
      </p>
    </div>
  );
}
