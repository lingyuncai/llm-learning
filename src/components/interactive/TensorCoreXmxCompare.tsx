// src/components/interactive/TensorCoreXmxCompare.tsx
// Interactive comparison table: NVIDIA Tensor Core vs Intel XMX
import { useState } from 'react';
import { COLORS } from './shared/colors';

interface CompareRow {
  label: string;
  tensorCore: string;
  xmx: string;
  same?: boolean; // true if both are similar
}

const rows: CompareRow[] = [
  {
    label: '厂商 / 架构',
    tensorCore: 'NVIDIA (Hopper, 4th gen)',
    xmx: 'Intel (Xe2, Lunar Lake)',
  },
  {
    label: '内部结构',
    tensorCore: 'Systolic Array 变体',
    xmx: 'Systolic Array (8×8)',
    same: true,
  },
  {
    label: '核心操作',
    tensorCore: 'D = A × B + C (MMA)',
    xmx: 'D = A × B + C (DPAS)',
    same: true,
  },
  {
    label: '矩阵块尺寸 (FP16)',
    tensorCore: 'm16n8k16',
    xmx: 'm8n8k16',
  },
  {
    label: '每 SM/Xe-Core 数量',
    tensorCore: '4 Tensor Core / SM',
    xmx: '8 XMX / Xe-Core',
  },
  {
    label: 'FP16 / BF16',
    tensorCore: '990 TFLOPS (H100 SXM)',
    xmx: '~48 TOPS (Lunar Lake iGPU)',
  },
  {
    label: 'FP8 支持',
    tensorCore: 'Hopper 起 (4th gen)',
    xmx: 'Xe2 起 (Lunar Lake)',
  },
  {
    label: 'FP4 支持',
    tensorCore: 'Blackwell 起 (5th gen)',
    xmx: '尚未支持',
  },
  {
    label: 'TF32 支持',
    tensorCore: 'Ampere 起 (3rd gen)',
    xmx: 'Xe2 起',
  },
  {
    label: '编程接口 (高层)',
    tensorCore: 'CUDA wmma / mma.sync',
    xmx: 'SYCL joint_matrix',
  },
  {
    label: '编程接口 (低层)',
    tensorCore: 'PTX mma 指令',
    xmx: 'ESIMD dpas 指令',
  },
  {
    label: 'Warp/Sub-group 协作',
    tensorCore: '32 线程 warp 协作',
    xmx: '8/16-wide sub-group',
  },
  {
    label: '目标场景',
    tensorCore: '数据中心 AI 训练/推理',
    xmx: '客户端 AI 推理 (iGPU)',
  },
];

export default function TensorCoreXmxCompare() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-gray-600 font-medium w-1/4">
              对比维度
            </th>
            <th className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.purple }}>
              NVIDIA Tensor Core
              <div className="text-xs font-normal text-gray-400">H100 Hopper</div>
            </th>
            <th className="text-center py-2 px-3 font-semibold" style={{ color: COLORS.primary }}>
              Intel XMX
              <div className="text-xs font-normal text-gray-400">Xe2 Lunar Lake</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHoveredRow(ri)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`border-b border-gray-100 transition-colors ${
                hoveredRow === ri ? 'bg-blue-50' : ''
              }`}>
              <td className="py-1.5 px-3 text-gray-700 font-medium">{row.label}</td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.tensorCore}
              </td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.xmx}
                {row.same && <span className="text-green-500 ml-1">(相似)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        两者核心思路相同: systolic array 做 D=A×B+C。主要区别在规模 (数据中心 vs 客户端)、矩阵块尺寸和编程接口。Hover 高亮行。
      </p>
    </div>
  );
}
