// src/components/interactive/SmResourceTable.tsx
// Interactive comparison table: SM resources across GPU generations
import { useState } from 'react';
import { COLORS } from './shared/colors';

interface GenSpec {
  name: string;
  year: number;
  smsPerGpu: string;
  fp32Cores: number;
  int32Cores: number;
  tensorCores: string;
  tensorGen: string;
  regFile: string;
  sharedMem: string;
  l1Cache: string;
  maxWarps: number;
  maxThreads: number;
}

const generations: GenSpec[] = [
  {
    name: 'Ampere (A100)', year: 2020, smsPerGpu: '108',
    fp32Cores: 64, int32Cores: 32, tensorCores: '4 (3rd gen)', tensorGen: 'FP16/BF16/TF32/INT8/INT4',
    regFile: '256 KB', sharedMem: '164 KB', l1Cache: '192 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
  {
    name: 'Hopper (H100)', year: 2022, smsPerGpu: '132',
    fp32Cores: 128, int32Cores: 64, tensorCores: '4 (4th gen)', tensorGen: 'FP16/BF16/TF32/FP8/INT8',
    regFile: '256 KB', sharedMem: '228 KB', l1Cache: '256 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
  {
    name: 'Blackwell (B200)', year: 2024, smsPerGpu: '192',
    fp32Cores: 128, int32Cores: 64, tensorCores: '4 (5th gen)', tensorGen: 'FP16/BF16/TF32/FP8/FP4/INT8',
    regFile: '256 KB', sharedMem: '228 KB', l1Cache: '256 KB 共享',
    maxWarps: 64, maxThreads: 2048,
  },
];

const rows: { label: string; key: keyof GenSpec; highlight?: boolean }[] = [
  { label: 'GPU 中 SM 数量', key: 'smsPerGpu' },
  { label: 'FP32 Core / SM', key: 'fp32Cores', highlight: true },
  { label: 'INT32 Core / SM', key: 'int32Cores' },
  { label: 'Tensor Core / SM', key: 'tensorCores', highlight: true },
  { label: 'Tensor Core 精度', key: 'tensorGen', highlight: true },
  { label: 'Register File / SM', key: 'regFile' },
  { label: 'Shared Memory / SM', key: 'sharedMem', highlight: true },
  { label: 'L1 Cache / SM', key: 'l1Cache' },
  { label: 'Max Warps / SM', key: 'maxWarps' },
  { label: 'Max Threads / SM', key: 'maxThreads' },
];

export default function SmResourceTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-gray-600 font-medium w-1/4">资源</th>
            {generations.map((g, i) => (
              <th key={i} className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.primary }}>
                {g.name}
                <div className="text-xs font-normal text-gray-400">{g.year}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isHovered = hoveredRow === ri;
            const vals = generations.map(g => String(g[row.key]));
            const allSame = vals.every(v => v === vals[0]);
            return (
              <tr key={ri}
                onMouseEnter={() => setHoveredRow(ri)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-gray-100 transition-colors ${isHovered ? 'bg-blue-50' : ''}`}>
                <td className="py-1.5 px-3 text-gray-700 font-medium">{row.label}</td>
                {vals.map((v, gi) => {
                  const changed = gi > 0 && v !== vals[gi - 1];
                  return (
                    <td key={gi} className={`py-1.5 px-3 text-center font-mono text-xs ${changed ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                      {v}
                      {changed && <span className="text-green-500 ml-1">↑</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">绿色箭头 ↑ 表示相比前一代有变化。Hover 高亮行。</p>
    </div>
  );
}
