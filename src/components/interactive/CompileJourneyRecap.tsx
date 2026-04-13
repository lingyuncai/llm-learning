import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

interface StageArticle {
  slug: string;
  title: { zh: string; en: string };
}

interface Stage {
  num: number;
  name: { zh: string; en: string };
  transform: { zh: string; en: string };
  description: { zh: string; en: string };
  articles: StageArticle[];
  icon: string;
  color: string;
}

/* ─── Constants ─── */

const W = 800;
const H = 600;

const STAGES: Stage[] = [
  {
    num: 1,
    name: { zh: '用户代码 → 计算图', en: 'User Code → Computation Graph' },
    transform: { zh: 'torch.compile → TorchDynamo 捕获', en: 'torch.compile → TorchDynamo capture' },
    description: {
      zh: 'Python 代码经 TorchDynamo 动态追踪，生成 FX Graph 计算图。Guard 机制保障动态形状正确性。',
      en: 'Python code is dynamically traced by TorchDynamo, producing an FX Graph. Guards ensure correctness for dynamic shapes.',
    },
    articles: [
      { slug: 'ml-compiler-landscape', title: { zh: 'ML 编译器全景', en: 'ML Compiler Landscape' } },
      { slug: 'graph-capture-dynamo', title: { zh: '计算图捕获与 Dynamo', en: 'Graph Capture & Dynamo' } },
    ],
    icon: '{ }',
    color: HEAD_COLORS[0],
  },
  {
    num: 2,
    name: { zh: 'IR 表示与 Lowering', en: 'IR Representation & Lowering' },
    transform: { zh: 'FX Graph / MLIR → 逐层降低', en: 'FX Graph / MLIR → progressive lowering' },
    description: {
      zh: '多层 IR 设计：高层保留语义信息用于优化，逐步 lower 到硬件级表示。MLIR Dialect 体系实现渐进式降低。',
      en: 'Multi-level IR design: high-level preserves semantic info for optimization, progressively lowered to hardware-level. MLIR Dialects enable progressive lowering.',
    },
    articles: [
      { slug: 'ir-design-basics', title: { zh: 'IR 设计基础', en: 'IR Design Basics' } },
      { slug: 'ir-progressive-lowering', title: { zh: 'IR 渐进式降低', en: 'IR Progressive Lowering' } },
    ],
    icon: 'IR',
    color: HEAD_COLORS[1],
  },
  {
    num: 3,
    name: { zh: '优化 Pass', en: 'Optimization Passes' },
    transform: { zh: 'DCE / CSE / 常量折叠 / Layout 优化', en: 'DCE / CSE / Constant Folding / Layout Opt.' },
    description: {
      zh: '基础 Pass（DCE、CSE）消除冗余；高级 Pass（layout 传播、自动微分优化）提升数据局部性；多面体方法处理复杂循环变换。',
      en: 'Basic passes (DCE, CSE) eliminate redundancy; advanced passes (layout propagation, autograd opt.) improve locality; polyhedral methods handle complex loop transformations.',
    },
    articles: [
      { slug: 'graph-passes-foundations', title: { zh: '图优化 Pass 基础', en: 'Graph Pass Foundations' } },
      { slug: 'graph-passes-advanced', title: { zh: '高级图优化 Pass', en: 'Advanced Graph Passes' } },
      { slug: 'graph-passes-polyhedral', title: { zh: '多面体编译', en: 'Polyhedral Compilation' } },
    ],
    icon: 'OPT',
    color: HEAD_COLORS[2],
  },
  {
    num: 4,
    name: { zh: '算子融合', en: 'Operator Fusion' },
    transform: { zh: '识别融合组 → 合并 Kernel', en: 'Identify fusion groups → merge kernels' },
    description: {
      zh: '横向/纵向/混合融合策略减少内存访问。Cost model 指导融合决策，平衡 compute-bound 和 memory-bound 工作负载。',
      en: 'Horizontal/vertical/mixed fusion strategies reduce memory traffic. Cost models guide fusion decisions, balancing compute-bound and memory-bound workloads.',
    },
    articles: [
      { slug: 'operator-fusion-taxonomy', title: { zh: '算子融合分类', en: 'Operator Fusion Taxonomy' } },
      { slug: 'operator-fusion-cost-model', title: { zh: '融合 Cost Model', en: 'Fusion Cost Model' } },
    ],
    icon: 'F',
    color: HEAD_COLORS[3],
  },
  {
    num: 5,
    name: { zh: 'Tiling 与内存优化', en: 'Tiling & Memory Optimization' },
    transform: { zh: 'HBM → SMEM → Register 数据搬运', en: 'HBM → SMEM → Register data movement' },
    description: {
      zh: '分块策略将大矩阵映射到 GPU 内存层次。动态 shape 带来 tile 边界处理和符号化分析的额外挑战。',
      en: 'Tiling maps large matrices to GPU memory hierarchy. Dynamic shapes add challenges for tile boundary handling and symbolic analysis.',
    },
    articles: [
      { slug: 'tiling-memory-hierarchy', title: { zh: 'Tiling 与内存层次', en: 'Tiling & Memory Hierarchy' } },
      { slug: 'dynamic-shapes-challenge', title: { zh: '动态 Shape 挑战', en: 'Dynamic Shapes Challenge' } },
    ],
    icon: 'T',
    color: HEAD_COLORS[4],
  },
  {
    num: 6,
    name: { zh: '代码生成', en: 'Code Generation' },
    transform: { zh: '指令选择 → Triton → PTX → cubin', en: 'Instruction Selection → Triton → PTX → cubin' },
    description: {
      zh: '指令选择将高层操作映射到硬件指令。Triton 提供 block-level 编程模型，通过 LLVM 后端生成高效 GPU 二进制。',
      en: 'Instruction selection maps high-level ops to hardware instructions. Triton provides block-level programming, generating efficient GPU binaries via LLVM backend.',
    },
    articles: [
      { slug: 'codegen-instruction-selection', title: { zh: '指令选择', en: 'Instruction Selection' } },
      { slug: 'codegen-triton-backend', title: { zh: 'Triton 后端代码生成', en: 'Triton Backend Codegen' } },
    ],
    icon: 'GEN',
    color: HEAD_COLORS[5],
  },
  {
    num: 7,
    name: { zh: '进阶优化', en: 'Advanced Optimizations' },
    transform: { zh: '量化 / 分布式 / 调度', en: 'Quantization / Distributed / Scheduling' },
    description: {
      zh: '编译器集成量化感知（INT8/FP8）、分布式切分（tensor/pipeline parallel）、以及 kernel 调度与 CUDA Graph。',
      en: 'Compiler integrates quantization-aware (INT8/FP8), distributed sharding (tensor/pipeline parallel), and kernel scheduling with CUDA Graphs.',
    },
    articles: [
      { slug: 'quantization-compilation', title: { zh: '量化编译', en: 'Quantization Compilation' } },
      { slug: 'distributed-compilation', title: { zh: '分布式编译', en: 'Distributed Compilation' } },
      { slug: 'scheduling-execution', title: { zh: '调度与执行优化', en: 'Scheduling & Execution' } },
    ],
    icon: 'ADV',
    color: HEAD_COLORS[6],
  },
  {
    num: 8,
    name: { zh: '自动调优与执行', en: 'Autotuning & Execution' },
    transform: { zh: '搜索最优配置 → CUDA Graph → GPU 执行', en: 'Search best config → CUDA Graph → GPU execution' },
    description: {
      zh: 'Autotuning 在巨大搜索空间中找到最优 kernel 参数。CUDA Graph 消除 launch 开销。最终产出优化的 GPU 程序。',
      en: 'Autotuning finds optimal kernel params in vast search spaces. CUDA Graph eliminates launch overhead. Final output: optimized GPU program.',
    },
    articles: [
      { slug: 'autotuning-end-to-end', title: { zh: '自动调优与端到端实战', en: 'Autotuning & End-to-End' } },
    ],
    icon: 'RUN',
    color: HEAD_COLORS[7],
  },
];

/* ─── Component ─── */

export default function CompileJourneyRecap({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '端到端编译旅程：17 篇文章全景回顾',
      topLabel: 'torch.compile(model)',
      bottomLabel: '优化后的 GPU Kernel(s)',
      speedup: '典型加速比: 1.5-3x',
      youAreHere: '你在这里',
      articles: '相关文章',
    },
    en: {
      title: 'End-to-End Compilation Journey: 17-Article Panorama',
      topLabel: 'torch.compile(model)',
      bottomLabel: 'Optimized GPU Kernel(s)',
      speedup: 'Typical speedup: 1.5-3x',
      youAreHere: 'YOU ARE HERE',
      articles: 'Articles',
    },
  }[locale]!;

  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const cardH = 52;
  const cardW = 600;
  const cardGap = 12;
  const startY = 42;
  const cardX = 140;

  const prefix = locale === 'zh' ? '/zh' : '/en';

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`
          text { font-family: ${FONTS.sans}; }
          .mono { font-family: ${FONTS.mono}; }
          a text { fill: ${COLORS.primary}; }
          a:hover text { text-decoration: underline; }
        `}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Left side annotation: top label */}
        <text x={70} y={startY + 20} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.primary} className="mono">
          {t.topLabel}
        </text>
        <line x1={70} y1={startY + 28} x2={70} y2={startY + STAGES.length * (cardH + cardGap) - cardGap - 10}
          stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon
          points={`65,${startY + STAGES.length * (cardH + cardGap) - cardGap - 10} 70,${startY + STAGES.length * (cardH + cardGap) - cardGap} 75,${startY + STAGES.length * (cardH + cardGap) - cardGap - 10}`}
          fill={COLORS.primary} />
        <text x={70} y={startY + STAGES.length * (cardH + cardGap) + 8} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.green} className="mono">
          {t.bottomLabel}
        </text>
        <text x={70} y={startY + STAGES.length * (cardH + cardGap) + 22} textAnchor="middle" fontSize="8"
          fill={COLORS.orange} fontWeight="600">
          {t.speedup}
        </text>

        {/* Stage cards */}
        {STAGES.map((stage, i) => {
          const cy = startY + i * (cardH + cardGap);
          const isHovered = hoveredStage === i;
          const isCurrent = stage.num === 8;
          const expandedH = isHovered ? cardH + 26 : cardH;

          return (
            <motion.g
              key={stage.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
              style={{ cursor: 'default' }}
            >
              {/* Card background */}
              <rect x={cardX} y={cy} width={cardW} height={expandedH} rx={6}
                fill={isCurrent ? COLORS.highlight : 'white'}
                stroke={isCurrent ? COLORS.orange : stage.color}
                strokeWidth={isCurrent ? 2.5 : 1.2} />

              {/* Stage number badge */}
              <circle cx={cardX + 22} cy={cy + 26} r={14} fill={stage.color} />
              <text x={cardX + 22} y={cy + 30} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                {stage.num}
              </text>

              {/* Icon badge */}
              <rect x={cardX + 42} y={cy + 12} width={32} height={18} rx={3} fill={stage.color} fillOpacity={0.12} />
              <text x={cardX + 58} y={cy + 25} textAnchor="middle" fontSize="8" fontWeight="700"
                fill={stage.color} className="mono">
                {stage.icon}
              </text>

              {/* Stage name */}
              <text x={cardX + 82} y={cy + 18} fontSize="12" fontWeight="700" fill={COLORS.dark}>
                {stage.name[locale]}
              </text>

              {/* Transform description */}
              <text x={cardX + 82} y={cy + 33} fontSize="9" fill={COLORS.mid}>
                {stage.transform[locale]}
              </text>

              {/* Article links */}
              <g>
                {stage.articles.map((article, ai) => {
                  const ax = cardX + 82 + ai * Math.min(180, (cardW - 100) / stage.articles.length);
                  return (
                    <a key={article.slug} href={`${prefix}/articles/${article.slug}`}>
                      <text x={ax} y={cy + 46} fontSize="8" fill={COLORS.primary} fontWeight="500">
                        {article.title[locale]}
                      </text>
                    </a>
                  );
                })}
              </g>

              {/* Hover expansion: description */}
              {isHovered && (
                <text x={cardX + 82} y={cy + expandedH - 8} fontSize="8.5" fill={COLORS.mid}>
                  {stage.description[locale]}
                </text>
              )}

              {/* YOU ARE HERE badge for stage 8 */}
              {isCurrent && (
                <g>
                  <rect x={cardX + cardW - 100} y={cy + 4} width={90} height={18} rx={9}
                    fill={COLORS.orange} />
                  <text x={cardX + cardW - 55} y={cy + 16} textAnchor="middle" fontSize="8"
                    fontWeight="700" fill="white">
                    {t.youAreHere}
                  </text>
                </g>
              )}

              {/* Downward arrow between cards */}
              {i < STAGES.length - 1 && (
                <g>
                  <line x1={cardX + cardW / 2} y1={cy + expandedH + 1}
                    x2={cardX + cardW / 2} y2={cy + expandedH + cardGap - 1}
                    stroke={COLORS.light} strokeWidth={2} />
                  <polygon
                    points={`${cardX + cardW / 2 - 4},${cy + expandedH + cardGap - 5} ${cardX + cardW / 2},${cy + expandedH + cardGap - 1} ${cardX + cardW / 2 + 4},${cy + expandedH + cardGap - 5}`}
                    fill={COLORS.mid} />
                </g>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
