import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import { useEffect, useMemo, useState } from "react";

function layoutGraph(data) {
  if (!data?.nodes?.length) {
    return { nodes: [], links: [] };
  }

  const nodes = data.nodes.map((node) => ({ ...node }));
  const links = data.links.map((link) => ({ ...link }));
  const simulation = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-95))
    .force("center", forceCenter(430, 250))
    .force(
      "link",
      forceLink(links)
        .id((node) => node.id)
        .distance((link) => 38 + Number(link.distance_km || 0) * 2)
        .strength(0.16)
    )
    .stop();

  for (let i = 0; i < 180; i += 1) {
    simulation.tick();
  }
  simulation.stop();
  return { nodes, links };
}

export default function GraphExplorer({ data, selectedNodeId, onSelect }) {
  const [layout, setLayout] = useState({ nodes: [], links: [] });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    setLayout(layoutGraph(data));
  }, [data]);

  const selected = useMemo(
    () => layout.nodes.find((node) => node.id === selectedNodeId),
    [layout.nodes, selectedNodeId]
  );

  function onWheel(event) {
    event.preventDefault();
    const nextScale = Math.min(2.8, Math.max(0.65, transform.scale - event.deltaY * 0.001));
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
          <p className="eyebrow">Graph Explorer</p>
          <h3>Pan, zoom, and click through the full network</h3>
        </div>
        <div className="panel-actions">
          <p className="muted">{selected ? `Focused on ${selected.name}` : "Select a node to begin."}</p>
          <button type="button" className="ghost-button" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}>
            Reset view
          </button>
        </div>
      </div>
      <svg
        viewBox="0 0 860 500"
        className="network-svg explorer-svg"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <rect width="860" height="500" rx="28" fill="rgba(8,19,35,0.76)" />
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {layout.links.map((link, index) => {
            const highlighted = link.source.id === selectedNodeId || link.target.id === selectedNodeId;
            return (
              <line
                key={`${link.source.id}-${link.target.id}-${index}`}
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                stroke={highlighted ? "rgba(249,115,22,0.68)" : "rgba(255,255,255,0.12)"}
                strokeWidth={highlighted ? 2.6 : 1.2}
              />
            );
          })}
          {layout.nodes.map((node) => {
            const active = node.id === selectedNodeId;
            return (
              <g key={node.id} onClick={() => onSelect?.(node.id)} className="graph-node">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={(active ? 13 : 8) + Math.min(node.degree || 0, 4)}
                  fill={active ? "rgba(249,115,22,0.16)" : "rgba(56,189,248,0.08)"}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={(active ? 8 : 5) + Math.min(node.degree || 0, 4)}
                  fill={active ? "#f97316" : "#38bdf8"}
                />
                {(active || (node.degree || 0) >= 9) ? (
                  <text x={node.x + 12} y={node.y - 10} fill="rgba(237,244,255,0.92)" fontSize="11">
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
