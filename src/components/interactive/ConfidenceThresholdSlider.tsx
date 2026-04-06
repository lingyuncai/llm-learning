import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// Simulated data: at each threshold, what's the cost and quality
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, 10, ..., 100
const QUALITY = [100, 99, 98, 97, 96, 95, 94, 92, 90, 87, 83, 80, 76, 72, 68, 63, 58, 52, 45, 38, 30];
const COST = [100, 95, 88, 80, 72, 63, 55, 48, 40, 34, 28, 23, 19, 16, 13, 11, 9, 7, 6, 5, 4];
// % queries sent to strong model
const STRONG_PCT = [100, 92, 84, 75, 67, 58, 50, 42, 35, 28, 22, 17, 13, 10, 8, 6, 5, 4, 3, 2, 1];

export default function ConfidenceThresholdSlider({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '置信度阈值 Tradeoff',
      subtitle: '阈值 τ',
      subtitleDesc: '自评分',
      acceptOrUpgrade: '则接受，否则升级',
      threshold: '置信度阈值',
      quality: '质量',
      cost: '成本',
      thresholdValue: '阈值 τ',
      qualityRetention: '质量保持',
      costEquiv: '成本: 相当于 GPT-4 的',
      querySent: '的 query 被发送到强模型',
      queryAnswered: '由弱模型直接回答',
      warnLow: '⚠️ 阈值太低：大多数 query 升级，成本接近 GPT-4',
      warnHigh: '⚠️ 阈值太高：多数 query 不升级，质量可能下降',
      balanced: '✓ 平衡区间：合理的成本-质量 tradeoff',
      lowThreshold: '低阈值 (质量优先)',
      highThreshold: '高阈值 (成本优先)',
    },
    en: {
      title: 'Confidence Threshold Tradeoff',
      subtitle: 'Threshold τ',
      subtitleDesc: 'Self-assessment score',
      acceptOrUpgrade: 'accept, otherwise upgrade',
      threshold: 'Confidence Threshold',
      quality: 'Quality',
      cost: 'Cost',
      thresholdValue: 'Threshold τ',
      qualityRetention: 'Quality retention',
      costEquiv: 'Cost: equivalent to',
      querySent: 'of queries sent to strong model',
      queryAnswered: 'answered directly by weak model',
      warnLow: '⚠️ Threshold too low: most queries upgrade, cost close to GPT-4',
      warnHigh: '⚠️ Threshold too high: most queries not upgraded, quality may drop',
      balanced: '✓ Balanced range: reasonable cost-quality tradeoff',
      lowThreshold: 'Low Threshold (Quality First)',
      highThreshold: 'High Threshold (Cost First)',
    },
  }[locale];

  const [thresholdIdx, setThresholdIdx] = useState(10); // default 50%

  const W = 580, H = 380;
  const chartL = 60, chartR = 530, chartT = 70, chartB = 250;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  const getX = (idx: number) => chartL + (idx / 20) * chartW;
  const getYQ = (val: number) => chartB - (val / 100) * chartH;
  const getYC = (val: number) => chartB - (val / 100) * chartH;

  const qualityPath = QUALITY.map((v, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getYQ(v)}`).join(' ');
  const costPath = COST.map((v, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getYC(v)}`).join(' ');

  const thresholdValue = THRESHOLDS[thresholdIdx];
  const q = QUALITY[thresholdIdx];
  const c = COST[thresholdIdx];
  const s = STRONG_PCT[thresholdIdx];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="11" fill={COLORS.mid}>
          {t.subtitle} = {thresholdValue}% — {t.subtitleDesc} {'>'} τ {t.acceptOrUpgrade}
        </text>

        {/* Axes */}
        <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke={COLORS.mid} strokeWidth="1.5" />
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke={COLORS.mid} strokeWidth="1.5" />
        <text x={W / 2} y={chartB + 28} textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
          {t.threshold} (%)
        </text>

        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <text x={chartL - 8} y={getYQ(v) + 4} textAnchor="end" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
            <line x1={chartL} y1={getYQ(v)} x2={chartR} y2={getYQ(v)} stroke={COLORS.light} strokeWidth="0.5" />
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <text key={`x-${v}`} x={getX(v / 5)} y={chartB + 15} textAnchor="middle"
                fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>{v}</text>
        ))}

        {/* Quality curve */}
        <path d={qualityPath} fill="none" stroke={COLORS.green} strokeWidth="2.5" />
        <text x={chartR + 5} y={getYQ(QUALITY[20]) + 4} fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.green}>{t.quality}</text>

        {/* Cost curve */}
        <path d={costPath} fill="none" stroke={COLORS.red} strokeWidth="2.5" />
        <text x={chartR + 5} y={getYC(COST[20]) + 4} fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.red}>{t.cost}</text>

        {/* Current threshold indicator */}
        <line x1={getX(thresholdIdx)} y1={chartT} x2={getX(thresholdIdx)} y2={chartB}
              stroke={COLORS.primary} strokeWidth="2" strokeDasharray="6,4" />
        <circle cx={getX(thresholdIdx)} cy={getYQ(q)} r="6" fill={COLORS.green} stroke="#fff" strokeWidth="2" />
        <circle cx={getX(thresholdIdx)} cy={getYC(c)} r="6" fill={COLORS.red} stroke="#fff" strokeWidth="2" />

        {/* Summary box */}
        <g transform="translate(40, 275)">
          <rect x="0" y="0" width="500" height="80" rx="6"
                fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x="20" y="22" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.thresholdValue} = {thresholdValue}%
          </text>
          <text x="20" y="42" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green}>
            {t.qualityRetention}: {q}% of GPT-4 · {t.costEquiv} {c}%
          </text>
          <text x="20" y="60" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            {s}% {t.querySent} · {100 - s}% {t.queryAnswered}
          </text>
          <text x="20" y="75" fontFamily={FONTS.mono} fontSize="9" fill={COLORS.mid}>
            {thresholdValue < 30 ? t.warnLow :
             thresholdValue > 70 ? t.warnHigh :
             t.balanced}
          </text>
        </g>
      </svg>

      {/* Slider */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-sm text-gray-500">{t.lowThreshold}</span>
        <input type="range" min="0" max="20" value={thresholdIdx}
               onChange={e => setThresholdIdx(Number(e.target.value))}
               className="w-48 accent-blue-700" />
        <span className="text-sm text-gray-500">{t.highThreshold}</span>
      </div>
    </div>
  );
}
