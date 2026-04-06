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

export default function MambaBlockDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Mamba Block 架构',
      input: 'Input x',
      residual: 'Residual',
      linearExpand: 'Linear ↑',
      expandSub: 'D → ED (expand)',
      conv1d: 'Conv1d',
      kernel: 'kernel=4',
      siluActivation: 'SiLU (σ)',
      activation: 'activation',
      ssmSelective: 'SSM (Selective)',
      ssmSub: 'Δ, B, C = f(input)',
      siluGate: 'SiLU (gate)',
      linearContract: 'Linear ↓',
      contractSub: 'ED → D (contract)',
      output: 'Output (B, L, D)',
      noAttention: '无 Attention',
      noMLP: '无 MLP',
      comparedToTransformer: '比 Transformer',
      simpler: 'block 更简洁',
    },
    en: {
      title: 'Mamba Block Architecture',
      input: 'Input x',
      residual: 'Residual',
      linearExpand: 'Linear ↑',
      expandSub: 'D → ED (expand)',
      conv1d: 'Conv1d',
      kernel: 'kernel=4',
      siluActivation: 'SiLU (σ)',
      activation: 'activation',
      ssmSelective: 'SSM (Selective)',
      ssmSub: 'Δ, B, C = f(input)',
      siluGate: 'SiLU (gate)',
      linearContract: 'Linear ↓',
      contractSub: 'ED → D (contract)',
      output: 'Output (B, L, D)',
      noAttention: 'No Attention',
      noMLP: 'No MLP',
      comparedToTransformer: 'Vs Transformer',
      simpler: 'simpler block',
    },
  }[locale];

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
        {t.title}
      </text>

      {/* Input */}
      <Block x={cx - bw / 2} y={42} w={bw} h={bh}
        label={t.input} sublabel="(B, L, D)" color={COLORS.light} />

      {/* Residual arrow */}
      <line x1={cx + bw / 2 + 10} y1={60} x2={cx + bw / 2 + 40} y2={60}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <line x1={cx + bw / 2 + 40} y1={60} x2={cx + bw / 2 + 40} y2={430}
        stroke={COLORS.mid} strokeWidth="1" strokeDasharray="4,2" />
      <text x={cx + bw / 2 + 50} y={250} fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans} transform={`rotate(90, ${cx + bw / 2 + 50}, 250)`}>
        {t.residual}
      </text>

      {/* Linear projection expand */}
      <line x1={cx} y1={78} x2={cx} y2={98} stroke={COLORS.mid} strokeWidth="1.5"
        markerEnd="url(#mbd-arrow)" />
      <Block x={cx - bw / 2} y={100} w={bw} h={bh}
        label={t.linearExpand} sublabel={t.expandSub} color={COLORS.primary} />

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
        label={t.conv1d} sublabel={t.kernel} color={COLORS.orange} />
      <line x1={leftX + bw / 2} y1={206} x2={leftX + bw / 2} y2={220}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={222} w={bw} h={bh}
        label={t.siluActivation} sublabel={t.activation} color={COLORS.green} />
      <line x1={leftX + bw / 2} y1={258} x2={leftX + bw / 2} y2={272}
        stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#mbd-arrow)" />

      <Block x={leftX} y={274} w={bw} h={bh}
        label={t.ssmSelective} sublabel={t.ssmSub} color={COLORS.primary} />

      {/* Right branch: SiLU gate */}
      <Block x={rightX} y={170} w={bw - 20} h={bh}
        label={t.siluGate} sublabel="(B, L, ED)" color={COLORS.green} />

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
        label={t.linearContract} sublabel={t.contractSub} color={COLORS.primary} />

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
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.output}</text>

      {/* Annotation */}
      <text x={30} y={300} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.noAttention}
      </text>
      <text x={30} y={312} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.noMLP}
      </text>
      <text x={30} y={324} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.comparedToTransformer}
      </text>
      <text x={30} y={336} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.simpler}
      </text>
    </svg>
  );
}
