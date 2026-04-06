import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

type Region = 'super-d' | 'super-dmin' | 'sub-scales' | 'sub-mins' | 'quant-hi' | 'quant-lo';

interface RegionInfo {
  name: string;
  color: string;
  byteStart: number;
  byteEnd: number;
  bitCount: number;
  desc: string;
}

const TOTAL_BYTES = 144;
const NUM_VALUES = 256;
const BLOCK_SIZE = 32;

// Deterministic synthetic weights
const FP16_VALUES = Array.from({ length: NUM_VALUES }, (_, i) => {
  const sub = Math.floor(i / BLOCK_SIZE);
  return Math.sin(i * 0.3 + sub * 1.7) * 0.08;
});
const maxAbs = Math.max(...FP16_VALUES.map(Math.abs));

export default function Q4KMBitPacking({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Q4_K_M Super-block 内存布局 (256 值 → 144 字节)',
      originalWeights: '原始 FP16 权重',
      formula: 'wᵢ = d · sᵦ · qᵢ − dmin · mᵦ',
      compressedBytes: '压缩后字节流 (144 bytes)',
      labelD: 'd | dmin',
      labelScales: 'scales | mins',
      labelQuantHi: 'quant hi-2bit',
      labelQuantLo: 'quant lo-4bit',
      clickDetail: '点击字节查看详情',
      regionColor: '区域颜色',
      bottomNote: '点击字节流中的区域查看字段详情 | Q4_K_M 平均 ~4.84 bits per weight',
      regions: {
        'super-d': { name: 'Super-scale (d)', desc: 'FP16 全局缩放因子' },
        'super-dmin': { name: 'Super-min (dmin)', desc: 'FP16 全局偏移' },
        'sub-scales': { name: 'Sub-block scales', desc: '8×6-bit 子块缩放因子' },
        'sub-mins': { name: 'Sub-block mins', desc: '8×6-bit 子块偏移' },
        'quant-hi': { name: 'Quant values (hi)', desc: '256×2-bit 高位' },
        'quant-lo': { name: 'Quant values (lo)', desc: '256×4-bit 低位' },
      },
    },
    en: {
      title: 'Q4_K_M Super-block Memory Layout (256 values → 144 bytes)',
      originalWeights: 'Original FP16 Weights',
      formula: 'wᵢ = d · sᵦ · qᵢ − dmin · mᵦ',
      compressedBytes: 'Compressed Byte Stream (144 bytes)',
      labelD: 'd | dmin',
      labelScales: 'scales | mins',
      labelQuantHi: 'quant hi-2bit',
      labelQuantLo: 'quant lo-4bit',
      clickDetail: 'Click bytes to view details',
      regionColor: 'Region color',
      bottomNote: 'Click regions in byte stream to see field details | Q4_K_M avg ~4.84 bits per weight',
      regions: {
        'super-d': { name: 'Super-scale (d)', desc: 'FP16 global scaling factor' },
        'super-dmin': { name: 'Super-min (dmin)', desc: 'FP16 global offset' },
        'sub-scales': { name: 'Sub-block scales', desc: '8×6-bit sub-block scales' },
        'sub-mins': { name: 'Sub-block mins', desc: '8×6-bit sub-block offsets' },
        'quant-hi': { name: 'Quant values (hi)', desc: '256×2-bit high bits' },
        'quant-lo': { name: 'Quant values (lo)', desc: '256×4-bit low bits' },
      },
    },
  }[locale];

  const REGIONS: Record<Region, RegionInfo> = {
    'super-d':    { name: t.regions['super-d'].name,   color: COLORS.primary, byteStart: 0,  byteEnd: 2,   bitCount: 16, desc: t.regions['super-d'].desc },
    'super-dmin': { name: t.regions['super-dmin'].name,  color: COLORS.primary, byteStart: 2,  byteEnd: 4,   bitCount: 16, desc: t.regions['super-dmin'].desc },
    'sub-scales': { name: t.regions['sub-scales'].name,  color: COLORS.orange,  byteStart: 4,  byteEnd: 10,  bitCount: 48, desc: t.regions['sub-scales'].desc },
    'sub-mins':   { name: t.regions['sub-mins'].name,    color: COLORS.orange,  byteStart: 10, byteEnd: 16,  bitCount: 48, desc: t.regions['sub-mins'].desc },
    'quant-hi':   { name: t.regions['quant-hi'].name, color: '#9e9e9e',      byteStart: 16, byteEnd: 80,  bitCount: 512, desc: t.regions['quant-hi'].desc },
    'quant-lo':   { name: t.regions['quant-lo'].name, color: '#757575',      byteStart: 80, byteEnd: 144, bitCount: 1024, desc: t.regions['quant-lo'].desc },
  };
  const [selected, setSelected] = useState<Region | null>(null);

  const valW = (W - 40) / NUM_VALUES;
  const valY = 45;
  const valH = 45;
  const byteY = 150;
  const bytesPerRow = 36;
  const byteSize = 12;

  function getRegion(byteIdx: number): Region | null {
    for (const [key, r] of Object.entries(REGIONS)) {
      if (byteIdx >= r.byteStart && byteIdx < r.byteEnd) return key as Region;
    }
    return null;
  }

  const info = selected ? REGIONS[selected] : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Original FP16 values */}
      <text x={20} y={valY - 5} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.originalWeights}
      </text>
      {FP16_VALUES.map((val, i) => {
        const t = Math.abs(val) / maxAbs;
        const fill = val >= 0
          ? `rgba(21,101,192,${0.2 + t * 0.8})`
          : `rgba(198,40,40,${0.2 + t * 0.8})`;
        return (
          <rect key={i} x={20 + i * valW} y={valY} width={valW - 0.3} height={valH}
            fill={fill} opacity={selected ? 0.3 : 1} />
        );
      })}
      {/* Sub-block boundaries */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={20 + i * BLOCK_SIZE * valW} y1={valY}
          x2={20 + i * BLOCK_SIZE * valW} y2={valY + valH}
          stroke={COLORS.dark} strokeWidth="0.8" opacity={0.4} />
      ))}

      {/* Formula */}
      <text x={20} y={valY + valH + 18} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
        {t.formula}
      </text>

      {/* Byte stream */}
      <text x={20} y={byteY - 5} fontSize="10" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.compressedBytes}
      </text>
      {Array.from({ length: TOTAL_BYTES }, (_, idx) => {
        const row = Math.floor(idx / bytesPerRow);
        const col = idx % bytesPerRow;
        const region = getRegion(idx);
        const color = region ? REGIONS[region].color : COLORS.light;
        const isHL = selected && region === selected;
        return (
          <rect key={idx} x={20 + col * byteSize} y={byteY + row * (byteSize + 2)}
            width={byteSize - 1} height={byteSize - 1}
            fill={color} opacity={isHL ? 1 : (selected ? 0.3 : 0.8)}
            stroke={isHL ? COLORS.green : COLORS.dark} strokeWidth={isHL ? 2 : 0.3}
            cursor="pointer" rx="1"
            onClick={() => {
              if (region) setSelected(selected === region ? null : region);
            }} />
        );
      })}

      {/* Region labels under byte stream */}
      <text x={20} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.labelD}</text>
      <text x={80} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.labelScales}</text>
      <text x={200} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill="#9e9e9e" fontFamily={FONTS.sans}>{t.labelQuantHi}</text>
      <text x={340} y={byteY + 4 * (byteSize + 2) + 14} fontSize="8"
        fill="#757575" fontFamily={FONTS.sans}>{t.labelQuantLo}</text>

      {/* Detail panel */}
      <rect x={390} y={valY} width={170} height={135} rx={4}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={400} y={valY + 18} fontSize="11" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {info ? info.name : t.clickDetail}
      </text>
      {info && (
        <>
          <text x={400} y={valY + 38} fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            Bytes: {info.byteStart}-{info.byteEnd}
          </text>
          <text x={400} y={valY + 55} fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.mono}>
            Bits: {info.bitCount}
          </text>
          <text x={400} y={valY + 75} fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {info.desc}
          </text>
          <rect x={400} y={valY + 90} width={60} height={14} rx={2}
            fill={info.color} opacity={0.3} />
          <text x={430} y={valY + 100} textAnchor="middle" fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.regionColor}</text>
          <text x={400} y={valY + 125} fontSize="8"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {info.byteEnd - info.byteStart} bytes / 144 total
          </text>
        </>
      )}

      {/* Bottom note */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.bottomNote}
      </text>
    </svg>
  );
}
