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

export default function CopyOnWriteBeam({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Prompt 阶段 — 物理块共享',
      step1Note: '两个 beam 指向同一组物理块，ref_count = 2',
      step2Title: 'Beam 1 写入新 token — 触发 Copy-on-Write',
      step2Note: 'Beam 1 要写入 Block 1 但 ref_count > 1 → 先复制到 Block 1\'，再写入',
      step3Title: 'Copy-on-Write 完成 — 独立物理块',
      step3Note: 'Block 0 仍共享（前缀相同），Block 1 各自独立（内容已分叉）',
      step4Title: 'Copy-on-Write 节省分析',
      step4Note: 'beam search 中大部分 token 是共享前缀 — CoW 避免了不必要的内存复制',
      noCowTitle: '无 CoW',
      noCowDesc1: '每个 beam 完整复制所有块',
      noCowDesc2: '4 beams × 10 blocks = 40 块',
      noCowResult: '40 块',
      cowTitle: '有 CoW',
      cowDesc1: '共享前缀 + 仅复制分叉块',
      cowDesc2: '8 共享 + 4 独立 = 12 块',
      cowResult: '12 块 (70% ↓)',
      stepTitle1: '初始：Beam 1 和 Beam 2 共享前缀',
      stepTitle2: 'Beam 分叉：生成不同 token',
      stepTitle3: 'CoW 完成：各自独立',
      stepTitle4: '总结：CoW 的节省',
    },
    en: {
      step1Title: 'Prompt Phase — Physical Block Sharing',
      step1Note: 'Both beams point to same physical blocks, ref_count = 2',
      step2Title: 'Beam 1 Writes New Token — Triggers Copy-on-Write',
      step2Note: 'Beam 1 wants to write Block 1 but ref_count > 1 → First copy to Block 1\', then write',
      step3Title: 'Copy-on-Write Complete — Independent Physical Blocks',
      step3Note: 'Block 0 still shared (same prefix), Block 1 independently diverged (content forked)',
      step4Title: 'Copy-on-Write Savings Analysis',
      step4Note: 'Most tokens in beam search are shared prefixes — CoW avoids unnecessary memory copies',
      noCowTitle: 'No CoW',
      noCowDesc1: 'Each beam fully copies all blocks',
      noCowDesc2: '4 beams × 10 blocks = 40 blocks',
      noCowResult: '40 blocks',
      cowTitle: 'With CoW',
      cowDesc1: 'Shared prefix + copy only forked blocks',
      cowDesc2: '8 shared + 4 independent = 12 blocks',
      cowResult: '12 blocks (70% ↓)',
      stepTitle1: 'Initial: Beam 1 & 2 Share Prefix',
      stepTitle2: 'Beam Fork: Different Tokens',
      stepTitle3: 'CoW Complete: Independent',
      stepTitle4: 'Summary: CoW Savings',
    },
  }[locale];

  const bw = 90, bh = 40;
  const seqY = 50, physY = 140;

  const steps = [
    {
      title: t.stepTitle1,
      content: (
        <BlockDiagram
          title={t.step1Title}
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
          note={t.step1Note}
        />
      ),
    },
    {
      title: t.stepTitle2,
      content: (
        <BlockDiagram
          title={t.step2Title}
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
          note={t.step2Note}
        />
      ),
    },
    {
      title: t.stepTitle3,
      content: (
        <BlockDiagram
          title={t.step3Title}
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
          note={t.step3Note}
        />
      ),
    },
    {
      title: t.stepTitle4,
      content: (
        <svg viewBox={`0 0 ${W} 240`} className="w-full">
          <text x={W / 2} y={30} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step4Title}</text>
          <rect x={60} y={50} width={220} height={140} rx={6}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth="1" />
          <text x={170} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.noCowTitle}</text>
          <text x={170} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.noCowDesc1}</text>
          <text x={170} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.noCowDesc2}</text>
          <text x={170} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.mono}>{t.noCowResult}</text>

          <rect x={300} y={50} width={220} height={140} rx={6}
            fill={COLORS.valid} stroke={COLORS.green} strokeWidth="1" />
          <text x={410} y={70} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.cowTitle}</text>
          <text x={410} y={92} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.cowDesc1}</text>
          <text x={410} y={112} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.cowDesc2}</text>
          <text x={410} y={140} textAnchor="middle" fontSize="14" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.mono}>{t.cowResult}</text>

          <text x={W / 2} y={220} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step4Note}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
