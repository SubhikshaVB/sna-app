import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import { useEffect, useState } from "react";

const TALUK_COLORS = {
  Aruppukottai: "#f97316",
  Rajapalayam: "#ef4444",
  Sattur: "#0ea5e9",
  Sivakasi: "#8b5cf6",
  Srivilliputhur: "#22c55e",
  Tiruchuli: "#eab308",
  Virudhunagar: "#14b8a6",
};

export default function NetworkPreview({ data }) {
  const [layout, setLayout] = useState({ nodes: [], links: [] });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (!data?.nodes?.length) {
      setLayout({ nodes: [], links: [] });
      return;
    }

    const nodes = data.nodes.map((node) => ({ ...node }));
    const links = data.links.map((link) => ({ ...link }));
    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-80))
      .force("center", forceCenter(380, 235))
      .force(
        "link",
        forceLink(links)
          .id((node) => node.id)
          .distance((link) => 44 + Number(link.distance_km || 0) * 1.8)
          .strength(0.12)
      )
      .stop();

    for (let i = 0; i < 170; i += 1) {
      simulation.tick();
    }

    setLayout({ nodes, links });
    simulation.stop();
  }, [data]);

  function onWheel(event) {
    event.preventDefault();
    const nextScale = Math.min(2.2, Math.max(0.8, transform.scale - event.deltaY * 0.001));
    setTransform((current) => ({ ...current, scale: nextScale }));
  }

  function onPointerDown(event) {
    setDragStart({
      x: event.clientX - transform.x,
      y: event.clientY - transform.y,
    });
  }

  function onPointerMove(event) {
    if (!dragStart) {
      return;
    }
    setTransform((current) => ({
      ...current,
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    }));
  }

  function onPointerUp() {
    setDragStart(null);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Live Network View</p>
          <h3>Relationship map of attractions</h3>
        </div>
        <div className="panel-actions">
          <p className="muted">Drag to pan and use the wheel to zoom.</p>
          <button type="button" className="ghost-button" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}>
            Reset view
          </button>
        </div>
      </div>
      <svg
        viewBox="0 0 760 460"
        className="network-svg"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <rect width="760" height="460" rx="28" fill="url(#panelGradient)" />
        <defs>
          <linearGradient id="panelGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#07111f" />
            <stop offset="100%" stopColor="#10233e" />
          </linearGradient>
        </defs>
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {layout.links.map((link, index) => (
            <line
              key={`${link.source.id}-${link.target.id}-${index}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
            />
          ))}
          {layout.nodes.map((node) => {
            const fill = TALUK_COLORS[node.taluk] || "#f8fafc";
            const radius = 5 + Math.min(node.degree || 0, 8);
            const showLabel = (node.degree || 0) >= 7;
            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={radius + 4} fill={fill} opacity="0.12" />
                <circle cx={node.x} cy={node.y} r={radius} fill={fill} opacity="0.92" />
                {showLabel ? (
                  <text x={node.x + 10} y={node.y - 10} fill="rgba(237,244,255,0.82)" fontSize="10">
                    {node.name.slice(0, 18)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </section>
  );
}

