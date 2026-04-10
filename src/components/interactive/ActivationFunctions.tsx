import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type FnKey = 'relu' | 'gelu' | 'swish';

// ── Math functions ──
const relu = (x: number) => Math.max(0, x);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const swish = (x: number) => x * sigmoid(x);
const gelu = (x: number) => {
  const c = Math.sqrt(2 / Math.PI);
  return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
};

const FN_MAP: Record<FnKey, (x: number) => number> = { relu, gelu, swish };

const TEXTS = {
  zh: {
    title: '激活函数对比',
    relu: {
      name: 'ReLU',
      formula: 'max(0, x)',
      pros: '计算简单；梯度非零区域恒为 1，不存在梯度消失',
      cons: '负区域梯度为 0（"死亡神经元"）；零点不可导',
      used: 'Transformer 原始论文 (2017)',
    },
    gelu: {
      name: 'GELU',
      formula: 'x · Φ(x)',
      pros: '平滑可导；允许小的负值通过，信息保留更好',
      cons: '计算比 ReLU 贵（需要 tanh 近似）；无门控机制',
      used: 'GPT-2, BERT, GPT-3',
    },
    swish: {
      name: 'Swish (SiLU)',
      formula: 'x · σ(x)',
      pros: '平滑；自门控 — 输入本身决定"放行"多少；SwiGLU 的激活基础',
      cons: '负区域的负值可能引入噪声；单独用不如 SwiGLU',
      used: 'SwiGLU 的激活部分 → LLaMA, Mistral, Gemma',
    },
    prosLabel: '优势',
    consLabel: '劣势',
    usedLabel: '采用者',
    ffnTitle: 'FFN 结构对比',
    standard: '标准 FFN（2 个权重矩阵）',
    swiglu: 'SwiGLU FFN（3 个权重矩阵）',
  },
  en: {
    title: 'Activation Function Comparison',
    relu: {
      name: 'ReLU',
      formula: 'max(0, x)',
      pros: 'Simple computation; constant gradient of 1 in positive region, no vanishing gradient',
      cons: 'Zero gradient for negative inputs ("dying neurons"); non-differentiable at zero',
      used: 'Original Transformer (2017)',
    },
    gelu: {
      name: 'GELU',
      formula: 'x · Φ(x)',
      pros: 'Smooth and differentiable; allows small negative values through, better information retention',
      cons: 'More expensive than ReLU (requires tanh approximation); no gating mechanism',
      used: 'GPT-2, BERT, GPT-3',
    },
    swish: {
      name: 'Swish (SiLU)',
      formula: 'x · σ(x)',
      pros: 'Smooth; self-gated — the input itself controls how much passes through; basis for SwiGLU',
      cons: 'Negative values in the negative region may introduce noise; alone not as good as SwiGLU',
      used: 'Activation basis of SwiGLU → LLaMA, Mistral, Gemma',
    },
    prosLabel: 'Pros',
    consLabel: 'Cons',
    usedLabel: 'Used by',
    ffnTitle: 'FFN Architecture Comparison',
    standard: 'Standard FFN (2 weight matrices)',
    swiglu: 'SwiGLU FFN (3 weight matrices)',
  },
};

// ── Chart constants ──
const CHART_W = 400;
const CHART_H = 240;
const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;
const X_MIN = -4, X_MAX = 4;
const Y_MIN = -1.5, Y_MAX = 4;

const toSvgX = (x: number) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
const toSvgY = (y: number) => PAD.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * PLOT_H;

function buildPath(fn: (x: number) => number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = X_MIN + (i / 200) * (X_MAX - X_MIN);
    const y = Math.max(Y_MIN, Math.min(Y_MAX, fn(x)));
    const cmd = i === 0 ? 'M' : 'L';
    pts.push(`${cmd}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
  }
  return pts.join(' ');
}

const FN_COLORS: Record<FnKey, string> = {
  relu: COLORS.red,
  gelu: COLORS.primary,
  swish: COLORS.green,
};

// ── FFN diagram constants ──
const FFN_W = 520;
const FFN_H = 190;

export default function ActivationFunctions({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = TEXTS[locale];
  const [active, setActive] = useState<FnKey>('swish');
  const [hoveredFn, setHoveredFn] = useState<FnKey | null>(null);

  const allFns: FnKey[] = ['relu', 'gelu', 'swish'];

  return (
    <div className="my-6 space-y-4">
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {allFns.map(key => {
          const isActive = active === key;
          return (
            <button key={key}
              onClick={() => setActive(key)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: isActive ? FN_COLORS[key] : '#f1f5f9',
                color: isActive ? '#fff' : '#475569',
              }}>
              {t[key].name}
            </button>
          );
        })}
      </div>

      {/* Chart + Info side by side */}
      <div className="flex flex-wrap gap-4 items-start">
        {/* Curve chart */}
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          style={{ flex: '1 1 340px', minWidth: 280, maxWidth: 440, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          {/* Grid lines */}
          {[-1, 0, 1, 2, 3, 4].map(v => (
            <g key={`gy${v}`}>
              <line x1={PAD.left} y1={toSvgY(v)} x2={CHART_W - PAD.right} y2={toSvgY(v)}
                stroke="#e5e7eb" strokeWidth={v === 0 ? 1.2 : 0.5} />
              <text x={PAD.left - 6} y={toSvgY(v) + 3.5} textAnchor="end"
                fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>{v}</text>
            </g>
          ))}
          {[-4, -2, 0, 2, 4].map(v => (
            <g key={`gx${v}`}>
              <line x1={toSvgX(v)} y1={PAD.top} x2={toSvgX(v)} y2={CHART_H - PAD.bottom}
                stroke="#e5e7eb" strokeWidth={v === 0 ? 1.2 : 0.5} />
              <text x={toSvgX(v)} y={CHART_H - PAD.bottom + 14} textAnchor="middle"
                fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>{v}</text>
            </g>
          ))}

          {/* All curves (dimmed when not active) */}
          {allFns.map(key => {
            const isActive = active === key;
            const isHovered = hoveredFn === key;
            return (
              <path key={key}
                d={buildPath(FN_MAP[key])}
                fill="none"
                stroke={FN_COLORS[key]}
                strokeWidth={isActive || isHovered ? 2.5 : 1.2}
                opacity={isActive ? 1 : isHovered ? 0.8 : 0.25}
                onMouseEnter={() => setHoveredFn(key)}
                onMouseLeave={() => setHoveredFn(null)}
                onClick={() => setActive(key)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}

          {/* Legend */}
          {allFns.map((key, i) => (
            <g key={`leg-${key}`} transform={`translate(${PAD.left + 8 + i * 100}, ${PAD.top + 6})`}
              onMouseEnter={() => setHoveredFn(key)}
              onMouseLeave={() => setHoveredFn(null)}
              onClick={() => setActive(key)}
              style={{ cursor: 'pointer' }}>
              <rect x={0} y={0} width={10} height={10} rx={2} fill={FN_COLORS[key]}
                opacity={active === key ? 1 : 0.4} />
              <text x={14} y={9} fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}
                fontWeight={active === key ? '600' : '400'}>{t[key].name}</text>
            </g>
          ))}
        </svg>

        {/* Info card */}
        <div className="flex-1 min-w-[240px] p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2">
          <div className="font-bold text-base" style={{ color: FN_COLORS[active] }}>
            {t[active].name}
          </div>
          <div className="font-mono text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
            f(x) = {t[active].formula}
          </div>
          <div>
            <span className="font-semibold text-green-700">{t.prosLabel}：</span>
            {t[active].pros}
          </div>
          <div>
            <span className="font-semibold text-red-700">{t.consLabel}：</span>
            {t[active].cons}
          </div>
          <div>
            <span className="font-semibold text-gray-600">{t.usedLabel}：</span>
            {t[active].used}
          </div>
        </div>
      </div>

      {/* FFN architecture comparison */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2 text-center">{t.ffnTitle}</p>
        <svg viewBox={`0 0 ${FFN_W} ${FFN_H}`} className="w-full" style={{ maxWidth: FFN_W }}>
          <defs>
            <marker id="act-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <path d="M0,0 L7,2.5 L0,5" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Standard FFN (top row) */}
          <text x={260} y={16} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans} fontWeight="600">
            {t.standard}
          </text>
          {(() => {
            const y = 30;
            const bh = 32;
            const blocks = [
              { label: 'x', w: 40, fill: '#f8fafc', stroke: '#94a3b8' },
              { label: 'W₁ (H→4H)', w: 90, fill: '#dbeafe', stroke: COLORS.primary },
              { label: 'GELU', w: 55, fill: '#fef3c7', stroke: '#f59e0b' },
              { label: 'W₂ (4H→H)', w: 90, fill: '#dbeafe', stroke: COLORS.primary },
              { label: 'out', w: 40, fill: '#f8fafc', stroke: '#94a3b8' },
            ];
            let cx = 30;
            return blocks.map((b, i) => {
              const x = cx;
              cx += b.w + 20;
              const nextX = cx;
              return (
                <g key={`std-${i}`}>
                  <rect x={x} y={y} width={b.w} height={bh} rx={5}
                    fill={b.fill} stroke={b.stroke} strokeWidth={1.2} />
                  <text x={x + b.w / 2} y={y + bh / 2 + 4} textAnchor="middle"
                    fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}>{b.label}</text>
                  {i < blocks.length - 1 && (
                    <line x1={x + b.w + 2} y1={y + bh / 2} x2={nextX - 2} y2={y + bh / 2}
                      stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />
                  )}
                </g>
              );
            });
          })()}

          {/* SwiGLU FFN (bottom row) */}
          <text x={260} y={92} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans} fontWeight="600">
            {t.swiglu}
          </text>
          {(() => {
            const y1 = 105;
            const y2 = 145;
            const bh = 28;
            const xStart = 30;
            // Input
            const inW = 40;
            // Gate path (top)
            const gateX = 120;
            const gateW = 90;
            const swishX = gateX + gateW + 22;
            const swishW = 55;
            // Up path (bottom)
            const upX = 120;
            const upW = 90;
            // Multiply
            const mulX = swishX + swishW + 22;
            const mulW = 28;
            // Down projection
            const downX = mulX + mulW + 22;
            const downW = 90;
            // Output
            const outX = downX + downW + 22;
            const outW = 40;
            const midY = (y1 + bh / 2 + y2 + bh / 2) / 2;

            return (
              <g>
                {/* Input block */}
                <rect x={xStart} y={midY - bh / 2} width={inW} height={bh} rx={5}
                  fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
                <text x={xStart + inW / 2} y={midY + 4} textAnchor="middle"
                  fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}>x</text>

                {/* Fork arrows from input */}
                <line x1={xStart + inW + 2} y1={midY} x2={gateX - 2} y2={y1 + bh / 2}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />
                <line x1={xStart + inW + 2} y1={midY} x2={upX - 2} y2={y2 + bh / 2}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />

                {/* Gate path: W_gate → Swish */}
                <rect x={gateX} y={y1} width={gateW} height={bh} rx={5}
                  fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
                <text x={gateX + gateW / 2} y={y1 + bh / 2 + 4} textAnchor="middle"
                  fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>W_gate (H→d)</text>
                <line x1={gateX + gateW + 2} y1={y1 + bh / 2} x2={swishX - 2} y2={y1 + bh / 2}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />
                <rect x={swishX} y={y1} width={swishW} height={bh} rx={5}
                  fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.2} />
                <text x={swishX + swishW / 2} y={y1 + bh / 2 + 4} textAnchor="middle"
                  fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}>Swish</text>

                {/* Up path: W_up */}
                <rect x={upX} y={y2} width={upW} height={bh} rx={5}
                  fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
                <text x={upX + upW / 2} y={y2 + bh / 2 + 4} textAnchor="middle"
                  fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>W_up (H→d)</text>

                {/* Arrows to multiply */}
                <line x1={swishX + swishW + 2} y1={y1 + bh / 2} x2={mulX + mulW / 2} y2={midY - bh / 2}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />
                <line x1={upX + upW + 2} y1={y2 + bh / 2} x2={mulX + mulW / 2} y2={midY + bh / 2}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />

                {/* Multiply node */}
                <rect x={mulX} y={midY - bh / 2} width={mulW} height={bh} rx={14}
                  fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.2} />
                <text x={mulX + mulW / 2} y={midY + 5} textAnchor="middle"
                  fontSize="14" fill={COLORS.dark} fontFamily={FONTS.mono} fontWeight="700">⊙</text>

                {/* Arrow to W_down */}
                <line x1={mulX + mulW + 2} y1={midY} x2={downX - 2} y2={midY}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />

                {/* W_down */}
                <rect x={downX} y={midY - bh / 2} width={downW} height={bh} rx={5}
                  fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
                <text x={downX + downW / 2} y={midY + 4} textAnchor="middle"
                  fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>W_down (d→H)</text>

                {/* Arrow to output */}
                <line x1={downX + downW + 2} y1={midY} x2={outX - 2} y2={midY}
                  stroke={COLORS.mid} strokeWidth={1.2} markerEnd="url(#act-arrow)" />

                {/* Output */}
                <rect x={outX} y={midY - bh / 2} width={outW} height={bh} rx={5}
                  fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
                <text x={outX + outW / 2} y={midY + 4} textAnchor="middle"
                  fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}>out</text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
