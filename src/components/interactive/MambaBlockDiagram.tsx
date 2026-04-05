import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 480;

interface BlockProps {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; color: string;
}

function Block({ x, y, w, h, label, sublabel, color }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color} opacity={0.15} stroke={color} strokeWidth="2" />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 3 : h / 2 + 4)}
        textAnchor="middle" fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>{sublabel}</text>
      )}
    </g>
  );
}

export default function MambaBlockDiagram() {
  const cx = W / 2;
  const bw = 160;
  const bh = 36;

  // Branch widths
  const branchGap = 40;
  const leftX = cx - bw / 2 - branchGap;
  const rightX = cx + branchGap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="mbd-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={cx} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Mamba Block 架构
      </text>

      {/* Input */}
      <Block x={cx - bw / 2} y={42} w={bw} h={bh}
        label="Input x" sublabel="(B, L, D)" color={COLORS.light} />

      {/* Residual arrow */}
      <line x1={cx + bw / 2 + 10} y1={60} x2={cx + bw / 2 + 40} y2={60}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <line x1={cx + bw / 2 + 40} y1={60} x2={cx + bw / 2 + 40} y2={430}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <text x={cx + bw / 2 + 50} y={250} fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans} transform={`rotate(90, ${cx + bw / 2 + 50}, 250)`}>
        Residual
      </text>

      {/* Linear projection expand */}
      <line x1={cx} y1={78} x2={cx} y2={98} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <Block x={cx - bw / 2} y={100} w={bw} h={bh}
        label="Linear ↑" sublabel="D → ED (expand)" color={COLORS.primary} />

      {/* Split into two branches */}
      <line x1={cx} y1={136} x2={cx} y2={150} stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={150} x2={rightX + bw / 2 - bw / 2} y2={150}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={150} x2={leftX + bw / 2} y2={168}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />
      <line x1={rightX + bw / 2 - bw / 2} y1={150} x2={rightX + bw / 2 - bw / 2} y2={168}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      {/* Left branch: Conv1d → SiLU → SSM */}
      <Block x={leftX} y={170} w={bw} h={bh}
        label="Conv1d" sublabel="kernel=4" color={COLORS.orange} />
      <line x1={leftX + bw / 2} y1={206} x2={leftX + bw / 2} y2={220}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={222} w={bw} h={bh}
        label="SiLU (σ)" sublabel="activation" color={COLORS.green} />
      <line x1={leftX + bw / 2} y1={258} x2={leftX + bw / 2} y2={272}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={274} w={bw} h={bh}
        label="SSM (Selective)" sublabel="Δ, B, C = f(input)" color={COLORS.primary} />

      {/* Right branch: SiLU gate */}
      <Block x={rightX} y={170} w={bw - 20} h={bh}
        label="SiLU (gate)" sublabel="(B, L, ED)" color={COLORS.green} />

      {/* Gate arrow down to multiply level */}
      <line x1={rightX + (bw - 20) / 2} y1={206}
        x2={rightX + (bw - 20) / 2} y2={295}
        stroke={COLORS.mid} strokeWidth="1.5" strokeDasharray="4,2" />

      {/* Multiply */}
      <line x1={leftX + bw / 2} y1={310} x2={leftX + bw / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={rightX + (bw - 20) / 2} y1={295}
        x2={rightX + (bw - 20) / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={leftX + bw / 2} y1={340} x2={rightX + (bw - 20) / 2} y2={340}
        stroke={COLORS.mid} strokeWidth="1.5" />
      <circle cx={cx} cy={340} r={12}
        fill={COLORS.bgAlt} stroke={COLORS.dark} strokeWidth="1.5" />
      <text x={cx} y={344} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.mono}>×</text>

      {/* Linear projection contract */}
      <line x1={cx} y1={352} x2={cx} y2={372} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <Block x={cx - bw / 2} y={374} w={bw} h={bh}
        label="Linear ↓" sublabel="ED → D (contract)" color={COLORS.primary} />

      {/* Add residual */}
      <line x1={cx} y1={410} x2={cx} y2={425} stroke={COLORS.mid} strokeWidth="1.5" />
      <line x1={cx + bw / 2 + 40} y1={430} x2={cx + 15} y2={430}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2"
        markerEnd="url(#mbd-arrow)" />
      <circle cx={cx} cy={430} r={10}
        fill={COLORS.bgAlt} stroke={COLORS.dark} strokeWidth="1.5" />
      <text x={cx} y={434} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.mono}>+</text>

      {/* Output */}
      <line x1={cx} y1={440} x2={cx} y2={455} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <text x={cx} y={468} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>Output (B, L, D)</text>

      {/* Annotation */}
      <text x={30} y={300} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        无 Attention
      </text>
      <text x={30} y={312} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        无 MLP
      </text>
      <text x={30} y={324} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        比 Transformer
      </text>
      <text x={30} y={336} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        block 更简洁
      </text>
    </svg>
  );
}
