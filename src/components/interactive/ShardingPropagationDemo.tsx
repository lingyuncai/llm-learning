import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

interface Props {
  locale?: 'zh' | 'en';
}

interface TensorAnnotation {
  id: string;
  shape: string;
  shardDim: number | null;
  status: 'unresolved' | 'user_annotated' | 'propagated';
}

interface CommOp {
  id: string;
  type: 'all_reduce' | 'all_gather' | 'reduce_scatter' | 'all_to_all';
  position: { afterNodeId: string };
  volume: string;
}

const W = 800;
const H = 540;

/* ─── Graph Layout ─── */

const NODE_W = 110;
const NODE_H = 44;
const TENSOR_W = 90;
const TENSOR_H = 34;

interface NodeDef {
  id: string;
  x: number;
  y: number;
  type: 'tensor' | 'op' | 'comm';
  label: { zh: string; en: string };
}

const BASE_NODES: NodeDef[] = [
  { id: 'X',    x: 80,  y: 60,  type: 'tensor', label: { zh: 'X', en: 'X' } },
  { id: 'W1',   x: 280, y: 60,  type: 'tensor', label: { zh: 'W1', en: 'W1' } },
  { id: 'mm1',  x: 180, y: 170, type: 'op',     label: { zh: 'MatMul₁', en: 'MatMul₁' } },
  { id: 'relu', x: 180, y: 270, type: 'op',     label: { zh: 'ReLU', en: 'ReLU' } },
  { id: 'W2',   x: 380, y: 270, type: 'tensor', label: { zh: 'W2', en: 'W2' } },
  { id: 'mm2',  x: 280, y: 370, type: 'op',     label: { zh: 'MatMul₂', en: 'MatMul₂' } },
  { id: 'Y',    x: 280, y: 480, type: 'tensor', label: { zh: 'Y', en: 'Y' } },
];

const EDGES: [string, string][] = [
  ['X', 'mm1'], ['W1', 'mm1'],
  ['mm1', 'relu'],
  ['relu', 'mm2'], ['W2', 'mm2'],
  ['mm2', 'Y'],
];

function getShapeStr(id: string, N: number, step: number): { shape: string; shard: string } {
  const sharded = step >= 2;
  switch (id) {
    case 'X':    return { shape: `[B, S, D]`,       shard: step >= 1 ? 'replicated' : '?' };
    case 'W1':   return { shape: `[D, 4D]`,         shard: step >= 1 ? `col[D, 4D/${N}]` : '?' };
    case 'mm1':  return { shape: `[B, S, 4D]`,      shard: sharded ? `[B, S, 4D/${N}]` : '?' };
    case 'relu': return { shape: `[B, S, 4D]`,      shard: sharded ? `[B, S, 4D/${N}]` : '?' };
    case 'W2':   return { shape: `[4D, D]`,         shard: sharded ? `row[4D/${N}, D]` : '?' };
    case 'mm2':  return { shape: `[B, S, D]`,       shard: sharded ? `partial` : '?' };
    case 'Y':    return { shape: `[B, S, D]`,       shard: step >= 3 ? 'replicated' : (sharded ? 'partial' : '?') };
    default:     return { shape: '', shard: '?' };
  }
}

function getStatus(id: string, step: number): TensorAnnotation['status'] {
  if (step === 0) return 'unresolved';
  if (step === 1 && id === 'W1') return 'user_annotated';
  if (step === 1) return 'unresolved';
  if (step >= 2 && id === 'W1') return 'user_annotated';
  if (step >= 2) return 'propagated';
  return 'unresolved';
}

function statusColor(status: TensorAnnotation['status']): string {
  switch (status) {
    case 'user_annotated': return HEAD_COLORS[1]; // green
    case 'propagated':     return COLORS.primary;
    case 'unresolved':     return COLORS.mid;
  }
}

function statusBg(status: TensorAnnotation['status']): string {
  switch (status) {
    case 'user_annotated': return '#e8f5e9';
    case 'propagated':     return '#e3f2fd';
    case 'unresolved':     return COLORS.bgAlt;
  }
}

export default function ShardingPropagationDemo({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'GSPMD Sharding Propagation',
      step1Title: '用户标注',
      step1Desc: '点击 W1 标注为列并行：将 4D 维度切分到 N 个设备。其他张量显示 "?" 表示未决定。',
      step2Title: '传播推导',
      step2Desc: '编译器根据 MatMul 的 sharding 规则自动推导：W1 列切分 → MatMul₁ 输出按最后一维切分 → ReLU 保持 → W2 必须行切分 → MatMul₂ 输出为 partial sum。',
      step3Title: '通信插入',
      step3Desc: '编译器检测到 MatMul₂ 输出为 partial sum，自动插入 AllReduce 通信算子以获得完整结果。',
      deviceCount: '设备数 N',
      clickToAnnotate: '← 点击标注 W1',
      allReduce: 'AllReduce',
      commCost: '通信量',
      sharding: '切分',
      replicated: '全副本',
      partial: '部分和',
    },
    en: {
      title: 'GSPMD Sharding Propagation',
      step1Title: 'User Annotation',
      step1Desc: 'Click W1 to annotate as column-parallel: split the 4D dimension across N devices. Other tensors show "?" for undecided.',
      step2Title: 'Propagation',
      step2Desc: 'The compiler infers sharding via MatMul rules: W1 col-split → MatMul₁ output split on last dim → ReLU preserves → W2 must be row-split → MatMul₂ output is partial sum.',
      step3Title: 'Comm Insertion',
      step3Desc: 'The compiler detects MatMul₂ output is a partial sum and inserts an AllReduce to produce the full result.',
      deviceCount: 'Devices N',
      clickToAnnotate: '← Click to annotate W1',
      allReduce: 'AllReduce',
      commCost: 'Comm volume',
      sharding: 'Sharding',
      replicated: 'replicated',
      partial: 'partial sum',
    },
  }[locale]!;

  const [N, setN] = useState(4);

  const renderGraph = (step: number) => {
    const showComm = step >= 3;
    const commNode: NodeDef = {
      id: 'ar', x: 280, y: 430, type: 'comm',
      label: { zh: t.allReduce, en: t.allReduce },
    };

    const nodes = step >= 3
      ? [...BASE_NODES.map(n => n.id === 'Y' ? { ...n, y: 500 } : n), commNode]
      : BASE_NODES;

    const edges: [string, string][] = step >= 3
      ? [
          ['X', 'mm1'], ['W1', 'mm1'],
          ['mm1', 'relu'],
          ['relu', 'mm2'], ['W2', 'mm2'],
          ['mm2', 'ar'],
          ['ar', 'Y'],
        ]
      : EDGES;

    // Compute comm volume
    const commVolume = `B*S*D*${4}/${N}`;

    return (
      <div className="my-4">
        {/* Device count buttons */}
        <div className="flex items-center gap-2 mb-3 justify-center">
          <span className="text-xs font-medium text-gray-600">{t.deviceCount}:</span>
          {[2, 4, 8].map(v => (
            <button
              key={v}
              onClick={() => setN(v)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                N === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${step >= 3 ? 560 : H}`} className="w-full">
          <style>{`text { font-family: ${FONTS.sans}; }`}</style>
          <defs>
            <marker id="sp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
            <marker id="sp-arrow-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
            </marker>
            <marker id="sp-arrow-orange" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.orange} />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(([from, to]) => {
            const fromNode = nodes.find(n => n.id === from)!;
            const toNode = nodes.find(n => n.id === to)!;
            const fx = fromNode.x + (fromNode.type === 'tensor' ? TENSOR_W / 2 : NODE_W / 2);
            const fy = fromNode.y + (fromNode.type === 'tensor' ? TENSOR_H : NODE_H);
            const tx = toNode.x + (toNode.type === 'tensor' ? TENSOR_W / 2 : NODE_W / 2);
            const ty = toNode.y;
            const isComm = from === 'mm2' && to === 'ar';
            const markerColor = isComm ? 'sp-arrow-orange' : (step >= 2 ? 'sp-arrow-blue' : 'sp-arrow');
            return (
              <line
                key={`${from}-${to}`}
                x1={fx} y1={fy} x2={tx} y2={ty}
                stroke={isComm ? COLORS.orange : (step >= 2 ? COLORS.primary : COLORS.mid)}
                strokeWidth={1.5}
                markerEnd={`url(#${markerColor})`}
                opacity={0.6}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const status = node.type === 'comm' ? 'propagated' : getStatus(node.id, step);
            const shapeInfo = getShapeStr(node.id, N, step);
            const isComm = node.type === 'comm';
            const w = node.type === 'tensor' ? TENSOR_W : NODE_W;
            const h = node.type === 'tensor' ? TENSOR_H : NODE_H;

            return (
              <g key={node.id}>
                {/* Propagation wave animation */}
                {step === 2 && status === 'propagated' && node.type !== 'comm' && (
                  <motion.rect
                    x={node.x - 3} y={node.y - 3}
                    width={w + 6} height={h + 6}
                    rx={isComm ? 20 : (node.type === 'tensor' ? 6 : 4)}
                    fill="none"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 0.8, 0], scale: [0.95, 1.02, 1.05] }}
                    transition={{ duration: 1.2, delay: node.id === 'mm1' ? 0.2 : node.id === 'relu' ? 0.5 : node.id === 'W2' ? 0.8 : node.id === 'mm2' ? 1.0 : 0.3 }}
                  />
                )}

                {/* Node rect */}
                <rect
                  x={node.x} y={node.y}
                  width={w} height={h}
                  rx={isComm ? 18 : (node.type === 'tensor' ? 5 : 3)}
                  fill={isComm ? '#fff3e0' : statusBg(status)}
                  stroke={isComm ? COLORS.orange : statusColor(status)}
                  strokeWidth={isComm ? 2.5 : (status === 'unresolved' ? 1 : 2)}
                  strokeDasharray={isComm ? '6 3' : 'none'}
                />

                {/* Node label */}
                <text
                  x={node.x + w / 2} y={node.y + (isComm ? h / 2 + 1 : 15)}
                  textAnchor="middle"
                  fontSize={isComm ? 11 : (node.type === 'tensor' ? 11 : 12)}
                  fontWeight="700"
                  fill={isComm ? COLORS.orange : statusColor(status)}
                >
                  {node.label[locale]}
                </text>

                {/* Shape annotation below node */}
                {!isComm && (
                  <text
                    x={node.x + w / 2}
                    y={node.y + (node.type === 'tensor' ? 28 : 32)}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily={FONTS.mono}
                    fill={COLORS.mid}
                  >
                    {shapeInfo.shape}
                  </text>
                )}

                {/* Sharding annotation to the right */}
                {!isComm && (
                  <motion.text
                    x={node.x + w + 8}
                    y={node.y + h / 2 + 4}
                    fontSize={9}
                    fontFamily={FONTS.mono}
                    fill={statusColor(status)}
                    fontWeight={status !== 'unresolved' ? '600' : '400'}
                    initial={step >= 2 && status === 'propagated' ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: node.id === 'mm1' ? 0.3 : node.id === 'relu' ? 0.6 : node.id === 'W2' ? 0.9 : node.id === 'mm2' ? 1.1 : 0.1 }}
                  >
                    {shapeInfo.shard}
                  </motion.text>
                )}

                {/* "Click to annotate" hint for W1 in step 1 */}
                {step === 1 && node.id === 'W1' && (
                  <motion.text
                    x={node.x + w + 8} y={node.y + h / 2 - 8}
                    fontSize={9}
                    fill={HEAD_COLORS[1]}
                    fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t.clickToAnnotate}
                  </motion.text>
                )}

                {/* Comm volume annotation */}
                {isComm && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <text
                      x={node.x + w + 12} y={node.y + h / 2 + 4}
                      fontSize={9}
                      fontFamily={FONTS.mono}
                      fill={COLORS.orange}
                      fontWeight="600"
                    >
                      {t.commCost}: {commVolume}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(560, 60)`}>
            <text x={0} y={0} fontSize={10} fontWeight="700" fill={COLORS.dark}>{t.sharding}:</text>
            {[
              { color: HEAD_COLORS[1], bg: '#e8f5e9', label: locale === 'zh' ? '用户标注' : 'User annotated' },
              { color: COLORS.primary, bg: '#e3f2fd', label: locale === 'zh' ? '自动传播' : 'Auto propagated' },
              { color: COLORS.mid, bg: COLORS.bgAlt, label: locale === 'zh' ? '未决定' : 'Unresolved' },
              { color: COLORS.orange, bg: '#fff3e0', label: locale === 'zh' ? '通信算子' : 'Comm op' },
            ].map((item, i) => (
              <g key={i} transform={`translate(0, ${18 + i * 22})`}>
                <rect x={0} y={-8} width={14} height={14} rx={3}
                  fill={item.bg} stroke={item.color} strokeWidth={1.5} />
                <text x={20} y={3} fontSize={9} fill={COLORS.dark}>{item.label}</text>
              </g>
            ))}
          </g>

          {/* Device visualization at bottom */}
          {step >= 1 && (
            <g transform={`translate(530, 200)`}>
              <text x={0} y={0} fontSize={10} fontWeight="700" fill={COLORS.dark}>
                {locale === 'zh' ? '设备' : 'Devices'}:
              </text>
              {Array.from({ length: N }).map((_, i) => (
                <g key={i} transform={`translate(0, ${14 + i * 24})`}>
                  <rect x={0} y={0} width={60} height={18} rx={3}
                    fill={HEAD_COLORS[i % HEAD_COLORS.length]} opacity={0.15}
                    stroke={HEAD_COLORS[i % HEAD_COLORS.length]} strokeWidth={1} />
                  <text x={30} y={13} textAnchor="middle" fontSize={9}
                    fill={HEAD_COLORS[i % HEAD_COLORS.length]} fontWeight="600">
                    GPU {i}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
    );
  };

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">{t.step1Desc}</p>
          {renderGraph(1)}
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">{t.step2Desc}</p>
          {renderGraph(2)}
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">{t.step3Desc}</p>
          {renderGraph(3)}
        </div>
      ),
    },
  ];

  return (
    <div className="my-6">
      <StepNavigator steps={steps} locale={locale} />
    </div>
  );
}
