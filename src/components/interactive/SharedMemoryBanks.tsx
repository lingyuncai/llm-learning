// src/components/interactive/SharedMemoryBanks.tsx
// StepNavigator: 32 shared memory banks, conflict-free vs bank conflict
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SVG_H = 340;
const NUM_BANKS = 32;
const BANK_W = 14;
const BANK_GAP = 2;
const BANKS_START_X = (W - NUM_BANKS * (BANK_W + BANK_GAP) + BANK_GAP) / 2;

export default function SharedMemoryBanks({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      stride1Title: 'Stride=1: 无冲突',
      stride2Title: 'Stride=2: Bank Conflict',
      mainTitle: 'Shared Memory: 32 Banks, 连续 4 字节映射到连续 Bank',
      stride1Subtitle: 'Thread i 访问地址 i × 4 bytes → Bank = i % 32',
      stride1Label: 'Stride=1: Thread i → Bank i (每个线程访问不同 Bank)',
      stride1Success: '无 Bank Conflict — 一拍完成所有 32 个访问',
      stride1Detail: '32 个线程各访问一个不同的 Bank，硬件并行服务所有请求',
      bankMapping: 'Bank 映射规则: Bank(addr) = (addr / 4) % 32 — 连续 4 字节在连续 Bank 中',
      stride2Subtitle: 'Bank = (i × 2) % 32 — 只使用偶数 Bank，两个线程共享一个 Bank',
      stride2Label: 'Stride=2: Thread 0 和 Thread 16 都访问 Bank 0, Thread 1 和 17 都访问 Bank 2 ...',
      stride2Conflict: '2-way Bank Conflict — 需要 2 拍才能完成 (效率减半)',
      stride2Detail: '每个 Bank 被 2 个线程同时请求，硬件必须串行化同一 Bank 的访问',
      solution: '解决方案: 用 padding (每行加一个 float 的偏移) 打破 stride 对齐 → 消除 bank conflict',
      solutionExample: '例: __shared__ float tile[32][33]; // 33 而非 32，错开 bank 映射',
      threads: 'Threads',
      banks: 'Banks',
    },
    en: {
      stride1Title: 'Stride=1: Conflict-Free',
      stride2Title: 'Stride=2: Bank Conflict',
      mainTitle: 'Shared Memory: 32 Banks, consecutive 4 bytes map to consecutive Banks',
      stride1Subtitle: 'Thread i accesses address i × 4 bytes → Bank = i % 32',
      stride1Label: 'Stride=1: Thread i → Bank i (each thread accesses a different Bank)',
      stride1Success: 'No Bank Conflict — all 32 accesses complete in one cycle',
      stride1Detail: '32 threads each access a different Bank, hardware serves all requests in parallel',
      bankMapping: 'Bank mapping: Bank(addr) = (addr / 4) % 32 — consecutive 4 bytes in consecutive Banks',
      stride2Subtitle: 'Bank = (i × 2) % 32 — only even Banks used, two threads share one Bank',
      stride2Label: 'Stride=2: Thread 0 and Thread 16 both access Bank 0, Thread 1 and 17 both access Bank 2 ...',
      stride2Conflict: '2-way Bank Conflict — requires 2 cycles (50% efficiency)',
      stride2Detail: 'Each Bank is requested by 2 threads, hardware must serialize accesses to the same Bank',
      solution: 'Solution: use padding (add one float offset per row) to break stride alignment → eliminate bank conflict',
      solutionExample: 'Example: __shared__ float tile[32][33]; // 33 instead of 32, stagger bank mapping',
      threads: 'Threads',
      banks: 'Banks',
    },
  }[locale];

  function StepSvg({ children }: { children: React.ReactNode }) {
    return (
      <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
        {children}
      </svg>
    );
  }

  function BankRow({ y, accessPattern, label, conflictBanks }: {
    y: number;
    accessPattern: (number | null)[];
    label: string;
    conflictBanks: Set<number>;
  }) {
    return (
      <g>
        <text x={W / 2} y={y - 28} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>

        {/* Thread row */}
        <text x={BANKS_START_X - 4} y={y + 8} textAnchor="end" fontSize="7"
          fill={COLORS.green} fontFamily={FONTS.sans}>{t.threads}</text>
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const x = BANKS_START_X + i * (BANK_W + BANK_GAP);
        const bank = accessPattern[i];
        const hasConflict = bank !== null && conflictBanks.has(bank);
        return (
          <g key={`t-${i}`}>
            <rect x={x} y={y} width={BANK_W} height={16} rx={1.5}
              fill={hasConflict ? '#fee2e2' : '#dcfce7'}
              stroke={hasConflict ? COLORS.red : COLORS.green} strokeWidth={0.5} />
            <text x={x + BANK_W / 2} y={y + 10} textAnchor="middle"
              fontSize="5.5" fill={hasConflict ? COLORS.red : COLORS.green}
              fontFamily={FONTS.mono}>T{i}</text>
          </g>
        );
      })}

      {/* Arrow lines from threads to banks */}
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const bank = accessPattern[i];
        if (bank === null) return null;
        const tx = BANKS_START_X + i * (BANK_W + BANK_GAP) + BANK_W / 2;
        const bx = BANKS_START_X + bank * (BANK_W + BANK_GAP) + BANK_W / 2;
        const hasConflict = conflictBanks.has(bank);
        return (
          <line key={`a-${i}`} x1={tx} y1={y + 16} x2={bx} y2={y + 38}
            stroke={hasConflict ? COLORS.red : COLORS.green}
            strokeWidth={0.6} opacity={0.6} />
        );
      })}

      {/* Bank row */}
      <text x={BANKS_START_X - 4} y={y + 48} textAnchor="end" fontSize="7"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.banks}</text>
      {Array.from({ length: NUM_BANKS }).map((_, i) => {
        const x = BANKS_START_X + i * (BANK_W + BANK_GAP);
        const hasConflict = conflictBanks.has(i);
        const accessCount = accessPattern.filter(b => b === i).length;
        return (
          <g key={`b-${i}`}>
            <rect x={x} y={y + 38} width={BANK_W} height={18} rx={1.5}
              fill={hasConflict ? '#fee2e2' : accessCount > 0 ? '#dbeafe' : '#f8fafc'}
              stroke={hasConflict ? COLORS.red : accessCount > 0 ? COLORS.primary : '#cbd5e1'}
              strokeWidth={hasConflict ? 1.5 : 0.5} />
            <text x={x + BANK_W / 2} y={y + 50} textAnchor="middle"
              fontSize="5" fill={hasConflict ? COLORS.red : '#64748b'}
              fontFamily={FONTS.mono}>B{i}</text>
          </g>
        );
      })}

      {/* Conflict marker */}
      {Array.from(conflictBanks).map(b => {
        const x = BANKS_START_X + b * (BANK_W + BANK_GAP) + BANK_W / 2;
        return (
          <text key={`c-${b}`} x={x} y={y + 68} textAnchor="middle"
            fontSize="7" fontWeight="700" fill={COLORS.red} fontFamily={FONTS.sans}>!</text>
        );
      })}
    </g>
  );
  }

  // stride=1: thread i accesses bank i (no conflict)
  const stride1Pattern = Array.from({ length: 32 }, (_, i) => i % 32);
  const stride1Conflicts = new Set<number>();

  // stride=2: thread i accesses address i*2 → bank = (i*2) % 32
  const stride2Pattern = Array.from({ length: 32 }, (_, i) => (i * 2) % 32);
  const stride2Conflicts = new Set<number>();
  // Find banks accessed by multiple threads
  const bankAccessCount = new Map<number, number>();
  stride2Pattern.forEach(b => bankAccessCount.set(b, (bankAccessCount.get(b) || 0) + 1));
  bankAccessCount.forEach((count, bank) => { if (count > 1) stride2Conflicts.add(bank); });

  const steps = [
    {
      title: t.stride1Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.mainTitle}
          </text>
          <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.stride1Subtitle}
          </text>

          <BankRow y={65} accessPattern={stride1Pattern}
            label={t.stride1Label}
            conflictBanks={stride1Conflicts} />

          <rect x={40} y={200} width={500} height={50} rx={5}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} />
          <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>
            {t.stride1Success}
          </text>
          <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.stride1Detail}
          </text>

          <rect x={40} y={265} width={500} height={40} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={288} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.bankMapping}
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.stride2Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Stride=2 {locale === 'zh' ? '访问模式' : 'Access Pattern'}: Thread i → {locale === 'zh' ? '地址' : 'address'} i × 8 bytes
          </text>
          <text x={W / 2} y={38} textAnchor="middle" fontSize="9" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.stride2Subtitle}
          </text>

          <BankRow y={65} accessPattern={stride2Pattern}
            label={t.stride2Label}
            conflictBanks={stride2Conflicts} />

          <rect x={40} y={200} width={500} height={50} rx={5}
            fill="#fee2e2" stroke={COLORS.red} strokeWidth={1} />
          <text x={W / 2} y={218} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>
            {t.stride2Conflict}
          </text>
          <text x={W / 2} y={236} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.stride2Detail}
          </text>

          <rect x={40} y={265} width={500} height={45} rx={5}
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={W / 2} y={282} textAnchor="middle" fontSize="8" fill={COLORS.dark}
            fontFamily={FONTS.sans}>
            {t.solution}
          </text>
          <text x={W / 2} y={298} textAnchor="middle" fontSize="8" fill="#64748b"
            fontFamily={FONTS.sans}>
            {t.solutionExample}
          </text>
        </StepSvg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
