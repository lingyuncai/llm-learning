// src/components/interactive/PrePostLNComparison.tsx
import { COLORS } from './shared/colors';

// A simple block node for the flow diagram
function Block({ x, y, width, height, label, fill = COLORS.bgAlt }: {
  x: number; y: number; width: number; height: number; label: string; fill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6}
        fill={fill} stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle"
        fontSize="11" fill={COLORS.dark} fontFamily="system-ui" fontWeight="500">
        {label}
      </text>
    </g>
  );
}

// Arrow from (x1,y1) to (x2,y2)
function Arrow({ x1, y1, x2, y2, thick = false, color = COLORS.mid, label }: {
  x1: number; y1: number; x2: number; y2: number;
  thick?: boolean; color?: string; label?: string;
}) {
  const id = `arrow-${x1}-${y1}-${x2}-${y2}`;
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={thick ? 3 : 1.5} markerEnd={`url(#${id})`} />
      {label && (
        <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 + 4}
          fontSize="9" fill={color} fontFamily="system-ui" fontWeight="600">
          {label}
        </text>
      )}
    </g>
  );
}

// A circle for the Add node
function AddNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="#fff" stroke={COLORS.mid} strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fill={COLORS.dark} fontFamily="system-ui">+</text>
    </g>
  );
}

export default function PrePostLNComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      postLNTitle: 'Post-LN (原始)',
      preLNTitle: 'Pre-LN (现代)',
      gradientThroughLN: '梯度必须穿过 LN',
      gradientHighway: '梯度高速公路',
      residualShortcut: '(残差直通路径)',
    },
    en: {
      postLNTitle: 'Post-LN (Original)',
      preLNTitle: 'Pre-LN (Modern)',
      gradientThroughLN: 'Gradients must pass through LN',
      gradientHighway: 'Gradient Highway',
      residualShortcut: '(Residual Shortcut Path)',
    },
  };

  const W = 800;
  const H = 380;
  const bw = 90; // block width
  const bh = 32; // block height
  const gap = 50; // vertical gap between blocks

  // Post-LN layout (left side)
  const lx = 60; // center x for left diagram
  // Pre-LN layout (right side)
  const rx = 480;

  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl mx-auto">
        {/* Labels */}
        <text x={lx + bw / 2} y={20} textAnchor="middle" fontSize="14" fill={COLORS.dark}
          fontFamily="system-ui" fontWeight="700">{t[locale].postLNTitle}</text>
        <text x={rx + bw / 2} y={20} textAnchor="middle" fontSize="14" fill={COLORS.dark}
          fontFamily="system-ui" fontWeight="700">{t[locale].preLNTitle}</text>

        {/* === Post-LN (left) === */}
        {/* Input → Attn → Add → LN → FFN → Add → LN */}
        <Block x={lx} y={40} width={bw} height={bh} label="Input" />
        <Arrow x1={lx + bw / 2} y1={40 + bh} x2={lx + bw / 2} y2={40 + bh + gap - 14} />
        <Block x={lx} y={40 + gap + bh / 2 - bh / 2} width={bw} height={bh} label="Attention" fill="#dbeafe" />
        <Arrow x1={lx + bw / 2} y1={40 + gap + bh} x2={lx + bw / 2} y2={40 + 2 * gap - 14} />
        <AddNode cx={lx + bw / 2} cy={40 + 2 * gap} />
        <Arrow x1={lx + bw / 2} y1={40 + 2 * gap + 14} x2={lx + bw / 2} y2={40 + 2.6 * gap} />
        <Block x={lx} y={40 + 2.6 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={lx + bw / 2} y1={40 + 2.6 * gap + bh} x2={lx + bw / 2} y2={40 + 3.4 * gap} />
        <Block x={lx} y={40 + 3.4 * gap} width={bw} height={bh} label="FFN" fill="#dbeafe" />
        <Arrow x1={lx + bw / 2} y1={40 + 3.4 * gap + bh} x2={lx + bw / 2} y2={40 + 4.2 * gap - 14} />
        <AddNode cx={lx + bw / 2} cy={40 + 4.2 * gap} />
        <Arrow x1={lx + bw / 2} y1={40 + 4.2 * gap + 14} x2={lx + bw / 2} y2={40 + 4.8 * gap} />
        <Block x={lx} y={40 + 4.8 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={lx + bw / 2} y1={40 + 4.8 * gap + bh} x2={lx + bw / 2} y2={H - 10} />

        {/* Post-LN residual connections (thin lines) */}
        <path d={`M ${lx - 15} ${40 + bh / 2} L ${lx - 15} ${40 + 2 * gap} L ${lx + bw / 2 - 14} ${40 + 2 * gap}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="4,3" />
        <path d={`M ${lx - 15} ${40 + 2.6 * gap + bh / 2} L ${lx - 15} ${40 + 4.2 * gap} L ${lx + bw / 2 - 14} ${40 + 4.2 * gap}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1} strokeDasharray="4,3" />

        {/* Post-LN annotation */}
        <text x={lx + bw + 10} y={40 + 2.6 * gap + 18} fontSize="9" fill={COLORS.red} fontFamily="system-ui">
          {t[locale].gradientThroughLN}
        </text>

        {/* === Pre-LN (right) === */}
        {/* Input → LN → Attn → Add → LN → FFN → Add */}
        <Block x={rx} y={40} width={bw} height={bh} label="Input" />
        <Arrow x1={rx + bw / 2} y1={40 + bh} x2={rx + bw / 2} y2={40 + gap} />
        <Block x={rx} y={40 + gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={rx + bw / 2} y1={40 + gap + bh} x2={rx + bw / 2} y2={40 + 2 * gap} />
        <Block x={rx} y={40 + 2 * gap} width={bw} height={bh} label="Attention" fill="#dbeafe" />
        <Arrow x1={rx + bw / 2} y1={40 + 2 * gap + bh} x2={rx + bw / 2} y2={40 + 2.8 * gap - 14} />
        <AddNode cx={rx + bw / 2} cy={40 + 2.8 * gap} />
        <Arrow x1={rx + bw / 2} y1={40 + 2.8 * gap + 14} x2={rx + bw / 2} y2={40 + 3.4 * gap} />
        <Block x={rx} y={40 + 3.4 * gap} width={bw} height={bh} label="LayerNorm" fill="#fef3c7" />
        <Arrow x1={rx + bw / 2} y1={40 + 3.4 * gap + bh} x2={rx + bw / 2} y2={40 + 4.2 * gap} />
        <Block x={rx} y={40 + 4.2 * gap} width={bw} height={bh} label="FFN" fill="#dbeafe" />
        <Arrow x1={rx + bw / 2} y1={40 + 4.2 * gap + bh} x2={rx + bw / 2} y2={40 + 4.8 * gap - 14} />
        <AddNode cx={rx + bw / 2} cy={40 + 4.8 * gap} />
        <Arrow x1={rx + bw / 2} y1={40 + 4.8 * gap + 14} x2={rx + bw / 2} y2={H - 10} />

        {/* Pre-LN residual connections (thick blue = gradient highway) */}
        <path d={`M ${rx - 15} ${40 + bh / 2} L ${rx - 15} ${40 + 2.8 * gap} L ${rx + bw / 2 - 14} ${40 + 2.8 * gap}`}
          fill="none" stroke={COLORS.primary} strokeWidth={3} />
        <path d={`M ${rx - 15} ${40 + 2.8 * gap} L ${rx - 15} ${40 + 4.8 * gap} L ${rx + bw / 2 - 14} ${40 + 4.8 * gap}`}
          fill="none" stroke={COLORS.primary} strokeWidth={3} />

        {/* Pre-LN annotation */}
        <text x={rx + bw + 10} y={40 + 3.6 * gap} fontSize="9" fill={COLORS.primary} fontFamily="system-ui" fontWeight="600">
          {t[locale].gradientHighway}
        </text>
        <text x={rx + bw + 10} y={40 + 3.6 * gap + 14} fontSize="9" fill={COLORS.primary} fontFamily="system-ui">
          {t[locale].residualShortcut}
        </text>
      </svg>
    </div>
  );
}
