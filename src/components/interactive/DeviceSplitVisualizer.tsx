import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 280;

// Qwen3-8B: 32 layers, ~4.9 GB Q4_K_M, each layer ~0.14 GB
const TOTAL_LAYERS = 32;
const LAYER_SIZE_GB = 0.14;
const EMBEDDING_SIZE_GB = 0.3; // embedding + output head
const KV_CACHE_PER_LAYER_GB = 0.05; // rough estimate for 2048 context

export default function DeviceSplitVisualizer() {
  const [vramGB, setVramGB] = useState(6);

  const availableForLayers = Math.max(0, vramGB - EMBEDDING_SIZE_GB);
  const gpuLayers = Math.min(TOTAL_LAYERS,
    Math.floor(availableForLayers / (LAYER_SIZE_GB + KV_CACHE_PER_LAYER_GB)));
  const cpuLayers = TOTAL_LAYERS - gpuLayers;

  const layerW = (W - 100) / TOTAL_LAYERS;
  const layerY = 100;
  const layerH = 80;

  // Rough performance estimate
  const baseTokensPerSec = 120; // all GPU
  const cpuPenaltyPerLayer = 3; // tokens/s loss per CPU layer
  const estimatedTps = Math.max(5, baseTokensPerSec - cpuLayers * cpuPenaltyPerLayer);

  return (
    <div>
      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-xs text-gray-600">GPU VRAM:</span>
        <input type="range" min={0} max={24} step={0.5} value={vramGB}
          onChange={e => setVramGB(parseFloat(e.target.value))}
          className="w-48" />
        <span className="text-sm font-semibold text-gray-700">{vramGB} GB</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          设备分割: Qwen3-8B Q4_K_M ({TOTAL_LAYERS} layers)
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          GPU: {gpuLayers} layers | CPU: {cpuLayers} layers | 预估: ~{estimatedTps} tok/s
        </text>

        {/* Layer labels */}
        <text x={50 + gpuLayers * layerW / 2} y={layerY - 8} textAnchor="middle"
          fontSize="7" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
          GPU ({gpuLayers} layers, {(gpuLayers * LAYER_SIZE_GB).toFixed(1)} GB)
        </text>
        {cpuLayers > 0 && (
          <text x={50 + gpuLayers * layerW + cpuLayers * layerW / 2} y={layerY - 8}
            textAnchor="middle" fontSize="7" fontWeight="600" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            CPU ({cpuLayers} layers)
          </text>
        )}

        {/* Layers */}
        {Array.from({ length: TOTAL_LAYERS }, (_, i) => {
          const isGpu = i < gpuLayers;
          return (
            <rect key={i} x={50 + i * layerW} y={layerY} width={layerW - 1} height={layerH}
              rx={1} fill={isGpu ? '#dcfce7' : '#f1f5f9'}
              stroke={isGpu ? COLORS.green : '#d1d5db'} strokeWidth={0.5} />
          );
        })}

        {/* Layer numbers (every 4th) */}
        {Array.from({ length: TOTAL_LAYERS }, (_, i) => {
          if (i % 4 !== 0 && i !== TOTAL_LAYERS - 1) return null;
          return (
            <text key={i} x={50 + i * layerW + layerW / 2} y={layerY + layerH + 12}
              textAnchor="middle" fontSize="5" fill={COLORS.mid} fontFamily={FONTS.mono}>
              {i}
            </text>
          );
        })}

        {/* Split line */}
        {gpuLayers < TOTAL_LAYERS && gpuLayers > 0 && (
          <g>
            <line x1={50 + gpuLayers * layerW} y1={layerY - 3}
              x2={50 + gpuLayers * layerW} y2={layerY + layerH + 3}
              stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4,2" />
            <text x={50 + gpuLayers * layerW} y={layerY + layerH + 25}
              textAnchor="middle" fontSize="6" fill={COLORS.red} fontFamily={FONTS.sans}>
              PCIe 边界
            </text>
          </g>
        )}

        {/* Performance note */}
        <rect x={100} y={H - 45} width={380} height={30} rx={5}
          fill={cpuLayers === 0 ? '#f0fdf4' : cpuLayers > 16 ? '#fef2f2' : '#fffbeb'}
          stroke={cpuLayers === 0 ? COLORS.green : cpuLayers > 16 ? COLORS.red : COLORS.orange}
          strokeWidth={0.8} />
        <text x={290} y={H - 25} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={cpuLayers === 0 ? COLORS.green : cpuLayers > 16 ? COLORS.red : COLORS.orange}
          fontFamily={FONTS.sans}>
          {cpuLayers === 0 ? '全 GPU: 最佳性能, 无 PCIe 瓶颈' :
           cpuLayers > 16 ? '大部分 CPU: 性能严重受限于内存带宽' :
           `混合模式: 每次 decode 需跨 PCIe 传输 ${cpuLayers} 层的中间结果`}
        </text>
      </svg>
    </div>
  );
}
