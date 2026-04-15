// src/components/interactive/LlamaCppExecutionPipelineOverview.tsx
// Static panorama of llama.cpp end-to-end execution pipeline (Ch.15 overview)
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface LlamaCppExecutionPipelineOverviewProps {
  locale?: 'zh' | 'en';
}

type PhaseId = 'startup' | 'request' | 'prefill-decode' | 'sampling';

interface StageItem {
  label: string;
  detail: string;
}

interface PhaseData {
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  stages: StageItem[];
  summary: string;
}

/* ─── i18n data ─── */

const PHASES: Record<'zh' | 'en', Record<PhaseId, PhaseData>> = {
  zh: {
    startup: {
      title: '启动阶段（一次性）',
      color: COLORS.primary,
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      icon: '🔵',
      stages: [
        { label: 'GGUF 文件', detail: '#1：解析 tensor 元数据和量化权重' },
        { label: '模型加载', detail: '#2：no_alloc + mmap/read 两条路径' },
        { label: 'Backend 初始化', detail: '#2：GPU/CPU 设备识别 + 层分配' },
        { label: 'Context 初始化 + Warmup', detail: '#3：FA/GDN 探测 + 空推理预热' },
      ],
      summary: '一次性初始化：从磁盘加载模型权重到计算设备，探测硬件能力并预热 GPU kernel。',
    },
    request: {
      title: '请求处理',
      color: COLORS.green,
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      icon: '🟢',
      stages: [
        { label: '用户输入', detail: '接收用户的文本消息' },
        { label: 'Chat Template', detail: '#3：Jinja2 渲染对话模板' },
        { label: 'Tokenization', detail: '#3：文本 → token IDs' },
      ],
      summary: '将用户输入转换为模型可理解的 token 序列，通过 Chat Template 规范化对话格式。',
    },
    'prefill-decode': {
      title: 'Prefill/Decode 循环',
      color: '#ca8a04',
      bgColor: '#fefce8',
      borderColor: '#fef08a',
      icon: '🟡',
      stages: [
        { label: 'Batch 构建', detail: '#4：组织 token 为计算单元' },
        { label: '切分为 Ubatch', detail: '#4：两级批次切分算法' },
        { label: 'Build Graph', detail: '#5：125 种架构分发' },
        { label: 'Backend Scheduling', detail: '#6：五遍扫描 + 图切分' },
        { label: 'Op Fusion', detail: '#6：per-backend 优化' },
        { label: 'Tensor 分配', detail: '#6：引用计数 + 就地复用' },
        { label: '执行 Splits', detail: '#7：跨 backend 拷贝 + compute' },
        { label: '写入 KV Cache', detail: '#7：缓存 Key/Value 供后续 token 复用' },
      ],
      summary: 'Prefill 处理整个 prompt（计算密集），Decode 逐 token 生成（访存密集）。每个 Ubatch 经历完整的图构建→调度→优化→分配→执行流水线。',
    },
    sampling: {
      title: '采样与输出',
      color: COLORS.red,
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      icon: '🔴',
      stages: [
        { label: '输出 Logits', detail: '模型输出词表上的概率分布' },
        { label: '采样链', detail: '#7：penalties → top-k → top-p → temp → dist' },
        { label: 'Grammar 约束', detail: '#7：检查是否符合语法约束，不符则重采样' },
        { label: 'Token → 文本输出', detail: '解码 token 并输出到终端' },
        { label: 'Speculative Decoding（可选）', detail: '#7：Draft 小模型加速 → Verify 大模型验证' },
        { label: 'Context Shift', detail: '#7：KV cache 满时丢弃中间 token' },
      ],
      summary: '从概率分布中选出下一个 token，支持 Grammar 约束和 Speculative Decoding 加速。如 KV cache 满则触发 Context Shift。',
    },
  },
  en: {
    startup: {
      title: 'Startup (One-time)',
      color: COLORS.primary,
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      icon: '🔵',
      stages: [
        { label: 'GGUF File', detail: '#1: Parse tensor metadata and quantized weights' },
        { label: 'Model Loading', detail: '#2: no_alloc + mmap/read two paths' },
        { label: 'Backend Init', detail: '#2: GPU/CPU device detection + layer assignment' },
        { label: 'Context Init + Warmup', detail: '#3: FA/GDN probing + empty inference warmup' },
      ],
      summary: 'One-time initialization: load model weights to compute devices, probe hardware capabilities and warm up GPU kernels.',
    },
    request: {
      title: 'Request Processing',
      color: COLORS.green,
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      icon: '🟢',
      stages: [
        { label: 'User Input', detail: 'Receive user text message' },
        { label: 'Chat Template', detail: '#3: Jinja2 conversation template rendering' },
        { label: 'Tokenization', detail: '#3: Text to token IDs' },
      ],
      summary: 'Convert user input to token sequences the model understands, using Chat Template to normalize dialogue format.',
    },
    'prefill-decode': {
      title: 'Prefill/Decode Loop',
      color: '#ca8a04',
      bgColor: '#fefce8',
      borderColor: '#fef08a',
      icon: '🟡',
      stages: [
        { label: 'Batch Construction', detail: '#4: Organize tokens into compute units' },
        { label: 'Split into Ubatch', detail: '#4: Two-level batch splitting algorithm' },
        { label: 'Build Graph', detail: '#5: Dispatch across 125 architectures' },
        { label: 'Backend Scheduling', detail: '#6: Five-pass scanning + graph splitting' },
        { label: 'Op Fusion', detail: '#6: Per-backend optimization' },
        { label: 'Tensor Allocation', detail: '#6: Refcount + in-place reuse' },
        { label: 'Execute Splits', detail: '#7: Cross-backend copy + compute' },
        { label: 'Write KV Cache', detail: '#7: Cache Key/Value for subsequent tokens' },
      ],
      summary: 'Prefill processes the entire prompt (compute-bound), Decode generates token-by-token (memory-bound). Each Ubatch goes through the full build→schedule→optimize→allocate→execute pipeline.',
    },
    sampling: {
      title: 'Sampling & Output',
      color: COLORS.red,
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      icon: '🔴',
      stages: [
        { label: 'Output Logits', detail: 'Model outputs probability distribution over vocabulary' },
        { label: 'Sampling Chain', detail: '#7: penalties → top-k → top-p → temp → dist' },
        { label: 'Grammar Constraint', detail: '#7: Check grammar constraints, resample if rejected' },
        { label: 'Token → Text Output', detail: 'Decode token and output to terminal' },
        { label: 'Speculative Decoding (optional)', detail: '#7: Draft model accelerates → Verify with main model' },
        { label: 'Context Shift', detail: '#7: Discard middle tokens when KV cache full' },
      ],
      summary: 'Select next token from probability distribution, with Grammar constraints and optional Speculative Decoding acceleration. Triggers Context Shift if KV cache is full.',
    },
  },
};

const PHASE_ORDER: PhaseId[] = ['startup', 'request', 'prefill-decode', 'sampling'];

/* ─── Arrow component ─── */

function PhaseArrow({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
        <path d="M10 2 L10 18 M4 14 L10 20 L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─── Phase Card ─── */

function PhaseCard({
  phase,
  isSelected,
  onClick,
}: {
  phase: PhaseData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="rounded-lg border-2 cursor-pointer transition-shadow"
      style={{
        backgroundColor: phase.bgColor,
        borderColor: isSelected ? phase.color : phase.borderColor,
        boxShadow: isSelected ? `0 0 0 2px ${phase.color}30` : 'none',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2 rounded-t-md"
        style={{ borderBottom: `1px solid ${phase.borderColor}` }}
      >
        <span className="text-base">{phase.icon}</span>
        <span className="font-semibold text-sm" style={{ color: phase.color }}>
          {phase.title}
        </span>
      </div>

      {/* Stages */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5">
        {phase.stages.map((stage, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${phase.color}15`,
              color: phase.color,
              border: `1px solid ${phase.color}30`,
            }}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Detail Panel ─── */

function DetailPanel({ phase }: { phase: PhaseData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border p-4"
      style={{
        backgroundColor: phase.bgColor,
        borderColor: phase.borderColor,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{phase.icon}</span>
        <span className="font-semibold text-sm" style={{ color: phase.color }}>
          {phase.title}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {phase.stages.map((stage, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: phase.color }}
            />
            <div>
              <span className="text-sm font-medium text-gray-800">{stage.label}</span>
              <span className="text-xs text-gray-500 ml-1.5">{stage.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 leading-relaxed border-t pt-2" style={{ borderColor: phase.borderColor }}>
        {phase.summary}
      </p>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function LlamaCppExecutionPipelineOverview({ locale = 'zh' }: LlamaCppExecutionPipelineOverviewProps) {
  const [selected, setSelected] = useState<PhaseId | null>(null);
  const phases = PHASES[locale];

  const t = {
    zh: {
      hint: '点击任意阶段查看详情',
      loopLabel: '逐 token 循环',
      loopDesc: 'Decode 阶段输出的每个 token 重新进入 Prefill/Decode 循环，直到生成 EOS 或达到上下文长度限制。',
    },
    en: {
      hint: 'Click any phase to see details',
      loopLabel: 'Per-token loop',
      loopDesc: 'Each token output by the Decode phase re-enters the Prefill/Decode loop until EOS or context length limit.',
    },
  }[locale];

  const handleClick = (id: PhaseId) => {
    setSelected(prev => (prev === id ? null : id));
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <p className="text-xs text-gray-400 text-center mb-4" style={{ fontFamily: FONTS.sans }}>
        {t.hint}
      </p>

      {/* Pipeline overview */}
      <div className="max-w-lg mx-auto">
        {PHASE_ORDER.map((id, idx) => (
          <div key={id}>
            <PhaseCard
              phase={phases[id]}
              isSelected={selected === id}
              onClick={() => handleClick(id)}
            />
            {idx < PHASE_ORDER.length - 1 && (
              <PhaseArrow color={COLORS.mid} />
            )}
          </div>
        ))}

        {/* Loop-back annotation */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <svg width="160" height="32" viewBox="0 0 160 32" fill="none" className="flex-shrink-0">
            <path
              d="M140 4 C150 4, 156 12, 156 16 C156 20, 150 28, 140 28 L20 28 C10 28, 4 20, 4 16 L4 12"
              stroke={COLORS.mid}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              fill="none"
            />
            <path d="M1 16 L4 10 L7 16" stroke={COLORS.mid} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-gray-500" style={{ fontFamily: FONTS.sans }}>
            {t.loopLabel}
          </span>
        </div>
      </div>

      {/* Detail panel */}
      <div className="mt-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {selected && (
            <DetailPanel key={selected} phase={phases[selected]} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
