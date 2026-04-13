import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface HardwarePreset {
  name: string;
  smem_per_sm: number;
  regs_per_sm: number;
  max_warps_per_sm: number;
  max_threads_per_block: number;
  smem_banks: number;
}

interface TileAnalysis {
  smem_usage: number;
  regs_per_thread: number;
  occupancy: number;
  feasible: boolean;
  bottleneck: 'smem' | 'register' | 'occupancy' | 'none';
  threads_per_block: number;
  warps_per_block: number;
  blocks_per_sm: number;
  active_warps: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const PRESETS: Record<string, HardwarePreset> = {
  A100: { name: 'A100', smem_per_sm: 166912, regs_per_sm: 65536, max_warps_per_sm: 64, max_threads_per_block: 1024, smem_banks: 32 },
  H100: { name: 'H100', smem_per_sm: 233472, regs_per_sm: 65536, max_warps_per_sm: 64, max_threads_per_block: 1024, smem_banks: 32 },
};

/* ─── Logic ─── */

function analyzeTile(hw: HardwarePreset, blockM: number, blockN: number, blockK: number, numStages: number, elemSize: number): TileAnalysis {
  const smem_usage = (blockM * blockK + blockK * blockN) * elemSize * numStages;
  const threads_per_block = Math.min(hw.max_threads_per_block, Math.max(32, Math.floor((blockM * blockN) / 4)));
  const warps_per_block = Math.ceil(threads_per_block / 32);
  const blocks_per_sm = smem_usage > 0 ? Math.max(0, Math.floor(hw.smem_per_sm / smem_usage)) : 0;
  const active_warps = Math.min(blocks_per_sm * warps_per_block, hw.max_warps_per_sm);
  const occupancy = hw.max_warps_per_sm > 0 ? active_warps / hw.max_warps_per_sm : 0;
  const regs_per_thread = Math.ceil((blockM * blockN / threads_per_block) + 32);
  const feasible = smem_usage <= hw.smem_per_sm && regs_per_thread <= 255;
  const bottleneck = smem_usage > hw.smem_per_sm ? 'smem' : regs_per_thread > 255 ? 'register' : occupancy < 0.25 ? 'occupancy' : 'none';
  return { smem_usage, regs_per_thread, occupancy, feasible, bottleneck, threads_per_block, warps_per_block, blocks_per_sm, active_warps };
}

/* ─── Component ─── */

export default function TileSizeCalculator({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'Tile Size 约束计算器',
      blockM: 'BLOCK_M',
      blockN: 'BLOCK_N',
      blockK: 'BLOCK_K',
      stages: 'Stages',
      elemSize: 'Elem Size',
      smemGauge: 'Shared Memory 使用',
      regGauge: 'Register 压力',
      occGauge: 'Occupancy',
      feasible: '✓ 可行',
      infeasible: '✗ 不可行',
      bottlenecks: {
        smem: 'Shared Memory 超出限制',
        register: 'Register 超出 255 上限',
        occupancy: 'Occupancy 过低 (<25%)',
        none: '所有约束满足',
      },
      formula: '公式',
      advanced: '高级参数',
    },
    en: {
      title: 'Tile Size Constraint Calculator',
      blockM: 'BLOCK_M',
      blockN: 'BLOCK_N',
      blockK: 'BLOCK_K',
      stages: 'Stages',
      elemSize: 'Elem Size',
      smemGauge: 'Shared Memory Usage',
      regGauge: 'Register Pressure',
      occGauge: 'Occupancy',
      feasible: '✓ Feasible',
      infeasible: '✗ Infeasible',
      bottlenecks: {
        smem: 'Shared Memory exceeds limit',
        register: 'Registers exceed 255 limit',
        occupancy: 'Occupancy too low (<25%)',
        none: 'All constraints satisfied',
      },
      formula: 'Formula',
      advanced: 'Advanced',
    },
  }[locale]!;

  const [hwKey, setHwKey] = useState<'A100' | 'H100'>('A100');
  const [blockM, setBlockM] = useState(128);
  const [blockN, setBlockN] = useState(128);
  const [blockK, setBlockK] = useState(32);
  const [numStages, setNumStages] = useState(2);
  const [elemSize, setElemSize] = useState(2); // FP16 = 2 bytes
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hw = PRESETS[hwKey];
  const analysis = useMemo(
    () => analyzeTile(hw, blockM, blockN, blockK, numStages, elemSize),
    [hw, blockM, blockN, blockK, numStages, elemSize]
  );

  const smemKB = (analysis.smem_usage / 1024).toFixed(1);
  const hwSmemKB = (hw.smem_per_sm / 1024).toFixed(1);
  const smemRatio = Math.min(analysis.smem_usage / hw.smem_per_sm, 1.2);
  const regRatio = Math.min(analysis.regs_per_thread / 255, 1.2);
  const occPercent = (analysis.occupancy * 100).toFixed(0);

  function gaugeColor(ratio: number, invert = false): string {
    if (invert) {
      return ratio > 0.5 ? COLORS.green : ratio > 0.25 ? COLORS.orange : COLORS.red;
    }
    return ratio < 0.5 ? COLORS.green : ratio < 0.8 ? COLORS.orange : COLORS.red;
  }

  /* ── SVG +/- button helper ── */
  function renderPlusMinus(
    x: number, y: number, label: string, value: number,
    setValue: (v: number) => void, min: number, max: number, step: number,
    width = 200
  ) {
    const btnW = 28, btnH = 24;
    return (
      <g>
        <text x={x} y={y} fontSize="10.5" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
          {label}
        </text>
        {/* Minus button */}
        <g onClick={() => setValue(Math.max(min, value - step))} style={{ cursor: value > min ? 'pointer' : 'default' }}>
          <rect x={x + width - 130} y={y - 16} width={btnW} height={btnH} rx="4"
            fill={value > min ? COLORS.primary : COLORS.light}
            fillOpacity={value > min ? 0.1 : 0.5}
            stroke={value > min ? COLORS.primary : COLORS.light}
            strokeWidth="1"
          />
          <text x={x + width - 130 + btnW / 2} y={y - 2} textAnchor="middle"
            fontSize="14" fontWeight="700" fill={value > min ? COLORS.primary : COLORS.mid}>
            −
          </text>
        </g>
        {/* Value */}
        <text x={x + width - 68} y={y} textAnchor="middle"
          fontSize="14" fontWeight="700" fontFamily={FONTS.mono} fill={COLORS.dark}>
          {value}
        </text>
        {/* Plus button */}
        <g onClick={() => setValue(Math.min(max, value + step))} style={{ cursor: value < max ? 'pointer' : 'default' }}>
          <rect x={x + width - 40} y={y - 16} width={btnW} height={btnH} rx="4"
            fill={value < max ? COLORS.primary : COLORS.light}
            fillOpacity={value < max ? 0.1 : 0.5}
            stroke={value < max ? COLORS.primary : COLORS.light}
            strokeWidth="1"
          />
          <text x={x + width - 40 + btnW / 2} y={y - 2} textAnchor="middle"
            fontSize="14" fontWeight="700" fill={value < max ? COLORS.primary : COLORS.mid}>
            +
          </text>
        </g>
      </g>
    );
  }

  /* ── Gauge bar ── */
  function renderGauge(x: number, y: number, label: string, ratio: number, valueText: string, color: string) {
    const gw = 320, gh = 16;
    const clampedRatio = Math.min(ratio, 1);
    return (
      <g>
        <text x={x} y={y - 6} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {label}
        </text>
        <rect x={x} y={y} width={gw} height={gh} rx="4" fill={COLORS.light} />
        <motion.rect
          x={x} y={y} height={gh} rx="4"
          fill={color} fillOpacity={0.6}
          animate={{ width: gw * clampedRatio }}
          transition={{ duration: 0.4 }}
        />
        {ratio > 1 && (
          <rect x={x + gw - 2} y={y - 2} width={6} height={gh + 4} rx="2"
            fill={COLORS.red} fillOpacity={0.8}
          />
        )}
        <text x={x + gw + 8} y={y + 12} fontSize="10" fontFamily={FONTS.mono} fill={color} fontWeight="600">
          {valueText}
        </text>
      </g>
    );
  }

  const formulaResult = (blockM * blockK + blockK * blockN) * elemSize * numStages;

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 500" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Hardware preset tabs */}
        {Object.keys(PRESETS).map((key, i) => {
          const isActive = hwKey === key;
          return (
            <g key={key} onClick={() => setHwKey(key as 'A100' | 'H100')} style={{ cursor: 'pointer' }}>
              <rect x={30 + i * 100} y={38} width={85} height={26} rx="6"
                fill={isActive ? COLORS.primary : COLORS.bgAlt}
                fillOpacity={isActive ? 0.15 : 1}
                stroke={isActive ? COLORS.primary : COLORS.light}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={30 + i * 100 + 42} y={55} textAnchor="middle"
                fontSize="12" fontWeight={isActive ? '700' : '500'}
                fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
                {key}
              </text>
            </g>
          );
        })}

        {/* Left panel: Input controls */}
        <rect x={20} y={75} width={350} height={showAdvanced ? 260 : 185} rx="8"
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1"
        />

        {renderPlusMinus(35, 110, t.blockM, blockM, setBlockM, 16, 256, 16, 310)}
        {renderPlusMinus(35, 150, t.blockN, blockN, setBlockN, 16, 256, 16, 310)}
        {renderPlusMinus(35, 190, t.blockK, blockK, setBlockK, 8, 64, 8, 310)}

        {/* Advanced toggle */}
        <g onClick={() => setShowAdvanced(!showAdvanced)} style={{ cursor: 'pointer' }}>
          <text x={35} y={230} fontSize="10" fontWeight="600" fill={COLORS.primary}>
            {t.advanced} {showAdvanced ? '▲' : '▼'}
          </text>
        </g>

        {showAdvanced && (
          <>
            {renderPlusMinus(35, 265, t.stages, numStages, setNumStages, 1, 5, 1, 310)}
            {/* Elem size toggle */}
            <text x={35} y={305} fontSize="10.5" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {t.elemSize}
            </text>
            {['FP16 (2B)', 'FP32 (4B)'].map((label, i) => {
              const val = i === 0 ? 2 : 4;
              const isActive = elemSize === val;
              return (
                <g key={label} onClick={() => setElemSize(val)} style={{ cursor: 'pointer' }}>
                  <rect x={175 + i * 90} y={289} width={80} height={24} rx="4"
                    fill={isActive ? COLORS.primary : COLORS.bgAlt}
                    fillOpacity={isActive ? 0.15 : 1}
                    stroke={isActive ? COLORS.primary : COLORS.light}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <text x={175 + i * 90 + 40} y={305} textAnchor="middle"
                    fontSize="10" fontWeight={isActive ? '700' : '500'}
                    fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.mono}>
                    {label}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Right panel: Analysis results */}
        {renderGauge(410, 90, t.smemGauge, smemRatio, `${smemKB} KB / ${hwSmemKB} KB`, gaugeColor(smemRatio))}
        {renderGauge(410, 150, t.regGauge, regRatio, `${analysis.regs_per_thread} / 255`, gaugeColor(regRatio))}
        {renderGauge(410, 210, t.occGauge, analysis.occupancy, `${occPercent}% (${analysis.active_warps}/${hw.max_warps_per_sm} warps)`, gaugeColor(analysis.occupancy, true))}

        {/* Feasibility verdict */}
        <rect x={410} y={260} width={370} height={36} rx="6"
          fill={analysis.feasible ? COLORS.green : COLORS.red}
          fillOpacity={0.08}
          stroke={analysis.feasible ? COLORS.green : COLORS.red}
          strokeWidth="1.5" strokeOpacity={0.4}
        />
        <text x={425} y={283} fontSize="13" fontWeight="700"
          fill={analysis.feasible ? COLORS.green : COLORS.red}>
          {analysis.feasible ? t.feasible : t.infeasible}
        </text>
        <text x={530} y={283} fontSize="11" fill={COLORS.mid}>
          {t.bottlenecks[analysis.bottleneck]}
        </text>

        {/* Formula display */}
        <rect x={20} y={showAdvanced ? 350 : 280} width={760} height={showAdvanced ? 130 : 130} rx="6"
          fill={COLORS.dark} fillOpacity={0.03}
          stroke={COLORS.light} strokeWidth="1"
        />
        <text x={35} y={showAdvanced ? 372 : 302} fontSize="11" fontWeight="700" fill={COLORS.dark}>
          {t.formula}
        </text>
        <text x={35} y={showAdvanced ? 396 : 326} fontSize="11" fontFamily={FONTS.mono} fill={COLORS.primary}>
          SMEM = (BLOCK_M × BLOCK_K + BLOCK_K × BLOCK_N) × elem_size × num_stages
        </text>
        <text x={35} y={showAdvanced ? 416 : 346} fontSize="11" fontFamily={FONTS.mono} fill={COLORS.mid}>
          {`     = (${blockM}×${blockK} + ${blockK}×${blockN}) × ${elemSize} × ${numStages}`}
        </text>
        <text x={35} y={showAdvanced ? 436 : 366} fontSize="11" fontFamily={FONTS.mono} fill={COLORS.mid}>
          {`     = ${(blockM * blockK + blockK * blockN)} × ${elemSize * numStages}`}
          {` = ${formulaResult.toLocaleString()} bytes = ${(formulaResult / 1024).toFixed(1)} KB`}
        </text>

        {/* Regs formula */}
        <text x={35} y={showAdvanced ? 462 : 392} fontSize="11" fontFamily={FONTS.mono} fill={COLORS.primary}>
          Regs/thread ≈ (BLOCK_M × BLOCK_N / threads) + overhead
        </text>
        <text x={35} y={showAdvanced ? 482 : 412} fontSize="11" fontFamily={FONTS.mono} fill={COLORS.mid}>
          {`            ≈ (${blockM}×${blockN} / ${analysis.threads_per_block}) + 32 = ${analysis.regs_per_thread}`}
        </text>
      </svg>
    </div>
  );
}
