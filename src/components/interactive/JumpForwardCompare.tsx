import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;

function NaiveGeneration() {
  const tokens = ['{', '"', 'n', 'a', 'm', 'e', '"', ':', ' ', '"', 'A', 'l', 'i', 'c', 'e', '"', '}'];
  const totalSteps = tokens.length;
  return (
    <svg width={W} height={160} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 1: 无约束逐 token 生成
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        每个 token 都需要采样 → 可能产出非法 JSON → {totalSteps} 次采样
      </text>

      {tokens.map((t, i) => {
        const x = 10 + i * 32;
        const isControl = ['{', '"', ':', '}', ' '].includes(t);
        return (
          <g key={i}>
            <rect x={x} y={50} width={28} height={28} rx={4}
              fill={isControl ? COLORS.waste : COLORS.valid}
              stroke={COLORS.mid} strokeWidth={0.5} />
            <text x={x + 14} y={69} fontSize={12} fill={COLORS.dark}
              fontFamily={FONTS.mono} textAnchor="middle">
              {t}
            </text>
            <text x={x + 14} y={96} fontSize={8} fill={COLORS.red}
              fontFamily={FONTS.sans} textAnchor="middle">
              sample
            </text>
          </g>
        );
      })}

      <text x={10} y={125} fontSize={12} fill={COLORS.red} fontFamily={FONTS.sans} fontWeight={600}>
        问题: 可能生成 {'{'}&#34;name: Alice{'}'} 等非法 JSON
      </text>
      <text x={10} y={145} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        速度: {totalSteps} 次 LLM forward pass
      </text>
    </svg>
  );
}

function FSMGeneration() {
  const tokens = ['{', '"', 'n', 'a', 'm', 'e', '"', ':', ' ', '"', 'A', 'l', 'i', 'c', 'e', '"', '}'];
  const totalSteps = tokens.length;
  return (
    <svg width={W} height={160} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 2: FSM 约束逐 token 生成
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        每步用 FSM mask 非法 token → 保证正确 → 但仍需 {totalSteps} 次采样
      </text>

      {tokens.map((t, i) => {
        const x = 10 + i * 32;
        const isControl = ['{', '"', ':', '}', ' '].includes(t);
        return (
          <g key={i}>
            <rect x={x} y={50} width={28} height={28} rx={4}
              fill={isControl ? '#ecfdf5' : COLORS.valid}
              stroke={isControl ? COLORS.green : COLORS.primary} strokeWidth={1} />
            <text x={x + 14} y={69} fontSize={12} fill={COLORS.dark}
              fontFamily={FONTS.mono} textAnchor="middle">
              {t}
            </text>
            <text x={x + 14} y={96} fontSize={8}
              fill={isControl ? COLORS.green : COLORS.primary}
              fontFamily={FONTS.sans} textAnchor="middle">
              {isControl ? 'mask' : 'sample'}
            </text>
          </g>
        );
      })}

      <text x={10} y={125} fontSize={12} fill={COLORS.green} fontFamily={FONTS.sans} fontWeight={600}>
        正确性: ✓ 保证合法 JSON
      </text>
      <text x={10} y={145} fontSize={11} fill={COLORS.orange} fontFamily={FONTS.sans}>
        速度: 仍需 {totalSteps} 次 LLM forward pass（每步都走 LLM）
      </text>
    </svg>
  );
}

function JumpForwardGeneration() {
  const segments: { tokens: string; type: 'jump' | 'sample'; steps: number }[] = [
    { tokens: '{"name": "', type: 'jump', steps: 1 },
    { tokens: 'Alice', type: 'sample', steps: 5 },
    { tokens: '"}', type: 'jump', steps: 1 },
  ];
  const totalSteps = segments.reduce((s, seg) => s + seg.steps, 0);

  return (
    <svg width={W} height={180} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 3: Jump-Forward 优化
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        FSM 中确定性片段直接跳过，不走 LLM → 只需 {totalSteps} 次 forward pass
      </text>

      {(() => {
        let xOffset = 10;
        return segments.map((seg, i) => {
          const segW = seg.tokens.length * 16 + 20;
          const el = (
            <g key={i}>
              <rect x={xOffset} y={50} width={segW} height={36} rx={6}
                fill={seg.type === 'jump' ? '#ecfdf5' : COLORS.valid}
                stroke={seg.type === 'jump' ? COLORS.green : COLORS.primary}
                strokeWidth={1.5}
              />
              <text x={xOffset + segW / 2} y={73} fontSize={12} fill={COLORS.dark}
                fontFamily={FONTS.mono} textAnchor="middle">
                {seg.tokens}
              </text>
              <text x={xOffset + segW / 2} y={105} fontSize={10}
                fill={seg.type === 'jump' ? COLORS.green : COLORS.primary}
                fontFamily={FONTS.sans} textAnchor="middle" fontWeight={600}>
                {seg.type === 'jump' ? `⚡ JUMP (${seg.steps} step)` : `sample (${seg.steps} steps)`}
              </text>
              {i < segments.length - 1 && (
                <line x1={xOffset + segW + 2} y1={68} x2={xOffset + segW + 14} y2={68}
                  stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowJF)" />
              )}
            </g>
          );
          xOffset += segW + 18;
          return el;
        });
      })()}

      <text x={10} y={135} fontSize={12} fill={COLORS.green} fontFamily={FONTS.sans} fontWeight={600}>
        正确性: ✓ 保证合法 JSON | 速度: 只需 {totalSteps} 次 forward pass
      </text>
      <text x={10} y={155} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        加速比: 对于结构化输出，通常 2-5x 加速（确定性片段占比越高越快）
      </text>
      <text x={10} y={173} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        原理: FSM 遇到只有一条出边的状态 → 输出确定 → 跳过 LLM 采样
      </text>

      <defs>
        <marker id="arrowJF" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
        </marker>
      </defs>
    </svg>
  );
}

export default function JumpForwardCompare() {
  return (
    <StepNavigator
      steps={[
        { title: '无约束', content: <NaiveGeneration /> },
        { title: 'FSM 约束', content: <FSMGeneration /> },
        { title: 'Jump-Forward', content: <JumpForwardGeneration /> },
      ]}
    />
  );
}
