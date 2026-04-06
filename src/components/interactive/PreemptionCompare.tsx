import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function PreemptionCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '触发抢占：显存不足',
      scene: '场景：新高优先级请求到达，GPU 显存不足',
      runningRequest: 'Running 请求 A',
      kvCache: 'KV Cache',
      generated: '已生成 80% tokens',
      newRequest: '新请求 B (VIP)',
      needs: '需要 KV Cache',
      outOfMemory: 'GPU 显存不足!',
      mustPreempt: 'Scheduler 必须抢占请求 A 来腾出显存 — 但 A 的 KV Cache 不能丢？',
      twoStrategies: '两种策略：Swap（搬到 CPU）vs Recompute（丢弃重算）',
      step2Title: 'Swap：KV Cache 搬到 CPU',
      swapStrategy: 'Swap 策略：GPU → CPU → GPU',
      gpuMemory: 'GPU 显存',
      requestBRunning: '请求 B 运行中',
      aSpaceReleased: 'A 的空间已释放',
      pcieTransfer: 'PCIe 传输',
      cpuMemory: 'CPU 内存',
      aKvCache: 'A 的 KV Cache',
      fullySaved: '完整保存',
      restoreToGpu: '恢复时搬回 GPU',
      swapSummary: '无需重算 | PCIe 带宽是瓶颈（~32GB/s）| 适合：已生成大量 token 的请求',
      step3Title: 'Recompute：丢弃并重算',
      recomputeStrategy: 'Recompute 策略：丢弃 → 重新 Prefill',
      discardKvCache: '丢弃 KV Cache',
      aBlocks: 'A 的 20 blocks',
      immediatelyRelease: '立即释放显存',
      recomputeOnRestore: '恢复时重算',
      rerunPrefill: '重跑 Prefill',
      recomputeSummary: '无 PCIe 传输 | 浪费 prefill 计算 | 适合：生成较少 token 的请求（重算成本低）',
    },
    en: {
      step1Title: 'Trigger Preemption: Out of Memory',
      scene: 'Scenario: New high-priority request arrives, GPU memory insufficient',
      runningRequest: 'Running Request A',
      kvCache: 'KV Cache',
      generated: '80% tokens generated',
      newRequest: 'New Request B (VIP)',
      needs: 'Needs KV Cache',
      outOfMemory: 'GPU out of memory!',
      mustPreempt: 'Scheduler must preempt request A to free memory — but A\'s KV Cache cannot be lost?',
      twoStrategies: 'Two strategies: Swap (to CPU) vs Recompute (discard & recompute)',
      step2Title: 'Swap: KV Cache to CPU',
      swapStrategy: 'Swap Strategy: GPU → CPU → GPU',
      gpuMemory: 'GPU Memory',
      requestBRunning: 'Request B running',
      aSpaceReleased: 'A\'s space released',
      pcieTransfer: 'PCIe Transfer',
      cpuMemory: 'CPU Memory',
      aKvCache: 'A\'s KV Cache',
      fullySaved: 'Fully saved',
      restoreToGpu: 'Restore to GPU',
      swapSummary: 'No recomputation | PCIe bandwidth bottleneck (~32GB/s) | Suitable for: requests with many generated tokens',
      step3Title: 'Recompute: Discard & Recompute',
      recomputeStrategy: 'Recompute Strategy: Discard → Prefill Again',
      discardKvCache: 'Discard KV Cache',
      aBlocks: 'A\'s 20 blocks',
      immediatelyRelease: 'Immediate memory release',
      recomputeOnRestore: 'Recompute on restore',
      rerunPrefill: 'Rerun Prefill',
      recomputeSummary: 'No PCIe transfer | Wastes prefill computation | Suitable for: requests with few generated tokens (low recompute cost)',
    },
  }[locale];
  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.scene}</text>
          <rect x={60} y={50} width={200} height={80} rx={6}
            fill={COLORS.green} opacity={0.15} stroke={COLORS.green} strokeWidth="2" />
          <text x={160} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.runningRequest}</text>
          <text x={160} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.kvCache}: 2GB (20 blocks)</text>
          <text x={160} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.generated}</text>
          <text x={330} y={85} fontSize="18" fill={COLORS.red}>⚡</text>
          <rect x={360} y={50} width={170} height={80} rx={6}
            fill={COLORS.orange} opacity={0.15} stroke={COLORS.orange} strokeWidth="2" />
          <text x={445} y={75} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.newRequest}</text>
          <text x={445} y={95} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.needs}: 3GB</text>
          <text x={445} y={115} textAnchor="middle" fontSize="9"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.outOfMemory}</text>
          <text x={W / 2} y={160} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.mustPreempt}
          </text>
          <text x={W / 2} y={180} textAnchor="middle" fontSize="10" fontWeight="600"
            fill={COLORS.primary} fontFamily={FONTS.sans}>
            {t.twoStrategies}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.swapStrategy}</text>
          <rect x={40} y={50} width={140} height={90} rx={6}
            fill={COLORS.green} opacity={0.1} stroke={COLORS.green} strokeWidth="1.5" />
          <text x={110} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.gpuMemory}</text>
          <text x={110} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.requestBRunning}</text>
          <text x={110} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.aSpaceReleased}</text>
          <text x={230} y={80} textAnchor="middle" fontSize="9" fontWeight="600"
            fill={COLORS.orange} fontFamily={FONTS.sans}>{t.pcieTransfer}</text>
          <line x1={180} y1={95} x2={280} y2={95}
            stroke={COLORS.orange} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={110} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~500ms (2GB)</text>
          <rect x={290} y={50} width={140} height={90} rx={6}
            fill={COLORS.purple} opacity={0.1} stroke={COLORS.purple} strokeWidth="1.5" />
          <text x={360} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.purple} fontFamily={FONTS.sans}>{t.cpuMemory}</text>
          <text x={360} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.aKvCache}</text>
          <text x={360} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.fullySaved}</text>
          <line x1={280} y1={130} x2={180} y2={130}
            stroke={COLORS.green} strokeWidth="2" strokeDasharray="5,3" />
          <text x={230} y={148} textAnchor="middle" fontSize="8"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t.restoreToGpu}</text>
          <rect x={60} y={165} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={183} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.swapSummary}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 200`} className="w-full">
          <text x={W / 2} y={22} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>{t.recomputeStrategy}</text>
          <rect x={40} y={50} width={150} height={80} rx={6}
            fill={COLORS.red} opacity={0.1} stroke={COLORS.red} strokeWidth="1.5" />
          <text x={115} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.red} fontFamily={FONTS.sans}>{t.discardKvCache}</text>
          <text x={115} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.aBlocks}</text>
          <text x={115} y={108} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.immediatelyRelease}</text>
          <text x={230} y={90} fontSize="14" fill={COLORS.mid}>→</text>
          <rect x={260} y={50} width={150} height={80} rx={6}
            fill={COLORS.orange} opacity={0.1} stroke={COLORS.orange} strokeWidth="1.5" />
          <text x={335} y={70} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={COLORS.orange} fontFamily={FONTS.sans}>{t.recomputeOnRestore}</text>
          <text x={335} y={90} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>{t.rerunPrefill}</text>
          <text x={335} y={108} textAnchor="middle" fontSize="8"
            fill={COLORS.red} fontFamily={FONTS.mono}>~200ms (prompt re-encode)</text>
          <rect x={60} y={145} width={W - 120} height={28} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={W / 2} y={163} textAnchor="middle" fontSize="9"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.recomputeSummary}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
