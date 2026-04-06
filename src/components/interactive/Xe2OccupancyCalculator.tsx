import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const Xe2OccupancyCalculator: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const [grfPerThread, setGrfPerThread] = useState(64);
  const [slmPerWorkgroup, setSlmPerWorkgroup] = useState(16);
  const [workgroupSize, setWorkgroupSize] = useState(128);

  const t = {
    zh: {
      title: 'Xe2 占用率计算器',
      grfLabel: 'GRF per Thread',
      grfLimit: 'GRF 限制',
      threadsPerEU: 'threads/EU',
      maxGrf: 'max',
      slmLabel: 'SLM per Work-group',
      slmLimit: 'SLM 限制',
      workgroupsPerXecore: 'work-groups per Xe-core',
      workgroupSizeLabel: 'Work-group Size',
      threads: 'threads',
      resultTitle: '结果',
      actualThreads: '实际并发线程数/EU',
      occupancy: '占用率',
      limitFactor: '限制因素',
      advice: '占用率优化建议:',
      lowOcc: ' 占用率较低，考虑减少 GRF 使用或 SLM 分配。',
      medOcc: ' 占用率中等，检查限制因素进行优化。',
      goodOcc: ' 占用率良好，硬件利用率较高。',
      constraints: 'Xe2 约束: 128 GRF/thread × 8 threads/EU, 64KB SLM/Xe-core, 16 EUs/Xe-core',
    },
    en: {
      title: 'Xe2 Occupancy Calculator',
      grfLabel: 'GRF per Thread',
      grfLimit: 'GRF Limit',
      threadsPerEU: 'threads/EU',
      maxGrf: 'max',
      slmLabel: 'SLM per Work-group',
      slmLimit: 'SLM Limit',
      workgroupsPerXecore: 'work-groups per Xe-core',
      workgroupSizeLabel: 'Work-group Size',
      threads: 'threads',
      resultTitle: 'Results',
      actualThreads: 'Actual Concurrent Threads/EU',
      occupancy: 'Occupancy',
      limitFactor: 'Limiting Factor',
      advice: 'Occupancy Optimization Advice:',
      lowOcc: ' Low occupancy, consider reducing GRF usage or SLM allocation.',
      medOcc: ' Medium occupancy, check limiting factor for optimization.',
      goodOcc: ' Good occupancy, hardware utilization is high.',
      constraints: 'Xe2 Constraints: 128 GRF/thread × 8 threads/EU, 64KB SLM/Xe-core, 16 EUs/Xe-core',
    },
  }[locale];

  // Xe2 hardware constraints
  const MAX_GRF_PER_EU = 128;
  const MAX_THREADS_PER_EU = 8;
  const MAX_SLM_PER_XECORE = 64; // KB
  const EUS_PER_XECORE = 16;

  // Calculate limits
  const grfLimitedThreads = Math.floor(MAX_GRF_PER_EU / grfPerThread);
  const threadLimitedThreads = MAX_THREADS_PER_EU;

  // SLM limit: how many work-groups can fit in one Xe-core
  const workgroupsPerXecore =
    slmPerWorkgroup > 0 ? Math.floor(MAX_SLM_PER_XECORE / slmPerWorkgroup) : Infinity;
  const threadsFromSLM =
    workgroupsPerXecore !== Infinity ? workgroupsPerXecore * workgroupSize : Infinity;
  const slmLimitedThreadsPerEU =
    threadsFromSLM !== Infinity ? Math.floor(threadsFromSLM / EUS_PER_XECORE) : Infinity;

  // Actual concurrent threads per EU
  const actualThreadsPerEU = Math.min(
    grfLimitedThreads,
    threadLimitedThreads,
    slmLimitedThreadsPerEU
  );

  // Occupancy percentage (relative to max 8 threads/EU)
  const occupancy = Math.round((actualThreadsPerEU / MAX_THREADS_PER_EU) * 100);

  // Determine limiting factor
  let limitingFactor = 'None';
  if (actualThreadsPerEU === grfLimitedThreads && grfLimitedThreads < threadLimitedThreads) {
    limitingFactor = 'GRF Register';
  } else if (
    slmLimitedThreadsPerEU !== Infinity &&
    actualThreadsPerEU === slmLimitedThreadsPerEU
  ) {
    limitingFactor = 'SLM (Shared Local Memory)';
  } else if (actualThreadsPerEU === threadLimitedThreads) {
    limitingFactor = 'Thread Slots';
  }

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* GRF Slider */}
        <text x="40" y="60" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.grfLabel}: {grfPerThread}
        </text>
        <foreignObject x="40" y="70" width="500" height="30">
          <input
            type="range"
            min="32"
            max="128"
            step="4"
            value={grfPerThread}
            onChange={(e) => setGrfPerThread(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </foreignObject>
        <text x="40" y="115" fontSize="9" fill={COLORS.mid}>
          {t.grfLimit}: {grfLimitedThreads} {t.threadsPerEU} ({t.maxGrf} {MAX_GRF_PER_EU} GRF per EU)
        </text>

        {/* SLM Slider */}
        <text x="40" y="140" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.slmLabel}: {slmPerWorkgroup} KB
        </text>
        <foreignObject x="40" y="150" width="500" height="30">
          <input
            type="range"
            min="0"
            max="64"
            step="4"
            value={slmPerWorkgroup}
            onChange={(e) => setSlmPerWorkgroup(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </foreignObject>
        <text x="40" y="195" fontSize="9" fill={COLORS.mid}>
          {t.slmLimit}: {slmLimitedThreadsPerEU === Infinity ? '∞' : slmLimitedThreadsPerEU} {t.threadsPerEU}
          ({workgroupsPerXecore === Infinity ? '∞' : workgroupsPerXecore} {t.workgroupsPerXecore})
        </text>

        {/* Work-group Size Slider */}
        <text x="40" y="220" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
          {t.workgroupSizeLabel}: {workgroupSize} {t.threads}
        </text>
        <foreignObject x="40" y="230" width="500" height="30">
          <input
            type="range"
            min="8"
            max="512"
            step="8"
            value={workgroupSize}
            onChange={(e) => setWorkgroupSize(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </foreignObject>

        {/* Results */}
        <rect x="40" y="275" width="500" height="70" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1.5" />

        <text x="290" y="295" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.dark}>
          {t.resultTitle}
        </text>

        <text x="60" y="315" fontSize="11" fill={COLORS.dark}>
          {t.actualThreads}: <tspan fontWeight="bold" fill={COLORS.primary}>{actualThreadsPerEU}</tspan> / {MAX_THREADS_PER_EU}
        </text>

        <text x="60" y="332" fontSize="11" fill={COLORS.dark}>
          {t.occupancy}: <tspan fontWeight="bold" fill={occupancy >= 75 ? COLORS.green : occupancy >= 50 ? COLORS.orange : COLORS.red}>{occupancy}%</tspan>
        </text>

        <text x="350" y="315" fontSize="11" fill={COLORS.dark}>
          {t.limitFactor}:
        </text>
        <text x="350" y="332" fontSize="11" fontWeight="bold" fill={COLORS.orange}>
          {limitingFactor}
        </text>
      </svg>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>{t.advice}</strong>
          {occupancy < 50 && t.lowOcc}
          {occupancy >= 50 && occupancy < 75 && t.medOcc}
          {occupancy >= 75 && t.goodOcc}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {t.constraints}
        </p>
      </div>
    </div>
  );
};

export default Xe2OccupancyCalculator;
