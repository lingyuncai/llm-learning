import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 360;

export default function PolicyGradientIntuition() {
  const [probs, setProbs] = useState([0.25, 0.25, 0.25, 0.25]);
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [history, setHistory] = useState<{ action: number; reward: number }[]>([]);

  const actions = ['动作 A', '动作 B', '动作 C', '动作 D'];
  const trueRewards = [0.2, 0.8, -0.5, 0.1]; // hidden expected rewards
  const barW = 80;
  const barMaxH = 160;
  const ox = 60;
  const oy = 60;

  const sampleReward = (ai: number) => {
    return trueRewards[ai] + (Math.random() - 0.5) * 0.6;
  };

  const takeAction = (ai: number) => {
    const reward = Math.round(sampleReward(ai) * 100) / 100;
    setLastAction(ai);
    setLastReward(reward);
    setHistory(prev => [...prev, { action: ai, reward }]);

    // Policy gradient update: increase prob of positive reward actions
    const lr = 0.1;
    const newProbs = probs.map((p, i) => {
      if (i === ai) return p + lr * reward * (1 - p);
      return p - lr * reward * p;
    });
    // Normalize
    const sum = newProbs.reduce((a, b) => a + Math.max(0.01, b), 0);
    setProbs(newProbs.map(p => Math.max(0.01, p) / sum));
  };

  const reset = () => {
    setProbs([0.25, 0.25, 0.25, 0.25]);
    setLastAction(null);
    setLastReward(null);
    setHistory([]);
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          Policy Gradient 直觉：概率分布随 Reward 调整
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          点击动作获得 reward → 正 reward 推高概率，负 reward 压低概率
        </text>

        {/* Probability bars */}
        {probs.map((p, i) => {
          const x = ox + i * (barW + 20);
          const h = p * barMaxH;
          const isLast = lastAction === i;
          return (
            <g key={i} onClick={() => takeAction(i)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={oy + barMaxH - h} width={barW} height={h} rx={4}
                fill={isLast ? (lastReward! > 0 ? COLORS.green : COLORS.red) : COLORS.primary}
                opacity={isLast ? 1 : 0.7} />
              <rect x={x} y={oy} width={barW} height={barMaxH} rx={4}
                fill="none" stroke={COLORS.light} strokeWidth={1} />
              <text x={x + barW / 2} y={oy + barMaxH + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={COLORS.dark}>
                {actions[i]}
              </text>
              <text x={x + barW / 2} y={oy + barMaxH + 34} textAnchor="middle" fontSize={11} fill={COLORS.mid} fontFamily={FONTS.mono}>
                π = {(p * 100).toFixed(1)}%
              </text>
              <text x={x + barW / 2} y={oy + barMaxH - h - 6} textAnchor="middle" fontSize={10} fontWeight={600}
                fill={COLORS.dark} fontFamily={FONTS.mono}>
                {p.toFixed(3)}
              </text>
            </g>
          );
        })}

        {/* Last action result */}
        {lastAction !== null && lastReward !== null && (
          <g>
            <rect x={420} y={oy} width={140} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
            <text x={490} y={oy + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
              上次：{actions[lastAction]}
            </text>
            <text x={490} y={oy + 38} textAnchor="middle" fontSize={13} fontWeight={700}
              fill={lastReward > 0 ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
              reward = {lastReward > 0 ? '+' : ''}{lastReward.toFixed(2)}
            </text>
          </g>
        )}

        {/* Gradient explanation */}
        <rect x={420} y={oy + 60} width={140} height={60} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={490} y={oy + 78} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
          策略梯度核心
        </text>
        <text x={490} y={oy + 94} textAnchor="middle" fontSize={9} fill={COLORS.dark} fontFamily={FONTS.mono}>
          ∇J ≈ ∇log π(a|s) · R
        </text>
        <text x={490} y={oy + 110} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
          R{'>'}0: 推高 π(a) | R{'<'}0: 压低 π(a)
        </text>

        {/* History sparkline */}
        <text x={420} y={oy + 140} fontSize={10} fontWeight={600} fill={COLORS.dark}>
          reward 历史 ({history.length} 步)
        </text>
        {history.slice(-20).map((h, i) => (
          <rect key={i} x={420 + i * 7} y={oy + 148} width={5}
            height={Math.abs(h.reward) * 30}
            transform={h.reward < 0 ? `translate(0, 0)` : `translate(0, ${-Math.abs(h.reward) * 30})`}
            fill={h.reward > 0 ? COLORS.green : COLORS.red} opacity={0.7} rx={1} />
        ))}

        {/* Reset */}
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={460} y={H - 40} width={60} height={24} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={490} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={30} y={H - 10} fontSize={9} fill={COLORS.mid}>
          每个动作有隐藏的期望 reward | 多次点击观察策略如何收敛到最优动作
        </text>
      </svg>
    </div>
  );
}
