// src/components/interactive/IndexCalculation.tsx
// Interactive: blockDim/gridDim → select thread → show global index formula
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

export default function IndexCalculation({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      totalThreads: '总线程数',
      clickToSelect: '点击选择线程',
      grid: 'Grid',
      blocks: 'blocks',
      threads: 'threads',
      individualThreads: '个线程',
      block: 'Block',
      globalIndexFormula: 'Global Index 计算公式',
      threadInBlock: '线程在 Block 内的位置',
      blockInGrid: 'Block 在 Grid 内的位置',
      threadsPerBlock: '每个 Block 的线程数',
      thisGlobalIdx: '这个 globalIdx 就是该线程负责处理的数据元素下标',
    },
    en: {
      totalThreads: 'Total threads',
      clickToSelect: 'Click to select thread',
      grid: 'Grid',
      blocks: 'blocks',
      threads: 'threads',
      individualThreads: 'threads',
      block: 'Block',
      globalIndexFormula: 'Global Index Calculation',
      threadInBlock: 'thread position within block',
      blockInGrid: 'block position within grid',
      threadsPerBlock: 'threads per block',
      thisGlobalIdx: 'This globalIdx is the data element index this thread processes',
    },
  }[locale];

  const [blockDim, setBlockDim] = useState(8);
  const [gridDim, setGridDim] = useState(4);
  const [selectedBlock, setSelectedBlock] = useState(1);
  const [selectedThread, setSelectedThread] = useState(3);

  const globalIdx = selectedThread + selectedBlock * blockDim;
  const totalThreads = blockDim * gridDim;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-medium">blockDim:</span>
          <input type="range" min={4} max={16} step={4} value={blockDim}
            onChange={e => { setBlockDim(+e.target.value); setSelectedThread(Math.min(selectedThread, +e.target.value - 1)); }}
            className="w-20" />
          <span className="font-mono text-primary-600 w-6">{blockDim}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-medium">gridDim:</span>
          <input type="range" min={2} max={8} value={gridDim}
            onChange={e => { setGridDim(+e.target.value); setSelectedBlock(Math.min(selectedBlock, +e.target.value - 1)); }}
            className="w-20" />
          <span className="font-mono text-primary-600 w-6">{gridDim}</span>
        </label>
        <span className="text-xs text-gray-500">
          {t.totalThreads}: {totalThreads} | {t.clickToSelect}
        </span>
      </div>

      {/* SVG visualization */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
          {/* Title */}
          <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            1D {t.grid}: {gridDim} {t.blocks} × {blockDim} {t.threads} = {totalThreads} {t.individualThreads}
          </text>

          {/* Blocks */}
          {Array.from({ length: gridDim }).map((_, bi) => {
            const blockStartX = 20 + bi * ((W - 40) / gridDim);
            const blockW = (W - 40) / gridDim - 6;
            const isSelectedBlock = bi === selectedBlock;

            return (
              <g key={bi}>
                {/* Block container */}
                <rect x={blockStartX} y={35} width={blockW} height={120} rx={4}
                  fill={isSelectedBlock ? '#dbeafe' : '#f8fafc'}
                  stroke={isSelectedBlock ? COLORS.primary : '#cbd5e1'}
                  strokeWidth={isSelectedBlock ? 2 : 1} />
                <text x={blockStartX + blockW / 2} y={50} textAnchor="middle"
                  fontSize="8" fontWeight="600"
                  fill={isSelectedBlock ? COLORS.primary : COLORS.dark}
                  fontFamily={FONTS.sans}>
                  {t.block} {bi}
                </text>

                {/* Threads within block */}
                {Array.from({ length: blockDim }).map((_, ti) => {
                  const threadW = Math.min(28, (blockW - 10) / blockDim - 2);
                  const tx = blockStartX + 5 + ti * (threadW + 2);
                  const isSelected = bi === selectedBlock && ti === selectedThread;
                  const global = ti + bi * blockDim;

                  return (
                    <g key={ti} style={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedBlock(bi); setSelectedThread(ti); }}>
                      <rect x={tx} y={60} width={threadW} height={80} rx={2}
                        fill={isSelected ? '#fef3c7' : isSelectedBlock ? '#eff6ff' : 'white'}
                        stroke={isSelected ? COLORS.orange : '#cbd5e1'}
                        strokeWidth={isSelected ? 2 : 0.5} />
                      <text x={tx + threadW / 2} y={76} textAnchor="middle"
                        fontSize="6" fill={COLORS.dark} fontFamily={FONTS.mono}>
                        T{ti}
                      </text>
                      <text x={tx + threadW / 2} y={92} textAnchor="middle"
                        fontSize="6" fill="#64748b" fontFamily={FONTS.mono}>
                        g={global}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Formula breakdown */}
          <rect x={30} y={170} width={W - 60} height={130} rx={6}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />

          <text x={W / 2} y={192} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.globalIndexFormula}
          </text>

          <text x={W / 2} y={215} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.primary} fontFamily={FONTS.mono}>
            globalIdx = threadIdx.x + blockIdx.x * blockDim.x
          </text>

          <text x={W / 2} y={240} textAnchor="middle" fontSize="10"
            fill={COLORS.orange} fontFamily={FONTS.mono}>
            globalIdx = {selectedThread} + {selectedBlock} × {blockDim} = {globalIdx}
          </text>

          {/* Breakdown */}
          <text x={W / 2} y={265} textAnchor="middle" fontSize="8"
            fill="#64748b" fontFamily={FONTS.sans}>
            threadIdx.x = {selectedThread} ({t.threadInBlock}) | blockIdx.x = {selectedBlock} ({t.blockInGrid}) | blockDim.x = {blockDim} ({t.threadsPerBlock})
          </text>

          <text x={W / 2} y={285} textAnchor="middle" fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.thisGlobalIdx}: a[{globalIdx}] = b[{globalIdx}] + c[{globalIdx}]
          </text>
        </svg>
      </div>
    </div>
  );
}
