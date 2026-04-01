import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import MatrixGrid from '../primitives/MatrixGrid';
import { seededValuesSigned as seededValues, dot, softmax1d } from '../primitives/mathUtils';

/**
 * KVCacheDemo — B-level step animation simulating a 5-token decode process.
 *
 * Shows how KV Cache grows during autoregressive decoding:
 *   - Each step: new token's Q attends to cached K, then K/V cache grows by one row
 *   - Highlights the newly added row in K/V cache
 *
 * Uses a small example: d_k=3, starting with 2 prefilled tokens, then decoding 5 more.
 */

export default function KVCacheDemo() {
  const dk = 3;
  const prefillLen = 2;
  const decodeSteps = 5;
  const totalTokens = prefillLen + decodeSteps;

  // Generate all Q, K, V vectors for all tokens up front
  const allQ = useMemo(() => seededValues(totalTokens, dk, 42), []);
  const allK = useMemo(() => seededValues(totalTokens, dk, 137), []);
  const allV = useMemo(() => seededValues(totalTokens, dk, 256), []);

  const tokenNames = ['t₁', 't₂', 't₃', 't₄', 't₅', 't₆', 't₇'];
  const dkLabels = ['d₁', 'd₂', 'd₃'];
  const scaleFactor = 1 / Math.sqrt(dk);

  const steps = Array.from({ length: decodeSteps }, (_, stepIdx) => {
    // Current decode token index (0-based in full sequence)
    const newTokenIdx = prefillLen + stepIdx;
    // Cache before this step contains tokens [0 .. newTokenIdx-1]
    const cacheSizeBefore = newTokenIdx;
    // Cache after this step contains tokens [0 .. newTokenIdx]
    const cacheSizeAfter = newTokenIdx + 1;

    // Current token's query vector
    const q = allQ[newTokenIdx];
    // New K and V vectors to append
    const newK = allK[newTokenIdx];
    const newV = allV[newTokenIdx];

    // K cache after appending (rows 0..newTokenIdx)
    const kCacheAfter = allK.slice(0, cacheSizeAfter);
    const vCacheAfter = allV.slice(0, cacheSizeAfter);

    // Attention scores: q dot each cached k, scaled
    const rawScores = kCacheAfter.map(k => dot(q, k));
    const scaledScores = rawScores.map(s => parseFloat((s * scaleFactor).toFixed(2)));
    const attnWeights = softmax1d(scaledScores);

    // Weighted sum over V cache
    const output = Array.from({ length: dk }, (_, d) => {
      let sum = 0;
      for (let i = 0; i < cacheSizeAfter; i++) {
        sum += attnWeights[i] * vCacheAfter[i][d];
      }
      return parseFloat(sum.toFixed(2));
    });

    const cacheRowLabels = tokenNames.slice(0, cacheSizeAfter);
    const scoreColLabels = tokenNames.slice(0, cacheSizeAfter);

    return {
      title: `Decode 第 ${stepIdx + 1} 步 — 生成 ${tokenNames[newTokenIdx]}`,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            当前 token <strong>{tokenNames[newTokenIdx]}</strong> 的 Query 向量与 KV Cache 中的所有 Key 做点积，
            然后将新的 K、V 追加到缓存。缓存从 <strong>{cacheSizeBefore}</strong> 行增长到{' '}
            <strong>{cacheSizeAfter}</strong> 行。
          </p>

          {/* Query vector */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              新 token 的 Query 向量
            </div>
            <MatrixGrid
              data={[q]}
              label={`q (${tokenNames[newTokenIdx]})`}
              shape={`(1, ${dk})`}
              colLabels={dkLabels}
              highlightRows={[0]}
              highlightColor="#dbeafe"
              compact
            />
          </div>

          {/* K Cache and V Cache side by side */}
          <div className="flex flex-wrap justify-center items-start gap-6 mb-4">
            <MatrixGrid
              data={kCacheAfter}
              label="K Cache（追加后）"
              shape={`(${cacheSizeAfter}, ${dk})`}
              rowLabels={cacheRowLabels}
              colLabels={dkLabels}
              highlightRows={[cacheSizeAfter - 1]}
              highlightColor="#bbf7d0"
              compact
            />
            <MatrixGrid
              data={vCacheAfter}
              label="V Cache（追加后）"
              shape={`(${cacheSizeAfter}, ${dk})`}
              rowLabels={cacheRowLabels}
              colLabels={dkLabels}
              highlightRows={[cacheSizeAfter - 1]}
              highlightColor="#bbf7d0"
              compact
            />
          </div>

          {/* Attention scores */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              注意力分数（q · K^T / √d_k → softmax）
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MatrixGrid
                data={[scaledScores]}
                label="缩放后分数"
                colLabels={scoreColLabels}
                highlightCells={[[0, cacheSizeAfter - 1]]}
                highlightColor="#fef3c7"
                compact
              />
              <span className="text-lg text-gray-400">→</span>
              <MatrixGrid
                data={[attnWeights]}
                label="注意力权重"
                colLabels={scoreColLabels}
                highlightCells={[[0, cacheSizeAfter - 1]]}
                highlightColor="#ede9fe"
                compact
              />
            </div>
          </div>

          {/* Output */}
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              输出 = 权重 × V Cache
            </div>
            <MatrixGrid
              data={[output]}
              label={`output (${tokenNames[newTokenIdx]})`}
              shape={`(1, ${dk})`}
              colLabels={dkLabels}
              highlightRows={[0]}
              highlightColor="#fbcfe8"
              compact
            />
          </div>

          {/* Info box */}
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>绿色高亮行</strong>是本步新追加的 K/V 缓存行。无需重新计算之前 token 的 K、V — 它们已经在缓存中。
            KV Cache 大小: {cacheSizeBefore} → {cacheSizeAfter} 行。
          </div>
        </div>
      ),
    };
  });

  return <StepNavigator steps={steps} />;
}
