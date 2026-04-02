// src/components/interactive/RooflineModel.tsx
import { useState, useMemo } from 'react';
import { COLORS } from './shared/colors';
import { HARDWARE_PRESETS } from './shared/presets';

export default function RooflineModel() {
  const [batchSize, setBatchSize] = useState(1);
  const [seqLen, setSeqLen] = useState(2048);
  const [hwPreset, setHwPreset] = useState('A100 80GB');
  const hw = HARDWARE_PRESETS[hwPreset];

  // Roofline parameters
  const peakTFLOPS = hw.peakTFLOPS;
  const bwTBs = hw.bandwidthTBs;
  const ridgePoint = peakTFLOPS / bwTBs; // FLOP/Byte at knee

  // Arithmetic intensity for Prefill and Decode
  const prefillAI = seqLen;
  const decodeAI = batchSize;

  // Throughput on roofline
  const roofline = (ai: number) => Math.min(ai * bwTBs, peakTFLOPS);

  // Chart dimensions (log-log)
  const svgW = 480;
  const svgH = 300;
  const padL = 60, padR = 20, padT = 30, padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const aiMin = 0.5, aiMax = 1000;
  const tpMin = 0.1, tpMax = peakTFLOPS * 1.5;

  const logX = (ai: number) => padL + (Math.log10(ai / aiMin) / Math.log10(aiMax / aiMin)) * plotW;
  const logY = (tp: number) => padT + plotH - (Math.log10(tp / tpMin) / Math.log10(tpMax / tpMin)) * plotH;

  // Generate roofline curve points
  const roofPoints = useMemo(() => {
    const points: string[] = [];
    for (let logAI = Math.log10(aiMin); logAI <= Math.log10(aiMax); logAI += 0.05) {
      const ai = Math.pow(10, logAI);
      const tp = roofline(ai);
      points.push(`${logX(ai)},${logY(tp)}`);
    }
    return points.join(' ');
  }, [hw]);

  const decodeTP = roofline(decodeAI);
  const prefillTP = roofline(prefillAI);
  const isDecodeCompute = decodeAI >= ridgePoint;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex flex-wrap gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block">Seq Length (Prefill): {seqLen}</label>
          <input type="range" min={128} max={8192} step={128} value={seqLen}
            onChange={e => setSeqLen(Number(e.target.value))} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">Batch Size (Decode): {batchSize}</label>
          <input type="range" min={1} max={256} step={1} value={batchSize}
            onChange={e => setBatchSize(Number(e.target.value))} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">硬件</label>
          <select value={hwPreset} onChange={e => setHwPreset(e.target.value)}
            className="text-sm border rounded px-2 py-1">
            {Object.keys(HARDWARE_PRESETS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg">
        {/* Roofline */}
        <polyline points={roofPoints} fill="none" stroke={COLORS.mid} strokeWidth={2} />

        {/* Ridge point vertical line */}
        <line x1={logX(ridgePoint)} y1={padT} x2={logX(ridgePoint)} y2={padT + plotH}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4,3" />
        <text x={logX(ridgePoint)} y={padT + plotH + 28} textAnchor="middle"
          fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
          I* = {ridgePoint.toFixed(0)} FLOP/B
        </text>

        {/* Labels */}
        <text x={logX(2)} y={logY(roofline(2)) - 10} fontSize="9" fill={COLORS.mid}
          fontFamily="system-ui">Memory-bound</text>
        <text x={logX(ridgePoint * 3)} y={logY(peakTFLOPS) - 10} fontSize="9" fill={COLORS.mid}
          fontFamily="system-ui">Compute-bound</text>

        {/* Prefill point */}
        <circle cx={logX(prefillAI)} cy={logY(prefillTP)} r={6} fill={COLORS.green} />
        <text x={logX(prefillAI) + 10} y={logY(prefillTP) + 4} fontSize="10"
          fill={COLORS.green} fontFamily="system-ui" fontWeight="600">Prefill</text>

        {/* Decode point */}
        <circle cx={logX(decodeAI)} cy={logY(decodeTP)} r={6}
          fill={isDecodeCompute ? COLORS.green : COLORS.red} />
        <text x={logX(decodeAI) + 10} y={logY(decodeTP) - 8} fontSize="10"
          fill={isDecodeCompute ? COLORS.green : COLORS.red} fontFamily="system-ui" fontWeight="600">
          Decode (bs={batchSize})
        </text>

        {/* Axes labels */}
        <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle"
          fontSize="10" fill={COLORS.dark} fontFamily="system-ui">
          Arithmetic Intensity (FLOP/Byte, log)
        </text>
        <text x={14} y={padT + plotH / 2} textAnchor="middle"
          fontSize="10" fill={COLORS.dark} fontFamily="system-ui"
          transform={`rotate(-90, 14, ${padT + plotH / 2})`}>
          Throughput (TFLOPS, log)
        </text>
      </svg>

      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <strong>Decode:</strong> AI = {decodeAI.toFixed(1)} FLOP/B →{' '}
        {isDecodeCompute ? '✅ Compute-bound (batch 足够大)' : '⚠️ Memory-bound (带宽瓶颈)'}
        &nbsp;| <strong>Prefill:</strong> AI ≈ {prefillAI} FLOP/B → ✅ Compute-bound
      </div>
    </div>
  );
}
