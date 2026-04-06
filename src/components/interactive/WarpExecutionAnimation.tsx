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

function Legend({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: [
      { color: '#dbeafe', border: COLORS.primary, label: '活跃' },
      { color: '#f3f4f6', border: '#d1d5db', label: '被 mask（等待）' },
    ],
    en: [
      { color: '#dbeafe', border: COLORS.primary, label: 'Active' },
      { color: '#f3f4f6', border: '#d1d5db', label: 'Masked (waiting)' },
    ],
  }[locale];
  return (
    <div className="flex gap-4 mt-2">
      {t.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3.5 h-3.5 rounded" style={{ background: it.color, border: `1.5px solid ${it.border}` }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

export default function WarpExecutionAnimation({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const allActive: ThreadState[] = Array(32).fill('active');

  // Even threads take if-branch, odd threads take else-branch
  const ifActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 === 0 ? 'active' : 'masked');
  const elseActive: ThreadState[] = Array.from({ length: 32 }, (_, i) => i % 2 !== 0 ? 'active' : 'masked');

  const t = {
    zh: {
      step1Title: '正常执行：32 线程齐步走',
      step1P: '一个 Warp 包含 32 个线程，执行同一条指令（SIMT）。所有线程同步执行',
      step1Label: 'Warp 0 — 所有线程执行 z[i] = x[i] + y[i]',
      step1Insight: '32 个线程全部活跃，硬件效率 100%',
      step2Title: '分支发散 Pass 1：偶数线程执行 if',
      step2P: '遇到分支。偶数线程走 if 路径，奇数线程被 mask 掉（灰色），硬件仍然发射指令但这些线程不写结果。',
      step2Label: 'Pass 1 — if 分支：偶数线程活跃',
      step2Insight: '只有 16/32 线程做有效工作，硬件效率 50%',
      step3Title: '分支发散 Pass 2：奇数线程执行 else',
      step3P: 'if 路径执行完后，串行执行 else 路径。现在奇数线程活跃，偶数线程被 mask。两条路径总时间 = if 时间 + else 时间（不是并行！）。',
      step3Label: 'Pass 2 — else 分支：奇数线程活跃',
      step3Insight: 'Warp Divergence：本该 1 次完成的工作，需要 2 个 pass 串行执行。这就是为什么 GPU 代码要尽量避免分支。',
    },
    en: {
      step1Title: 'Normal Execution: 32 Threads in Lockstep',
      step1P: 'A Warp contains 32 threads executing the same instruction (SIMT). All threads synchronously execute',
      step1Label: 'Warp 0 — All threads execute z[i] = x[i] + y[i]',
      step1Insight: '32 threads all active, hardware efficiency 100%',
      step2Title: 'Branch Divergence Pass 1: Even Threads Execute if',
      step2P: 'Branch encountered. Even threads take if path, odd threads are masked (gray). Hardware still issues instructions but masked threads don\'t write results.',
      step2Label: 'Pass 1 — if branch: even threads active',
      step2Insight: 'Only 16/32 threads do useful work, hardware efficiency 50%',
      step3Title: 'Branch Divergence Pass 2: Odd Threads Execute else',
      step3P: 'After if path completes, else path executes serially. Now odd threads active, even masked. Total time = if time + else time (not parallel!).',
      step3Label: 'Pass 2 — else branch: odd threads active',
      step3Insight: 'Warp Divergence: work that should take 1 pass requires 2 serial passes. This is why GPU code should avoid branches.',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step1P} <code>z[i] = x[i] + y[i]</code>。
          </p>
          <ThreadGrid states={allActive} label={t.step1Label} />
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
            {t.step1Insight}
          </div>
          <Legend locale={locale} />
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step2P}
          </p>
          <ThreadGrid states={ifActive} label={t.step2Label} />
          <div className="p-3 bg-amber-50 rounded text-xs text-amber-800">
            {t.step2Insight}
          </div>
          <Legend locale={locale} />
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm mb-3">
            {t.step3P}
          </p>
          <ThreadGrid states={elseActive} label={t.step3Label} />
          <div className="p-3 bg-red-50 rounded text-xs text-red-800">
            {t.step3Insight}
          </div>
          <Legend locale={locale} />
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} locale={locale} />;
}
