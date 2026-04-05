import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 320;

interface DataType {
  name: string;
  fields: { label: string; bits: number; color: string }[];
  totalBits: number;
  range: string;
  precision: string;
  example: string;
}

const DATA_TYPES: DataType[] = [
  {
    name: 'FP32',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exponent', bits: 8, color: COLORS.primary },
      { label: 'Mantissa', bits: 23, color: COLORS.green },
    ],
    totalBits: 32,
    range: '±3.4×10³⁸',
    precision: '~7.2 位有效数字',
    example: '1.0 = 0 01111111 00000000000000000000000',
  },
  {
    name: 'FP16',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 5, color: COLORS.primary },
      { label: 'Mantissa', bits: 10, color: COLORS.green },
    ],
    totalBits: 16,
    range: '±65504',
    precision: '~3.3 位有效数字',
    example: '1.0 = 0 01111 0000000000',
  },
  {
    name: 'BF16',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exponent', bits: 8, color: COLORS.primary },
      { label: 'Mantissa', bits: 7, color: COLORS.green },
    ],
    totalBits: 16,
    range: '±3.4×10³⁸',
    precision: '~2.4 位有效数字',
    example: '1.0 = 0 01111111 0000000',
  },
  {
    name: 'INT8',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Value', bits: 7, color: COLORS.purple },
    ],
    totalBits: 8,
    range: '[-128, 127]',
    precision: '精确整数',
    example: '42 = 0 0101010',
  },
  {
    name: 'INT4',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Value', bits: 3, color: COLORS.purple },
    ],
    totalBits: 4,
    range: '[-8, 7]',
    precision: '精确整数 (16 个值)',
    example: '5 = 0 101',
  },
  {
    name: 'FP8 E4M3',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 4, color: COLORS.primary },
      { label: 'Man', bits: 3, color: COLORS.green },
    ],
    totalBits: 8,
    range: '±448',
    precision: '~1.6 位有效数字',
    example: '1.0 = 0 0111 000',
  },
  {
    name: 'FP8 E5M2',
    fields: [
      { label: 'S', bits: 1, color: COLORS.red },
      { label: 'Exp', bits: 5, color: COLORS.primary },
      { label: 'M', bits: 2, color: COLORS.green },
    ],
    totalBits: 8,
    range: '±57344',
    precision: '~1 位有效数字',
    example: '1.0 = 0 01111 00',
  },
];

export default function DataTypeBitLayout() {
  const [selected, setSelected] = useState(0);
  const dt = DATA_TYPES[selected];

  const bitBoxW = Math.min(16, (W - 80) / dt.totalBits);
  const startX = (W - dt.totalBits * bitBoxW) / 2;
  const bitY = 100;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Type selector buttons */}
      {DATA_TYPES.map((t, i) => {
        const bx = 15 + i * 80;
        return (
          <g key={t.name} onClick={() => setSelected(i)} cursor="pointer">
            <rect x={bx} y={10} width={74} height={24} rx={4}
              fill={i === selected ? COLORS.primary : COLORS.bgAlt}
              stroke={i === selected ? COLORS.primary : COLORS.light}
              strokeWidth={1} />
            <text x={bx + 37} y={26} textAnchor="middle" fontSize="8"
              fontWeight={i === selected ? '700' : '400'}
              fill={i === selected ? '#fff' : COLORS.mid}
              fontFamily={FONTS.sans}>{t.name}</text>
          </g>
        );
      })}

      {/* Title */}
      <text x={W / 2} y={60} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {dt.name} — {dt.totalBits} bits
      </text>

      {/* Bit boxes */}
      {(() => {
        let bitIdx = 0;
        return dt.fields.map((field) => {
          const elements = [];
          for (let b = 0; b < field.bits; b++) {
            const x = startX + bitIdx * bitBoxW;
            elements.push(
              <rect key={bitIdx} x={x} y={bitY} width={bitBoxW - 1} height={28}
                rx={2} fill={field.color} opacity={0.2}
                stroke={field.color} strokeWidth={1} />
            );
            bitIdx++;
          }
          const labelX = startX + (bitIdx - field.bits / 2) * bitBoxW;
          elements.push(
            <text key={`label-${field.label}`} x={labelX - bitBoxW / 2}
              y={bitY + 48} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={field.color} fontFamily={FONTS.sans}>
              {field.label} ({field.bits})
            </text>
          );
          return elements;
        });
      })()}

      {/* Legend */}
      {[
        { label: 'Sign', color: COLORS.red },
        { label: 'Exponent', color: COLORS.primary },
        { label: 'Mantissa/Value', color: COLORS.green },
      ].map((item, i) => (
        <g key={item.label}>
          <rect x={140 + i * 140} y={170} width={10} height={10} rx={2}
            fill={item.color} opacity={0.3} stroke={item.color} strokeWidth={1} />
          <text x={154 + i * 140} y={179} fontSize="7" fill={COLORS.mid}
            fontFamily={FONTS.sans}>{item.label}</text>
        </g>
      ))}

      {/* Info panel */}
      <rect x={40} y={195} width={W - 80} height={110} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
      <text x={60} y={218} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">表示范围: </tspan>{dt.range}
      </text>
      <text x={60} y={238} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">精度: </tspan>{dt.precision}
      </text>
      <text x={60} y={258} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
        <tspan fontWeight="600">编码示例: </tspan>
      </text>
      <text x={60} y={278} fontSize="8" fill={COLORS.mid} fontFamily={FONTS.mono}>
        {dt.example}
      </text>

      {/* BF16 vs FP16 hint */}
      {(dt.name === 'BF16' || dt.name === 'FP16') && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="7" fill={COLORS.orange}
          fontFamily={FONTS.sans}>
          {dt.name === 'BF16'
            ? 'BF16 与 FP32 相同的 8-bit exponent — 相同的动态范围，但 mantissa 仅 7 位'
            : 'FP16 仅 5-bit exponent — 动态范围有限，但 10-bit mantissa 精度更高'}
        </text>
      )}
    </svg>
  );
}
