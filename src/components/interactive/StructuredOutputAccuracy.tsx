import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

interface MethodData {
  name: string;
  color: string;
  accuracy: number; // 0-100
  speed: number;    // tokens/s
  description: string;
}

const METHODS: MethodData[] = [
  {
    name: '无约束',
    color: COLORS.red,
    accuracy: 45,
    speed: 120,
    description: '直接让 LLM 生成 JSON，通过 prompt 指示格式。经常缺少引号、多余逗号、字段遗漏。',
  },
  {
    name: 'Regex-guided',
    color: COLORS.orange,
    accuracy: 82,
    speed: 95,
    description: '用正则表达式约束每一步的合法 token。可以保证基本格式，但复杂嵌套结构难以用正则表达。',
  },
  {
    name: 'FSM-guided',
    color: COLORS.primary,
    accuracy: 99,
    speed: 85,
    description: 'JSON Schema → 正则 → FSM，每步精确 mask 非法 token。保证 100% 格式合规（误差来自极端 edge case）。',
  },
  {
    name: 'FSM + Jump-Forward',
    color: COLORS.green,
    accuracy: 99,
    speed: 160,
    description: 'FSM 约束 + 确定性片段跳过。同等正确率下速度最快，确定性部分不走 LLM，节省 40-70% forward pass。',
  },
];

const BAR_LEFT = 160;
const BAR_MAX_W = 350;
const BAR_H = 26;

export default function StructuredOutputAccuracy() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [metric, setMetric] = useState<'accuracy' | 'speed'>('accuracy');

  const maxVal = metric === 'accuracy' ? 100 : Math.max(...METHODS.map(m => m.speed));

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['accuracy', 'speed'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)} style={{
            padding: '4px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: metric === m ? COLORS.primary : COLORS.light,
            color: metric === m ? '#fff' : COLORS.dark,
            fontSize: 13, fontFamily: FONTS.sans,
          }}>
            {m === 'accuracy' ? '输出合规率 (%)' : '生成速度 (tokens/s)'}
          </button>
        ))}
      </div>

      <svg width={W} height={H} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        <text x={W / 2} y={25} fontSize={13} fontWeight={600} fill={COLORS.dark}
          fontFamily={FONTS.sans} textAnchor="middle">
          {metric === 'accuracy' ? '结构化输出合规率对比' : '生成速度对比'}
        </text>

        {METHODS.map((m, i) => {
          const y = 50 + i * (BAR_H + 30);
          const val = metric === 'accuracy' ? m.accuracy : m.speed;
          const barW = (val / maxVal) * BAR_MAX_W;
          const isHovered = hovered === i;

          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Label */}
              <text x={BAR_LEFT - 8} y={y + BAR_H / 2 + 4} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.sans} textAnchor="end" fontWeight={isHovered ? 600 : 400}>
                {m.name}
              </text>

              {/* Bar */}
              <rect x={BAR_LEFT} y={y} width={barW} height={BAR_H} rx={4}
                fill={m.color} opacity={isHovered ? 1 : 0.75}
              />

              {/* Value */}
              <text x={BAR_LEFT + barW + 8} y={y + BAR_H / 2 + 4} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.mono} fontWeight={600}>
                {val}{metric === 'accuracy' ? '%' : ' t/s'}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const m = METHODS[hovered];
          const tipW = W - 40;
          const tipH = 48;
          const tipY = 50 + METHODS.length * (BAR_H + 30) + 10;
          return (
            <g>
              <rect x={20} y={tipY} width={tipW} height={tipH} rx={6}
                fill={COLORS.dark} opacity={0.95} />
              <text x={30} y={tipY + 18} fontSize={12} fill="#fff" fontFamily={FONTS.sans} fontWeight={600}>
                {m.name}
              </text>
              <text x={30} y={tipY + 36} fontSize={11} fill={COLORS.light} fontFamily={FONTS.sans}>
                {m.description}
              </text>
            </g>
          );
        })()}

        {/* Axis label */}
        <text x={BAR_LEFT + BAR_MAX_W / 2} y={H - 15} fontSize={11} fill={COLORS.mid}
          fontFamily={FONTS.sans} textAnchor="middle">
          {metric === 'accuracy' ? '合规率 (%)' : '生成速度 (tokens/s)'}
        </text>
      </svg>
    </div>
  );
}
