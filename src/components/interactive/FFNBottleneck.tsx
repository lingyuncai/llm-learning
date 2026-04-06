// src/components/interactive/FFNBottleneck.tsx
import { COLORS } from './shared/colors';

export default function FFNBottleneck({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      input: '输入',
      title: '↑ "菱形"结构：先扩维再压缩 ↑',
    },
    en: {
      input: 'Input',
      title: '↑ "Diamond" Structure: Expand then Compress ↑',
    },
  };

  const H = 4096;
  const fourH = H * 4;
  const minW = 60;
  const maxW = 200;
  const blockH = 50;
  const gap = 70;

  const stages = [
    { label: t[locale].input, dim: `(B, S, H)`, w: minW, color: COLORS.bgAlt },
    { label: 'Linear₁', dim: `(B, S, 4H)`, w: maxW, color: '#dbeafe' },
    { label: 'GELU', dim: `(B, S, 4H)`, w: maxW, color: '#dbeafe' },
    { label: 'Linear₂', dim: `(B, S, H)`, w: minW, color: COLORS.bgAlt },
  ];

  const totalW = 700;
  const totalH = 200;
  const centerY = totalH / 2;
  const startX = 50;
  const spacing = (totalW - 100) / (stages.length - 1);

  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full max-w-2xl mx-auto">
        {stages.map((stage, i) => {
          const cx = startX + i * spacing;
          const w = stage.w;
          const h = blockH;
          const x = cx - w / 2;
          const y = centerY - h / 2;

          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx={6}
                fill={stage.color} stroke={COLORS.primary} strokeWidth={1.5} />
              <text x={cx} y={centerY + 1} textAnchor="middle" fontSize="12"
                fill={COLORS.dark} fontFamily="system-ui" fontWeight="600">
                {stage.label}
              </text>
              <text x={cx} y={centerY + h / 2 + 18} textAnchor="middle"
                fontSize="10" fill={COLORS.mid} fontFamily="monospace">
                {stage.dim}
              </text>

              {i < stages.length - 1 && (
                <>
                  <defs>
                    <marker id={`ffn-arr-${i}`} viewBox="0 0 10 10" refX="10" refY="5"
                      markerWidth="5" markerHeight="5" orient="auto-start-auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
                    </marker>
                  </defs>
                  <line
                    x1={x + w} y1={centerY}
                    x2={startX + (i + 1) * spacing - stages[i + 1].w / 2 - 2} y2={centerY}
                    stroke={COLORS.mid} strokeWidth={1.5} markerEnd={`url(#ffn-arr-${i})`}
                  />
                </>
              )}
            </g>
          );
        })}

        <text x={totalW / 2} y={22} textAnchor="middle" fontSize="11" fill={COLORS.orange}
          fontFamily="system-ui" fontWeight="600">
          {t[locale].title}
        </text>
      </svg>
    </div>
  );
}
