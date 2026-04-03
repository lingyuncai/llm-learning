// src/components/interactive/EcosystemPathSelector.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { STACK_LAYERS, ECO_PATHS, type EcoPath } from './shared/stackData';
import { COLORS, FONTS } from './shared/colors';

// Layout
const SVG_W = 600;
const LAYER_H = 52;
const LAYER_GAP = 4;
const PAD_X = 10;
const NODE_PILL_H = 22;
const NODE_PILL_GAP = 5;
const NODES_PER_ROW = 4;
const NODE_PILL_W = (SVG_W - PAD_X * 2 - NODE_PILL_GAP * (NODES_PER_ROW - 1)) / NODES_PER_ROW;
const LABEL_H = 18; // layer name area at top of each layer
const NODE_START_Y = LABEL_H + 4;

function nodeRows(count: number): number {
  return Math.ceil(count / NODES_PER_ROW);
}

function layerHeight(nodeCount: number): number {
  const rows = nodeRows(nodeCount);
  return LABEL_H + 4 + rows * (NODE_PILL_H + NODE_PILL_GAP) + 4;
}

export default function EcosystemPathSelector() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const activePath = ECO_PATHS.find(p => p.id === selectedPath) ?? null;

  // Compute layer positions
  const layerPositions: { layerId: string; y: number; h: number }[] = [];
  let curY = 4;
  for (const layer of STACK_LAYERS) {
    const h = layerHeight(layer.nodes.length);
    layerPositions.push({ layerId: layer.id, y: curY, h });
    curY += h + LAYER_GAP;
  }
  const totalH = curY + 4;

  function isNodeActive(layerId: string, nodeId: string): boolean {
    if (!activePath) return true; // no selection → all active
    const layerNodes = activePath.highlightNodes[layerId];
    return layerNodes ? layerNodes.includes(nodeId) : false;
  }

  function isLayerActive(layerId: string): boolean {
    if (!activePath) return true;
    const layerNodes = activePath.highlightNodes[layerId];
    return layerNodes ? layerNodes.length > 0 : false;
  }

  return (
    <div className="space-y-3">
      {/* Scenario buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ECO_PATHS.map(path => (
          <button key={path.id}
            onClick={() => setSelectedPath(prev => prev === path.id ? null : path.id)}
            className="px-3 py-1.5 text-xs rounded-lg border transition-all"
            style={{
              borderColor: selectedPath === path.id ? COLORS.primary : '#d1d5db',
              backgroundColor: selectedPath === path.id ? '#dbeafe' : 'white',
              color: selectedPath === path.id ? COLORS.primary : '#4b5563',
              fontWeight: selectedPath === path.id ? 600 : 400,
            }}>
            {path.label}
          </button>
        ))}
      </div>

      {/* Stack diagram */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${totalH}`} className="w-full">
          {STACK_LAYERS.map((layer, li) => {
            const { y, h } = layerPositions[li];
            const layerActive = isLayerActive(layer.id);
            return (
              <g key={layer.id} opacity={layerActive ? 1 : 0.15}>
                {/* Layer background */}
                <rect x={0} y={y} width={SVG_W} height={h} rx={6}
                  fill={`${layer.color}12`} />
                {/* Left accent */}
                <rect x={0} y={y} width={4} height={h} rx={2}
                  fill={layer.color} />
                {/* Layer name */}
                <text x={PAD_X + 6} y={y + LABEL_H / 2 + 1}
                  dominantBaseline="middle" fontSize="11" fontWeight="600"
                  fill={layer.color} fontFamily={FONTS.sans}>
                  {layer.name}
                </text>

                {/* Node pills */}
                {layer.nodes.map((node, ni) => {
                  const row = Math.floor(ni / NODES_PER_ROW);
                  const col = ni % NODES_PER_ROW;
                  const nx = PAD_X + col * (NODE_PILL_W + NODE_PILL_GAP);
                  const ny = y + NODE_START_Y + row * (NODE_PILL_H + NODE_PILL_GAP);
                  const nodeActive = isNodeActive(layer.id, node.id);

                  // Special: ggml span for llama.cpp paths
                  const isGgmlSpan = activePath?.ggmlSpan && node.id === 'ggml';

                  return (
                    <motion.g key={node.id}
                      animate={{ opacity: nodeActive ? 1 : 0.15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <rect x={nx} y={ny}
                        width={NODE_PILL_W}
                        height={isGgmlSpan ? NODE_PILL_H + LAYER_GAP + LAYER_H : NODE_PILL_H}
                        rx={4}
                        fill={nodeActive ? 'white' : '#f9fafb'}
                        stroke={nodeActive ? layer.color : '#e5e7eb'}
                        strokeWidth={nodeActive ? 1.5 : 0.5} />
                      <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H / 2 + 1}
                        dominantBaseline="middle" textAnchor="middle"
                        fontSize="8.5" fill="#1a1a2e" fontFamily={FONTS.sans}>
                        {node.label}
                      </text>
                      {isGgmlSpan && (
                        <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H + 8}
                          dominantBaseline="middle" textAnchor="middle"
                          fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
                          (= operator lib + kernel)
                        </text>
                      )}
                    </motion.g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path description */}
      {activePath ? (
        <motion.p
          key={activePath.id}
          className="text-sm text-center font-medium"
          style={{ color: COLORS.primary }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activePath.description}
        </motion.p>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          选择一个场景，查看技术栈路径
        </p>
      )}
    </div>
  );
}
