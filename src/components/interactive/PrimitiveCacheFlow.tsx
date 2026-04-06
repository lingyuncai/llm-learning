import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type CacheState = 'hit' | 'miss';

const PrimitiveCacheFlow: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: 'Primitive Cache 工作流程',
      cacheHit: 'Cache Hit ✓',
      cacheMiss: 'Cache Miss ✗',
      newRequest: 'New Request',
      cacheLookup: 'Cache',
      cacheLookupSub: 'Lookup',
      hit: 'Hit ✓',
      found: 'Found',
      inCache: 'in cache',
      execute: 'Execute',
      immediately: 'immediately',
      miss: 'Miss ✗',
      compile: 'Compile',
      gpuKernel: '⚙️ GPU Kernel',
      store: 'Store',
      lruCache: 'LRU Cache',
      newPrimitive: 'new primitive',
      cacheStats: 'Cache: 128 entries | Hit rate: 95% | Policy: LRU',
      hitSummary: '✅ Cache Hit：直接使用已编译的 primitive，延迟极低 (~0.1ms)',
      missSummary: '❌ Cache Miss：需要编译 GPU kernel，延迟显著增加 (~100ms)，但编译后会缓存复用',
    },
    en: {
      title: 'Primitive Cache Workflow',
      cacheHit: 'Cache Hit ✓',
      cacheMiss: 'Cache Miss ✗',
      newRequest: 'New Request',
      cacheLookup: 'Cache',
      cacheLookupSub: 'Lookup',
      hit: 'Hit ✓',
      found: 'Found',
      inCache: 'in cache',
      execute: 'Execute',
      immediately: 'immediately',
      miss: 'Miss ✗',
      compile: 'Compile',
      gpuKernel: '⚙️ GPU Kernel',
      store: 'Store',
      lruCache: 'LRU Cache',
      newPrimitive: 'new primitive',
      cacheStats: 'Cache: 128 entries | Hit rate: 95% | Policy: LRU',
      hitSummary: '✅ Cache Hit: Use pre-compiled primitive directly, ultra-low latency (~0.1ms)',
      missSummary: '❌ Cache Miss: Requires GPU kernel compilation, significant latency increase (~100ms), but will be cached for reuse',
    },
  }[locale];

  const [state, setState] = useState<CacheState>('hit');

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{t.title}</h3>

      {/* State selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setState('hit')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            state === 'hit'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t.cacheHit}
        </button>
        <button
          onClick={() => setState('miss')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            state === 'miss'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t.cacheMiss}
        </button>
      </div>

      <svg viewBox="0 0 580 340" className="w-full">
        <defs>
          <marker id="arrow-flow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
          </marker>
          <marker id="arrow-hit" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
          </marker>
          <marker id="arrow-miss" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.red} />
          </marker>
        </defs>

        {/* Start */}
        <rect x="40" y="30" width="180" height="50" rx="6" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x="130" y="52" fontSize="11" textAnchor="middle" fontWeight="600" fill={COLORS.dark}>{t.newRequest}</text>
        <text x="130" y="68" fontSize="9" textAnchor="middle" fill={COLORS.mid} fontFamily={FONTS.mono}>
          MatMul([512,768], FP16)
        </text>

        {/* Arrow to lookup */}
        <path d="M 130 80 L 130 120" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrow-flow)" />

        {/* Cache lookup diamond */}
        <polygon points="130,120 230,160 130,200 30,160" fill={COLORS.primary} fillOpacity="0.1" stroke={COLORS.primary} strokeWidth="2" />
        <text x="130" y="160" fontSize="12" textAnchor="middle" fontWeight="600" fill={COLORS.primary}>{t.cacheLookup}</text>
        <text x="130" y="175" fontSize="12" textAnchor="middle" fontWeight="600" fill={COLORS.primary}>{t.cacheLookupSub}</text>

        {/* Hit path (green) */}
        <path d="M 230 160 L 300 160"
              stroke={state === 'hit' ? COLORS.green : COLORS.light}
              strokeWidth={state === 'hit' ? 3 : 1.5}
              markerEnd={state === 'hit' ? 'url(#arrow-hit)' : undefined}
        />
        <text x="265" y="152" fontSize="10" fontWeight={state === 'hit' ? '700' : '400'}
              fill={state === 'hit' ? COLORS.green : COLORS.light}>{t.hit}</text>

        {/* Hit - Found */}
        <rect x="300" y="135" width="100" height="50" rx="6"
              fill={state === 'hit' ? COLORS.green : COLORS.light}
              fillOpacity={state === 'hit' ? 0.15 : 0.05}
              stroke={state === 'hit' ? COLORS.green : COLORS.light}
              strokeWidth={state === 'hit' ? 2 : 1} />
        <text x="350" y="157" fontSize="11" textAnchor="middle" fontWeight="600"
              fill={state === 'hit' ? COLORS.green : COLORS.light}>{t.found}</text>
        <text x="350" y="173" fontSize="9" textAnchor="middle"
              fill={state === 'hit' ? COLORS.mid : COLORS.light}>{t.inCache}</text>

        {/* Hit - Execute */}
        <path d="M 400 160 L 450 160"
              stroke={state === 'hit' ? COLORS.green : COLORS.light}
              strokeWidth={state === 'hit' ? 2 : 1}
              markerEnd={state === 'hit' ? 'url(#arrow-hit)' : undefined}
        />

        <rect x="450" y="135" width="100" height="50" rx="6"
              fill={state === 'hit' ? COLORS.green : COLORS.light}
              fillOpacity={state === 'hit' ? 0.15 : 0.05}
              stroke={state === 'hit' ? COLORS.green : COLORS.light}
              strokeWidth={state === 'hit' ? 2 : 1} />
        <text x="500" y="157" fontSize="11" textAnchor="middle" fontWeight="600"
              fill={state === 'hit' ? COLORS.green : COLORS.light}>{t.execute}</text>
        <text x="500" y="173" fontSize="9" textAnchor="middle"
              fill={state === 'hit' ? COLORS.mid : COLORS.light}>{t.immediately}</text>

        {/* Hit latency */}
        {state === 'hit' && (
          <text x="500" y="195" fontSize="10" textAnchor="middle" fontWeight="700" fill={COLORS.green}>
            ~0.1ms
          </text>
        )}

        {/* Miss path (red) */}
        <path d="M 130 200 L 130 240"
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 3 : 1.5}
              markerEnd={state === 'miss' ? 'url(#arrow-miss)' : undefined}
        />
        <text x="145" y="220" fontSize="10" fontWeight={state === 'miss' ? '700' : '400'}
              fill={state === 'miss' ? COLORS.red : COLORS.light}>{t.miss}</text>

        {/* Miss - Compile */}
        <rect x="80" y="240" width="100" height="50" rx="6"
              fill={state === 'miss' ? COLORS.red : COLORS.light}
              fillOpacity={state === 'miss' ? 0.15 : 0.05}
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 2 : 1} />
        <text x="130" y="260" fontSize="11" textAnchor="middle" fontWeight="600"
              fill={state === 'miss' ? COLORS.red : COLORS.light}>{t.compile}</text>
        <text x="130" y="276" fontSize="9" textAnchor="middle"
              fill={state === 'miss' ? COLORS.mid : COLORS.light}>{t.gpuKernel}</text>

        {/* Miss compile time */}
        {state === 'miss' && (
          <text x="130" y="300" fontSize="9" textAnchor="middle" fontWeight="700" fill={COLORS.orange}>
            ~50-200ms
          </text>
        )}

        {/* Miss - Store LRU */}
        <path d="M 180 265 L 240 265"
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 2 : 1}
              markerEnd={state === 'miss' ? 'url(#arrow-miss)' : undefined}
        />

        <rect x="240" y="240" width="100" height="50" rx="6"
              fill={state === 'miss' ? COLORS.red : COLORS.light}
              fillOpacity={state === 'miss' ? 0.15 : 0.05}
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 2 : 1} />
        <text x="290" y="260" fontSize="11" textAnchor="middle" fontWeight="600"
              fill={state === 'miss' ? COLORS.red : COLORS.light}>{t.store}</text>
        <text x="290" y="276" fontSize="9" textAnchor="middle"
              fill={state === 'miss' ? COLORS.mid : COLORS.light}>{t.lruCache}</text>

        {/* Miss - Execute */}
        <path d="M 340 265 L 400 265"
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 2 : 1}
              markerEnd={state === 'miss' ? 'url(#arrow-miss)' : undefined}
        />

        <rect x="400" y="240" width="100" height="50" rx="6"
              fill={state === 'miss' ? COLORS.red : COLORS.light}
              fillOpacity={state === 'miss' ? 0.15 : 0.05}
              stroke={state === 'miss' ? COLORS.red : COLORS.light}
              strokeWidth={state === 'miss' ? 2 : 1} />
        <text x="450" y="260" fontSize="11" textAnchor="middle" fontWeight="600"
              fill={state === 'miss' ? COLORS.red : COLORS.light}>{t.execute}</text>
        <text x="450" y="276" fontSize="9" textAnchor="middle"
              fill={state === 'miss' ? COLORS.mid : COLORS.light}>{t.newPrimitive}</text>

        {/* Miss total time */}
        {state === 'miss' && (
          <text x="450" y="300" fontSize="10" textAnchor="middle" fontWeight="700" fill={COLORS.red}>
            ~100ms total
          </text>
        )}

        {/* Cache stats footer */}
        <rect x="20" y="310" width="540" height="20" rx="4" fill={COLORS.bgAlt} stroke={COLORS.light} />
        <text x="290" y="324" fontSize="10" textAnchor="middle" fill={COLORS.dark}>
          {t.cacheStats}
        </text>
      </svg>

      {/* Summary */}
      <div className={`mt-4 p-3 rounded border ${
        state === 'hit'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <p className={`text-sm font-semibold ${state === 'hit' ? 'text-green-700' : 'text-red-700'}`}>
          {state === 'hit' ? t.hitSummary : t.missSummary}
        </p>
      </div>
    </div>
  );
};

export default PrimitiveCacheFlow;
