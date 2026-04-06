import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const SimtVsSimd: React.FC = () => {
  const steps = [
    {
      title: 'SIMT 模型 (CUDA)',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
              SIMT: 32 个独立线程 (Warp)，每个线程有自己的 PC
            </text>

            {/* 32 threads in a 4x8 grid */}
            {Array.from({ length: 32 }, (_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const x = 50 + col * 65;
              const y = 50 + row * 35;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="50"
                    height="25"
                    fill={COLORS.primary}
                    fillOpacity="0.15"
                    stroke={COLORS.primary}
                    strokeWidth="1.5"
                  />
                  <text x={x + 10} y={y + 17} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>
                    T{i}
                  </text>
                  <text x={x + 35} y={y + 17} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
                    PC
                  </text>
                </g>
              );
            })}

            <text x="290" y="155" textAnchor="middle" fontSize="12" fill={COLORS.mid}>
              每个线程维护独立的程序计数器，硬件在运行时锁步执行
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: 'SIMD 模型 (Xe2)',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
              SIMD: 编译器向量化，一条指令操作多个数据通道
            </text>

            {/* Single instruction box */}
            <rect
              x="40"
              y="50"
              width="200"
              height="50"
              fill={COLORS.green}
              fillOpacity="0.15"
              stroke={COLORS.green}
              strokeWidth="2"
            />
            <text x="140" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.dark} fontFamily={FONTS.mono}>
              INSTRUCTION
            </text>
            <text x="140" y="87" textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.mono}>
              ADD r0, r1, r2
            </text>

            {/* Arrow */}
            <path
              d="M 250 75 L 320 75"
              stroke={COLORS.mid}
              strokeWidth="2"
              markerEnd="url(#arrowhead-simd)"
            />
            <defs>
              <marker
                id="arrowhead-simd"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
              </marker>
            </defs>

            {/* SIMD lanes */}
            <text x="430" y="45" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.dark}>
              SIMD8/16 数据通道
            </text>
            {Array.from({ length: 8 }, (_, i) => {
              const x = 340 + i * 45;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y="60"
                    width="35"
                    height="40"
                    fill={COLORS.primary}
                    fillOpacity="0.2"
                    stroke={COLORS.primary}
                    strokeWidth="1.5"
                  />
                  <text x={x + 17.5} y="83" textAnchor="middle" fontSize="10" fill={COLORS.dark} fontFamily={FONTS.mono}>
                    L{i}
                  </text>
                </g>
              );
            })}

            <text x="290" y="135" textAnchor="middle" fontSize="12" fill={COLORS.mid}>
              编译器将标量代码向量化为 SIMD 指令
            </text>
            <text x="290" y="155" textAnchor="middle" fontSize="11" fill={COLORS.mid}>
              一个 EU 同时处理多个数据元素 (SIMD8/16/32)
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '分支处理差异',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            <text x="145" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLORS.dark}>
              SIMT (运行时掩码)
            </text>
            <text x="435" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLORS.dark}>
              SIMD (编译时 Predication)
            </text>

            {/* SIMT branch */}
            <text x="145" y="50" textAnchor="middle" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.mid}>
              if (threadIdx.x % 2 == 0)
            </text>

            {/* Active threads (even) */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 40 + i * 30;
              const isActive = i % 2 === 0;
              return (
                <rect
                  key={i}
                  x={x}
                  y="65"
                  width="22"
                  height="25"
                  fill={isActive ? COLORS.valid : COLORS.masked}
                  stroke={isActive ? COLORS.primary : COLORS.mid}
                  strokeWidth="1.5"
                />
              );
            })}
            <text x="145" y="105" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              活跃线程执行，其他线程被掩码
            </text>

            {/* Inactive threads (odd) */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 40 + i * 30;
              const isActive = i % 2 !== 0;
              return (
                <rect
                  key={i}
                  x={x}
                  y="115"
                  width="22"
                  height="25"
                  fill={isActive ? COLORS.valid : COLORS.masked}
                  stroke={isActive ? COLORS.primary : COLORS.mid}
                  strokeWidth="1.5"
                />
              );
            })}
            <text x="145" y="155" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              分支另一侧，掩码反转
            </text>

            {/* SIMD predication */}
            <text x="435" y="50" textAnchor="middle" fontSize="10" fontFamily={FONTS.mono} fill={COLORS.mid}>
              编译器生成 predicated 指令
            </text>

            <rect
              x="330"
              y="65"
              width="210"
              height="35"
              fill={COLORS.green}
              fillOpacity="0.1"
              stroke={COLORS.green}
              strokeWidth="1.5"
            />
            <text x="435" y="83" textAnchor="middle" fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              (p0) ADD r0, r1, r2
            </text>
            <text x="435" y="95" textAnchor="middle" fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              (!p0) SUB r0, r3, r4
            </text>

            <rect
              x="330"
              y="110"
              width="210"
              height="25"
              fill={COLORS.primary}
              fillOpacity="0.1"
              stroke={COLORS.primary}
              strokeWidth="1.5"
            />
            <text x="435" y="127" textAnchor="middle" fontSize="9" fontFamily={FONTS.mono} fill={COLORS.dark}>
              p0 = [1,0,1,0,1,0,1,0] (predicate mask)
            </text>

            <text x="435" y="155" textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              所有通道执行，结果由 predicate 控制
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '对编程的影响',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill={COLORS.dark}>
              编程模型对比
            </text>

            {/* SIMT column */}
            <rect x="40" y="45" width="240" height="30" fill={COLORS.primary} fillOpacity="0.2" stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="160" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.dark}>
              SIMT (CUDA)
            </text>

            <rect x="40" y="75" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="50" y="92" fontSize="10" fill={COLORS.dark}>
              "Think in threads" — 每个线程一个任务
            </text>

            <rect x="40" y="100" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="50" y="117" fontSize="10" fill={COLORS.dark}>
              显式线程索引 (threadIdx, blockIdx)
            </text>

            <rect x="40" y="125" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="50" y="142" fontSize="10" fill={COLORS.dark}>
              分支分化由硬件处理 (自动掩码)
            </text>

            {/* SIMD column */}
            <rect x="300" y="45" width="240" height="30" fill={COLORS.green} fillOpacity="0.2" stroke={COLORS.green} strokeWidth="1.5" />
            <text x="420" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.dark}>
              SIMD (Xe2)
            </text>

            <rect x="300" y="75" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="310" y="92" fontSize="10" fill={COLORS.dark}>
              "Think in vectors" — 向量化思维
            </text>

            <rect x="300" y="100" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="310" y="117" fontSize="10" fill={COLORS.dark}>
              抽象线程索引 (work-item, sub-group)
            </text>

            <rect x="300" y="125" width="240" height="25" fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x="310" y="142" fontSize="10" fill={COLORS.dark}>
              编译器优化分支 (predication, 循环展开)
            </text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default SimtVsSimd;
