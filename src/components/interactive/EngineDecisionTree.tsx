import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface Question {
  text: string;
  options: { label: string; next: number | string }[]; // number = next question index, string = result engine
}

export default function EngineDecisionTree({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '推理引擎选型指南',
      subtitle: '回答几个问题，找到最适合你的引擎',
      reset: '重新选择',
      recommend: '推荐：',
      questions: [
        {
          text: '你的部署环境？',
          options: [
            { label: '云端 GPU 服务器', next: 1 },
            { label: '本地 / 笔记本', next: 'Ollama' },
          ],
        },
        {
          text: '需要结构化输出（JSON/Schema）吗？',
          options: [
            { label: '是，核心需求', next: 'SGLang' },
            { label: '不需要 / 偶尔', next: 2 },
          ],
        },
        {
          text: '硬件是 NVIDIA 最新卡（H100/B200）吗？',
          options: [
            { label: '是，且要极致性能', next: 'TensorRT-LLM' },
            { label: '各种 GPU / 通用', next: 'vLLM' },
          ],
        },
      ],
      results: {
        'vLLM':         { color: COLORS.primary, desc: '生态最成熟，社区最大，兼容性最广的云端 serving 方案' },
        'SGLang':       { color: COLORS.green,   desc: '最强结构化输出 + 可编程推理，适合复杂 LLM 应用' },
        'Ollama':       { color: COLORS.orange,  desc: '一键安装，开箱即用，最适合本地开发和实验' },
        'TensorRT-LLM': { color: COLORS.purple,  desc: 'NVIDIA 原生优化，H100/B200 上的极致吞吐' },
      },
    },
    en: {
      title: 'Inference Engine Selection Guide',
      subtitle: 'Answer a few questions to find the best engine for you',
      reset: 'Reset',
      recommend: 'Recommended:',
      questions: [
        {
          text: 'Your deployment environment?',
          options: [
            { label: 'Cloud GPU server', next: 1 },
            { label: 'Local / Laptop', next: 'Ollama' },
          ],
        },
        {
          text: 'Need structured output (JSON/Schema)?',
          options: [
            { label: 'Yes, core requirement', next: 'SGLang' },
            { label: 'No / Occasionally', next: 2 },
          ],
        },
        {
          text: 'Latest NVIDIA hardware (H100/B200)?',
          options: [
            { label: 'Yes, need max performance', next: 'TensorRT-LLM' },
            { label: 'Various GPU / General', next: 'vLLM' },
          ],
        },
      ],
      results: {
        'vLLM':         { color: COLORS.primary, desc: 'Most mature ecosystem, largest community, widest compatibility for cloud serving' },
        'SGLang':       { color: COLORS.green,   desc: 'Strongest structured output + programmable inference, ideal for complex LLM apps' },
        'Ollama':       { color: COLORS.orange,  desc: 'One-click install, ready to use, best for local development and experiments' },
        'TensorRT-LLM': { color: COLORS.purple,  desc: 'NVIDIA native optimization, extreme throughput on H100/B200' },
      },
    },
  }[locale];

  const QUESTIONS = t.questions;
  const RESULTS = t.results;
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ q: number; a: string }[]>([]);

  const handleChoice = (option: { label: string; next: number | string }) => {
    const newHistory = [...history, { q: step, a: option.label }];
    setHistory(newHistory);
    if (typeof option.next === 'string') {
      setResult(option.next);
    } else {
      setStep(option.next);
    }
  };

  const reset = () => { setStep(0); setResult(null); setHistory([]); };

  const q = QUESTIONS[step];
  const boxY = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        {t.subtitle}
      </text>

      {/* History breadcrumbs */}
      {history.map((h, i) => {
        const y = boxY + i * 50;
        return (
          <g key={i}>
            <rect x={40} y={y} width={W - 80} height={40} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
            <text x={60} y={y + 17} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
              Q{i + 1}: {QUESTIONS[h.q].text}
            </text>
            <text x={60} y={y + 32} fontSize="10" fontWeight="600"
              fill={COLORS.primary} fontFamily={FONTS.sans}>
              → {h.a}
            </text>
          </g>
        );
      })}

      {/* Current question or result */}
      {result === null ? (
        <g>
          <rect x={40} y={boxY + history.length * 50} width={W - 80} height={40} rx={6}
            fill="#fff" stroke={COLORS.primary} strokeWidth="2" />
          <text x={W / 2} y={boxY + history.length * 50 + 25} textAnchor="middle"
            fontSize="12" fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Q{history.length + 1}: {q.text}
          </text>
          {q.options.map((opt, i) => {
            const btnY = boxY + history.length * 50 + 55 + i * 40;
            return (
              <g key={i} onClick={() => handleChoice(opt)} cursor="pointer">
                <rect x={100} y={btnY} width={W - 200} height={32} rx={16}
                  fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
                <text x={W / 2} y={btnY + 21} textAnchor="middle" fontSize="11"
                  fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
                  {opt.label}
                </text>
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          {/* Result card */}
          {(() => {
            const r = RESULTS[result];
            const cardY = boxY + history.length * 50 + 10;
            return (
              <>
                <rect x={40} y={cardY} width={W - 80} height={80} rx={8}
                  fill={r.color} opacity={0.1} stroke={r.color} strokeWidth="2" />
                <text x={W / 2} y={cardY + 28} textAnchor="middle"
                  fontSize="18" fontWeight="700" fill={r.color} fontFamily={FONTS.sans}>
                  {t.recommend}{result}
                </text>
                <text x={W / 2} y={cardY + 52} textAnchor="middle"
                  fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
                  {r.desc}
                </text>
                <g onClick={reset} cursor="pointer">
                  <rect x={W / 2 - 45} y={cardY + 90} width={90} height={28} rx={14}
                    fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
                  <text x={W / 2} y={cardY + 108} textAnchor="middle"
                    fontSize="10" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>
                    {t.reset}
                  </text>
                </g>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}
