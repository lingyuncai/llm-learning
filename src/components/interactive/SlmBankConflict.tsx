import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type AccessPattern = 'no-conflict' | 'conflict';

const SlmBankConflict: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      title: 'SLM Bank Conflict 可视化',
      noConflict: '无冲突',
      conflict: '4-way 冲突',
      threads: '16 个线程',
      banks: '16 个 SLM Banks',
      noConflictTitle: '✓ 无冲突: 1 cycle',
      noConflictDesc: '访问模式: stride = 1 (连续访问) → 每个线程访问不同 bank → 并行完成',
      conflictTitle: '✗ 4-way 冲突: 4 cycles',
      conflictDesc: '访问模式: stride = 4 (跳跃访问) → 多个线程访问同一 bank → 串行执行，性能下降 4×',
    },
    en: {
      title: 'SLM Bank Conflict Visualization',
      noConflict: 'No Conflict',
      conflict: '4-way Conflict',
      threads: '16 threads',
      banks: '16 SLM Banks',
      noConflictTitle: '✓ No conflict: 1 cycle',
      noConflictDesc: 'Access pattern: stride = 1 (contiguous) → each thread accesses different bank → parallel completion',
      conflictTitle: '✗ 4-way conflict: 4 cycles',
      conflictDesc: 'Access pattern: stride = 4 (strided) → multiple threads access same bank → serialized execution, 4× performance degradation',
    },
  }[locale];

  const [pattern, setPattern] = useState<AccessPattern>('no-conflict');

  const numBanks = 16;
  const numThreads = 16;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 360" className="w-full">
        {/* Title */}
        <text x="290" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Toggle buttons */}
        <g transform="translate(180, 40)">
          <rect
            x="0"
            y="0"
            width="100"
            height="32"
            fill={pattern === 'no-conflict' ? COLORS.green : COLORS.bgAlt}
            stroke={COLORS.green}
            strokeWidth="2"
            rx="4"
            style={{ cursor: 'pointer' }}
            onClick={() => setPattern('no-conflict')}
          />
          <text
            x="50"
            y="21"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="12"
            fontWeight="600"
            fill={pattern === 'no-conflict' ? COLORS.bg : COLORS.dark}
            style={{ cursor: 'pointer', pointerEvents: 'none' }}
          >
            {t.noConflict}
          </text>

          <rect
            x="120"
            y="0"
            width="100"
            height="32"
            fill={pattern === 'conflict' ? COLORS.red : COLORS.bgAlt}
            stroke={COLORS.red}
            strokeWidth="2"
            rx="4"
            style={{ cursor: 'pointer' }}
            onClick={() => setPattern('conflict')}
          />
          <text
            x="170"
            y="21"
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize="12"
            fontWeight="600"
            fill={pattern === 'conflict' ? COLORS.bg : COLORS.dark}
            style={{ cursor: 'pointer', pointerEvents: 'none' }}
          >
            {t.conflict}
          </text>
        </g>

        {/* Threads */}
        <g transform="translate(0, 95)">
          <text x="40" y="5" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.threads}
          </text>
          {Array.from({ length: numThreads }).map((_, i) => (
            <g key={i} transform={`translate(${40 + i * 32}, 15)`}>
              <rect
                x="0"
                y="0"
                width="28"
                height="28"
                fill={COLORS.bgAlt}
                stroke={COLORS.primary}
                strokeWidth="1.5"
                rx="3"
              />
              <text
                x="14"
                y="19"
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="10"
                fill={COLORS.dark}
              >
                T{i}
              </text>
            </g>
          ))}
        </g>

        {/* Arrows and conflicts */}
        <g transform="translate(0, 150)">
          {pattern === 'no-conflict' ? (
            // No conflict: each thread → different bank
            Array.from({ length: numThreads }).map((_, i) => (
              <line
                key={i}
                x1={54 + i * 32}
                y1="0"
                x2={54 + i * 32}
                y2="50"
                stroke={COLORS.green}
                strokeWidth="2"
                markerEnd="url(#arrow-green)"
              />
            ))
          ) : (
            // Conflict: 4 threads per bank (0-3 → bank 0, 4-7 → bank 4, etc.)
            <>
              {/* Bank 0 */}
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1={54 + i * 32}
                  y1="0"
                  x2={54}
                  y2="50"
                  stroke={COLORS.red}
                  strokeWidth="2"
                  markerEnd="url(#arrow-red)"
                  opacity="0.7"
                />
              ))}
              {/* Bank 4 */}
              {[4, 5, 6, 7].map((i) => (
                <line
                  key={i}
                  x1={54 + i * 32}
                  y1="0"
                  x2={54 + 4 * 32}
                  y2="50"
                  stroke={COLORS.red}
                  strokeWidth="2"
                  markerEnd="url(#arrow-red)"
                  opacity="0.7"
                />
              ))}
              {/* Bank 8 */}
              {[8, 9, 10, 11].map((i) => (
                <line
                  key={i}
                  x1={54 + i * 32}
                  y1="0"
                  x2={54 + 8 * 32}
                  y2="50"
                  stroke={COLORS.red}
                  strokeWidth="2"
                  markerEnd="url(#arrow-red)"
                  opacity="0.7"
                />
              ))}
              {/* Bank 12 */}
              {[12, 13, 14, 15].map((i) => (
                <line
                  key={i}
                  x1={54 + i * 32}
                  y1="0"
                  x2={54 + 12 * 32}
                  y2="50"
                  stroke={COLORS.red}
                  strokeWidth="2"
                  markerEnd="url(#arrow-red)"
                  opacity="0.7"
                />
              ))}
            </>
          )}

          <defs>
            <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.green} />
            </marker>
            <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.red} />
            </marker>
          </defs>
        </g>

        {/* Banks */}
        <g transform="translate(0, 205)">
          <text x="40" y="5" fontFamily={FONTS.sans} fontSize="12" fontWeight="600" fill={COLORS.dark}>
            {t.banks}
          </text>
          {Array.from({ length: numBanks }).map((_, i) => {
            const isAccessed =
              pattern === 'no-conflict' || (pattern === 'conflict' && i % 4 === 0);
            const hasConflict = pattern === 'conflict' && i % 4 === 0;

            return (
              <g key={i} transform={`translate(${40 + i * 32}, 15)`}>
                <rect
                  x="0"
                  y="0"
                  width="28"
                  height="50"
                  fill={hasConflict ? COLORS.waste : isAccessed ? COLORS.valid : COLORS.bgAlt}
                  stroke={hasConflict ? COLORS.red : isAccessed ? COLORS.green : COLORS.mid}
                  strokeWidth={hasConflict ? "2" : "1.5"}
                  rx="3"
                />
                <text
                  x="14"
                  y="30"
                  textAnchor="middle"
                  fontFamily={FONTS.mono}
                  fontSize="10"
                  fill={COLORS.dark}
                >
                  {i}
                </text>
              </g>
            );
          })}
        </g>

        {/* Performance info */}
        <g transform="translate(40, 290)">
          <rect
            x="0"
            y="0"
            width="500"
            height="60"
            fill={pattern === 'no-conflict' ? COLORS.valid : COLORS.waste}
            stroke={pattern === 'no-conflict' ? COLORS.green : COLORS.red}
            strokeWidth="2"
            rx="4"
          />
          {pattern === 'no-conflict' ? (
            <>
              <text x="250" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>
                {t.noConflictTitle}
              </text>
              <text x="250" y="45" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
                {t.noConflictDesc}
              </text>
            </>
          ) : (
            <>
              <text x="250" y="25" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="600" fill={COLORS.dark}>
                {t.conflictTitle}
              </text>
              <text x="250" y="45" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.mid}>
                {t.conflictDesc}
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default SlmBankConflict;
