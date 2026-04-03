// src/components/interactive/WarpExecutionAnimation.tsx
// Step animation: warp SIMT execution + divergence demo
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const THREAD_COUNT = 32;
const COLS = 16;
const CELL = 22;
const GAP = 2;

type ThreadState = 'active' | 'masked' | 'idle';

function ThreadGrid({ states, label }: { states: ThreadState[]; label: string }) {
  const rows = Math.ceil(THREAD_COUNT / COLS);
  const w = COLS * (CELL + GAP) + GAP;
  const h = rows * (CELL + GAP) + GAP;

  const colorMap: Record<ThreadState, { fill: string; stroke: string; text: string }> = {
    active: { fill: '#dbeafe', stroke: COLORS.primary, text: COLORS.primary },
    masked: { fill: '#f3f4f6', stroke: '#d1d5db', text: '#9ca3af' },
    idle: { fill: '#fee2e2', stroke: COLORS.red, text: COLORS.red },
  };

  return (
    <div className="mb-3">
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {states.map((s, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = GAP + col * (CELL + GAP);
          const y = GAP + row * (CELL + GAP);
          const c = colorMap[s];
          return (
            <g key={i}>
              <rect x={x} y={y} width={CELL} height={CELL} rx={3}
                fill={c.fill} stroke={c.stroke} strokeWidth={1} />
              <text x={x + CELL / 2} y={y + CELL / 2 + 1} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fill={c.text}
                fontFamily={FONTS.mono}>
                {i}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend() {
  const items = [
    { color: '#dbeafe', border: COLORS.primary, label: '活跃' },
    { color: '#f3f4f6', border: '#d1d5db', label: '被 mask（等待）' },
  ];
  return (
    <div className="flex gap-4 mt-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3.5 h-3.5 rounded" style={{ background: it.color, border: `1.5px solid ${it.border}` }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

export default function WarpExecutionAnimation() {
  const allActive: ThreadState[] = Array(32).fill('active');

  // Even threads take if-branch, odd threads take else-branch
  const ifActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 === 0 ? 'active' : 'masked');
  const elseActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 !== 0 ? 'active' : 'masked');

  const steps = [
    {
      title: '正常执行：32 线程齐步走',
      content: (
        <div>
          <p className="text-sm mb-3">
            一个 <strong>Warp</strong> 包含 32 个线程，执行<strong>同一条指令</strong>（SIMT）。
            所有线程同步执行 <code>z[i] = x[i] + y[i]</code>。
          </p>
          <ThreadGrid states={allActive} label="Warp 0 — 所有线程执行 z[i] = x[i] + y[i]" />
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
            32 个线程全部活跃，硬件效率 100%
          </div>
          <Legend />
        </div>
      ),
    },
    {
      title: '分支发散 Pass 1：偶数线程执行 if',
      content: (
        <div>
          <p className="text-sm mb-3">
            遇到 <code>if (threadIdx.x % 2 == 0)</code> 分支。偶数线程走 if 路径，
            <strong>奇数线程被 mask 掉</strong>（灰色），硬件仍然发射指令但这些线程不写结果。
          </p>
          <ThreadGrid states={ifActive} label="Pass 1 — if 分支：偶数线程活跃" />
          <div className="p-3 bg-amber-50 rounded text-xs text-amber-800">
            只有 16/32 线程做有效工作，硬件效率 50%
          </div>
          <Legend />
        </div>
      ),
    },
    {
      title: '分支发散 Pass 2：奇数线程执行 else',
      content: (
        <div>
          <p className="text-sm mb-3">
            if 路径执行完后，<strong>串行执行 else 路径</strong>。现在奇数线程活跃，偶数线程被 mask。
            两条路径<strong>总时间 = if 时间 + else 时间</strong>（不是并行！）。
          </p>
          <ThreadGrid states={elseActive} label="Pass 2 — else 分支：奇数线程活跃" />
          <div className="p-3 bg-red-50 rounded text-xs text-red-800">
            Warp Divergence：本该 1 次完成的工作，需要 2 个 pass 串行执行。
            这就是为什么 GPU 代码要尽量避免分支。
          </div>
          <Legend />
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
