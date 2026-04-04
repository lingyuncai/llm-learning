import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface BackendInfo {
  id: string;
  label: string;
  x: number;
  features: string[];
  platform: string;
}

const BACKENDS: BackendInfo[] = [
  {
    id: 'cuda', label: 'CUDA', x: 40,
    features: [
      'NVIDIA GPU 专用',
      'Quantized MatMul 内核',
      'FlashAttention 融合',
      'Tensor Core (FP16)',
      'Stream 并行: 计算+传输重叠',
    ],
    platform: 'NVIDIA GPU (Turing+)',
  },
  {
    id: 'metal', label: 'Metal', x: 170,
    features: [
      'Apple Silicon 专用',
      '统一内存: 无 PCIe 传输',
      'Compute Pipeline + MSL',
      'threadgroup 优化',
      'M1/M2/M3/M4 全系列',
    ],
    platform: 'macOS (Apple Silicon)',
  },
  {
    id: 'vulkan', label: 'Vulkan', x: 300,
    features: [
      '跨平台 GPU 计算',
      'SPIR-V compute shader',
      'AMD / Intel / 移动 GPU',
      '生态较 CUDA 年轻',
      '性能仍在追赶中',
    ],
    platform: 'Windows/Linux/Android',
  },
  {
    id: 'cpu', label: 'CPU', x: 430,
    features: [
      'AVX2 / AVX-512 / NEON',
      'INT4/INT8 SIMD 直算',
      '无需 GPU 即可运行',
      '多线程 (OpenMP)',
      '所有平台通用后备',
    ],
    platform: 'x86 / ARM (所有平台)',
  },
];

export default function BackendArchitecture() {
  const [selected, setSelected] = useState<string | null>(null);
  const selBackend = BACKENDS.find(b => b.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          GGML 多后端架构
        </text>

        <defs>
          <marker id="ba-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Top: unified compute graph */}
        <rect x={170} y={35} width={240} height={35} rx={8}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={290} y={57} textAnchor="middle" fontSize="10" fontWeight="700"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          GGML 计算图 (统一)
        </text>

        {/* Scheduler */}
        <rect x={200} y={85} width={180} height={25} rx={5}
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
        <text x={290} y={101} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>ggml_backend_sched (调度器)</text>

        {/* Fork arrows */}
        {BACKENDS.map(b => (
          <line key={b.id} x1={290} y1={110} x2={b.x + 55} y2={135}
            stroke="#94a3b8" strokeWidth={1} markerEnd="url(#ba-arr)" />
        ))}

        {/* Backend boxes */}
        {BACKENDS.map(b => (
          <g key={b.id} onClick={() => setSelected(selected === b.id ? null : b.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={b.x} y={135} width={110} height={45} rx={6}
              fill={selected === b.id ? '#fed7aa' : '#fef3c7'}
              stroke={COLORS.orange}
              strokeWidth={selected === b.id ? 2.5 : 1.2} />
            <text x={b.x + 55} y={155} textAnchor="middle" fontSize="9"
              fontWeight="700" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {b.label}
            </text>
            <text x={b.x + 55} y={170} textAnchor="middle" fontSize="6.5"
              fill={COLORS.mid} fontFamily={FONTS.sans}>
              {b.platform}
            </text>
          </g>
        ))}

        {/* Note */}
        <text x={W / 2} y={210} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          全部橙色: 这些后端都属于 llama.cpp/GGML (C/C++) | 点击后端查看特性
        </text>
      </svg>

      {selBackend && (
        <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm">
          <p className="font-semibold text-orange-700 mb-1">{selBackend.label}</p>
          <ul className="space-y-0.5 text-gray-600 text-xs">
            {selBackend.features.map((f, i) => (
              <li key={i}>- {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
