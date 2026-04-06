// src/components/interactive/CommandModelDiagram.tsx
// Static SVG: Command Queue (immediate) vs Command List (record-submit)
import { COLORS, FONTS } from './shared/colors';

interface CommandModelDiagramProps {
  locale?: 'zh' | 'en';
}

const W = 540;
const H = 240;
const COL_L = 140;
const COL_R = 400;

function SmallBox({ x, y, w, label, color, bg }: {
  x: number; y: number; w: number; label: string; color: string; bg: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} rx={4}
        fill={bg} stroke={color} strokeWidth={1} />
      <text x={x + w / 2} y={y + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fill={color} fontFamily={FONTS.mono}>
        {label}
      </text>
    </g>
  );
}

export default function CommandModelDiagram({ locale = 'zh' }: CommandModelDiagramProps) {
  const t = {
    zh: {
      queueTitle: 'Command Queue（即时提交）',
      queueSubtitle: 'CUDA / OpenCL 风格',
      queueNote1: '→ 立即入队执行',
      queueNote2: '每次 API 调用 = 1 条命令入队',
      queueNote3: '不可重放 — 再跑一遍需要重新调用',
      listTitle: 'Command List（录制-提交）',
      listSubtitle: 'Vulkan / Level Zero / Metal 风格',
      listPhase1: '阶段 1：录制（GPU 不执行）',
      listPhase2: '阶段 2：提交（GPU 开始执行）',
      listNote1: '参数录制时绑定 · 可重复提交同一个 list',
      listNote2: '↻ queue.execute(cmdList) — 重放，无需重新录制',
      timeline: '时间',
    },
    en: {
      queueTitle: 'Command Queue (Immediate Submit)',
      queueSubtitle: 'CUDA / OpenCL style',
      queueNote1: '→ Enqueue immediately',
      queueNote2: 'Each API call = 1 command enqueued',
      queueNote3: 'Non-replayable — need to re-call for another run',
      listTitle: 'Command List (Record-Submit)',
      listSubtitle: 'Vulkan / Level Zero / Metal style',
      listPhase1: 'Phase 1: Record (GPU not executing)',
      listPhase2: 'Phase 2: Submit (GPU starts execution)',
      listNote1: 'Parameters bound at record time · Can submit same list repeatedly',
      listNote2: '↻ queue.execute(cmdList) — replay without re-recording',
      timeline: 'Time',
    },
  }[locale];

  const queueCmds = [
    { label: 'clEnqueueWriteBuffer(A)', color: COLORS.primary, bg: '#dbeafe' },
    { label: 'clEnqueueNDRangeKernel()', color: COLORS.purple, bg: '#ede9fe' },
    { label: 'clEnqueueReadBuffer(C)', color: COLORS.green, bg: '#dcfce7' },
  ];

  const listCmds = [
    { label: 'cmd.appendCopy(A)', color: '#64748b', bg: '#f1f5f9' },
    { label: 'cmd.appendKernel()', color: '#64748b', bg: '#f1f5f9' },
    { label: 'cmd.appendCopy(C)', color: '#64748b', bg: '#f1f5f9' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label="Command Queue vs Command List comparison">
      <defs>
        <marker id="cmdArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="#94a3b8" />
        </marker>
        <marker id="cmdArrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.green} />
        </marker>
      </defs>

      {/* --- Left: Command Queue --- */}
      <text x={COL_L} y={16} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>
        {t.queueTitle}
      </text>
      <text x={COL_L} y={30} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        {t.queueSubtitle}
      </text>

      {/* Queue commands — each with immediate arrow to GPU */}
      {queueCmds.map((cmd, i) => {
        const y = 45 + i * 38;
        return (
          <g key={i}>
            <SmallBox x={COL_L - 95} y={y} w={190} label={cmd.label} color={cmd.color} bg={cmd.bg} />
            <text x={COL_L + 108} y={y + 13} fontSize="8" fill="#94a3b8"
              fontFamily={FONTS.sans} dominantBaseline="middle">
              {t.queueNote1}
            </text>
          </g>
        );
      })}

      {/* Timeline arrow */}
      <line x1={COL_L - 108} y1={42} x2={COL_L - 108} y2={155}
        stroke="#cbd5e1" strokeWidth={1} markerEnd="url(#cmdArrow)" />
      <text x={COL_L - 115} y={100} textAnchor="middle" fontSize="7" fill="#94a3b8"
        fontFamily={FONTS.sans} transform={`rotate(-90, ${COL_L - 115}, 100)`}>
        {t.timeline}
      </text>

      {/* Queue summary */}
      <text x={COL_L} y={175} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        {t.queueNote2}
      </text>
      <text x={COL_L} y={188} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        {t.queueNote3}
      </text>

      {/* --- Divider --- */}
      <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10}
        stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

      {/* --- Right: Command List --- */}
      <text x={COL_R} y={16} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>
        {t.listTitle}
      </text>
      <text x={COL_R} y={30} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>
        {t.listSubtitle}
      </text>

      {/* Phase 1: Record */}
      <rect x={COL_R - 100} y={40} width={200} height={90} rx={6}
        fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 2" />
      <text x={COL_R - 90} y={53} fontSize="8" fontWeight="600" fill={COLORS.orange}
        fontFamily={FONTS.sans}>
        {t.listPhase1}
      </text>

      {listCmds.map((cmd, i) => {
        const y = 58 + i * 22;
        return <SmallBox key={i} x={COL_R - 85} y={y} w={170} label={cmd.label}
          color={cmd.color} bg={cmd.bg} />;
      })}

      {/* Phase 2: Submit */}
      <rect x={COL_R - 100} y={138} width={200} height={55} rx={6}
        fill="none" stroke={COLORS.green} strokeWidth={1.5} />
      <text x={COL_R - 90} y={152} fontSize="8" fontWeight="600" fill={COLORS.green}
        fontFamily={FONTS.sans}>
        {t.listPhase2}
      </text>

      <SmallBox x={COL_R - 85} y={158} w={170}
        label="queue.execute(cmdList)" color={COLORS.green} bg="#dcfce7" />

      {/* Replay note */}
      <text x={COL_R} y={205} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
        {t.listNote1}
      </text>
      <text x={COL_R} y={218} textAnchor="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.sans}>
        {t.listNote2}
      </text>
    </svg>
  );
}
