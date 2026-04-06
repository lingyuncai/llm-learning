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

export default function TensorCoreXmxCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const t = {
    zh: {
      dimension: '对比维度',
      similar: '(相似)',
      footer: '两者核心思路相同: systolic array 做 D=A×B+C。主要区别在规模 (数据中心 vs 客户端)、矩阵块尺寸和编程接口。Hover 高亮行。',
      rows: [
        { label: '厂商 / 架构', tc: 'NVIDIA (Hopper, 4th gen)', xmx: 'Intel (Xe2, Lunar Lake)' },
        { label: '内部结构', tc: 'Systolic Array 变体', xmx: 'Systolic Array (8×8)', same: true },
        { label: '核心操作', tc: 'D = A × B + C (MMA)', xmx: 'D = A × B + C (DPAS)', same: true },
        { label: '矩阵块尺寸 (FP16)', tc: 'm16n8k16', xmx: 'm8n8k16' },
        { label: '每 SM/Xe-Core 数量', tc: '4 Tensor Core / SM', xmx: '8 XMX / Xe-Core' },
        { label: 'FP16 / BF16', tc: '990 TFLOPS (H100 SXM)', xmx: '~48 TOPS (Lunar Lake iGPU)' },
        { label: 'FP8 支持', tc: 'Hopper 起 (4th gen)', xmx: 'Xe2 起 (Lunar Lake)' },
        { label: 'FP4 支持', tc: 'Blackwell 起 (5th gen)', xmx: '尚未支持' },
        { label: 'TF32 支持', tc: 'Ampere 起 (3rd gen)', xmx: 'Xe2 起' },
        { label: '编程接口 (高层)', tc: 'CUDA wmma / mma.sync', xmx: 'SYCL joint_matrix' },
        { label: '编程接口 (低层)', tc: 'PTX mma 指令', xmx: 'ESIMD dpas 指令' },
        { label: 'Warp/Sub-group 协作', tc: '32 线程 warp 协作', xmx: '8/16-wide sub-group' },
        { label: '目标场景', tc: '数据中心 AI 训练/推理', xmx: '客户端 AI 推理 (iGPU)' },
      ],
    },
    en: {
      dimension: 'Comparison Dimension',
      similar: '(similar)',
      footer: 'Both share core design: systolic array performs D=A×B+C. Main differences: scale (datacenter vs client), matrix tile size, and programming interface. Hover to highlight row.',
      rows: [
        { label: 'Vendor / Architecture', tc: 'NVIDIA (Hopper, 4th gen)', xmx: 'Intel (Xe2, Lunar Lake)' },
        { label: 'Internal Structure', tc: 'Systolic Array variant', xmx: 'Systolic Array (8×8)', same: true },
        { label: 'Core Operation', tc: 'D = A × B + C (MMA)', xmx: 'D = A × B + C (DPAS)', same: true },
        { label: 'Matrix Tile Size (FP16)', tc: 'm16n8k16', xmx: 'm8n8k16' },
        { label: 'Count per SM/Xe-Core', tc: '4 Tensor Core / SM', xmx: '8 XMX / Xe-Core' },
        { label: 'FP16 / BF16', tc: '990 TFLOPS (H100 SXM)', xmx: '~48 TOPS (Lunar Lake iGPU)' },
        { label: 'FP8 Support', tc: 'Hopper+ (4th gen)', xmx: 'Xe2+ (Lunar Lake)' },
        { label: 'FP4 Support', tc: 'Blackwell+ (5th gen)', xmx: 'Not yet' },
        { label: 'TF32 Support', tc: 'Ampere+ (3rd gen)', xmx: 'Xe2+' },
        { label: 'Programming API (High)', tc: 'CUDA wmma / mma.sync', xmx: 'SYCL joint_matrix' },
        { label: 'Programming API (Low)', tc: 'PTX mma instruction', xmx: 'ESIMD dpas instruction' },
        { label: 'Warp/Sub-group Cooperation', tc: '32-thread warp', xmx: '8/16-wide sub-group' },
        { label: 'Target Scenario', tc: 'Datacenter AI training/inference', xmx: 'Client AI inference (iGPU)' },
      ],
    },
  }[locale];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-gray-600 font-medium w-1/4">
              {t.dimension}
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
          {t.rows.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHoveredRow(ri)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`border-b border-gray-100 transition-colors ${
                hoveredRow === ri ? 'bg-blue-50' : ''
              }`}>
              <td className="py-1.5 px-3 text-gray-700 font-medium">{row.label}</td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.tc}
              </td>
              <td className="py-1.5 px-3 text-center font-mono text-xs text-gray-600">
                {row.xmx}
                {row.same && <span className="text-green-500 ml-1">{t.similar}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        {t.footer}
      </p>
    </div>
  );
}
