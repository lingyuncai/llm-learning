import React, { useState } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const GemmTilingHierarchy: React.FC = () => {
  const steps = [
    {
      title: '完整矩阵',
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
      title: 'Global Tile 划分',
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
              <text x="380" y="55" textAnchor="start" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.dark}>← 256×256 tile</text>
              <text x="380" y="75" textAnchor="start" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>每个 tile = 1 work-group</text>
              <text x="290" y="175" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.primary}>矩阵 C (M × N)</text>
            </g>

            {/* Arrow and label */}
            <line x1="140" y1="90" x2="170" y2="90" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>
            <text x="70" y="60" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>Global 内存</text>
            <text x="70" y="80" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>完整矩阵</text>
            <text x="70" y="100" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark}>划分为</text>
            <text x="70" y="120" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.primary}>256×256 tiles</text>
          </svg>
        </div>
      ),
    },
    {
      title: 'Work-group Tile',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Zoomed tile */}
            <rect x="40" y="20" width="160" height="140" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" />
            <text x="120" y="15" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.primary}>256×256 Work-group Tile</text>

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
            <text x="400" y="65" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>32×64 Sub-group Tile</text>
            <text x="400" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>存储在 SLM (Shared Local Memory)</text>
            <text x="400" y="105" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>每个 sub-group 负责一个 tile</text>
            <text x="400" y="125" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>Work-group 包含多个 sub-groups</text>
          </svg>
        </div>
      ),
    },
    {
      title: 'Sub-group → Register Tile',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Sub-group tile */}
            <rect x="40" y="30" width="120" height="120" fill={COLORS.valid} stroke={COLORS.orange} strokeWidth="2" />
            <text x="100" y="22" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.orange}>32×64 Sub-group</text>

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
            <text x="380" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>8×16 Register Tile</text>
            <text x="380" y="75" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={COLORS.mid}>存储在 GRF (General Register File)</text>
            <text x="380" y="95" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green} fontWeight="600">每个 register tile → 一次 XMX 操作</text>
            <text x="380" y="115" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>最小计算单元，直接由 XMX 引擎处理</text>
            <text x="380" y="135" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>INT8: 8×16×16 = 2048 ops/cycle</text>
          </svg>
        </div>
      ),
    },
    {
      title: '数据流总结',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 180" className="w-full">
            {/* Memory hierarchy flow */}
            <g>
              {/* Global Memory */}
              <rect x="40" y="30" width="120" height="40" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4" />
              <text x="100" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>Global Memory</text>
              <text x="100" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>256×256 tiles</text>

              {/* Arrow */}
              <line x1="160" y1="50" x2="200" y2="50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* SLM */}
              <rect x="200" y="30" width="100" height="40" fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="2" rx="4" />
              <text x="250" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>SLM</text>
              <text x="250" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>32×64 tiles</text>

              {/* Arrow */}
              <line x1="300" y1="50" x2="340" y2="50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* GRF */}
              <rect x="340" y="30" width="100" height="40" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" rx="4" />
              <text x="390" y="55" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>GRF</text>
              <text x="390" y="85" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>8×16 tiles</text>

              {/* Arrow */}
              <line x1="440" y1="50" x2="480" y2="50" stroke={COLORS.green} strokeWidth="3" markerEnd="url(#arrow-xmx)" />

              {/* XMX */}
              <rect x="480" y="30" width="80" height="40" fill={COLORS.green} stroke={COLORS.green} strokeWidth="2" rx="4" />
              <text x="520" y="50" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.bg}>XMX</text>
              <text x="520" y="65" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.bg}>计算</text>

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
            <text x="165" y="128" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>三层 Tiling 策略</text>
            <text x="165" y="145" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>Global (256×256) → SLM (32×64) → GRF (8×16)</text>
            <text x="165" y="160" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>最大化内存复用，减少带宽压力</text>

            <rect x="310" y="110" width="250" height="60" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="435" y="128" textAnchor="middle" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>关键优化目标</text>
            <text x="435" y="145" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>✓ XMX 利用率最大化 (对齐要求)</text>
            <text x="435" y="160" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>✓ SLM bank conflict 最小化</text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default GemmTilingHierarchy;
