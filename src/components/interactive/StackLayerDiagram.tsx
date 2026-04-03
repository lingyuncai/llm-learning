// src/components/interactive/StackLayerDiagram.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STACK_LAYERS, BRANDS, type StackLayer, type TechNode } from './shared/stackData';
import { FONTS } from './shared/colors';

// ---------- Layout constants ----------
const SVG_W = 600;
const LAYER_H_COLLAPSED = 36;
const LAYER_GAP = 6;
const LAYER_PAD_X = 12;
const NODE_PILL_H = 24;
const NODE_PILL_GAP = 6;
const NODE_PILL_PAD = 8;        // top padding inside expanded layer before pills
const NODES_PER_ROW = 3;        // max pills per row before wrapping
const NODE_PILL_W = (SVG_W - LAYER_PAD_X * 2 - NODE_PILL_GAP * (NODES_PER_ROW - 1)) / NODES_PER_ROW;

function nodeRows(count: number): number {
  return Math.ceil(count / NODES_PER_ROW);
}

function expandedLayerH(nodeCount: number): number {
  const rows = nodeRows(nodeCount);
  return LAYER_H_COLLAPSED + NODE_PILL_PAD + rows * (NODE_PILL_H + NODE_PILL_GAP);
}

function isNodeHighlighted(node: TechNode, activeBrand: string | null): boolean {
  if (!activeBrand) return true;
  return node.brands.includes(activeBrand);
}

function isLayerHighlighted(layer: StackLayer, activeBrand: string | null): boolean {
  if (!activeBrand) return true;
  return layer.nodes.some(n => n.brands.includes(activeBrand));
}

export default function StackLayerDiagram() {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const toggleLayer = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  const toggleBrand = useCallback((brandId: string) => {
    setActiveBrand(prev => (prev === brandId ? null : brandId));
  }, []);

  // Compute cumulative Y positions
  const layerPositions: { layer: StackLayer; y: number; h: number }[] = [];
  let curY = 8;
  for (const layer of STACK_LAYERS) {
    const expanded = expandedLayers.has(layer.id);
    const h = expanded ? expandedLayerH(layer.nodes.length) : LAYER_H_COLLAPSED;
    layerPositions.push({ layer, y: curY, h });
    curY += h + LAYER_GAP;
  }
  const totalH = curY + 4;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${SVG_W} ${totalH}`} className="w-full">
        {layerPositions.map(({ layer, y, h }) => {
          const expanded = expandedLayers.has(layer.id);
          const highlighted = isLayerHighlighted(layer, activeBrand);
          return (
            <g key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              style={{ cursor: 'pointer' }}
              opacity={highlighted ? 1 : 0.15}
            >
              {/* Layer background rect */}
              <motion.rect
                x={0} y={y} width={SVG_W} rx={6}
                fill={`${layer.color}18`}
                stroke={layer.color}
                strokeWidth={0}
                animate={{ height: h }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
              {/* Left accent bar */}
              <motion.rect
                x={0} y={y} width={4} rx={2}
                fill={layer.color}
                animate={{ height: h }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
              {/* Layer name */}
              <text x={LAYER_PAD_X + 6} y={y + LAYER_H_COLLAPSED / 2 + 1}
                dominantBaseline="middle" fontSize="13" fontWeight="600"
                fill={layer.color} fontFamily={FONTS.sans}>
                {layer.name}
              </text>
              {/* Expand indicator */}
              <text x={SVG_W - LAYER_PAD_X} y={y + LAYER_H_COLLAPSED / 2 + 1}
                dominantBaseline="middle" textAnchor="end" fontSize="11"
                fill={layer.color} fontFamily={FONTS.sans} opacity={0.6}>
                {expanded ? '▾' : '▸'} {layer.nodes.length}
              </text>
              {/* Expanded node pills */}
              <AnimatePresence>
              {expanded && layer.nodes.map((node, ni) => {
                const row = Math.floor(ni / NODES_PER_ROW);
                const col = ni % NODES_PER_ROW;
                const nx = LAYER_PAD_X + col * (NODE_PILL_W + NODE_PILL_GAP);
                const ny = y + LAYER_H_COLLAPSED + NODE_PILL_PAD + row * (NODE_PILL_H + NODE_PILL_GAP);
                const nodeHl = isNodeHighlighted(node, activeBrand);
                return (
                  <motion.g key={node.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: nodeHl ? 1 : 0.15, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: ni * 0.02 }}
                  >
                    <rect x={nx} y={ny} width={NODE_PILL_W} height={NODE_PILL_H}
                      rx={4} fill="white" stroke={layer.color} strokeWidth={1} />
                    <text x={nx + NODE_PILL_W / 2} y={ny + NODE_PILL_H / 2 + 1}
                      dominantBaseline="middle" textAnchor="middle"
                      fontSize="9" fill="#1a1a2e" fontFamily={FONTS.sans}>
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>

      {/* Brand filter buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {BRANDS.map(brand => (
          <button key={brand.id}
            onClick={() => toggleBrand(brand.id)}
            className="px-3 py-1 text-xs rounded-full border transition-colors"
            style={{
              borderColor: brand.color,
              backgroundColor: activeBrand === brand.id ? brand.color : 'transparent',
              color: activeBrand === brand.id ? 'white' : brand.color,
            }}>
            {brand.label}
          </button>
        ))}
        {activeBrand && (
          <button onClick={() => setActiveBrand(null)}
            className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
            清除筛选
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        点击层名展开技术节点 · 底部按钮按品牌高亮
      </p>
    </div>
  );
}
