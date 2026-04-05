import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

interface Step {
  state: string;
  action: string;
  reward: number;
}

export default function REINFORCETrajectory() {
  const [trajectories, setTrajectories] = useState<{ steps: Step[]; totalReturn: number }[]>([]);
  const [sampling, setSampling] = useState(false);
  const gamma = 0.9;

  const sampleTrajectory = (): { steps: Step[]; totalReturn: number } => {
    const states = ['s₀', 's₁', 's₂', 's₃', 's₄'];
    const actions = ['a₁', 'a₂'];
    const steps: Step[] = [];
    let totalReturn = 0;

    for (let i = 0; i < 4; i++) {
      const action = actions[Math.random() > 0.5 ? 0 : 1];
      const reward = Math.round((Math.random() * 2 - 0.5) * 100) / 100;
      steps.push({ state: states[i], action, reward });
    }

    // Calculate discounted return for each step
    for (let i = steps.length - 1; i >= 0; i--) {
      totalReturn = steps[i].reward + gamma * totalReturn;
    }
    return { steps, totalReturn: Math.round(totalReturn * 100) / 100 };
  };

  const sample = () => {
    setSampling(true);
    setTimeout(() => {
      const traj = sampleTrajectory();
      setTrajectories(prev => [...prev.slice(-4), traj]);
      setSampling(false);
    }, 200);
  };

  const reset = () => {
    setTrajectories([]);
  };

  const ox = 30, oy = 70;
  const stepW = 120;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          REINFORCE：采样 Trajectory → 计算 Return → 更新
        </text>
        <text x={W / 2} y={44} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          γ = {gamma} | 每次采样一条完整轨迹，计算折扣回报
        </text>

        {/* Current trajectory visualization */}
        {trajectories.length > 0 && (
          <g>
            {trajectories[trajectories.length - 1].steps.map((step, i) => {
              const x = ox + i * stepW;
              return (
                <g key={i}>
                  {/* State node */}
                  <circle cx={x + 20} cy={oy + 20} r={18} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
                  <text x={x + 20} y={oy + 24} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>
                    {step.state}
                  </text>
                  {/* Action arrow */}
                  {i < 3 && (
                    <>
                      <line x1={x + 40} y1={oy + 20} x2={x + stepW} y2={oy + 20}
                        stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRF)" />
                      <text x={x + 70} y={oy + 12} textAnchor="middle" fontSize={9} fill={COLORS.orange} fontFamily={FONTS.mono}>
                        {step.action}
                      </text>
                    </>
                  )}
                  {/* Reward */}
                  <text x={x + 20} y={oy + 52} textAnchor="middle" fontSize={10} fontFamily={FONTS.mono}
                    fill={step.reward > 0 ? COLORS.green : COLORS.red}>
                    r={step.reward > 0 ? '+' : ''}{step.reward}
                  </text>
                </g>
              );
            })}
            <defs>
              <marker id="arrowRF" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* Return */}
            <rect x={ox + 4 * stepW - 80} y={oy} width={100} height={40} rx={6}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
            <text x={ox + 4 * stepW - 30} y={oy + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>
              G₀ (Return)
            </text>
            <text x={ox + 4 * stepW - 30} y={oy + 33} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily={FONTS.mono}
              fill={trajectories[trajectories.length - 1].totalReturn > 0 ? COLORS.green : COLORS.red}>
              {trajectories[trajectories.length - 1].totalReturn > 0 ? '+' : ''}
              {trajectories[trajectories.length - 1].totalReturn}
            </text>
          </g>
        )}

        {/* Historical returns (showing variance) */}
        <text x={ox} y={oy + 90} fontSize={12} fontWeight={600} fill={COLORS.dark}>
          历史采样 Return 分布（观察方差）
        </text>
        {trajectories.map((traj, i) => {
          const x = ox + i * 110;
          const barH = Math.abs(traj.totalReturn) * 40;
          const isPositive = traj.totalReturn > 0;
          return (
            <g key={i}>
              <rect x={x} y={isPositive ? oy + 130 - barH : oy + 130}
                width={90} height={barH} rx={4}
                fill={isPositive ? COLORS.green : COLORS.red} opacity={i === trajectories.length - 1 ? 0.9 : 0.4} />
              <text x={x + 45} y={oy + 150} textAnchor="middle" fontSize={10} fontFamily={FONTS.mono}
                fill={COLORS.dark}>
                {traj.totalReturn > 0 ? '+' : ''}{traj.totalReturn}
              </text>
              <text x={x + 45} y={oy + 164} textAnchor="middle" fontSize={8} fill={COLORS.mid}>
                采样 {i + 1}
              </text>
            </g>
          );
        })}

        {/* REINFORCE pseudocode */}
        <rect x={ox} y={oy + 180} width={520} height={70} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={ox + 10} y={oy + 198} fontSize={10} fontWeight={600} fill={COLORS.dark}>
          REINFORCE 更新规则：
        </text>
        <text x={ox + 10} y={oy + 216} fontSize={10} fontFamily={FONTS.mono} fill={COLORS.primary}>
          θ ← θ + α · ∇log π(aₜ|sₜ;θ) · Gₜ
        </text>
        <text x={ox + 10} y={oy + 236} fontSize={9} fill={COLORS.mid}>
          Gₜ {'>'} 0 → 增大该动作概率 | Gₜ {'<'} 0 → 减小该动作概率 | 多次采样才能得到可靠的梯度估计
        </text>

        {/* Controls */}
        <g onClick={sample} style={{ cursor: sampling ? 'default' : 'pointer' }}>
          <rect x={ox} y={H - 42} width={100} height={28} rx={5}
            fill={sampling ? COLORS.masked : COLORS.primary} />
          <text x={ox + 50} y={H - 24} textAnchor="middle" fontSize={12} fontWeight={600} fill="#fff">
            {sampling ? '采样中...' : '采样轨迹'}
          </text>
        </g>
        <g onClick={reset} style={{ cursor: 'pointer' }}>
          <rect x={ox + 120} y={H - 42} width={60} height={28} rx={5} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={ox + 150} y={H - 24} textAnchor="middle" fontSize={11} fill={COLORS.dark}>重置</text>
        </g>

        <text x={W - 30} y={H - 10} textAnchor="end" fontSize={9} fill={COLORS.mid}>
          多次采样观察 Return 的方差 — 这就是 REINFORCE 的核心问题
        </text>
      </svg>
    </div>
  );
}
