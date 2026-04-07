import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function LinearAttentionKernelTrick({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [n, setN] = useState(512);
  const d = 64;

  const t = locale === 'zh' ? {
    standard: '标准 Attention',
    linear: 'Linear Attention',
    intermediate: '中间矩阵',
    elements: '个元素',
    seqLen: '序列长度 n',
    shrink: '中间矩阵缩小',
    times: '×',
    softmaxNote: 'softmax 阻止结合律 — 必须先算 QKᵀ（n×n）',
    linearNote: '去掉 softmax → 先算 Kᵀ V（d×d），再乘 Q',
    complexity: '复杂度',
  } : {
    standard: 'Standard Attention',
    linear: 'Linear Attention',
    intermediate: 'Intermediate',
    elements: 'elements',
    seqLen: 'Sequence length n',
    shrink: 'intermediate shrinks',
    times: '×',
    softmaxNote: 'softmax blocks associativity — must compute QKᵀ (n×n) first',
    linearNote: 'Remove softmax → compute KᵀV (d×d) first, then multiply Q',
    complexity: 'Complexity',
  };

  const standardElems = n * n;
  const linearElems = d * d;
  const ratio = Math.round(standardElems / linearElems);

  const W = 660, H = 250;
  const rowY1 = 55, rowY2 = 150;

  // Bar widths for comparison (capped so small bar is still visible)
  const maxBarW = 240;
  const bar1W = maxBarW;
  const bar2W = Math.max(4, maxBarW * (linearElems / standardElems));

  const barX = 355;

  return (
    <div className="not-prose my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W, fontFamily: FONTS.mono }}>
        {/* === Row 1: Standard Attention === */}
        <text x={14} y={rowY1 - 22} fontSize={12} fontWeight={700} fill={COLORS.red}>
          {t.standard}
        </text>
        {/* Formula */}
        <text x={14} y={rowY1 + 4} fontSize={13} fill={COLORS.dark}>
          {'softmax( Q · K'}
        </text>
        <text x={148} y={rowY1 - 2} fontSize={9} fill={COLORS.dark}>{'T'}</text>
        <text x={155} y={rowY1 + 4} fontSize={13} fill={COLORS.dark}>{'/ √d ) · V'}</text>

        {/* Note */}
        <text x={14} y={rowY1 + 22} fontSize={9} fill={COLORS.mid}>
          {t.softmaxNote}
        </text>

        {/* Intermediate bar */}
        <rect x={barX} y={rowY1 - 16} width={bar1W} height={20} rx={3}
              fill={COLORS.red} fillOpacity={0.15} stroke={COLORS.red} strokeWidth={1.5} />
        <text x={barX + 6} y={rowY1 - 3} fontSize={10} fontWeight={600} fill={COLORS.red}>
          {n}×{n} = {standardElems.toLocaleString()}
        </text>
        {/* Complexity */}
        <text x={barX + bar1W + 8} y={rowY1 - 3} fontSize={10} fontWeight={600} fill={COLORS.red}>
          O(n²d)
        </text>

        {/* Divider */}
        <line x1={14} y1={rowY1 + 40} x2={W - 14} y2={rowY1 + 40}
              stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />

        {/* === Row 2: Linear Attention === */}
        <text x={14} y={rowY2 - 22} fontSize={12} fontWeight={700} fill={COLORS.green}>
          {t.linear}
        </text>
        {/* Formula */}
        <text x={14} y={rowY2 + 4} fontSize={13} fill={COLORS.dark}>
          {'φ(Q) · ( φ(K)'}
        </text>
        <text x={126} y={rowY2 - 2} fontSize={9} fill={COLORS.dark}>{'T'}</text>
        <text x={133} y={rowY2 + 4} fontSize={13} fill={COLORS.dark}>{'· V )'}</text>

        {/* Note */}
        <text x={14} y={rowY2 + 22} fontSize={9} fill={COLORS.mid}>
          {t.linearNote}
        </text>

        {/* Intermediate bar */}
        <rect x={barX} y={rowY2 - 16} width={bar2W} height={20} rx={3}
              fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={1.5} />
        {bar2W > 80 ? (
          <text x={barX + 6} y={rowY2 - 3} fontSize={10} fontWeight={600} fill={COLORS.green}>
            {d}×{d} = {linearElems.toLocaleString()}
          </text>
        ) : (
          <text x={barX + bar2W + 6} y={rowY2 - 3} fontSize={10} fontWeight={600} fill={COLORS.green}>
            {d}×{d} = {linearElems.toLocaleString()}
          </text>
        )}
        {/* Complexity */}
        <text x={barX + maxBarW + 8} y={rowY2 - 3} fontSize={10} fontWeight={600} fill={COLORS.green}>
          O(nd²)
        </text>

        {/* === Ratio === */}
        <text x={W / 2} y={H - 16} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.shrink} {ratio}{t.times}
        </text>
      </svg>

      {/* Slider */}
      <div className="flex items-center gap-3 mt-1 px-3">
        <span className="text-xs text-gray-500 whitespace-nowrap" style={{ fontFamily: FONTS.mono }}>
          {t.seqLen}
        </span>
        <input
          type="range" min={64} max={8192} step={64} value={n}
          onChange={e => setN(Number(e.target.value))}
          className="flex-1 accent-blue-600"
        />
        <span className="text-sm font-bold w-16 text-right" style={{ fontFamily: FONTS.mono }}>
          {n}
        </span>
      </div>
    </div>
  );
}
