// src/components/interactive/CpuGpuTransistorCompare.tsx
// Static SVG: CPU vs GPU transistor budget / die area comparison
import { COLORS, FONTS } from './shared/colors';

const W = 560;
const H = 280;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string; bg: string;
  fontSize?: number;
}

function Block({ x, y, w, h, label, sub, color, bg, fontSize = 10 }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={bg} stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fontWeight="600" fill={color} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          {sub}
        </text>
      )}
    </g>
  );
}

export default function CpuGpuTransistorCompare() {
  // CPU side — left half
  const cpuX = 20;
  const cpuW = 240;
  // GPU side — right half
  const gpuX = 300;
  const gpuW = 240;
  const dieY = 50;
  const dieH = 190;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="CPU vs GPU transistor budget comparison">

      {/* Headers */}
      <text x={cpuX + cpuW / 2} y={20} textAnchor="middle"
        fontSize="13" fontWeight="700" fill={COLORS.primary} fontFamily={FONTS.sans}>
        CPU — 延迟优化
      </text>
      <text x={gpuX + gpuW / 2} y={20} textAnchor="middle"
        fontSize="13" fontWeight="700" fill={COLORS.green} fontFamily={FONTS.sans}>
        GPU — 吞吐优化
      </text>

      {/* CPU die outline */}
      <rect x={cpuX} y={dieY} width={cpuW} height={dieH} rx={6}
        fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />

      {/* CPU blocks — large cache, medium control, small ALU */}
      <Block x={cpuX + 8} y={dieY + 8} w={cpuW - 16} h={70}
        label="Cache (L1/L2/L3)" sub="~50% 晶体管预算"
        color={COLORS.orange} bg="#fff7ed" />
      <Block x={cpuX + 8} y={dieY + 86} w={110} h={50}
        label="控制逻辑" sub="分支预测 / 乱序执行"
        color={COLORS.purple} bg="#f3e8ff" fontSize={9} />
      <Block x={cpuX + 126} y={dieY + 86} w={106} h={50}
        label="ALU" sub="4-8 个强核心"
        color={COLORS.primary} bg="#dbeafe" />
      <Block x={cpuX + 8} y={dieY + 144} w={cpuW - 16} h={38}
        label="内存控制器 + IO" color="#64748b" bg="#f1f5f9" fontSize={9} />

      {/* GPU die outline */}
      <rect x={gpuX} y={dieY} width={gpuW} height={dieH} rx={6}
        fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />

      {/* GPU blocks — massive ALU grid, tiny cache/control */}
      {/* ALU grid — 4x4 blocks filling most of the die */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => {
          const bx = gpuX + 8 + col * 58;
          const by = dieY + 8 + row * 34;
          return (
            <rect key={`${row}-${col}`} x={bx} y={by} width={54} height={30} rx={3}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          );
        })
      )}
      <text x={gpuX + cpuW / 2} y={dieY + 75} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
        数千个小 ALU（SM / CU）
      </text>
      <text x={gpuX + cpuW / 2} y={dieY + 90} textAnchor="middle"
        fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        ~80% 晶体管预算
      </text>

      {/* GPU small cache + control */}
      <Block x={gpuX + 8} y={dieY + 146} w={80} h={36}
        label="L2 Cache" sub="较小" color={COLORS.orange} bg="#fff7ed" fontSize={9} />
      <Block x={gpuX + 96} y={dieY + 146} w={60} h={36}
        label="控制" color={COLORS.purple} bg="#f3e8ff" fontSize={9} />
      <Block x={gpuX + 164} y={dieY + 146} w={68} h={36}
        label="Mem Ctrl" color="#64748b" bg="#f1f5f9" fontSize={9} />

      {/* Bottom annotation */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        CPU：几个强核心，延迟低 · GPU：数千个弱核心，总吞吐量高
      </text>
    </svg>
  );
}
