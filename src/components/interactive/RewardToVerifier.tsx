import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface Stage {
  id: string;
  label: string;
  x: number;
  capability: string;
  output: string;
  limitation: string;
}

const STAGES: Stage[] = [
  { id: 'rm', label: 'Reward Model', x: 80, capability: '给整个回答一个标量分数', output: 'r(x,y) ∈ ℝ', limitation: '无法定位错误步骤' },
  { id: 'prm', label: 'Process RM', x: 230, capability: '对推理过程的每一步打分', output: 'r(x,y,step_i) ∈ ℝ', limitation: '需要逐步标注数据' },
  { id: 'verifier', label: 'Verifier', x: 380, capability: '验证推理过程的正确性', output: 'correct/incorrect per step', limitation: '仅适用于可验证问题' },
];

export default function RewardToVerifier({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '从 Reward Model 到 Verifier 的演进',
      subtitle: '点击每个阶段查看能力对比',
      evolution: '能力演进',
      testTimeScaling: '→ Test-Time Scaling',
      capability: '能力：',
      output: '输出：',
      limitation: '局限：',
      clickToView: '← 点击阶段查看详情 →',
      granularity: '粒度',
      annotationCost: '标注成本',
      signalQuality: '信号质量',
      usage: '用途',
      overall: '整体',
      stepwise: '逐步',
      low: '低',
      high: '高',
      medium: '中(规则)',
      coarse: '粗',
      fine: '细',
      precise: '精确',
    },
    en: {
      title: 'Evolution from Reward Model to Verifier',
      subtitle: 'Click each stage to view capability comparison',
      evolution: 'Capability Evolution',
      testTimeScaling: '→ Test-Time Scaling',
      capability: 'Capability:',
      output: 'Output:',
      limitation: 'Limitation:',
      clickToView: '← Click stage to view details →',
      granularity: 'Granularity',
      annotationCost: 'Annotation Cost',
      signalQuality: 'Signal Quality',
      usage: 'Usage',
      overall: 'Overall',
      stepwise: 'Stepwise',
      low: 'Low',
      high: 'High',
      medium: 'Medium (Rule)',
      coarse: 'Coarse',
      fine: 'Fine',
      precise: 'Precise',
    },
  }[locale];

  const [active, setActive] = useState<string | null>(null);
  const activeStage = STAGES.find(s => s.id === active);

  const stageY = 100;
  const boxW = 120, boxH = 50;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize={11} fill={COLORS.mid}>
          {t.subtitle}
        </text>

        <line x1={80} y1={stageY - 24} x2={480} y2={stageY - 24}
          stroke={COLORS.light} strokeWidth={2} markerEnd="url(#arrowRV)" />
        <text x={280} y={stageY - 30} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{t.evolution} →</text>
        <defs>
          <marker id="arrowRV" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.light} />
          </marker>
        </defs>

        {STAGES.map((stage, i) => {
          const isActive = active === stage.id;
          const colors = [COLORS.primary, COLORS.orange, COLORS.green];
          return (
            <g key={stage.id} onClick={() => setActive(isActive ? null : stage.id)} style={{ cursor: 'pointer' }}>
              <rect x={stage.x - boxW / 2} y={stageY} width={boxW} height={boxH} rx={10}
                fill={isActive ? colors[i] : COLORS.bgAlt}
                stroke={colors[i]} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stage.x} y={stageY + boxH / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700}
                fill={isActive ? '#fff' : colors[i]}>
                {stage.label}
              </text>
            </g>
          );
        })}

        <rect x={450} y={stageY + 10} width={110} height={30} rx={6}
          fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth={1} />
        <text x={505} y={stageY + 29} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.purple}>
          {t.testTimeScaling}
        </text>

        {activeStage ? (
          <g>
            <rect x={30} y={190} width={520} height={55} rx={8} fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
            <text x={45} y={210} fontSize={11} fontWeight={700} fill={COLORS.dark}>{t.capability}</text>
            <text x={100} y={210} fontSize={11} fill={COLORS.dark}>{activeStage.capability}</text>
            <text x={45} y={230} fontSize={10} fontWeight={600} fill={COLORS.mid}>{t.output}</text>
            <text x={100} y={230} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>{activeStage.output}</text>

            <rect x={30} y={255} width={520} height={35} rx={6} fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
            <text x={45} y={276} fontSize={10} fontWeight={600} fill={COLORS.red}>{t.limitation}</text>
            <text x={100} y={276} fontSize={10} fill={COLORS.dark}>{activeStage.limitation}</text>
          </g>
        ) : (
          <rect x={30} y={190} width={520} height={100} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        )}
        {!activeStage && (
          <text x={W / 2} y={240} textAnchor="middle" fontSize={12} fill={COLORS.mid}>
            {t.clickToView}
          </text>
        )}

        <rect x={30} y={300} width={520} height={60} rx={6} fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth={1} />
        <text x={100} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>{t.granularity}</text>
        <text x={240} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>{t.annotationCost}</text>
        <text x={380} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>{t.signalQuality}</text>
        <text x={510} y={318} textAnchor="middle" fontSize={9} fontWeight={600} fill={COLORS.dark}>{t.usage}</text>

        {[
          { label: 'RM', g: t.overall, c: t.low, q: t.coarse, u: 'RLHF' },
          { label: 'PRM', g: t.stepwise, c: t.high, q: t.fine, u: 'MCTS' },
          { label: 'Verifier', g: t.stepwise, c: t.medium, q: t.precise, u: 'Best-of-N' },
        ].map((row, i) => (
          <g key={i}>
            <text x={40} y={338 + i * 14} fontSize={9} fontWeight={600} fill={COLORS.dark}>{row.label}</text>
            <text x={100} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.g}</text>
            <text x={240} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.c}</text>
            <text x={380} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.q}</text>
            <text x={510} y={338 + i * 14} textAnchor="middle" fontSize={9} fill={COLORS.mid}>{row.u}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
