import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 560;

type Pattern = 'interleaved' | 'parallel' | 'shared';

const TABS: { key: Pattern; label: string }[] = [
  { key: 'interleaved', label: '交替式' },
  { key: 'parallel', label: '并行式' },
  { key: 'shared', label: '共享式' },
];

function LayerRect({ x, y, w, h, type, label }: {
  x: number; y: number; w: number; h: number;
  type: 'mamba' | 'attention' | 'moe'; label: string;
}) {
  const fill = type === 'mamba' ? COLORS.primary
    : type === 'attention' ? COLORS.orange : COLORS.purple;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={fill} opacity="0.15" stroke={fill} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
        fontSize="9" fontWeight="600" fill={fill} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

function InterleavedView() {
  const layerW = 200;
  const layerH = 22;
  const gap = 4;
  const startX = (W - layerW) / 2;
  const startY = 30;
  // 8-layer group: 7 Mamba + 1 Attention, repeated 2x
  const layers: { type: 'mamba' | 'attention' | 'moe'; label: string }[] = [];
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < 7; i++) {
      layers.push({ type: 'mamba', label: `Mamba ${g * 8 + i + 1}` });
    }
    layers.push({ type: 'attention', label: `Attention ${g + 1}` });
  }

  return (
    <g>
      {layers.map((l, i) => (
        <LayerRect key={i} x={startX} y={startY + i * (layerH + gap)}
          w={layerW} h={layerH} type={l.type} label={l.label} />
      ))}
      {/* MoE markers on some Mamba layers */}
      {[2, 5, 10, 13].map((i) => (
        <text key={`moe-${i}`} x={startX + layerW + 10} y={startY + i * (layerH + gap) + layerH / 2 + 3}
          fontSize="8" fill={COLORS.purple} fontFamily={FONTS.mono}>MoE</text>
      ))}
      {/* Bracket annotation */}
      <text x={startX - 10} y={startY + 4 * (layerH + gap)} fontSize="8"
        fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="end">7:1</text>

      {/* Info box */}
      <rect x={40} y={startY + 16 * (layerH + gap) + 10} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + 16 * (layerH + gap) + 30} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Jamba 式：7 Mamba + 1 Attention 为一组，部分层加 MoE
      </text>
      <text x={290} y={startY + 16 * (layerH + gap) + 48} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        KV cache 仅 1/8 · 适合长上下文大模型 · 代表: Jamba (52B/12B active)
      </text>
    </g>
  );
}

function ParallelView() {
  const layerW = 200;
  const layerH = 50;
  const gap = 8;
  const startX = (W - layerW) / 2;
  const startY = 30;
  const numLayers = 6;

  return (
    <g>
      {Array.from({ length: numLayers }, (_, i) => {
        const y = startY + i * (layerH + gap);
        const halfW = (layerW - 8) / 2;
        return (
          <g key={i}>
            <rect x={startX} y={y} width={layerW} height={layerH} rx={4}
              fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />
            {/* SSM head left */}
            <rect x={startX + 2} y={y + 2} width={halfW} height={layerH - 4} rx={3}
              fill={COLORS.primary} opacity="0.12" stroke={COLORS.primary} strokeWidth="1" />
            <text x={startX + 2 + halfW / 2} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              SSM heads
            </text>
            {/* Attention head right */}
            <rect x={startX + halfW + 6} y={y + 2} width={halfW} height={layerH - 4} rx={3}
              fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="1" />
            <text x={startX + halfW + 6 + halfW / 2} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              Attn heads
            </text>
            {/* Plus sign */}
            <text x={startX + halfW + 3} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="12" fontWeight="700" fill={COLORS.mid} fontFamily={FONTS.mono}>+</text>
            {/* Layer label */}
            <text x={startX - 8} y={y + layerH / 2 + 4} textAnchor="end"
              fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>L{i + 1}</text>
          </g>
        );
      })}

      <rect x={40} y={startY + numLayers * (layerH + gap) + 5} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + numLayers * (layerH + gap) + 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hymba 式：每层内 SSM heads + Attention heads 并行
      </text>
      <text x={290} y={startY + numLayers * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        每层同时获得精确检索 + 高效摘要 · 适合强 ICL 小模型 · 代表: Hymba (1.5B)
      </text>
    </g>
  );
}

function SharedView() {
  const layerW = 160;
  const layerH = 22;
  const gap = 4;
  const startX = (W - layerW) / 2;
  const startY = 30;
  // Pattern: M M M A(shared1) M M M A(shared2) M M M A(shared1) M M M A(shared2)
  const layers: { type: 'mamba' | 'attention'; label: string; shared: number | null }[] = [];
  for (let g = 0; g < 4; g++) {
    for (let i = 0; i < 3; i++) {
      layers.push({ type: 'mamba', label: `Mamba ${g * 4 + i + 1}`, shared: null });
    }
    const sharedId = (g % 2) + 1;
    layers.push({ type: 'attention', label: `Attn (shared ${sharedId})`, shared: sharedId });
  }

  const attnPositions = layers
    .map((l, i) => ({ ...l, idx: i }))
    .filter(l => l.type === 'attention');

  return (
    <g>
      {layers.map((l, i) => (
        <LayerRect key={i} x={startX} y={startY + i * (layerH + gap)}
          w={layerW} h={layerH} type={l.type} label={l.label} />
      ))}

      {/* Shared connection lines */}
      {[1, 2].map((sharedId) => {
        const positions = attnPositions.filter(a => a.shared === sharedId);
        if (positions.length < 2) return null;
        const lineX = sharedId === 1 ? startX + layerW + 20 : startX + layerW + 50;
        return (
          <g key={`shared-${sharedId}`}>
            {positions.map((p, pi) => {
              const y = startY + p.idx * (layerH + gap) + layerH / 2;
              return (
                <line key={pi} x1={startX + layerW} y1={y} x2={lineX} y2={y}
                  stroke={COLORS.orange} strokeWidth="1" strokeDasharray="3 2" />
              );
            })}
            <line x1={lineX} y1={startY + positions[0].idx * (layerH + gap) + layerH / 2}
              x2={lineX} y2={startY + positions[positions.length - 1].idx * (layerH + gap) + layerH / 2}
              stroke={COLORS.orange} strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={lineX + 6} y={startY + ((positions[0].idx + positions[positions.length - 1].idx) / 2) * (layerH + gap) + layerH / 2 + 3}
              fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>共享 {sharedId}</text>
            {/* LoRA markers */}
            {positions.slice(1).map((p, pi) => (
              <text key={`lora-${pi}`} x={startX - 8} y={startY + p.idx * (layerH + gap) + layerH / 2 + 3}
                textAnchor="end" fontSize="7" fill={COLORS.purple} fontFamily={FONTS.mono}>+LoRA</text>
            ))}
          </g>
        );
      })}

      <rect x={40} y={startY + layers.length * (layerH + gap) + 5} width={500} height={52} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={290} y={startY + layers.length * (layerH + gap) + 25} textAnchor="middle" fontSize="10"
        fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Zamba2 式：2 个共享 Attention 层 + LoRA 位置特化
      </text>
      <text x={290} y={startY + layers.length * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        极致参数效率 · 适合小模型端侧部署 · 代表: Zamba2 (2.7B)
      </text>
    </g>
  );
}

export default function HybridPatternCompare() {
  const [tab, setTab] = useState<Pattern>('interleaved');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        三种 Hybrid 融合范式
      </text>

      {/* Tab buttons */}
      {TABS.map((t, i) => (
        <g key={t.key} onClick={() => setTab(t.key)} cursor="pointer">
          <rect x={140 + i * 110} y={36} width={100} height={24} rx={12}
            fill={tab === t.key ? COLORS.primary : COLORS.bgAlt}
            stroke={tab === t.key ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={190 + i * 110} y={52} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={tab === t.key ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {t.label}
          </text>
        </g>
      ))}

      <g transform="translate(0, 20)">
        {tab === 'interleaved' && <InterleavedView />}
        {tab === 'parallel' && <ParallelView />}
        {tab === 'shared' && <SharedView />}
      </g>
    </svg>
  );
}
