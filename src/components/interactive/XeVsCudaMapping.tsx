import { COLORS, FONTS } from './shared/colors';

export default function XeVsCudaMapping() {
  const W = 580;
  const H = 380;

  const mappings = [
    { xe: 'Execution Unit (EU)', cuda: 'CUDA Core' },
    { xe: 'Xe-core', cuda: 'Streaming Multiprocessor (SM)' },
    { xe: 'Shared Local Memory (SLM)', cuda: 'Shared Memory' },
    { xe: 'Sub-group', cuda: 'Warp' },
    { xe: 'Work-group', cuda: 'Thread Block' },
    { xe: 'Work-item', cuda: 'Thread' },
    { xe: 'General Register File (GRF)', cuda: 'Register File' },
    { xe: 'XMX Engine', cuda: 'Tensor Core' },
    { xe: 'Level Zero API', cuda: 'CUDA Runtime' },
    { xe: 'SPIR-V', cuda: 'PTX / SASS' },
  ];

  const rowHeight = 32;
  const startY = 60;

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2">Xe2 与 CUDA 概念映射</h3>
        <p className="text-sm text-gray-600">
          理解 Intel Xe 与 NVIDIA CUDA 的对应关系，帮助 CUDA 开发者快速上手
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Headers */}
        <rect x={20} y={20} width={250} height={30} fill={COLORS.primary} rx={4} />
        <text
          x={145}
          y={40}
          textAnchor="middle"
          fill="white"
          fontSize={14}
          fontWeight="bold"
          fontFamily={FONTS.sans}
        >
          Intel Xe2
        </text>

        <rect x={310} y={20} width={250} height={30} fill={COLORS.green} rx={4} />
        <text
          x={435}
          y={40}
          textAnchor="middle"
          fill="white"
          fontSize={14}
          fontWeight="bold"
          fontFamily={FONTS.sans}
        >
          NVIDIA CUDA
        </text>

        {/* Mappings */}
        {mappings.map((mapping, i) => {
          const y = startY + i * rowHeight;

          return (
            <g key={i}>
              {/* Left Box (Xe) */}
              <rect
                x={20}
                y={y}
                width={250}
                height={28}
                fill={i % 2 === 0 ? COLORS.bgAlt : COLORS.bg}
                stroke={COLORS.primary}
                strokeWidth={1}
                rx={3}
              />
              <text
                x={30}
                y={y + 18}
                fill={COLORS.dark}
                fontSize={11}
                fontFamily={FONTS.mono}
              >
                {mapping.xe}
              </text>

              {/* Right Box (CUDA) */}
              <rect
                x={310}
                y={y}
                width={250}
                height={28}
                fill={i % 2 === 0 ? COLORS.bgAlt : COLORS.bg}
                stroke={COLORS.green}
                strokeWidth={1}
                rx={3}
              />
              <text
                x={320}
                y={y + 18}
                fill={COLORS.dark}
                fontSize={11}
                fontFamily={FONTS.mono}
              >
                {mapping.cuda}
              </text>

              {/* Connection Line */}
              <line
                x1={270}
                y1={y + 14}
                x2={310}
                y2={y + 14}
                stroke={COLORS.mid}
                strokeWidth={1.5}
                opacity={0.6}
              />
              {/* Arrow */}
              <polygon
                points={`${305},${y + 10} ${310},${y + 14} ${305},${y + 18}`}
                fill={COLORS.mid}
                opacity={0.6}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
