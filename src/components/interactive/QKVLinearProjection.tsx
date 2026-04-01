import { useMemo } from 'react';
import StepNavigator from '../primitives/StepNavigator';
import MatrixGrid from '../primitives/MatrixGrid';
import { seededValues01 as seededValues, matmul } from '../primitives/mathUtils';

/**
 * QKVLinearProjection — B-level step animation showing QKV linear projection.
 *
 * Uses a small example: S=4 tokens, H=6 hidden dim, d_k=3 head dim.
 * Steps: (1) Input X, (2) W_Q + multiply, (3) Q result, (4) K, (5) V.
 */

export default function QKVLinearProjection() {
  const S = 4;
  const H = 6;
  const dk = 3;

  const X = useMemo(() => seededValues(S, H, 42), []);
  const Wq = useMemo(() => seededValues(H, dk, 7), []);
  const Wk = useMemo(() => seededValues(H, dk, 13), []);
  const Wv = useMemo(() => seededValues(H, dk, 19), []);

  const Q = useMemo(() => matmul(X, Wq), [X, Wq]);
  const K = useMemo(() => matmul(X, Wk), [X, Wk]);
  const V = useMemo(() => matmul(X, Wv), [X, Wv]);

  const tokenLabels = ['t₁', 't₂', 't₃', 't₄'];
  const hLabels = ['h₁', 'h₂', 'h₃', 'h₄', 'h₅', 'h₆'];
  const dkLabels = ['d₁', 'd₂', 'd₃'];

  const steps = [
    {
      title: '输入矩阵 X',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            输入矩阵 <code className="bg-gray-100 px-1 rounded">X</code> 的形状为{' '}
            <span className="font-mono text-primary-700">(S=4, H=6)</span>。每一行代表一个 token 的隐藏表示向量。
          </p>
          <div className="flex justify-center">
            <MatrixGrid
              data={X}
              label="X ∈ ℝ^(4×6)"
              shape="(4, 6)"
              rowLabels={tokenLabels}
              colLabels={hLabels}
              highlightColor="#dbeafe"
            />
          </div>
        </div>
      ),
    },
    {
      title: '权重矩阵 W_Q',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Query 的权重矩阵 <code className="bg-gray-100 px-1 rounded">W_Q</code> 的形状为{' '}
            <span className="font-mono text-primary-700">(H=6, d_k=3)</span>。
            线性投影 <code className="bg-gray-100 px-1 rounded">Q = X · W_Q</code> 将每个 token 从 H 维投影到 d_k 维。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={X}
              label="X"
              shape="(4, 6)"
              rowLabels={tokenLabels}
              colLabels={hLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={Wq}
              label="W_Q"
              shape="(6, 3)"
              rowLabels={hLabels}
              colLabels={dkLabels}
              highlightColor="#fef3c7"
              highlightCols={[0, 1, 2]}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <span className="text-lg text-gray-400 font-mono">Q ?</span>
          </div>
        </div>
      ),
    },
    {
      title: '结果矩阵 Q',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            矩阵乘法完成：<code className="bg-gray-100 px-1 rounded">Q = X · W_Q</code>。
            结果形状为 <span className="font-mono text-primary-700">(S=4, d_k=3)</span>。
            每个 token 现在有一个 3 维的 Query 向量。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={X}
              label="X"
              shape="(4, 6)"
              rowLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={Wq}
              label="W_Q"
              shape="(6, 3)"
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={Q}
              label="Q"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#dbeafe"
              highlightCols={[0, 1, 2]}
            />
          </div>
        </div>
      ),
    },
    {
      title: '同理得到 K',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            用**另一组**权重矩阵 <code className="bg-gray-100 px-1 rounded">W_K</code> 做同样的线性投影：
            <code className="bg-gray-100 px-1 rounded">K = X · W_K</code>。
            Key 矩阵的形状同样为 <span className="font-mono text-primary-700">(4, 3)</span>。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={X}
              label="X"
              shape="(4, 6)"
              rowLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={Wk}
              label="W_K"
              shape="(6, 3)"
              highlightColor="#d1fae5"
              highlightCols={[0, 1, 2]}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={K}
              label="K"
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
      title: '同理得到 V',
      content: (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            最后用 <code className="bg-gray-100 px-1 rounded">W_V</code> 得到 Value 矩阵：
            <code className="bg-gray-100 px-1 rounded">V = X · W_V</code>。
            至此，Q、K、V 三个矩阵全部就绪，形状都是{' '}
            <span className="font-mono text-primary-700">(S, d_k) = (4, 3)</span>。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <MatrixGrid
              data={X}
              label="X"
              shape="(4, 6)"
              rowLabels={tokenLabels}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">×</span>
            <MatrixGrid
              data={Wv}
              label="W_V"
              shape="(6, 3)"
              highlightColor="#fce7f3"
              highlightCols={[0, 1, 2]}
              compact
            />
            <span className="text-xl text-gray-500 font-bold">=</span>
            <MatrixGrid
              data={V}
              label="V"
              shape="(4, 3)"
              rowLabels={tokenLabels}
              colLabels={dkLabels}
              highlightColor="#fce7f3"
              highlightCols={[0, 1, 2]}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <strong>总结：</strong>同一个输入 X 通过三组不同的可学习权重矩阵，被投影到三个不同的子空间，
            分别扮演"查询"、"键"、"值"的角色。
          </div>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
