import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 560;

function TokenBlocks() {
  const tokens = ['You', ' are', ' a', ' helpful', ' assistant', '.', ' What', ' is', ' Paged', 'Attention', '?'];
  const blockSize = 4;
  const blocks: string[][] = [];
  for (let i = 0; i < tokens.length; i += blockSize) {
    blocks.push(tokens.slice(i, i + blockSize));
  }

  return (
    <svg width={W} height={120} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 1: Token 序列分块 (block_size = 4)
      </text>
      {blocks.map((block, bi) => {
        const x = 10 + bi * 180;
        return (
          <g key={bi}>
            <rect x={x} y={35} width={170} height={40} rx={4}
              fill={bi < blocks.length - 1 ? COLORS.valid : COLORS.highlight}
              stroke={COLORS.primary} strokeWidth={1} />
            <text x={x + 8} y={60} fontSize={11} fill={COLORS.dark} fontFamily={FONTS.mono}>
              [{block.join(', ')}]
            </text>
            <text x={x + 70} y={90} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans} textAnchor="middle">
              Block {bi}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HashComputation() {
  const hashes = [
    { block: 'Block 0', tokens: '["You"," are"," a"," helpful"]', hash: '0xa3f2', status: 'new' },
    { block: 'Block 1', tokens: '["assistant","."," What"," is"]', hash: '0x7b1c', status: 'new' },
    { block: 'Block 2', tokens: '[" Paged","Attention","?"]', hash: '0xd4e8', status: 'new' },
  ];

  return (
    <svg width={W} height={200} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 2: 每块计算 Hash 值
      </text>
      <text x={10} y={38} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        hash = SHA256(layer_id + block_tokens + prefix_hash)
      </text>
      {hashes.map((h, i) => {
        const y = 55 + i * 48;
        return (
          <g key={i}>
            <rect x={10} y={y} width={300} height={36} rx={4} fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
            <text x={20} y={y + 15} fontSize={11} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
              {h.block}
            </text>
            <text x={20} y={y + 28} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
              {h.tokens}
            </text>
            {/* Arrow */}
            <line x1={320} y1={y + 18} x2={370} y2={y + 18} stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#arrowH)" />
            {/* Hash */}
            <rect x={380} y={y + 4} width={80} height={28} rx={14} fill={COLORS.primary} />
            <text x={420} y={y + 23} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">
              {h.hash}
            </text>
          </g>
        );
      })}
      <defs>
        <marker id="arrowH" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
        </marker>
      </defs>
    </svg>
  );
}

function HashTableLookup() {
  const entries = [
    { hash: '0xa3f2', physBlock: 'Phys 5', hit: true },
    { hash: '0x7b1c', physBlock: 'Phys 12', hit: true },
    { hash: '0xd4e8', physBlock: '—', hit: false },
  ];

  return (
    <svg width={W} height={220} style={{ display: 'block' }}>
      <text x={10} y={20} fontSize={13} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.sans}>
        Step 3: Hash Table 查表 → 命中复用 / 未命中计算
      </text>
      {/* Hash table header */}
      <rect x={10} y={35} width={W - 20} height={28} rx={4} fill={COLORS.dark} />
      <text x={80} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Hash</text>
      <text x={220} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Physical Block</text>
      <text x={380} y={53} fontSize={12} fill="#fff" fontFamily={FONTS.mono} textAnchor="middle">Status</text>

      {entries.map((e, i) => {
        const y = 68 + i * 36;
        return (
          <g key={i}>
            <rect x={10} y={y} width={W - 20} height={32} rx={0}
              fill={e.hit ? '#ecfdf5' : COLORS.waste} />
            <text x={80} y={y + 20} fontSize={12} fill={COLORS.dark} fontFamily={FONTS.mono} textAnchor="middle">
              {e.hash}
            </text>
            <text x={220} y={y + 20} fontSize={12} fill={COLORS.dark} fontFamily={FONTS.mono} textAnchor="middle">
              {e.physBlock}
            </text>
            <text x={380} y={y + 20} fontSize={12} fontWeight={600}
              fill={e.hit ? COLORS.green : COLORS.red} fontFamily={FONTS.sans} textAnchor="middle">
              {e.hit ? '✓ HIT — 复用' : '✗ MISS — 计算'}
            </text>
          </g>
        );
      })}

      <text x={10} y={190} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        优点：实现简单，O(1) 查找。缺点：只能匹配精确前缀（hash 依赖 prefix_hash 链式计算），
      </text>
      <text x={10} y={205} fontSize={11} fill={COLORS.mid} fontFamily={FONTS.sans}>
        无法处理非前缀位置的共享（如中间片段相同但开头不同）。
      </text>
    </svg>
  );
}

export default function HashPrefixCaching() {
  return (
    <StepNavigator
      steps={[
        { title: '分块', content: <TokenBlocks /> },
        { title: '计算 Hash', content: <HashComputation /> },
        { title: '查表复用', content: <HashTableLookup /> },
      ]}
    />
  );
}
