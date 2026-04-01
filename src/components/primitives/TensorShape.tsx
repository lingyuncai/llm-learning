interface TensorShapeProps {
  dims: { name: string; size: number | string }[];
  label?: string;
  className?: string;
}

export default function TensorShape({ dims, label, className = '' }: TensorShapeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm ${className}`}>
      {label && <span className="text-gray-600 mr-1">{label}:</span>}
      <span className="text-gray-500">(</span>
      {dims.map((dim, i) => (
        <span key={i} className="inline-flex items-center">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
            title={dim.name}
          >
            {dim.name}={dim.size}
          </span>
          {i < dims.length - 1 && <span className="text-gray-400 mx-0.5">,</span>}
        </span>
      ))}
      <span className="text-gray-500">)</span>
    </span>
  );
}
