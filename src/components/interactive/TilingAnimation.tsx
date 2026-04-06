// src/components/interactive/TilingAnimation.tsx
// StepNavigator: GEMM tiling with shared memory optimization (core component)
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 360;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// Draw a matrix divided into tiles
function TiledMatrix({ x, y, w, h, label, tilesR, tilesC, activeTileR, activeTileC, color }: {
  x: number; y: number; w: number; h: number; label: string;
  tilesR: number; tilesC: number;
  activeTileR?: number; activeTileC?: number; color: string;
}) {
  const tileW = w / tilesC;
  const tileH = h / tilesR;
  return (
    <g>
      <text x={x + w / 2} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      <rect x={x} y={y} width={w} height={h} rx={2}
        fill="#f8fafc" stroke={COLORS.dark} strokeWidth={1} />
      {Array.from({ length: tilesR }).map((_, tr) =>
        Array.from({ length: tilesC }).map((_, tc) => {
          const isActive = activeTileR === tr && activeTileC === tc;
          return (
            <rect key={`${tr}-${tc}`}
              x={x + tc * tileW + 0.5} y={y + tr * tileH + 0.5}
              width={tileW - 1} height={tileH - 1} rx={1}
              fill={isActive ? (color === COLORS.primary ? '#dbeafe' : '#dcfce7') : 'transparent'}
              stroke={isActive ? color : '#e2e8f0'} strokeWidth={isActive ? 2 : 0.5} />
          );
        })
      )}
    </g>
  );
}

const TILES = 4; // 4x4 tile grid for visualization

export default function TilingAnimation({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 矩阵切分为 Tile 网格',
      step1Heading: 'Tiling: 把大矩阵切成 BLOCK_SIZE x BLOCK_SIZE 的小块',
      step1Desc: '每个 Block 负责计算 C 的一个 tile，沿 K 维遍历 A/B 的 tile 对',
      tilingStrategy: 'Tiling 策略',
      strategy1: '1. 每个 CUDA Block 对应 C 的一个 tile (BLOCK_SIZE x BLOCK_SIZE 线程)',
      strategy2: '2. 计算 C[tile_r][tile_c] 需要 A 的第 tile_r 行所有 tile x B 的第 tile_c 列所有 tile',
      strategy3: '3. 外循环: for t = 0 to K/BLOCK_SIZE — 每次加载一对 tile 到 Shared Memory',
      strategy4: '4. 关键: 每个 tile 从 HBM 只加载一次，被 BLOCK_SIZE 个线程共享复用',
      step2Title: 'Step 2: 加载 Tile 到 Shared Memory',
      step2Heading: '一个 Block 的工作: 计算 C 的 tile[1][2] (第 t=0 步)',
      sharedMemory: 'Shared Memory',
      aTile: 'A tile',
      bTile: 'B tile',
      partialSum: '部分和 += A_tile * B_tile',
      comment1: '// 外循环: 沿 K 维遍历每对 tile',
      comment2: '协作加载 A tile',
      comment3: '协作加载 B tile',
      comment4: '从 shared memory 读 (快!)',
      step3Title: 'Step 3: Tile 在 Shared Memory 中的计算',
      step3Heading: 'Shared Memory 中的 Tile 乘法',
      step3Desc: 'Block 内 BLOCK_SIZE x BLOCK_SIZE 线程从 shared memory 读取 — 延迟极低',
      asLabel: 'As (shared mem)',
      bsLabel: 'Bs (shared mem)',
      rowLabel: 'row',
      colLabel: 'col',
      sumLabel: 'sum',
      inRegs: '在寄存器中累加',
      whyEffective: '为什么 Tiling 有效?',
      naive: 'Naive: 每个线程读 A 的一行 (K 个元素) — 同一行被 BLOCK_SIZE 个线程重复从 HBM 读取',
      tiling: 'Tiling: 每个 tile 从 HBM 只读一次到 shared memory → BLOCK_SIZE 个线程共享',
      reduction: '全局内存访问减少 BLOCK_SIZE 倍! (如 BS=32: 减少 32x)',
      comparison: '内存访问量对比 (M=N=K=4096, BS=32)',
      naiveAccess: 'Naive: 2MNK = 137G',
      tilingAccess: 'Tiling: 2MNK/BS = 4.3G (32x 减少)',
      step4Title: 'Step 4: 完整 Tiling 外循环',
      step4Heading: '沿 K 维遍历所有 Tile 对，累加部分和',
      accumulate: '累加',
      writeBack: '写回 HBM',
      completeFlow: '完整流程',
      flow1: '1. 确定 C 的 tile 位置',
      flow2: '2. for t = 0..K/BS-1:',
      flow3: '   a. 从 HBM 加载 A/B tile',
      flow4: '      到 shared memory',
      flow5: '   b. __syncthreads()',
      flow6: '   c. 在 shared memory 中',
      flow7: '      做部分矩阵乘',
      flow8: '   d. sum += partial',
      flow9: '   e. __syncthreads()',
      flow10: '3. 写 C[row][col] = sum',
      flow11: '   回 HBM',
      syncNote: '两次 __syncthreads() 确保',
      syncNote2: '加载完再计算、计算完再换 tile',
    },
    en: {
      step1Title: 'Step 1: Matrix split into Tile grid',
      step1Heading: 'Tiling: Split large matrix into BLOCK_SIZE x BLOCK_SIZE tiles',
      step1Desc: 'Each Block computes one tile of C, iterating over A/B tile pairs along K dimension',
      tilingStrategy: 'Tiling Strategy',
      strategy1: '1. Each CUDA Block handles one tile of C (BLOCK_SIZE x BLOCK_SIZE threads)',
      strategy2: '2. Computing C[tile_r][tile_c] requires all tiles in row tile_r of A x all tiles in col tile_c of B',
      strategy3: '3. Outer loop: for t = 0 to K/BLOCK_SIZE — load one tile pair to Shared Memory each time',
      strategy4: '4. Key: Each tile loaded from HBM only once, shared and reused by BLOCK_SIZE threads',
      step2Title: 'Step 2: Load Tile to Shared Memory',
      step2Heading: 'One Block\'s work: compute C tile[1][2] (step t=0)',
      sharedMemory: 'Shared Memory',
      aTile: 'A tile',
      bTile: 'B tile',
      partialSum: 'partial sum += A_tile * B_tile',
      comment1: '// Outer loop: iterate tile pairs along K',
      comment2: 'Cooperatively load A tile',
      comment3: 'Cooperatively load B tile',
      comment4: 'Read from shared memory (fast!)',
      step3Title: 'Step 3: Tile computation in Shared Memory',
      step3Heading: 'Tile multiplication in Shared Memory',
      step3Desc: 'BLOCK_SIZE x BLOCK_SIZE threads in Block read from shared memory — very low latency',
      asLabel: 'As (shared mem)',
      bsLabel: 'Bs (shared mem)',
      rowLabel: 'row',
      colLabel: 'col',
      sumLabel: 'sum',
      inRegs: 'Accumulate in registers',
      whyEffective: 'Why is Tiling effective?',
      naive: 'Naive: Each thread reads one row of A (K elements) — same row read from HBM by BLOCK_SIZE threads',
      tiling: 'Tiling: Each tile read from HBM only once to shared memory → shared by BLOCK_SIZE threads',
      reduction: 'Global memory access reduced by BLOCK_SIZE x! (e.g., BS=32: 32x reduction)',
      comparison: 'Memory Access Comparison (M=N=K=4096, BS=32)',
      naiveAccess: 'Naive: 2MNK = 137G',
      tilingAccess: 'Tiling: 2MNK/BS = 4.3G (32x reduction)',
      step4Title: 'Step 4: Complete Tiling outer loop',
      step4Heading: 'Iterate all Tile pairs along K dimension, accumulate partial sums',
      accumulate: 'accumulate',
      writeBack: 'write back to HBM',
      completeFlow: 'Complete Flow',
      flow1: '1. Determine C tile position',
      flow2: '2. for t = 0..K/BS-1:',
      flow3: '   a. Load A/B tile from HBM',
      flow4: '      to shared memory',
      flow5: '   b. __syncthreads()',
      flow6: '   c. Compute partial matmul',
      flow7: '      in shared memory',
      flow8: '   d. sum += partial',
      flow9: '   e. __syncthreads()',
      flow10: '3. Write C[row][col] = sum',
      flow11: '   back to HBM',
      syncNote: 'Two __syncthreads() ensure',
      syncNote2: 'load before compute, compute before next tile',
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

        <TiledMatrix x={30} y={60} w={140} h={140} label={`A (M x K)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.primary} />
        <text x={190} y={130} fontSize="14" fill={COLORS.dark}>x</text>
        <TiledMatrix x={210} y={60} w={140} h={140} label={`B (K x N)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.green} />
        <text x={370} y={130} fontSize="14" fill={COLORS.dark}>=</text>
        <TiledMatrix x={390} y={60} w={140} h={140} label={`C (M x N)`}
          tilesR={TILES} tilesC={TILES} color={COLORS.orange} />

        {/* Annotation */}
        <rect x={40} y={220} width={500} height={120} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={240} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.tilingStrategy}</text>
        <text x={60} y={260} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.strategy1}
        </text>
        <text x={60} y={278} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.strategy2}
        </text>
        <text x={60} y={296} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          {t.strategy3}
        </text>
        <text x={60} y={314} fontSize="8" fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.strategy4}
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

        {/* A tile highlighted */}
        <TiledMatrix x={30} y={50} w={120} h={120} label="A"
          tilesR={TILES} tilesC={TILES} activeTileR={1} activeTileC={0} color={COLORS.primary} />
        {/* B tile highlighted */}
        <TiledMatrix x={170} y={50} w={120} h={120} label="B"
          tilesR={TILES} tilesC={TILES} activeTileR={0} activeTileC={2} color={COLORS.green} />

        {/* Arrow: HBM → Shared Memory */}
        <text x={400} y={55} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.sharedMemory}</text>
        <rect x={340} y={62} width={55} height={45} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={368} y={88} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.mono}>{t.aTile}</text>
        <rect x={405} y={62} width={55} height={45} rx={3}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={433} y={88} textAnchor="middle" fontSize="7" fill={COLORS.green}
          fontFamily={FONTS.mono}>{t.bTile}</text>

        {/* Arrows */}
        <line x1={150} y1={90} x2={335} y2={82} stroke={COLORS.primary} strokeWidth={1.5}
          markerEnd="url(#tiling-arrow-blue)" />
        <line x1={290} y1={80} x2={400} y2={82} stroke={COLORS.green} strokeWidth={1.5}
          markerEnd="url(#tiling-arrow-green)" />
        <defs>
          <marker id="tiling-arrow-blue" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.primary} />
          </marker>
          <marker id="tiling-arrow-green" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.green} />
          </marker>
        </defs>

        <text x={400} y={125} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>__syncthreads()</text>

        {/* Computation */}
        <rect x={340} y={135} width={120} height={35} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={400} y={155} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.partialSum}
        </text>

        {/* Code */}
        <rect x={30} y={190} width={520} height={145} rx={5}
          fill="#1e293b" />
        <text x={45} y={210} fontSize="7.5" fill="#94a3b8" fontFamily={FONTS.mono}>
          {t.comment1}
        </text>
        <text x={45} y={226} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          for (int t = 0; t {'<'} K / BLOCK_SIZE; t++) {'{'}
        </text>
        <text x={55} y={242} fontSize="7.5" fill={COLORS.primary} fontFamily={FONTS.mono}>
          As[ty][tx] = A[row][t*BS + tx];  // {t.comment2}
        </text>
        <text x={55} y={258} fontSize="7.5" fill={COLORS.green} fontFamily={FONTS.mono}>
          Bs[ty][tx] = B[t*BS + ty][col];  // {t.comment3}
        </text>
        <text x={55} y={274} fontSize="7.5" fill={COLORS.orange} fontFamily={FONTS.mono}>
          __syncthreads();
        </text>
        <text x={55} y={290} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          for (int k = 0; k {'<'} BS; k++)
        </text>
        <text x={65} y={306} fontSize="7.5" fill="#fef3c7" fontFamily={FONTS.mono}>
          sum += As[ty][k] * Bs[k][tx];  // {t.comment4}
        </text>
        <text x={55} y={322} fontSize="7.5" fill={COLORS.orange} fontFamily={FONTS.mono}>
          __syncthreads();
        </text>
        <text x={45} y={338} fontSize="7.5" fill="#e2e8f0" fontFamily={FONTS.mono}>
          {'}'}
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

        {/* As tile */}
        {(() => {
          const tileSize = 4;
          const cell = 22;
          const ax = 60;
          const ay = 60;
          return (
            <g>
              <text x={ax + tileSize * cell / 2} y={ay - 6} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                As (shared mem)
              </text>
              <rect x={ax - 2} y={ay - 2} width={tileSize * cell + 4} height={tileSize * cell + 4}
                rx={3} fill="none" stroke={COLORS.primary} strokeWidth={1.5} />
              {Array.from({ length: tileSize }).map((_, r) =>
                Array.from({ length: tileSize }).map((_, c) => (
                  <rect key={`a-${r}-${c}`} x={ax + c * cell} y={ay + r * cell}
                    width={cell - 1} height={cell - 1} rx={1}
                    fill={r === 1 ? '#dbeafe' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth={0.5} />
                ))
              )}
              <text x={ax - 10} y={ay + 1.5 * cell} textAnchor="end" fontSize="7"
                fill={COLORS.primary} fontFamily={FONTS.sans}>row</text>
            </g>
          );
        })()}

        {/* Bs tile */}
        {(() => {
          const tileSize = 4;
          const cell = 22;
          const bx = 200;
          const by = 60;
          return (
            <g>
              <text x={bx + tileSize * cell / 2} y={by - 6} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
                Bs (shared mem)
              </text>
              <rect x={bx - 2} y={by - 2} width={tileSize * cell + 4} height={tileSize * cell + 4}
                rx={3} fill="none" stroke={COLORS.green} strokeWidth={1.5} />
              {Array.from({ length: tileSize }).map((_, r) =>
                Array.from({ length: tileSize }).map((_, c) => (
                  <rect key={`b-${r}-${c}`} x={bx + c * cell} y={by + r * cell}
                    width={cell - 1} height={cell - 1} rx={1}
                    fill={c === 2 ? '#dcfce7' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth={0.5} />
                ))
              )}
              <text x={bx + 2.5 * cell} y={by - 14} textAnchor="middle" fontSize="7"
                fill={COLORS.green} fontFamily={FONTS.sans}>col</text>
            </g>
          );
        })()}

        {/* Arrow from row to result */}
        <text x={175} y={110} fontSize="10" fill={COLORS.dark}>x</text>

        {/* Result cell */}
        <rect x={340} y={90} width={50} height={30} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={2} />
        <text x={365} y={108} textAnchor="middle" fontSize="8" fontWeight="700"
          fill={COLORS.orange} fontFamily={FONTS.mono}>sum</text>
        <text x={365} y={135} textAnchor="middle" fontSize="7" fill="#64748b"
          fontFamily={FONTS.sans}>在寄存器中累加</text>

        {/* Key benefit */}
        <rect x={30} y={175} width={520} height={75} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={W / 2} y={195} textAnchor="middle" fontSize="10" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          为什么 Tiling 有效?
        </text>
        <text x={60} y={215} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Naive: 每个线程读 A 的一行 (K 个元素) — 同一行被 BLOCK_SIZE 个线程重复从 HBM 读取
        </text>
        <text x={60} y={232} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Tiling: 每个 tile 从 HBM 只读一次到 shared memory → BLOCK_SIZE 个线程共享
        </text>
        <text x={60} y={248} fontSize="8" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
          全局内存访问减少 BLOCK_SIZE 倍! (如 BS=32: 减少 32x)
        </text>

        {/* Comparison */}
        <rect x={30} y={265} width={520} height={60} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={285} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>内存访问量对比 (M=N=K=4096, BS=32)</text>
        <text x={120} y={305} textAnchor="middle" fontSize="8" fill={COLORS.red} fontFamily={FONTS.mono}>
          Naive: 2MNK = 137G
        </text>
        <text x={W / 2} y={305} textAnchor="middle" fontSize="8" fill={COLORS.dark}
          fontFamily={FONTS.sans}>→</text>
        <text x={420} y={305} textAnchor="middle" fontSize="8" fill={COLORS.green} fontFamily={FONTS.mono}>
          Tiling: 2MNK/BS = 4.3G (32x 减少)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: 完整 Tiling 外循环',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          沿 K 维遍历所有 Tile 对，累加部分和
        </text>

        {/* Show iteration over tiles */}
        {Array.from({ length: 4 }).map((_, t) => {
          const baseY = 45 + t * 60;
          const isActive = t <= 1;
          const opacity = isActive ? 1 : 0.4;
          return (
            <g key={t} opacity={opacity}>
              <text x={20} y={baseY + 18} fontSize="8" fontWeight="600"
                fill={COLORS.dark} fontFamily={FONTS.mono}>t={t}</text>

              {/* A strip */}
              <rect x={55} y={baseY} width={80} height={30} rx={2}
                fill={t === 0 ? '#dbeafe' : t === 1 ? '#bfdbfe' : '#f1f5f9'}
                stroke={COLORS.primary} strokeWidth={isActive ? 1.5 : 0.5} />
              <text x={95} y={baseY + 18} textAnchor="middle" fontSize="6.5"
                fill={COLORS.primary} fontFamily={FONTS.mono}>
                A tile[1][{t}]
              </text>

              <text x={148} y={baseY + 18} fontSize="8" fill={COLORS.dark}>x</text>

              {/* B strip */}
              <rect x={165} y={baseY} width={80} height={30} rx={2}
                fill={t === 0 ? '#dcfce7' : t === 1 ? '#bbf7d0' : '#f1f5f9'}
                stroke={COLORS.green} strokeWidth={isActive ? 1.5 : 0.5} />
              <text x={205} y={baseY + 18} textAnchor="middle" fontSize="6.5"
                fill={COLORS.green} fontFamily={FONTS.mono}>
                B tile[{t}][2]
              </text>

              {/* Arrow to accumulator */}
              <line x1={250} y1={baseY + 15} x2={280} y2={baseY + 15}
                stroke="#94a3b8" strokeWidth={0.8} />
            </g>
          );
        })}

        {/* Accumulator */}
        <rect x={285} y={55} width={60} height={210} rx={5}
          fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={315} y={100} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>累加</text>
        <text x={315} y={120} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>sum</text>
        <text x={315} y={140} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>+=</text>
        <text x={315} y={160} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.mono}>partial</text>

        {/* Final write back */}
        <line x1={315} y1={265} x2={315} y2={290}
          stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#tiling-arrow-o)" />
        <defs>
          <marker id="tiling-arrow-o" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={COLORS.orange} />
          </marker>
        </defs>
        <rect x={275} y={292} width={80} height={25} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
        <text x={315} y={308} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.mono}>C[row][col]</text>
        <text x={315} y={330} textAnchor="middle" fontSize="7"
          fill="#64748b" fontFamily={FONTS.sans}>{t.writeBack}</text>

        {/* Right side: summary */}
        <rect x={370} y={45} width={190} height={260} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={465} y={68} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{t.completeFlow}</text>

        {[t.flow1, t.flow2, t.flow3, t.flow4, t.flow5, t.flow6, t.flow7, t.flow8, t.flow9, t.flow10, t.flow11].map((line, i) => (
          <text key={i} x={380} y={88 + i * 16} fontSize="7.5"
            fill={line.startsWith('   ') ? '#64748b' : COLORS.dark} fontFamily={FONTS.mono}>
            {line}
          </text>
        ))}

        <text x={465} y={272} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.syncNote}
        </text>
        <text x={465} y={286} textAnchor="middle" fontSize="7.5"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.syncNote2}
        </text>
      </StepSvg>
    ),
  },
];

  return <StepNavigator steps={steps} />;
}
