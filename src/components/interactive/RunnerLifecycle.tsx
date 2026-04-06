import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function StateBox({ x, y, label, active, color }: {
  x: number; y: number; label: string; active: boolean; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={80} height={30} rx={15}
        fill={active ? color : '#f1f5f9'}
        stroke={active ? color : '#d1d5db'}
        strokeWidth={active ? 2 : 1} opacity={active ? 1 : 0.4} />
      <text x={x + 40} y={y + 19} textAnchor="middle" fontSize="7.5"
        fontWeight={active ? '700' : '400'}
        fill={active ? 'white' : '#94a3b8'} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

function ResourceBar({ x, y, label, value, max, color }: {
  x: number; y: number; label: string; value: number; max: number; color: string;
}) {
  const barW = 120;
  const fillW = (value / max) * barW;
  return (
    <g>
      <text x={x} y={y + 10} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {label}
      </text>
      <rect x={x + 55} y={y} width={barW} height={14} rx={3}
        fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
      <rect x={x + 55} y={y} width={fillW} height={14} rx={3}
        fill={color} opacity={0.5} />
      <text x={x + 55 + barW + 5} y={y + 11} fontSize="6.5" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{value} / {max}</text>
    </g>
  );
}

const STATES = ['Idle', 'Loading', 'Ready', 'Busy', 'Unloading'];

function makeStep(activeIdx: number, desc: string, resources: { vram: number; ram: number; cpu: number }, labels: { vram: string; ram: string; cpu: string }) {
  return {
    title: `${STATES[activeIdx]}`,
    content: (
      <StepSvg h={160}>
        {/* State machine */}
        {STATES.map((s, i) => (
          <g key={s}>
            <StateBox x={20 + i * 108} y={10} label={s} active={i === activeIdx}
              color={i === activeIdx ? COLORS.primary : '#94a3b8'} />
            {i < STATES.length - 1 && (
              <text x={100 + i * 108 + 14} y={28} fontSize="10" fill="#94a3b8">→</text>
            )}
          </g>
        ))}

        {/* Description */}
        <text x={W / 2} y={65} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{desc}</text>

        {/* Resource bars */}
        <ResourceBar x={80} y={85} label={labels.vram} value={resources.vram} max={8} color={COLORS.green} />
        <ResourceBar x={80} y={105} label={labels.ram} value={resources.ram} max={16} color={COLORS.primary} />
        <ResourceBar x={80} y={125} label={labels.cpu} value={resources.cpu} max={100} color={COLORS.orange} />

        <text x={350} y={95} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {labels.vram}: {resources.vram} GB
        </text>
        <text x={350} y={112} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {labels.ram}: {resources.ram} GB
        </text>
        <text x={350} y={129} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {labels.cpu}: {resources.cpu}%
        </text>
      </StepSvg>
    ),
  };
}

export default function RunnerLifecycle({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      vram: 'VRAM',
      ram: 'RAM',
      cpu: 'CPU',
      desc0: '无 runner 进程, 等待首次请求到来',
      desc1: 'Scheduler 触发加载: 启动 runner 子进程, mmap GGUF, 分配显存',
      desc2: '健康检查通过, KV Cache 已分配, 等待推理请求',
      desc3: '处理推理请求中: GPU 满载计算, KV Cache 活跃写入',
      desc4: '空闲超时 (OLLAMA_KEEP_ALIVE=5m): 释放显存, 终止子进程',
    },
    en: {
      vram: 'VRAM',
      ram: 'RAM',
      cpu: 'CPU',
      desc0: 'No runner process, waiting for first request',
      desc1: 'Scheduler triggers load: start runner subprocess, mmap GGUF, allocate VRAM',
      desc2: 'Health check passed, KV Cache allocated, waiting for inference requests',
      desc3: 'Processing inference: GPU fully loaded, KV Cache actively writing',
      desc4: 'Idle timeout (OLLAMA_KEEP_ALIVE=5m): release VRAM, terminate subprocess',
    },
  }[locale];

  const labels = { vram: t.vram, ram: t.ram, cpu: t.cpu };

  const steps = [
    makeStep(0, t.desc0, { vram: 0, ram: 0, cpu: 0 }, labels),
    makeStep(1, t.desc1, { vram: 3, ram: 2, cpu: 40 }, labels),
    makeStep(2, t.desc2, { vram: 5, ram: 2, cpu: 5 }, labels),
    makeStep(3, t.desc3, { vram: 5, ram: 2, cpu: 80 }, labels),
    makeStep(4, t.desc4, { vram: 0, ram: 0, cpu: 5 }, labels),
  ];

  return <StepNavigator steps={steps} />;
}
