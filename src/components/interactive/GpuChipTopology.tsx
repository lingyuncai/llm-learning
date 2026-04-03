// src/components/interactive/GpuChipTopology.tsx
// Interactive chip hierarchy: GPU → GPC → TPC → SM with expand/collapse
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// H100 SXM: full die = 8 GPC × 9 TPC × 2 SM = 144 SM, 132 enabled
// Visualization simplified: showing 2 TPC per GPC to fit diagram
const GPU_SPEC = {
  name: 'H100 SXM',
  gpcs: 8,
  tpcsPerGpc: 2,   // simplified for viz (actual: ~9 per GPC)
  smsPerTpc: 2,
  totalSMs: 132,    // 144 on die, 132 enabled for yield
  l2Cache: '50 MB',
  hbm: '80 GB HBM3',
};

const W = 580;
const COLLAPSED_H = 280;
const GPC_COLS = 4;
const GPC_W = 120;
const GPC_H = 40;
const GPC_GAP = 16;

function SmBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={36} height={20} rx={3}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={x + 18} y={y + 11} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill={COLORS.primary} fontFamily={FONTS.mono} fontWeight="500">
        SM
      </text>
    </g>
  );
}

function TpcBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={84} height={50} rx={4}
        fill="none" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 2" />
      <text x={x + 42} y={y + 10} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>TPC</text>
      <SmBox x={x + 4} y={y + 18} />
      <SmBox x={x + 44} y={y + 18} />
    </g>
  );
}

export default function GpuChipTopology() {
  const [expandedGpc, setExpandedGpc] = useState<number | null>(null);

  const gpcStartY = 70;

  // Calculate dynamic height
  const hasExpanded = expandedGpc !== null;
  const expandedRow = hasExpanded ? Math.floor(expandedGpc! / GPC_COLS) : -1;
  const EXPAND_EXTRA = 80;
  const H = COLLAPSED_H + (hasExpanded ? EXPAND_EXTRA : 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="GPU chip topology: GPC → TPC → SM hierarchy">

      {/* GPU chip outline */}
      <rect x={10} y={10} width={W - 20} height={H - 20} rx={8}
        fill="#fafbfc" stroke="#37474f" strokeWidth={2} />
      <text x={20} y={32} fontSize="12" fontWeight="700" fill="#37474f"
        fontFamily={FONTS.sans}>
        {GPU_SPEC.name} — {GPU_SPEC.totalSMs} SMs
      </text>

      {/* GPC grid */}
      {Array.from({ length: GPU_SPEC.gpcs }).map((_, i) => {
        const col = i % GPC_COLS;
        const row = Math.floor(i / GPC_COLS);
        const x = 30 + col * (GPC_W + GPC_GAP);
        const extraY = hasExpanded && row > expandedRow ? EXPAND_EXTRA : 0;
        const y = gpcStartY + row * (GPC_H + GPC_GAP + 20) + extraY;
        const isExpanded = expandedGpc === i;

        return (
          <g key={i} onClick={() => setExpandedGpc(isExpanded ? null : i)}
            style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={GPC_W} height={isExpanded ? GPC_H + EXPAND_EXTRA : GPC_H}
              rx={6} fill={isExpanded ? '#eff6ff' : '#f8fafc'}
              stroke={isExpanded ? COLORS.primary : '#94a3b8'} strokeWidth={isExpanded ? 2 : 1} />
            <text x={x + GPC_W / 2} y={y + 14} textAnchor="middle" fontSize="10"
              fontWeight="600" fill={isExpanded ? COLORS.primary : '#37474f'}
              fontFamily={FONTS.sans}>
              GPC {i} {isExpanded ? '▾' : '▸'}
            </text>
            <text x={x + GPC_W / 2} y={y + 28} textAnchor="middle" fontSize="8"
              fill="#64748b" fontFamily={FONTS.sans}>
              {GPU_SPEC.tpcsPerGpc} TPC × {GPU_SPEC.smsPerTpc} SM
            </text>
            {isExpanded && (
              <g>
                <TpcBox x={x + 4} y={y + GPC_H} />
                <text x={x + GPC_W / 2} y={y + GPC_H + EXPAND_EXTRA - 6} textAnchor="middle"
                  fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
                  点击收起
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Bottom bar: L2 + HBM */}
      {(() => {
        const bottomY = H - 50;
        return (
          <g>
            <rect x={30} y={bottomY} width={200} height={26} rx={5}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
            <text x={130} y={bottomY + 14} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans} fontWeight="500">
              L2 Cache — {GPU_SPEC.l2Cache}
            </text>
            <rect x={250} y={bottomY} width={280} height={26} rx={5}
              fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={1} />
            <text x={390} y={bottomY + 14} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={COLORS.purple} fontFamily={FONTS.sans} fontWeight="500">
              {GPU_SPEC.hbm} — 3.35 TB/s
            </text>
          </g>
        );
      })()}

      {/* Click hint */}
      {!hasExpanded && (
        <text x={W / 2} y={H - 58} textAnchor="middle" fontSize="8"
          fill="#94a3b8" fontFamily={FONTS.sans}>
          点击任意 GPC 展开查看内部 TPC → SM 结构
        </text>
      )}
    </svg>
  );
}
