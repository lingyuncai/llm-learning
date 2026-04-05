import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface BlockRect {
  x: number; y: number; w: number; h: number;
  label: string; color: string; refCount?: number;
}

function BlockDiagram({ blocks, arrows, title, note }: {
  blocks: BlockRect[];
  arrows?: { from: [number, number]; to: [number, number]; dashed?: boolean }[];
  title: string;
  note?: string;
}) {
  return (
    <svg viewBox={`0 0 ${W} 240`} className="w-full">
      <defs>
        <marker id="cow-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={COLORS.mid} />
        </marker>
      </defs>
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
            fill={b.color} opacity={0.2} stroke={b.color} strokeWidth="2" />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle"
            fontSize="10" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
            {b.label}
          </text>
          {b.refCount !== undefined && (
            <g>
              <circle cx={b.x + b.w - 4} cy={b.y + 4} r={8}
                fill={COLORS.orange} />
              <text x={b.x + b.w - 4} y={b.y + 8} textAnchor="middle"
                fontSize="8" fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>
                {b.refCount}
              </text>
            </g>
          )}
        </g>
      ))}
      {arrows?.map((a, i) => (
        <line key={`a-${i}`} x1={a.from[0]} y1={a.from[1]} x2={a.to[0]} y2={a.to[1]}
          stroke={COLORS.mid} strokeWidth="1.5"
          strokeDasharray={a.dashed ? '4,2' : 'none'}
          markerEnd="url(#cow-arrow)" />
      ))}
      {note && (
        <text x={W / 2} y={225} textAnchor="middle" fontSize="9"
          fill={COLORS.mid} fontFamily={FONTS.sans}>{note}</text>
      )}
    </svg>
  );
}

export default function CopyOnWriteBeam() {
  const bw = 90, bh = 40;
  const seqY = 50, physY = 140;

  const steps = [
    {
      title: '初始：Beam 1 和 Beam 2 共享前缀',
      content: (
        <BlockDiagram
          title="Prompt 阶段 — 物理块共享"
          blocks={[
            { x: 100, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 100 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 200, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 200 + bw + 20, y: physY, w: bw, h: bh, label: 'Block 1', color: COLORS.primary, refCount: 2 },
          ]}
          arrows={[
            { from: [145, seqY + bh], to: [245, physY] },
            { from: [255, seqY + bh], to: [245, physY] },
            { from: [145, seqY + bh], to: [355, physY], dashed: true },
            { from: [255, seqY + bh], to: [355, physY], dashed: true },
          ]}
          note="两个 beam 指向同一组物理块，ref_count = 2"
        />
      ),
    },
    {
      title: 'Beam 分叉：生成不同 token',
      content: (
        <BlockDiagram
          title="Beam 1 写入新 token — 触发 Copy-on-Write"
          blocks={[
            { x: 60, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 60 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 100, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 220, y: physY, w: bw, h: bh, label: 'Block 1', color: COLORS.primary, refCount: 2 },
            { x: 380, y: physY, w: bw, h: bh, label: 'Block 1\'', color: COLORS.orange },
          ]}
          arrows={[
            { from: [105, seqY + bh], to: [145, physY] },
            { from: [105, seqY + bh], to: [265, physY] },
            { from: [215, seqY + bh], to: [145, physY] },
            { from: [265, physY + bh / 2], to: [380, physY + bh / 2], dashed: true },
          ]}
          note="Beam 1 要写入 Block 1 但 ref_count > 1 → 先复制到 Block 1'，再写入"
        />
      ),
    },
    {
      title: 'CoW 完成：各自独立',
      content: (
        <BlockDiagram
          title="Copy-on-Write 完成 — 独立物理块"
          blocks={[
            { x: 60, y: seqY, w: bw, h: bh, label: 'Beam 1', color: COLORS.primary },
            { x: 60 + bw + 20, y: seqY, w: bw, h: bh, label: 'Beam 2', color: COLORS.green },
            { x: 100, y: physY, w: bw, h: bh, label: 'Block 0', color: COLORS.primary, refCount: 2 },
            { x: 240, y: physY, w: bw, h: bh, label: 'Block 1a', color: COLORS.primary, refCount: 1 },
            { x: 380, y: physY, w: bw, h: bh, label: 'Block 1b', color: COLORS.green, refCount: 1 },
          ]}
          arrows={[
            { from: [105, seqY + bh], to: [145, physY] },
            { from: [105, seqY + bh], to: [285, physY] },
            { from: [215, seqY + bh], to: [145, physY] },
            { from: [215, seqY + bh], to: [425, physY] },
          ]}
          note="Block 0 仍共享（前缀相同），Block 1 各自独立（内容已分叉）"
        />
      ),
    },
    {
      title: '总结：CoW 的节省',
      content: (
        <svg viewBox={`0 0 ${W} 240`} className="w-full">
          <text x={W / 2} y={30} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>Copy-on-Write 节省分析</text>
          <rect x={60} y={50} width={220} height={140} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
          <text x={170} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>无 CoW</text>
          <text x={170} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>每个 beam 完整复制所有块</text>
          <text x={170} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>4 beams × 10 blocks = 40 块</text>
          <text x={170} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.mono}>40 块</text>

          <rect x={300} y={50} width={220} height={140} rx={6}
            fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1" />
          <text x={410} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>有 CoW</text>
          <text x={410} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>共享前缀 + 仅复制分叉块</text>
          <text x={410} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>8 共享 + 4 独立 = 12 块</text>
          <text x={410} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>12 块 (70% ↓)</text>

          <text x={W / 2} y={220} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            beam search 中大部分 token 是共享前缀 — CoW 避免了不必要的内存复制
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
