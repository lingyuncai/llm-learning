import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

type TaskType = 'sentiment' | 'intent' | 'ner';

interface TaskData {
  input: string;
  classificationFlow: string[];
  classificationOutput: string;
  generationPrompt: string;
  generationOutput: string;
}

export default function ClassificationVsGeneration({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Classification vs Generation：同一任务的两种解法',
      bertSide: 'BERT / 分类方式',
      gptSide: 'GPT / 生成方式',
      tasks: {
        sentiment: '情感分析',
        intent: '意图识别',
        ner: '实体提取',
      },
      traits: ['速度', '准确率', '灵活性', '数据需求'],
      bertTraits: [95, 92, 30, 80],
      gptTraits: [30, 78, 95, 15],
      bertLabel: 'BERT (分类)',
      gptLabel: 'GPT (生成)',
      bertPros: ['快速确定性输出', '高准确率', '轻量部署'],
      bertCons: ['需要标注数据', '每个任务需微调', '不灵活'],
      gptPros: ['零样本 / 少样本', '高灵活性', '统一接口'],
      gptCons: ['速度慢', '输出不确定', '成本高'],
    },
    en: {
      title: 'Classification vs Generation: Two Approaches to the Same Task',
      bertSide: 'BERT / Classification',
      gptSide: 'GPT / Generation',
      tasks: {
        sentiment: 'Sentiment Analysis',
        intent: 'Intent Detection',
        ner: 'Entity Extraction',
      },
      traits: ['Speed', 'Accuracy', 'Flexibility', 'Data Needs'],
      bertTraits: [95, 92, 30, 80],
      gptTraits: [30, 78, 95, 15],
      bertLabel: 'BERT (Classification)',
      gptLabel: 'GPT (Generation)',
      bertPros: ['Fast deterministic output', 'High accuracy', 'Lightweight deployment'],
      bertCons: ['Needs labeled data', 'Per-task fine-tuning', 'Inflexible'],
      gptPros: ['Zero-shot / few-shot', 'Highly flexible', 'Unified interface'],
      gptCons: ['Slower inference', 'Non-deterministic', 'Higher cost'],
    },
  }[locale]!;

  const tasks: Record<'zh' | 'en', Record<TaskType, TaskData>> = {
    zh: {
      sentiment: {
        input: '这家餐厅的服务真的太棒了！',
        classificationFlow: ['BERT Encoder', '[CLS] → Linear', 'Softmax'],
        classificationOutput: 'Positive (0.96)',
        generationPrompt: '分析以下文本的情感：\n"这家餐厅的服务真的太棒了！"\n情感：',
        generationOutput: '积极。用户表达了对餐厅服务的高度满意。',
      },
      intent: {
        input: '帮我设置明早7点的闹钟',
        classificationFlow: ['BERT Encoder', '[CLS] → Linear', 'Softmax'],
        classificationOutput: 'SetAlarm (0.94)',
        generationPrompt: '识别用户意图：\n"帮我设置明早7点的闹钟"\n意图：',
        generationOutput: 'SetAlarm — 用户想设定明天早上7点的闹钟。',
      },
      ner: {
        input: '马云于1999年在杭州创立了阿里巴巴',
        classificationFlow: ['BERT Encoder', 'Per-token Linear', 'BIO Tags'],
        classificationOutput: '马云/B-PER 杭州/B-LOC 阿里巴巴/B-ORG',
        generationPrompt: '提取以下文本中的实体：\n"马云于1999年在杭州创立了阿里巴巴"\n实体：',
        generationOutput: '人物：马云；地点：杭州；组织：阿里巴巴；时间：1999年',
      },
    },
    en: {
      sentiment: {
        input: 'The service at this restaurant was absolutely amazing!',
        classificationFlow: ['BERT Encoder', '[CLS] → Linear', 'Softmax'],
        classificationOutput: 'Positive (0.96)',
        generationPrompt: 'Analyze the sentiment:\n"The service was amazing!"\nSentiment:',
        generationOutput: 'Positive. The user expresses high satisfaction with the service.',
      },
      intent: {
        input: 'Set an alarm for 7am tomorrow morning',
        classificationFlow: ['BERT Encoder', '[CLS] → Linear', 'Softmax'],
        classificationOutput: 'SetAlarm (0.94)',
        generationPrompt: 'Identify user intent:\n"Set alarm for 7am tomorrow"\nIntent:',
        generationOutput: 'SetAlarm — User wants to set an alarm for 7:00 AM tomorrow.',
      },
      ner: {
        input: 'Jack Ma founded Alibaba in Hangzhou in 1999',
        classificationFlow: ['BERT Encoder', 'Per-token Linear', 'BIO Tags'],
        classificationOutput: 'Jack Ma/B-PER Hangzhou/B-LOC Alibaba/B-ORG',
        generationPrompt: 'Extract entities from:\n"Jack Ma founded Alibaba in Hangzhou"\nEntities:',
        generationOutput: 'Person: Jack Ma; Location: Hangzhou; Org: Alibaba; Date: 1999',
      },
    },
  };

  const [selectedTask, setSelectedTask] = useState<TaskType>('sentiment');
  const taskData = tasks[locale][selectedTask];

  const midX = W / 2;
  const leftX = 30;
  const rightX = midX + 20;
  const colW = midX - 50;

  const flowY = 160;
  const barY = 400;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Task selector tabs */}
        {(['sentiment', 'intent', 'ner'] as TaskType[]).map((task, i) => {
          const tabW = 130;
          const tabX = W / 2 - 1.5 * tabW - 10 + i * (tabW + 10);
          const isActive = task === selectedTask;
          return (
            <g key={task} style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
              <rect x={tabX} y={42} width={tabW} height={28} rx={14}
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth={1.5} />
              <text x={tabX + tabW / 2} y={60} textAnchor="middle" fontSize="11"
                fontWeight={isActive ? 'bold' : 'normal'}
                fill={isActive ? COLORS.bg : COLORS.mid}>
                {t.tasks[task]}
              </text>
            </g>
          );
        })}

        {/* Divider */}
        <line x1={midX} y1={80} x2={midX} y2={barY - 15} stroke={COLORS.light} strokeWidth={1.5} strokeDasharray="5 5" />

        {/* Left: BERT Classification */}
        <text x={leftX + colW / 2} y={100} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>
          {t.bertSide}
        </text>

        {/* Input box */}
        <rect x={leftX} y={110} width={colW} height={30} rx={5} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
        <text x={leftX + colW / 2} y={130} textAnchor="middle" fontSize="9" fill={COLORS.dark}>
          {taskData.input.length > 30 ? taskData.input.slice(0, 30) + '...' : taskData.input}
        </text>

        {/* Classification flow */}
        <AnimatePresence mode="wait">
          <motion.g key={`cls-${selectedTask}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {taskData.classificationFlow.map((step, i) => {
              const sy = flowY + i * 45;
              return (
                <g key={`cls-step-${i}`}>
                  {i > 0 && (
                    <line x1={leftX + colW / 2} y1={sy - 15} x2={leftX + colW / 2} y2={sy}
                      stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowBlueCG)" />
                  )}
                  <rect x={leftX + 20} y={sy} width={colW - 40} height={30} rx={6}
                    fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1} />
                  <text x={leftX + colW / 2} y={sy + 19} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
                    {step}
                  </text>
                </g>
              );
            })}

            {/* Arrow to input */}
            <line x1={leftX + colW / 2} y1={142} x2={leftX + colW / 2} y2={flowY}
              stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowBlueCG)" />

            {/* Output */}
            <rect x={leftX + 10} y={flowY + taskData.classificationFlow.length * 45}
              width={colW - 20} height={30} rx={6}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
            <text x={leftX + colW / 2} y={flowY + taskData.classificationFlow.length * 45 + 19}
              textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.green}>
              {taskData.classificationOutput}
            </text>
            <line x1={leftX + colW / 2}
              y1={flowY + (taskData.classificationFlow.length - 1) * 45 + 32}
              x2={leftX + colW / 2}
              y2={flowY + taskData.classificationFlow.length * 45}
              stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#arrowGreenCG)" />
          </motion.g>
        </AnimatePresence>

        {/* Right: GPT Generation */}
        <text x={rightX + colW / 2} y={100} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.purple}>
          {t.gptSide}
        </text>

        {/* Prompt box */}
        <rect x={rightX} y={110} width={colW} height={50} rx={5} fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
        <text x={rightX + 10} y={128} fontSize="8" fill={COLORS.mid}>
          {taskData.generationPrompt.split('\n').slice(0, 2).map((line, li) => (
            <tspan key={li} x={rightX + 10} dy={li === 0 ? 0 : 13}>{line.length > 40 ? line.slice(0, 40) + '...' : line}</tspan>
          ))}
        </text>

        <AnimatePresence mode="wait">
          <motion.g key={`gen-${selectedTask}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* GPT flow */}
            <line x1={rightX + colW / 2} y1={162} x2={rightX + colW / 2} y2={flowY}
              stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowPurpleCG)" />

            <rect x={rightX + 20} y={flowY} width={colW - 40} height={30} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.purple} strokeWidth={1} />
            <text x={rightX + colW / 2} y={flowY + 19} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              GPT Decoder (autoregressive)
            </text>

            <line x1={rightX + colW / 2} y1={flowY + 32} x2={rightX + colW / 2} y2={flowY + 50}
              stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowPurpleCG)" />

            <rect x={rightX + 20} y={flowY + 50} width={colW - 40} height={30} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.purple} strokeWidth={1} />
            <text x={rightX + colW / 2} y={flowY + 69} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              Token-by-token generation
            </text>

            <line x1={rightX + colW / 2} y1={flowY + 82} x2={rightX + colW / 2} y2={flowY + 100}
              stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowPurpleCG)" />

            <rect x={rightX + 20} y={flowY + 100} width={colW - 40} height={30} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.purple} strokeWidth={1} />
            <text x={rightX + colW / 2} y={flowY + 119} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              Parse generated text
            </text>

            {/* Generation output */}
            <line x1={rightX + colW / 2} y1={flowY + 132} x2={rightX + colW / 2} y2={flowY + 145}
              stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowPurpleCG)" />
            <rect x={rightX + 10} y={flowY + 145} width={colW - 20} height={30} rx={6}
              fill="#f3e8ff" stroke={COLORS.purple} strokeWidth={2} />
            <text x={rightX + colW / 2} y={flowY + 164} textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLORS.purple}>
              {taskData.generationOutput.length > 42 ? taskData.generationOutput.slice(0, 42) + '...' : taskData.generationOutput}
            </text>
          </motion.g>
        </AnimatePresence>

        {/* Trade-off bars at bottom */}
        <text x={W / 2} y={barY - 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          Trade-offs
        </text>
        {t.traits.map((trait, i) => {
          const by = barY + 5 + i * 22;
          const maxBarW = 120;
          const bertW = (t.bertTraits[i] / 100) * maxBarW;
          const gptW = (t.gptTraits[i] / 100) * maxBarW;
          return (
            <g key={trait}>
              <text x={W / 2} y={by + 12} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{trait}</text>
              {/* BERT bar (left) */}
              <motion.rect x={W / 2 - 50 - bertW} y={by + 2} width={bertW} height={14} rx={3}
                fill={COLORS.primary} opacity={0.7}
                initial={{ width: 0 }} animate={{ width: bertW }} transition={{ duration: 0.5, delay: i * 0.1 }} />
              <text x={W / 2 - 55 - bertW} y={by + 13} textAnchor="end" fontSize="8" fill={COLORS.primary}>
                {t.bertTraits[i]}
              </text>
              {/* GPT bar (right) */}
              <motion.rect x={W / 2 + 50} y={by + 2} width={gptW} height={14} rx={3}
                fill={COLORS.purple} opacity={0.7}
                initial={{ width: 0 }} animate={{ width: gptW }} transition={{ duration: 0.5, delay: i * 0.1 }} />
              <text x={W / 2 + 55 + gptW} y={by + 13} fontSize="8" fill={COLORS.purple}>
                {t.gptTraits[i]}
              </text>
            </g>
          );
        })}

        {/* Bar legend */}
        <rect x={W / 2 - 180} y={barY + 95} width={10} height={10} rx={2} fill={COLORS.primary} opacity={0.7} />
        <text x={W / 2 - 165} y={barY + 104} fontSize="9" fill={COLORS.primary}>{t.bertLabel}</text>
        <rect x={W / 2 + 80} y={barY + 95} width={10} height={10} rx={2} fill={COLORS.purple} opacity={0.7} />
        <text x={W / 2 + 95} y={barY + 104} fontSize="9" fill={COLORS.purple}>{t.gptLabel}</text>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowBlueCG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowGreenCG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
          <marker id="arrowPurpleCG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.purple} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
