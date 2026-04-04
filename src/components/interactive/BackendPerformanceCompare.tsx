import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 220;

const BACKENDS = [
  { label: 'CUDA\n(RTX 4090)', tps: 115, color: '#76b900', hw: 'RTX 4090, 24GB' },
  { label: 'Metal\n(M3 Max)', tps: 55, color: '#a3aaae', hw: 'M3 Max, 36GB 统一内存' },
  { label: 'Vulkan\n(RX 7900)', tps: 38, color: '#ed1c24', hw: 'RX 7900 XTX, 24GB' },
  { label: 'CPU\n(i9-14900K)', tps: 12, color: '#0071c5', hw: 'AVX-512, 32 threads' },
];

export default function BackendPerformanceCompare() {
  const maxTps = Math.max(...BACKENDS.map(b => b.tps));
  const barAreaX = 120;
  const barAreaW = 380;
  const barH = 28;
  const gap = 12;
  const startY = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Qwen3-8B Q4_K_M — 各后端 Tokens/s 对比
      </text>
      <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        数据为估算值, 实际性能因驱动版本和系统配置而异
      </text>

      {BACKENDS.map((b, i) => {
        const y = startY + i * (barH + gap);
        const w = (b.tps / maxTps) * barAreaW;
        const lines = b.label.split('\n');
        return (
          <g key={b.label}>
            {lines.map((line, li) => (
              <text key={li} x={barAreaX - 8} y={y + barH / 2 + (li - 0.5) * 10}
                textAnchor="end" fontSize="7" fontWeight={li === 0 ? '600' : '400'}
                fill={li === 0 ? b.color : COLORS.mid} fontFamily={FONTS.sans}>
                {line}
              </text>
            ))}
            <rect x={barAreaX} y={y} width={w} height={barH} rx={4}
              fill={b.color} opacity={0.25} />
            <rect x={barAreaX} y={y} width={w} height={barH} rx={4}
              fill="none" stroke={b.color} strokeWidth={1.2} />
            <text x={barAreaX + w + 8} y={y + barH / 2 + 4}
              fontSize="9" fontWeight="700" fill={b.color} fontFamily={FONTS.sans}>
              {b.tps} tok/s
            </text>
          </g>
        );
      })}
    </svg>
  );
}
