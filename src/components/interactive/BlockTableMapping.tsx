import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 440;

const BLOCK_SIZE = 4;
const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'and', 'slept', 'for', 'hours'];
const NUM_BLOCKS = Math.ceil(TOKENS.length / BLOCK_SIZE);

// Physical blocks are non-contiguous (simulating scattered allocation)
const PHYSICAL_MAP = [3, 7, 1]; // logical block 0→phys 3, 1→phys 7, 2→phys 1

const PHYS_TOTAL = 10;

export default function BlockTableMapping() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  const selectedBlock = selectedToken !== null ? Math.floor(selectedToken / BLOCK_SIZE) : null;
  const selectedPhys = selectedBlock !== null ? PHYSICAL_MAP[selectedBlock] : null;

  const tokenY = 70;
  const tokenW = 50;
  const tokenH = 30;
  const tokensX = (W - TOKENS.length * tokenW) / 2;

  const tableY = 150;
  const tableRowH = 28;
  const tableW = 200;
  const tableX = 40;

  const physY = 150;
  const physBlockW = 44;
  const physBlockH = 70;
  const physX = 330;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Block Table：逻辑块 → 物理块映射
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击 token 查看它在哪个逻辑块，映射到哪个物理块
      </text>

      {/* Token sequence */}
      {TOKENS.map((tok, i) => {
        const x = tokensX + i * tokenW;
        const blockIdx = Math.floor(i / BLOCK_SIZE);
        const isSelected = selectedToken === i;
        const inSelectedBlock = selectedBlock === blockIdx;
        return (
          <g key={i} onClick={() => setSelectedToken(selectedToken === i ? null : i)}
            cursor="pointer">
            <rect x={x + 1} y={tokenY} width={tokenW - 2} height={tokenH} rx={4}
              fill={isSelected ? COLORS.highlight : inSelectedBlock ? COLORS.valid : COLORS.bgAlt}
              stroke={isSelected ? COLORS.primary : inSelectedBlock ? COLORS.primary : COLORS.light}
              strokeWidth={isSelected ? 2.5 : 1} />
            <text x={x + tokenW / 2} y={tokenY + 19} textAnchor="middle"
              fontSize="10" fontWeight={isSelected ? '700' : '500'}
              fill={COLORS.dark} fontFamily={FONTS.mono}>{tok}</text>
          </g>
        );
      })}

      {/* Block boundaries */}
      {Array.from({ length: NUM_BLOCKS }, (_, b) => {
        const x1 = tokensX + b * BLOCK_SIZE * tokenW;
        const bLen = Math.min(BLOCK_SIZE, TOKENS.length - b * BLOCK_SIZE);
        const bw = bLen * tokenW;
        return (
          <rect key={`bb-${b}`} x={x1} y={tokenY - 4} width={bw} height={tokenH + 8} rx={6}
            fill="none" stroke={selectedBlock === b ? COLORS.primary : COLORS.mid}
            strokeWidth={selectedBlock === b ? 2 : 0.5}
            strokeDasharray={selectedBlock === b ? 'none' : '3,2'} />
        );
      })}
      {/* Block labels */}
      {Array.from({ length: NUM_BLOCKS }, (_, b) => {
        const x = tokensX + b * BLOCK_SIZE * tokenW;
        return (
          <text key={`bl-${b}`} x={x + (Math.min(BLOCK_SIZE, TOKENS.length - b * BLOCK_SIZE) * tokenW) / 2}
            y={tokenY + tokenH + 18} textAnchor="middle" fontSize="8"
            fill={selectedBlock === b ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
            逻辑块 {b}
          </text>
        );
      })}

      {/* Block Table */}
      <text x={tableX + tableW / 2} y={tableY - 8} textAnchor="middle" fontSize="11"
        fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>Block Table</text>
      {/* Header */}
      <rect x={tableX} y={tableY} width={tableW / 2} height={tableRowH}
        fill={COLORS.dark} rx={4} />
      <text x={tableX + tableW / 4} y={tableY + 18} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>逻辑块</text>
      <rect x={tableX + tableW / 2} y={tableY} width={tableW / 2} height={tableRowH}
        fill={COLORS.dark} rx={4} />
      <text x={tableX + 3 * tableW / 4} y={tableY + 18} textAnchor="middle"
        fontSize="9" fontWeight="600" fill="#fff" fontFamily={FONTS.sans}>物理块</text>
      {/* Rows */}
      {PHYSICAL_MAP.map((phys, b) => {
        const y = tableY + (b + 1) * tableRowH;
        const isActive = selectedBlock === b;
        return (
          <g key={`row-${b}`}>
            <rect x={tableX} y={y} width={tableW} height={tableRowH}
              fill={isActive ? COLORS.highlight : b % 2 === 0 ? COLORS.bgAlt : '#fff'}
              stroke={COLORS.light} strokeWidth="0.5" />
            <text x={tableX + tableW / 4} y={y + 18} textAnchor="middle"
              fontSize="10" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.primary : COLORS.dark} fontFamily={FONTS.mono}>{b}</text>
            <text x={tableX + 3 * tableW / 4} y={y + 18} textAnchor="middle"
              fontSize="10" fontWeight={isActive ? '700' : '400'}
              fill={isActive ? COLORS.green : COLORS.dark} fontFamily={FONTS.mono}>{phys}</text>
          </g>
        );
      })}

      {/* Physical memory blocks */}
      <text x={physX + (PHYS_TOTAL / 2 * physBlockW) / 2} y={physY - 8} textAnchor="middle"
        fontSize="11" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
        物理内存 (GPU)
      </text>
      {Array.from({ length: PHYS_TOTAL }, (_, p) => {
        const col = p % 5;
        const row = Math.floor(p / 5);
        const x = physX + col * physBlockW;
        const y = physY + row * physBlockH;
        const logicalIdx = PHYSICAL_MAP.indexOf(p);
        const isUsed = logicalIdx !== -1;
        const isActive = selectedPhys === p;
        return (
          <g key={`phys-${p}`}>
            <rect x={x + 1} y={y + 1} width={physBlockW - 2} height={physBlockH - 2} rx={4}
              fill={isActive ? COLORS.highlight : isUsed ? COLORS.valid : COLORS.bgAlt}
              stroke={isActive ? COLORS.primary : isUsed ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2.5 : 1} />
            <text x={x + physBlockW / 2} y={y + 22} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.mono}>
              P{p}
            </text>
            {isUsed && (
              <text x={x + physBlockW / 2} y={y + 40} textAnchor="middle"
                fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
                ← L{logicalIdx}
              </text>
            )}
            {isUsed && (
              <text x={x + physBlockW / 2} y={y + 54} textAnchor="middle"
                fontSize="7" fill={COLORS.mid} fontFamily={FONTS.mono}>
                {TOKENS.slice(logicalIdx * BLOCK_SIZE, (logicalIdx + 1) * BLOCK_SIZE).join(' ')}
              </text>
            )}
          </g>
        );
      })}

      {/* Arrow from table to physical when selected */}
      {selectedBlock !== null && selectedPhys !== null && (
        <line
          x1={tableX + tableW} y1={tableY + (selectedBlock + 1.5) * tableRowH}
          x2={physX + (selectedPhys % 5) * physBlockW}
          y2={physY + Math.floor(selectedPhys / 5) * physBlockH + physBlockH / 2}
          stroke={COLORS.primary} strokeWidth="2" strokeDasharray="5,3" />
      )}

      {/* Summary */}
      <rect x={40} y={H - 50} width={W - 80} height={36} rx={6}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize="10"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {selectedToken !== null
          ? `"${TOKENS[selectedToken]}" 在逻辑块 ${selectedBlock}，映射到物理块 ${selectedPhys}（非连续分配，消除外部碎片）`
          : '物理块在 GPU 显存中无需连续 — 就像操作系统的虚拟内存分页'}
      </text>
    </svg>
  );
}
