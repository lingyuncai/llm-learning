import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Format = 'nchw' | 'nchw16c' | 'nchw32c';

const MemoryFormatViz: React.FC = () => {
  const [format, setFormat] = useState<Format>('nchw');

  // Tensor: N=1, C=32, H=4, W=4
  const N = 1, C = 32, H = 4, W = 4;

  const getColor = (channelIdx: number) => {
    const hue = (channelIdx * 360) / C;
    return `hsl(${hue}, 70%, 65%)`;
  };

  const renderNCHW = () => {
    // Sequential channels: C0[H×W], C1[H×W], ..., C31[H×W]
    const cellSize = 12;
    const gap = 2;
    const cells: JSX.Element[] = [];
    let y = 40;

    for (let c = 0; c < Math.min(C, 8); c++) {
      // Show only first 8 channels for clarity
      for (let h = 0; h < H; h++) {
        for (let w = 0; w < W; w++) {
          const x = 20 + w * (cellSize + gap);
          const cy = y + h * (cellSize + gap);
          cells.push(
            <rect
              key={`${c}-${h}-${w}`}
              x={x}
              y={cy}
              width={cellSize}
              height={cellSize}
              fill={getColor(c)}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        }
      }
      // Label
      cells.push(
        <text
          key={`label-${c}`}
          x={85}
          y={y + (H * (cellSize + gap)) / 2 + 4}
          fontSize="10"
          fill={COLORS.mid}
        >
          C{c}
        </text>
      );
      y += H * (cellSize + gap) + 8;
    }

    cells.push(
      <text key="ellipsis" x={40} y={y + 5} fontSize="10" fill={COLORS.mid}>
        ... (C8-C31)
      </text>
    );

    return cells;
  };

  const renderNCHW16C = () => {
    // 2 groups of 16 channels: [C0-C15], [C16-C31]
    // Each H×W position has 16 consecutive channels
    const cellSize = 11;
    const gap = 1.5;
    const groupGap = 20;
    const cells: JSX.Element[] = [];

    for (let group = 0; group < 2; group++) {
      const offsetX = group * (16 * (cellSize + gap) + groupGap);
      // Show 4×4 spatial grid
      for (let h = 0; h < H; h++) {
        for (let w = 0; w < W; w++) {
          const baseX = 20 + offsetX + w * (16 * (cellSize + gap) + 4);
          const baseY = 40 + h * (cellSize + gap) + 8;

          // 16 channels packed
          for (let c = 0; c < 16; c++) {
            const channelIdx = group * 16 + c;
            cells.push(
              <rect
                key={`${group}-${h}-${w}-${c}`}
                x={baseX + c * (cellSize + gap)}
                y={baseY}
                width={cellSize}
                height={cellSize}
                fill={getColor(channelIdx)}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          }
        }
      }

      // Group label
      cells.push(
        <text
          key={`group-${group}`}
          x={20 + offsetX + 80}
          y={30}
          fontSize="11"
          fontWeight="600"
          fill={COLORS.primary}
          textAnchor="middle"
        >
          C{group * 16}-C{group * 16 + 15}
        </text>
      );
    }

    return cells;
  };

  const renderNCHW32C = () => {
    // 1 group of 32 channels
    // Each H×W position has 32 consecutive channels
    const cellSize = 8;
    const gap = 1;
    const cells: JSX.Element[] = [];

    for (let h = 0; h < H; h++) {
      for (let w = 0; w < W; w++) {
        const baseX = 20 + w * (32 * (cellSize + gap) + 6);
        const baseY = 40 + h * (cellSize + gap) + 10;

        // 32 channels packed
        for (let c = 0; c < 32; c++) {
          cells.push(
            <rect
              key={`${h}-${w}-${c}`}
              x={baseX + c * (cellSize + gap)}
              y={baseY}
              width={cellSize}
              height={cellSize}
              fill={getColor(c)}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        }
      }
    }

    cells.push(
      <text key="label" x={290} y={30} fontSize="11" fontWeight="600" fill={COLORS.primary} textAnchor="middle">
        C0-C31 (全部 32 个通道打包)
      </text>
    );

    return cells;
  };

  const getDescription = () => {
    switch (format) {
      case 'nchw':
        return '标准布局：通道按顺序排列，每个通道存储完整的 H×W 特征图。适合通道间操作，但向量化效率低。';
      case 'nchw16c':
        return 'Blocked 布局：16 个通道打包为一组，H×W 位置的 16 通道连续存储。SIMD16 友好，EU 执行单元可一次加载向量。';
      case 'nchw32c':
        return 'Blocked 布局：32 个通道打包为一组，最适合 XMX (Xe Matrix Extensions) 和 SIMD32。内存访问与计算单元完美对齐。';
    }
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Memory Format 可视化</h3>

      {/* Format selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFormat('nchw')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            format === 'nchw'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          NCHW
        </button>
        <button
          onClick={() => setFormat('nchw16c')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            format === 'nchw16c'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          nChw16c
        </button>
        <button
          onClick={() => setFormat('nchw32c')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            format === 'nchw32c'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          nChw32c
        </button>
      </div>

      {/* Description */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-gray-700">{getDescription()}</p>
      </div>

      {/* Tensor info */}
      <div className="mb-3 text-sm text-gray-600">
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
          Shape: [N={N}, C={C}, H={H}, W={W}]
        </span>
      </div>

      {/* Visualization */}
      <svg viewBox="0 0 580 380" className="w-full border rounded bg-gray-50">
        {format === 'nchw' && renderNCHW()}
        {format === 'nchw16c' && renderNCHW16C()}
        {format === 'nchw32c' && renderNCHW32C()}

        {/* Callout */}
        <rect x="10" y="320" width="560" height="50" rx="6" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="290" y="340" fontSize="11" fontWeight="600" textAnchor="middle" fill={COLORS.dark}>
          💡 Blocked format 让连续地址对应 SIMD lanes
        </text>
        <text x="290" y="357" fontSize="10" textAnchor="middle" fill={COLORS.mid}>
          向量化效率最高：一次内存访问加载完整的 SIMD 向量，无需 gather/scatter
        </text>
      </svg>
    </div>
  );
};

export default MemoryFormatViz;
