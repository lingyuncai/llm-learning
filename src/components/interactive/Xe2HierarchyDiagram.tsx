import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Level = 'gpu' | 'slice' | 'xecore' | 'eu' | null;

export default function Xe2HierarchyDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [expanded, setExpanded] = useState<Level>(null);

  const W = 580;
  const H = 420;

  const toggleLevel = (level: Level) => {
    setExpanded(expanded === level ? null : level);
  };

  const t = {
    zh: {
      title: 'Xe2 架构层次',
      subtitle: '点击各层级查看内部结构（以 Lunar Lake 为例）',
      gpu: 'GPU',
      lunarLake: 'Lunar Lake iGPU',
      slice: 'Slice (1x)',
      sliceDesc: '包含 4 个 Xe-core',
      xeCoreLabel: 'Xe-core',
      euCount: '16 EUs',
      euDetail: '每个 Xe-core 内的 16 个 EU (部分示意):',
      euTitle: 'Execution Unit (EU)',
      vectorEngine: '• Vector Engine (SIMD8 ALU)',
      xmxEngine: '• XMX Matrix Engine',
      threadSlots: '• 8 Thread Slots, 128 GRF/thread',
    },
    en: {
      title: 'Xe2 Architecture Hierarchy',
      subtitle: 'Click each level to view internal structure (Lunar Lake example)',
      gpu: 'GPU',
      lunarLake: 'Lunar Lake iGPU',
      slice: 'Slice (1x)',
      sliceDesc: 'Contains 4 Xe-cores',
      xeCoreLabel: 'Xe-core',
      euCount: '16 EUs',
      euDetail: '16 EUs within each Xe-core (partial view):',
      euTitle: 'Execution Unit (EU)',
      vectorEngine: '• Vector Engine (SIMD8 ALU)',
      xmxEngine: '• XMX Matrix Engine',
      threadSlots: '• 8 Thread Slots, 128 GRF/thread',
    },
  }[locale];

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* GPU Level */}
        <g>
          <rect
            x={140}
            y={20}
            width={300}
            height={60}
            fill={expanded === 'gpu' ? COLORS.dark : COLORS.dark}
            stroke={COLORS.dark}
            strokeWidth={2}
            rx={4}
            style={{ cursor: 'pointer', opacity: expanded === 'gpu' ? 1 : 0.9 }}
            onClick={() => toggleLevel('gpu')}
          />
          <text
            x={290}
            y={45}
            textAnchor="middle"
            fill="white"
            fontSize={16}
            fontWeight="bold"
            fontFamily={FONTS.sans}
            style={{ pointerEvents: 'none' }}
          >
            {t.gpu}
          </text>
          <text
            x={290}
            y={65}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontFamily={FONTS.sans}
            style={{ pointerEvents: 'none' }}
          >
            {t.lunarLake}
          </text>
        </g>

        {/* Slice Level */}
        {expanded === 'gpu' && (
          <g>
            <line x1={290} y1={80} x2={290} y2={110} stroke={COLORS.mid} strokeWidth={2} />
            <rect
              x={140}
              y={110}
              width={300}
              height={60}
              fill={COLORS.primary}
              stroke={COLORS.primary}
              strokeWidth={2}
              rx={4}
              style={{ cursor: 'pointer', opacity: expanded === 'slice' ? 1 : 0.9 }}
              onClick={() => toggleLevel('slice')}
            />
            <text
              x={290}
              y={135}
              textAnchor="middle"
              fill="white"
              fontSize={16}
              fontWeight="bold"
              fontFamily={FONTS.sans}
              style={{ pointerEvents: 'none' }}
            >
              {t.slice}
            </text>
            <text
              x={290}
              y={155}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              fontFamily={FONTS.sans}
              style={{ pointerEvents: 'none' }}
            >
              {t.sliceDesc}
            </text>
          </g>
        )}

        {/* Xe-core Level */}
        {expanded === 'slice' && (
          <g>
            <line x1={290} y1={170} x2={290} y2={200} stroke={COLORS.mid} strokeWidth={2} />
            {[0, 1, 2, 3].map((i) => {
              const x = 80 + i * 110;
              return (
                <g key={i}>
                  <line x1={290} y1={200} x2={x + 50} y2={220} stroke={COLORS.mid} strokeWidth={1.5} />
                  <rect
                    x={x}
                    y={220}
                    width={100}
                    height={60}
                    fill={COLORS.green}
                    stroke={COLORS.green}
                    strokeWidth={2}
                    rx={4}
                    style={{ cursor: 'pointer', opacity: expanded === 'xecore' ? 1 : 0.9 }}
                    onClick={() => toggleLevel('xecore')}
                  />
                  <text
                    x={x + 50}
                    y={245}
                    textAnchor="middle"
                    fill="white"
                    fontSize={14}
                    fontWeight="bold"
                    fontFamily={FONTS.sans}
                    style={{ pointerEvents: 'none' }}
                  >
                    {t.xeCoreLabel} {i}
                  </text>
                  <text
                    x={x + 50}
                    y={265}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontFamily={FONTS.sans}
                    style={{ pointerEvents: 'none' }}
                  >
                    {t.euCount}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* EU Level */}
        {expanded === 'xecore' && (
          <g>
            <text
              x={290}
              y={310}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={13}
              fontWeight="600"
              fontFamily={FONTS.sans}
            >
              {t.euDetail}
            </text>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const x = 90 + i * 60;
              return (
                <rect
                  key={i}
                  x={x}
                  y={330}
                  width={50}
                  height={50}
                  fill={COLORS.purple}
                  stroke={COLORS.purple}
                  strokeWidth={1.5}
                  rx={3}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleLevel('eu')}
                />
              );
            })}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const x = 90 + i * 60;
              return (
                <text
                  key={i}
                  x={x + 25}
                  y={360}
                  textAnchor="middle"
                  fill="white"
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily={FONTS.sans}
                  style={{ pointerEvents: 'none' }}
                >
                  EU
                </text>
              );
            })}
          </g>
        )}

        {/* EU Detail */}
        {expanded === 'eu' && (
          <g>
            <rect
              x={180}
              y={320}
              width={220}
              height={80}
              fill={COLORS.bgAlt}
              stroke={COLORS.purple}
              strokeWidth={2}
              rx={4}
            />
            <text
              x={290}
              y={340}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={13}
              fontWeight="bold"
              fontFamily={FONTS.sans}
            >
              {t.euTitle}
            </text>
            <text
              x={290}
              y={360}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={11}
              fontFamily={FONTS.sans}
            >
              {t.vectorEngine}
            </text>
            <text
              x={290}
              y={375}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={11}
              fontFamily={FONTS.sans}
            >
              {t.xmxEngine}
            </text>
            <text
              x={290}
              y={390}
              textAnchor="middle"
              fill={COLORS.dark}
              fontSize={11}
              fontFamily={FONTS.sans}
            >
              {t.threadSlots}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
