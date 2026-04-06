import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const W = 580;

export default function PPOForLLM({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: Policy (LLM) 生成回答',
      prompt: 'Prompt',
      policy: 'LLM (Policy)',
      response: 'Response',
      analogy: '游戏 RL 对应关系：',
      analogyDetail: 'State = prompt + 已生成 tokens | Action = 下一个 token | Trajectory = 完整回答',
      step2Title: 'Step 2: Reward Model 给回答打分',
      rewardModel: 'Reward Model',
      rmRole: 'Reward Model 的角色：',
      rmDetail: 'RM 把人类偏好量化为标量分数 | 高分 = 有帮助、安全、准确 | 低分 = 有害、不准确、不相关',
      step3Title: 'Step 3: 计算 Advantage（含 KL 惩罚）',
      totalReward: '总 Reward = RM score - β·KL(π ∥ π_ref)',
      rmScore: 'RM score: 回答质量 | KL 惩罚: 不要偏离太远',
      betaControl: 'β 控制探索 vs 保守的平衡',
      gae: 'GAE 计算 Advantage',
      gaeDetail: '每个 token 位置都有一个 Advantage 值',
      klWhy: '为什么需要 KL 惩罚？',
      klDetail: '没有 KL → LLM 会 "hack" RM（学会讨好评分器而非真正变好）→ Reward Hacking',
      step4Title: 'Step 4: PPO 更新 LLM 参数',
      clipDetail: 'A > 0 的 token → 增加生成概率（但不超过 1+ε）| A < 0 → 减少（但不低于 1-ε）',
      gameRL: '游戏 RL',
      gameDetail: '一个 episode → 一个 reward',
      llmRLHF: 'LLM RLHF',
      llmDetail: '每个 token = 一步 → RM 给整体评分',
    },
    en: {
      step1Title: 'Step 1: Policy (LLM) generates response',
      prompt: 'Prompt',
      policy: 'LLM (Policy)',
      response: 'Response',
      analogy: 'Game RL mapping:',
      analogyDetail: 'State = prompt + generated tokens | Action = next token | Trajectory = full response',
      step2Title: 'Step 2: Reward Model scores response',
      rewardModel: 'Reward Model',
      rmRole: 'Reward Model role:',
      rmDetail: 'RM quantifies human preference to scalar | High = helpful, safe, accurate | Low = harmful, inaccurate, irrelevant',
      step3Title: 'Step 3: Compute Advantage (with KL penalty)',
      totalReward: 'Total Reward = RM score - β·KL(π ∥ π_ref)',
      rmScore: 'RM score: response quality | KL penalty: don\'t drift too far',
      betaControl: 'β controls exploration vs conservation',
      gae: 'GAE Compute Advantage',
      gaeDetail: 'Each token position has an Advantage value',
      klWhy: 'Why KL penalty?',
      klDetail: 'No KL → LLM "hacks" RM (gaming the scorer, not actually improving) → Reward Hacking',
      step4Title: 'Step 4: PPO updates LLM parameters',
      clipDetail: 'A > 0 tokens → increase prob (capped at 1+ε) | A < 0 → decrease (floored at 1-ε)',
      gameRL: 'Game RL',
      gameDetail: 'One episode → one reward',
      llmRLHF: 'LLM RLHF',
      llmDetail: 'Each token = one step → RM scores entire response',
    },
  }[locale];

  const steps = [
    {
      title: 'LLM 生成回答',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step1Title}
          </text>

          {/* Prompt → LLM → Response */}
          <rect x={30} y={50} width={120} height={40} rx={8} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={90} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>{t.prompt}</text>

          <line x1={155} y1={70} x2={210} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={215} y={40} width={140} height={60} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={285} y={62} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.orange}>{t.policy}</text>
          <text x={285} y={80} textAnchor="middle" fontSize={9} fill={COLORS.mid}>π_θ(token|context)</text>

          <line x1={360} y1={70} x2={415} y2={70} stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={420} y={50} width={130} height={40} rx={8} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1.5} />
          <text x={485} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.dark}>{t.response}</text>

          <defs>
            <marker id="arrowPPO" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
            </marker>
          </defs>

          {/* Analogy */}
          <rect x={30} y={120} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={40} y={138} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.analogy}</text>
          <text x={40} y={156} fontSize={10} fill={COLORS.mid}>
            {t.analogyDetail}
          </text>
        </svg>
      ),
    },
    {
      title: 'Reward Model 评分',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step2Title}
          </text>

          <rect x={30} y={50} width={100} height={35} rx={6} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={80} y={72} textAnchor="middle" fontSize={10} fill={COLORS.primary}>{t.prompt}</text>

          <text x={145} y={72} textAnchor="middle" fontSize={14} fill={COLORS.mid}>+</text>

          <rect x={160} y={50} width={100} height={35} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
          <text x={210} y={72} textAnchor="middle" fontSize={10} fill={COLORS.dark}>{t.response}</text>

          <line x1={265} y1={68} x2={320} y2={68} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={325} y={40} width={120} height={55} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={385} y={60} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.orange}>{t.rewardModel}</text>
          <text x={385} y={78} textAnchor="middle" fontSize={9} fill={COLORS.mid}>r = RM(prompt, response)</text>

          <line x1={450} y1={68} x2={500} y2={68} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={500} y={50} width={60} height={35} rx={6} fill={COLORS.green} stroke={COLORS.green} strokeWidth={1} />
          <text x={530} y={72} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">0.82</text>

          <rect x={30} y={120} width={520} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
          <text x={40} y={138} fontSize={10} fontWeight={600} fill={COLORS.dark}>{t.rmRole}</text>
          <text x={40} y={156} fontSize={10} fill={COLORS.mid}>
            {t.rmDetail}
          </text>
        </svg>
      ),
    },
    {
      title: '计算 Advantage',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step3Title}
          </text>

          <rect x={30} y={45} width={240} height={60} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
          <text x={150} y={64} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.primary}>
            {t.totalReward}
          </text>
          <text x={150} y={82} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            {t.rmScore}
          </text>
          <text x={150} y={96} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            {t.betaControl}
          </text>

          <line x1={275} y1={75} x2={320} y2={75} stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowPPO)" />

          <rect x={325} y={45} width={220} height={60} rx={8} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={2} />
          <text x={435} y={64} textAnchor="middle" fontSize={11} fontWeight={600} fill={COLORS.orange}>
            {t.gae}
          </text>
          <text x={435} y={82} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            A_t = Σ (γλ)^k · δ_{'{'}t+k{'}'}
          </text>
          <text x={435} y={96} textAnchor="middle" fontSize={9} fill={COLORS.mid}>
            {t.gaeDetail}
          </text>

          <rect x={30} y={130} width={520} height={40} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={40} y={148} fontSize={10} fontWeight={600} fill={COLORS.red}>
            {t.klWhy}
          </text>
          <text x={40} y={162} fontSize={10} fill={COLORS.mid}>
            {t.klDetail}
          </text>
        </svg>
      ),
    },
    {
      title: 'PPO 更新策略',
      content: (
        <svg viewBox={`0 0 ${W} 190`} className="w-full" style={{ fontFamily: FONTS.sans }}>
          <text x={W / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.dark}>
            {t.step4Title}
          </text>

          <rect x={30} y={45} width={520} height={70} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={50} y={65} fontSize={11} fontWeight={600} fill={COLORS.primary} fontFamily={FONTS.mono}>
            L_CLIP = E[min(ratio·A, clip(ratio, 1-ε, 1+ε)·A)]
          </text>
          <text x={50} y={85} fontSize={10} fill={COLORS.dark}>
            ratio = π_θ(token|context) / π_θ_old(token|context)
          </text>
          <text x={50} y={103} fontSize={10} fill={COLORS.mid}>
            {t.clipDetail}
          </text>

          <rect x={30} y={130} width={250} height={44} rx={6} fill="#d4edda" stroke={COLORS.green} strokeWidth={1} />
          <text x={155} y={148} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.green}>{t.gameRL}</text>
          <text x={155} y={164} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.gameDetail}</text>

          <rect x={300} y={130} width={250} height={44} rx={6} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
          <text x={425} y={148} textAnchor="middle" fontSize={10} fontWeight={600} fill={COLORS.orange}>{t.llmRLHF}</text>
          <text x={425} y={164} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.llmDetail}</text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
