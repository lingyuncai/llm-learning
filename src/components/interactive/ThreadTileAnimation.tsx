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

const steps = [
  {
    title: '1x1 Thread Tile: 一个线程算一个元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive Tiling: 每个线程计算 C 的 1 个元素
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每次内循环迭代: 从 shared memory 读 2 个值 (A 和 B)，做 1 次 FMA
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
                C tile (BLOCK_SIZE x BLOCK_SIZE)
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
                fill={COLORS.orange} fontFamily={FONTS.sans}>Thread(2,3)</text>
            </g>
          );
        })()}

        {/* Access pattern */}
        <rect x={40} y={240} width={500} height={80} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={260} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>低效: 计算/访存比 = 1:2</text>
        <text x={60} y={280} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          内循环每次: 读 As[ty][k] + 读 Bs[k][tx] = 2 次 shared memory 读
        </text>
        <text x={60} y={296} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          计算: 1 次 FMA (fused multiply-add)
        </text>
        <text x={60} y={312} fontSize="8" fill={COLORS.red} fontFamily={FONTS.sans}>
          Compute:Load = 1 FMA / 2 reads = 0.5 — shared memory 带宽成为瓶颈
        </text>
      </StepSvg>
    ),
  },
  {
    title: '4x4 Thread Tile: 一个线程算 16 个元素',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Thread Tiling: 每个线程计算 TM x TN 的输出块
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          TM=4, TN=4: 每个线程负责 C 的 4x4 = 16 个输出元素
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
                C tile (16x16) — 每个颜色块 = 1 个线程的工作
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
                Thread(1,2) 的 4x4 块
              </text>
            </g>
          );
        })()}

        {/* Register reuse diagram */}
        <rect x={310} y={50} width={250} height={180} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={435} y={70} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>寄存器复用</text>

        {/* A fragment in registers */}
        <rect x={320} y={80} width={20} height={56} rx={2}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={330} y={78} textAnchor="middle" fontSize="6" fill={COLORS.primary}
          fontFamily={FONTS.mono}>A[4]</text>

        {/* B fragment in registers */}
        <rect x={360} y={80} width={56} height={20} rx={2}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={388} y={78} textAnchor="middle" fontSize="6" fill={COLORS.green}
          fontFamily={FONTS.mono}>B[4]</text>

        {/* Result 4x4 in registers */}
        <rect x={360} y={105} width={56} height={56} rx={2}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={388} y={136} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.mono}>C[4x4]</text>

        <text x={435} y={178} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          A 的 4 个值 x B 的 4 个值 = 16 个 FMA
        </text>
        <text x={435} y={194} textAnchor="middle" fontSize="7.5" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          从 shared mem 加载: 4 + 4 = 8 次读
        </text>
        <text x={435} y={210} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute:Load = 16 / 8 = 2.0 (4x 提升!)
        </text>

        {/* Formula */}
        <rect x={40} y={280} width={500} height={40} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={298} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Compute:Load = TM x TN / (TM + TN) = 4x4 / (4+4) = 2.0
        </text>
        <text x={W / 2} y={312} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          增大 TM, TN → 更高的计算/访存比 (但需要更多寄存器)
        </text>
      </StepSvg>
    ),
  },
  {
    title: '完整 Thread Tile 数据流',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          三级存储层次: HBM → Shared Memory → 寄存器
        </text>
        <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b"
          fontFamily={FONTS.sans}>
          每级缓存都通过 tiling 提高复用率
        </text>

        {/* Three levels */}
        {[
          { label: 'HBM (Global Memory)', y: 55, w: 500, h: 45, color: COLORS.red,
            bg: '#fee2e2', detail: '完整矩阵 A(MxK), B(KxN), C(MxN)', bw: '~3 TB/s (H100)' },
          { label: 'Shared Memory', y: 120, w: 400, h: 45, color: COLORS.orange,
            bg: '#fff7ed', detail: 'A tile (BSxBS) + B tile (BSxBS)', bw: '~20 TB/s per SM' },
          { label: '寄存器 (Register File)', y: 185, w: 300, h: 45, color: COLORS.green,
            bg: '#dcfce7', detail: 'A fragment (TM) + B fragment (TN) + C accumulator (TMxTN)', bw: '~60 TB/s per SM' },
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
                  {i === 0 ? 'Block Tiling (BS x BS)' : 'Thread Tiling (TM x TN)'}
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
          FMA (寄存器 → 寄存器)
        </text>

        {/* Summary table */}
        <rect x={40} y={285} width={500} height={40} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={120} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>优化层</text>
        <text x={280} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>HBM 访问减少</text>
        <text x={440} y={302} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Shared Mem 访问减少</text>
        <text x={120} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.dark} fontFamily={FONTS.mono}>Block Tile + Thread Tile</text>
        <text x={280} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>BLOCK_SIZE 倍</text>
        <text x={440} y={318} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.mono}>TM x TN / (TM + TN) 倍</text>
      </StepSvg>
    ),
  },
];

export default function ThreadTileAnimation() {
  return <StepNavigator steps={steps} />;
}
