import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface GraphNode {
  id: string;
  op: string;
  inputs: string[];
  value?: number;
  label: string;
  dead?: boolean;
  cseMergedTo?: string;
  foldedValue?: number;
}

type PassType = 'dce' | 'cse' | 'constant_folding' | 'canonicalize';

interface Pass {
  id: PassType;
  name: string;
  nameEn: string;
  color: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const INITIAL_GRAPH: GraphNode[] = [
  { id: 'x', op: 'input', inputs: [], label: 'x' },
  { id: 'y', op: 'input', inputs: [], label: 'y' },
  { id: 'c0', op: 'const', inputs: [], value: 0, label: '0' },
  { id: 'c1', op: 'const', inputs: [], value: 1, label: '1' },
  { id: 'add1', op: 'add', inputs: ['x', 'c0'], label: 'x + 0' },
  { id: 'mul1', op: 'mul', inputs: ['y', 'c1'], label: 'y × 1' },
  { id: 'add2', op: 'add', inputs: ['x', 'c0'], label: 'x + 0' },
  { id: 'dead', op: 'mul', inputs: ['x', 'x'], label: 'x × x' },
  { id: 'relu1', op: 'relu', inputs: ['add1'], label: 'relu' },
  { id: 'relu2', op: 'relu', inputs: ['mul1'], label: 'relu' },
  { id: 'out', op: 'add', inputs: ['relu1', 'relu2'], label: 'output' },
];

const AVAILABLE_PASSES: Pass[] = [
  { id: 'dce', name: '死代码消除', nameEn: 'Dead Code Elimination', color: COLORS.red },
  { id: 'cse', name: '公共子表达式消除', nameEn: 'Common Subexpression Elimination', color: COLORS.orange },
  { id: 'constant_folding', name: '常量折叠', nameEn: 'Constant Folding', color: COLORS.green },
  { id: 'canonicalize', name: '规范化', nameEn: 'Canonicalize', color: COLORS.purple },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;

/* ─── Pass Logic ─── */

function applyPass(graph: GraphNode[], passId: PassType): GraphNode[] {
  const newGraph = graph.map(n => ({ ...n }));

  if (passId === 'dce') {
    // Mark live nodes from outputs backward
    const liveSet = new Set<string>();
    const queue = ['out'];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (liveSet.has(nodeId)) continue;
      liveSet.add(nodeId);
      const node = newGraph.find(n => n.id === nodeId);
      if (node) {
        node.inputs.forEach(inp => {
          if (!liveSet.has(inp)) queue.push(inp);
        });
      }
    }
    // Mark dead nodes
    newGraph.forEach(n => {
      if (!liveSet.has(n.id)) n.dead = true;
    });
    return newGraph.filter(n => !n.dead);
  }

  if (passId === 'cse') {
    // Compute hashes for each node
    const hashMap = new Map<string, string>();
    newGraph.forEach(n => {
      if (n.op !== 'input' && n.op !== 'const') {
        const hash = `${n.op}(${n.inputs.join(',')})`;
        if (hashMap.has(hash)) {
          n.cseMergedTo = hashMap.get(hash)!;
        } else {
          hashMap.set(hash, n.id);
        }
      }
    });
    // Replace merged nodes in inputs
    newGraph.forEach(n => {
      n.inputs = n.inputs.map(inp => {
        const merged = newGraph.find(x => x.id === inp)?.cseMergedTo;
        return merged || inp;
      });
    });
    return newGraph.filter(n => !n.cseMergedTo);
  }

  if (passId === 'constant_folding') {
    // Fold constants
    newGraph.forEach(n => {
      if (n.op === 'add') {
        const [a, b] = n.inputs.map(id => newGraph.find(x => x.id === id));
        if (a && b && a.op === 'const' && b.op === 'const') {
          n.foldedValue = (a.value ?? 0) + (b.value ?? 0);
        }
      } else if (n.op === 'mul') {
        const [a, b] = n.inputs.map(id => newGraph.find(x => x.id === id));
        if (a && b && a.op === 'const' && b.op === 'const') {
          n.foldedValue = (a.value ?? 0) * (b.value ?? 0);
        }
      }
    });
    return newGraph;
  }

  if (passId === 'canonicalize') {
    // x + 0 → x, x × 1 → x
    newGraph.forEach(n => {
      if (n.op === 'add') {
        const [a, b] = n.inputs.map(id => newGraph.find(x => x.id === id));
        if (b?.op === 'const' && b.value === 0) {
          n.foldedValue = -1; // marker for identity
          n.label = a?.label || n.label;
        }
      } else if (n.op === 'mul') {
        const [a, b] = n.inputs.map(id => newGraph.find(x => x.id === id));
        if (b?.op === 'const' && b.value === 1) {
          n.foldedValue = -1;
          n.label = a?.label || n.label;
        }
      }
    });
    return newGraph;
  }

  return newGraph;
}

/* ─── Layout ─── */

function computeLayout(graph: GraphNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const layers: string[][] = [];

  // Topological sort to layers
  const inDegree = new Map<string, number>();
  graph.forEach(n => inDegree.set(n.id, n.inputs.length));

  let currentLayer: string[] = [];
  graph.forEach(n => {
    if (n.inputs.length === 0) currentLayer.push(n.id);
  });

  while (currentLayer.length > 0) {
    layers.push([...currentLayer]);
    const nextLayer: string[] = [];
    currentLayer.forEach(nodeId => {
      graph.forEach(n => {
        if (n.inputs.includes(nodeId)) {
          const deg = inDegree.get(n.id)! - 1;
          inDegree.set(n.id, deg);
          if (deg === 0 && !nextLayer.includes(n.id)) {
            nextLayer.push(n.id);
          }
        }
      });
    });
    currentLayer = nextLayer;
  }

  // Position nodes
  const topMargin = 80;
  const layerSpacing = 70;
  const nodeSpacing = 100;

  layers.forEach((layer, i) => {
    const layerY = topMargin + i * layerSpacing;
    const layerW = (layer.length - 1) * nodeSpacing;
    const startX = (W - layerW) / 2;
    layer.forEach((nodeId, j) => {
      positions.set(nodeId, { x: startX + j * nodeSpacing, y: layerY });
    });
  });

  return positions;
}

/* ─── Component ─── */

export default function PassPipelineSimulator({ locale = 'zh' }: Props) {
  const [graph, setGraph] = useState<GraphNode[]>(INITIAL_GRAPH);
  const [selectedPasses, setSelectedPasses] = useState<PassType[]>([]);
  const [running, setRunning] = useState(false);

  const t = {
    zh: {
      title: 'Pass 管线模拟器',
      subtitle: '拖拽调整 Pass 顺序，观察不同管线对计算图的影响',
      availablePasses: '可用的 Pass：',
      selectedPipeline: '已选管线：',
      run: '运行管线',
      reset: '重置图',
      running: '执行中...',
    },
    en: {
      title: 'Pass Pipeline Simulator',
      subtitle: 'Drag passes to reorder, observe different pipelines affect the computation graph',
      availablePasses: 'Available Passes:',
      selectedPipeline: 'Selected Pipeline:',
      run: 'Run Pipeline',
      reset: 'Reset Graph',
      running: 'Running...',
    },
  }[locale]!;

  const positions = useMemo(() => computeLayout(graph), [graph]);

  const addPass = (passId: PassType) => {
    setSelectedPasses([...selectedPasses, passId]);
  };

  const removePass = (index: number) => {
    setSelectedPasses(selectedPasses.filter((_, i) => i !== index));
  };

  const runPipeline = async () => {
    setRunning(true);
    let currentGraph = INITIAL_GRAPH.map(n => ({ ...n }));
    setGraph(currentGraph);

    for (const passId of selectedPasses) {
      await new Promise(resolve => setTimeout(resolve, 800));
      currentGraph = applyPass(currentGraph, passId);
      setGraph(currentGraph);
    }

    setRunning(false);
  };

  const resetGraph = () => {
    setGraph(INITIAL_GRAPH.map(n => ({ ...n })));
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Graph nodes */}
        <g transform="translate(0, 0)">
          <AnimatePresence mode="popLayout">
            {graph.map(node => {
              const pos = positions.get(node.id);
              if (!pos) return null;

              const isDead = node.dead;
              const isMerged = !!node.cseMergedTo;
              const isFolded = node.foldedValue !== undefined;

              let fillColor = COLORS.bg;
              let strokeColor = COLORS.primary;
              if (isDead) {
                fillColor = COLORS.masked;
                strokeColor = COLORS.mid;
              } else if (isMerged) {
                fillColor = COLORS.highlight;
                strokeColor = COLORS.orange;
              } else if (isFolded) {
                fillColor = COLORS.valid;
                strokeColor = COLORS.green;
              }

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <rect
                    x={-35}
                    y={-15}
                    width={70}
                    height={30}
                    rx={4}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={1.5}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={isDead ? COLORS.mid : COLORS.dark}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Edges */}
          {graph.map(node => {
            const targetPos = positions.get(node.id);
            if (!targetPos) return null;
            return node.inputs.map(inputId => {
              const sourcePos = positions.get(inputId);
              if (!sourcePos) return null;
              return (
                <line
                  key={`${inputId}-${node.id}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y + 15}
                  x2={targetPos.x}
                  y2={targetPos.y - 15}
                  stroke={COLORS.light}
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                />
              );
            });
          })}

          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
              <path d="M0,1 L8,4 L0,7" fill={COLORS.light} />
            </marker>
          </defs>
        </g>

        {/* Pass selection area */}
        <g transform="translate(0, 420)">
          <rect x={10} y={0} width={W - 20} height={120} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

          {/* Available passes */}
          <text x={20} y={20} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            {t.availablePasses}
          </text>
          {AVAILABLE_PASSES.map((pass, i) => (
            <g key={pass.id} transform={`translate(${20 + i * 180}, 30)`}>
              <rect
                x={0}
                y={0}
                width={160}
                height={28}
                rx={4}
                fill={pass.color}
                fillOpacity={0.1}
                stroke={pass.color}
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => addPass(pass.id)}
              />
              <text
                x={80}
                y={14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill={pass.color}
                style={{ pointerEvents: 'none' }}
              >
                {locale === 'zh' ? pass.name : pass.nameEn}
              </text>
            </g>
          ))}

          {/* Selected pipeline */}
          <text x={20} y={75} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            {t.selectedPipeline}
          </text>
          {selectedPasses.map((passId, i) => {
            const pass = AVAILABLE_PASSES.find(p => p.id === passId)!;
            return (
              <g key={i} transform={`translate(${20 + i * 100}, 85)`}>
                <rect
                  x={0}
                  y={0}
                  width={90}
                  height={22}
                  rx={4}
                  fill={pass.color}
                  fillOpacity={0.2}
                  stroke={pass.color}
                  strokeWidth={1.5}
                />
                <text
                  x={45}
                  y={11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={pass.color}
                >
                  {locale === 'zh' ? pass.name : pass.nameEn}
                </text>
                <text
                  x={80}
                  y={11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={COLORS.red}
                  style={{ cursor: 'pointer' }}
                  onClick={() => removePass(i)}
                >
                  ×
                </text>
              </g>
            );
          })}

          {/* Buttons */}
          <g transform={`translate(${W - 240}, 80)`}>
            <rect
              x={0}
              y={0}
              width={100}
              height={30}
              rx={4}
              fill={COLORS.primary}
              fillOpacity={running ? 0.5 : 1}
              style={{ cursor: running ? 'not-allowed' : 'pointer' }}
              onClick={() => !running && runPipeline()}
            />
            <text
              x={50}
              y={15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill={COLORS.bg}
              style={{ pointerEvents: 'none' }}
            >
              {running ? t.running : t.run}
            </text>
          </g>

          <g transform={`translate(${W - 120}, 80)`}>
            <rect
              x={0}
              y={0}
              width={100}
              height={30}
              rx={4}
              fill={COLORS.bgAlt}
              stroke={COLORS.mid}
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
              onClick={resetGraph}
            />
            <text
              x={50}
              y={15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill={COLORS.mid}
              style={{ pointerEvents: 'none' }}
            >
              {t.reset}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
