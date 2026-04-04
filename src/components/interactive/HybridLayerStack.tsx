import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 340;

interface LayerConfig {
  label: string;
  layers: { type: 'full' | 'swa' | 'mamba'; label: string }[];
}

const configs: LayerConfig[] = [
  {
    label: 'Gemma 2',
    layers: Array.from({ length: 8 }, (_, i) => ({
      type: (i % 2 === 0 ? 'full' : 'swa') as 'full' | 'swa',
      label: i % 2 === 0 ? 'Full Attn' : 'SWA',
    })),
  },
  {
    label: 'Jamba',
    layers: [
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'mamba', label: 'Mamba' },
      { type: 'full', label: 'Attention' },
      { type: 'mamba', label: 'Mamba' },
    ],
  },
];

const LAYER_COLORS: Record<string, { fill: string; stroke: string }> = {
  full: { fill: '#dbeafe', stroke: COLORS.primary },
  swa: { fill: '#fef3c7', stroke: COLORS.orange },
  mamba: { fill: '#dcfce7', stroke: COLORS.green },
};

export default function HybridLayerStack() {
  const colW = 200;
  const layerH = 28;
  const gap = 4;
  const startY = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Hybrid Attention 层配置对比
      </text>

      {configs.map((cfg, ci) => {
        const cx = 60 + ci * (colW + 80);
        return (
          <g key={ci}>
            <text x={cx + colW / 2} y={48} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{cfg.label}</text>
            {cfg.layers.map((layer, li) => {
              const y = startY + li * (layerH + gap);
              const c = LAYER_COLORS[layer.type];
              return (
                <g key={li}>
                  <rect x={cx} y={y} width={colW} height={layerH} rx={5}
                    fill={c.fill} stroke={c.stroke} strokeWidth={1} />
                  <text x={cx + 10} y={y + layerH / 2 + 1} dominantBaseline="middle"
                    fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
                    L{li}
                  </text>
                  <text x={cx + colW / 2} y={y + layerH / 2 + 1} textAnchor="middle"
                    dominantBaseline="middle" fontSize="9" fontWeight="600"
                    fill={c.stroke} fontFamily={FONTS.sans}>
                    {layer.label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {[
        { type: 'full', label: 'Full Attention' },
        { type: 'swa', label: 'Sliding Window' },
        { type: 'mamba', label: 'Mamba (SSM)' },
      ].map((item, i) => {
        const lx = 140 + i * 140;
        const ly = H - 20;
        const c = LAYER_COLORS[item.type];
        return (
          <g key={i}>
            <rect x={lx} y={ly - 8} width={12} height={12} rx={2}
              fill={c.fill} stroke={c.stroke} strokeWidth={1} />
            <text x={lx + 16} y={ly + 2} fontSize="8" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
