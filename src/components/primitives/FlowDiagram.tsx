import { useMemo, useRef, useEffect, useState, useCallback, useId } from 'react';

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
  borderColor?: string;
  textColor?: string;
  icon?: string;
  column?: number;
  row?: number;
  width?: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  title?: string;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

/** Compute how many rows/cols the grid needs. */
function computeGridSize(nodes: FlowNode[]) {
  let maxRow = 0;
  let maxCol = 0;
  for (const n of nodes) {
    const r = n.row ?? 0;
    const c = n.column ?? 0;
    const w = n.width ?? 1;
    if (r > maxRow) maxRow = r;
    if (c + w - 1 > maxCol) maxCol = c + w - 1;
  }
  return { rows: maxRow + 1, cols: maxCol + 1 };
}

/** Arrow marker id prefix for SVG edges. */
const ARROW_MARKER_PREFIX = 'fd-arrow';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Given source and target bounding rects (relative to the SVG container),
 * return the start/end points of an edge that connects the two closest sides.
 */
function computeEdgePoints(
  src: Rect,
  dst: Rect,
  direction: 'vertical' | 'horizontal',
): { x1: number; y1: number; x2: number; y2: number } {
  const sCx = src.left + src.width / 2;
  const sCy = src.top + src.height / 2;
  const dCx = dst.left + dst.width / 2;
  const dCy = dst.top + dst.height / 2;

  let x1: number, y1: number, x2: number, y2: number;

  if (direction === 'vertical') {
    // Prefer top/bottom connection
    if (dCy >= sCy) {
      // dst is below src
      x1 = sCx; y1 = src.top + src.height;
      x2 = dCx; y2 = dst.top;
    } else {
      x1 = sCx; y1 = src.top;
      x2 = dCx; y2 = dst.top + dst.height;
    }
  } else {
    // Prefer left/right connection
    if (dCx >= sCx) {
      x1 = src.left + src.width; y1 = sCy;
      x2 = dst.left;             y2 = dCy;
    } else {
      x1 = src.left;             y1 = sCy;
      x2 = dst.left + dst.width; y2 = dCy;
    }
  }

  return { x1, y1, x2, y2 };
}

export default function FlowDiagram({
  nodes,
  edges,
  title,
  direction = 'vertical',
  className = '',
}: FlowDiagramProps) {
  const instanceId = useId();
  const arrowMarkerId = `${ARROW_MARKER_PREFIX}-${instanceId}`;
  const { rows, cols } = useMemo(() => computeGridSize(nodes), [nodes]);

  // Refs / state for measuring node positions so we can draw SVG edges.
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [nodeRects, setNodeRects] = useState<Record<string, Rect>>({});

  /** Measure every node element relative to the container. */
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const rects: Record<string, Rect> = {};
    for (const n of nodes) {
      const el = nodeRefs.current[n.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      rects[n.id] = {
        left: r.left - cRect.left,
        top: r.top - cRect.top,
        width: r.width,
        height: r.height,
      };
    }
    setNodeRects(rects);
  }, [nodes]);

  // Re-measure on mount and when nodes/direction change.
  useEffect(() => {
    // Initial measure after first paint.
    const frame = requestAnimationFrame(measure);
    // Also observe container resize.
    const container = containerRef.current;
    let observer: ResizeObserver | undefined;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(container);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [measure, direction]);

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      nodeRefs.current[id] = el;
    },
    [],
  );

  // Build the grid template string.
  const gridTemplate: React.CSSProperties =
    direction === 'vertical'
      ? {
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, auto)`,
        }
      : {
          gridTemplateColumns: `repeat(${rows}, auto)`,
          gridTemplateRows: `repeat(${cols}, minmax(0, 1fr))`,
        };

  return (
    <div className={`my-4 ${className}`}>
      {title && (
        <div className="text-center text-sm font-semibold text-gray-700 mb-2">
          {title}
        </div>
      )}

      {/* Wrapper: position-relative so the SVG overlay can sit on top. */}
      <div ref={containerRef} className="relative">
        {/* Node grid */}
        <div
          className="grid gap-4 items-center justify-items-center"
          style={{
            ...gridTemplate,
            padding: '16px',
          }}
        >
          {nodes.map((node) => {
            const col = node.column ?? 0;
            const row = node.row ?? 0;
            const span = node.width ?? 1;

            // Map row/col depending on direction.
            const gridStyles: React.CSSProperties =
              direction === 'vertical'
                ? {
                    gridColumn: `${col + 1} / span ${span}`,
                    gridRow: row + 1,
                  }
                : {
                    // For horizontal, swap row ↔ col.
                    gridColumn: row + 1,
                    gridRow: `${col + 1} / span ${span}`,
                  };

            const bgClass = node.color ?? 'bg-gray-50';
            const borderClass = node.borderColor ?? 'border-gray-300';
            const textClass = node.textColor ?? 'text-gray-800';

            return (
              <div
                key={node.id}
                ref={setNodeRef(node.id)}
                className={`
                  rounded-lg border px-4 py-2 text-center
                  shadow-sm w-full max-w-[220px]
                  ${bgClass} ${borderClass} ${textClass}
                `}
                style={gridStyles}
              >
                {node.icon && <span className="mr-1">{node.icon}</span>}
                <span className="font-medium text-sm leading-tight">
                  {node.label}
                </span>
                {node.sublabel && (
                  <div className="text-xs opacity-70 mt-0.5 leading-tight">
                    {node.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SVG overlay for edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id={arrowMarkerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#9ca3af" />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const srcRect = nodeRects[edge.from];
            const dstRect = nodeRects[edge.to];
            if (!srcRect || !dstRect) return null;

            const { x1, y1, x2, y2 } = computeEdgePoints(srcRect, dstRect, direction);

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={`${edge.from}-${edge.to}-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeDasharray={edge.style === 'dashed' ? '6 3' : undefined}
                  markerEnd={`url(#${arrowMarkerId})`}
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={midY}
                    dy={direction === 'vertical' ? -6 : -8}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-500"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
