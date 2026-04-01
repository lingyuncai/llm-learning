import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import MatrixGrid from '../primitives/MatrixGrid';
import { seededValuesSigned as seededValues, matmul, transpose } from '../primitives/mathUtils';

/**
 * AttentionStepAnimation — B-level step animation showing Scaled Dot-Product Attention.
 *
 * Uses a small example: S=4 tokens, d_k=3.
 * Steps:
 *   1. Show Q and K matrices
 *   2. Compute QK^T with row/column highlighting
 *   3. Scale by 1/sqrt(d_k)
 *   4. Apply causal mask
 *   5. Apply softmax (row-wise)
 *   6. Multiply by V to get output
 */

// Scale each element by a scalar
function scale(m: number[][], s: number): number[][] {
  return m.map(row => row.map(v => parseFloat((v * s).toFixed(2))));
}

// Apply causal mask: set upper-triangle (above diagonal) to -Infinity
function causalMask(m: number[][]): number[][] {
  return m.map((row, i) =>
    row.map((v, j) => (j > i ? -Infinity : v)),
  );
}

// Row-wise softmax with numerical stability (subtract max per row)
function softmax(m: number[][]): number[][] {
  return m.map(row => {
    const finiteVals = row.filter(v => isFinite(v));
    const maxVal = finiteVals.length > 0 ? Math.max(...finiteVals) : 0;
    const exps = row.map(v => (isFinite(v) ? Math.exp(v - maxVal) : 0));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => parseFloat((e / sum).toFixed(2)));
  });
}

// Format -Infinity as "-inf" for display
function formatCell(v: number): string {
  if (v === -Infinity) return '-∞';
  if (typeof v === 'number') return v.toFixed(2);
  return String(v);
}

// Create a display-safe matrix (replace -Infinity with a sentinel for MatrixGrid)
// MatrixGrid expects numbers, so we use a wrapper component for masked cells
function MatrixWithMask({
  data,
  label,
  shape,
  rowLabels,
  colLabels,
  highlightRows,
  highlightCols,
  highlightCells,
  highlightColor,
  compact,
}: {
  data: number[][];
  label?: string;
  shape?: string;
  rowLabels?: string[];
  colLabels?: string[];
  highlightRows?: number[];
  highlightCols?: number[];
  highlightCells?: [number, number][];
  highlightColor?: string;
  compact?: boolean;
}) {
  const hasMask = data.some(row => row.some(v => !isFinite(v)));

  if (!hasMask) {
    return (
      <MatrixGrid
        data={data}
        label={label}
        shape={shape}
        rowLabels={rowLabels}
        colLabels={colLabels}
        highlightRows={highlightRows}
        highlightCols={highlightCols}
        highlightCells={highlightCells}
        highlightColor={highlightColor}
        compact={compact}
      />
    );
  }

  const isHighlighted = (r: number, c: number) =>
    (highlightCells || []).some(([hr, hc]) => hr === r && hc === c) ||
    (highlightRows || []).includes(r) ||
    (highlightCols || []).includes(c);

  const cellSize = compact ? 'w-10 h-8 text-xs' : 'w-14 h-10 text-sm';

  return (
    <div className="inline-block">
      {label && (
        <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      )}
      <div className="inline-flex flex-col">
        {colLabels && (
          <div className="flex" style={{ marginLeft: rowLabels ? '2rem' : 0 }}>
            {colLabels.map((cl, i) => (
              <div key={i} className={`${cellSize} flex items-end justify-center pb-1 text-xs text-gray-400`}>
                {cl}
              </div>
            ))}
          </div>
        )}
        {data.map((row, r) => (
          <div key={r} className="flex items-center">
            {rowLabels && (
              <div className="w-8 text-xs text-gray-400 text-right pr-2">
                {rowLabels[r]}
              </div>
            )}
            {row.map((val, c) => (
              <div
                key={c}
                className={`${cellSize} flex items-center justify-center border border-gray-200 font-mono`}
                style={{
                  backgroundColor: !isFinite(val)
                    ? '#f3f4f6'
                    : isHighlighted(r, c)
                      ? (highlightColor || '#dbeafe')
                      : 'white',
                  transition: 'background-color 0.3s ease',
                  color: !isFinite(val) ? '#9ca3af' : undefined,
                }}
              >
                {formatCell(val)}
              </div>
            ))}
          </div>
        ))}
      </div>
      {shape && (
        <div className="text-xs text-gray-400 mt-1 text-right">{shape}</div>
      )}
    </div>
  );
}

export default function AttentionStepAnimation() {
  const S = 4;
  const dk = 3;

  // Use pre-seeded Q, K, V matrices (as if already projected)
  const Q = useMemo(() => seededValues(S, dk, 100), []);
  const K = useMemo(() => seededValues(S, dk, 200), []);
  const V = useMemo(() => seededValues(S, dk, 300), []);

  const KT = useMemo(() => transpose(K), [K]);
  const scores = useMemo(() => matmul(Q, KT), [Q, KT]);
  const scaleFactor = 1 / Math.sqrt(dk);
  const scaled = useMemo(() => scale(scores, scaleFactor), [scores, scaleFactor]);
  const masked = useMemo(() => causalMask(scaled), [scaled]);
  const weights = useMemo(() => softmax(masked), [masked]);
  const output = useMemo(() => matmul(weights, V), [weights, V]);

  const tokenLabels = ['t₁', 't₂', 't₃', 't₄'];
  const dkLabels = ['d₁', 'd₂', 'd₃'];

  const steps = [
    {
      title: 'Q 和 K 矩阵',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            从上一步的线性投影中，我们已经得到了 <code className="bg-gray-100 px-1 rounded">Q</code> 和{' '}
            <code className="bg-gray-100 px-1 rounded">K</code> 矩阵，形状都是{' '}
            <span className="font-mono text-primary-700">(S=4, d_k=3)</span>。
            接下来要计算它们之间的注意力分数。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <MatrixGrid
              data={Q}
              label="Q ∈ ℝ^(4×3)"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#dbeafe"
              highlightCols={[0, 1, 2]}
            />
            <MatrixGrid
              data={K}
              label="K ∈ ℝ^(4×3)"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#d1fae5"
              highlightCols={[0, 1, 2]}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'QK^T — 注意力原始分数',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            计算 <code className="bg-gray-100 px-1 rounded">QK^T</code>：每个 Query 向量与所有 Key 向量做点积。
            结果是一个 <span className="font-mono text-primary-700">(S, S) = (4, 4)</span> 的矩阵，
            第 <em>i</em> 行第 <em>j</em> 列表示 token <em>i</em> 对 token <em>j</em> 的"原始关注度"。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={Q}
              label="Q"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              highlightRows={[0]}
              highlightColor="#dbeafe"
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={KT}
              label="K^T"
              shape="(3, 4)"
              colLabels={tokenLabels}
              highlightCols={[0]}
              highlightColor="#d1fae5"
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={scores}
              label="QK^T"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              highlightCells={[[0, 0]]}
              highlightColor="#fef3c7"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            高亮：Q 的第 1 行 · K^T 的第 1 列 = 分数矩阵 [1,1] 位置
          </p>
        </div>
      ),
    },
    {
      title: '缩放 ÷ √d_k',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            将分数除以 <code className="bg-gray-100 px-1 rounded">√d_k = √3 ≈ 1.73</code>。
            当 d_k 较大时，点积的方差与 d_k 成正比，会导致 softmax 进入梯度极小的饱和区。
            缩放使方差恢复为 1，保持梯度健康。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={scores}
              label="QK^T"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">÷ √3</span>
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={scaled}
              label="QK^T / √d_k"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              highlightColor="#fef3c7"
              highlightRows={[0, 1, 2, 3]}
            />
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
            <strong>为什么？</strong>假设 q 和 k 的每个分量独立、均值 0、方差 1，则点积 q·k 的方差 = d_k。
            除以 √d_k 后方差变为 1，防止 softmax 输出趋近 one-hot。
          </div>
        </div>
      ),
    },
    {
      title: '因果遮罩（Causal Mask）',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            在 Decoder（自回归模型）中，token <em>i</em> 不能看到它后面的 token。
            将矩阵上三角（<em>j {'>'} i</em> 的位置）设为{' '}
            <code className="bg-gray-100 px-1 rounded">-∞</code>，
            这样 softmax 后对应位置的权重变为 0。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={scaled}
              label="缩放后"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">+ mask</span>
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixWithMask
              data={masked}
              label="遮罩后"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              highlightColor="#fee2e2"
            />
          </div>
          <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
            <strong>注意：</strong>Encoder 中的 Self-Attention 通常不使用因果遮罩（因为可以双向看）。
            这里展示的是 Decoder 场景。Encoder 只在有 padding token 时使用 padding mask。
          </div>
        </div>
      ),
    },
    {
      title: 'Softmax — 行归一化',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            对每一行做 softmax：将原始分数转化为概率分布（每行和为 1）。
            被遮罩为 -∞ 的位置经过 softmax 后变为 0。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixWithMask
              data={masked}
              label="遮罩后"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">softmax→</span>
            <MatrixGrid
              data={weights}
              label="注意力权重"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              highlightColor="#ede9fe"
              highlightRows={[0, 1, 2, 3]}
            />
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>数值稳定性：</strong>实际实现中，softmax 会先减去每行的最大值：
            <code className="bg-purple-100 px-1 rounded ml-1">softmax(x_i) = exp(x_i - max(x)) / Σexp(x_j - max(x))</code>。
            这不改变结果，但能防止 exp() 溢出。
          </div>
        </div>
      ),
    },
    {
      title: '乘以 V — 加权求和',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            最后一步：注意力权重矩阵乘以 V，得到输出。
            每个 token 的输出是所有 Value 向量的加权平均，权重就是注意力分数。
            输出形状为 <span className="font-mono text-primary-700">(S, d_k) = (4, 3)</span>。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={weights}
              label="权重"
              shape="(4, 4)"
              rowLabels={tokenLabels}
              colLabels={tokenLabels}
              highlightRows={[0]}
              highlightColor="#ede9fe"
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={V}
              label="V"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#fce7f3"
              highlightRows={[0, 1, 2, 3]}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={output}
              label="Output"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#dbeafe"
              highlightRows={[0, 1, 2, 3]}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <strong>完整流程：</strong>
            <code className="text-xs bg-gray-100 px-1 rounded">
              Output = softmax(QK^T / √d_k) · V
            </code>
            <br />
            每个 token 的输出 = 根据 Query-Key 相似度，对所有 Value 做加权平均。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
