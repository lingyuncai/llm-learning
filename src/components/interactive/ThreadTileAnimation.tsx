// src/components/interactive/ThreadTileAnimation.tsx
// StepNavigator: thread tiling — each thread computes TM x TN output elements
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

export default function ThreadTileAnimation({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '1x1 Thread Tile: 一个线程算一个元素',
      step1Heading: 'Naive Tiling: 每个线程计算 C 的 1 个元素',
      step1Desc: '每次内循环迭代: 从 shared memory 读 2 个值 (A 和 B)，做 1 次 FMA',
      step1CTile: 'C tile (BLOCK_SIZE x BLOCK_SIZE)',
      step1Thread: 'Thread',
      step1LowEff: '低效: 计算/访存比 = 1:2',
      step1Loop1: '内循环每次: 读 As[ty][k] + 读 Bs[k][tx] = 2 次 shared memory 读',
      step1Loop2: '计算: 1 次 FMA (fused multiply-add)',
      step1Ratio: 'Compute:Load = 1 FMA / 2 reads = 0.5 — shared memory 带宽成为瓶颈',
      step2Title: '4x4 Thread Tile: 一个线程算 16 个元素',
      step2Heading: 'Thread Tiling: 每个线程计算 TM x TN 的输出块',
      step2Desc: 'TM=4, TN=4: 每个线程负责 C 的 4x4 = 16 个输出元素',
      step2CTile: 'C tile (16x16) — 每个颜色块 = 1 个线程的工作',
      step2Block: '的 4x4 块',
      step2Reuse: '寄存器复用',
      step2A: 'A',
      step2B: 'B',
      step2C: 'C',
      step2Calc: 'A 的 4 个值 x B 的 4 个值 = 16 个 FMA',
      step2Load: '从 shared mem 加载: 4 + 4 = 8 次读',
      step2Improved: 'Compute:Load = 16 / 8 = 2.0 (4x 提升!)',
      step2Formula: 'Compute:Load = TM x TN / (TM + TN) = 4x4 / (4+4) = 2.0',
      step2Note: '增大 TM, TN → 更高的计算/访存比 (但需要更多寄存器)',
      step3Title: '完整 Thread Tile 数据流',
      step3Heading: '三级存储层次: HBM → Shared Memory → 寄存器',
      step3Desc: '每级缓存都通过 tiling 提高复用率',
      step3HBM: 'HBM (Global Memory)',
      step3HBMDetail: '完整矩阵 A(MxK), B(KxN), C(MxN)',
      step3HBMBW: '~3 TB/s (H100)',
      step3Shared: 'Shared Memory',
      step3SharedDetail: 'A tile (BSxBS) + B tile (BSxBS)',
      step3SharedBW: '~20 TB/s per SM',
      step3Reg: '寄存器 (Register File)',
      step3RegDetail: 'A fragment (TM) + B fragment (TN) + C accumulator (TMxTN)',
      step3RegBW: '~60 TB/s per SM',
      step3BlockTile: 'Block Tiling (BS x BS)',
      step3ThreadTile: 'Thread Tiling (TM x TN)',
      step3FMA: 'FMA (寄存器 → 寄存器)',
      step3OptLevel: '优化层',
      step3HBMReduce: 'HBM 访问减少',
      step3SharedReduce: 'Shared Mem 访问减少',
      step3Result1: 'Block Tile + Thread Tile',
      step3Result2: 'BLOCK_SIZE 倍',
      step3Result3: 'TM x TN / (TM + TN) 倍',
    },
    en: {
      step1Title: '1x1 Thread Tile: One thread computes one element',
      step1Heading: 'Naive Tiling: Each thread computes 1 element of C',
      step1Desc: 'Each inner loop iteration: read 2 values from shared memory (A and B), do 1 FMA',
      step1CTile: 'C tile (BLOCK_SIZE x BLOCK_SIZE)',
      step1Thread: 'Thread',
      step1LowEff: 'Inefficient: Compute/Load ratio = 1:2',
      step1Loop1: 'Each inner loop: read As[ty][k] + read Bs[k][tx] = 2 shared memory reads',
      step1Loop2: 'Compute: 1 FMA (fused multiply-add)',
      step1Ratio: 'Compute:Load = 1 FMA / 2 reads = 0.5 — shared memory bandwidth becomes bottleneck',
      step2Title: '4x4 Thread Tile: One thread computes 16 elements',
      step2Heading: 'Thread Tiling: Each thread computes a TM x TN output block',
      step2Desc: 'TM=4, TN=4: Each thread handles 4x4 = 16 output elements of C',
      step2CTile: 'C tile (16x16) — Each color block = 1 thread\'s work',
      step2Block: '\'s 4x4 block',
      step2Reuse: 'Register Reuse',
      step2A: 'A',
      step2B: 'B',
      step2C: 'C',
      step2Calc: '4 values of A x 4 values of B = 16 FMAs',
      step2Load: 'Load from shared mem: 4 + 4 = 8 reads',
      step2Improved: 'Compute:Load = 16 / 8 = 2.0 (4x improvement!)',
      step2Formula: 'Compute:Load = TM x TN / (TM + TN) = 4x4 / (4+4) = 2.0',
      step2Note: 'Increase TM, TN → higher compute/load ratio (but need more registers)',
      step3Title: 'Complete Thread Tile Data Flow',
      step3Heading: 'Three-level storage hierarchy: HBM → Shared Memory → Registers',
      step3Desc: 'Each cache level improves reuse via tiling',
      step3HBM: 'HBM (Global Memory)',
      step3HBMDetail: 'Full matrices A(MxK), B(KxN), C(MxN)',
      step3HBMBW: '~3 TB/s (H100)',
      step3Shared: 'Shared Memory',
      step3SharedDetail: 'A tile (BSxBS) + B tile (BSxBS)',
      step3SharedBW: '~20 TB/s per SM',
      step3Reg: 'Register File',
      step3RegDetail: 'A fragment (TM) + B fragment (TN) + C accumulator (TMxTN)',
      step3RegBW: '~60 TB/s per SM',
      step3BlockTile: 'Block Tiling (BS x BS)',
      step3ThreadTile: 'Thread Tiling (TM x TN)',
      step3FMA: 'FMA (register → register)',
      step3OptLevel: 'Optimization Level',
      step3HBMReduce: 'HBM Access Reduction',
      step3SharedReduce: 'Shared Mem Access Reduction',
      step3Result1: 'Block Tile + Thread Tile',
      step3Result2: 'BLOCK_SIZE x',
      step3Result3: 'TM x TN / (TM + TN) x',
    },
  }[locale];

  const steps = [
  {
    title: t.step1Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step1Heading}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.step1Desc}
        </text>

        {/* C tile with one element highlighted */}
        {(() => {
          const cell = 20;
          const BS = 8; // visual block size
          const startX = (W - BS * cell) / 2;
          const startY = 55;
          return (
            <g>
              <text x={startX + BS * cell / 2} y={startY - 8} textAnchor="middle"
                fontSize="9" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                {t.step1CTile}
              </text>
              {Array.from({ length: BS }).map((_, r) =>
                Array.from({ length: BS }).map((_, c) => {
                  const isHL = r === 2 && c === 3;
                  return (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cell} y={startY + r * cell}
                      width={cell - 1} height={cell - 1} rx={1}
                      fill={isHL ? '#fef3c7' : '#f1f5f9'}
                      stroke={isHL ? COLORS.orange : '#cbd5e1'}
                      strokeWidth={isHL ? 2 : 0.5} />
                  );
                })
              )}
              {/* Arrow to thread */}
              <line x1={startX + 3 * cell + cell / 2} y1={startY + 2 * cell + cell}
                x2={startX + 3 * cell + cell / 2} y2={startY + BS * cell + 10}
                stroke={COLORS.orange} strokeWidth={1} />
              <text x={startX + 3 * cell + cell / 2} y={startY + BS * cell + 22}
                textAnchor="middle" fontSize="7" fontWeight="600"
                fill={COLORS.orange} fontFamily={FONTS.sans}>{t.step1Thread}(2,3)</text>
            </g>
          );
        })()}

        {/* Access pattern */}
        <rect x={40} y={240} width={500} height={80} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>{t.step1LowEff}</text>
        <text x={60} y={280} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step1Loop1}
        </text>
        <text x={60} y={296} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step1Loop2}
        </text>
        <text x={60} y={312} fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
          {t.step1Ratio}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step2Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step2Heading}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.step2Desc}
        </text>

        {/* C tile with 4x4 block highlighted */}
        {(() => {
          const cell = 14;
          const BS = 16; // visual block size
          const TM = 4;
          const TN = 4;
          const startX = 40;
          const startY = 55;
          // Show a 16x16 C tile, highlight one 4x4 block
          return (
            <g>
              <text x={startX + BS * cell / 2} y={startY - 8} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
                {t.step2CTile}
              </text>
              {Array.from({ length: BS }).map((_, r) =>
                Array.from({ length: BS }).map((_, c) => {
                  const tileR = Math.floor(r / TM);
                  const tileC = Math.floor(c / TN);
                  const isHL = tileR === 1 && tileC === 2;
                  const idx = tileR * (BS / TN) + tileC;
                  const bgColors = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
                    '#e0e7ff', '#ccfbf1', '#fef9c3', '#ffe4e6',
                    '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
                    '#e0e7ff', '#ccfbf1', '#fef9c3', '#ffe4e6'];
                  return (
                    <rect key={`${r}-${c}`}
                      x={startX + c * cell} y={startY + r * cell}
                      width={cell - 0.5} height={cell - 0.5} rx={0.5}
                      fill={isHL ? '#fef3c7' : bgColors[idx]}
                      stroke={isHL ? COLORS.orange : '#e2e8f0'}
                      strokeWidth={isHL ? 1.5 : 0.3} />
                  );
                })
              )}
              {/* Highlight box */}
              <rect x={startX + 2 * TN * cell} y={startY + 1 * TM * cell}
                width={TN * cell} height={TM * cell}
                fill="none" stroke={COLORS.orange} strokeWidth={2} rx={2} />
              <text x={startX + 2 * TN * cell + TN * cell / 2}
                y={startY + BS * cell + 14}
                textAnchor="middle" fontSize="7" fontWeight="600"
                fill={COLORS.orange} fontFamily={FONTS.sans}>
                {t.step1Thread}(1,2) {t.step2Block}
              </text>
            </g>
          );
        })()}

        {/* Register reuse diagram */}
        <rect x={310} y={50} width={250} height={180} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={435} y={70} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2Reuse}</text>

        {/* A fragment in registers */}
        <rect x={320} y={80} width={20} height={56} rx={2}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={330} y={78} textAnchor="middle" fontSize="6" fill={COLORS.primary}
          fontFamily={FONTS.mono}>{t.step2A}[4]</text>

        {/* B fragment in registers */}
        <rect x={360} y={80} width={56} height={20} rx={2}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={388} y={78} textAnchor="middle" fontSize="6" fill={COLORS.green}
          fontFamily={FONTS.mono}>{t.step2B}[4]</text>

        {/* Result 4x4 in registers */}
        <rect x={360} y={105} width={56} height={56} rx={2}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={388} y={136} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.mono}>{t.step2C}[4x4]</text>

        <text x={435} y={178} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          {t.step2Calc}
        </text>
        <text x={435} y={194} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          {t.step2Load}
        </text>
        <text x={435} y={210} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.step2Improved}
        </text>

        {/* Formula */}
        <rect x={40} y={280} width={500} height={40} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={298} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.step2Formula}
        </text>
        <text x={W / 2} y={312} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          {t.step2Note}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step3Title,
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.step3Heading}
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          {t.step3Desc}
        </text>

        {/* Three levels */}
        {[
          { label: t.step3HBM, y: 55, w: 500, h: 45, color: COLORS.red,
            bg: '#fee2e2', detail: t.step3HBMDetail, bw: t.step3HBMBW },
          { label: t.step3Shared, y: 120, w: 400, h: 45, color: COLORS.orange,
            bg: '#fff7ed', detail: t.step3SharedDetail, bw: t.step3SharedBW },
          { label: t.step3Reg, y: 185, w: 300, h: 45, color: COLORS.green,
            bg: '#dcfce7', detail: t.step3RegDetail, bw: t.step3RegBW },
        ].map((level, i) => (
          <g key={i}>
            <rect x={(W - level.w) / 2} y={level.y} width={level.w} height={level.h}
              rx={5} fill={level.bg} stroke={level.color} strokeWidth={1.5} />
            <text x={W / 2} y={level.y + 16} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={level.color} fontFamily={FONTS.sans}>{level.label}</text>
            <text x={W / 2} y={level.y + 30} textAnchor="middle" fontSize="7.5"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{level.detail}</text>
            <text x={W / 2} y={level.y + 42} textAnchor="middle" fontSize="7"
              fill="#64748b" fontFamily={FONTS.mono}>{level.bw}</text>
            {i < 2 && (
              <g>
                <line x1={W / 2} y1={level.y + level.h} x2={W / 2}
                  y2={level.y + level.h + 20}
                  stroke={level.color} strokeWidth={1.5} markerEnd={`url(#ttile-arr-${i})`} />
                <defs>
                  <marker id={`ttile-arr-${i}`} markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill={level.color} />
                  </marker>
                </defs>
                <text x={W / 2 + 60} y={level.y + level.h + 14} fontSize="7"
                  fill={level.color} fontFamily={FONTS.sans}>
                  {i === 0 ? t.step3BlockTile : t.step3ThreadTile}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Compute */}
        <rect x={(W - 200) / 2} y={245} width={200} height={30} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={W / 2} y={264} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.step3FMA}
        </text>

        {/* Summary table */}
        <rect x={40} y={285} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={120} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3OptLevel}</text>
        <text x={280} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3HBMReduce}</text>
        <text x={440} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3SharedReduce}</text>
        <text x={120} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.dark} fontFamily={FONTS.mono}>{t.step3Result1}</text>
        <text x={280} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>{t.step3Result2}</text>
        <text x={440} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>{t.step3Result3}</text>
      </StepSvg>
    ),
  },
];

  return <StepNavigator steps={steps} />;
}
