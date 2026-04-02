// src/components/interactive/BlockSizeCalculator.tsx
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

export default function BlockSizeCalculator() {
  const [sramKB, setSramKB] = useState(100);
  const [d, setD] = useState(64);
  const [N, setN] = useState(512);

  const calc = useMemo(() => {
    const M = sramKB * 1024; // bytes
    const Bc = Math.ceil(M / (4 * d));
    const Br = Math.min(Bc, d);
    const Tc = Math.ceil(N / Bc);
    const Tr = Math.ceil(N / Br);
    const totalBlocks = Tc * Tr;
    return { Bc, Br, Tc, Tr, totalBlocks, M };
  }, [sramKB, d, N]);

  // Visualization: show Q blocks (left) and K/V blocks (right)
  const maxBlocksToShow = 12;
  const qBlocks = Math.min(calc.Tr, maxBlocksToShow);
  const kvBlocks = Math.min(calc.Tc, maxBlocksToShow);

  return (
    <div className="my-6 p-4 bg-white rounded-lg border" style={{ borderColor: COLORS.light }}>
      <h3 className="text-base font-bold mb-3" style={{ color: COLORS.dark }}>
        分块大小计算器
      </h3>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>SRAM (M)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{sramKB} KB</span>
          </div>
          <input type="range" min={10} max={200} step={10} value={sramKB}
            onChange={e => setSramKB(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>head dim (d)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{d}</span>
          </div>
          <input type="range" min={32} max={128} step={32} value={d}
            onChange={e => setD(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
        <label className="text-xs">
          <div className="flex justify-between mb-1">
            <span style={{ color: COLORS.mid }}>序列长度 (N)</span>
            <span className="font-mono font-semibold" style={{ color: COLORS.primary }}>{N}</span>
          </div>
          <input type="range" min={128} max={4096} step={128} value={N}
            onChange={e => setN(Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: COLORS.primary }} />
        </label>
      </div>

      {/* Formulas + results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
        {[
          { label: 'Bc = ⌈M/(4d)⌉', value: calc.Bc, color: COLORS.primary },
          { label: 'Br = min(Bc, d)', value: calc.Br, color: COLORS.green },
          { label: 'Q blocks (Tr)', value: calc.Tr, color: COLORS.green },
          { label: 'K/V blocks (Tc)', value: calc.Tc, color: COLORS.primary },
        ].map(({ label, value, color }) => (
          <motion.div key={label}
            className="p-2 rounded border text-xs"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
            layout
          >
            <div className="text-[10px]" style={{ color: COLORS.mid }}>{label}</div>
            <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Block visualization */}
      <div className="flex justify-center gap-8 mb-3">
        {/* Q blocks */}
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: COLORS.mid }}>
            Q 矩阵 ({N}×{d})
          </div>
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: qBlocks }, (_, i) => (
              <motion.div key={i}
                className="rounded text-[9px] font-mono flex items-center justify-center"
                style={{
                  width: 60,
                  height: Math.max(12, 80 / qBlocks),
                  backgroundColor: `${COLORS.green}20`,
                  border: `1px solid ${COLORS.green}60`,
                  color: COLORS.green,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {calc.Br}×{d}
              </motion.div>
            ))}
            {calc.Tr > maxBlocksToShow && (
              <div className="text-[9px]" style={{ color: COLORS.mid }}>
                ...({calc.Tr - maxBlocksToShow} more)
              </div>
            )}
          </div>
        </div>

        {/* K/V blocks */}
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: COLORS.mid }}>
            K, V 矩阵 ({N}×{d})
          </div>
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: kvBlocks }, (_, i) => (
              <motion.div key={i}
                className="rounded text-[9px] font-mono flex items-center justify-center"
                style={{
                  width: 60,
                  height: Math.max(12, 80 / kvBlocks),
                  backgroundColor: `${COLORS.primary}20`,
                  border: `1px solid ${COLORS.primary}60`,
                  color: COLORS.primary,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {calc.Bc}×{d}
              </motion.div>
            ))}
            {calc.Tc > maxBlocksToShow && (
              <div className="text-[9px]" style={{ color: COLORS.mid }}>
                ...({calc.Tc - maxBlocksToShow} more)
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: COLORS.orange }}>
        SRAM 越大 → 块越大 → 外循环次数越少 → HBM 访问越少（当前共 {calc.totalBlocks} 次块计算）
      </p>
    </div>
  );
}
