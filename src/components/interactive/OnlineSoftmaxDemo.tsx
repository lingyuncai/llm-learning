// src/components/interactive/OnlineSoftmaxDemo.tsx
import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS } from './shared/colors';

// Small example: 3 blocks, 2 elements each
const SCORES = [
  [2.1, 3.2],   // Block 1
  [4.1, 1.5],   // Block 2
  [2.8, 3.0],   // Block 3
];

// V blocks (simplified 2x2)
const V_BLOCKS = [
  [[0.5, 0.3], [0.8, 0.1]],
  [[0.2, 0.9], [0.6, 0.4]],
  [[0.7, 0.2], [0.1, 0.8]],
];

function fmt(n: number, d = 4): string {
  return n.toFixed(d);
}

function HighlightVar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="font-semibold">{label}</span> = {value}
    </span>
  );
}

export default function OnlineSoftmaxDemo({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      init: '初始化',
      update: '递推更新',
      continue: '继续更新',
      correction: '修正因子 α 将之前所有累积量调整到新的全局 max',
      summary: '无需存储完整的 N×N 矩阵，只需维护 m, l, O 三个累积量',
      block: 'Block',
    },
    en: {
      init: 'Initialize',
      update: 'Recursive Update',
      continue: 'Continue Update',
      correction: 'Correction factor α adjusts all previous accumulators to new global max',
      summary: 'No need to store full N×N matrix, only maintain m, l, O accumulators',
      block: 'Block',
    },
  }[locale];

  const computation = useMemo(() => {
    const steps: {
      title: string;
      block: number;
      m: number;
      l: number;
      O: number[];
      alpha?: number;
      detail: string;
    }[] = [];

    // Block 1: init
    const s1 = SCORES[0];
    const m1 = Math.max(...s1);
    const exp1 = s1.map(v => Math.exp(v - m1));
    const l1 = exp1.reduce((a, b) => a + b, 0);
    const softmax1 = exp1.map(e => e / l1);
    const O1 = V_BLOCKS[0][0].map((_, col) =>
      softmax1.reduce((sum, s, row) => sum + s * V_BLOCKS[0][row][col], 0)
    );

    steps.push({
      title: `${t.block} 1: ${t.init}`,
      block: 0,
      m: m1,
      l: l1,
      O: O1,
      detail: `s₁ = [${s1.join(', ')}] → m₁ = max(${s1.join(', ')}) = ${fmt(m1, 1)} → exp(s₁ - m₁) = [${exp1.map(e => fmt(e)).join(', ')}] → l₁ = ${fmt(l1)}`,
    });

    // Block 2: update
    const s2 = SCORES[1];
    const m2_local = Math.max(...s2);
    const m2_new = Math.max(m1, m2_local);
    const alpha2 = Math.exp(m1 - m2_new);
    const exp2 = s2.map(v => Math.exp(v - m2_new));
    const l2 = alpha2 * l1 + exp2.reduce((a, b) => a + b, 0);
    const softmax2_contrib = exp2.map(e => e / l2);
    const O2 = O1.map((o, col) => {
      const old_part = alpha2 * l1 / l2 * o;
      const new_part = softmax2_contrib.reduce((sum, s, row) => sum + s * V_BLOCKS[1][row][col], 0);
      return old_part + new_part;
    });

    steps.push({
      title: `${t.block} 2: ${t.update}`,
      block: 1,
      m: m2_new,
      l: l2,
      O: O2,
      alpha: alpha2,
      detail: `s₂ = [${s2.join(', ')}] → m₂_new = max(${fmt(m1, 1)}, ${fmt(m2_local, 1)}) = ${fmt(m2_new, 1)} → α = e^(${fmt(m1, 1)}-${fmt(m2_new, 1)}) = ${fmt(alpha2)}`,
    });

    // Block 3: update
    const s3 = SCORES[2];
    const m3_local = Math.max(...s3);
    const m3_new = Math.max(m2_new, m3_local);
    const alpha3 = Math.exp(m2_new - m3_new);
    const exp3 = s3.map(v => Math.exp(v - m3_new));
    const l3 = alpha3 * l2 + exp3.reduce((a, b) => a + b, 0);
    const softmax3_contrib = exp3.map(e => e / l3);
    const O3 = O2.map((o, col) => {
      const old_part = alpha3 * l2 / l3 * o;
      const new_part = softmax3_contrib.reduce((sum, s, row) => sum + s * V_BLOCKS[2][row][col], 0);
      return old_part + new_part;
    });

    steps.push({
      title: `${t.block} 3: ${t.continue}`,
      block: 2,
      m: m3_new,
      l: l3,
      O: O3,
      alpha: alpha3,
      detail: `s₃ = [${s3.join(', ')}] → m₃_new = max(${fmt(m2_new, 1)}, ${fmt(m3_local, 1)}) = ${fmt(m3_new, 1)} → α = e^(${fmt(m2_new, 1)}-${fmt(m3_new, 1)}) = ${fmt(alpha3)}`,
    });

    return steps;
  }, [t]);

  const steps = computation.map((comp, i) => ({
    title: comp.title,
    content: (
      <div className="space-y-3">
        {/* Score blocks visualization */}
        <div className="flex gap-2 items-center flex-wrap">
          {SCORES.map((block, bi) => (
            <div key={bi} className="flex gap-1 px-2 py-1 rounded text-xs font-mono border"
              style={{
                backgroundColor: bi === comp.block ? `${COLORS.highlight}` : bi < comp.block ? `${COLORS.valid}` : COLORS.bg,
                borderColor: bi === comp.block ? COLORS.orange : bi < comp.block ? COLORS.green : COLORS.light,
              }}>
              <span className="text-[10px] mr-1" style={{ color: COLORS.mid }}>B{bi + 1}:</span>
              [{block.join(', ')}]
            </div>
          ))}
        </div>

        {/* Computation detail */}
        <p className="text-xs font-mono leading-relaxed" style={{ color: COLORS.dark }}>
          {comp.detail}
        </p>

        {/* Running state */}
        <div className="flex flex-wrap gap-2">
          <HighlightVar label="m" value={fmt(comp.m, 1)} color={COLORS.primary} />
          <HighlightVar label="l" value={fmt(comp.l)} color={COLORS.primary} />
          {comp.alpha !== undefined && (
            <HighlightVar label="α (correction)" value={fmt(comp.alpha)} color={COLORS.orange} />
          )}
          <HighlightVar label="O" value={`[${comp.O.map(v => fmt(v)).join(', ')}]`} color={COLORS.green} />
        </div>

        {comp.alpha !== undefined && (
          <p className="text-[11px] mt-1" style={{ color: COLORS.orange }}>
            ⚠ {t.correction}
          </p>
        )}
      </div>
    ),
  }));

  return (
    <div className="my-6">
      <StepNavigator steps={steps} />
      <p className="text-xs mt-2 text-center" style={{ color: COLORS.mid }}>
        {t.summary}
      </p>
    </div>
  );
}
