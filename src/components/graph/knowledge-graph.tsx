type Node = { id: string; label: string };
type Edge = { from: string; to: string };

export default function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
        No topic relationships yet.
      </div>
    );
  }

  const size = 320;
  const center = size / 2;
  const radius = 110;
  const positions = nodes.reduce<Record<string, { x: number; y: number }>>(
    (acc, node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      acc[node.id] = {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
      return acc;
    },
    {},
  );

  return (
    <div className="rounded-2xl bg-white p-4">
      <svg width={size} height={size} className="mx-auto block">
        {edges.map((edge, index) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--surface-3)"
              strokeWidth="2"
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={positions[node.id].x}
              cy={positions[node.id].y}
              r="18"
              fill="var(--accent)"
            />
            <text
              x={positions[node.id].x}
              y={positions[node.id].y + 4}
              textAnchor="middle"
              fontSize="10"
              fill="white"
            >
              {node.label.slice(0, 6)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 grid gap-2 text-xs text-[var(--muted)]">
        {edges.length === 0 ? (
          <p>No relationships defined yet.</p>
        ) : (
          edges.map((edge, index) => {
            const from = nodes.find((node) => node.id === edge.from)?.label ?? edge.from;
            const to = nodes.find((node) => node.id === edge.to)?.label ?? edge.to;
            return (
              <div key={`${edge.from}-${edge.to}-${index}`} className="rounded-2xl bg-[color:var(--surface-2)] p-2">
                {from} → {to}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
