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

export default function MemoryHierarchyDetailed({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'GPU 内存层次（H100 参考数据）',
      registerFile: 'Register File',
      sharedMemory: 'Shared Memory / L1',
      l2Cache: 'L2 Cache',
      hbm3: 'HBM3 (全局显存)',
      bandwidthLabel: '带宽',
      latencyLabel: '延迟',
      slowerLarger: '更慢更大',
      annotation: '优化核心思路：尽量让数据停留在金字塔顶部（Register / Shared Memory）',
      veryHigh: '极高（片上）',
      cycles: '周期',
      globalShared: '全局共享',
      theoretical: '理论计算值',
    },
    en: {
      title: 'GPU Memory Hierarchy (H100 Reference)',
      registerFile: 'Register File',
      sharedMemory: 'Shared Memory / L1',
      l2Cache: 'L2 Cache',
      hbm3: 'HBM3 (Global Memory)',
      bandwidthLabel: 'BW',
      latencyLabel: 'Latency',
      slowerLarger: 'slower/larger',
      annotation: 'Optimization key: keep data at pyramid top (Register / Shared Memory)',
      veryHigh: 'Very High (on-chip)',
      cycles: 'cycles',
      globalShared: 'global shared',
      theoretical: 'theoretical',
    },
  }[locale];

  const levels: Level[] = [
    { label: t.registerFile, capacity: '256 KB / SM', bandwidth: t.veryHigh,
      latency: `0 ${t.cycles}`, color: COLORS.green, bg: '#dcfce7', width: 120 },
    { label: t.sharedMemory, capacity: '228 KB / SM', bandwidth: t.veryHigh,
      latency: `~20-30 ${t.cycles}`, color: COLORS.primary, bg: '#dbeafe', width: 200 },
    { label: t.l2Cache, capacity: `50 MB (${t.globalShared})`, bandwidth: `~12 TB/s (${t.theoretical})`,
      latency: `~200 ${t.cycles}`, color: COLORS.orange, bg: '#fff7ed', width: 320 },
    { label: t.hbm3, capacity: '80 GB', bandwidth: '3.35 TB/s',
      latency: `~400-600 ${t.cycles}`, color: COLORS.purple, bg: '#f3e8ff', width: 440 },
  ];
  const startY = 30;
  const levelH = 52;
  const centerX = W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU 4-level memory hierarchy with H100 specs">

      <text x={centerX} y={16} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
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
              {t.bandwidthLabel} {lv.bandwidth} · {t.latencyLabel} {lv.latency}
            </text>

            {/* Speed indicator arrow on right */}
            {i < levels.length - 1 && (
              <text x={centerX + lv.width / 2 + 12} y={y + levelH / 2 + 2} fontSize="9"
                fill="#94a3b8" fontFamily={FONTS.sans}>
                ↓ {t.slowerLarger}
              </text>
            )}
          </g>
        );
      })}

      {/* Annotation */}
      <text x={centerX} y={H - 8} textAnchor="middle" fontSize="8.5"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        {t.annotation}
      </text>
    </svg>
  );
}
