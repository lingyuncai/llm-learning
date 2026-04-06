import React, { useState } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface GemmTilingHierarchyProps {
  locale?: 'zh' | 'en';
}

const GemmTilingHierarchy: React.FC<GemmTilingHierarchyProps> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      step1Title: '完整矩阵',
      step2Title: 'Global Tile 划分',
      tile256: '256×256 tile',
      perTile: '每个 tile = 1 work-group',
      matrixC: '矩阵 C (M × N)',
      globalMemory: 'Global 内存',
      fullMatrix: '完整矩阵',
      dividedInto: '划分为',
      tiles256x256: '256×256 tiles',
      step3Title: 'Work-group Tile',
      workgroupTile: '256×256 Work-group Tile',
      subgroupTile: '32×64 Sub-group Tile',
      storedInSLM: '存储在 SLM (Shared Local Memory)',
      eachSubgroup: '每个 sub-group 负责一个 tile',
      workgroupContains: 'Work-group 包含多个 sub-groups',
      step4Title: 'Sub-group → Register Tile',
      subgroup32x64: '32×64 Sub-group',
      registerTile: '8×16 Register Tile',
      storedInGRF: '存储在 GRF (General Register File)',
      xmxOp: '每个 register tile → 一次 XMX 操作',
      minCompute: '最小计算单元，直接由 XMX 引擎处理',
      int8Ops: 'INT8: 8×16×16 = 2048 ops/cycle',
      step5Title: '数据流总结',
      globalMemoryLabel: 'Global Memory',
      tiles256Label: '256×256 tiles',
      slmLabel: 'SLM',
      tiles32Label: '32×64 tiles',
      grfLabel: 'GRF',
      tiles8Label: '8×16 tiles',
      xmxLabel: 'XMX',
      compute: '计算',
      threeTier: '三层 Tiling 策略',
      hierarchy: 'Global (256×256) → SLM (32×64) → GRF (8×16)',
      maxReuse: '最大化内存复用，减少带宽压力',
      keyOpt: '关键优化目标',
      xmxUtil: '✓ XMX 利用率最大化 (对齐要求)',
      bankConflict: '✓ SLM bank conflict 最小化',
    },
    en: {
      step1Title: 'Full Matrix',
      step2Title: 'Global Tile Division',
      tile256: '256×256 tile',
      perTile: 'each tile = 1 work-group',
      matrixC: 'Matrix C (M × N)',
      globalMemory: 'Global Memory',
      fullMatrix: 'Full Matrix',
      dividedInto: 'divided into',
      tiles256x256: '256×256 tiles',
      step3Title: 'Work-group Tile',
      workgroupTile: '256×256 Work-group Tile',
      subgroupTile: '32×64 Sub-group Tile',
      storedInSLM: 'Stored in SLM (Shared Local Memory)',
      eachSubgroup: 'Each sub-group handles one tile',
      workgroupContains: 'Work-group contains multiple sub-groups',
      step4Title: 'Sub-group → Register Tile',
      subgroup32x64: '32×64 Sub-group',
      registerTile: '8×16 Register Tile',
      storedInGRF: 'Stored in GRF (General Register File)',
      xmxOp: 'Each register tile → one XMX operation',
      minCompute: 'Minimal compute unit, directly processed by XMX engine',
      int8Ops: 'INT8: 8×16×16 = 2048 ops/cycle',
      step5Title: 'Data Flow Summary',
      globalMemoryLabel: 'Global Memory',
      tiles256Label: '256×256 tiles',
      slmLabel: 'SLM',
      tiles32Label: '32×64 tiles',
      grfLabel: 'GRF',
      tiles8Label: '8×16 tiles',
      xmxLabel: 'XMX',
      compute: 'Compute',
      threeTier: 'Three-tier Tiling Strategy',
      hierarchy: 'Global (256×256) → SLM (32×64) → GRF (8×16)',
      maxReuse: 'Maximize memory reuse, reduce bandwidth pressure',
      keyOpt: 'Key Optimization Goals',
      xmxUtil: '✓ Maximize XMX utilization (alignment requirements)',
      bankConflict: '✓ Minimize SLM bank conflicts',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Matrix A */}
            <rect x="40" y="40" width="120" height="100" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" />
            <text x="100" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="18" fontWeight="600" fill={COLORS.dark}>A</text>
            <text x="100" y="155" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>(M × K)</text>

            {/* Multiply sign */}
            <text x="200" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="24" fill={COLORS.mid}>×</text>

            {/* Matrix B */}
            <rect x="240" y="40" width="120" height="100" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" />
            <text x="300" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="18" fontWeight="600" fill={COLORS.dark}>B</text>
            <text x="300" y="155" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>(K × N)</text>

            {/* Equals sign */}
            <text x="400" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="24" fill={COLORS.mid}>=</text>

            {/* Matrix C */}
            <rect x="440" y="40" width="120" height="100" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" />
            <text x="500" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="18" fontWeight="600" fill={COLORS.dark}>C</text>
            <text x="500" y="155" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>(M × N)</text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Matrix C with tiles */}
            <g>
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={180 + col * 50}
                    y={20 + row * 38}
                    width="48"
                    height="36"
                    fill={row === 1 && col === 2 ? COLORS.highlight : COLORS.bgAlt}
                    stroke={COLORS.primary}
                    strokeWidth="1.5"
                  />
                ))
              )}
              {/* Highlight tile */}
              <rect x={180 + 2 * 50} y={20 + 1 * 38} width="48" height="36" fill="none" stroke={COLORS.orange} strokeWidth="3" />
              <text x="380" y="55" textAnchor="start" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.dark}>← {t.tile256}</text>
              <text x="380" y="75" textAnchor="start" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>{t.perTile}</text>
              <text x="290" y="175" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.primary}>{t.matrixC}</text>
            </g>

            {/* Arrow and label */}
            <line x1="140" y1="90" x2="170" y2="90" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>
            <text x="70" y="60" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>{t.globalMemory}</text>
            <text x="70" y="80" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>{t.fullMatrix}</text>
            <text x="70" y="100" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>{t.dividedInto}</text>
            <text x="70" y="120" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>{t.tiles256x256}</text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Zoomed tile */}
            <rect x="40" y="20" width="160" height="140" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
            <text x="120" y="15" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.primary}>{t.workgroupTile}</text>

            {/* Sub-group tiles grid */}
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3, 4].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={45 + col * 30}
                  y={25 + row * 32}
                  width="28"
                  height="30"
                  fill={row === 1 && col === 2 ? COLORS.highlight : COLORS.bgAlt}
                  stroke={COLORS.dark}
                  strokeWidth="1"
                />
              ))
            )}

            {/* Highlight one sub-group tile */}
            <rect x={45 + 2 * 30} y={25 + 1 * 32} width="28" height="30" fill="none" stroke={COLORS.orange} strokeWidth="2.5" />

            {/* Arrow */}
            <line x1="210" y1="90" x2="250" y2="90" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead2)" />
            <defs>
              <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            {/* Sub-group detail */}
            <rect x="260" y="40" width="280" height="100" fill={COLORS.bgAlt} stroke={COLORS.orange} strokeWidth="2" />
            <text x="400" y="65" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>{t.subgroupTile}</text>
            <text x="400" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>{t.storedInSLM}</text>
            <text x="400" y="105" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>{t.eachSubgroup}</text>
            <text x="400" y="125" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>{t.workgroupContains}</text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Sub-group tile */}
            <rect x="40" y="30" width="120" height="120" fill={COLORS.valid} stroke={COLORS.orange} strokeWidth="2" />
            <text x="100" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.orange}>{t.subgroup32x64}</text>

            {/* Register tiles */}
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={45 + col * 27}
                  y={35 + row * 28}
                  width="25"
                  height="26"
                  fill={row === 1 && col === 1 ? COLORS.highlight : COLORS.bgAlt}
                  stroke={COLORS.mid}
                  strokeWidth="1"
                />
              ))
            )}

            {/* Highlight register tile */}
            <rect x={45 + 1 * 27} y={35 + 1 * 28} width="25" height="26" fill="none" stroke={COLORS.green} strokeWidth="2.5" />

            {/* Arrow */}
            <line x1="170" y1="90" x2="210" y2="90" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead3)" />
            <defs>
              <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            {/* Register detail */}
            <rect x="220" y="30" width="320" height="120" fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth="2" />
            <text x="380" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>{t.registerTile}</text>
            <text x="380" y="75" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>{t.storedInGRF}</text>
            <text x="380" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green} fontWeight="600">{t.xmxOp}</text>
            <text x="380" y="115" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>{t.minCompute}</text>
            <text x="380" y="135" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>{t.int8Ops}</text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step5Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Memory hierarchy flow */}
            <g>
              {/* Global Memory */}
              <rect x="40" y="30" width="120" height="40" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4" />
              <text x="100" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>{t.globalMemoryLabel}</text>
              <text x="100" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>{t.tiles256Label}</text>

              {/* Arrow */}
              <line x1="160" y1="50" x2="200" y2="50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* SLM */}
              <rect x="200" y="30" width="100" height="40" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" rx="4" />
              <text x="250" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>{t.slmLabel}</text>
              <text x="250" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>{t.tiles32Label}</text>

              {/* Arrow */}
              <line x1="300" y1="50" x2="340" y2="50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* GRF */}
              <rect x="340" y="30" width="100" height="40" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" rx="4" />
              <text x="390" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>{t.grfLabel}</text>
              <text x="390" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>{t.tiles8Label}</text>

              {/* Arrow */}
              <line x1="440" y1="50" x2="480" y2="50" stroke={COLORS.green} strokeWidth="3" markerEnd="url(#arrow-xmx)" />

              {/* XMX */}
              <rect x="480" y="30" width="80" height="40" fill={COLORS.green} stroke={COLORS.green} strokeWidth="2" rx="4" />
              <text x="520" y="50" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.bg}>{t.xmxLabel}</text>
              <text x="520" y="65" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.bg}>{t.compute}</text>

              <defs>
                <marker id="arrow-flow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
                </marker>
                <marker id="arrow-xmx" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill={COLORS.green} />
                </marker>
              </defs>
            </g>

            {/* Summary boxes */}
            <rect x="40" y="110" width="250" height="60" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="165" y="128" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>{t.threeTier}</text>
            <text x="165" y="145" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>{t.hierarchy}</text>
            <text x="165" y="160" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>{t.maxReuse}</text>

            <rect x="310" y="110" width="250" height="60" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="435" y="128" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>{t.keyOpt}</text>
            <text x="435" y="145" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>{t.xmxUtil}</text>
            <text x="435" y="160" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>{t.bankConflict}</text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default GemmTilingHierarchy;
