// src/components/interactive/BlockToSmMapping.tsx
// StepNavigator: logical blocks assigned to physical SMs, thread→warp packing
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface BlockToSmMappingProps {
  locale?: 'zh' | 'en';
}

const W = 580;
const SVG_H = 330;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

const BLOCK_COLORS = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#e0e7ff', '#ccfbf1'];
const BLOCK_BORDERS = [COLORS.primary, COLORS.green, COLORS.orange, '#be185d', '#4338ca', '#0d9488'];

function SmBox({ x, y, smId, blocks, t }: {
  x: number; y: number; smId: number; blocks: number[]; t: any;
}) {
  return (
    <g>
      <rect x={x} y={y} width={110} height={100} rx={5}
        fill="#f8fafc" stroke={COLORS.dark} strokeWidth={1.5} />
      <text x={x + 55} y={y + 16} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>SM {smId}</text>
      {blocks.map((b, i) => (
        <g key={b}>
          <rect x={x + 8 + i * 48} y={y + 26} width={44} height={64} rx={3}
            fill={BLOCK_COLORS[b % 6]} stroke={BLOCK_BORDERS[b % 6]} strokeWidth={1} />
          <text x={x + 30 + i * 48} y={y + 44} textAnchor="middle"
            fontSize="8" fontWeight="600" fill={BLOCK_BORDERS[b % 6]} fontFamily={FONTS.sans}>
            Block {b}
          </text>
          <text x={x + 30 + i * 48} y={y + 60} textAnchor="middle"
            fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
            128 threads
          </text>
          <text x={x + 30 + i * 48} y={y + 74} textAnchor="middle"
            fontSize="7" fill="#64748b" fontFamily={FONTS.sans}>
            4 warps
          </text>
        </g>
      ))}
      {blocks.length === 0 && (
        <text x={x + 55} y={y + 58} textAnchor="middle"
          fontSize="8" fill="#94a3b8" fontFamily={FONTS.sans}>{t.idle}</text>
      )}
    </g>
  );
}

export default function BlockToSmMapping({ locale = 'zh' }: BlockToSmMappingProps) {
  const t = {
    zh: {
      idle: '(空闲)',
      step1Title: 'Grid: 6 个 Block 待分配',
      step1LogicalView: '逻辑视图: Grid 包含 6 个 Block (每个 128 threads = 4 warps)',
      step1PhysicalView: '物理视图: 4 个 SM (每个最多容纳 2 个 Block)',
      step1Note: 'Block 到 SM 的分配由 runtime 决定，顺序不确定、不可控 — 程序不应假设分配顺序',
      step2Title: 'Block 分配到 SM',
      step2RuntimeTitle: 'Runtime 将 Block 分配到 SM (受资源限制: registers, shared memory, warps)',
      step2Example: '此例中每个 SM 分配 2 个 Block (实际数量由 register / shared memory / warp 资源共同决定)',
      step2Sufficient: '(6 Blocks / 3 SMs 足够)',
      step2ResourceTitle: 'SM 资源限制 (决定每个 SM 能容纳多少 Block)',
      step2Resource1Spec: '例: 64 warps (Hopper)',
      step2Resource1Calc: '每 Block 4 warps → 最多 16 Blocks',
      step2Resource2Spec: '例: 256KB = 65536 regs',
      step2Resource2Calc: '每 thread 用 32 regs → 每 Block 4096 regs → 最多 16 Blocks',
      step2Resource3Spec: '例: 228KB',
      step2Resource3Calc: '每 Block 用 16KB → 最多 14 Blocks',
      step2Formula: '实际 Blocks/SM = min(warp 限制, register 限制, shared memory 限制) — 最紧的瓶颈决定',
    },
    en: {
      idle: '(idle)',
      step1Title: 'Grid: 6 Blocks to allocate',
      step1LogicalView: 'Logical view: Grid contains 6 Blocks (each 128 threads = 4 warps)',
      step1PhysicalView: 'Physical view: 4 SMs (each holds up to 2 Blocks)',
      step1Note: 'Block-to-SM assignment is decided by runtime, order is non-deterministic and uncontrollable — programs should not assume assignment order',
      step2Title: 'Block assignment to SM',
      step2RuntimeTitle: 'Runtime assigns Blocks to SMs (limited by resources: registers, shared memory, warps)',
      step2Example: 'In this example each SM gets 2 Blocks (actual count determined by register / shared memory / warp resources)',
      step2Sufficient: '(6 Blocks / 3 SMs sufficient)',
      step2ResourceTitle: 'SM resource limits (determine how many Blocks each SM can hold)',
      step2Resource1Spec: 'e.g.: 64 warps (Hopper)',
      step2Resource1Calc: '4 warps per Block → max 16 Blocks',
      step2Resource2Spec: 'e.g.: 256KB = 65536 regs',
      step2Resource2Calc: '32 regs per thread → 4096 regs per Block → max 16 Blocks',
      step2Resource3Spec: 'e.g.: 228KB',
      step2Resource3Calc: '16KB per Block → max 14 Blocks',
      step2Formula: 'Actual Blocks/SM = min(warp limit, register limit, shared memory limit) — tightest bottleneck decides',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1LogicalView}
          </text>

          {/* Blocks in a row */}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = 30 + i * 90;
            return (
              <g key={i}>
                <rect x={x} y={50} width={80} height={50} rx={4}
                  fill={BLOCK_COLORS[i % 6]} stroke={BLOCK_BORDERS[i % 6]} strokeWidth={1.5} />
                <text x={x + 40} y={72} textAnchor="middle" fontSize="9" fontWeight="600"
                  fill={BLOCK_BORDERS[i % 6]} fontFamily={FONTS.sans}>Block {i}</text>
                <text x={x + 40} y={88} textAnchor="middle" fontSize="7"
                  fill="#64748b" fontFamily={FONTS.sans}>128 threads</text>
              </g>
            );
          })}

          {/* SMs empty */}
          <text x={W / 2} y={130} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1PhysicalView}
          </text>
          {Array.from({ length: 4 }).map((_, i) => (
            <SmBox key={i} x={20 + i * 140} y={145} smId={i} blocks={[]} t={t} />
          ))}

          <rect x={40} y={SVG_H - 55} width={500} height={40} rx={5}
            fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1} />
          <text x={W / 2} y={SVG_H - 30} textAnchor="middle" fontSize="9"
            fill={COLORS.orange} fontFamily={FONTS.sans}>
            {t.step1Note}
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step2RuntimeTitle}
          </text>

          {/* Arrows from top to SMs */}
          <text x={W / 2} y={45} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.step2Example}
          </text>

          <SmBox x={20} y={60} smId={0} blocks={[0, 1]} t={t} />
          <SmBox x={155} y={60} smId={1} blocks={[2, 3]} t={t} />
          <SmBox x={290} y={60} smId={2} blocks={[4, 5]} t={t} />
          <SmBox x={425} y={60} smId={3} blocks={[]} t={t} />

          <text x={480} y={120} textAnchor="middle" fontSize="8" fill="#94a3b8"
            fontFamily={FONTS.sans}>{t.step2Sufficient}</text>

          {/* Resource accounting */}
          <rect x={30} y={180} width={520} height={80} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={198} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2ResourceTitle}</text>
          {[
            ['Max warps per SM', t.step2Resource1Spec, t.step2Resource1Calc],
            ['Register file', t.step2Resource2Spec, t.step2Resource2Calc],
            ['Shared memory', t.step2Resource3Spec, t.step2Resource3Calc],
          ].map(([resource, spec, calc], i) => (
            <g key={i}>
              <text x={50} y={218 + i * 14} fontSize="7.5" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.sans}>{resource}</text>
              <text x={215} y={218 + i * 14} fontSize="7.5"
                fill="#64748b" fontFamily={FONTS.mono}>{spec}</text>
              <text x={410} y={218 + i * 14} fontSize="7.5"
                fill={COLORS.primary} fontFamily={FONTS.sans}>{calc}</text>
            </g>
          ))}

          <text x={W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="8" fill={COLORS.orange}
            fontFamily={FONTS.sans}>
            {t.step2Formula}
          </text>
        </StepSvg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
