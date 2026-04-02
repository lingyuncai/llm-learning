// src/components/interactive/GPUMemoryHierarchy.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

interface ArrowStep {
  label: string;
  from: 'hbm' | 'sram';
  to: 'hbm' | 'sram';
  data: string;
}

const standardSteps: ArrowStep[] = [
  { label: 'Step 1', from: 'hbm', to: 'sram', data: 'Read Q, K' },
  { label: 'Step 1', from: 'sram', to: 'hbm', data: 'Write S = QKᵀ' },
  { label: 'Step 2', from: 'hbm', to: 'sram', data: 'Read S' },
  { label: 'Step 2', from: 'sram', to: 'hbm', data: 'Write P = softmax(S)' },
  { label: 'Step 3', from: 'hbm', to: 'sram', data: 'Read P, V' },
  { label: 'Step 3', from: 'sram', to: 'hbm', data: 'Write O = PV' },
];

const flashSteps: ArrowStep[] = [
  { label: 'Load', from: 'hbm', to: 'sram', data: 'Read Q, K, V blocks' },
  { label: 'Compute', from: 'sram', to: 'sram', data: 'QKᵀ → scale → mask → softmax → ×V (all in SRAM)' },
  { label: 'Write', from: 'sram', to: 'hbm', data: 'Write final O only' },
];

function MemoryBlock({ label, size, bandwidth, y, color }: {
  label: string; size: string; bandwidth: string; y: number; color: string;
}) {
  const width = label === 'HBM' ? 200 : 100;
  const x = label === 'HBM' ? 50 : 100;
  return (
    <g>
      <rect x={x} y={y} width={width} height={50} rx={6}
        fill={color} stroke={COLORS.dark} strokeWidth={1.5} opacity={0.15} />
      <rect x={x} y={y} width={width} height={50} rx={6}
        fill="none" stroke={color} strokeWidth={2} />
      <text x={x + width / 2} y={y + 20} textAnchor="middle"
        fontSize={14} fontWeight={700} fill={COLORS.dark}>{label}</text>
      <text x={x + width / 2} y={y + 38} textAnchor="middle"
        fontSize={10} fill={COLORS.mid}>{size} · {bandwidth}</text>
    </g>
  );
}

function DataFlowPanel({ title, steps, color }: {
  title: string; steps: ArrowStep[]; color: string;
}) {
  const [activeStep, setActiveStep] = useState(-1);
  const ioCount = steps.filter(s => s.from !== s.to).length;

  return (
    <div className="flex-1 min-w-[260px]">
      <h4 className="text-sm font-semibold mb-2 text-center" style={{ color }}>
        {title}
        <span className="ml-2 text-xs font-normal" style={{ color: COLORS.mid }}>
          ({ioCount} HBM transfers)
        </span>
      </h4>
      <div className="space-y-1">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer"
            style={{
              backgroundColor: activeStep === i ? `${color}15` : 'transparent',
              borderLeft: `3px solid ${activeStep === i ? color : 'transparent'}`,
            }}
            onMouseEnter={() => setActiveStep(i)}
            onMouseLeave={() => setActiveStep(-1)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="font-mono text-[10px] w-12 shrink-0" style={{ color: COLORS.mid }}>
              {step.label}
            </span>
            <span className="shrink-0">
              {step.from === step.to ? (
                <span style={{ color: COLORS.green }}>⟳ SRAM</span>
              ) : step.from === 'hbm' ? (
                <span style={{ color: COLORS.primary }}>HBM → SRAM</span>
              ) : (
                <span style={{ color: COLORS.red }}>SRAM → HBM</span>
              )}
            </span>
            <span className="text-gray-600 truncate">{step.data}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function GPUMemoryHierarchy() {
  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-4" style={{ color: COLORS.dark }}>
        GPU 内存层次与数据搬运对比
      </h3>

      {/* Memory hierarchy diagram */}
      <svg viewBox="0 0 300 140" className="w-full max-w-[400px] mx-auto mb-4">
        <MemoryBlock label="SRAM" size="~20MB" bandwidth="19 TB/s" y={10} color={COLORS.green} />
        <MemoryBlock label="HBM" size="80GB" bandwidth="2 TB/s" y={80} color={COLORS.primary} />
        {/* Bandwidth pipe */}
        <line x1={150} y1={60} x2={150} y2={80} stroke={COLORS.mid} strokeWidth={8} opacity={0.3} />
        <text x={170} y={74} fontSize={9} fill={COLORS.mid}>bandwidth bottleneck</text>
      </svg>

      {/* Side-by-side comparison */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DataFlowPanel
          title="Standard Attention"
          steps={standardSteps}
          color={COLORS.red}
        />
        <div className="hidden sm:block w-px bg-gray-200" />
        <DataFlowPanel
          title="Flash Attention"
          steps={flashSteps}
          color={COLORS.green}
        />
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: COLORS.mid }}>
        标准 Attention 需要 6 次 HBM 传输（3 读 + 3 写），Flash Attention 只需 2 次（1 读 + 1 写）
      </p>
    </div>
  );
}
