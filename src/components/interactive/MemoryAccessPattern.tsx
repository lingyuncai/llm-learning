import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type AccessPattern = 'coalesced' | 'scattered';

const MemoryAccessPattern: React.FC = () => {
  const [pattern, setPattern] = useState<AccessPattern>('coalesced');

  const numThreads = 8;
  const memoryAddresses = 16;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 320" className="w-full">
        {/* Title */}
        <text x="290" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          内存访问模式优化
        </text>

        {/* Toggle buttons */}
        <g transform="translate(180, 40)">
          <rect
            x="0"
            y="0"
            width="100"
            height="32"
            fill={pattern === 'coalesced' ? COLORS.green : COLORS.bgAlt}
            stroke={COLORS.green}
            strokeWidth="2"
            rx="4"
            style={{ cursor: 'pointer' }}
          />
          <text
            x="50"
            y="21"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="12"
            fontWeight="600"
            fill={pattern === 'coalesced' ? COLORS.bg : COLORS.dark}
            style={{ cursor: 'pointer', pointerEvents: 'none' }}
          >
            合并访问
          </text>

          <rect
            x="120"
            y="0"
            width="100"
            height="32"
            fill={pattern === 'scattered' ? COLORS.red : COLORS.bgAlt}
            stroke={COLORS.red}
            strokeWidth="2"
            rx="4"
            style={{ cursor: 'pointer' }}
          />
          <text
            x="170"
            y="21"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="12"
            fontWeight="600"
            fill={pattern === 'scattered' ? COLORS.bg : COLORS.dark}
            style={{ cursor: 'pointer', pointerEvents: 'none' }}
          >
            分散访问
          </text>
        </g>

        {/* EU Threads */}
        <g transform="translate(0, 95)">
          <text x="40" y="5" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            EU 线程 (T0-T7)
          </text>
          {Array.from({ length: numThreads }).map((_, i) => (
            <g key={i} transform={`translate(${60 + i * 60}, 15)`}>
              <rect
                x="0"
                y="0"
                width="50"
                height="32"
                fill={COLORS.primary}
                stroke={COLORS.primary}
                strokeWidth="1.5"
                rx="4"
              />
              <text
                x="25"
                y="21"
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="12"
                fontWeight="600"
                fill={COLORS.bg}
              >
                T{i}
              </text>
            </g>
          ))}
        </g>

        {/* Access arrows */}
        <g transform="translate(0, 150)">
          {pattern === 'coalesced' ? (
            // Coalesced: T0→0, T1→1, ..., T7→7 (adjacent addresses)
            Array.from({ length: numThreads }).map((_, i) => (
              <line
                key={i}
                x1={85 + i * 60}
                y1="0"
                x2={45 + i * 30}
                y2="50"
                stroke={COLORS.green}
                strokeWidth="2.5"
                markerEnd="url(#arrow-green-access)"
              />
            ))
          ) : (
            // Scattered: random addresses (T0→0, T1→5, T2→11, T3→2, T4→15, T5→7, T6→13, T7→3)
            <>
              <line x1="85" y1="0" x2="45" y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="145" y1="0" x2={45 + 5 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="205" y1="0" x2={45 + 11 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="265" y1="0" x2={45 + 2 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="325" y1="0" x2={45 + 15 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="385" y1="0" x2={45 + 7 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="445" y1="0" x2={45 + 13 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
              <line x1="505" y1="0" x2={45 + 3 * 30} y2="50" stroke={COLORS.red} strokeWidth="2.5" markerEnd="url(#arrow-red-access)" />
            </>
          )}

          <defs>
            <marker id="arrow-green-access" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.green} />
            </marker>
            <marker id="arrow-red-access" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.red} />
            </marker>
          </defs>
        </g>

        {/* Memory addresses (cache lines) */}
        <g transform="translate(0, 205)">
          <text x="40" y="5" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            内存地址 (Cache Line)
          </text>
          {Array.from({ length: memoryAddresses }).map((_, i) => {
            const isAccessed = pattern === 'coalesced'
              ? i < numThreads
              : [0, 5, 11, 2, 15, 7, 13, 3].includes(i);

            return (
              <g key={i} transform={`translate(${30 + i * 30}, 15)`}>
                <rect
                  x="0"
                  y="0"
                  width="26"
                  height="32"
                  fill={isAccessed ? (pattern === 'coalesced' ? COLORS.valid : COLORS.waste) : COLORS.bgAlt}
                  stroke={isAccessed ? (pattern === 'coalesced' ? COLORS.green : COLORS.red) : COLORS.light}
                  strokeWidth={isAccessed ? "2" : "1"}
                  rx="3"
                />
                <text
                  x="13"
                  y="21"
                  textAnchor="middle"
                  fontFamily={FONTS.mono}
                  fontSize="9"
                  fill={COLORS.dark}
                >
                  {i}
                </text>
              </g>
            );
          })}
        </g>

        {/* Performance comparison */}
        <g transform="translate(40, 270)">
          <rect
            x="0"
            y="0"
            width="500"
            height="42"
            fill={pattern === 'coalesced' ? COLORS.valid : COLORS.waste}
            stroke={pattern === 'coalesced' ? COLORS.green : COLORS.red}
            strokeWidth="2"
            rx="4"
          />
          {pattern === 'coalesced' ? (
            <>
              <text x="250" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>
                ✓ 合并访问: 1 次内存事务 — 100% 利用率
              </text>
              <text x="250" y="36" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                连续地址访问 → 单次 cache line 读取 → 最优带宽利用
              </text>
            </>
          ) : (
            <>
              <text x="250" y="20" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>
                ✗ 分散访问: 8 次内存事务 — 12.5% 利用率
              </text>
              <text x="250" y="36" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                随机地址访问 → 多次 cache line 读取 → 严重带宽浪费，性能下降 8×
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default MemoryAccessPattern;
