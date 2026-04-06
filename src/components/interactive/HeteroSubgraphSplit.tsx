import React, { useState, useMemo } from 'react';
import { COLORS, FONTS } from './shared/colors';

const HeteroSubgraphSplit: React.FC = () => {
  const [splitPoint, setSplitPoint] = useState<number>(50); // 0-100%

  const layers = [
    { name: 'Embedding', height: 20 },
    { name: 'Attention-1', height: 30 },
    { name: 'FFN-1', height: 25 },
    { name: 'Attention-2', height: 30 },
    { name: 'FFN-2', height: 25 },
    { name: 'Attention-3', height: 30 },
    { name: 'FFN-3', height: 25 },
    { name: 'Attention-4', height: 30 },
    { name: 'FFN-4', height: 25 },
    { name: 'Attention-5', height: 30 },
    { name: 'FFN-5', height: 25 },
    { name: 'Output', height: 20 },
  ];

  const totalHeight = layers.reduce((sum, l) => sum + l.height, 0);

  // Calculate metrics based on split point
  const metrics = useMemo(() => {
    const npuLoad = splitPoint;
    const gpuLoad = 100 - splitPoint;

    // Communication overhead increases with more splits
    // Simplified: assume one split at the boundary
    const commOverhead = splitPoint > 0 && splitPoint < 100
      ? Math.min(20, 5 + Math.abs(50 - splitPoint) * 0.15)
      : 0;

    // Latency: balanced is better, extreme splits are worse
    const imbalancePenalty = Math.abs(50 - splitPoint) * 0.3;
    const baseLatency = 100;
    const latency = baseLatency + commOverhead + imbalancePenalty;

    return {
      npuLoad: npuLoad.toFixed(0),
      gpuLoad: gpuLoad.toFixed(0),
      commOverhead: commOverhead.toFixed(1),
      latency: latency.toFixed(0),
    };
  }, [splitPoint]);

  // Calculate split line position
  let accumulatedHeight = 0;
  const splitLineY = 40 + (splitPoint / 100) * totalHeight;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 380" className="w-full">
        {/* Title */}
        <text x="290" y="20" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          异构计算图切分点配置
        </text>

        {/* Left: Layer stack */}
        <g transform="translate(40, 40)">
          <text x="100" y="-10" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Transformer 模型层
          </text>

          {layers.map((layer, i) => {
            accumulatedHeight += i === 0 ? 0 : layers[i - 1].height;
            const y = accumulatedHeight;
            const isNpu = (y + layer.height / 2) < (splitPoint / 100) * totalHeight;

            return (
              <g key={i}>
                <rect
                  x="0"
                  y={y}
                  width="200"
                  height={layer.height}
                  fill={isNpu ? COLORS.primary : COLORS.green}
                  opacity="0.6"
                  stroke={isNpu ? COLORS.primary : COLORS.green}
                  strokeWidth="1.5"
                  rx="2"
                />
                <text
                  x="100"
                  y={y + layer.height / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="500"
                  fontFamily={FONTS.sans}
                >
                  {layer.name}
                </text>
              </g>
            );
          })}

          {/* Split line */}
          <line
            x1="-10"
            y1={splitLineY - 40}
            x2="210"
            y2={splitLineY - 40}
            stroke={COLORS.orange}
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          <text
            x="215"
            y={splitLineY - 36}
            fontSize="10"
            fontWeight="600"
            fill={COLORS.orange}
            fontFamily={FONTS.sans}
          >
            切分点
          </text>

          {/* Device labels */}
          <g transform={`translate(210, ${Math.min(20, splitLineY - 60)})`}>
            <rect x="0" y="0" width="10" height="10" fill={COLORS.primary} opacity="0.6" />
            <text x="15" y="9" fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
              NPU
            </text>
          </g>
          <g transform={`translate(210, ${Math.max(splitLineY - 20, totalHeight - 20)})`}>
            <rect x="0" y="0" width="10" height="10" fill={COLORS.green} opacity="0.6" />
            <text x="15" y="9" fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
              GPU
            </text>
          </g>
        </g>

        {/* Right: Metrics panel */}
        <g transform="translate(320, 40)">
          <rect x="0" y="0" width="220" height="240" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="6" />

          <text x="110" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            运行指标
          </text>

          {/* NPU Load */}
          <text x="20" y="55" fontSize="11" fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
            NPU 负载
          </text>
          <rect x="20" y="62" width="180" height="18" fill={COLORS.light} rx="2" />
          <rect
            x="20"
            y="62"
            width={(parseFloat(metrics.npuLoad) / 100) * 180}
            height="18"
            fill={COLORS.primary}
            rx="2"
          />
          <text x="110" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
            {metrics.npuLoad}%
          </text>

          {/* GPU Load */}
          <text x="20" y="105" fontSize="11" fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
            GPU 负载
          </text>
          <rect x="20" y="112" width="180" height="18" fill={COLORS.light} rx="2" />
          <rect
            x="20"
            y="112"
            width={(parseFloat(metrics.gpuLoad) / 100) * 180}
            height="18"
            fill={COLORS.green}
            rx="2"
          />
          <text x="110" y="125" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
            {metrics.gpuLoad}%
          </text>

          {/* Communication Overhead */}
          <text x="20" y="155" fontSize="11" fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
            通信开销
          </text>
          <rect x="20" y="162" width="180" height="18" fill={COLORS.light} rx="2" />
          <rect
            x="20"
            y="162"
            width={(parseFloat(metrics.commOverhead) / 20) * 180}
            height="18"
            fill={COLORS.orange}
            rx="2"
          />
          <text x="110" y="175" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
            {metrics.commOverhead}%
          </text>

          {/* Latency */}
          <text x="20" y="205" fontSize="11" fontWeight="500" fill={COLORS.dark} fontFamily={FONTS.sans}>
            预估延迟
          </text>
          <text x="110" y="228" textAnchor="middle" fontSize="16" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.mono}>
            {metrics.latency} ms
          </text>
        </g>

        {/* Insight box */}
        <g transform="translate(40, 340)">
          <rect x="0" y="0" width="500" height="28" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1" rx="4" />
          <text x="250" y="18" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
            💡 切分点越少，设备间数据传输开销越低；负载均衡时整体延迟最优
          </text>
        </g>
      </svg>

      {/* Slider control */}
      <div className="mt-4 px-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          NPU/GPU 切分点: {splitPoint}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={splitPoint}
          onChange={(e) => setSplitPoint(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>全部 GPU</span>
          <span>均衡</span>
          <span>全部 NPU</span>
        </div>
      </div>
    </div>
  );
};

export default HeteroSubgraphSplit;
