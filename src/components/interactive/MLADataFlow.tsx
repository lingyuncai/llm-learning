import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

function FlowBox({ x, y, w, h, label, sub, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 5 : h / 2 + 1)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="7" fill={COLORS.mid} fontFamily={FONTS.mono}>
          {sub}
        </text>
      )}
    </g>
  );
}

export default function MLADataFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'MLA: Multi-Latent Attention 数据流',
      subtitle: '只缓存低维 c_KV（如 512 维），推理时解压为完整 K、V',
      hiddenState: 'Hidden\nState h',
      compress: 'Compress\nW_DKV',
      cache: 'Cache\nc_KV',
      cacheNote: '(小!)',
      toK: 'W_UK → K',
      toV: 'W_UV → V',
      attention: 'Attention\nOutput',
      cachePoint: '缓存点 — 大幅节省显存',
      optimization: '推理优化：W_UK 可吸收进 W_Q，避免显式解压 K — 进一步减少计算',
      adopters: '采用者：DeepSeek-V2, DeepSeek-V3, DeepSeek-R1',
    },
    en: {
      title: 'MLA: Multi-Latent Attention Data Flow',
      subtitle: 'Cache only low-dim c_KV (e.g. 512-dim), decompress to full K, V at inference',
      hiddenState: 'Hidden\nState h',
      compress: 'Compress\nW_DKV',
      cache: 'Cache\nc_KV',
      cacheNote: '(small!)',
      toK: 'W_UK → K',
      toV: 'W_UV → V',
      attention: 'Attention\nOutput',
      cachePoint: 'Cache point — significant memory savings',
      optimization: 'Inference optimization: W_UK can be absorbed into W_Q, avoiding explicit K decompression — further reduces computation',
      adopters: 'Adopters: DeepSeek-V2, DeepSeek-V3, DeepSeek-R1',
    },
  }[locale];

  const boxes = [
    { x: 10, y: 60, w: 90, h: 50, label: t.hiddenState, sub: 'd_model', fill: '#dbeafe', stroke: COLORS.primary },
    { x: 120, y: 60, w: 90, h: 50, label: t.compress, sub: 'd → d_c', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 230, y: 55, w: 90, h: 60, label: t.cache, sub: `d_c ${t.cacheNote}`, fill: '#dcfce7', stroke: COLORS.green },
    { x: 340, y: 40, w: 90, h: 40, label: t.toK, sub: 'd_c → d_k', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 340, y: 90, w: 90, h: 40, label: t.toV, sub: 'd_c → d_v', fill: '#fef3c7', stroke: COLORS.orange },
    { x: 470, y: 60, w: 90, h: 50, label: t.attention, sub: '', fill: '#dbeafe', stroke: COLORS.primary },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      <text x={W / 2} y={36} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {boxes.map((b, i) => (
        <FlowBox key={i} {...b} />
      ))}

      {/* Arrows */}
      <defs>
        <marker id="mla-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* h → compress */}
      <line x1={100} y1={85} x2={118} y2={85}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* compress → cache */}
      <line x1={210} y1={85} x2={228} y2={85}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* cache → K */}
      <line x1={320} y1={75} x2={338} y2={62}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* cache → V */}
      <line x1={320} y1={95} x2={338} y2={108}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* K → attention */}
      <line x1={430} y1={60} x2={468} y2={78}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />
      {/* V → attention */}
      <line x1={430} y1={110} x2={468} y2={92}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#mla-arr)" />

      {/* Highlight cache saving */}
      <rect x={228} y={125} width={96} height={22} rx={4}
        fill={COLORS.green} opacity={0.12} stroke={COLORS.green} strokeWidth={1} strokeDasharray="3,2" />
      <text x={276} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.cachePoint}
      </text>

      {/* Bottom note */}
      <text x={W / 2} y={175} textAnchor="middle" fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.optimization}
      </text>

      <text x={W / 2} y={192} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.adopters}
      </text>
    </svg>
  );
}
