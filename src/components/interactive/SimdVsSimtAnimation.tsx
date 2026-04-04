// src/components/interactive/SimdVsSimtAnimation.tsx
// StepNavigator: SIMD vs SIMT execution model comparison
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 320;

function StepSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
      {children}
    </svg>
  );
}

// A single lane/thread box
function Lane({ x, y, w, h, label, active, color, bg }: {
  x: number; y: number; w: number; h: number;
  label: string; active: boolean; color: string; bg: string;
}) {
  return (
    <g opacity={active ? 1 : 0.25}>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={active ? bg : '#f1f5f9'} stroke={active ? color : '#cbd5e1'} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill={active ? color : '#94a3b8'} fontFamily={FONTS.mono}>
        {label}
      </text>
    </g>
  );
}

// Section title
function SectionTitle({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="700"
      fill={color} fontFamily={FONTS.sans}>{text}</text>
  );
}

const LANE_W = 28;
const LANE_H = 32;
const LANE_GAP = 3;

// SIMD: 8-wide vector operation
function SimdVector({ x, y, values, active, color, bg, label }: {
  x: number; y: number; values: string[];
  active: boolean[]; color: string; bg: string; label: string;
}) {
  return (
    <g>
      <text x={x - 4} y={y + LANE_H / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <Lane key={i} x={x + i * (LANE_W + LANE_GAP)} y={y}
          w={LANE_W} h={LANE_H} label={v} active={active[i]} color={color} bg={bg} />
      ))}
      {/* bracket */}
      <rect x={x - 2} y={y - 2} width={values.length * (LANE_W + LANE_GAP) - LANE_GAP + 4}
        height={LANE_H + 4} rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" />
    </g>
  );
}

// SIMT: 8 scalar threads (representing 32, showing subset)
function SimtThreads({ x, y, values, active, color, bg, label }: {
  x: number; y: number; values: string[];
  active: boolean[]; color: string; bg: string; label: string;
}) {
  return (
    <g>
      <text x={x - 4} y={y + LANE_H / 2} textAnchor="end" dominantBaseline="middle"
        fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {values.map((v, i) => (
        <Lane key={i} x={x + i * (LANE_W + LANE_GAP)} y={y}
          w={LANE_W} h={LANE_H} label={v} active={active[i]} color={color} bg={bg} />
      ))}
    </g>
  );
}

const allActive = Array(8).fill(true);
const oddActive = [false, true, false, true, false, true, false, true];
const evenActive = [true, false, true, false, true, false, true, false];

const steps = [
  {
    title: '基本操作: a[i] = b[i] + c[i]',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          同一操作 a[i] = b[i] + c[i] 的两种执行方式
        </text>

        {/* SIMD side */}
        <SectionTitle x={155} y={42} text="SIMD (Intel iGPU)" color={COLORS.primary} />
        <text x={155} y={56} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          一条指令操作 8-wide 向量
        </text>
        <SimdVector x={55} y={70} label="vadd"
          values={['b0+c0', 'b1+c1', 'b2+c2', 'b3+c3', 'b4+c4', 'b5+c5', 'b6+c6', 'b7+c7']}
          active={allActive} color={COLORS.primary} bg="#dbeafe" />

        <text x={155} y={122} textAnchor="middle" fontSize="8" fill={COLORS.primary}
          fontFamily={FONTS.mono}>
          vadd.8 a[0:7], b[0:7], c[0:7]  // 一条向量指令
        </text>

        {/* Divider */}
        <line x1={W / 2} y1={36} x2={W / 2} y2={SVG_H - 20} stroke="#e2e8f0" strokeWidth={1} />

        {/* SIMT side */}
        <SectionTitle x={435} y={42} text="SIMT (NVIDIA GPU)" color={COLORS.green} />
        <text x={435} y={56} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          32 个线程各执行标量代码 (显示 8 个)
        </text>
        <SimtThreads x={335} y={70} label="T0-T7"
          values={['b0+c0', 'b1+c1', 'b2+c2', 'b3+c3', 'b4+c4', 'b5+c5', 'b6+c6', 'b7+c7']}
          active={allActive} color={COLORS.green} bg="#dcfce7" />

        <text x={435} y={122} textAnchor="middle" fontSize="8" fill={COLORS.green}
          fontFamily={FONTS.mono}>
          a[tid] = b[tid] + c[tid];  // 标量代码 x32 线程
        </text>

        {/* Key insight */}
        <rect x={40} y={145} width={500} height={50} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={164} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          结果相同 — 但编程模型不同：SIMD 程序员必须知道向量宽度，SIMT 程序员写标量代码
        </text>
        <text x={W / 2} y={180} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD: 编译器/程序员负责向量化 | SIMT: 硬件自动将 32 个标量线程打包为 warp
        </text>

        {/* Summary boxes */}
        <rect x={40} y={210} width={220} height={80} rx={5}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
        <text x={150} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>SIMD 特点</text>
        <text x={150} y={244} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>显式向量宽度 (8/16/32)</text>
        <text x={150} y={258} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>程序员用 intrinsic 或编译器向量化</text>
        <text x={150} y={272} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>Intel EU / CPU SSE/AVX</text>

        <rect x={320} y={210} width={220} height={80} rx={5}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
        <text x={430} y={228} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>SIMT 特点</text>
        <text x={430} y={244} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>向量宽度对程序员透明</text>
        <text x={430} y={258} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>写标量代码，硬件打包执行</text>
        <text x={430} y={272} textAnchor="middle" fontSize="8"
          fill={COLORS.dark} fontFamily={FONTS.sans}>NVIDIA Warp (32 threads)</text>
      </StepSvg>
    ),
  },
  {
    title: '分支: if (i % 2 == 0)',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          分支 if (i % 2 == 0) 下的行为差异
        </text>

        {/* SIMD side — needs explicit mask */}
        <SectionTitle x={155} y={40} text="SIMD: 需要 mask 显式处理" color={COLORS.primary} />

        <text x={55} y={62} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 1: mask = even lanes</text>
        <SimdVector x={55} y={70} label="if"
          values={['a=X', '----', 'a=X', '----', 'a=X', '----', 'a=X', '----']}
          active={evenActive} color={COLORS.primary} bg="#dbeafe" />

        <text x={55} y={118} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 2: mask = odd lanes</text>
        <SimdVector x={55} y={126} label="else"
          values={['----', 'a=Y', '----', 'a=Y', '----', 'a=Y', '----', 'a=Y']}
          active={oddActive} color={COLORS.orange} bg="#fff7ed" />

        {/* Divider */}
        <line x1={W / 2} y1={36} x2={W / 2} y2={SVG_H - 20} stroke="#e2e8f0" strokeWidth={1} />

        {/* SIMT side — warp divergence */}
        <SectionTitle x={435} y={40} text="SIMT: Warp Divergence" color={COLORS.green} />

        <text x={335} y={62} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 1: even threads active, odd masked</text>
        <SimtThreads x={335} y={70} label="if"
          values={['a=X', '----', 'a=X', '----', 'a=X', '----', 'a=X', '----']}
          active={evenActive} color={COLORS.green} bg="#dcfce7" />

        <text x={335} y={118} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>Pass 2: odd threads active, even masked</text>
        <SimtThreads x={335} y={126} label="else"
          values={['----', 'a=Y', '----', 'a=Y', '----', 'a=Y', '----', 'a=Y']}
          active={oddActive} color={COLORS.orange} bg="#fff7ed" />

        {/* Key insight */}
        <rect x={40} y={175} width={500} height={45} rx={5}
          fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
        <text x={W / 2} y={192} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.red} fontFamily={FONTS.sans}>
          两种模型都必须串行执行两条分支路径 — 效率减半
        </text>
        <text x={W / 2} y={208} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD 用 mask register 显式控制 | SIMT 硬件自动 mask 非活跃线程 (warp divergence)
        </text>

        {/* Difference */}
        <rect x={40} y={235} width={500} height={55} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        <text x={W / 2} y={253} textAnchor="middle" fontSize="9" fill={COLORS.dark}
          fontFamily={FONTS.sans}>
          关键区别: SIMT 的分支在硬件层自动处理（只是效率损失，不是编程错误）
        </text>
        <text x={W / 2} y={268} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          SIMD 程序员必须管理 mask / 用 blend 指令 | SIMT 程序员写普通 if/else 即可
        </text>
        <text x={W / 2} y={283} textAnchor="middle" fontSize="8" fill="#64748b"
          fontFamily={FONTS.sans}>
          但 warp divergence 仍然影响性能 — 应尽量让 warp 内线程走相同分支
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Intel iGPU: SIMD + SIMT 混合',
    content: (
      <StepSvg>
        <text x={W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Intel iGPU: 底层 SIMD 驱动，编程层 SIMT 体验
        </text>

        {/* Hardware layer */}
        <rect x={30} y={35} width={520} height={70} rx={6}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
        <text x={50} y={52} fontSize="9" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>硬件层: EU 内部 SIMD 执行</text>
        <text x={50} y={68} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          每个 EU Thread 驱动 8-wide 或 16-wide SIMD ALU
        </text>
        <text x={50} y={82} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          向量宽度由硬件决定 (Xe2: 8-wide FP32, 16-wide FP16)
        </text>
        <text x={50} y={96} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          Sub-group 直接对应一条 SIMD lane — 暴露底层向量宽度
        </text>

        {/* Programming layer */}
        <rect x={30} y={115} width={520} height={65} rx={6}
          fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
        <text x={50} y={132} fontSize="9" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>编程层: SYCL / OpenCL work-item 抽象</text>
        <text x={50} y={148} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          work-item (线程) 写标量代码 — 接近 SIMT 体验
        </text>
        <text x={50} y={164} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.sans}>
          work-group (block) 内线程共享 SLM — 类似 CUDA shared memory
        </text>
        <text x={50} y={176} fontSize="8" fill="#64748b" fontFamily={FONTS.sans}>
          但 sub-group 操作 (shuffle, broadcast) 暴露了底层 SIMD 宽度
        </text>

        {/* Arrow */}
        <line x1={W / 2} y1={105} x2={W / 2} y2={115}
          stroke={COLORS.orange} strokeWidth={2} markerEnd="url(#arrowDown)" />

        {/* Comparison table */}
        <rect x={30} y={195} width={520} height={100} rx={5}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
        {/* Headers */}
        <text x={100} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>维度</text>
        <text x={230} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>Intel iGPU</text>
        <text x={400} y={212} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>NVIDIA GPU</text>
        <line x1={40} y1={218} x2={540} y2={218} stroke="#e2e8f0" strokeWidth={0.5} />
        {/* Rows */}
        {[
          ['SIMD 宽度', '8/16 (显式可见)', '32 (Warp, 对程序员透明)'],
          ['编程单位', 'work-item (标量)', 'thread (标量)'],
          ['最小并行组', 'sub-group (=SIMD)', 'warp (=32 threads)'],
          ['共享内存', 'SLM (Shared Local)', 'Shared Memory'],
        ].map(([dim, intel, nvidia], i) => (
          <g key={i}>
            <text x={100} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.dark} fontFamily={FONTS.sans}>{dim}</text>
            <text x={230} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.primary} fontFamily={FONTS.mono}>{intel}</text>
            <text x={400} y={235 + i * 16} textAnchor="middle" fontSize="7.5"
              fill={COLORS.green} fontFamily={FONTS.mono}>{nvidia}</text>
          </g>
        ))}

        {/* Arrow marker def */}
        <defs>
          <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>
      </StepSvg>
    ),
  },
];

export default function SimdVsSimtAnimation() {
  return <StepNavigator steps={steps} />;
}
