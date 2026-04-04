import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface MoEModel {
  name: string;
  totalParams: string;
  activeParams: string;
  numExperts: string;
  topK: number;
  sharedExperts: string;
  year: string;
}

const MODELS: MoEModel[] = [
  { name: 'Switch Transformer', totalParams: '1.6T', activeParams: '~26B', numExperts: '2048', topK: 1, sharedExperts: '—', year: '2021' },
  { name: 'Mixtral 8x7B', totalParams: '47B', activeParams: '~13B', numExperts: '8', topK: 2, sharedExperts: '—', year: '2024' },
  { name: 'Mixtral 8x22B', totalParams: '141B', activeParams: '~39B', numExperts: '8', topK: 2, sharedExperts: '—', year: '2024' },
  { name: 'DeepSeek-V2', totalParams: '236B', activeParams: '21B', numExperts: '160', topK: 6, sharedExperts: '2', year: '2024' },
  { name: 'DeepSeek-V3', totalParams: '671B', activeParams: '37B', numExperts: '256', topK: 8, sharedExperts: '1', year: '2024' },
  { name: 'Qwen2.5-MoE', totalParams: '57B', activeParams: '14B', numExperts: '64', topK: 8, sharedExperts: '8', year: '2025' },
];

const cols: { key: keyof MoEModel; label: string }[] = [
  { key: 'name', label: '模型' },
  { key: 'totalParams', label: 'Total Params' },
  { key: 'activeParams', label: 'Active Params' },
  { key: 'numExperts', label: 'Experts' },
  { key: 'topK', label: 'Top-K' },
  { key: 'sharedExperts', label: 'Shared' },
  { key: 'year', label: '年份' },
];

const rowH = 22;
const headerH = 24;
const tableY = 40;

export default function MoEModelComparison() {
  const colWidths = [120, 75, 75, 60, 50, 50, 50];
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableX = (W - tableW) / 2;
  const H = tableY + headerH + MODELS.length * rowH + 20;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full my-6">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        主流 MoE 模型配置对比
      </text>

      {/* Header */}
      <rect x={tableX} y={tableY} width={tableW} height={headerH}
        fill="#f1f5f9" rx={0} />
      {cols.map((col, ci) => {
        const cx = tableX + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
        return (
          <text key={ci} x={cx + colWidths[ci] / 2} y={tableY + headerH / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {col.label}
          </text>
        );
      })}

      {/* Rows */}
      {MODELS.map((model, ri) => {
        const ry = tableY + headerH + ri * rowH;
        return (
          <g key={ri}>
            {ri % 2 === 1 && (
              <rect x={tableX} y={ry} width={tableW} height={rowH} fill="#f8fafc" />
            )}
            <line x1={tableX} y1={ry} x2={tableX + tableW} y2={ry}
              stroke="#e2e8f0" strokeWidth={0.5} />
            {cols.map((col, ci) => {
              const cx = tableX + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
              const val = String(model[col.key]);
              return (
                <text key={ci} x={cx + colWidths[ci] / 2} y={ry + rowH / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="7" fill={ci === 0 ? COLORS.primary : COLORS.dark}
                  fontWeight={ci === 0 ? '600' : '400'}
                  fontFamily={ci === 0 ? FONTS.sans : FONTS.mono}>
                  {val}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* Bottom border */}
      <line x1={tableX} y1={tableY + headerH + MODELS.length * rowH}
        x2={tableX + tableW} y2={tableY + headerH + MODELS.length * rowH}
        stroke="#e2e8f0" strokeWidth={0.5} />
    </svg>
  );
}
