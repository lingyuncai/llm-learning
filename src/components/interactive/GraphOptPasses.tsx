import React from 'react';
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

const GraphOptPasses: React.FC = () => {
  const steps = [
    {
      title: '原始计算图',
      content: (
        <svg viewBox="0 0 580 160" className="w-full">
          <defs>
            <marker
              id="arrow-graph-opt"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Original graph: 7 nodes */}
          <rect x={10} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={40} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Input</text>

          <line x1={70} y1={80} x2={98} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={100} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={130} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Conv</text>

          <line x1={160} y1={80} x2={188} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={190} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={220} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Batch</text>
          <text x={220} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Norm</text>

          <line x1={250} y1={80} x2={278} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={280} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={310} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>ReLU</text>

          <line x1={340} y1={80} x2={368} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={370} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={400} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>MatMul</text>

          <line x1={430} y1={80} x2={458} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={460} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={490} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Add</text>

          <line x1={520} y1={80} x2={548} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt)" />

          <rect x={550} y={60} width={20} height={40} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} rx={4} />

          <text x={290} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>
            7 个算子节点
          </text>
        </svg>
      ),
    },
    {
      title: '常量折叠',
      content: (
        <svg viewBox="0 0 580 160" className="w-full">
          <defs>
            <marker
              id="arrow-graph-opt2"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* BatchNorm merged into Conv */}
          <rect x={10} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={40} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Input</text>

          <line x1={70} y1={80} x2={98} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt2)" />

          <rect x={100} y={60} width={80} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={140} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Conv+BN</text>
          <text x={140} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>(fused weights)</text>

          <line x1={180} y1={80} x2={238} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt2)" />

          {/* BatchNorm crossed out */}
          <rect x={240} y={60} width={60} height={40} fill={COLORS.waste} fillOpacity={0.3} stroke={COLORS.red} strokeWidth={2} strokeDasharray="4,2" rx={4} />
          <text x={270} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.red} textDecoration="line-through">Batch</text>
          <text x={270} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.red} textDecoration="line-through">Norm</text>

          <line x1={300} y1={80} x2={328} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt2)" />

          <rect x={330} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={360} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>ReLU</text>

          <line x1={390} y1={80} x2={418} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt2)" />

          <rect x={420} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={450} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>MatMul</text>

          <line x1={480} y1={80} x2={508} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt2)" />

          <rect x={510} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={540} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Add</text>

          <text x={290} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>
            6 个节点（BatchNorm 常量被折叠到 Conv 权重）
          </text>
        </svg>
      ),
    },
    {
      title: '死节点消除',
      content: (
        <svg viewBox="0 0 580 160" className="w-full">
          <defs>
            <marker
              id="arrow-graph-opt3"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Dead node removed */}
          <rect x={20} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={50} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Input</text>

          <line x1={80} y1={80} x2={118} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt3)" />

          <rect x={120} y={60} width={80} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={160} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.dark}>Conv+BN</text>

          <line x1={200} y1={80} x2={238} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt3)" />

          <rect x={240} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={270} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>ReLU</text>

          <line x1={300} y1={80} x2={338} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt3)" />

          <rect x={340} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={370} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>MatMul</text>

          <line x1={400} y1={80} x2={438} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt3)" />

          <rect x={440} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={470} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Add</text>

          <line x1={500} y1={80} x2={538} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt3)" />

          <rect x={540} y={60} width={30} height={40} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} rx={4} />

          <text x={290} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>
            5 个节点（未使用的分支已移除）
          </text>
        </svg>
      ),
    },
    {
      title: '算子融合',
      content: (
        <svg viewBox="0 0 580 160" className="w-full">
          <defs>
            <marker
              id="arrow-graph-opt4"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Aggressive fusion */}
          <rect x={40} y={60} width={60} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={70} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Input</text>

          <line x1={100} y1={80} x2={148} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt4)" />

          <rect x={150} y={50} width={120} height={60} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
          <text x={210} y={75} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>ConvBNReLU</text>
          <text x={210} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>Fused primitive</text>

          <line x1={270} y1={80} x2={318} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt4)" />

          <rect x={320} y={50} width={120} height={60} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
          <text x={380} y={75} textAnchor="middle" fontFamily={FONTS.sans} fontSize={12} fontWeight="bold" fill={COLORS.green}>MatMulAdd</text>
          <text x={380} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>Fused primitive</text>

          <line x1={440} y1={80} x2={488} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt4)" />

          <rect x={490} y={60} width={50} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={515} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Output</text>

          <text x={290} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={12} fill={COLORS.dark}>
            4 个节点（Conv+BN+ReLU 融合，MatMul+Add 融合）
          </text>
        </svg>
      ),
    },
    {
      title: 'Layout 插入',
      content: (
        <svg viewBox="0 0 580 160" className="w-full">
          <defs>
            <marker
              id="arrow-graph-opt5"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Layout reorder inserted */}
          <rect x={10} y={60} width={50} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />
          <text x={35} y={85} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>Input</text>

          <line x1={60} y1={80} x2={88} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt5)" />

          <rect x={90} y={60} width={70} height={40} fill={COLORS.orange} fillOpacity={0.2} stroke={COLORS.orange} strokeWidth={2} rx={4} />
          <text x={125} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.orange}>Reorder</text>
          <text x={125} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={8} fill={COLORS.mid}>NCHW→blocked</text>

          <line x1={160} y1={80} x2={188} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt5)" />

          <rect x={190} y={50} width={100} height={60} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
          <text x={240} y={75} textAnchor="middle" fontFamily={FONTS.sans} fontSize={11} fontWeight="bold" fill={COLORS.green}>ConvBNReLU</text>
          <text x={240} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={8} fill={COLORS.mid}>blocked format</text>

          <line x1={290} y1={80} x2={308} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt5)" />

          <rect x={310} y={50} width={100} height={60} fill={COLORS.green} fillOpacity={0.2} stroke={COLORS.green} strokeWidth={2} rx={4} />
          <text x={360} y={75} textAnchor="middle" fontFamily={FONTS.sans} fontSize={11} fontWeight="bold" fill={COLORS.green}>MatMulAdd</text>

          <line x1={410} y1={80} x2={428} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt5)" />

          <rect x={430} y={60} width={70} height={40} fill={COLORS.orange} fillOpacity={0.2} stroke={COLORS.orange} strokeWidth={2} rx={4} />
          <text x={465} y={82} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.orange}>Reorder</text>
          <text x={465} y={92} textAnchor="middle" fontFamily={FONTS.mono} fontSize={8} fill={COLORS.mid}>blocked→NCHW</text>

          <line x1={500} y1={80} x2={528} y2={80} stroke={COLORS.mid} strokeWidth={2} markerEnd="url(#arrow-graph-opt5)" />

          <rect x={530} y={60} width={40} height={40} fill={COLORS.primary} fillOpacity={0.2} stroke={COLORS.primary} rx={4} />

          <text x={290} y={140} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
            Reorder 开销在首次推理时由 cache 摊销
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className="my-6">
      <StepNavigator steps={steps} />
    </div>
  );
};

export default GraphOptPasses;
