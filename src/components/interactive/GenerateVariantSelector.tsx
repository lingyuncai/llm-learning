// src/components/interactive/GenerateVariantSelector.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
  className?: string;
}

const MIN_RESPONSE_LEN = 128;
const VARIANTS = [256, 512, 1024, 1152] as const;
const MAX_VARIANT = VARIANTS[VARIANTS.length - 1];
const MAX_PROMPT = 2048;

// Distinct colors per variant — ordered small to large
const VARIANT_COLORS = {
  256: '#00838f',   // teal
  512: '#1565c0',   // blue
  1024: '#6a1b9a',  // purple
  1152: '#e65100',  // orange
} as const;

export default function GenerateVariantSelector({ locale = 'zh', className }: Props) {
  const t = {
    zh: {
      title: 'NPUW Generate 变体选择模拟',
      promptLength: 'Prompt 长度',
      tokens: 'tokens',
      requiredCapacity: '所需容量',
      selectedVariant: '选中变体',
      utilization: '利用率',
      waste: '浪费',
      memoryLayout: '内存布局',
      needed: '已用',
      padding: '填充',
      exceeds: '超出所有变体容量！',
      exceedsDetail: '所需容量超过最大变体 (1152)，需要分块处理或扩展变体。',
      explanation:
        '所有变体共享同一块连续内存缓冲区。最大变体 (1152) 分配整块内存，较小变体是前缀切片。运行时选择能容纳 prompt + 128 预留空间的最小变体。',
      none: '无',
      reserved: '(prompt + 128 预留)',
    },
    en: {
      title: 'NPUW Generate Variant Selection Simulator',
      promptLength: 'Prompt length',
      tokens: 'tokens',
      requiredCapacity: 'Required capacity',
      selectedVariant: 'Selected variant',
      utilization: 'Utilization',
      waste: 'Waste',
      memoryLayout: 'Memory layout',
      needed: 'Used',
      padding: 'Padding',
      exceeds: 'Exceeds all variant capacities!',
      exceedsDetail: 'Required capacity exceeds the max variant (1152). Chunking or extended variants needed.',
      explanation:
        'All variants share the same contiguous memory buffer. The largest variant (1152) allocates the full block; smaller variants are prefix slices. At runtime the smallest variant that fits prompt + 128 reserved tokens is selected.',
      none: 'None',
      reserved: '(prompt + 128 reserved)',
    },
  }[locale];

  const [promptLen, setPromptLen] = useState(300);

  const calc = useMemo(() => {
    const needed = promptLen + MIN_RESPONSE_LEN;
    const selected = VARIANTS.find(v => v >= needed) ?? null;
    const utilization = selected !== null ? (needed / selected) * 100 : 0;
    const waste = selected !== null ? ((selected - needed) / selected) * 100 : 0;
    return { needed, selected, utilization, waste };
  }, [promptLen]);

  // Utilization color coding
  const utilizationColor =
    calc.utilization >= 70 ? COLORS.green : calc.utilization >= 40 ? COLORS.orange : COLORS.red;

  // SVG dimensions
  const svgW = 600;
  const svgH = 120;
  const barX = 50;
  const barW = svgW - 100;
  const barY = 35;
  const barH = 50;

  return (
    <div className={`my-6 p-4 bg-white rounded-lg border ${className ?? ''}`} style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-4 text-center" style={{ color: COLORS.dark }}>
        {t.title}
      </h3>

      {/* Prompt length slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: COLORS.mid }}>{t.promptLength}</span>
          <span className="text-sm font-mono font-semibold" style={{ color: COLORS.primary }}>
            {promptLen} {t.tokens}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PROMPT}
          step={1}
          value={promptLen}
          onChange={e => setPromptLen(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: COLORS.primary }}
        />
        <div className="flex justify-between text-[10px] mt-0.5" style={{ color: COLORS.mid }}>
          <span>0</span>
          <span>{MAX_PROMPT}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 text-center">
        {/* Required capacity */}
        <div
          className="p-2 rounded border text-xs"
          style={{ borderColor: `${COLORS.primary}40`, backgroundColor: `${COLORS.primary}08` }}
        >
          <div className="text-[10px] mb-0.5" style={{ color: COLORS.mid }}>{t.requiredCapacity}</div>
          <div className="text-lg font-bold font-mono" style={{ color: COLORS.primary }}>{calc.needed}</div>
          <div className="text-[9px]" style={{ color: COLORS.mid }}>{t.reserved}</div>
        </div>

        {/* Selected variant */}
        <motion.div
          className="p-2 rounded border text-xs"
          style={{
            borderColor: calc.selected !== null ? `${VARIANT_COLORS[calc.selected]}40` : `${COLORS.red}40`,
            backgroundColor: calc.selected !== null ? `${VARIANT_COLORS[calc.selected]}08` : `${COLORS.red}08`,
          }}
          layout
          transition={{ duration: 0.3 }}
        >
          <div className="text-[10px] mb-0.5" style={{ color: COLORS.mid }}>{t.selectedVariant}</div>
          <div
            className="text-lg font-bold font-mono"
            style={{ color: calc.selected !== null ? VARIANT_COLORS[calc.selected] : COLORS.red }}
          >
            {calc.selected !== null ? calc.selected : t.none}
          </div>
        </motion.div>

        {/* Utilization */}
        <motion.div
          className="p-2 rounded border text-xs"
          style={{ borderColor: `${utilizationColor}40`, backgroundColor: `${utilizationColor}08` }}
          layout
          transition={{ duration: 0.3 }}
        >
          <div className="text-[10px] mb-0.5" style={{ color: COLORS.mid }}>{t.utilization}</div>
          <div className="text-lg font-bold font-mono" style={{ color: utilizationColor }}>
            {calc.selected !== null ? `${calc.utilization.toFixed(1)}%` : '—'}
          </div>
        </motion.div>

        {/* Waste */}
        <div
          className="p-2 rounded border text-xs"
          style={{ borderColor: `${COLORS.red}40`, backgroundColor: `${COLORS.red}08` }}
        >
          <div className="text-[10px] mb-0.5" style={{ color: COLORS.mid }}>{t.waste}</div>
          <div className="text-lg font-bold font-mono" style={{ color: COLORS.red }}>
            {calc.selected !== null ? `${calc.waste.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Exceeds warning */}
      {calc.selected === null && (
        <motion.div
          className="mb-4 p-3 rounded-md border text-center"
          style={{ borderColor: COLORS.red, backgroundColor: `${COLORS.red}10` }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-semibold" style={{ color: COLORS.red }}>{t.exceeds}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.mid }}>{t.exceedsDetail}</div>
        </motion.div>
      )}

      {/* Memory layout SVG */}
      <div className="text-xs font-semibold mb-2" style={{ color: COLORS.dark }}>{t.memoryLayout}</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full mb-3">
        {/* Full memory block background */}
        <rect x={barX} y={barY} width={barW} height={barH} rx={4} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        {/* Variant segments — rendered back to front (largest first) so smaller ones layer on top */}
        {[...VARIANTS].reverse().map(variant => {
          const w = (variant / MAX_VARIANT) * barW;
          const isSelected = variant === calc.selected;
          const color = VARIANT_COLORS[variant];
          const opacity = isSelected ? 1 : 0.15;

          return (
            <motion.rect
              key={variant}
              x={barX}
              y={barY}
              width={w}
              height={barH}
              rx={4}
              fill={color}
              fillOpacity={opacity}
              stroke={color}
              strokeWidth={isSelected ? 1.5 : 0.5}
              strokeOpacity={isSelected ? 0.8 : 0.3}
              animate={{ fillOpacity: opacity, strokeWidth: isSelected ? 1.5 : 0.5 }}
              transition={{ duration: 0.35 }}
            />
          );
        })}

        {/* "Needed" fill within the selected variant */}
        {calc.selected !== null && (
          <motion.rect
            x={barX}
            y={barY + 2}
            height={barH - 4}
            rx={3}
            fill={VARIANT_COLORS[calc.selected]}
            fillOpacity={0.45}
            animate={{ width: (calc.needed / MAX_VARIANT) * barW }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        )}

        {/* Variant boundary labels */}
        {VARIANTS.map(variant => {
          const x = barX + (variant / MAX_VARIANT) * barW;
          return (
            <g key={`label-${variant}`}>
              <line
                x1={x}
                y1={barY - 2}
                x2={x}
                y2={barY + barH + 2}
                stroke={VARIANT_COLORS[variant]}
                strokeWidth={variant === calc.selected ? 1.5 : 0.7}
                strokeDasharray={variant === calc.selected ? 'none' : '3,2'}
                opacity={variant === calc.selected ? 0.9 : 0.4}
              />
              <text
                x={x}
                y={barY - 6}
                textAnchor="middle"
                fontSize="8"
                fontWeight={variant === calc.selected ? '700' : '500'}
                fill={VARIANT_COLORS[variant]}
                fontFamily={FONTS.mono}
                opacity={variant === calc.selected ? 1 : 0.5}
              >
                {variant}
              </text>
            </g>
          );
        })}

        {/* "Needed" marker */}
        {calc.selected !== null && (
          <g>
            <line
              x1={barX + (calc.needed / MAX_VARIANT) * barW}
              y1={barY + barH + 2}
              x2={barX + (calc.needed / MAX_VARIANT) * barW}
              y2={barY + barH + 12}
              stroke={COLORS.dark}
              strokeWidth={1}
            />
            <text
              x={barX + (calc.needed / MAX_VARIANT) * barW}
              y={barY + barH + 20}
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={COLORS.dark}
              fontFamily={FONTS.mono}
            >
              {t.needed}: {calc.needed}
            </text>
          </g>
        )}

        {/* Legend in the top-left */}
        <text x={barX} y={barY - 16} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          0
        </text>
        <text x={barX + barW} y={barY - 16} textAnchor="end" fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {MAX_VARIANT} tokens
        </text>

        {/* Padding label when there's visible waste */}
        {calc.selected !== null && calc.waste > 5 && (
          <text
            x={barX + ((calc.needed + calc.selected) / 2 / MAX_VARIANT) * barW}
            y={barY + barH / 2 + 3}
            textAnchor="middle"
            fontSize="7"
            fontWeight="500"
            fill={VARIANT_COLORS[calc.selected]}
            fontFamily={FONTS.sans}
            opacity={0.7}
          >
            {t.padding}
          </text>
        )}
      </svg>

      {/* Explanation */}
      <p className="text-xs text-center leading-relaxed" style={{ color: COLORS.mid }}>
        {t.explanation}
      </p>
    </div>
  );
}
