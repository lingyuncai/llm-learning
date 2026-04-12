import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

// Pre-computed 2D coordinates for ~50 words grouped by semantic clusters
interface WordPoint {
  word: string;
  x: number;
  y: number;
  cluster: string;
}

const WORDS: WordPoint[] = [
  // Royalty cluster
  { word: 'king', x: 320, y: 120, cluster: 'royalty' },
  { word: 'queen', x: 360, y: 160, cluster: 'royalty' },
  { word: 'prince', x: 290, y: 150, cluster: 'royalty' },
  { word: 'princess', x: 330, y: 190, cluster: 'royalty' },
  { word: 'throne', x: 270, y: 130, cluster: 'royalty' },
  { word: 'crown', x: 300, y: 100, cluster: 'royalty' },
  { word: 'royal', x: 350, y: 130, cluster: 'royalty' },

  // Gender cluster
  { word: 'man', x: 200, y: 220, cluster: 'gender' },
  { word: 'woman', x: 240, y: 260, cluster: 'gender' },
  { word: 'boy', x: 180, y: 250, cluster: 'gender' },
  { word: 'girl', x: 220, y: 290, cluster: 'gender' },
  { word: 'father', x: 160, y: 210, cluster: 'gender' },
  { word: 'mother', x: 200, y: 250, cluster: 'gender' },
  { word: 'brother', x: 170, y: 240, cluster: 'gender' },
  { word: 'sister', x: 210, y: 280, cluster: 'gender' },

  // Country-Capital cluster
  { word: 'France', x: 540, y: 100, cluster: 'country' },
  { word: 'Paris', x: 580, y: 130, cluster: 'capital' },
  { word: 'Germany', x: 520, y: 140, cluster: 'country' },
  { word: 'Berlin', x: 560, y: 170, cluster: 'capital' },
  { word: 'Japan', x: 500, y: 120, cluster: 'country' },
  { word: 'Tokyo', x: 540, y: 150, cluster: 'capital' },
  { word: 'Italy', x: 560, y: 110, cluster: 'country' },
  { word: 'Rome', x: 600, y: 140, cluster: 'capital' },
  { word: 'China', x: 510, y: 160, cluster: 'country' },
  { word: 'Beijing', x: 550, y: 190, cluster: 'capital' },

  // Animals cluster
  { word: 'cat', x: 120, y: 380, cluster: 'animal' },
  { word: 'dog', x: 150, y: 360, cluster: 'animal' },
  { word: 'fish', x: 100, y: 410, cluster: 'animal' },
  { word: 'bird', x: 140, y: 400, cluster: 'animal' },
  { word: 'horse', x: 170, y: 390, cluster: 'animal' },
  { word: 'lion', x: 130, y: 350, cluster: 'animal' },

  // Verbs cluster
  { word: 'run', x: 500, y: 350, cluster: 'verb' },
  { word: 'walk', x: 530, y: 370, cluster: 'verb' },
  { word: 'swim', x: 480, y: 380, cluster: 'verb' },
  { word: 'fly', x: 510, y: 390, cluster: 'verb' },
  { word: 'jump', x: 490, y: 360, cluster: 'verb' },

  // Food cluster
  { word: 'apple', x: 350, y: 370, cluster: 'food' },
  { word: 'banana', x: 380, y: 390, cluster: 'food' },
  { word: 'rice', x: 330, y: 400, cluster: 'food' },
  { word: 'bread', x: 360, y: 410, cluster: 'food' },
  { word: 'coffee', x: 340, y: 380, cluster: 'food' },

  // Numbers/Size
  { word: 'big', x: 650, y: 300, cluster: 'size' },
  { word: 'small', x: 670, y: 330, cluster: 'size' },
  { word: 'large', x: 640, y: 310, cluster: 'size' },
  { word: 'tiny', x: 680, y: 340, cluster: 'size' },
];

const CLUSTER_COLORS: Record<string, string> = {
  royalty: COLORS.purple,
  gender: COLORS.primary,
  country: COLORS.green,
  capital: '#00838f',
  animal: COLORS.orange,
  verb: COLORS.red,
  food: '#ef6c00',
  size: COLORS.mid,
};

const CLUSTER_BG: Record<string, string> = {
  royalty: '#f3e8ff',
  gender: '#dbeafe',
  country: '#dcfce7',
  capital: '#e0f7fa',
  animal: '#fff3e0',
  verb: '#ffebee',
  food: '#fff8e1',
  size: '#f5f5f5',
};

interface Analogy {
  label: string;
  a: string; b: string; c: string; d: string;
  explanation: string;
}

export default function WordEmbeddingSpace({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '词向量空间',
      selectAnalogy: '选择类比关系：',
      formula: '类比公式',
      hoveredWord: '悬停查看词向量',
      cluster: '语义簇',
      analogies: [
        { label: '国王-王后', a: 'king', b: 'queen', c: 'man', d: 'woman', explanation: 'king - man + woman ≈ queen（性别关系）' },
        { label: '国家-首都', a: 'France', b: 'Paris', c: 'Japan', d: 'Tokyo', explanation: 'France - Paris + Tokyo ≈ Japan（国家-首都关系）' },
        { label: '父-母', a: 'father', b: 'mother', c: 'boy', d: 'girl', explanation: 'father - boy + girl ≈ mother（性别关系）' },
        { label: '大-小', a: 'big', b: 'small', c: 'large', d: 'tiny', explanation: 'big - large + tiny ≈ small（大小对比）' },
      ] as Analogy[],
      legendTitle: '语义聚类',
    },
    en: {
      title: 'Word Embedding Space',
      selectAnalogy: 'Select analogy:',
      formula: 'Analogy formula',
      hoveredWord: 'Hover to see word vectors',
      cluster: 'Semantic cluster',
      analogies: [
        { label: 'King-Queen', a: 'king', b: 'queen', c: 'man', d: 'woman', explanation: 'king - man + woman ≈ queen (gender relation)' },
        { label: 'Country-Capital', a: 'France', b: 'Paris', c: 'Japan', d: 'Tokyo', explanation: 'France - Paris + Tokyo ≈ Japan (country-capital relation)' },
        { label: 'Father-Mother', a: 'father', b: 'mother', c: 'boy', d: 'girl', explanation: 'father - boy + girl ≈ mother (gender relation)' },
        { label: 'Big-Small', a: 'big', b: 'small', c: 'large', d: 'tiny', explanation: 'big - large + tiny ≈ small (size contrast)' },
      ] as Analogy[],
      legendTitle: 'Semantic Clusters',
    },
  }[locale]!;

  const [selectedAnalogy, setSelectedAnalogy] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const analogy = t.analogies[selectedAnalogy];
  const analogyWords = new Set([analogy.a, analogy.b, analogy.c, analogy.d]);

  const getWordPos = (word: string) => WORDS.find(w => w.word === word);

  // Cluster legend
  const clusters = useMemo(() => {
    const seen = new Set<string>();
    return WORDS.filter(w => {
      if (seen.has(w.cluster)) return false;
      seen.add(w.cluster);
      return true;
    }).map(w => w.cluster);
  }, []);

  const posA = getWordPos(analogy.a);
  const posB = getWordPos(analogy.b);
  const posC = getWordPos(analogy.c);
  const posD = getWordPos(analogy.d);

  return (
    <div className="my-6">
      {/* Analogy selector */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <span className="text-sm font-medium text-gray-600">{t.selectAnalogy}</span>
        {t.analogies.map((a, i) => (
          <button
            key={i}
            onClick={() => setSelectedAnalogy(i)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: selectedAnalogy === i ? COLORS.primary : '#f1f5f9',
              color: selectedAnalogy === i ? '#fff' : '#475569',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="emb-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={COLORS.red} />
          </marker>
          <marker id="emb-arrow-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* Background clusters */}
        {clusters.map(cluster => {
          const clusterWords = WORDS.filter(w => w.cluster === cluster);
          const minX = Math.min(...clusterWords.map(w => w.x)) - 25;
          const minY = Math.min(...clusterWords.map(w => w.y)) - 20;
          const maxX = Math.max(...clusterWords.map(w => w.x)) + 25;
          const maxY = Math.max(...clusterWords.map(w => w.y)) + 15;
          return (
            <rect key={cluster}
              x={minX} y={minY} width={maxX - minX} height={maxY - minY}
              rx={8} fill={CLUSTER_BG[cluster]} opacity={0.5}
            />
          );
        })}

        {/* Analogy parallelogram */}
        {posA && posB && posC && posD && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Parallelogram outline */}
            <polygon
              points={`${posA.x},${posA.y} ${posB.x},${posB.y} ${posD.x},${posD.y} ${posC.x},${posC.y}`}
              fill={COLORS.highlight} fillOpacity={0.3}
              stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6,3"
            />
            {/* Arrow A → B */}
            <line x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
              stroke={COLORS.red} strokeWidth={2} markerEnd="url(#emb-arrow)" />
            {/* Arrow C → D (parallel) */}
            <line x1={posC.x} y1={posC.y} x2={posD.x} y2={posD.y}
              stroke={COLORS.primary} strokeWidth={2} markerEnd="url(#emb-arrow-blue)" />
          </motion.g>
        )}

        {/* Word dots */}
        {WORDS.map((wp) => {
          const isAnalogy = analogyWords.has(wp.word);
          const isHovered = hoveredWord === wp.word;
          const r = isAnalogy ? 6 : isHovered ? 5 : 3.5;
          const color = CLUSTER_COLORS[wp.cluster];

          return (
            <g key={wp.word}
              onMouseEnter={() => setHoveredWord(wp.word)}
              onMouseLeave={() => setHoveredWord(null)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle
                cx={wp.x} cy={wp.y} r={r}
                fill={isAnalogy ? color : color}
                stroke={isAnalogy ? COLORS.dark : 'none'}
                strokeWidth={isAnalogy ? 2 : 0}
                initial={false}
                animate={{ r }}
                transition={{ duration: 0.2 }}
              />
              {(isAnalogy || isHovered) && (
                <text
                  x={wp.x} y={wp.y - r - 4}
                  textAnchor="middle" fontSize={isAnalogy ? '11' : '10'}
                  fontWeight={isAnalogy ? '700' : '500'}
                  fill={COLORS.dark}
                >
                  {wp.word}
                </text>
              )}
            </g>
          );
        })}

        {/* Analogy explanation */}
        <rect x={20} y={H - 55} width={W - 40} height={40} rx={6}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}>
          {analogy.explanation}
        </text>

        {/* Legend */}
        {clusters.map((cluster, i) => {
          const col = Math.floor(i / 4);
          const row = i % 4;
          const lx = 640 + col * 90;
          const ly = 380 + row * 18;
          return (
            <g key={cluster}>
              <circle cx={lx} cy={ly} r={4} fill={CLUSTER_COLORS[cluster]} />
              <text x={lx + 8} y={ly + 4} fontSize="9" fill={COLORS.mid}>
                {cluster}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
