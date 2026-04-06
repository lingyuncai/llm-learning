import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const DevicePluginSelector: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      availableDevices: '可用设备扫描',
      autoInfo: 'OpenVINO 运行时自动枚举所有支持的硬件设备',
      autoModeTitle: 'AUTO 自动设备选择流程',
      queryCapabilities: '查询设备能力',
      supportedOps: '(支持的 ops)',
      benchmark: '基准测试',
      latencyTput: '(latency/tput)',
      selectFastest: '选最快',
      gpuSelected: 'GPU 选中',
      highestThroughput: '(最高吞吐)',
      autoModeInfo1: 'AUTO 模式在首次推理时自动选择最优设备',
      autoModeInfo2: '适用于单一模型、对延迟或吞吐有明确偏好的场景',
      multiModeTitle: 'MULTI 多设备并行推理',
      requestStream: '请求流',
      roundRobinDispatch: 'round-robin 分发',
      gpuQueue: 'GPU 队列',
      npuQueue: 'NPU 队列',
      resultMerge: '结果汇总',
      throughputApprox: '吞吐 ≈ 2x',
      idealCase: '(理想情况)',
      heteroModeTitle: 'HETERO 异构子图切分',
      computeGraph: '计算图',
      splitPoint: '切分点',
      deviceAssignment: '设备分配',
      npuSupportedOps: 'NPU: Op1-4 (支持的算子)',
      gpuUnsupportedOps: 'GPU: Op5-7 (不支持算子)',
      crossDeviceTransfer: '跨设备数据传输在切分点发生',
    },
    en: {
      availableDevices: 'Available Device Scan',
      autoInfo: 'OpenVINO runtime auto-enumerates all supported hardware devices',
      autoModeTitle: 'AUTO Automatic Device Selection',
      queryCapabilities: 'Query Capabilities',
      supportedOps: '(supported ops)',
      benchmark: 'Benchmark',
      latencyTput: '(latency/tput)',
      selectFastest: 'Select Fastest',
      gpuSelected: 'GPU Selected',
      highestThroughput: '(highest throughput)',
      autoModeInfo1: 'AUTO mode automatically selects the optimal device on first inference',
      autoModeInfo2: 'Suitable for single model with clear latency or throughput preference',
      multiModeTitle: 'MULTI Multi-Device Parallel Inference',
      requestStream: 'Request Stream',
      roundRobinDispatch: 'round-robin dispatch',
      gpuQueue: 'GPU Queue',
      npuQueue: 'NPU Queue',
      resultMerge: 'Result Merge',
      throughputApprox: 'Throughput ≈ 2x',
      idealCase: '(ideal case)',
      heteroModeTitle: 'HETERO Heterogeneous Subgraph Split',
      computeGraph: 'Compute Graph',
      splitPoint: 'Split Point',
      deviceAssignment: 'Device Assignment',
      npuSupportedOps: 'NPU: Op1-4 (supported ops)',
      gpuUnsupportedOps: 'GPU: Op5-7 (unsupported ops)',
      crossDeviceTransfer: 'Cross-device data transfer occurs at split point',
    },
  }[locale];
  const steps = [
    {
      title: locale === 'zh' ? '设备发现' : 'Device Discovery',
      content: (
        <svg viewBox="0 0 580 180" className="w-full">
          {/* Title */}
          <text x="290" y="20" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.availableDevices}
          </text>

          {/* GPU device */}
          <g transform="translate(80, 60)">
            <rect x="0" y="0" width="100" height="80" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="50" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
              GPU
            </text>
            <text x="50" y="50" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Xe2 Cores
            </text>
            <text x="50" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              128 EU
            </text>
          </g>

          {/* NPU device */}
          <g transform="translate(240, 60)">
            <rect x="0" y="0" width="100" height="80" fill={COLORS.primary} opacity="0.2" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="50" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              NPU
            </text>
            <text x="50" y="50" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              AI Boost
            </text>
            <text x="50" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              48 TOPS
            </text>
          </g>

          {/* CPU device */}
          <g transform="translate(400, 60)">
            <rect x="0" y="0" width="100" height="80" fill={COLORS.mid} opacity="0.2" stroke={COLORS.mid} strokeWidth="2" rx="4" />
            <text x="50" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>
              CPU
            </text>
            <text x="50" y="50" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Lion Cove
            </text>
            <text x="50" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              16 Cores
            </text>
          </g>

          {/* Info */}
          <text x="290" y="165" textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.autoInfo}
          </text>
        </svg>
      ),
    },
    {
      title: locale === 'zh' ? 'AUTO 模式' : 'AUTO Mode',
      content: (
        <svg viewBox="0 0 580 180" className="w-full">
          {/* Title */}
          <text x="290" y="20" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.autoModeTitle}
          </text>

          {/* Flow diagram */}
          <g transform="translate(50, 50)">
            {/* Query capabilities */}
            <rect x="0" y="0" width="110" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1.5" rx="4" />
            <text x="55" y="16" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.queryCapabilities}
            </text>
            <text x="55" y="30" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.supportedOps}
            </text>

            {/* Arrow */}
            <path d="M 110 20 L 140 20" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* Benchmark */}
            <rect x="140" y="0" width="110" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1.5" rx="4" />
            <text x="195" y="16" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.benchmark}
            </text>
            <text x="195" y="30" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.latencyTput}
            </text>

            {/* Arrow */}
            <path d="M 250 20 L 280 20" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* Decision */}
            <polygon points="335,0 380,20 335,40 290,20" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1.5" />
            <text x="335" y="25" textAnchor="middle" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.selectFastest}
            </text>

            {/* Arrow */}
            <path d="M 380 20 L 410 20" stroke={COLORS.mid} strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* Result */}
            <rect x="410" y="0" width="110" height="40" fill={COLORS.green} opacity="0.3" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="465" y="16" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
              {t.gpuSelected}
            </text>
            <text x="465" y="30" textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.highestThroughput}
            </text>
          </g>

          {/* Arrow marker */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Info */}
          <text x="290" y="120" textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.autoModeInfo1}
          </text>
          <text x="290" y="140" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.autoModeInfo2}
          </text>
        </svg>
      ),
    },
    {
      title: locale === 'zh' ? 'MULTI 模式' : 'MULTI Mode',
      content: (
        <svg viewBox="0 0 580 180" className="w-full">
          {/* Title */}
          <text x="290" y="20" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.multiModeTitle}
          </text>

          {/* Request stream */}
          <g transform="translate(40, 50)">
            <rect x="0" y="0" width="120" height="100" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1.5" rx="4" />
            <text x="60" y="20" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.requestStream}
            </text>
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x="20" y={35 + i * 15} width="80" height="10" fill={COLORS.light} stroke={COLORS.mid} strokeWidth="0.5" rx="2" />
            ))}
            <text x="60" y="110" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.roundRobinDispatch}
            </text>
          </g>

          {/* Arrows */}
          <path d="M 160 80 L 210 60" stroke={COLORS.green} strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowGreen)" />
          <path d="M 160 100 L 210 120" stroke={COLORS.primary} strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowBlue)" />

          {/* GPU queue */}
          <g transform="translate(210, 40)">
            <rect x="0" y="0" width="100" height="50" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="50" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
              {t.gpuQueue}
            </text>
            <text x="50" y="38" textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Req 1, 3, 5...
            </text>
          </g>

          {/* NPU queue */}
          <g transform="translate(210, 110)">
            <rect x="0" y="0" width="100" height="50" fill={COLORS.primary} opacity="0.2" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="50" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              {t.npuQueue}
            </text>
            <text x="50" y="38" textAnchor="middle" fontSize="9" fill={COLORS.dark} fontFamily={FONTS.sans}>
              Req 2, 4, 6...
            </text>
          </g>

          {/* Merge arrows */}
          <path d="M 310 65 L 360 90" stroke={COLORS.green} strokeWidth="2" markerEnd="url(#arrowGreen)" />
          <path d="M 310 135 L 360 110" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrowBlue)" />

          {/* Result */}
          <g transform="translate(360, 70)">
            <rect x="0" y="0" width="100" height="60" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="1.5" rx="4" />
            <text x="50" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.resultMerge}
            </text>
            <text x="50" y="38" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.throughputApprox}
            </text>
            <text x="50" y="52" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.idealCase}
            </text>
          </g>

          {/* Arrow markers */}
          <defs>
            <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.green} />
            </marker>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
            </marker>
          </defs>
        </svg>
      ),
    },
    {
      title: locale === 'zh' ? 'HETERO 模式' : 'HETERO Mode',
      content: (
        <svg viewBox="0 0 580 180" className="w-full">
          {/* Title */}
          <text x="290" y="20" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.heteroModeTitle}
          </text>

          {/* Graph */}
          <g transform="translate(80, 50)">
            <text x="0" y="0" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.computeGraph}
            </text>

            {/* Supported ops on NPU */}
            {[0, 1, 2, 3].map(i => (
              <g key={i}>
                <circle cx={30 + i * 40} cy={40} r="14" fill={COLORS.primary} opacity="0.7" stroke={COLORS.primary} strokeWidth="2" />
                <text x={30 + i * 40} y={44} textAnchor="middle" fontSize="9" fill="white" fontFamily={FONTS.mono}>
                  Op{i + 1}
                </text>
              </g>
            ))}

            {/* Partition line */}
            <line x1="170" y1="25" x2="170" y2="100" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="5,3" />
            <text x="175" y="65" fontSize="10" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {t.splitPoint}
            </text>

            {/* Unsupported ops on GPU */}
            {[4, 5, 6].map(i => (
              <g key={i}>
                <circle cx={-10 + i * 40} cy={90} r="14" fill={COLORS.green} opacity="0.7" stroke={COLORS.green} strokeWidth="2" />
                <text x={-10 + i * 40} y={94} textAnchor="middle" fontSize="9" fill="white" fontFamily={FONTS.mono}>
                  Op{i + 1}
                </text>
              </g>
            ))}

            {/* Edges */}
            <path d="M 70 40 L 110 40" stroke={COLORS.mid} strokeWidth="1.5" />
            <path d="M 110 40 L 150 40" stroke={COLORS.mid} strokeWidth="1.5" />
            <path d="M 150 46 L 150 74" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="3,2" />
            <path d="M 150 90 L 190 90" stroke={COLORS.mid} strokeWidth="1.5" />
            <path d="M 190 90 L 230 90" stroke={COLORS.mid} strokeWidth="1.5" />
          </g>

          {/* Assignment */}
          <g transform="translate(340, 50)">
            <rect x="0" y="0" width="200" height="90" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="100" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.deviceAssignment}
            </text>

            <rect x="15" y="35" width="12" height="12" fill={COLORS.primary} opacity="0.7" />
            <text x="32" y="44" fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.npuSupportedOps}
            </text>

            <rect x="15" y="55" width="12" height="12" fill={COLORS.green} opacity="0.7" />
            <text x="32" y="64" fontSize="10" fill={COLORS.dark} fontFamily={FONTS.sans}>
              {t.gpuUnsupportedOps}
            </text>

            <text x="100" y="82" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.sans}>
              {t.crossDeviceTransfer}
            </text>
          </g>
        </svg>
      ),
    },
  ];

  return (
    <div className="my-6">
      <StepNavigator steps={steps} />
    </div>
  );
};

export default DevicePluginSelector;
