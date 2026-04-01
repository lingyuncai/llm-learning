interface MatrixGridProps {
  data: number[][];
  label?: string;
  shape?: string;
  highlightCells?: [number, number][];
  highlightRows?: number[];
  highlightCols?: number[];
  highlightColor?: string;
  rowLabels?: string[];
  colLabels?: string[];
  className?: string;
  compact?: boolean;
}

export default function MatrixGrid({
  data,
  label,
  shape,
  highlightCells = [],
  highlightRows = [],
  highlightCols = [],
  highlightColor = '#dbeafe',
  rowLabels,
  colLabels,
  className = '',
  compact = false,
}: MatrixGridProps) {
  const isHighlighted = (r: number, c: number) =>
    highlightCells.some(([hr, hc]) => hr === r && hc === c) ||
    highlightRows.includes(r) ||
    highlightCols.includes(c);

  const cellSize = compact ? 'w-10 h-8 text-xs' : 'w-14 h-10 text-sm';

  return (
    <div className={`inline-block ${className}`}>
      {label && (
        <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      )}
      <div className="inline-flex flex-col">
        {colLabels && (
          <div className="flex" style={{ marginLeft: rowLabels ? '2rem' : 0 }}>
            {colLabels.map((cl, i) => (
              <div key={i} className={`${cellSize} flex items-end justify-center pb-1 text-xs text-gray-400`}>
                {cl}
              </div>
            ))}
          </div>
        )}

        {data.map((row, r) => (
          <div key={r} className="flex items-center">
            {rowLabels && (
              <div className="w-8 text-xs text-gray-400 text-right pr-2">
                {rowLabels[r]}
              </div>
            )}
            {row.map((val, c) => (
              <div
                key={c}
                className={`${cellSize} flex items-center justify-center border border-gray-200 font-mono`}
                style={{
                  backgroundColor: isHighlighted(r, c) ? highlightColor : 'white',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 2) : val}
              </div>
            ))}
          </div>
        ))}
      </div>

      {shape && (
        <div className="text-xs text-gray-400 mt-1 text-right">{shape}</div>
      )}
    </div>
  );
}
