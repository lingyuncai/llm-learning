// src/components/interactive/ShaderKernelPathway.tsx
// Static SVG diagram: two parallel API paths to the same GPU hardware
import { COLORS, FONTS } from './shared/colors';

const W = 520;
const H = 260;

const COL_L = 130;
const COL_R = 390;
const BOX_W = 200;
const BOX_H = 32;
const ROW_Y = [40, 95, 150, 200, 240];

export default function ShaderKernelPathway({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      computeAPI: 'Compute API 通道',
      graphicsAPI: 'Graphics API 通道',
      cudaKernel: 'CUDA Kernel / OpenCL Kernel',
      cudaSub: '源码：.cu / .cl 文件',
      cudaRuntime: 'CUDA Runtime / OpenCL Runtime',
      cudaRuntimeSub: '专为通用计算设计',
      computeShader: 'Compute Shader',
      computeShaderSub: '源码：GLSL / HLSL / WGSL / Metal SL',
      vulkan: 'Vulkan / Metal / DirectX 12',
      vulkanSub: 'Graphics API 的 Compute Pipeline',
      gpuDriver: 'GPU Driver',
      gpuHardware: 'GPU Hardware (SM / CU) — 完全相同的硬件',
      annotation: '两条通道最终在同一个硬件上执行同样的并行计算',
    },
    en: {
      computeAPI: 'Compute API Path',
      graphicsAPI: 'Graphics API Path',
      cudaKernel: 'CUDA Kernel / OpenCL Kernel',
      cudaSub: 'Source: .cu / .cl files',
      cudaRuntime: 'CUDA Runtime / OpenCL Runtime',
      cudaRuntimeSub: 'Designed for general-purpose compute',
      computeShader: 'Compute Shader',
      computeShaderSub: 'Source: GLSL / HLSL / WGSL / Metal SL',
      vulkan: 'Vulkan / Metal / DirectX 12',
      vulkanSub: 'Graphics API Compute Pipeline',
      gpuDriver: 'GPU Driver',
      gpuHardware: 'GPU Hardware (SM / CU) — Same Hardware',
      annotation: 'Both paths execute the same parallel computation on identical hardware',
    },
  }[locale];

  function Box({ x, y, label, sub, color, bg }: {
    x: number; y: number; label: string; sub?: string; color: string; bg: string;
  }) {
    return (
      <g>
        <rect x={x - BOX_W / 2} y={y - BOX_H / 2} width={BOX_W} height={BOX_H}
          rx={6} fill={bg} stroke={color} strokeWidth={1.5} />
        <text x={x} y={sub ? y - 4 : y + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontWeight="600" fill={color} fontFamily={FONTS.sans}>
          {label}
        </text>
        {sub && (
          <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
            {sub}
          </text>
        )}
      </g>
    );
  }

  function VLine({ x, y1, y2, color = '#94a3b8' }: { x: number; y1: number; y2: number; color?: string }) {
    return <line x1={x} y1={y1 + BOX_H / 2 + 2} x2={x} y2={y2 - BOX_H / 2 - 2}
      stroke={color} strokeWidth={1.5} />;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Compute API vs Graphics API dual pathway to GPU">

      {/* Column headers */}
      <text x={COL_L} y={14} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.computeAPI}
      </text>
      <text x={COL_R} y={14} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.graphicsAPI}
      </text>

      {/* Left column */}
      <Box x={COL_L} y={ROW_Y[0]} label={t.cudaKernel}
        sub={t.cudaSub} color={COLORS.primary} bg="#dbeafe" />
      <VLine x={COL_L} y1={ROW_Y[0]} y2={ROW_Y[1]} color={COLORS.primary} />
      <Box x={COL_L} y={ROW_Y[1]} label={t.cudaRuntime}
        sub={t.cudaRuntimeSub} color={COLORS.primary} bg="#eff6ff" />

      {/* Right column */}
      <Box x={COL_R} y={ROW_Y[0]} label={t.computeShader}
        sub={t.computeShaderSub} color={COLORS.green} bg="#dcfce7" />
      <VLine x={COL_R} y1={ROW_Y[0]} y2={ROW_Y[1]} color={COLORS.green} />
      <Box x={COL_R} y={ROW_Y[1]} label={t.vulkan}
        sub={t.vulkanSub} color={COLORS.green} bg="#f0fdf4" />

      {/* Converge lines to shared Driver */}
      <line x1={COL_L} y1={ROW_Y[1] + BOX_H / 2 + 2} x2={W / 2 - 30} y2={ROW_Y[2] - BOX_H / 2 - 2}
        stroke={COLORS.primary} strokeWidth={1.5} />
      <line x1={COL_R} y1={ROW_Y[1] + BOX_H / 2 + 2} x2={W / 2 + 30} y2={ROW_Y[2] - BOX_H / 2 - 2}
        stroke={COLORS.green} strokeWidth={1.5} />

      {/* Shared layers */}
      <Box x={W / 2} y={ROW_Y[2]} label={t.gpuDriver} color="#546e7a" bg="#f1f5f9" />
      <VLine x={W / 2} y1={ROW_Y[2]} y2={ROW_Y[3]} />

      {/* Hardware */}
      <rect x={W / 2 - BOX_W / 2 - 20} y={ROW_Y[3] - BOX_H / 2} width={BOX_W + 40} height={BOX_H}
        rx={6} fill="#f8fafc" stroke="#37474f" strokeWidth={2} strokeDasharray="4 2" />
      <text x={W / 2} y={ROW_Y[3] + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill="#37474f" fontFamily={FONTS.sans}>
        {t.gpuHardware}
      </text>

      {/* Annotation */}
      <text x={W / 2} y={ROW_Y[4]} textAnchor="middle" fontSize="9"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        {t.annotation}
      </text>
    </svg>
  );
}
