// src/components/interactive/OccupancyCalculator.tsx
// Interactive: block size / regs / smem → occupancy calculation
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 300;

// Hopper SM limits (H100)
const SM = {
  maxWarps: 64,
  maxBlocks: 32,
  maxRegs: 65536,     // 256KB = 65536 × 32-bit regs
  maxSmem: 228 * 1024, // 228 KB (configurable max)
  label: 'H100 (Hopper SM)',
};

function calcOccupancy(blockSize: number, regsPerThread: number, smemPerBlock: number) {
  const warpsPerBlock = Math.ceil(blockSize / 32);

  // Limit from warps
  const blocksByWarps = Math.floor(SM.maxWarps / warpsPerBlock);

  // Limit from registers (Hopper: regs allocated in granularity of 256 per warp; other archs may differ)
  const regsPerWarp = Math.ceil(regsPerThread * 32 / 256) * 256;
  const totalRegsPerBlock = regsPerWarp * warpsPerBlock;
  const blocksByRegs = totalRegsPerBlock > 0 ? Math.floor(SM.maxRegs / totalRegsPerBlock) : SM.maxBlocks;

  // Limit from shared memory
  const blocksBySmem = smemPerBlock > 0 ? Math.floor(SM.maxSmem / smemPerBlock) : SM.maxBlocks;

  // Limit from max blocks per SM
  const activeBlocks = Math.min(blocksByWarps, blocksByRegs, blocksBySmem, SM.maxBlocks);
  const activeWarps = activeBlocks * warpsPerBlock;
  const occupancy = activeWarps / SM.maxWarps;

  // Determine bottleneck
  const limits = [
    { name: 'Warps', val: blocksByWarps },
    { name: 'Registers', val: blocksByRegs },
    { name: 'Shared Mem', val: blocksBySmem },
    { name: 'Max Blocks', val: SM.maxBlocks },
  ];
  const bottleneck = limits.reduce((min, l) => l.val < min.val ? l : min, limits[0]);

  return { warpsPerBlock, activeBlocks, activeWarps, occupancy, bottleneck: bottleneck.name, limits };
}

export default function OccupancyCalculator() {
  const [blockSize, setBlockSize] = useState(256);
  const [regsPerThread, setRegsPerThread] = useState(32);
  const [smemPerBlock, setSmemPerBlock] = useState(16384); // 16 KB

  const result = calcOccupancy(blockSize, regsPerThread, smemPerBlock);
  const pct = Math.round(result.occupancy * 100);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Block Size (threads)</span>
          <select value={blockSize} onChange={e => setBlockSize(+e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-mono">
            {[64, 128, 256, 512, 1024].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Registers / Thread</span>
          <input type="range" min={16} max={128} step={8} value={regsPerThread}
            onChange={e => setRegsPerThread(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600">{regsPerThread}</span>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 font-medium block mb-1">Shared Mem / Block</span>
          <input type="range" min={0} max={131072} step={4096} value={smemPerBlock}
            onChange={e => setSmemPerBlock(+e.target.value)} className="w-full" />
          <span className="font-mono text-primary-600">{(smemPerBlock / 1024).toFixed(0)} KB</span>
        </label>
      </div>

      {/* Results SVG */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Occupancy Calculator — {SM.label}
          </text>

          {/* Occupancy bar */}
          <rect x={40} y={35} width={500} height={30} rx={5}
            fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
          <rect x={40} y={35}
            width={Math.max(0, Math.min(500, 500 * result.occupancy))} height={30} rx={5}
            fill={pct >= 75 ? '#dcfce7' : pct >= 50 ? '#fef3c7' : '#fee2e2'}
            stroke={pct >= 75 ? COLORS.green : pct >= 50 ? COLORS.orange : COLORS.red}
            strokeWidth={1} />
          <text x={W / 2} y={54} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={pct >= 75 ? COLORS.green : pct >= 50 ? COLORS.orange : COLORS.red}
            fontFamily={FONTS.mono}>
            {pct}% Occupancy
          </text>

          {/* Key metrics */}
          <text x={W / 2} y={85} textAnchor="middle" fontSize="10" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            Active Blocks: {result.activeBlocks} | Active Warps: {result.activeWarps} / {SM.maxWarps} | Warps/Block: {result.warpsPerBlock}
          </text>

          {/* Per-resource limits */}
          <text x={40} y={112} fontSize="9" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.sans}>每种资源允许的最大 Blocks/SM:</text>

          {result.limits.map((l, i) => {
            const y = 128 + i * 30;
            const isBottleneck = l.name === result.bottleneck;
            const barW = Math.min(360, (l.val / SM.maxBlocks) * 360);
            return (
              <g key={i}>
                <text x={40} y={y + 12} fontSize="8" fontWeight={isBottleneck ? '700' : '400'}
                  fill={isBottleneck ? COLORS.red : COLORS.dark} fontFamily={FONTS.sans}>
                  {l.name}:
                </text>
                <rect x={130} y={y} width={360} height={18} rx={3}
                  fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.5} />
                <rect x={130} y={y} width={barW} height={18} rx={3}
                  fill={isBottleneck ? '#fee2e2' : '#dbeafe'}
                  stroke={isBottleneck ? COLORS.red : COLORS.primary} strokeWidth={0.5} />
                <text x={135} y={y + 12} fontSize="7.5"
                  fill={isBottleneck ? COLORS.red : COLORS.primary} fontFamily={FONTS.mono}>
                  {l.val} blocks {isBottleneck ? '← 瓶颈' : ''}
                </text>
              </g>
            );
          })}

          {/* Insight */}
          <rect x={40} y={SVG_H - 48} width={500} height={36} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={SVG_H - 26} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            Occupancy = active warps / max warps = {result.activeWarps} / {SM.maxWarps} = {pct}% — 瓶颈: {result.bottleneck}
          </text>
        </svg>
      </div>
    </div>
  );
}
