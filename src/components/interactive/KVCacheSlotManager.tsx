import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;
const SLOT_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

interface Slot {
  id: number;
  label: string;
  tokensUsed: number;
  maxTokens: number;
  active: boolean;
}

export default function KVCacheSlotManager({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      newRequest: '+ 新请求',
      title: 'KV Cache Slot 管理器',
      capacity: 'slots × 512 tokens = {0} tokens 总容量 | 利用率: {1}%',
      idle: '(空闲)',
      slot: 'Slot',
      clickToRelease: '点击活跃请求可释放 slot | 固定大小 slot: 简单但可能浪费空间 (vs PagedAttention)',
    },
    en: {
      newRequest: '+ New Request',
      title: 'KV Cache Slot Manager',
      capacity: 'slots × 512 tokens = {0} tokens total capacity | Utilization: {1}%',
      idle: '(idle)',
      slot: 'Slot',
      clickToRelease: 'Click active request to release slot | Fixed-size slot: simple but may waste space (vs PagedAttention)',
    },
  }[locale];

  const INITIAL_SLOTS: Slot[] = [
    { id: 1, label: 'Req A', tokensUsed: 180, maxTokens: 512, active: true },
    { id: 2, label: 'Req B', tokensUsed: 45, maxTokens: 512, active: true },
    { id: 3, label: t.idle, tokensUsed: 0, maxTokens: 512, active: false },
    { id: 4, label: t.idle, tokensUsed: 0, maxTokens: 512, active: false },
  ];

  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [nextReqId, setNextReqId] = useState(3);

  const totalCapacity = slots.length * 512;
  const totalUsed = slots.reduce((sum, s) => sum + s.tokensUsed, 0);
  const utilization = ((totalUsed / totalCapacity) * 100).toFixed(1);

  const addRequest = () => {
    const freeIdx = slots.findIndex(s => !s.active);
    if (freeIdx === -1) return;
    const newSlots = [...slots];
    const label = `Req ${String.fromCharCode(64 + nextReqId)}`;
    newSlots[freeIdx] = { ...newSlots[freeIdx], label, tokensUsed: Math.floor(Math.random() * 200) + 20, active: true };
    setSlots(newSlots);
    setNextReqId(nextReqId + 1);
  };

  const completeRequest = (idx: number) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], label: t.idle, tokensUsed: 0, active: false };
    setSlots(newSlots);
  };

  const slotW = (W - 80) / slots.length;
  const barY = 80;
  const barH = 120;

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3">
        <button onClick={addRequest}
          className="px-3 py-1 text-xs rounded-full border border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100"
          disabled={!slots.some(s => !s.active)}>
          {t.newRequest}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.title}
        </text>
        <text x={W / 2} y={33} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {slots.length} {t.capacity.replace('{0}', totalCapacity.toString()).replace('{1}', utilization)}
        </text>

        {/* Slots */}
        {slots.map((slot, i) => {
          const x = 40 + i * slotW;
          const fillH = slot.active ? (slot.tokensUsed / slot.maxTokens) * barH : 0;
          const color = slot.active ? SLOT_COLORS[i % SLOT_COLORS.length] : '#e2e8f0';
          return (
            <g key={i} onClick={() => slot.active && completeRequest(i)}
              style={{ cursor: slot.active ? 'pointer' : 'default' }}>
              {/* Slot background */}
              <rect x={x + 4} y={barY} width={slotW - 8} height={barH}
                rx={4} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
              {/* Filled portion (bottom-up) */}
              <rect x={x + 4} y={barY + barH - fillH} width={slotW - 8} height={fillH}
                rx={4} fill={color} opacity={0.3} />
              {/* Label */}
              <text x={x + slotW / 2} y={barY + barH / 2} textAnchor="middle"
                fontSize="8" fontWeight={slot.active ? '600' : '400'}
                fill={slot.active ? color : '#94a3b8'} fontFamily={FONTS.sans}>
                {slot.label}
              </text>
              {slot.active && (
                <text x={x + slotW / 2} y={barY + barH / 2 + 14} textAnchor="middle"
                  fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
                  {slot.tokensUsed}/{slot.maxTokens}
                </text>
              )}
              {/* Slot number */}
              <text x={x + slotW / 2} y={barY + barH + 15} textAnchor="middle"
                fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
                {t.slot} {i}
              </text>
            </g>
          );
        })}

        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {t.clickToRelease}
        </text>
      </svg>
    </div>
  );
}
