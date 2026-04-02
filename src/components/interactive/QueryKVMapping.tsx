import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

const h = 4;
const gqa_g = 2;

function HeadNode({ x, y, label, color, dashed = false, opacity = 1 }: {
  x: number; y: number; label: string; color: string; dashed?: boolean; opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      <rect x={x - 25} y={y - 14} width={50} height={28} rx={6}
        fill={color + '22'} stroke={color} strokeWidth={dashed ? 1 : 1.5}
        strokeDasharray={dashed ? '4,3' : 'none'} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10"
        fill={color} fontFamily="system-ui" fontWeight="600">{label}</text>
    </g>
  );
}

function ConnectionLine({ x1, y1, x2, y2, color = COLORS.mid }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.2} />;
}

function Column({ title, subtitle, qPositions, kvPositions, connections, annotations }: {
  title: string; subtitle: string;
  qPositions: { x: number; label: string }[];
  kvPositions: { x: number; label: string; dashed?: boolean; opacity?: number }[];
  connections: [number, number][];
  annotations?: { x: number; y: number; text: string }[];
}) {
  const qY = 40;
  const kvY = 120;
  return (
    <g>
      <text x={150} y={16} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.dark}
        fontFamily="system-ui">{title}</text>
      <text x={150} y={30} textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily="system-ui">{subtitle}</text>
      {connections.map(([qi, kvi], i) => (
        <ConnectionLine key={i}
          x1={qPositions[qi].x} y1={qY + 14}
          x2={kvPositions[kvi].x} y2={kvY - 14}
          color={HEAD_COLORS[qi]}
        />
      ))}
      {qPositions.map((q, i) => (
        <HeadNode key={`q-${i}`} x={q.x} y={qY} label={q.label} color={HEAD_COLORS[i]} />
      ))}
      {kvPositions.map((kv, i) => (
        <HeadNode key={`kv-${i}`} x={kv.x} y={kvY} label={kv.label}
          color={COLORS.orange} dashed={kv.dashed} opacity={kv.opacity} />
      ))}
      {annotations?.map((a, i) => (
        <text key={i} x={a.x} y={a.y} textAnchor="middle" fontSize="8"
          fill={COLORS.mid} fontFamily="system-ui">{a.text}</text>
      ))}
    </g>
  );
}

function MHADiagram() {
  const qs = [{ x: 45, label: 'Q₁' }, { x: 105, label: 'Q₂' }, { x: 195, label: 'Q₃' }, { x: 255, label: 'Q₄' }];
  const kvs = [{ x: 45, label: 'KV₁' }, { x: 105, label: 'KV₂' }, { x: 195, label: 'KV₃' }, { x: 255, label: 'KV₄' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="MHA" subtitle="一对一" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 1], [2, 2], [3, 3]]}
        annotations={[{ x: 150, y: 155, text: 'KV heads = h = 4' }]} />
    </svg>
  );
}

function GQADiagram() {
  const qs = [{ x: 40, label: 'Q₁' }, { x: 100, label: 'Q₂' }, { x: 200, label: 'Q₃' }, { x: 260, label: 'Q₄' }];
  const kvs = [{ x: 70, label: 'KV₁' }, { x: 230, label: 'KV₂' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="GQA (g=2)" subtitle="两对一" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 0], [2, 1], [3, 1]]}
        annotations={[
          { x: 70, y: 152, text: 'repeat_interleave' },
          { x: 230, y: 152, text: 'repeat_interleave' },
        ]} />
    </svg>
  );
}

function MQADiagram() {
  const qs = [{ x: 40, label: 'Q₁' }, { x: 100, label: 'Q₂' }, { x: 200, label: 'Q₃' }, { x: 260, label: 'Q₄' }];
  const kvs = [{ x: 150, label: 'KV' }];
  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-[300px]">
      <Column title="MQA" subtitle="全共享" qPositions={qs} kvPositions={kvs}
        connections={[[0, 0], [1, 0], [2, 0], [3, 0]]}
        annotations={[{ x: 150, y: 155, text: 'KV heads = 1' }]} />
    </svg>
  );
}

export default function QueryKVMapping() {
  const steps = [
    {
      title: 'MHA — 每个 Q 对应独立 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">标准多头注意力：{h} 个 Q head 各自拥有独立的 KV head。</p>
          <div className="flex justify-center"><MHADiagram /></div>
        </div>
      ),
    },
    {
      title: 'GQA — 每组 Q 共享 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            分组查询注意力：{h} 个 Q head 分为 {gqa_g} 组，每组共享一对 KV head。
            通过 <code className="bg-gray-100 px-1 rounded">repeat_interleave</code> 将 KV 复制以匹配 Q 数量。
          </p>
          <div className="flex justify-center"><GQADiagram /></div>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
            KV Cache 缩减为 MHA 的 g/h = {gqa_g}/{h} = {((gqa_g / h) * 100).toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      title: 'MQA — 所有 Q 共享同一 KV',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            多查询注意力：所有 {h} 个 Q head 共享同一对 KV head — 最极致的缩减。
          </p>
          <div className="flex justify-center"><MQADiagram /></div>
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
            KV Cache 缩减为 MHA 的 1/h = 1/{h} = {((1 / h) * 100).toFixed(1)}%
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
