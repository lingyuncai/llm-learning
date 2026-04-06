// src/components/interactive/MatmulJourney.tsx
import StepNavigator from '../primitives/StepNavigator';
import { STACK_LAYERS } from './shared/stackData';
import { COLORS, FONTS } from './shared/colors';

// ---- Mini stack indicator (left side) ----
const MINI_W = 100;
const MINI_H = 180;
const MINI_LAYER_H = 18;
const MINI_GAP = 3;
const MINI_START_Y = (MINI_H - STACK_LAYERS.length * (MINI_LAYER_H + MINI_GAP)) / 2;

function MiniStack({ activeIndex }: { activeIndex: number }) {
  return (
    <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full h-full">
      {STACK_LAYERS.map((layer, i) => {
        const y = MINI_START_Y + i * (MINI_LAYER_H + MINI_GAP);
        const isActive = i === activeIndex;
        return (
          <g key={layer.id}>
            <rect x={4} y={y} width={MINI_W - 8}
              height={isActive ? MINI_LAYER_H + 4 : MINI_LAYER_H}
              rx={3}
              fill={isActive ? `${layer.color}30` : `${layer.color}10`}
              stroke={isActive ? layer.color : 'transparent'}
              strokeWidth={isActive ? 1.5 : 0}
            />
            <text x={MINI_W / 2} y={y + (isActive ? MINI_LAYER_H + 4 : MINI_LAYER_H) / 2 + 1}
              dominantBaseline="middle" textAnchor="middle"
              fontSize={isActive ? '8' : '6.5'}
              fontWeight={isActive ? '700' : '400'}
              fill={isActive ? layer.color : '#999'}
              fontFamily={FONTS.sans}>
              {layer.name.replace(' + Compiler + IR', '')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- Right-side illustrations (one per step) ----
const ILLUS_W = 320;
const ILLUS_H = 160;

/** Step 1: Computation graph with MatMul highlighted */
function IllusFramework({ locale }: { locale: 'zh' | 'en' }) {
  const t = locale === 'zh'
    ? { caption: 'model.forward() 执行计算图' }
    : { caption: 'model.forward() executes computation graph' };
  const nodes = [
    { x: 40,  y: 40,  label: 'Embedding',  hl: false },
    { x: 160, y: 40,  label: 'LayerNorm',   hl: false },
    { x: 160, y: 100, label: 'MatMul',      hl: true },
    { x: 280, y: 70,  label: 'BiasAdd',     hl: false },
  ];
  const edges = [[0,1],[1,2],[2,3]];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {edges.map(([a,b]) => (
        <line key={`${a}-${b}`}
          x1={nodes[a].x+30} y1={nodes[a].y}
          x2={nodes[b].x-30} y2={nodes[b].y}
          stroke="#cbd5e1" strokeWidth={1.5} />
      ))}
      {nodes.map((n,i) => (
        <g key={i}>
          <rect x={n.x-30} y={n.y-14} width={60} height={28} rx={6}
            fill={n.hl ? '#dbeafe' : '#f8fafc'}
            stroke={n.hl ? COLORS.primary : '#e2e8f0'}
            strokeWidth={n.hl ? 2 : 1} />
          <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight={n.hl ? '700' : '400'}
            fill={n.hl ? COLORS.primary : '#64748b'} fontFamily={FONTS.sans}>
            {n.label}
          </text>
        </g>
      ))}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 2: Graph optimizer fuses MatMul + BiasAdd */
function IllusGraphOpt({ locale }: { locale: 'zh' | 'en' }) {
  const t = locale === 'zh'
    ? { fusion: '✦ MatMul + BiasAdd → FusedMatMul', caption: '算子融合：减少 kernel 启动次数' }
    : { fusion: '✦ MatMul + BiasAdd → FusedMatMul', caption: 'Operator fusion: reduce kernel launches' };
  const nodes = [
    { x: 40,  y: 60, label: 'Embedding',     hl: false },
    { x: 160, y: 40, label: 'LayerNorm',      hl: false },
    { x: 260, y: 60, label: 'FusedMatMul',    hl: true },
  ];
  const edges = [[0,1],[1,2]];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {edges.map(([a,b]) => (
        <line key={`${a}-${b}`}
          x1={nodes[a].x+35} y1={nodes[a].y}
          x2={nodes[b].x-35} y2={nodes[b].y}
          stroke="#cbd5e1" strokeWidth={1.5} />
      ))}
      {nodes.map((n,i) => (
        <g key={i}>
          <rect x={n.x-35} y={n.y-14} width={70} height={28} rx={6}
            fill={n.hl ? '#dcfce7' : '#f8fafc'}
            stroke={n.hl ? COLORS.green : '#e2e8f0'}
            strokeWidth={n.hl ? 2 : 1} />
          <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight={n.hl ? '700' : '400'}
            fill={n.hl ? COLORS.green : '#64748b'} fontFamily={FONTS.sans}>
            {n.label}
          </text>
        </g>
      ))}
      <text x={200} y={100} textAnchor="middle" fontSize="9" fill={COLORS.green}
        fontFamily={FONTS.sans} fontWeight="600">
        {t.fusion}
      </text>
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 3: Operator Library — tiling diagram */
function IllusOperatorLib({ locale }: { locale: 'zh' | 'en' }) {
  const t = locale === 'zh'
    ? { matrixLabel: '大矩阵 A', blockLabel: 'Block', caption: '选择 tiling 策略，每个 tile → thread block' }
    : { matrixLabel: 'Large matrix A', blockLabel: 'Block', caption: 'Select tiling strategy, each tile → thread block' };
  // 2×2 tile grid on a matrix
  const matX = 60, matY = 15, matW = 80, matH = 80;
  const tileW = matW/2, tileH = matH/2;
  const tileColors = ['#dbeafe','#dcfce7','#fef3c7','#fce7f3'];
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {/* Big matrix */}
      <rect x={matX} y={matY} width={matW} height={matH}
        fill="none" stroke="#94a3b8" strokeWidth={1} />
      {[0,1].map(r => [0,1].map(c => (
        <rect key={`${r}${c}`}
          x={matX + c*tileW} y={matY + r*tileH}
          width={tileW} height={tileH}
          fill={tileColors[r*2+c]} stroke="#64748b" strokeWidth={0.5} />
      )))}
      <text x={matX+matW/2} y={matY+matH+14} textAnchor="middle" fontSize="8"
        fill="#64748b" fontFamily={FONTS.sans}>{t.matrixLabel}</text>

      {/* Arrow */}
      <text x={165} y={55} fontSize="16" fill="#94a3b8">→</text>

      {/* Tiles dispatched to thread blocks */}
      {[0,1,2,3].map(i => {
        const tx = 200 + (i%2)*60;
        const ty = 20 + Math.floor(i/2)*55;
        return (
          <g key={i}>
            <rect x={tx} y={ty} width={40} height={35} rx={4}
              fill={tileColors[i]} stroke="#64748b" strokeWidth={0.5} />
            <text x={tx+20} y={ty+20} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#1a1a2e" fontFamily={FONTS.mono}>
              {t.blockLabel} {i}
            </text>
          </g>
        );
      })}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 4: Kernel pseudo-code */
function IllusKernel({ locale }: { locale: 'zh' | 'en' }) {
  const lines = locale === 'zh'
    ? [
        '__global__ void matmul_tile(',
        '  float *A, float *B, float *C) {',
        '  int tile = blockIdx.x;',
        '  // 每个 block 处理一个 tile',
        '  for (int k = 0; k < K; k += TILE)',
        '    C[tile] += A[tile,k] * B[k,tile];',
        '}',
      ]
    : [
        '__global__ void matmul_tile(',
        '  float *A, float *B, float *C) {',
        '  int tile = blockIdx.x;',
        '  // each block processes one tile',
        '  for (int k = 0; k < K; k += TILE)',
        '    C[tile] += A[tile,k] * B[k,tile];',
        '}',
      ];
  const t = locale === 'zh'
    ? { caption: '每个 thread block 执行一份 tile 的计算' }
    : { caption: 'Each thread block executes computation for one tile' };
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      <rect x={10} y={5} width={ILLUS_W-20} height={ILLUS_H-20} rx={6}
        fill="#1e293b" />
      {lines.map((line, i) => (
        <text key={i} x={22} y={24 + i * 16} fontSize="9"
          fill={line.startsWith('//') || line.startsWith('  //') ? '#6b7280' : '#e2e8f0'}
          fontFamily={FONTS.mono}>
          {line}
        </text>
      ))}
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 5: Runtime — buffer + queue + dispatch */
function IllusRuntime({ locale }: { locale: 'zh' | 'en' }) {
  const buffers = [
    { x: 30,  label: 'buf A', color: '#dbeafe' },
    { x: 110, label: 'buf B', color: '#dcfce7' },
    { x: 190, label: 'buf C', color: '#fef3c7' },
  ];
  const t = locale === 'zh'
    ? {
        bufferLabel: 'GPU 显存 Buffer',
        queueLabel: 'Command Queue',
        queueItems: ['拷 A→GPU', '拷 B→GPU', 'dispatch kernel', '拷 C→CPU'],
        caption: 'allocate buffer → 入队命令 → dispatch kernel',
      }
    : {
        bufferLabel: 'GPU Memory Buffer',
        queueLabel: 'Command Queue',
        queueItems: ['copy A→GPU', 'copy B→GPU', 'dispatch kernel', 'copy C→CPU'],
        caption: 'allocate buffer → enqueue commands → dispatch kernel',
      };
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {/* Buffers */}
      {buffers.map(b => (
        <g key={b.label}>
          <rect x={b.x} y={15} width={60} height={35} rx={4}
            fill={b.color} stroke="#64748b" strokeWidth={1} />
          <text x={b.x+30} y={36} textAnchor="middle" fontSize="9"
            fill="#1a1a2e" fontFamily={FONTS.mono}>{b.label}</text>
        </g>
      ))}
      <text x={150} y={8} textAnchor="middle" fontSize="8" fill="#94a3b8"
        fontFamily={FONTS.sans}>{t.bufferLabel}</text>

      {/* Command Queue arrow */}
      <line x1={30} y1={75} x2={290} y2={75}
        stroke={COLORS.purple} strokeWidth={2} markerEnd="url(#arrowPurple)" />
      <text x={160} y={70} textAnchor="middle" fontSize="8" fill={COLORS.purple}
        fontFamily={FONTS.sans} fontWeight="600">{t.queueLabel}</text>

      {/* Queue items */}
      {t.queueItems.map((item, i) => (
        <g key={i}>
          <rect x={20+i*70} y={85} width={62} height={22} rx={3}
            fill={i===2 ? '#ede9fe' : '#f1f5f9'} stroke={i===2 ? COLORS.purple : '#cbd5e1'}
            strokeWidth={1} />
          <text x={20+i*70+31} y={99} textAnchor="middle" fontSize="7"
            fill={i===2 ? COLORS.purple : '#64748b'} fontFamily={FONTS.sans}>
            {item}
          </text>
        </g>
      ))}

      {/* Arrow marker def */}
      <defs>
        <marker id="arrowPurple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.purple} />
        </marker>
      </defs>

      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 6: Driver — IR → compiler → ISA */
function IllusDriver({ locale }: { locale: 'zh' | 'en' }) {
  const boxes = locale === 'zh'
    ? [
        { x: 30,  w: 70, label: 'PTX / SPIR-V',  sub: '(IR 字节码)', color: '#fef3c7' },
        { x: 140, w: 60, label: '编译器',          sub: '(Driver 内置)', color: '#e2e8f0' },
        { x: 240, w: 70, label: 'SASS / Gen ISA',   sub: '(硬件指令)', color: '#dcfce7' },
      ]
    : [
        { x: 30,  w: 70, label: 'PTX / SPIR-V',  sub: '(IR bytecode)', color: '#fef3c7' },
        { x: 140, w: 60, label: 'Compiler',          sub: '(Driver built-in)', color: '#e2e8f0' },
        { x: 240, w: 70, label: 'SASS / Gen ISA',   sub: '(HW instruction)', color: '#dcfce7' },
      ];
  const t = locale === 'zh'
    ? { jit: 'JIT 编译 (运行时) 或 AOT (构建时)', caption: 'Driver 将 IR 编译为硬件可执行的 ISA' }
    : { jit: 'JIT compilation (runtime) or AOT (build time)', caption: 'Driver compiles IR to hardware-executable ISA' };
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={30} width={b.w} height={50} rx={6}
            fill={b.color} stroke="#64748b" strokeWidth={1} />
          <text x={b.x+b.w/2} y={50} textAnchor="middle" fontSize="9"
            fontWeight="600" fill="#1a1a2e" fontFamily={FONTS.sans}>{b.label}</text>
          <text x={b.x+b.w/2} y={65} textAnchor="middle" fontSize="7"
            fill="#64748b" fontFamily={FONTS.sans}>{b.sub}</text>
        </g>
      ))}
      {/* Arrows between boxes */}
      <line x1={102} y1={55} x2={138} y2={55} stroke="#64748b" strokeWidth={1.5}
        markerEnd="url(#arrowGray)" />
      <line x1={202} y1={55} x2={238} y2={55} stroke="#64748b" strokeWidth={1.5}
        markerEnd="url(#arrowGray)" />

      <text x={160} y={105} textAnchor="middle" fontSize="9" fill={COLORS.orange}
        fontFamily={FONTS.sans} fontWeight="600">
        {t.jit}
      </text>

      <defs>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="#64748b" />
        </marker>
      </defs>
      <text x={ILLUS_W/2} y={ILLUS_H-8} textAnchor="middle" fontSize="8"
        fill="#94a3b8" fontFamily={FONTS.sans}>{t.caption}</text>
    </svg>
  );
}

/** Step 7: Hardware — SM/EU parallel execution */
function IllusHardware({ locale }: { locale: 'zh' | 'en' }) {
  const t = locale === 'zh'
    ? { dieLabel: 'GPU Die', result: '结果写回显存' }
    : { dieLabel: 'GPU Die', result: 'Result written back to memory' };
  const smCount = 6;
  const smW = 38, smH = 50, gap = 8;
  const totalW = smCount * (smW + gap) - gap;
  const startX = (ILLUS_W - totalW) / 2;
  return (
    <svg viewBox={`0 0 ${ILLUS_W} ${ILLUS_H}`} className="w-full">
      <text x={ILLUS_W/2} y={14} textAnchor="middle" fontSize="9" fill="#64748b"
        fontFamily={FONTS.sans}>{t.dieLabel}</text>
      <rect x={startX-10} y={20} width={totalW+20} height={smH+20} rx={6}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
      {Array.from({length: smCount}).map((_, i) => (
        <g key={i}>
          <rect x={startX + i*(smW+gap)} y={28} width={smW} height={smH} rx={4}
            fill={i < 4 ? '#dbeafe' : '#f8fafc'}
            stroke={i < 4 ? COLORS.primary : '#d1d5db'}
            strokeWidth={i < 4 ? 1.5 : 1} />
          <text x={startX + i*(smW+gap) + smW/2} y={48}
            textAnchor="middle" fontSize="7" fill={i < 4 ? COLORS.primary : '#94a3b8'}
            fontFamily={FONTS.mono} fontWeight="600">
            SM {i}
          </text>
          {i < 4 && (
            <text x={startX + i*(smW+gap) + smW/2} y={62}
              textAnchor="middle" fontSize="6" fill={COLORS.primary}
              fontFamily={FONTS.mono}>
              warp×32
            </text>
          )}
        </g>
      ))}
      {/* Result arrow */}
      <line x1={ILLUS_W/2} y1={100} x2={ILLUS_W/2} y2={120}
        stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#arrowGreen)" />
      <text x={ILLUS_W/2} y={135} textAnchor="middle" fontSize="8" fill={COLORS.green}
        fontFamily={FONTS.sans} fontWeight="600">{t.result}</text>
      <defs>
        <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.green} />
        </marker>
      </defs>
    </svg>
  );
}

// ---- Step definitions ----
const STEP_ILLUSTRATIONS = [
  IllusFramework,
  IllusGraphOpt,
  IllusOperatorLib,
  IllusKernel,
  IllusRuntime,
  IllusDriver,
  IllusHardware,
];

const STEP_LAYER_INDICES = [0, 1, 2, 3, 4, 5, 6]; // maps step → STACK_LAYERS index

export default function MatmulJourney({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const STEP_TITLES = locale === 'zh'
    ? [
        '1. Framework: model.forward() 遇到 MatMul',
        '2. Graph Optimizer: MatMul + BiasAdd 融合',
        '3. Operator Library: 选择 tiling 策略',
        '4. Kernel: 每个 thread block 处理一个 tile',
        '5. Runtime: allocate buffer → dispatch kernel',
        '6. Driver: IR → JIT 编译 → 硬件 ISA',
        '7. Hardware: SM/EU 并行执行 warp',
      ]
    : [
        '1. Framework: model.forward() encounters MatMul',
        '2. Graph Optimizer: MatMul + BiasAdd fusion',
        '3. Operator Library: select tiling strategy',
        '4. Kernel: each thread block processes one tile',
        '5. Runtime: allocate buffer → dispatch kernel',
        '6. Driver: IR → JIT compile → hardware ISA',
        '7. Hardware: SM/EU parallel execution of warps',
      ];

  const steps = STEP_TITLES.map((title, i) => {
    const Illustration = STEP_ILLUSTRATIONS[i];
    return {
      title,
      content: (
        <div className="flex gap-2 items-stretch" style={{ minHeight: 200 }}>
          {/* Left: mini stack */}
          <div className="flex-shrink-0" style={{ width: 100 }}>
            <MiniStack activeIndex={STEP_LAYER_INDICES[i]} />
          </div>
          {/* Right: illustration */}
          <div className="flex-1 border border-gray-200 rounded-lg bg-white p-1 flex items-center">
            <Illustration locale={locale} />
          </div>
        </div>
      ),
    };
  });

  return <StepNavigator steps={steps} />;
}
