import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

type Mode = 'classify' | 'generate';

export default function CausalLMRouter() {
  const [mode, setMode] = useState<Mode>('classify');

  const W = 580, H = 340;

  const classifySteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: 'Prompt 模板', text: '"判断此 query 需要强模型还是弱模型: "', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做分类', x: 270 },
    { label: '输出: "strong"', text: 'P(strong)=0.87', x: 400 },
  ];

  const generateSteps = [
    { label: 'Query', text: '"解释量子纠缠"', x: 20 },
    { label: '直接输入', text: '"解释量子纠缠"', x: 135 },
    { label: 'Qwen-2.5-3B', text: '小 LM 做生成', x: 270 },
    { label: '输出: 回答', text: '可能质量不足...', x: 400 },
  ];

  const steps = mode === 'classify' ? classifySteps : generateSteps;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Causal LM Router: 分类 vs 生成
        </text>

        <g transform="translate(180, 40)">
          {(['classify', 'generate'] as Mode[]).map((m, i) => (
            <g key={m}>
              <rect x={i * 120} y="0" width="110" height="28" rx="4"
                    fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                    stroke={COLORS.primary} strokeWidth="1.5"
                    style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
              <text x={i * 120 + 55} y="19" textAnchor="middle"
                    fontFamily={FONTS.sans} fontSize="12"
                    fontWeight={mode === m ? "700" : "400"}
                    fill={mode === m ? '#fff' : COLORS.dark}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                {m === 'classify' ? '✓ 做路由分类' : '✗ 直接生成'}
              </text>
            </g>
          ))}
        </g>

        {steps.map((s, i) => (
          <g key={i} transform={`translate(${s.x}, 90)`}>
            <rect x="0" y="0" width="105" height="60" rx="6"
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="52.5" y="20" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="11" fontWeight="600" fill={COLORS.dark}>
              {s.label}
            </text>
            <text x="52.5" y="42" textAnchor="middle" fontFamily={FONTS.sans}
                  fontSize="9" fill={COLORS.mid}>
              {s.text.split('\n')[0]}
            </text>
            {s.text.split('\n')[1] && (
              <text x="52.5" y="54" textAnchor="middle" fontFamily={FONTS.sans}
                    fontSize="9" fill={COLORS.mid}>
                {s.text.split('\n')[1]}
              </text>
            )}
            {i < steps.length - 1 && (
              <text x="110" y="30" fontFamily={FONTS.sans} fontSize="18" fill={COLORS.primary}>→</text>
            )}
          </g>
        ))}

        <g transform="translate(30, 170)">
          <rect x="0" y="0" width="520" height="150" rx="6"
                fill={mode === 'classify' ? COLORS.valid : COLORS.waste}
                stroke={mode === 'classify' ? COLORS.green : COLORS.red}
                strokeWidth="2" />
          {mode === 'classify' ? (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.green}>
                ✓ 分类模式 — Small Models as Routers (2026)
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 用 1-4B 参数小模型做路由判断，78.3% 准确率
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 推理成本极低（zero-marginal-cost：已部署的模型顺便做分类）
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 语义理解能力远强于 BERT，可理解复杂 query 结构
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 可本地部署，无需额外 API 调用
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                关键优势：把 "路由判断" 转化为 "文本分类"，复用 LM 的语言理解能力
              </text>
            </>
          ) : (
            <>
              <text x="20" y="25" fontFamily={FONTS.sans} fontSize="13" fontWeight="700" fill={COLORS.red}>
                ✗ 生成模式 — 直接用小模型回答
              </text>
              <text x="20" y="48" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 小模型（3B）直接回答复杂问题，质量可能不够
              </text>
              <text x="20" y="66" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 无法知道自己"不够好"——缺乏自我评估能力
              </text>
              <text x="20" y="84" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 生成成本高于分类（需要完整回答 vs 一个 token 判断）
              </text>
              <text x="20" y="102" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
                • 如果错了，用户得到低质量回答，还浪费了时间
              </text>
              <text x="20" y="125" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                核心问题：小模型擅长"判断难度"而非"解决难题"
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
