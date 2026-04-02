import StepNavigator from '../primitives/StepNavigator';
import { HEAD_COLORS } from './shared/colors';

const S = 4; // sequence length
const H = 8; // hidden dim
const h = 2; // number of heads
const dk = H / h; // head dim = 4

const tokenLabels = ['t₁', 't₂', 't₃', 't₄'];

function ColorCell({ color, value, size = 28 }: { color: string; value: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center border border-gray-300 text-[9px] font-mono"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {value}
    </div>
  );
}

function cellLabel(row: number, col: number): string {
  return `${row},${col}`;
}

function Step1Flat() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        投影后的矩阵 <code className="bg-gray-100 px-1 rounded">(S, H) = (4, 8)</code>，
        所有元素未区分 head，统一颜色。
      </p>
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-gray-500 mb-1">Q ∈ (4, 8)</div>
        {Array.from({ length: S }, (_, r) => (
          <div key={r} className="flex items-center gap-0">
            <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
            {Array.from({ length: H }, (_, c) => (
              <ColorCell key={c} color="#e2e8f0" value={cellLabel(r, c)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Reshape() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        <code className="bg-gray-100 px-1 rounded">reshape(S, h, d_k) = (4, 2, 4)</code> —
        按 head 分组着色，每组 d_k=4 个元素属于同一个 head。
      </p>
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-gray-500 mb-1">Q.reshape(4, 2, 4)</div>
        {Array.from({ length: S }, (_, r) => (
          <div key={r} className="flex items-center gap-0">
            <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
            {Array.from({ length: h }, (_, headIdx) =>
              Array.from({ length: dk }, (_, d) => (
                <ColorCell
                  key={`${headIdx}-${d}`}
                  color={HEAD_COLORS[headIdx] + '33'}
                  value={cellLabel(r, headIdx * dk + d)}
                />
              ))
            )}
          </div>
        ))}
        <div className="flex mt-1">
          <span className="w-6" />
          {Array.from({ length: h }, (_, headIdx) => (
            <div key={headIdx} className="flex items-center justify-center text-[10px] font-semibold"
              style={{ width: dk * 28, color: HEAD_COLORS[headIdx] }}>
              Head {headIdx}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Transpose() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        <code className="bg-gray-100 px-1 rounded">transpose(0, 1) → (h, S, d_k) = (2, 4, 4)</code> —
        每个 head 获得自己的 (S, d_k) 矩阵，可以独立计算 Attention。
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        {Array.from({ length: h }, (_, headIdx) => (
          <div key={headIdx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-1" style={{ color: HEAD_COLORS[headIdx] }}>
              Head {headIdx} · (4, 4)
            </div>
            {Array.from({ length: S }, (_, r) => (
              <div key={r} className="flex items-center gap-0">
                <span className="w-6 text-right text-xs text-gray-400 mr-1">{tokenLabels[r]}</span>
                {Array.from({ length: dk }, (_, d) => (
                  <ColorCell
                    key={d}
                    color={HEAD_COLORS[headIdx] + '33'}
                    value={cellLabel(r, headIdx * dk + d)}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>关键：</strong>数据没有被复制，只是重新排列了维度顺序。每个 Head 现在拥有所有 token
        的子空间表示，可以独立执行 Scaled Dot-Product Attention。
      </div>
    </div>
  );
}

export default function ReshapeTransposeAnimation() {
  const steps = [
    { title: '(S, H) 原始投影结果', content: <Step1Flat /> },
    { title: 'reshape → (S, h, d_k)', content: <Step2Reshape /> },
    { title: 'transpose → (h, S, d_k)', content: <Step3Transpose /> },
  ];

  return <StepNavigator steps={steps} />;
}
