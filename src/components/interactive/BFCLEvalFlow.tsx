// src/components/interactive/BFCLEvalFlow.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type CallCategory = 'simple' | 'multiple' | 'parallel' | 'relevance';

interface BFCLExample {
  category: CallCategory;
  categoryLabel: { zh: string; en: string };
  categoryDesc: { zh: string; en: string };
  functions: string;
  userQuery: { zh: string; en: string };
  modelOutput: string;
  verification: { zh: string; en: string };
  isCorrect: boolean;
}

const EXAMPLES: BFCLExample[] = [
  {
    category: 'simple',
    categoryLabel: { zh: '单函数调用', en: 'Simple Call' },
    categoryDesc: { zh: '给定一个函数，正确填充参数', en: 'Given one function, correctly fill parameters' },
    functions: `{
  "name": "get_weather",
  "parameters": {
    "location": { "type": "string" },
    "unit": { "type": "string",
              "enum": ["celsius", "fahrenheit"] }
  }
}`,
    userQuery: { zh: '北京今天天气怎么样？用摄氏度', en: 'What is the weather in Beijing? Use Celsius' },
    modelOutput: `get_weather(
  location="Beijing",
  unit="celsius"
)`,
    verification: { zh: '✅ AST 匹配: 函数名正确，参数类型和值正确', en: '✅ AST match: correct function name, parameter types and values' },
    isCorrect: true,
  },
  {
    category: 'multiple',
    categoryLabel: { zh: '多函数选择', en: 'Multiple Functions' },
    categoryDesc: { zh: '从多个候选函数中选择正确的', en: 'Select correct function from multiple candidates' },
    functions: `[
  { "name": "get_weather", ... },
  { "name": "search_flights",
    "parameters": {
      "from": "string",
      "to": "string",
      "date": "string" } },
  { "name": "book_hotel", ... }
]`,
    userQuery: { zh: '帮我搜一下明天从北京到上海的航班', en: 'Search flights from Beijing to Shanghai tomorrow' },
    modelOutput: `search_flights(
  from="Beijing",
  to="Shanghai",
  date="2025-01-16"
)`,
    verification: { zh: '✅ 正确选择 search_flights，参数填充正确', en: '✅ Correctly selected search_flights, parameters correct' },
    isCorrect: true,
  },
  {
    category: 'parallel',
    categoryLabel: { zh: '并行调用', en: 'Parallel Calls' },
    categoryDesc: { zh: '同时调用多个函数', en: 'Call multiple functions simultaneously' },
    functions: `[
  { "name": "get_weather",
    "parameters": {
      "location": "string" } },
  { "name": "get_time",
    "parameters": {
      "timezone": "string" } }
]`,
    userQuery: { zh: '告诉我东京的天气和当前时间', en: 'Tell me the weather and current time in Tokyo' },
    modelOutput: `[
  get_weather(location="Tokyo"),
  get_time(timezone="Asia/Tokyo")
]`,
    verification: { zh: '✅ 正确识别需要并行调用两个函数', en: '✅ Correctly identified need for parallel calls' },
    isCorrect: true,
  },
  {
    category: 'relevance',
    categoryLabel: { zh: '相关性检测', en: 'Relevance Detection' },
    categoryDesc: { zh: '判断是否需要调用函数', en: 'Determine whether function call is needed' },
    functions: `{
  "name": "get_weather",
  "parameters": {
    "location": "string" }
}`,
    userQuery: { zh: '给我讲个笑话', en: 'Tell me a joke' },
    modelOutput: `// No function call
// — respond directly`,
    verification: { zh: '✅ 正确判断无需调用函数（避免过度调用）', en: '✅ Correctly determined no function call needed' },
    isCorrect: true,
  },
];

const CATEGORIES: CallCategory[] = ['simple', 'multiple', 'parallel', 'relevance'];

function CodeBlock({ code, label, color }: { code: string; label: string; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase' as const,
        letterSpacing: 0.5, marginBottom: 4,
      }}>
        {label}
      </div>
      <pre style={{
        fontFamily: FONTS.mono,
        fontSize: 12,
        lineHeight: 1.5,
        background: COLORS.dark,
        color: '#e2e8f0',
        padding: '10px 12px',
        borderRadius: 6,
        margin: 0,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {code}
      </pre>
    </div>
  );
}

export default function BFCLEvalFlow({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [activeCategory, setActiveCategory] = useState<CallCategory>('simple');

  const example = EXAMPLES.find(e => e.category === activeCategory)!;

  return (
    <div style={{
      fontFamily: FONTS.sans,
      background: COLORS.bgAlt,
      borderRadius: 12,
      border: `1px solid ${COLORS.light}`,
      padding: '20px 16px 16px',
      maxWidth: 720,
      margin: '24px auto',
    }}>
      {/* Title */}
      <div style={{
        textAlign: 'center', marginBottom: 14,
        fontSize: 15, fontWeight: 600, color: COLORS.dark,
      }}>
        {t('BFCL 评测流程示例', 'BFCL Evaluation Flow Example')}
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {CATEGORIES.map(cat => {
          const ex = EXAMPLES.find(e => e.category === cat)!;
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: `1.5px solid ${isActive ? COLORS.primary : COLORS.light}`,
                background: isActive ? COLORS.primary : '#fff',
                color: isActive ? '#fff' : COLORS.dark,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                fontFamily: FONTS.sans,
                transition: 'all 0.15s ease',
              }}
            >
              {ex.categoryLabel[locale]}
            </button>
          );
        })}
      </div>

      {/* Category description */}
      <div style={{
        textAlign: 'center', fontSize: 13, color: COLORS.mid, marginBottom: 14,
      }}>
        {example.categoryDesc[locale]}
      </div>

      {/* Left-Right panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {/* Left: Input */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 14,
            border: `1px solid ${COLORS.light}`,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: COLORS.primary,
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: COLORS.primary, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>1</span>
              {t('输入', 'Input')}
            </div>

            <CodeBlock
              code={example.functions}
              label={t('可用函数', 'Available Functions')}
              color={COLORS.mid}
            />
            <div style={{
              fontSize: 10, fontWeight: 600, color: COLORS.mid,
              textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 4,
            }}>
              {t('用户请求', 'User Query')}
            </div>
            <div style={{
              fontFamily: FONTS.sans,
              fontSize: 13,
              background: COLORS.highlight,
              padding: '8px 12px',
              borderRadius: 6,
              color: COLORS.dark,
              lineHeight: 1.5,
            }}>
              "{example.userQuery[locale]}"
            </div>
          </div>

          {/* Right: Output */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 14,
            border: `1px solid ${COLORS.light}`,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: COLORS.green,
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: COLORS.green, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>2</span>
              {t('输出 & 验证', 'Output & Verification')}
            </div>

            <CodeBlock
              code={example.modelOutput}
              label={t('模型输出', 'Model Output')}
              color={COLORS.mid}
            />

            <div style={{
              fontSize: 10, fontWeight: 600, color: COLORS.mid,
              textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 4,
            }}>
              {t('评估结果', 'Evaluation Result')}
            </div>
            <div style={{
              fontSize: 13,
              background: example.isCorrect ? '#ecfdf5' : COLORS.waste,
              padding: '8px 12px',
              borderRadius: 6,
              color: example.isCorrect ? COLORS.green : COLORS.red,
              lineHeight: 1.5,
              fontWeight: 500,
            }}>
              {example.verification[locale]}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer note */}
      <div style={{
        textAlign: 'center', fontSize: 11, color: COLORS.mid, marginTop: 14,
        lineHeight: 1.5,
      }}>
        {t(
          'BFCL 使用 AST（抽象语法树）匹配和可执行验证两种方式评估函数调用正确性。',
          'BFCL uses AST (Abstract Syntax Tree) matching and executable verification to evaluate function call correctness.'
        )}
      </div>
    </div>
  );
}
