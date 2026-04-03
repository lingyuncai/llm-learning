// src/components/interactive/MemoryHierarchyDetailed.tsx
// Static SVG: 4-level GPU memory hierarchy with H100 specs
import { COLORS, FONTS } from './shared/colors';

const W = 520;
const H = 300;

interface Level {
  label: string;
  capacity: string;
  bandwidth: string;
  latency: string;
  color: string;
  bg: string;
  width: number; // trapezoid width at this level
}

const levels: Level[] = [
  { label: 'Register File', capacity: '256 KB / SM', bandwidth: '极高（片上）',
    latency: '0 周期', color: COLORS.green, bg: '#dcfce7', width: 120 },
  { label: 'Shared Memory / L1', capacity: '228 KB / SM', bandwidth: '极高（片上）',
    latency: '~20-30 周期', color: COLORS.primary, bg: '#dbeafe', width: 200 },
  { label: 'L2 Cache', capacity: '50 MB (全局共享)', bandwidth: '~12 TB/s（理论计算值）',
    latency: '~200 周期', color: COLORS.orange, bg: '#fff7ed', width: 320 },
  { label: 'HBM3 (全局显存)', capacity: '80 GB', bandwidth: '3.35 TB/s',
    latency: '~400-600 周期', color: COLORS.purple, bg: '#f3e8ff', width: 440 },
];

export default function MemoryHierarchyDetailed() {
  const startY = 30;
  const levelH = 52;
  const centerX = W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU 4-level memory hierarchy with H100 specs">

      <text x={centerX} y={16} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        GPU 内存层次（H100 参考数据）
      </text>

      {levels.map((lv, i) => {
        const y = startY + i * (levelH + 8);
        const x = centerX - lv.width / 2;

        return (
          <g key={i}>
            {/* Level box — trapezoid-like (wider = slower/larger) */}
            <rect x={x} y={y} width={lv.width} height={levelH} rx={6}
              fill={lv.bg} stroke={lv.color} strokeWidth={1.5} />

            {/* Label */}
            <text x={centerX} y={y + 15} textAnchor="middle"
              fontSize="11" fontWeight="700" fill={lv.color} fontFamily={FONTS.sans}>
              {lv.label}
            </text>

            {/* Specs row */}
            <text x={centerX} y={y + 30} textAnchor="middle"
              fontSize="8.5" fill="#37474f" fontFamily={FONTS.mono}>
              {lv.capacity}
            </text>
            <text x={centerX} y={y + 42} textAnchor="middle"
              fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
              带宽 {lv.bandwidth} · 延迟 {lv.latency}
            </text>

            {/* Speed indicator arrow on right */}
            {i < levels.length - 1 && (
              <text x={centerX + lv.width / 2 + 12} y={y + levelH / 2 + 2} fontSize="9"
                fill="#94a3b8" fontFamily={FONTS.sans}>
                ↓ 更慢更大
              </text>
            )}
          </g>
        );
      })}

      {/* Annotation */}
      <text x={centerX} y={H - 8} textAnchor="middle" fontSize="8.5"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        优化核心思路：尽量让数据停留在金字塔顶部（Register / Shared Memory）
      </text>
    </svg>
  );
}
