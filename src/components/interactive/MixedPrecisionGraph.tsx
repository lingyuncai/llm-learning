import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4';

interface OpNode {
  id: string;
  label: { zh: string; en: string };
  category: 'attention' | 'ffn' | 'norm';
  defaultPrecision: Precision;
  x: number;
  y: number;
}

interface OpEdge {
  from: string;
  to: string;
}

type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

const W = 800;
const H = 560;

const PRECISION_COLORS: Record<Precision, string> = {
  FP32: COLORS.primary,
  FP16: COLORS.green,
  INT8: COLORS.orange,
  INT4: COLORS.red,
};

const PRECISION_ORDER: Precision[] = ['FP32', 'FP16', 'INT8', 'INT4'];

const OPS: OpNode[] = [
  { id: 'qkv', label: { zh: 'QKV 投影', en: 'QKV Projection' }, category: 'attention', defaultPrecision: 'FP16', x: 100, y: 40 },
  { id: 'attn_score', label: { zh: '注意力分数', en: 'Attn Score' }, category: 'attention', defaultPrecision: 'FP16', x: 100, y: 110 },
  { id: 'softmax', label: { zh: 'Softmax', en: 'Softmax' }, category: 'norm', defaultPrecision: 'FP16', x: 100, y: 180 },
  { id: 'attn_out', label: { zh: '注意力输出', en: 'Attn Output' }, category: 'attention', defaultPrecision: 'FP16', x: 100, y: 250 },
  { id: 'out_proj', label: { zh: '输出投影', en: 'Output Proj' }, category: 'attention', defaultPrecision: 'FP16', x: 100, y: 320 },
  { id: 'ln1', label: { zh: 'LayerNorm 1', en: 'LayerNorm 1' }, category: 'norm', defaultPrecision: 'FP16', x: 320, y: 40 },
  { id: 'ffn_up', label: { zh: 'FFN Up', en: 'FFN Up' }, category: 'ffn', defaultPrecision: 'FP16', x: 320, y: 110 },
  { id: 'gelu', label: { zh: 'GeLU', en: 'GeLU' }, category: 'ffn', defaultPrecision: 'FP16', x: 320, y: 180 },
  { id: 'ffn_down', label: { zh: 'FFN Down', en: 'FFN Down' }, category: 'ffn', defaultPrecision: 'FP16', x: 320, y: 250 },
  { id: 'ln2', label: { zh: 'LayerNorm 2', en: 'LayerNorm 2' }, category: 'norm', defaultPrecision: 'FP16', x: 320, y: 320 },
];

const EDGES: OpEdge[] = [
  { from: 'qkv', to: 'attn_score' },
  { from: 'attn_score', to: 'softmax' },
  { from: 'softmax', to: 'attn_out' },
  { from: 'attn_out', to: 'out_proj' },
  { from: 'out_proj', to: 'ln1' },
  { from: 'ln1', to: 'ffn_up' },
  { from: 'ffn_up', to: 'gelu' },
  { from: 'gelu', to: 'ffn_down' },
  { from: 'ffn_down', to: 'ln2' },
];

type StrategyId = 'fp16' | 'w4a16' | 'w8a8' | 'custom';

interface Strategy {
  id: StrategyId;
  label: { zh: string; en: string };
  precisions: Record<string, Precision>;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'fp16',
    label: { zh: '全 FP16', en: 'All FP16' },
    precisions: Object.fromEntries(OPS.map(op => [op.id, 'FP16' as Precision])),
  },
  {
    id: 'w4a16',
    label: { zh: 'W4A16', en: 'W4A16' },
    precisions: {
      qkv: 'INT4', attn_score: 'FP16', softmax: 'FP16', attn_out: 'FP16',
      out_proj: 'INT4', ln1: 'FP16', ffn_up: 'INT4', gelu: 'FP16',
      ffn_down: 'INT4', ln2: 'FP16',
    },
  },
  {
    id: 'w8a8',
    label: { zh: 'W8A8', en: 'W8A8' },
    precisions: {
      qkv: 'INT8', attn_score: 'INT8', softmax: 'FP16', attn_out: 'INT8',
      out_proj: 'INT8', ln1: 'FP16', ffn_up: 'INT8', gelu: 'FP16',
      ffn_down: 'INT8', ln2: 'FP16',
    },
  },
  {
    id: 'custom',
    label: { zh: '自定义', en: 'Custom' },
    precisions: Object.fromEntries(OPS.map(op => [op.id, 'FP16' as Precision])),
  },
];

function getQualityRisk(opId: string, precision: Precision): RiskLevel {
  const op = OPS.find(o => o.id === opId);
  if (!op) return 'NONE';
  // Softmax/LayerNorm at <FP16 -> HIGH
  if ((opId === 'softmax' || opId === 'ln1' || opId === 'ln2') && (precision === 'INT8' || precision === 'INT4')) return 'HIGH';
  // Attention score at <FP16 -> MEDIUM
  if (opId === 'attn_score' && (precision === 'INT8' || precision === 'INT4')) return 'MEDIUM';
  // GeLU at <FP16 -> MEDIUM
  if (opId === 'gelu' && (precision === 'INT8' || precision === 'INT4')) return 'MEDIUM';
  // MatMul ops at INT4 -> MEDIUM
  if (op.category === 'matmul' && precision === 'INT4') return 'MEDIUM';
  // FFN at INT8/INT4 -> LOW
  if (op.category === 'ffn' && (precision === 'INT8' || precision === 'INT4')) return 'LOW';
  return 'NONE';
}

function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'HIGH': return COLORS.red;
    case 'MEDIUM': return COLORS.orange;
    case 'LOW': return '#b8860b';
    case 'NONE': return COLORS.green;
  }
}

export default function MixedPrecisionGraph({ locale = 'zh' }: Props) {
  const [activeStrategy, setActiveStrategy] = useState<StrategyId>('fp16');
  const [customPrecisions, setCustomPrecisions] = useState<Record<string, Precision>>(
    Object.fromEntries(OPS.map(op => [op.id, 'FP16' as Precision]))
  );

  const t = {
    zh: {
      title: 'Transformer 层混合精度计算图',
      memory: '显存',
      throughput: '吞吐量',
      qualityRisk: '质量风险',
      clickToChange: '(自定义模式下点击节点切换精度)',
      attention: '注意力模块',
      ffn: 'FFN 模块',
      riskNone: '无风险',
      riskLow: '低风险',
      riskMedium: '中风险',
      riskHigh: '高风险',
      relative: '相对值',
    },
    en: {
      title: 'Transformer Layer Mixed-Precision Graph',
      memory: 'Memory',
      throughput: 'Throughput',
      qualityRisk: 'Quality Risk',
      clickToChange: '(Click nodes to cycle precision in Custom mode)',
      attention: 'Attention Block',
      ffn: 'FFN Block',
      riskNone: 'No Risk',
      riskLow: 'Low Risk',
      riskMedium: 'Medium Risk',
      riskHigh: 'High Risk',
      relative: 'Relative',
    },
  }[locale]!;

  const currentPrecisions = useMemo(() => {
    if (activeStrategy === 'custom') return customPrecisions;
    return STRATEGIES.find(s => s.id === activeStrategy)!.precisions;
  }, [activeStrategy, customPrecisions]);

  const metrics = useMemo(() => {
    const precisionWeights: Record<Precision, { mem: number; speed: number }> = {
      FP32: { mem: 1.0, speed: 0.25 },
      FP16: { mem: 0.5, speed: 1.0 },
      INT8: { mem: 0.25, speed: 1.8 },
      INT4: { mem: 0.125, speed: 1.4 }, // lower than INT8 due to dequant overhead
    };
    let totalMem = 0;
    let totalSpeed = 0;
    let maxRisk: RiskLevel = 'NONE';
    const riskOrder: RiskLevel[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];

    OPS.forEach(op => {
      const p = currentPrecisions[op.id] || 'FP16';
      const w = precisionWeights[p];
      totalMem += w.mem;
      totalSpeed += w.speed;
      const risk = getQualityRisk(op.id, p);
      if (riskOrder.indexOf(risk) > riskOrder.indexOf(maxRisk)) maxRisk = risk;
    });
    const baselineMem = OPS.length * 0.5; // FP16 baseline
    const baselineSpeed = OPS.length * 1.0;
    return {
      memPercent: Math.round((totalMem / baselineMem) * 100),
      speedPercent: Math.round((totalSpeed / baselineSpeed) * 100),
      risk: maxRisk,
    };
  }, [currentPrecisions]);

  const handleNodeClick = (opId: string) => {
    if (activeStrategy !== 'custom') return;
    setCustomPrecisions(prev => {
      const currentIdx = PRECISION_ORDER.indexOf(prev[opId] || 'FP16');
      const nextIdx = (currentIdx + 1) % PRECISION_ORDER.length;
      return { ...prev, [opId]: PRECISION_ORDER[nextIdx] };
    });
  };

  const nodeW = 130;
  const nodeH = 50;
  const graphOffsetX = 50;
  const graphOffsetY = 55;

  return (
    <div className="my-6">
      {/* Strategy selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STRATEGIES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStrategy(s.id)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: activeStrategy === s.id ? COLORS.primary : COLORS.bgAlt,
              color: activeStrategy === s.id ? '#fff' : COLORS.dark,
              border: `1px solid ${activeStrategy === s.id ? COLORS.primary : COLORS.light}`,
            }}
          >
            {s.label[locale]}
          </button>
        ))}
      </div>

      {activeStrategy === 'custom' && (
        <p className="text-xs mb-2" style={{ color: COLORS.mid }}>{t.clickToChange}</p>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="mpg-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 7 3, 0 6" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={25} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Section labels */}
        <rect x={graphOffsetX - 10} y={graphOffsetY - 5} width={nodeW + 70} height={365} rx={6} fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />
        <text x={graphOffsetX + nodeW / 2 + 20} y={graphOffsetY + 380} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontWeight="600">
          {t.attention}
        </text>

        <rect x={graphOffsetX + 210} y={graphOffsetY - 5} width={nodeW + 70} height={365} rx={6} fill="none" stroke={COLORS.light} strokeWidth="1" strokeDasharray="4 2" />
        <text x={graphOffsetX + 210 + nodeW / 2 + 20} y={graphOffsetY + 380} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontWeight="600">
          {t.ffn}
        </text>

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const fromOp = OPS.find(o => o.id === edge.from)!;
          const toOp = OPS.find(o => o.id === edge.to)!;
          const fx = graphOffsetX + fromOp.x + nodeW / 2;
          const fy = graphOffsetY + fromOp.y + nodeH;
          const tx = graphOffsetX + toOp.x + nodeW / 2;
          const ty = graphOffsetY + toOp.y;
          // If crossing between attention and FFN, use a curve
          const isCross = fromOp.x !== toOp.x;
          if (isCross) {
            const midX = (fx + tx) / 2;
            return (
              <path
                key={`edge-${i}`}
                d={`M${fx},${fy} C${fx},${fy + 30} ${tx},${ty - 30} ${tx},${ty}`}
                fill="none"
                stroke={COLORS.light}
                strokeWidth="1.5"
                markerEnd="url(#mpg-arrow)"
              />
            );
          }
          return (
            <line
              key={`edge-${i}`}
              x1={fx} y1={fy} x2={tx} y2={ty}
              stroke={COLORS.light}
              strokeWidth="1.5"
              markerEnd="url(#mpg-arrow)"
            />
          );
        })}

        {/* Nodes */}
        {OPS.map((op, i) => {
          const prec = currentPrecisions[op.id] || 'FP16';
          const color = PRECISION_COLORS[prec];
          const risk = getQualityRisk(op.id, prec);
          const nx = graphOffsetX + op.x;
          const ny = graphOffsetY + op.y;

          return (
            <g
              key={op.id}
              onClick={() => handleNodeClick(op.id)}
              style={{ cursor: activeStrategy === 'custom' ? 'pointer' : 'default' }}
            >
              <motion.rect
                x={nx}
                y={ny}
                width={nodeW}
                height={nodeH}
                rx={6}
                fill={COLORS.bgAlt}
                stroke={color}
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, stroke: color }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              />
              <text
                x={nx + nodeW / 2}
                y={ny + 20}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={COLORS.dark}
              >
                {op.label[locale]}
              </text>
              {/* Precision label */}
              <motion.rect
                x={nx + nodeW / 2 - 22}
                y={ny + 28}
                width={44}
                height={16}
                rx={3}
                fill={color}
                fillOpacity={0.15}
                animate={{ fill: color }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={nx + nodeW / 2}
                y={ny + 41}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fontFamily={FONTS.mono}
                fill={color}
                animate={{ fill: color }}
                transition={{ duration: 0.3 }}
              >
                {prec}
              </motion.text>
              {/* Risk indicator dot */}
              {risk !== 'NONE' && (
                <circle
                  cx={nx + nodeW - 8}
                  cy={ny + 8}
                  r={5}
                  fill={riskColor(risk)}
                  fillOpacity={0.8}
                />
              )}
            </g>
          );
        })}

        {/* Metrics panel (right side) */}
        <g transform={`translate(${W - 250}, ${graphOffsetY})`}>
          <rect x={0} y={0} width={220} height={200} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={110} y={25} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}>Metrics</text>

          {/* Memory bar */}
          <text x={15} y={55} fontSize="11" fontWeight="600" fill={COLORS.dark}>{t.memory}</text>
          <rect x={15} y={62} width={190} height={14} rx={3} fill={COLORS.light} />
          <motion.rect
            x={15} y={62}
            width={190}
            height={14} rx={3}
            fill={metrics.memPercent > 100 ? COLORS.red : COLORS.primary}
            fillOpacity={0.7}
            animate={{ width: Math.min(190, (metrics.memPercent / 200) * 190) }}
            transition={{ duration: 0.4 }}
          />
          <text x={110} y={73} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.dark}>
            {metrics.memPercent}% ({t.relative})
          </text>

          {/* Throughput bar */}
          <text x={15} y={100} fontSize="11" fontWeight="600" fill={COLORS.dark}>{t.throughput}</text>
          <rect x={15} y={107} width={190} height={14} rx={3} fill={COLORS.light} />
          <motion.rect
            x={15} y={107}
            width={190}
            height={14} rx={3}
            fill={COLORS.green}
            fillOpacity={0.7}
            animate={{ width: Math.min(190, (metrics.speedPercent / 200) * 190) }}
            transition={{ duration: 0.4 }}
          />
          <text x={110} y={118} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.dark}>
            {metrics.speedPercent}% ({t.relative})
          </text>

          {/* Quality Risk */}
          <text x={15} y={148} fontSize="11" fontWeight="600" fill={COLORS.dark}>{t.qualityRisk}</text>
          <rect x={15} y={155} width={190} height={24} rx={4} fill={riskColor(metrics.risk)} fillOpacity={0.12} stroke={riskColor(metrics.risk)} strokeWidth="1" />
          <text x={110} y={171} textAnchor="middle" fontSize="12" fontWeight="700" fill={riskColor(metrics.risk)}>
            {metrics.risk === 'NONE' ? t.riskNone : metrics.risk === 'LOW' ? t.riskLow : metrics.risk === 'MEDIUM' ? t.riskMedium : t.riskHigh}
          </text>
        </g>

        {/* Precision legend (right side, below metrics) */}
        <g transform={`translate(${W - 250}, ${graphOffsetY + 220})`}>
          {PRECISION_ORDER.map((p, i) => (
            <g key={p} transform={`translate(0, ${i * 22})`}>
              <rect x={15} y={0} width={14} height={14} rx={3} fill={PRECISION_COLORS[p]} fillOpacity={0.2} stroke={PRECISION_COLORS[p]} strokeWidth="1.5" />
              <text x={35} y={11} fontSize="11" fontWeight="600" fontFamily={FONTS.mono} fill={PRECISION_COLORS[p]}>{p}</text>
            </g>
          ))}
        </g>

        {/* Risk legend */}
        <g transform={`translate(${W - 250}, ${graphOffsetY + 330})`}>
          {([['HIGH', t.riskHigh], ['MEDIUM', t.riskMedium], ['LOW', t.riskLow]] as [RiskLevel, string][]).map(([risk, label], i) => (
            <g key={risk} transform={`translate(0, ${i * 20})`}>
              <circle cx={22} cy={7} r={5} fill={riskColor(risk)} fillOpacity={0.8} />
              <text x={35} y={11} fontSize="10" fill={COLORS.mid}>{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
