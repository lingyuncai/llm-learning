import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 560;

type Pattern = 'interleaved' | 'parallel' | 'shared';

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

function InterleavedView({ locale }: { locale: 'zh' | 'en' }) {
  const t = {
    zh: {
      jambaDesc: 'Jamba 式：7 Mamba + 1 Attention 为一组，部分层加 MoE',
      jambaInfo: 'KV cache 仅 1/8 · 适合长上下文大模型 · 代表: Jamba (52B/12B active)',
    },
    en: {
      jambaDesc: 'Jamba style: 7 Mamba + 1 Attention per group, with MoE on some layers',
      jambaInfo: 'KV cache only 1/8 · Suitable for long-context large models · Example: Jamba (52B/12B active)',
    },
  }[locale];
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
        {t.jambaDesc}
      </text>
      <text x={290} y={startY + 16 * (layerH + gap) + 48} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.jambaInfo}
      </text>
    </g>
  );
}

function ParallelView({ locale }: { locale: 'zh' | 'en' }) {
  const t = {
    zh: {
      ssmHeads: 'SSM heads',
      attnHeads: 'Attn heads',
      hymbaDesc: 'Hymba 式：每层内 SSM heads + Attention heads 并行',
      hymbaInfo: '每层同时获得精确检索 + 高效摘要 · 适合强 ICL 小模型 · 代表: Hymba (1.5B)',
    },
    en: {
      ssmHeads: 'SSM heads',
      attnHeads: 'Attn heads',
      hymbaDesc: 'Hymba style: SSM heads + Attention heads in parallel within each layer',
      hymbaInfo: 'Each layer gets both precise retrieval + efficient summarization · Suitable for small models with strong ICL · Example: Hymba (1.5B)',
    },
  }[locale];
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
              {t.ssmHeads}
            </text>
            {/* Attention head right */}
            <rect x={startX + halfW + 6} y={y + 2} width={halfW} height={layerH - 4} rx={3}
              fill={COLORS.orange} opacity="0.12" stroke={COLORS.orange} strokeWidth="1" />
            <text x={startX + halfW + 6 + halfW / 2} y={y + layerH / 2 + 4} textAnchor="middle"
              fontSize="8" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {t.attnHeads}
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
        {t.hymbaDesc}
      </text>
      <text x={290} y={startY + numLayers * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.hymbaInfo}
      </text>
    </g>
  );
}

function SharedView({ locale }: { locale: 'zh' | 'en' }) {
  const t = {
    zh: {
      shared: '共享',
      zamba2Desc: 'Zamba2 式：2 个共享 Attention 层 + LoRA 位置特化',
      zamba2Info: '极致参数效率 · 适合小模型端侧部署 · 代表: Zamba2 (2.7B)',
    },
    en: {
      shared: 'shared',
      zamba2Desc: 'Zamba2 style: 2 shared Attention layers + LoRA position specialization',
      zamba2Info: 'Extreme parameter efficiency · Suitable for small models on-device deployment · Example: Zamba2 (2.7B)',
    },
  }[locale];
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
              fontSize="7" fill={COLORS.orange} fontFamily={FONTS.mono}>{t.shared} {sharedId}</text>
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
        {t.zamba2Desc}
      </text>
      <text x={290} y={startY + layers.length * (layerH + gap) + 43} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.zamba2Info}
      </text>
    </g>
  );
}

export default function HybridPatternCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [tab, setTab] = useState<Pattern>('interleaved');

  const t = {
    zh: {
      title: '三种 Hybrid 融合范式',
      interleaved: '交替式',
      parallel: '并行式',
      shared: '共享式',
    },
    en: {
      title: 'Three Hybrid Fusion Paradigms',
      interleaved: 'Interleaved',
      parallel: 'Parallel',
      shared: 'Shared',
    },
  }[locale];

  const TABS: { key: Pattern; label: string }[] = [
    { key: 'interleaved', label: t.interleaved },
    { key: 'parallel', label: t.parallel },
    { key: 'shared', label: t.shared },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Tab buttons */}
      {TABS.map((tabItem, i) => (
        <g key={tabItem.key} onClick={() => setTab(tabItem.key)} cursor="pointer">
          <rect x={140 + i * 110} y={36} width={100} height={24} rx={12}
            fill={tab === tabItem.key ? COLORS.primary : COLORS.bgAlt}
            stroke={tab === tabItem.key ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={190 + i * 110} y={52} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={tab === tabItem.key ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {tabItem.label}
          </text>
        </g>
      ))}

      <g transform="translate(0, 20)">
        {tab === 'interleaved' && <InterleavedView locale={locale} />}
        {tab === 'parallel' && <ParallelView locale={locale} />}
        {tab === 'shared' && <SharedView locale={locale} />}
      </g>
    </svg>
  );
}
