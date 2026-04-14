// src/components/interactive/EvalProtocolFlow.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

const W = 600;
const H = 320;

type Protocol = 'few-shot' | 'cot' | 'pass-k' | 'llm-judge';

interface FlowStep {
  label: { zh: string; en: string };
  detail: { zh: string; en: string };
  icon: string;
}

const PROTOCOLS: Record<Protocol, { title: { zh: string; en: string }; steps: FlowStep[] }> = {
  'few-shot': {
    title: { zh: 'Few-Shot 评估', en: 'Few-Shot Evaluation' },
    steps: [
      { label: { zh: '构建 Prompt', en: 'Build Prompt' },
        detail: { zh: '将 k 个示例 + 测试问题拼接', en: 'Concatenate k examples + test question' },
        icon: '\u{1F4DD}' },
      { label: { zh: '模型推理', en: 'Model Inference' },
        detail: { zh: '模型根据示例模式生成答案', en: 'Model generates answer following example pattern' },
        icon: '\u{1F916}' },
      { label: { zh: '提取答案', en: 'Extract Answer' },
        detail: { zh: '从生成文本中解析出最终答案', en: 'Parse final answer from generated text' },
        icon: '\u{1F50D}' },
      { label: { zh: '评分', en: 'Score' },
        detail: { zh: '与 ground truth 精确匹配', en: 'Exact match against ground truth' },
        icon: '\u2705' },
    ],
  },
  'cot': {
    title: { zh: 'Chain-of-Thought', en: 'Chain-of-Thought' },
    steps: [
      { label: { zh: '构建 CoT Prompt', en: 'Build CoT Prompt' },
        detail: { zh: '添加 "Let\'s think step by step" 或示例推理链', en: 'Add "Let\'s think step by step" or example reasoning chains' },
        icon: '\u{1F4DD}' },
      { label: { zh: '模型推理', en: 'Model Reasoning' },
        detail: { zh: '模型先输出推理过程，再给出答案', en: 'Model outputs reasoning process, then answer' },
        icon: '\u{1F4AD}' },
      { label: { zh: '提取最终答案', en: 'Extract Final Answer' },
        detail: { zh: '从推理链末尾提取答案（忽略中间步骤）', en: 'Extract answer from end of reasoning chain' },
        icon: '\u{1F50D}' },
      { label: { zh: '评分', en: 'Score' },
        detail: { zh: '与 ground truth 匹配', en: 'Match against ground truth' },
        icon: '\u2705' },
    ],
  },
  'pass-k': {
    title: { zh: 'pass@k (代码评估)', en: 'pass@k (Code Eval)' },
    steps: [
      { label: { zh: '输入函数签名', en: 'Input Signature' },
        detail: { zh: '函数签名 + docstring 作为 prompt', en: 'Function signature + docstring as prompt' },
        icon: '\u{1F4DD}' },
      { label: { zh: '生成 k 个候选', en: 'Generate k Samples' },
        detail: { zh: '采样 k 次，每次生成一个完整函数体', en: 'Sample k times, each generating a complete function body' },
        icon: '\u{1F504}' },
      { label: { zh: '沙箱执行', en: 'Sandbox Execution' },
        detail: { zh: '每个候选在隔离环境中运行测试用例', en: 'Run test cases for each candidate in sandbox' },
        icon: '\u{1F9EA}' },
      { label: { zh: '计算 pass@k', en: 'Compute pass@k' },
        detail: { zh: 'k 个中至少 1 个通过所有测试 = pass', en: 'At least 1 of k passes all tests = pass' },
        icon: '\u{1F4CA}' },
    ],
  },
  'llm-judge': {
    title: { zh: 'LLM-as-Judge', en: 'LLM-as-Judge' },
    steps: [
      { label: { zh: '收集模型输出', en: 'Collect Outputs' },
        detail: { zh: '被评估模型对 prompt 生成回答', en: 'Evaluated model generates response to prompt' },
        icon: '\u{1F4DD}' },
      { label: { zh: '构建评估 Prompt', en: 'Build Eval Prompt' },
        detail: { zh: '将原始问题 + 模型回答 + 评分标准发给 Judge 模型', en: 'Send question + response + rubric to judge model' },
        icon: '\u{1F4CB}' },
      { label: { zh: 'Judge 评分', en: 'Judge Scoring' },
        detail: { zh: '强模型（如 GPT-4）评估回答质量，给出分数或排名', en: 'Strong model (e.g. GPT-4) evaluates quality, gives score or ranking' },
        icon: '\u2696\uFE0F' },
      { label: { zh: '汇总', en: 'Aggregate' },
        detail: { zh: '多次评估取平均 / 计算胜率', en: 'Average multiple evaluations / compute win rate' },
        icon: '\u{1F4CA}' },
    ],
  },
};

const PROTOCOL_ORDER: Protocol[] = ['few-shot', 'cot', 'pass-k', 'llm-judge'];

export default function EvalProtocolFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const [activeTab, setActiveTab] = useState<Protocol>('few-shot');
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const protocol = PROTOCOLS[activeTab];
  const stepCount = protocol.steps.length;

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    // Reset when tab changes
    setActiveStep(-1);
    setPlaying(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, [activeTab]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    setPlaying(true);
    setActiveStep(0);
    timerRef.current = setInterval(() => {
      setActiveStep(prev => {
        const next = prev + 1;
        if (next >= stepCount) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1200);
  };

  // Layout calculations
  const tabY = 10;
  const flowY = 70;
  const stepW = 110;
  const stepH = 130;
  const gap = 22;
  const totalFlowW = stepCount * stepW + (stepCount - 1) * gap;
  const flowStartX = (W - totalFlowW) / 2;
  const arrowLen = gap;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: FONTS.sans }}>
        {/* Title */}
        <text x={W / 2} y={tabY + 14} textAnchor="middle" fontSize={15} fontWeight={700} fill={COLORS.dark}>
          {t('评估协议流程', 'Evaluation Protocol Flow')}
        </text>

        {/* Tab switcher */}
        {PROTOCOL_ORDER.map((p, i) => {
          const tabW = 120;
          const totalTabW = PROTOCOL_ORDER.length * tabW + (PROTOCOL_ORDER.length - 1) * 6;
          const tabStartX = (W - totalTabW) / 2;
          const x = tabStartX + i * (tabW + 6);
          const isActive = activeTab === p;
          return (
            <g key={p} onClick={() => setActiveTab(p)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={tabY + 22} width={tabW} height={26} rx={13}
                fill={isActive ? COLORS.primary : '#fff'}
                stroke={isActive ? COLORS.primary : COLORS.light}
                strokeWidth={1.5} />
              <text x={x + tabW / 2} y={tabY + 39} textAnchor="middle" fontSize={11}
                fontWeight={isActive ? 700 : 400}
                fill={isActive ? '#fff' : COLORS.mid}>
                {PROTOCOLS[p].title[locale]}
              </text>
            </g>
          );
        })}

        {/* Flow steps */}
        <AnimatePresence mode="wait">
          <g key={activeTab}>
            {protocol.steps.map((step, i) => {
              const x = flowStartX + i * (stepW + gap);
              const isActive = i <= activeStep;
              const isCurrent = i === activeStep;
              const boxColor = isActive ? COLORS.primary : COLORS.light;
              const bgColor = isCurrent ? COLORS.primary + '12' : isActive ? COLORS.valid : '#fff';

              return (
                <g key={i}>
                  {/* Step box */}
                  <motion.g
                    initial={{ opacity: 0.4, scale: 0.95 }}
                    animate={{
                      opacity: isActive ? 1 : 0.4,
                      scale: isCurrent ? 1.03 : 1,
                    }}
                    transition={{ duration: 0.3 }}>
                    <rect x={x} y={flowY} width={stepW} height={stepH} rx={10}
                      fill={bgColor}
                      stroke={boxColor} strokeWidth={isCurrent ? 2.5 : 1.5} />
                    {/* Icon */}
                    <text x={x + stepW / 2} y={flowY + 28} textAnchor="middle" fontSize={22}>
                      {step.icon}
                    </text>
                    {/* Label */}
                    <text x={x + stepW / 2} y={flowY + 50} textAnchor="middle" fontSize={11}
                      fontWeight={700} fill={isActive ? COLORS.dark : COLORS.mid}>
                      {step.label[locale]}
                    </text>
                    {/* Detail text - wrapped */}
                    <foreignObject x={x + 6} y={flowY + 56} width={stepW - 12} height={65}>
                      <div style={{
                        fontSize: 9.5,
                        lineHeight: 1.35,
                        color: isActive ? COLORS.dark : COLORS.mid,
                        textAlign: 'center',
                        padding: '2px 0',
                      }}>
                        {step.detail[locale]}
                      </div>
                    </foreignObject>
                    {/* Step number */}
                    <circle cx={x + 14} cy={flowY + 12} r={9}
                      fill={isActive ? COLORS.primary : COLORS.light} />
                    <text x={x + 14} y={flowY + 16} textAnchor="middle" fontSize={10}
                      fontWeight={700} fill={isActive ? '#fff' : COLORS.mid}>
                      {i + 1}
                    </text>
                  </motion.g>

                  {/* Arrow between steps */}
                  {i < stepCount - 1 && (
                    <g>
                      <line
                        x1={x + stepW + 2} y1={flowY + stepH / 2}
                        x2={x + stepW + arrowLen - 4} y2={flowY + stepH / 2}
                        stroke={i < activeStep ? COLORS.primary : COLORS.light}
                        strokeWidth={2}
                        strokeDasharray={i < activeStep ? 'none' : '4,3'} />
                      <polygon
                        points={`${x + stepW + arrowLen - 4},${flowY + stepH / 2 - 4} ${x + stepW + arrowLen - 4},${flowY + stepH / 2 + 4} ${x + stepW + arrowLen + 2},${flowY + stepH / 2}`}
                        fill={i < activeStep ? COLORS.primary : COLORS.light} />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </AnimatePresence>

        {/* Play/Pause button */}
        <g onClick={togglePlay} style={{ cursor: 'pointer' }}>
          <rect x={W / 2 - 55} y={flowY + stepH + 22} width={110} height={30} rx={15}
            fill={playing ? COLORS.mid : COLORS.primary} />
          <text x={W / 2} y={flowY + stepH + 42} textAnchor="middle" fontSize={12}
            fontWeight={600} fill="#fff">
            {playing ? t('暂停', 'Pause') : activeStep >= stepCount - 1 ? t('重播', 'Replay') : t('播放动画', 'Play')}
          </text>
        </g>

        {/* Protocol subtitle */}
        <text x={W / 2} y={flowY - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill={COLORS.primary}>
          {protocol.title[locale]}
        </text>
      </svg>
    </div>
  );
}
