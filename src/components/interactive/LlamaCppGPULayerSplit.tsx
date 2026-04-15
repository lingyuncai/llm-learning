// src/components/interactive/LlamaCppGPULayerSplit.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';


interface GPULayerSplitProps {
  locale?: 'zh' | 'en';
}

const t = {
  zh: {
    title: 'GPU 层分配可视化',
    totalLayers: '总层数 (n_layer)',
    gpuLayers: 'GPU 层数 (n_gpu_layers)',
    numGPUs: 'GPU 数量',
    gpuMemory: 'GPU 显存比例',
    formula: '计算公式',
    iGpuStart: 'i_gpu_start',
    result: '分配结果',
    cpu: 'CPU',
    gpu: 'GPU',
    inputLayer: 'Input Layer (始终 CPU)',
    outputLayer: 'Output',
    layer: '层',
    layers: '层',
    splits: '归一化累积分布',
    freeVRAM: '空闲显存',
    layerRange: '层范围',
    device: '设备',
    actGpuLayers: 'act_gpu_layers',
    explanation: '最后的 n_gpu_layers 层放在 GPU 上，前面的层留在 CPU',
    multiGpuExplanation: '使用 upper_bound 二分查找将每一层映射到对应的 GPU',
  },
  en: {
    title: 'GPU Layer Split Visualization',
    totalLayers: 'Total Layers (n_layer)',
    gpuLayers: 'GPU Layers (n_gpu_layers)',
    numGPUs: 'Number of GPUs',
    gpuMemory: 'GPU VRAM Ratio',
    formula: 'Formula',
    iGpuStart: 'i_gpu_start',
    result: 'Allocation Result',
    cpu: 'CPU',
    gpu: 'GPU',
    inputLayer: 'Input Layer (always CPU)',
    outputLayer: 'Output',
    layer: 'Layer',
    layers: 'layers',
    splits: 'Normalized Cumulative Distribution',
    freeVRAM: 'Free VRAM',
    layerRange: 'Layer Range',
    device: 'Device',
    actGpuLayers: 'act_gpu_layers',
    explanation: 'The last n_gpu_layers layers are placed on GPU, earlier layers stay on CPU',
    multiGpuExplanation: 'Uses upper_bound binary search to map each layer to its GPU',
  },
};

/** Colors for GPU devices */
const GPU_COLORS = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', barBg: '#3b82f6' },   // blue
  { bg: '#dcfce7', border: '#22c55e', text: '#166534', barBg: '#22c55e' },   // green
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', barBg: '#f59e0b' },   // amber
  { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', barBg: '#a855f7' },   // purple
];

const CPU_COLOR = { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', barBg: '#9ca3af' };

function computeLayerAllocation(
  nLayer: number,
  nGpuLayers: number,
  numGPUs: number,
  gpuMemoryRatios: number[],
) {
  const iGpuStart = Math.max(nLayer + 1 - nGpuLayers, 0);
  const actGpuLayers = nLayer + 1 - iGpuStart; // includes output layer

  // Compute normalized cumulative distribution
  const splits: number[] = [];
  let splitSum = 0;
  for (let i = 0; i < numGPUs; i++) {
    splitSum += gpuMemoryRatios[i];
    splits.push(splitSum);
  }
  for (let i = 0; i < numGPUs; i++) {
    splits[i] /= splitSum;
  }

  // Assign each GPU layer to a device using upper_bound
  const layerAssignments: Array<{ layer: number; device: string; gpuIndex: number }> = [];

  // Input layer always on CPU
  // (not counted in the loop, shown separately)

  for (let il = 0; il < nLayer; il++) {
    if (il < iGpuStart) {
      layerAssignments.push({ layer: il, device: 'CPU', gpuIndex: -1 });
    } else {
      const fraction = (il - iGpuStart) / actGpuLayers;
      // upper_bound: find first index where splits[i] > fraction
      let gpuIdx = 0;
      for (let g = 0; g < numGPUs; g++) {
        if (splits[g] > fraction) {
          gpuIdx = g;
          break;
        }
      }
      layerAssignments.push({ layer: il, device: `GPU ${gpuIdx}`, gpuIndex: gpuIdx });
    }
  }

  // Output layer
  if (iGpuStart <= nLayer) {
    // Output goes to GPU
    const fraction = (nLayer - iGpuStart) / actGpuLayers;
    let gpuIdx = 0;
    for (let g = 0; g < numGPUs; g++) {
      if (splits[g] > fraction) {
        gpuIdx = g;
        break;
      }
    }
    layerAssignments.push({ layer: nLayer, device: `GPU ${gpuIdx}`, gpuIndex: gpuIdx });
  } else {
    layerAssignments.push({ layer: nLayer, device: 'CPU', gpuIndex: -1 });
  }

  return { iGpuStart, actGpuLayers, splits, layerAssignments };
}

function LayerBar({
  assignments,
  numGPUs,
  nLayer,
  locale,
}: {
  assignments: Array<{ layer: number; device: string; gpuIndex: number }>;
  numGPUs: number;
  nLayer: number;
  locale: 'zh' | 'en';
}) {
  const l = t[locale];

  // Group consecutive layers by device
  const groups: Array<{ device: string; gpuIndex: number; start: number; end: number; isOutput: boolean }> = [];
  for (const a of assignments) {
    const isOutput = a.layer === nLayer;
    const last = groups[groups.length - 1];
    if (last && last.device === a.device && !last.isOutput && !isOutput) {
      last.end = a.layer;
    } else {
      groups.push({ device: a.device, gpuIndex: a.gpuIndex, start: a.layer, end: a.layer, isOutput });
    }
  }

  const totalSlots = assignments.length;

  return (
    <div className="mt-3">
      <div className="flex rounded-lg overflow-hidden border border-gray-200" style={{ height: '40px' }}>
        {groups.map((g, i) => {
          const count = g.isOutput ? 1 : g.end - g.start + 1;
          const widthPercent = (count / totalSlots) * 100;
          const color = g.gpuIndex >= 0 ? GPU_COLORS[g.gpuIndex % GPU_COLORS.length] : CPU_COLOR;

          let label: string;
          if (g.isOutput) {
            label = l.outputLayer;
          } else if (g.start === g.end) {
            label = `${l.layer} ${g.start}`;
          } else {
            label = `${g.start}-${g.end}`;
          }

          return (
            <motion.div
              key={`${g.device}-${g.start}-${i}`}
              initial={{ width: 0 }}
              animate={{ width: `${widthPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center justify-center text-xs font-medium overflow-hidden"
              style={{
                backgroundColor: color.barBg,
                color: '#ffffff',
                minWidth: widthPercent > 3 ? undefined : '12px',
              }}
              title={`${g.device}: ${label}`}
            >
              {widthPercent > 8 && (
                <span className="truncate px-1">
                  {g.device}: {label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded"
            style={{ backgroundColor: CPU_COLOR.barBg }}
          />
          {l.cpu}
        </span>
        {Array.from({ length: numGPUs }, (_, i) => (
          <span key={i} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ backgroundColor: GPU_COLORS[i % GPU_COLORS.length].barBg }}
            />
            GPU {i}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LlamaCppGPULayerSplit({ locale = 'zh' }: GPULayerSplitProps) {
  const l = t[locale];
  const [nLayer, setNLayer] = useState(32);
  const [nGpuLayers, setNGpuLayers] = useState(24);
  const [numGPUs, setNumGPUs] = useState(1);
  const [gpuMemory, setGpuMemory] = useState<number[]>([12, 8, 6, 4]);

  const { iGpuStart, actGpuLayers, splits, layerAssignments } = useMemo(
    () => computeLayerAllocation(nLayer, nGpuLayers, numGPUs, gpuMemory),
    [nLayer, nGpuLayers, numGPUs, gpuMemory],
  );

  const handleGpuMemoryChange = (index: number, value: number) => {
    setGpuMemory((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{l.title}</h4>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* n_layer slider */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.totalLayers}: <strong>{nLayer}</strong>
          </label>
          <input
            type="range"
            min={4}
            max={80}
            value={nLayer}
            onChange={(e) => {
              const v = Number(e.target.value);
              setNLayer(v);
              if (nGpuLayers > v + 1) setNGpuLayers(v + 1);
            }}
            className="w-full accent-blue-500"
          />
        </div>

        {/* n_gpu_layers slider */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.gpuLayers}: <strong>{nGpuLayers}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={nLayer + 1}
            value={nGpuLayers}
            onChange={(e) => setNGpuLayers(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Number of GPUs */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {l.numGPUs}: <strong>{numGPUs}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={4}
            value={numGPUs}
            onChange={(e) => setNumGPUs(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* GPU Memory ratios (only shown when numGPUs > 1) */}
        {numGPUs > 1 && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {l.gpuMemory} (GB)
            </label>
            <div className="flex gap-2">
              {Array.from({ length: numGPUs }, (_, i) => (
                <div key={i} className="flex-1">
                  <div className="text-xs text-center mb-0.5" style={{ color: GPU_COLORS[i % GPU_COLORS.length].text }}>
                    GPU {i}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={gpuMemory[i]}
                    onChange={(e) => handleGpuMemoryChange(i, Number(e.target.value) || 1)}
                    className="w-full text-center text-xs border rounded px-1 py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formula display */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 font-mono text-xs space-y-1">
        <div>
          <span className="text-gray-500">{l.formula}: </span>
          <span className="text-gray-800">
            {l.iGpuStart} = max({nLayer} + 1 - {nGpuLayers}, 0) ={' '}
            <strong className="text-blue-600">{iGpuStart}</strong>
          </span>
        </div>
        <div>
          <span className="text-gray-500">{l.actGpuLayers}: </span>
          <span className="text-gray-800">
            {nLayer} + 1 - {iGpuStart} ={' '}
            <strong className="text-blue-600">{actGpuLayers}</strong>
          </span>
        </div>
        {numGPUs > 1 && (
          <div>
            <span className="text-gray-500">{l.splits}: </span>
            <span className="text-gray-800">
              [{splits.map((s) => s.toFixed(3)).join(', ')}]
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="text-xs text-gray-500 mb-2">
        {numGPUs > 1 ? l.multiGpuExplanation : l.explanation}
      </div>

      {/* Layer bar visualization */}
      <LayerBar
        assignments={layerAssignments}
        numGPUs={numGPUs}
        nLayer={nLayer}
        locale={locale}
      />

      {/* Detailed table for multi-GPU */}
      {numGPUs > 1 && (
        <div className="mt-3 overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 px-2 text-gray-500">{l.device}</th>
                <th className="text-left py-1 px-2 text-gray-500">{l.layerRange}</th>
                <th className="text-right py-1 px-2 text-gray-500">{l.layers}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Group assignments into device segments
                const segments: Array<{ device: string; gpuIndex: number; layers: number[] }> = [];
                for (const a of layerAssignments) {
                  const last = segments[segments.length - 1];
                  if (last && last.device === a.device) {
                    last.layers.push(a.layer);
                  } else {
                    segments.push({ device: a.device, gpuIndex: a.gpuIndex, layers: [a.layer] });
                  }
                }
                return segments.map((seg, i) => {
                  const color = seg.gpuIndex >= 0 ? GPU_COLORS[seg.gpuIndex % GPU_COLORS.length] : CPU_COLOR;
                  const rangeStr =
                    seg.layers.length === 1
                      ? seg.layers[0] === nLayer
                        ? `Output (${seg.layers[0]})`
                        : `${seg.layers[0]}`
                      : `${seg.layers[0]}-${seg.layers[seg.layers.length - 1]}`;
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1 px-2 font-medium" style={{ color: color.text }}>
                        {seg.device}
                      </td>
                      <td className="py-1 px-2 text-gray-700">{rangeStr}</td>
                      <td className="py-1 px-2 text-right text-gray-700">{seg.layers.length}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
