import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function TokenBox({ x, y, text, variant }: {
  x: number; y: number; text: string;
  variant: 'cached' | 'new' | 'reused' | 'neutral';
}) {
  const fills = {
    cached: '#dbeafe', new: '#fef3c7', reused: '#dcfce7', neutral: '#f1f5f9',
  };
  const strokes = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: '#94a3b8',
  };
  const textFills = {
    cached: COLORS.primary, new: COLORS.orange, reused: COLORS.green, neutral: COLORS.mid,
  };
  return (
    <g>
      <rect x={x} y={y} width={60} height={26} rx={4}
        fill={fills[variant]} stroke={strokes[variant]} strokeWidth={1.2} />
      <text x={x + 30} y={y + 16} textAnchor="middle" fontSize="7.5"
        fontWeight="600" fill={textFills[variant]} fontFamily={FONTS.sans}>{text}</text>
    </g>
  );
}

export default function PrefixCacheHit({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: 'Step 1: 首次请求 — 完整 Prefill',
      request: '请求:',
      fullPrefill: '→ 完整 prefill',
      tokens: 'tokens',
      kvCacheState: 'KV Cache 状态:',
      cached: '✓ 缓存了',
      kvOf: '个 token 的 KV',
      hashStored: '存入 prefix cache 索引',
      step2Title: 'Step 2: 新请求 — 前缀匹配',
      newRequest: '新请求:',
      prefixMatch: '前缀匹配:',
      cacheHit: '→ 命中缓存! 前',
      kvReuse: '个 token 的 KV 可复用',
      divergeAt: '→ 从位置',
      startDiverge: '开始分歧 → 只需 prefill',
      newToken: '个新 token',
      longestPrefix: '最长公共前缀:',
      step3Title: 'Step 3: 复用 KV Cache — 节省计算',
      strategy: '执行策略:',
      kvDirectReuse: '← KV 直接复用 (跳过 prefill)',
      onlyPrefillThis: '← 仅 prefill 此 token',
      oneForward: '次 forward',
      savePrefill: '节省',
      prefillCompute: 'prefill 计算 =',
      ttftReduction: 'TTFT 降低',
      typicalScenario: '典型场景: system prompt 复用 (可能 1000+ tokens 全部命中缓存)',
      // Example texts for Step 1
      explainQuantum: '解释量子计算',
      explain: '解释',
      quantum: '量子',
      compute: '计算',
      // Example texts for Step 2
      explainEntangle: '解释量子纠缠',
      entangle: '纠缠',
    },
    en: {
      step1Title: 'Step 1: First Request — Full Prefill',
      request: 'Request:',
      fullPrefill: '→ full prefill',
      tokens: 'tokens',
      kvCacheState: 'KV Cache state:',
      cached: '✓ Cached KV for',
      kvOf: 'tokens',
      hashStored: 'stored in prefix cache index',
      step2Title: 'Step 2: New Request — Prefix Match',
      newRequest: 'New request:',
      prefixMatch: 'Prefix match:',
      cacheHit: '→ cache hit! KV for first',
      kvReuse: 'tokens reusable',
      divergeAt: '→ diverges at position',
      startDiverge: '→ only need to prefill',
      newToken: 'new token',
      longestPrefix: 'Longest common prefix:',
      step3Title: 'Step 3: Reuse KV Cache — Save Computation',
      strategy: 'Execution strategy:',
      kvDirectReuse: '← KV direct reuse (skip prefill)',
      onlyPrefillThis: '← only prefill this token',
      oneForward: 'forward',
      savePrefill: 'Save',
      prefillCompute: 'prefill compute =',
      ttftReduction: 'TTFT reduction',
      typicalScenario: 'Typical scenario: system prompt reuse (potentially 1000+ tokens all cache hits)',
      // Example texts for Step 1
      explainQuantum: 'Explain quantum computing',
      explain: 'Explain',
      quantum: 'quantum',
      compute: 'computing',
      // Example texts for Step 2
      explainEntangle: 'Explain quantum entanglement',
      entangle: 'entanglement',
    },
  }[locale];

const steps = [
  {
    title: t.step1Title,
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{t.request} "{t.explainQuantum}"</text>
        <TokenBox x={20} y={30} text={t.explain} variant="neutral" />
        <TokenBox x={90} y={30} text={t.quantum} variant="neutral" />
        <TokenBox x={160} y={30} text={t.compute} variant="neutral" />
        <text x={250} y={47} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          {t.fullPrefill} (3 {t.tokens})
        </text>

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>{t.kvCacheState}</text>
        <TokenBox x={20} y={90} text={t.explain} variant="cached" />
        <TokenBox x={90} y={90} text={t.quantum} variant="cached" />
        <TokenBox x={160} y={90} text={t.compute} variant="cached" />
        <text x={250} y={107} fontSize="7" fill={COLORS.primary} fontFamily={FONTS.sans}>
          {t.cached} 3 {t.kvOf}
        </text>
        <text x={W / 2} y={135} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          hash("{t.explainQuantum}") → {t.hashStored}
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step2Title,
    content: (
      <StepSvg h={150}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{t.newRequest} "{t.explainEntangle}"</text>
        <TokenBox x={20} y={30} text={t.explain} variant="reused" />
        <TokenBox x={90} y={30} text={t.quantum} variant="reused" />
        <TokenBox x={160} y={30} text={t.entangle} variant="new" />

        <text x={20} y={82} fontSize="7" fontWeight="600" fill={COLORS.green}
          fontFamily={FONTS.sans}>{t.prefixMatch}</text>
        <text x={20} y={96} fontSize="7" fill={COLORS.mid} fontFamily={FONTS.sans}>
          hash("{t.explain}{t.quantum}") {t.cacheHit} 2 {t.kvReuse}
        </text>
        <text x={20} y={112} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          "{t.entangle}" ≠ "{t.compute}" {t.divergeAt} 2 {t.startDiverge} 1 {t.newToken}
        </text>
        <text x={W / 2} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.longestPrefix} "{t.explain}{t.quantum}" (2 {t.tokens})
        </text>
      </StepSvg>
    ),
  },
  {
    title: t.step3Title,
    content: (
      <StepSvg h={170}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>{t.strategy}</text>

        {/* Reused tokens */}
        <TokenBox x={20} y={35} text={t.explain} variant="reused" />
        <TokenBox x={90} y={35} text={t.quantum} variant="reused" />
        <text x={170} y={52} fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.kvDirectReuse}
        </text>

        {/* New token */}
        <TokenBox x={20} y={70} text={t.entangle} variant="new" />
        <text x={100} y={87} fontSize="7" fill={COLORS.orange} fontFamily={FONTS.sans}>
          {t.onlyPrefillThis} (1 {t.oneForward})
        </text>

        {/* Stats */}
        <rect x={60} y={110} width={460} height={40} rx={6}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1} />
        <text x={290} y={128} textAnchor="middle" fontSize="8" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          {t.savePrefill} 2/3 {t.prefillCompute} ~67% {t.ttftReduction}
        </text>
        <text x={290} y={142} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {t.typicalScenario}
        </text>
      </StepSvg>
    ),
  },
];

  return <StepNavigator steps={steps} />;
}
