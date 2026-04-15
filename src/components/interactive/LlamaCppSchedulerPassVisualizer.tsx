// src/components/interactive/LlamaCppSchedulerPassVisualizer.tsx
import { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SchedulerPassVisualizerProps {
  locale?: 'zh' | 'en';
}

const i18n = {
  zh: {
    title: 'Backend Scheduler 五遍扫描可视化',
    prev: '上一步',
    next: '下一步',
    step: '步骤',
    of: '/',
    legend: '图例',
    gpu: 'GPU',
    cpu: 'CPU',
    unassigned: '未分配',
    copy: '拷贝节点',
    splitLabel: 'Split 边界',
    passes: [
      {
        title: 'Pass 0: 初始状态',
        desc: '计算图构建完成，所有节点尚未分配 backend。',
      },
      {
        title: 'Pass 1: 初始分配',
        desc: '根据 tensor buffer 所在位置确定 backend：Embedding 权重在 CPU buffer → 分配给 CPU；Output 权重在 GPU buffer → 分配给 GPU。',
      },
      {
        title: 'Pass 2: 传播扩展',
        desc: 'GPU 从 Output 向上传播 → Layer1_FFN、Layer1_Attn 变为 GPU；CPU 从 Embedding 向下传播 → Layer0_Attn 变为 CPU。Layer0_FFN 暂时未分配。',
      },
      {
        title: 'Pass 3: 升级优化',
        desc: 'Layer0_FFN 尝试升级到更高优先级的 GPU——前提是 GPU backend 支持该操作和所有输入的 buffer 类型。升级成功。',
      },
      {
        title: 'Pass 4: 源 tensor 分配',
        desc: '为未分配的 source tensor 确定归属：view tensor 继承父 tensor 的 backend，其他 source tensor 继承消费者节点的 backend。',
      },
      {
        title: 'Pass 5: 图切分 + 拷贝插入',
        desc: '在 backend 切换处创建 split 边界：Split 0 (CPU) 包含 Embedding → Layer0_Attn；Split 1 (GPU) 包含 Layer0_FFN → Output。在边界处插入 copy 节点。',
      },
    ],
  },
  en: {
    title: 'Backend Scheduler 5-Pass Visualization',
    prev: 'Previous',
    next: 'Next',
    step: 'Step',
    of: '/',
    legend: 'Legend',
    gpu: 'GPU',
    cpu: 'CPU',
    unassigned: 'Unassigned',
    copy: 'Copy node',
    splitLabel: 'Split boundary',
    passes: [
      {
        title: 'Pass 0: Initial State',
        desc: 'Computation graph is built. All nodes are unassigned.',
      },
      {
        title: 'Pass 1: Initial Assignment',
        desc: 'Assign backends based on tensor buffer location: Embedding weight is on CPU buffer → CPU; Output weight is on GPU buffer → GPU.',
      },
      {
        title: 'Pass 2: Propagation',
        desc: 'GPU propagates up from Output → Layer1_FFN, Layer1_Attn become GPU; CPU propagates down from Embedding → Layer0_Attn becomes CPU. Layer0_FFN remains unassigned.',
      },
      {
        title: 'Pass 3: Upgrade Optimization',
        desc: 'Layer0_FFN attempts upgrade to higher-priority GPU — succeeds if GPU backend supports the operation and all input buffer types.',
      },
      {
        title: 'Pass 4: Source Tensor Assignment',
        desc: 'Assign unassigned source tensors: view tensors inherit parent backend, others inherit consumer node backend.',
      },
      {
        title: 'Pass 5: Graph Splitting + Copy Insertion',
        desc: 'Create split boundaries at backend transitions: Split 0 (CPU) contains Embedding → Layer0_Attn; Split 1 (GPU) contains Layer0_FFN → Output. Insert copy node at boundary.',
      },
    ],
  },
};

type Backend = 'gpu' | 'cpu' | 'none' | 'copy';

interface NodeState {
  id: string;
  label: string;
  sublabel: string;
  backend: Backend;
}

const NODE_IDS = ['emb', 'l0_attn', 'l0_ffn', 'l1_attn', 'l1_ffn', 'output'] as const;

const BASE_NODES: { id: string; label: string; sublabel: string }[] = [
  { id: 'emb', label: 'Embedding', sublabel: 'CPU weight' },
  { id: 'l0_attn', label: 'Layer0 Attn', sublabel: '' },
  { id: 'l0_ffn', label: 'Layer0 FFN', sublabel: '' },
  { id: 'l1_attn', label: 'Layer1 Attn', sublabel: '' },
  { id: 'l1_ffn', label: 'Layer1 FFN', sublabel: '' },
  { id: 'output', label: 'Output', sublabel: 'GPU weight' },
];

/** Backend assignment per pass. Index 0 = pass 0 (all none), etc. */
const PASS_STATES: Record<string, Backend>[] = [
  // Pass 0: all unassigned
  { emb: 'none', l0_attn: 'none', l0_ffn: 'none', l1_attn: 'none', l1_ffn: 'none', output: 'none' },
  // Pass 1: initial assignment based on buffer
  { emb: 'cpu', l0_attn: 'none', l0_ffn: 'none', l1_attn: 'none', l1_ffn: 'none', output: 'gpu' },
  // Pass 2: propagation
  { emb: 'cpu', l0_attn: 'cpu', l0_ffn: 'none', l1_attn: 'gpu', l1_ffn: 'gpu', output: 'gpu' },
  // Pass 3: upgrade optimization
  { emb: 'cpu', l0_attn: 'cpu', l0_ffn: 'gpu', l1_attn: 'gpu', l1_ffn: 'gpu', output: 'gpu' },
  // Pass 4: source tensor inheritance (same result here since all assigned)
  { emb: 'cpu', l0_attn: 'cpu', l0_ffn: 'gpu', l1_attn: 'gpu', l1_ffn: 'gpu', output: 'gpu' },
  // Pass 5: same assignment, but we show split + copy
  { emb: 'cpu', l0_attn: 'cpu', l0_ffn: 'gpu', l1_attn: 'gpu', l1_ffn: 'gpu', output: 'gpu' },
];

const BACKEND_STYLES: Record<Backend, { bg: string; border: string; text: string }> = {
  gpu: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  cpu: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
  none: { bg: '#ffffff', border: '#d1d5db', text: '#6b7280' },
  copy: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
};

function getBackendLabel(backend: Backend, locale: 'zh' | 'en'): string {
  const l = i18n[locale];
  switch (backend) {
    case 'gpu': return l.gpu;
    case 'cpu': return l.cpu;
    case 'copy': return l.copy;
    default: return l.unassigned;
  }
}

/** SVG arrow marker component */
function ArrowDefs({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#9ca3af" />
      </marker>
    </defs>
  );
}

export default function LlamaCppSchedulerPassVisualizer({
  locale = 'zh',
}: SchedulerPassVisualizerProps) {
  const l = i18n[locale];
  const [step, setStep] = useState(0);
  const instanceId = useId();
  const arrowId = `sched-arrow-${instanceId}`;

  const totalSteps = l.passes.length;
  const currentPass = l.passes[step];

  const handlePrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const handleNext = useCallback(() => setStep((s) => Math.min(totalSteps - 1, s + 1)), [totalSteps]);

  const showCopy = step === 5;
  const showSplitBoundary = step === 5;

  const states = PASS_STATES[step];

  // Compute which nodes changed from previous pass
  const changedNodes = useMemo(() => {
    if (step === 0) return new Set<string>();
    const prev = PASS_STATES[step - 1];
    const curr = PASS_STATES[step];
    const changed = new Set<string>();
    for (const id of NODE_IDS) {
      if (prev[id] !== curr[id]) changed.add(id);
    }
    return changed;
  }, [step]);

  // Node positions for the graph (horizontal layout)
  const NODE_X: Record<string, number> = {
    emb: 0, l0_attn: 1, l0_ffn: 2, l1_attn: 3, l1_ffn: 4, output: 5,
  };

  const nodeWidth = 100;
  const nodeHeight = 56;
  const nodeGapX = 26;
  const totalGraphWidth = 6 * nodeWidth + 5 * nodeGapX;
  const svgPadding = 16;
  const svgHeight = showCopy ? 160 : 110;
  const svgWidth = totalGraphWidth + svgPadding * 2;
  const nodeY = 16;

  function getNodeCenter(id: string): { x: number; y: number } {
    const idx = NODE_X[id];
    const x = svgPadding + idx * (nodeWidth + nodeGapX) + nodeWidth / 2;
    const y = nodeY + nodeHeight / 2;
    return { x, y };
  }

  // Build edges
  const edges = [
    ['emb', 'l0_attn'],
    ['l0_attn', 'l0_ffn'],
    ['l0_ffn', 'l1_attn'],
    ['l1_attn', 'l1_ffn'],
    ['l1_ffn', 'output'],
  ];

  // Copy node position (between l0_attn and l0_ffn, below)
  const copyNodeX = svgPadding + 2 * (nodeWidth + nodeGapX) + nodeWidth / 2 - nodeWidth / 2 - (nodeWidth + nodeGapX) / 2;
  const copyNodeCenterX = svgPadding + 1.5 * (nodeWidth + nodeGapX) + nodeWidth / 2;
  const copyNodeY = nodeY + nodeHeight + 30;

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{l.title}</h4>

      {/* Step controls */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {l.prev}
        </button>

        <div className="text-xs text-gray-500 font-medium">
          {l.step} {step}{l.of}{totalSteps - 1}
        </div>

        <button
          onClick={handleNext}
          disabled={step === totalSteps - 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {l.next}
        </button>
      </div>

      {/* Pass title and description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mb-4"
        >
          <div className="text-sm font-semibold text-gray-800 mb-1">{currentPass.title}</div>
          <div className="text-xs text-gray-500 leading-relaxed">{currentPass.desc}</div>
        </motion.div>
      </AnimatePresence>

      {/* Graph visualization */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto"
          style={{ minWidth: `${svgWidth}px` }}
        >
          <ArrowDefs id={arrowId} />

          {/* Split boundary indicators for Pass 5 */}
          {showSplitBoundary && (
            <>
              {/* CPU split background */}
              <rect
                x={svgPadding - 6}
                y={nodeY - 8}
                width={2 * (nodeWidth + nodeGapX) + nodeWidth + 12 - nodeGapX}
                height={nodeHeight + 16}
                rx={8}
                fill="#f9fafb"
                stroke="#d1d5db"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={svgPadding + nodeWidth}
                y={nodeY - 12}
                textAnchor="middle"
                className="text-[10px] fill-gray-400"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                Split 0 — CPU
              </text>

              {/* GPU split background */}
              <rect
                x={svgPadding + 2 * (nodeWidth + nodeGapX) - 6}
                y={nodeY - 8}
                width={4 * (nodeWidth + nodeGapX) + nodeWidth + 12 - nodeGapX - 2 * (nodeWidth + nodeGapX)}
                height={nodeHeight + 16}
                rx={8}
                fill="#eff6ff"
                stroke="#93c5fd"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={svgPadding + 3.5 * (nodeWidth + nodeGapX) + nodeWidth / 2}
                y={nodeY - 12}
                textAnchor="middle"
                className="text-[10px] fill-blue-400"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                Split 1 — GPU
              </text>
            </>
          )}

          {/* Edges */}
          {edges.map(([from, to], i) => {
            // In pass 5, replace the edge from l0_attn → l0_ffn with copy path
            if (showCopy && from === 'l0_attn' && to === 'l0_ffn') {
              return null; // replaced by copy edges
            }
            const src = getNodeCenter(from);
            const dst = getNodeCenter(to);
            return (
              <line
                key={i}
                x1={src.x + nodeWidth / 2}
                y1={src.y}
                x2={dst.x - nodeWidth / 2}
                y2={dst.y}
                stroke="#d1d5db"
                strokeWidth={1.5}
                markerEnd={`url(#${arrowId})`}
              />
            );
          })}

          {/* Copy node and its edges for Pass 5 */}
          {showCopy && (
            <>
              {/* Edge: l0_attn → copy */}
              <line
                x1={getNodeCenter('l0_attn').x + nodeWidth / 2}
                y1={getNodeCenter('l0_attn').y}
                x2={copyNodeCenterX - nodeWidth * 0.45}
                y2={copyNodeY + 18}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                markerEnd={`url(#${arrowId})`}
              />
              {/* Edge: copy → l0_ffn */}
              <line
                x1={copyNodeCenterX + nodeWidth * 0.45}
                y1={copyNodeY + 18}
                x2={getNodeCenter('l0_ffn').x - nodeWidth / 2}
                y2={getNodeCenter('l0_ffn').y}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                markerEnd={`url(#${arrowId})`}
              />
              {/* Copy node */}
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <rect
                  x={copyNodeCenterX - nodeWidth * 0.45}
                  y={copyNodeY}
                  width={nodeWidth * 0.9}
                  height={36}
                  rx={6}
                  fill={BACKEND_STYLES.copy.bg}
                  stroke={BACKEND_STYLES.copy.border}
                  strokeWidth={1.5}
                />
                <text
                  x={copyNodeCenterX}
                  y={copyNodeY + 14}
                  textAnchor="middle"
                  className="text-[11px] fill-amber-800 font-medium"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  Copy
                </text>
                <text
                  x={copyNodeCenterX}
                  y={copyNodeY + 28}
                  textAnchor="middle"
                  className="text-[9px] fill-amber-600"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  CPU → GPU
                </text>
              </motion.g>
            </>
          )}

          {/* Nodes */}
          {BASE_NODES.map((node) => {
            const center = getNodeCenter(node.id);
            const x = center.x - nodeWidth / 2;
            const y = nodeY;
            const backend = states[node.id];
            const style = BACKEND_STYLES[backend];
            const isChanged = changedNodes.has(node.id);

            return (
              <motion.g
                key={node.id}
                initial={false}
                animate={{
                  scale: isChanged ? [1, 1.08, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={8}
                  initial={false}
                  animate={{
                    fill: style.bg,
                    stroke: style.border,
                  }}
                  transition={{ duration: 0.3 }}
                  strokeWidth={isChanged ? 2.5 : 1.5}
                />
                <text
                  x={center.x}
                  y={y + 20}
                  textAnchor="middle"
                  fill={style.text}
                  className="text-[11px] font-medium"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {node.label}
                </text>
                {/* Backend label */}
                <text
                  x={center.x}
                  y={y + 34}
                  textAnchor="middle"
                  fill={style.text}
                  className="text-[9px]"
                  style={{ fontFamily: 'system-ui, sans-serif', opacity: 0.7 }}
                >
                  {node.sublabel || getBackendLabel(backend, locale)}
                </text>
                {/* Backend badge */}
                {backend !== 'none' && (
                  <motion.text
                    x={center.x}
                    y={y + 48}
                    textAnchor="middle"
                    className="text-[9px] font-semibold"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, fill: style.text }}
                    transition={{ duration: 0.3 }}
                  >
                    [{getBackendLabel(backend, locale)}]
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded border-2"
            style={{ backgroundColor: BACKEND_STYLES.gpu.bg, borderColor: BACKEND_STYLES.gpu.border }}
          />
          {l.gpu}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded border-2"
            style={{ backgroundColor: BACKEND_STYLES.cpu.bg, borderColor: BACKEND_STYLES.cpu.border }}
          />
          {l.cpu}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded border-2"
            style={{ backgroundColor: BACKEND_STYLES.none.bg, borderColor: BACKEND_STYLES.none.border }}
          />
          {l.unassigned}
        </span>
        {showCopy && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded border-2"
              style={{ backgroundColor: BACKEND_STYLES.copy.bg, borderColor: BACKEND_STYLES.copy.border }}
            />
            {l.copy}
          </span>
        )}
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label={`${l.step} ${i}`}
          />
        ))}
      </div>
    </div>
  );
}
