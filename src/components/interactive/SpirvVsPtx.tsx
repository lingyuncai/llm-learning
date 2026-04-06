import React from 'react';
import { COLORS, FONTS } from './shared/colors';

const SpirvVsPtx: React.FC = () => {
  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 380" className="w-full">
        {/* Title */}
        <text x="290" y="20" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.dark} fontWeight="700" textAnchor="middle">
          编译链对比：SPIR-V (Intel) vs PTX (NVIDIA)
        </text>

        {/* Intel Pipeline (Left) */}
        <text x="145" y="50" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.primary} fontWeight="700" textAnchor="middle">
          Intel DPC++/SYCL
        </text>

        {/* Stage 1: Source */}
        <rect x="70" y="65" width="150" height="35" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
        <text x="145" y="87" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          DPC++/SYCL
        </text>

        {/* Arrow */}
        <path d="M 145 100 L 145 115" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-intel)" />
        <defs>
          <marker id="arrow-intel" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Stage 2: Clang */}
        <rect x="70" y="115" width="150" height="35" fill={COLORS.primary} opacity="0.2" stroke={COLORS.primary} strokeWidth="1.5" rx="4" />
        <text x="145" y="137" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          Clang Frontend
        </text>

        {/* Arrow */}
        <path d="M 145 150 L 145 165" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-intel)" />

        {/* Stage 3: LLVM IR */}
        <rect x="70" y="165" width="150" height="35" fill={COLORS.orange} opacity="0.2" stroke={COLORS.orange} strokeWidth="1.5" rx="4" />
        <text x="145" y="187" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          LLVM IR
        </text>

        {/* Arrow */}
        <path d="M 145 200 L 145 215" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-intel)" />

        {/* Stage 4: SPIR-V */}
        <rect x="70" y="215" width="150" height="35" fill={COLORS.primary} opacity="0.25" stroke={COLORS.primary} strokeWidth="2" rx="4" />
        <text x="145" y="233" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600" textAnchor="middle">
          SPIR-V
        </text>
        <text x="145" y="246" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
          Khronos 标准
        </text>

        {/* Arrow */}
        <path d="M 145 250 L 145 265" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-intel)" />

        {/* Stage 5: IGC */}
        <rect x="70" y="265" width="150" height="35" fill={COLORS.purple} opacity="0.2" stroke={COLORS.purple} strokeWidth="1.5" rx="4" />
        <text x="145" y="287" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          IGC (JIT)
        </text>

        {/* Arrow */}
        <path d="M 145 300 L 145 315" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-intel)" />

        {/* Stage 6: Xe2 ISA */}
        <rect x="70" y="315" width="150" height="35" fill={COLORS.primary} opacity="0.3" stroke={COLORS.primary} strokeWidth="2" rx="4" />
        <text x="145" y="337" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600" textAnchor="middle">
          Xe2 ISA
        </text>

        {/* NVIDIA Pipeline (Right) */}
        <text x="435" y="50" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.green} fontWeight="700" textAnchor="middle">
          NVIDIA CUDA
        </text>

        {/* Stage 1: Source */}
        <rect x="360" y="65" width="150" height="35" fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="2" rx="4" />
        <text x="435" y="87" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          CUDA C++
        </text>

        {/* Arrow */}
        <path d="M 435 100 L 435 115" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-nvidia)" />
        <defs>
          <marker id="arrow-nvidia" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
          </marker>
        </defs>

        {/* Stage 2: NVCC */}
        <rect x="360" y="115" width="150" height="35" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeWidth="1.5" rx="4" />
        <text x="435" y="137" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          NVCC Frontend
        </text>

        {/* Arrow */}
        <path d="M 435 150 L 435 165" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-nvidia)" />

        {/* Stage 3: LLVM IR */}
        <rect x="360" y="165" width="150" height="35" fill={COLORS.orange} opacity="0.2" stroke={COLORS.orange} strokeWidth="1.5" rx="4" />
        <text x="435" y="187" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          LLVM IR
        </text>

        {/* Arrow */}
        <path d="M 435 200 L 435 215" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-nvidia)" />

        {/* Stage 4: PTX */}
        <rect x="360" y="215" width="150" height="35" fill={COLORS.green} opacity="0.25" stroke={COLORS.green} strokeWidth="2" rx="4" />
        <text x="435" y="233" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600" textAnchor="middle">
          PTX
        </text>
        <text x="435" y="246" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
          NVIDIA 专有
        </text>

        {/* Arrow */}
        <path d="M 435 250 L 435 265" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-nvidia)" />

        {/* Stage 5: ptxas */}
        <rect x="360" y="265" width="150" height="35" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeWidth="1.5" rx="4" />
        <text x="435" y="287" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle">
          ptxas
        </text>

        {/* Arrow */}
        <path d="M 435 300 L 435 315" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrow-nvidia)" />

        {/* Stage 6: SASS */}
        <rect x="360" y="315" width="150" height="35" fill={COLORS.green} opacity="0.3" stroke={COLORS.green} strokeWidth="2" rx="4" />
        <text x="435" y="337" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600" textAnchor="middle">
          SASS
        </text>

        {/* Horizontal connection lines (dashed) */}
        <line x1="220" y1="82" x2="360" y2="82" stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
        <line x1="220" y1="182" x2="360" y2="182" stroke={COLORS.orange} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
        <line x1="220" y1="232" x2="360" y2="232" stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
        <line x1="220" y1="332" x2="360" y2="332" stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />

        {/* Callout box */}
        <rect x="30" y="362" width="520" height="15" fill={COLORS.highlight} opacity="0.3" rx="3" />
        <text x="290" y="372" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark} textAnchor="middle">
          SPIR-V 是 Khronos 开放标准，支持多厂商 GPU；PTX 是 NVIDIA 专有格式，仅限自家硬件
        </text>
      </svg>
    </div>
  );
};

export default SpirvVsPtx;
