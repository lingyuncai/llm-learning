import React, { useState, useCallback, useRef } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Arm {
  name: string;
  trueQuality: number; // hidden true mean reward
  trueCost: number;
  color: string;
}

const ARMS: Arm[] = [
  { name: 'GPT-4o', trueQuality: 0.95, trueCost: 0.03, color: '#6a1b9a' },
  { name: 'Claude Sonnet', trueQuality: 0.90, trueCost: 0.015, color: '#1565c0' },
  { name: 'Llama-70B', trueQuality: 0.82, trueCost: 0.005, color: '#2e7d32' },
  { name: 'GPT-4o-mini', trueQuality: 0.78, trueCost: 0.001, color: '#e65100' },
];

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function BanditExploration() {
  const [pulls, setPulls] = useState<{ arm: number; reward: number }[]>([]);
  const [estimates, setEstimates] = useState(ARMS.map(() => ({ sum: 0, count: 0 })));
  const [epsilon, setEpsilon] = useState(20); // explore rate %

  // Use functional state updates to avoid stale closure issues
  const pullArm = useCallback((armIdx: number) => {
    setPulls(prev => {
      const arm = ARMS[armIdx];
      const seed = prev.length * 7 + armIdx * 13 + 42;
      const noise = (seededRandom(seed) - 0.5) * 0.3;
      const reward = Math.max(0, Math.min(1, arm.trueQuality + noise));
      const netReward = reward - arm.trueCost * 10;
      return [...prev, { arm: armIdx, reward: netReward }];
    });
    setEstimates(prev => {
      // Recompute reward here to match (same seed logic)
      const arm = ARMS[armIdx];
      // Note: we use a ref-based counter for consistent seeding
      const noise = (seededRandom(armIdx * 13 + 42 + prev[armIdx].count * 7) - 0.5) * 0.3;
      const reward = Math.max(0, Math.min(1, arm.trueQuality + noise));
      const netReward = reward - arm.trueCost * 10;
      const next = [...prev];
      next[armIdx] = {
        sum: prev[armIdx].sum + netReward,
        count: prev[armIdx].count + 1,
      };
      return next;
    });
  }, []);

  // Keep latest state in ref for autoStep to avoid stale closures
  const estimatesRef = useRef(estimates);
  estimatesRef.current = estimates;
  const pullCountRef = useRef(0);
  pullCountRef.current = pulls.length;

  const autoStep = useCallback(() => {
    const seed = pullCountRef.current * 17 + 99;
    const isExplore = seededRandom(seed) * 100 < epsilon;

    if (isExplore) {
      const armIdx = Math.floor(seededRandom(seed + 1) * ARMS.length);
      pullArm(armIdx);
    } else {
      const est = estimatesRef.current;
      const avgs = est.map(e => e.count === 0 ? Infinity : e.sum / e.count);
      const bestIdx = avgs.indexOf(Math.max(...avgs.filter(v => v !== Infinity)));
      pullArm(bestIdx >= 0 ? bestIdx : 0);
    }
  }, [epsilon, pullArm]);

  const reset = () => {
    setPulls([]);
    setEstimates(ARMS.map(() => ({ sum: 0, count: 0 })));
  };

  const W = 580, H = 400;
  const totalPulls = pulls.length;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Multi-armed Bandit 探索
        </text>
        <text x={W / 2} y="40" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          ε-greedy: {epsilon}% 探索 · {100 - epsilon}% 利用 · 共 {totalPulls} 次选择
        </text>

        {/* Arms */}
        {ARMS.map((arm, i) => {
          const x = 30 + i * 135;
          const est = estimates[i];
          const avg = est.count > 0 ? (est.sum / est.count).toFixed(3) : '?';
          const barH = est.count > 0 ? Math.max(5, (est.sum / est.count / 1) * 120) : 5;

          return (
            <g key={arm.name} transform={`translate(${x}, 55)`}>
              <rect x="0" y="0" width="125" height="160" rx="6"
                    fill={COLORS.bgAlt} stroke={arm.color} strokeWidth="1.5" />
              <text x="62.5" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="11" fontWeight="700" fill={arm.color}>
                {arm.name}
              </text>
              <text x="62.5" y="36" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="9" fill={COLORS.mid}>
                选择 {est.count} 次
              </text>

              {/* Estimated value bar */}
              <rect x="15" y={140 - barH} width="95" height={barH} rx="3"
                    fill={arm.color} opacity="0.3" />
              <text x="62.5" y="155" textAnchor="middle" fontFamily={FONTS.mono}
                    fontSize="10" fill={COLORS.dark}>
                估值: {avg}
              </text>

              {/* Manual pull button */}
              <rect x="20" y="50" width="85" height="22" rx="4"
                    fill={arm.color} opacity="0.8"
                    style={{ cursor: 'pointer' }}
                    onClick={() => pullArm(i)} />
              <text x="62.5" y="65" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="10" fill="#fff" style={{ pointerEvents: 'none' }}>
                手动选择
              </text>
            </g>
          );
        })}

        {/* Recent history */}
        <g transform="translate(30, 230)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
            最近选择:
          </text>
          {pulls.slice(-15).map((p, i) => (
            <rect key={i} x={80 + i * 30} y="-8" width="24" height="16" rx="3"
                  fill={ARMS[p.arm].color} opacity="0.7" />
          ))}
        </g>

        {/* Cumulative reward */}
        <g transform="translate(30, 258)">
          <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
            累计 net reward: {pulls.reduce((s, p) => s + p.reward, 0).toFixed(2)}
          </text>
        </g>
      </svg>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button onClick={autoStep}
                className="px-3 py-1.5 bg-blue-700 text-white text-sm rounded hover:bg-blue-800">
          ε-greedy 一步
        </button>
        <button onClick={() => { for (let i = 0; i < 10; i++) autoStep(); }}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          连续 10 步
        </button>
        <button onClick={reset}
                className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
          重置
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ε:</span>
          <input type="range" min="0" max="100" value={epsilon}
                 onChange={e => setEpsilon(Number(e.target.value))}
                 className="w-24 accent-blue-700" />
          <span className="text-sm font-mono text-gray-500">{epsilon}%</span>
        </div>
      </div>
    </div>
  );
}
