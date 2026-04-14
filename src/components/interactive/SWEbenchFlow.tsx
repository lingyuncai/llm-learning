// src/components/interactive/SWEbenchFlow.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface FlowStep {
  title: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  detail: { zh: string; en: string };
  icon: string;
  color: string;
}

const STEPS: FlowStep[] = [
  { title: { zh: '1. Issue 描述输入', en: '1. Issue Description Input' },
    subtitle: { zh: '来自真实 GitHub issue', en: 'From real GitHub issue' },
    detail: { zh: 'Agent 接收 issue 标题和描述。不提供代码位置提示——需要自主定位问题。输入还包含完整代码仓库的访问权限。', en: 'Agent receives issue title and description. No code location hints — must locate the problem autonomously. Also has access to the full code repository.' },
    icon: '📋', color: COLORS.primary },
  { title: { zh: '2. 搜索与定位', en: '2. Search & Locate' },
    subtitle: { zh: 'Agent 自主探索代码库', en: 'Agent explores codebase autonomously' },
    detail: { zh: 'Agent 使用工具（文件搜索、grep、目录浏览等）在仓库中定位相关文件。不同 agent 框架使用不同搜索策略，这也是分数差异的重要来源。', en: 'Agent uses tools to locate relevant files. Different agent harnesses use different search strategies.' },
    icon: '🔍', color: COLORS.orange },
  { title: { zh: '3. 代码上下文理解', en: '3. Code Context Understanding' },
    subtitle: { zh: '理解相关代码的逻辑', en: 'Understand the logic of relevant code' },
    detail: { zh: '读取相关文件，理解函数调用关系、类继承、数据流。上下文窗口大小在这一步影响显著。', en: 'Read relevant files, understand function calls, class inheritance, data flow.' },
    icon: '🧠', color: COLORS.purple },
  { title: { zh: '4. Patch 生成', en: '4. Patch Generation' },
    subtitle: { zh: '生成 git diff 格式的修复', en: 'Generate fix in git diff format' },
    detail: { zh: '生成一个或多个文件的修改（git diff 格式）。需要精确到行号和缩进。', en: 'Generate modifications to one or more files (git diff format).' },
    icon: '🔧', color: COLORS.green },
  { title: { zh: '5. 测试验证', en: '5. Test Validation' },
    subtitle: { zh: '运行项目原有测试套件', en: 'Run original project test suite' },
    detail: { zh: 'Patch 应用后运行相关测试。所有测试通过 = resolved。评分: resolved rate。', en: 'After applying patch, run relevant tests. All tests pass = resolved.' },
    icon: '✅', color: COLORS.green },
];

const CARD_W = 460;
const CARD_H_COLLAPSED = 52;
const CARD_H_EXPANDED = 120;
const STEP_GAP = 12;
const TIMELINE_X = 30;
const CARD_X = 60;
const ICON_R = 16;

export default function SWEbenchFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        if (next >= STEPS.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1800);
  };

  const handleStepClick = (idx: number) => {
    // Stop auto-play if user manually clicks
    if (playing) {
      setPlaying(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    setActiveStep(activeStep === idx ? -1 : idx);
  };

  // Calculate dynamic positions
  const stepPositions: number[] = [];
  let currentY = 60;
  for (let i = 0; i < STEPS.length; i++) {
    stepPositions.push(currentY);
    const h = activeStep === i ? CARD_H_EXPANDED : CARD_H_COLLAPSED;
    currentY += h + STEP_GAP;
  }
  const totalH = currentY + 50;

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>
          {t('SWE-bench 评估流程', 'SWE-bench Evaluation Flow')}
        </span>
      </div>

      {/* Auto-play button */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <button
          onClick={togglePlay}
          style={{
            padding: '6px 20px',
            borderRadius: 16,
            border: 'none',
            background: playing ? COLORS.mid : COLORS.primary,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: FONTS.sans,
          }}>
          {playing
            ? t('暂停', 'Pause')
            : activeStep >= STEPS.length - 1
              ? t('重播', 'Replay')
              : t('播放动画', 'Play Animation')}
        </button>
      </div>

      <svg viewBox={`0 0 540 ${totalH}`} style={{ width: '100%', height: 'auto' }}>
        {/* Vertical timeline line */}
        <line
          x1={TIMELINE_X} x2={TIMELINE_X}
          y1={stepPositions[0] + ICON_R}
          y2={stepPositions[STEPS.length - 1] + ICON_R}
          stroke={COLORS.light} strokeWidth={2}
        />

        {/* Progress line */}
        {activeStep >= 0 && (
          <motion.line
            x1={TIMELINE_X} x2={TIMELINE_X}
            y1={stepPositions[0] + ICON_R}
            y2={stepPositions[Math.min(activeStep, STEPS.length - 1)] + ICON_R}
            stroke={COLORS.primary}
            strokeWidth={3}
            initial={{ y2: stepPositions[0] + ICON_R }}
            animate={{ y2: stepPositions[Math.min(activeStep, STEPS.length - 1)] + ICON_R }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Steps */}
        {STEPS.map((step, i) => {
          const y = stepPositions[i];
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          const isExpanded = i === activeStep;
          const cardH = isExpanded ? CARD_H_EXPANDED : CARD_H_COLLAPSED;

          return (
            <g key={i} onClick={() => handleStepClick(i)} style={{ cursor: 'pointer' }}>
              {/* Timeline circle */}
              <motion.circle
                cx={TIMELINE_X}
                cy={y + ICON_R + 10}
                r={ICON_R}
                fill={isActive ? step.color : '#fff'}
                stroke={isActive ? step.color : COLORS.light}
                strokeWidth={2}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: `${TIMELINE_X}px ${y + ICON_R + 10}px` }}
              />
              {/* Icon in circle */}
              <text
                x={TIMELINE_X} y={y + ICON_R + 15}
                textAnchor="middle" fontSize={14}
                style={{ pointerEvents: 'none' }}>
                {step.icon}
              </text>

              {/* Card */}
              <motion.rect
                x={CARD_X}
                y={y}
                width={CARD_W}
                height={cardH}
                rx={8}
                fill={isCurrent ? step.color + '08' : '#fff'}
                stroke={isActive ? step.color : COLORS.light}
                strokeWidth={isCurrent ? 2 : 1}
                animate={{
                  height: cardH,
                }}
                transition={{ duration: 0.25 }}
              />

              {/* Title */}
              <text
                x={CARD_X + 14} y={y + 22}
                fontSize={13} fontWeight={700}
                fill={isActive ? COLORS.dark : COLORS.mid}
                fontFamily={FONTS.sans}
                style={{ pointerEvents: 'none' }}>
                {step.title[locale]}
              </text>

              {/* Subtitle */}
              <text
                x={CARD_X + 14} y={y + 40}
                fontSize={10}
                fill={isActive ? step.color : COLORS.mid}
                fontFamily={FONTS.sans}
                fontWeight={500}
                style={{ pointerEvents: 'none' }}>
                {step.subtitle[locale]}
              </text>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.foreignObject
                    x={CARD_X + 12} y={y + 50}
                    width={CARD_W - 24} height={65}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div style={{
                      fontSize: 11,
                      lineHeight: 1.5,
                      color: COLORS.dark,
                      fontFamily: FONTS.sans,
                    }}>
                      {step.detail[locale]}
                    </div>
                  </motion.foreignObject>
                )}
              </AnimatePresence>

              {/* Expand indicator */}
              <text
                x={CARD_X + CARD_W - 20} y={y + 28}
                fontSize={12} fill={COLORS.mid}
                fontFamily={FONTS.sans}
                style={{ pointerEvents: 'none' }}>
                {isExpanded ? '▲' : '▼'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
