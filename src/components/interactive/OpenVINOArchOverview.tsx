import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Stage = 'frontend' | 'core' | 'plugin' | null;

const OpenVINOArchOverview: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      clickToCollapse: 'Click to collapse',
      modelImport: 'Model Import',
      deviceExecution: 'Device Execution',
      deviceSpecificBinary: 'Device-specific binary',
      clickEachStage: 'Click each stage to expand details',
    },
    en: {
      clickToCollapse: 'Click to collapse',
      modelImport: 'Model Import',
      deviceExecution: 'Device Execution',
      deviceSpecificBinary: 'Device-specific binary',
      clickEachStage: 'Click each stage to expand details',
    },
  }[locale];

  const [expanded, setExpanded] = useState<Stage>(null);

  return (
    <div className="my-6 p-4 border rounded-lg bg-white">
      <svg viewBox="0 0 580 380" className="w-full">
        <defs>
          <marker
            id="arrowhead-arch"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Frontend Stage */}
        <g
          onClick={() => setExpanded(expanded === 'frontend' ? null : 'frontend')}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={10}
            y={80}
            width={160}
            height={expanded === 'frontend' ? 220 : 80}
            fill={expanded === 'frontend' ? COLORS.bgAlt : COLORS.bg}
            stroke={COLORS.primary}
            strokeWidth={2}
            rx={4}
          />
          <text
            x={90}
            y={105}
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize={14}
            fontWeight="bold"
            fill={COLORS.primary}
          >
            Frontend
          </text>

          {expanded === 'frontend' ? (
            <>
              <text x={20} y={135} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • ONNX Reader
              </text>
              <text x={20} y={155} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • PaddlePaddle Reader
              </text>
              <text x={20} y={175} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • TF Reader
              </text>
              <text x={20} y={195} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • PyTorch Reader
              </text>
              <line x1={20} y1={210} x2={160} y2={210} stroke={COLORS.light} strokeWidth={1} />
              <text x={20} y={230} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.mid}>
                Model Optimizer
              </text>
              <text x={20} y={250} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                (legacy)
              </text>
              <text x={90} y={280} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>
                {t.clickToCollapse}
              </text>
            </>
          ) : (
            <text
              x={90}
              y={130}
              textAnchor="middle"
              fontFamily={FONTS.mono}
              fontSize={12}
              fill={COLORS.dark}
            >
              {t.modelImport}
            </text>
          )}
        </g>

        {/* Arrow 1 */}
        <text x={90} y={50} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
          ONNX/TF/Paddle
        </text>
        <line
          x1={90}
          y1={55}
          x2={90}
          y2={78}
          stroke={COLORS.mid}
          strokeWidth={2}
          markerEnd="url(#arrowhead-arch)"
        />

        {/* Arrow to Core */}
        <line
          x1={172}
          y1={120}
          x2={198}
          y2={120}
          stroke={COLORS.mid}
          strokeWidth={2}
          markerEnd="url(#arrowhead-arch)"
        />
        <text x={185} y={110} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
          ov::Model
        </text>

        {/* Core Stage */}
        <g
          onClick={() => setExpanded(expanded === 'core' ? null : 'core')}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={200}
            y={80}
            width={170}
            height={expanded === 'core' ? 220 : 80}
            fill={expanded === 'core' ? COLORS.bgAlt : COLORS.bg}
            stroke={COLORS.green}
            strokeWidth={2}
            rx={4}
          />
          <text
            x={285}
            y={105}
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize={14}
            fontWeight="bold"
            fill={COLORS.green}
          >
            Core
          </text>

          {expanded === 'core' ? (
            <>
              <text x={210} y={135} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • Operations graph
              </text>
              <text x={210} y={155} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • Tensor descriptors
              </text>
              <text x={210} y={175} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • Dynamic shapes
              </text>
              <text x={210} y={195} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • Common opts
              </text>
              <line x1={210} y1={210} x2={360} y2={210} stroke={COLORS.light} strokeWidth={1} />
              <text x={210} y={230} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                Constant folding
              </text>
              <text x={210} y={250} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                Operator fusion
              </text>
              <text x={210} y={270} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                Dead code elim
              </text>
              <text x={285} y={290} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>
                {t.clickToCollapse}
              </text>
            </>
          ) : (
            <text
              x={285}
              y={130}
              textAnchor="middle"
              fontFamily={FONTS.mono}
              fontSize={12}
              fill={COLORS.dark}
            >
              ov::Model IR
            </text>
          )}
        </g>

        {/* Arrow to Plugin */}
        <line
          x1={372}
          y1={120}
          x2={398}
          y2={120}
          stroke={COLORS.mid}
          strokeWidth={2}
          markerEnd="url(#arrowhead-arch)"
        />
        <text x={385} y={110} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
          Optimized
        </text>

        {/* Plugin Stage */}
        <g
          onClick={() => setExpanded(expanded === 'plugin' ? null : 'plugin')}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={400}
            y={80}
            width={170}
            height={expanded === 'plugin' ? 220 : 80}
            fill={expanded === 'plugin' ? COLORS.bgAlt : COLORS.bg}
            stroke={COLORS.orange}
            strokeWidth={2}
            rx={4}
          />
          <text
            x={485}
            y={105}
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontSize={14}
            fontWeight="bold"
            fill={COLORS.orange}
          >
            Plugin
          </text>

          {expanded === 'plugin' ? (
            <>
              <text x={410} y={135} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • GPU Plugin
              </text>
              <text x={420} y={155} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                (oneDNN+OpenCL)
              </text>
              <text x={410} y={175} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • CPU Plugin
              </text>
              <text x={420} y={195} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                (oneDNN+ACL)
              </text>
              <text x={410} y={215} fontFamily={FONTS.mono} fontSize={11} fill={COLORS.dark}>
                • NPU Plugin
              </text>
              <line x1={410} y1={230} x2={560} y2={230} stroke={COLORS.light} strokeWidth={1} />
              <text x={410} y={250} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
                AUTO/MULTI/HETERO
              </text>
              <text x={485} y={280} textAnchor="middle" fontFamily={FONTS.mono} fontSize={9} fill={COLORS.mid}>
                {t.clickToCollapse}
              </text>
            </>
          ) : (
            <text
              x={485}
              y={130}
              textAnchor="middle"
              fontFamily={FONTS.mono}
              fontSize={12}
              fill={COLORS.dark}
            >
              {t.deviceExecution}
            </text>
          )}
        </g>

        {/* Arrow to output */}
        <line
          x1={485}
          y1={expanded === 'plugin' ? 302 : 162}
          x2={485}
          y2={330}
          stroke={COLORS.mid}
          strokeWidth={2}
          markerEnd="url(#arrowhead-arch)"
        />
        <text x={485} y={350} textAnchor="middle" fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
          {t.deviceSpecificBinary}
        </text>

        {/* Legend */}
        <text x={10} y={370} fontFamily={FONTS.mono} fontSize={10} fill={COLORS.mid}>
          {t.clickEachStage}
        </text>
      </svg>
    </div>
  );
};

export default OpenVINOArchOverview;
