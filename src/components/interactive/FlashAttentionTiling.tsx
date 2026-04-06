import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import MatrixGrid from '../primitives/MatrixGrid';
import { seededValuesSigned as seededValues, matmul, transpose } from '../primitives/mathUtils';

/**
 * FlashAttentionTiling — B-level step animation showing Flash Attention's
 * tiled computation strategy.
 *
 * Uses a small example: N=4 tokens, d=3, block size B_r=B_c=2.
 * Steps:
 *   1. Show full Q, K, V matrices with block boundaries
 *   2. Load first K, V block to "SRAM"
 *   3. Compute local attention scores for block (0,0)
 *   4. Online Softmax update — init m, l, O
 *   5. Load second K, V block, compute scores for block (0,1)
 *   6. Online Softmax correction & final result
 */

// Scale each element
function scaleMatrix(m: number[][], s: number): number[][] {
  return m.map(row => row.map(v => parseFloat((v * s).toFixed(2))));
}

// Row-wise max
function rowMax(m: number[][]): number[] {
  return m.map(row => Math.max(...row));
}

// Row-wise safe softmax numerator: exp(x - max)
function expShifted(m: number[][], maxes: number[]): number[][] {
  return m.map((row, i) =>
    row.map(v => parseFloat(Math.exp(v - maxes[i]).toFixed(4))),
  );
}

// Row-wise sum
function rowSum(m: number[][]): number[] {
  return m.map(row => parseFloat(row.reduce((a, b) => a + b, 0).toFixed(4)));
}

// Diagonal scaling: diag(s) * M  (multiply row i by s[i])
function diagScale(s: number[], m: number[][]): number[][] {
  return m.map((row, i) =>
    row.map(v => parseFloat((s[i] * v).toFixed(4))),
  );
}

// Extract sub-matrix (block)
function block(m: number[][], r0: number, r1: number, c0: number, c1: number): number[][] {
  return m.slice(r0, r1).map(row => row.slice(c0, c1));
}

// A colored label badge
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colorMap[color] || colorMap.gray}`}>
      {children}
    </span>
  );
}

// Memory location indicator
function MemoryTag({ location, sramText, hbmText }: { location: 'SRAM' | 'HBM'; sramText: string; hbmText: string }) {
  return location === 'SRAM' ? (
    <Badge color="green">{sramText}</Badge>
  ) : (
    <Badge color="amber">{hbmText}</Badge>
  );
}

export default function FlashAttentionTiling({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      sram_fast: 'SRAM (快)',
      hbm_slow: 'HBM (慢)',
      title_step1: 'Q, K, V 矩阵与分块',
      desc_step1_p1: '标准 Attention 需要存储完整的',
      desc_step1_p2: '注意力矩阵到 HBM，内存为',
      desc_step1_p3: 'Flash Attention 的核心思想：将 Q、K、V 分成小块，在 SRAM 中逐块计算，',
      desc_step1_p4: '永远不存储完整的 N×N 矩阵',
      note_step1_title: '分块：',
      note_step1_desc: '块大小 B',
      note_step1_highlight: '高亮行 = 第一个块（t₁, t₂），非高亮行 = 第二个块（t₃, t₄）。我们将以 Q 的第一个块为例，展示如何逐步处理两个 K/V 块。',
      title_step2: '加载 K₀, V₀ 到 SRAM',
      desc_step2_p1: '外层循环 j=1：',
      desc_step2_p2: '将第一个 K、V 块从 HBM 加载到 SRAM。同时加载 Q₀ 块和初始化统计量。',
      note_step2_title: '关键：',
      note_step2_desc: 'SRAM 只需容纳 2 个 B×d 的块和 1 个 B×B 的分数矩阵，而非完整的 N×N 矩阵。初始化：m = (-∞, -∞)，l = (0, 0)，O = 零矩阵。',
      title_step3: '计算局部注意力分数 S₀₀',
      desc_step3_p1: '在 SRAM 中计算',
      desc_step3_p2: '这只是一个',
      desc_step3_p3: '的小矩阵，完全在 SRAM 中完成！',
      note_step3_title: '注意：',
      note_step3_desc: '标准 Attention 会一次性计算 4×4 的完整分数矩阵并存到 HBM。Flash Attention 只计算 2×2 的局部分数，且留在 SRAM 中。',
      title_step4: 'Online Softmax — 第一次更新',
      desc_step4_p1: '核心创新：Online Softmax。',
      desc_step4_p2: '只看到部分数据就计算"临时 softmax"，后续块到来时再修正。当前对 S₀₀ 计算局部统计量：',
      stat_local: '局部统计量',
      stat_local_row: '(逐行减最大值)',
      stat_global: '更新全局统计量',
      note_step4_title: 'O 更新公式：',
      note_step4_desc: '第一次迭代中 l',
      note_step4_desc2: '就是 diag(l̃)⁻¹ · P̃₀₀ · V₀。',
      title_step5: '加载 K₁, V₁ — 计算 S₀₁',
      desc_step5_p1: '外层循环 j=2：',
      desc_step5_p2: '加载第二个 K、V 块到 SRAM，计算新的局部分数。之前的 K₀、V₀ 已经不需要了 — SRAM 空间被复用。',
      label_new_load: '新加载',
      label_still_sram: '(仍在SRAM)',
      title_step6: 'Online Softmax 修正 — 合并结果',
      desc_step6_p1: '关键步骤：',
      desc_step6_p2: '新块的 max 可能大于之前的 max，需要修正之前的部分结果。这就是 Online Softmax 的核心 — 用指数修正因子重新缩放。',
      correction_formula: '修正公式',
      correction_factor: '修正因子 e',
      correction_factor2: '确保之前的 partial sum 在新 max 下仍然正确',
      label_before: '(修正前)',
      label_before_note: '需要乘以修正因子',
      label_final: '(最终结果)',
      label_final_note: 'Q₀ 的最终输出',
      verify_title: '验证：',
      verify_desc1: 'Flash Attention 的结果与标准 Attention 完全一致（数值精度内）。',
      verify_desc2: '标准 Attention 对 Q₀ 的结果:',
      verify_desc3: 'Flash Attention 结果:',
      verify_desc4: '内存：只用了 O(N) 额外空间，从未存储 4×4 的完整注意力矩阵！',
    },
    en: {
      sram_fast: 'SRAM (fast)',
      hbm_slow: 'HBM (slow)',
      title_step1: 'Q, K, V matrices and blocking',
      desc_step1_p1: 'Standard Attention requires storing the full',
      desc_step1_p2: 'attention matrix in HBM, memory is',
      desc_step1_p3: 'Flash Attention core idea: split Q, K, V into blocks, compute in SRAM blockwise,',
      desc_step1_p4: 'never store the full N×N matrix',
      note_step1_title: 'Blocking:',
      note_step1_desc: 'block size B',
      note_step1_highlight: "Highlighted rows = first block (t₁, t₂), non-highlighted = second block (t₃, t₄). We show processing two K/V blocks using Q's first block as example.",
      title_step2: 'Load K₀, V₀ to SRAM',
      desc_step2_p1: 'Outer loop j=1:',
      desc_step2_p2: 'Load first K, V blocks from HBM to SRAM. Also load Q₀ block and initialize statistics.',
      note_step2_title: 'Key:',
      note_step2_desc: 'SRAM only needs to hold 2 B×d blocks and 1 B×B score matrix, not the full N×N matrix. Initialize: m = (-∞, -∞), l = (0, 0), O = zero matrix.',
      title_step3: 'Compute local attention scores S₀₀',
      desc_step3_p1: 'Compute in SRAM',
      desc_step3_p2: 'This is just a',
      desc_step3_p3: 'small matrix, entirely in SRAM!',
      note_step3_title: 'Note:',
      note_step3_desc: 'Standard Attention computes the full 4×4 score matrix and stores in HBM. Flash Attention only computes 2×2 local scores and keeps in SRAM.',
      title_step4: 'Online Softmax — first update',
      desc_step4_p1: 'Core innovation: Online Softmax.',
      desc_step4_p2: 'Compute "partial softmax" from partial data, correct when new blocks arrive. Compute local statistics for S₀₀:',
      stat_local: 'Local statistics',
      stat_local_row: '(row-wise subtract max)',
      stat_global: 'Update global statistics',
      note_step4_title: 'O update formula:',
      note_step4_desc: 'First iteration l',
      note_step4_desc2: 'so O is diag(l̃)⁻¹ · P̃₀₀ · V₀.',
      title_step5: 'Load K₁, V₁ — compute S₀₁',
      desc_step5_p1: 'Outer loop j=2:',
      desc_step5_p2: 'Load second K, V blocks to SRAM, compute new local scores. Previous K₀, V₀ no longer needed — SRAM space is reused.',
      label_new_load: 'newly loaded',
      label_still_sram: '(still in SRAM)',
      title_step6: 'Online Softmax correction — merge results',
      desc_step6_p1: 'Key step:',
      desc_step6_p2: 'New block max may be larger than previous max, need to correct partial results. This is the core of Online Softmax — rescale with exponential correction factor.',
      correction_formula: 'Correction formula',
      correction_factor: 'Correction factor e',
      correction_factor2: 'ensures previous partial sum remains correct under new max',
      label_before: '(before correction)',
      label_before_note: 'needs correction factor',
      label_final: '(final result)',
      label_final_note: 'Q₀ final output',
      verify_title: 'Verification:',
      verify_desc1: 'Flash Attention result matches standard Attention (within numerical precision).',
      verify_desc2: 'Standard Attention result for Q₀:',
      verify_desc3: 'Flash Attention result:',
      verify_desc4: 'Memory: only O(N) extra space, never stored the full 4×4 attention matrix!',
    },
  }[locale];

  const N = 4;
  const d = 3;
  const B = 2; // block size B_r = B_c = 2

  const Q = useMemo(() => seededValues(N, d, 42), []);
  const K = useMemo(() => seededValues(N, d, 84), []);
  const V = useMemo(() => seededValues(N, d, 126), []);

  // Blocks
  const Q0 = useMemo(() => block(Q, 0, B, 0, d), [Q]);
  const K0 = useMemo(() => block(K, 0, B, 0, d), [K]);
  const K1 = useMemo(() => block(K, B, N, 0, d), [K]);
  const V0 = useMemo(() => block(V, 0, B, 0, d), [V]);
  const V1 = useMemo(() => block(V, B, N, 0, d), [V]);

  const scaleFactor = 1 / Math.sqrt(d);

  // --- Pass 1: Q0 x K0^T ---
  const S00 = useMemo(() => scaleMatrix(matmul(Q0, transpose(K0)), scaleFactor), [Q0, K0, scaleFactor]);
  const m00 = useMemo(() => rowMax(S00), [S00]);
  const P00 = useMemo(() => expShifted(S00, m00), [S00, m00]);
  const l00 = useMemo(() => rowSum(P00), [P00]);
  const O00 = useMemo(() => {
    // O = diag(l)^{-1} * P * V
    const PV = matmul(P00, V0);
    return PV.map((row, i) => row.map(v => parseFloat((v / l00[i]).toFixed(4))));
  }, [P00, V0, l00]);

  // --- Pass 2: Q0 x K1^T ---
  const S01 = useMemo(() => scaleMatrix(matmul(Q0, transpose(K1)), scaleFactor), [Q0, K1, scaleFactor]);
  const m01_tilde = useMemo(() => rowMax(S01), [S01]);

  // New max: m_new = max(m_old, m_block)
  const m_new = useMemo(() => m00.map((v, i) => Math.max(v, m01_tilde[i])), [m00, m01_tilde]);

  // Correction factors
  const P01 = useMemo(() => expShifted(S01, m_new), [S01, m_new]);
  const l01_tilde = useMemo(() => rowSum(P01), [P01]);

  // l_new = e^{m_old - m_new} * l_old + l_tilde_new
  const l_new = useMemo(
    () => m00.map((_, i) => parseFloat((Math.exp(m00[i] - m_new[i]) * l00[i] + l01_tilde[i]).toFixed(4))),
    [m00, m_new, l00, l01_tilde],
  );

  // O_new = diag(l_new)^{-1} * (diag(l_old) * e^{m_old - m_new} * O_old + e^{m_block - m_new} * P_tilde * V_block)
  // But O_old was already normalized by l_old, so: diag(l_old)*O_old = P_old * V_old (unnormalized)
  // O_new = diag(l_new)^{-1} * (e^{m_old-m_new} * l_old * O_old + P01 * V1)
  const O_final = useMemo(() => {
    const PV1 = matmul(P01, V1);
    return Q0.map((_, i) =>
      Array.from({ length: d }, (_, j) => {
        const corrected_old = Math.exp(m00[i] - m_new[i]) * l00[i] * O00[i][j];
        const new_contrib = PV1[i][j];
        return parseFloat(((corrected_old + new_contrib) / l_new[i]).toFixed(4));
      }),
    );
  }, [Q0, m00, m_new, l00, O00, l_new, V1, P01]);

  // Reference: full standard attention for Q0 rows (to verify correctness)
  const S_full_Q0 = useMemo(() => scaleMatrix(matmul(Q0, transpose(K)), scaleFactor), [Q0, K, scaleFactor]);
  const m_full = useMemo(() => rowMax(S_full_Q0), [S_full_Q0]);
  const P_full = useMemo(() => expShifted(S_full_Q0, m_full), [S_full_Q0, m_full]);
  const l_full = useMemo(() => rowSum(P_full), [P_full]);
  const O_ref = useMemo(() => {
    const W = P_full.map((row, i) => row.map(v => parseFloat((v / l_full[i]).toFixed(4))));
    return matmul(W, V);
  }, [P_full, l_full, V]);

  const tokenLabels = ['t₁', 't₂', 't₃', 't₄'];
  const dkLabels = ['d₁', 'd₂', 'd₃'];
  const blk0Labels = ['t₁', 't₂'];
  const blk1Labels = ['t₃', 't₄'];

  const steps = [
    {
      title: t.title_step1,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.desc_step1_p1} <code className="bg-gray-100 px-1 rounded">N×N</code> {t.desc_step1_p2} <strong>O(N²)</strong>。
            {t.desc_step1_p3}<strong>{t.desc_step1_p4}</strong>。
          </p>
          <div className="flex flex-wrap justify-center items-start gap-4">
            <MatrixGrid
              data={Q}
              label="Q ∈ ℝ^(4×3)"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#dbeafe"
              highlightRows={[0, 1]}
            />
            <MatrixGrid
              data={K}
              label="K ∈ ℝ^(4×3)"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#d1fae5"
              highlightRows={[0, 1]}
            />
            <MatrixGrid
              data={V}
              label="V ∈ ℝ^(4×3)"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#fce7f3"
              highlightRows={[0, 1]}
            />
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
            <strong>{t.note_step1_title}</strong>{t.note_step1_desc}<sub>r</sub> = B<sub>c</sub> = 2。
            {t.note_step1_highlight}
          </div>
        </div>
      ),
    },
    {
      title: t.title_step2,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>{t.desc_step2_p1}</strong>{t.desc_step2_p2}
          </p>
          <div className="flex flex-wrap justify-center items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Q₀</span>
                <MemoryTag location="SRAM" sramText={t.sram_fast} hbmText={t.hbm_slow} />
              </div>
              <MatrixGrid
                data={Q0}
                rowLabels={blk0Labels}
                colLabels={dkLabels}
                highlightColor="#dbeafe"
                highlightRows={[0, 1]}
                compact
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">K₀</span>
                <MemoryTag location="SRAM" sramText={t.sram_fast} hbmText={t.hbm_slow} />
              </div>
              <MatrixGrid
                data={K0}
                rowLabels={blk0Labels}
                colLabels={dkLabels}
                highlightColor="#d1fae5"
                highlightRows={[0, 1]}
                compact
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">V₀</span>
                <MemoryTag location="SRAM" sramText={t.sram_fast} hbmText={t.hbm_slow} />
              </div>
              <MatrixGrid
                data={V0}
                rowLabels={blk0Labels}
                colLabels={dkLabels}
                highlightColor="#fce7f3"
                highlightRows={[0, 1]}
                compact
              />
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>{t.note_step2_title}</strong>{t.note_step2_desc}
          </div>
        </div>
      ),
    },
    {
      title: t.title_step3,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t.desc_step3_p1} <code className="bg-gray-100 px-1 rounded">S₀₀ = Q₀ · K₀ᵀ / √d</code>。
            {t.desc_step3_p2} <strong>B×B = 2×2</strong> {t.desc_step3_p3}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={Q0}
              label="Q₀"
              rowLabels={blk0Labels}
              highlightColor="#dbeafe"
              highlightRows={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={transpose(K0)}
              label="K₀ᵀ"
              colLabels={blk0Labels}
              highlightColor="#d1fae5"
              highlightCols={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">÷√3 =</span>
            <MatrixGrid
              data={S00}
              label="S₀₀ = Q₀K₀ᵀ/√d"
              shape="(2, 2)"
              rowLabels={blk0Labels}
              colLabels={blk0Labels}
              highlightColor="#fef3c7"
              highlightRows={[0, 1]}
            />
          </div>
          <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
            <strong>{t.note_step3_title}</strong>{t.note_step3_desc}
          </div>
        </div>
      ),
    },
    {
      title: t.title_step4,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>{t.desc_step4_p1}</strong>{t.desc_step4_p2}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-semibold mb-2">{t.stat_local}</div>
              <div className="text-xs font-mono space-y-1">
                <div>m̃₀₀ = rowmax(S₀₀) = [{m00.map(v => v.toFixed(2)).join(', ')}]</div>
                <div>P̃₀₀ = exp(S₀₀ - m̃₀₀) <span className="text-gray-400">{t.stat_local_row}</span></div>
                <div>l̃₀₀ = rowsum(P̃₀₀) = [{l00.map(v => v.toFixed(4)).join(', ')}]</div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-semibold mb-2">{t.stat_global}</div>
              <div className="text-xs font-mono space-y-1">
                <div>m<sup>new</sup> = max(m<sup>old</sup>, m̃₀₀) = [{m00.map(v => v.toFixed(2)).join(', ')}]</div>
                <div>l<sup>new</sup> = e<sup>(m_old−m_new)</sup>·l<sup>old</sup> + l̃₀₀ = [{l00.map(v => v.toFixed(4)).join(', ')}]</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={P00}
              label="P̃₀₀ = exp(S₀₀ - m̃)"
              shape="(2, 2)"
              rowLabels={blk0Labels}
              colLabels={blk0Labels}
              highlightColor="#ede9fe"
              highlightRows={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={V0}
              label="V₀"
              rowLabels={blk0Labels}
              colLabels={dkLabels}
              highlightColor="#fce7f3"
              highlightRows={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">→</span>
            <MatrixGrid
              data={O00}
              label="O (临时)"
              shape="(2, 3)"
              rowLabels={blk0Labels}
              colLabels={dkLabels}
              highlightColor="#dbeafe"
              highlightRows={[0, 1]}
            />
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
            <strong>{t.note_step4_title}</strong>
            <code className="bg-purple-100 px-1 rounded">
              O = diag(l<sup>new</sup>)⁻¹ · (diag(l<sup>old</sup>)·e<sup>(m_old−m_new)</sup>·O<sup>old</sup> + P̃·V)
            </code>
            <br />
            {t.note_step4_desc}<sup>old</sup>=0，{t.note_step4_desc2}
          </div>
        </div>
      ),
    },
    {
      title: t.title_step5,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>{t.desc_step5_p1}</strong>{t.desc_step5_p2}
          </p>
          <div className="flex flex-wrap justify-center items-start gap-6 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">K₁</span>
                <MemoryTag location="SRAM" sramText={t.sram_fast} hbmText={t.hbm_slow} />
                <Badge color="red">{t.label_new_load}</Badge>
              </div>
              <MatrixGrid
                data={K1}
                rowLabels={blk1Labels}
                colLabels={dkLabels}
                highlightColor="#d1fae5"
                highlightRows={[0, 1]}
                compact
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">V₁</span>
                <MemoryTag location="SRAM" sramText={t.sram_fast} hbmText={t.hbm_slow} />
                <Badge color="red">{t.label_new_load}</Badge>
              </div>
              <MatrixGrid
                data={V1}
                rowLabels={blk1Labels}
                colLabels={dkLabels}
                highlightColor="#fce7f3"
                highlightRows={[0, 1]}
                compact
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={Q0}
              label={`Q₀ ${t.label_still_sram}`}
              rowLabels={blk0Labels}
              highlightColor="#dbeafe"
              highlightRows={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={transpose(K1)}
              label="K₁ᵀ"
              colLabels={blk1Labels}
              highlightColor="#d1fae5"
              highlightCols={[0, 1]}
              compact
            />
            <span className="text-lg text-gray-500 font-bold">÷√3 =</span>
            <MatrixGrid
              data={S01}
              label="S₀₁ = Q₀K₁ᵀ/√d"
              shape="(2, 2)"
              rowLabels={blk0Labels}
              colLabels={blk1Labels}
              highlightColor="#fef3c7"
              highlightRows={[0, 1]}
            />
          </div>
        </div>
      ),
    },
    {
      title: t.title_step6,
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>{t.desc_step6_p1}</strong>{t.desc_step6_p2}
          </p>
          <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
            <div className="text-sm font-semibold mb-2">{t.correction_formula}</div>
            <div className="text-xs font-mono space-y-1">
              <div>m̃₀₁ = rowmax(S₀₁) = [{m01_tilde.map(v => v.toFixed(2)).join(', ')}]</div>
              <div className="font-bold text-blue-900">
                m<sup>new</sup> = max(m<sup>old</sup>, m̃₀₁) = max([{m00.map(v => v.toFixed(2)).join(', ')}], [{m01_tilde.map(v => v.toFixed(2)).join(', ')}]) = [{m_new.map(v => v.toFixed(2)).join(', ')}]
              </div>
              <div>
                l<sup>new</sup> = e<sup>(m_old−m_new)</sup>·l<sup>old</sup> + l̃₀₁ = [{l_new.map(v => v.toFixed(4)).join(', ')}]
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 font-bold text-blue-900">
                O<sup>new</sup> = diag(l<sup>new</sup>)⁻¹ · [e<sup>(m_old−m_new)</sup>·l<sup>old</sup>·O<sup>old</sup> + P̃₀₁·V₁]
              </div>
              <div className="text-gray-500 mt-1">
                {t.correction_factor}<sup>(m_old−m_new)</sup> {t.correction_factor2}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="text-center">
              <MatrixGrid
                data={O00}
                label={`O ${t.label_before}`}
                rowLabels={blk0Labels}
                colLabels={dkLabels}
                highlightColor="#fef3c7"
                highlightRows={[0, 1]}
                compact
              />
              <div className="text-xs text-gray-400 mt-1">{t.label_before_note}</div>
            </div>
            <span className="text-2xl text-gray-400">→</span>
            <div className="text-center">
              <MatrixGrid
                data={O_final}
                label={`O ${t.label_final}`}
                rowLabels={blk0Labels}
                colLabels={dkLabels}
                highlightColor="#d1fae5"
                highlightRows={[0, 1]}
              />
              <div className="text-xs text-green-600 mt-1 font-medium">{t.label_final_note}</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <strong>{t.verify_title}</strong>{t.verify_desc1}
            <br />
            {t.verify_desc2} [{O_ref[0].map(v => v.toFixed(4)).join(', ')}], [{O_ref[1].map(v => v.toFixed(4)).join(', ')}]
            <br />
            {t.verify_desc3} [{O_final[0].map(v => v.toFixed(4)).join(', ')}], [{O_final[1].map(v => v.toFixed(4)).join(', ')}]
            <br />
            <strong>{t.verify_desc4}</strong>
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
