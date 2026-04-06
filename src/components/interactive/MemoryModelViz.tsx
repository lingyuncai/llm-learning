import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const MemoryModelViz: React.FC = () => {
  const [mode, setMode] = useState<'host' | 'device' | 'shared'>('shared');

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 340" className="w-full">
        {/* Title */}
        <text x="290" y="20" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.dark} fontWeight="700" textAnchor="middle">
          iGPU 统一内存模型：Host / Device / Shared (USM)
        </text>

        {/* Mode selector */}
        <g onClick={() => setMode('host')} style={{ cursor: 'pointer' }}>
          <rect
            x="140"
            y="35"
            width="80"
            height="26"
            fill={mode === 'host' ? COLORS.primary : COLORS.light}
            stroke={COLORS.primary}
            strokeWidth={mode === 'host' ? '2' : '1'}
            rx="4"
          />
          <text
            x="180"
            y="52"
            fontFamily={FONTS.sans}
            fontSize="11"
            fill={mode === 'host' ? COLORS.bg : COLORS.mid}
            fontWeight={mode === 'host' ? '600' : '400'}
            textAnchor="middle"
          >
            Host
          </text>
        </g>

        <g onClick={() => setMode('device')} style={{ cursor: 'pointer' }}>
          <rect
            x="240"
            y="35"
            width="80"
            height="26"
            fill={mode === 'device' ? COLORS.primary : COLORS.light}
            stroke={COLORS.primary}
            strokeWidth={mode === 'device' ? '2' : '1'}
            rx="4"
          />
          <text
            x="280"
            y="52"
            fontFamily={FONTS.sans}
            fontSize="11"
            fill={mode === 'device' ? COLORS.bg : COLORS.mid}
            fontWeight={mode === 'device' ? '600' : '400'}
            textAnchor="middle"
          >
            Device
          </text>
        </g>

        <g onClick={() => setMode('shared')} style={{ cursor: 'pointer' }}>
          <rect
            x="340"
            y="35"
            width="80"
            height="26"
            fill={mode === 'shared' ? COLORS.primary : COLORS.light}
            stroke={COLORS.primary}
            strokeWidth={mode === 'shared' ? '2' : '1'}
            rx="4"
          />
          <text
            x="380"
            y="52"
            fontFamily={FONTS.sans}
            fontSize="11"
            fill={mode === 'shared' ? COLORS.bg : COLORS.mid}
            fontWeight={mode === 'shared' ? '600' : '400'}
            textAnchor="middle"
          >
            Shared
          </text>
        </g>

        {/* CPU Box */}
        <rect x="50" y="90" width="140" height="80" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
        <text x="120" y="120" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.primary} fontWeight="700" textAnchor="middle">
          CPU
        </text>
        <text x="120" y="140" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle">
          Core i7-1370P
        </text>
        <text x="120" y="156" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
          14 cores
        </text>

        {/* GPU Box */}
        <rect x="390" y="90" width="140" height="80" fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="2" rx="4" />
        <text x="460" y="120" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.green} fontWeight="700" textAnchor="middle">
          iGPU
        </text>
        <text x="460" y="140" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle">
          Xe2-LPG
        </text>
        <text x="460" y="156" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
          8 Xe cores
        </text>

        {/* System Memory */}
        <rect x="50" y="210" width="480" height="60" fill={COLORS.orange} opacity="0.15" stroke={COLORS.orange} strokeWidth="2" rx="4" />
        <text x="290" y="235" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.orange} fontWeight="700" textAnchor="middle">
          统一系统内存 (LPDDR5x)
        </text>
        <text x="290" y="255" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle">
          CPU 与 iGPU 共享物理内存，无独立显存
        </text>

        {/* Connection lines based on mode */}
        {mode === 'host' && (
          <>
            {/* CPU to Memory - solid */}
            <path d="M 120 170 L 120 210" stroke={COLORS.primary} strokeWidth="3" markerEnd="url(#arrow-solid)" />
            <text x="130" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.primary} fontWeight="600">
              快速
            </text>
            <defs>
              <marker id="arrow-solid" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* GPU to Memory - dashed */}
            <path d="M 460 170 L 460 210" stroke={COLORS.green} strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-dash)" />
            <text x="390" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green}>
              cache coherent
            </text>
            <defs>
              <marker id="arrow-dash" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>
          </>
        )}

        {mode === 'device' && (
          <>
            {/* CPU to Memory - dashed */}
            <path d="M 120 170 L 120 210" stroke={COLORS.primary} strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-dash-cpu)" />
            <text x="130" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.red}>
              慢
            </text>
            <defs>
              <marker id="arrow-dash-cpu" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* GPU to Memory - solid */}
            <path d="M 460 170 L 460 210" stroke={COLORS.green} strokeWidth="3" markerEnd="url(#arrow-solid-gpu)" />
            <text x="470" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green} fontWeight="600">
              优化
            </text>
            <defs>
              <marker id="arrow-solid-gpu" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>
          </>
        )}

        {mode === 'shared' && (
          <>
            {/* CPU to Memory - solid */}
            <path d="M 120 170 L 120 210" stroke={COLORS.primary} strokeWidth="3" markerEnd="url(#arrow-shared-cpu)" />
            <text x="130" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.primary} fontWeight="600">
              直接
            </text>
            <defs>
              <marker id="arrow-shared-cpu" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* GPU to Memory - solid */}
            <path d="M 460 170 L 460 210" stroke={COLORS.green} strokeWidth="3" markerEnd="url(#arrow-shared-gpu)" />
            <text x="470" y="192" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green} fontWeight="600">
              直接
            </text>
            <defs>
              <marker id="arrow-shared-gpu" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>

            {/* Zero-copy highlight */}
            <rect x="210" y="180" width="160" height="20" fill={COLORS.highlight} opacity="0.5" rx="3" />
            <text x="290" y="194" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.orange} fontWeight="700" textAnchor="middle">
              零拷贝！
            </text>
          </>
        )}

        {/* Description box */}
        <rect x="30" y="290" width="520" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
        <text x="290" y="305" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
          {mode === 'host' && 'Host: CPU 优化，GPU 通过 cache coherence 访问 (适合 CPU 主导计算)'}
          {mode === 'device' && 'Device: GPU 优化，CPU 访问慢 (适合 GPU 密集计算，结果稀疏)'}
          {mode === 'shared' && 'Shared (USM): 零拷贝！iGPU 独特优势，CPU/GPU 直接访问共享内存'}
        </text>
        <text x="290" y="320" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
          {mode === 'host' && 'API: zeMemAllocHost() — CPU 可见，GPU cache coherent'}
          {mode === 'device' && 'API: zeMemAllocDevice() — GPU 本地内存 (iGPU 仍是系统内存，但标记为 GPU 优先)'}
          {mode === 'shared' && 'API: zeMemAllocShared() — 统一地址空间，迁移引擎自动优化页面位置'}
        </text>
      </svg>
    </div>
  );
};

export default MemoryModelViz;
