import { useState } from 'react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const TOTAL_BLOCKS = 20;
const BLOCK_W = 28;
const BLOCK_H = 22;
const GAP = 2;

type BlockState = 'free' | 'reqA' | 'reqB' | 'waste' | 'fragment';

interface MemoryBarProps {
  blocks: BlockState[];
  label: string;
}

function MemoryBar({ blocks, label }: MemoryBarProps) {
  const colorMap: Record<BlockState, string> = {
    free: '#f3f4f6',
    reqA: HEAD_COLORS[0] + '66',
    reqB: HEAD_COLORS[2] + '66',
    waste: COLORS.waste,
    fragment: '#e5e7eb',
  };
  const totalW = blocks.length * (BLOCK_W + GAP);
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${totalW} ${BLOCK_H + 4}`} className="w-full max-w-md">
        {blocks.map((b, i) => (
          <rect key={i} x={i * (BLOCK_W + GAP)} y={2} width={BLOCK_W} height={BLOCK_H}
            rx={3} fill={colorMap[b]} stroke="#d1d5db" strokeWidth={0.5} />
        ))}
      </svg>
    </div>
  );
}

export default function PagedAttentionComparison({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      traditional: '传统预分配',
      paged: 'PagedAttention',
      gpuMemory: 'GPU 显存',
      step: 'Step',
      reqA: 'Request A',
      reqB: 'Request B',
      internalFrag: '内部碎片',
      externalFrag: '外部碎片',
      labels: [
        'Request A 分配空间',
        'Request A 实际只用了一半',
        'Request A 完成，释放空间',
        'Request B 需要 8 个块',
      ],
    },
    en: {
      traditional: 'Traditional Pre-allocation',
      paged: 'PagedAttention',
      gpuMemory: 'GPU Memory',
      step: 'Step',
      reqA: 'Request A',
      reqB: 'Request B',
      internalFrag: 'Internal Frag',
      externalFrag: 'External Frag',
      labels: [
        'Request A allocates space',
        'Request A only used half',
        'Request A completes, releases space',
        'Request B needs 8 blocks',
      ],
    },
  }[locale];

  const [step, setStep] = useState(0);
  const maxStep = 3;

  const preAllocStates: BlockState[][] = [
    [...Array(10).fill('reqA'), ...Array(10).fill('free')],
    [...Array(5).fill('reqA'), ...Array(5).fill('waste'), ...Array(10).fill('free')],
    [...Array(5).fill('fragment'), ...Array(5).fill('fragment'), ...Array(10).fill('free')],
    [...Array(5).fill('fragment'), ...Array(5).fill('fragment'), ...Array(8).fill('reqB'), ...Array(2).fill('free')],
  ];

  const pagedStates: BlockState[][] = [
    [...Array(5).fill('reqA'), ...Array(15).fill('free')],
    [...Array(5).fill('reqA'), ...Array(15).fill('free')],
    [...Array(20).fill('free')],
    [...Array(8).fill('reqB'), ...Array(12).fill('free')],
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2 text-center">{t.traditional}</div>
          <MemoryBar blocks={preAllocStates[step]} label={t.gpuMemory} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2 text-center">{t.paged}</div>
          <MemoryBar blocks={pagedStates[step]} label={t.gpuMemory} />
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 mb-3">{t.labels[step]}</div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: maxStep + 1 }, (_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`px-3 py-1 text-xs rounded ${i === step
              ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.step} {i + 1}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: HEAD_COLORS[0] + '66' }} /> {t.reqA}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: HEAD_COLORS[2] + '66' }} /> {t.reqB}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.waste }} /> {t.internalFrag}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: '#e5e7eb' }} /> {t.externalFrag}
        </span>
      </div>
    </div>
  );
}
