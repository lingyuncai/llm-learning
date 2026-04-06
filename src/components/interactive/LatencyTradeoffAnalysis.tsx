import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

export default function LatencyTradeoffAnalysis({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '延迟 Tradeoff 分析',
      warning: '⚠️ 本地 ≠ 低延迟 — 总延迟取决于多个因素',
      local: '本地',
      cloud: '云端',
      prefill: 'Prefill',
      generate: 'Generate',
      network: 'Net',
      gen: 'Gen',
      localAdvantage: '✓ 零网络延迟 · ✗ 消费级硬件 prefill 慢、生成慢',
      cloudAdvantage: '✗ 网络往返 + 排队 · ✓ A100/H100 快速计算',
      localFaster: '🟢 本地更快',
      cloudFaster: '🔵 云端更快',
      vs: 'vs',
      insightTitle: '关键洞察',
      insightDetail1: '简短 query + 强本地硬件 → 本地可能更快。长生成 + 弱硬件 → 云端大概率更快。',
      insightDetail2: '延迟路由需要实时估算两端总延迟，不能简单假设"本地更快"。',
      queryComplexity: 'Query 复杂度:',
      localHardware: '本地硬件:',
      networkLatency: '网络延迟:',
      cloudLoad: '云端负载:',
    },
    en: {
      title: 'Latency Tradeoff Analysis',
      warning: '⚠️ Local ≠ Low Latency — total latency depends on multiple factors',
      local: 'Local',
      cloud: 'Cloud',
      prefill: 'Prefill',
      generate: 'Generate',
      network: 'Net',
      gen: 'Gen',
      localAdvantage: '✓ Zero network latency · ✗ Consumer hardware slow prefill & generation',
      cloudAdvantage: '✗ Network round-trip + queuing · ✓ A100/H100 fast compute',
      localFaster: '🟢 Local faster',
      cloudFaster: '🔵 Cloud faster',
      vs: 'vs',
      insightTitle: 'Key Insight',
      insightDetail1: 'Short query + powerful local hardware → local may be faster. Long generation + weak hardware → cloud likely faster.',
      insightDetail2: 'Latency routing requires real-time estimation of total latency on both sides, cannot simply assume "local is faster".',
      queryComplexity: 'Query complexity:',
      localHardware: 'Local hardware:',
      networkLatency: 'Network latency:',
      cloudLoad: 'Cloud load:',
    },
  }[locale];
  const [queryComplexity, setQueryComplexity] = useState(50); // tokens to generate
  const [localHardware, setLocalHardware] = useState(50); // 0=weak CPU, 100=M4 Max
  const [networkLatency, setNetworkLatency] = useState(30); // ms round trip
  const [cloudLoad, setCloudLoad] = useState(20); // 0=idle, 100=overloaded

  // Calculate latencies
  // Local: no network, but slower compute
  const localTPS = 5 + (localHardware / 100) * 45; // 5-50 tokens/sec
  const localPrefill = 50 + (100 - localHardware) * 2; // prefill ms
  const localGenerate = (queryComplexity * 3) / localTPS * 1000; // generation ms
  const localTotal = localPrefill + localGenerate;

  // Cloud: network overhead, but fast compute
  const cloudTPS = 80; // A100/H100 always fast
  const cloudPrefill = 20; // fast GPU
  const cloudNetwork = networkLatency * 2; // round trip
  const cloudQueue = cloudLoad * 5; // queuing delay
  const cloudGenerate = (queryComplexity * 3) / cloudTPS * 1000;
  const cloudTotal = cloudNetwork + cloudQueue + cloudPrefill + cloudGenerate;

  const maxLatency = Math.max(localTotal, cloudTotal, 500);
  const winner = localTotal < cloudTotal ? 'local' : 'cloud';

  const W = 580, H = 440;
  const barL = 130, barR = 520, barW = barR - barL;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          {t.warning}
        </text>

        {/* Local breakdown */}
        <g transform="translate(0, 60)">
          <text x="20" y="15" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
            {t.local} ({Math.round(localTotal)}ms)
          </text>

          {/* Stacked bar */}
          <rect x={barL} y="2" width={barW} height="24" rx="3" fill={COLORS.light} />
          <rect x={barL} y="2" width={Math.min((localPrefill / maxLatency) * barW, barW)} height="24" rx="3" fill="#81c784" />
          <rect x={barL + (localPrefill / maxLatency) * barW} y="2"
                width={Math.min((localGenerate / maxLatency) * barW, barW - (localPrefill / maxLatency) * barW)} height="24" rx="3" fill="#4caf50" />

          <text x={barL + 5} y="18" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.dark}>
            {t.prefill} {Math.round(localPrefill)}ms
          </text>
          <text x={barL + (localPrefill / maxLatency) * barW + 5} y="18"
                fontFamily={FONTS.mono} fontSize="9" fill="#fff">
            {t.generate} {Math.round(localGenerate)}ms ({localTPS.toFixed(0)} tok/s)
          </text>

          <text x={barL} y="42" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {t.localAdvantage}
          </text>
        </g>

        {/* Cloud breakdown */}
        <g transform="translate(0, 120)">
          <text x="20" y="15" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.primary}>
            {t.cloud} ({Math.round(cloudTotal)}ms)
          </text>

          <rect x={barL} y="2" width={barW} height="24" rx="3" fill={COLORS.light} />
          {/* Network */}
          <rect x={barL} y="2" width={(cloudNetwork / maxLatency) * barW} height="24" rx="3" fill="#e57373" />
          {/* Queue */}
          <rect x={barL + (cloudNetwork / maxLatency) * barW} y="2"
                width={(cloudQueue / maxLatency) * barW} height="24" rx="3" fill="#ef9a9a" />
          {/* Prefill */}
          <rect x={barL + ((cloudNetwork + cloudQueue) / maxLatency) * barW} y="2"
                width={(cloudPrefill / maxLatency) * barW} height="24" rx="3" fill="#64b5f6" />
          {/* Generate */}
          <rect x={barL + ((cloudNetwork + cloudQueue + cloudPrefill) / maxLatency) * barW} y="2"
                width={(cloudGenerate / maxLatency) * barW} height="24" rx="3" fill="#42a5f5" />

          <text x={barL + 3} y="18" fontFamily={FONTS.mono} fontSize="8" fill="#fff">
            {t.network} {Math.round(cloudNetwork)}ms
          </text>
          <text x={barL + ((cloudNetwork + cloudQueue + cloudPrefill) / maxLatency) * barW + 3} y="18"
                fontFamily={FONTS.mono} fontSize="8" fill="#fff">
            {t.gen} {Math.round(cloudGenerate)}ms ({cloudTPS} tok/s)
          </text>

          <text x={barL} y="42" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {t.cloudAdvantage}
          </text>
        </g>

        {/* Winner */}
        <g transform="translate(40, 185)">
          <rect x="0" y="0" width="500" height="32" rx="4"
                fill={winner === 'local' ? COLORS.valid : '#dbeafe'}
                stroke={winner === 'local' ? COLORS.green : COLORS.primary} strokeWidth="2" />
          <text x="250" y="21" textAnchor="middle" fontFamily={FONTS.sans}
                fontSize="13" fontWeight="700"
                fill={winner === 'local' ? COLORS.green : COLORS.primary}>
            {winner === 'local'
              ? `${t.localFaster} (${Math.round(localTotal)}ms ${t.vs} ${Math.round(cloudTotal)}ms)`
              : `${t.cloudFaster} (${Math.round(cloudTotal)}ms ${t.vs} ${Math.round(localTotal)}ms)`}
          </text>
        </g>

        {/* Insight */}
        <g transform="translate(40, 228)">
          <rect x="0" y="0" width="500" height="52" rx="4"
                fill="#fef3c7" stroke={COLORS.orange} strokeWidth="1.5" />
          <text x="15" y="18" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            {t.insightTitle}
          </text>
          <text x="15" y="36" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>
            {t.insightDetail1}
          </text>
          <text x="15" y="48" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
            {t.insightDetail2}
          </text>
        </g>
      </svg>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">{t.queryComplexity}</span>
          <input type="range" min="5" max="100" value={queryComplexity}
                 onChange={e => setQueryComplexity(Number(e.target.value))}
                 className="flex-1 accent-blue-700" />
          <span className="font-mono text-gray-500 w-16">{queryComplexity * 3} tok</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">{t.localHardware}</span>
          <input type="range" min="0" max="100" value={localHardware}
                 onChange={e => setLocalHardware(Number(e.target.value))}
                 className="flex-1 accent-green-700" />
          <span className="font-mono text-gray-500 w-16">{localTPS.toFixed(0)} t/s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">{t.networkLatency}</span>
          <input type="range" min="5" max="200" value={networkLatency}
                 onChange={e => setNetworkLatency(Number(e.target.value))}
                 className="flex-1 accent-red-700" />
          <span className="font-mono text-gray-500 w-16">{networkLatency}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-24">{t.cloudLoad}</span>
          <input type="range" min="0" max="100" value={cloudLoad}
                 onChange={e => setCloudLoad(Number(e.target.value))}
                 className="flex-1 accent-orange-700" />
          <span className="font-mono text-gray-500 w-16">{cloudLoad}%</span>
        </div>
      </div>
    </div>
  );
}
