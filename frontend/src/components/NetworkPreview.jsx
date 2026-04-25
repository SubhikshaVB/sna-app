import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import { useEffect, useRef } from "react";

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
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data?.nodes?.length || !svgRef.current) {
      return;
    }

    const width = 760;
    const height = 460;
    const svg = svgRef.current;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const nodes = data.nodes.map((node) => ({ ...node }));
    const links = data.links.map((link) => ({ ...link }));

    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-80))
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "link",
        forceLink(links)
          .id((node) => node.id)
          .distance((link) => 45 + Number(link.distance_km || 0) * 2)
          .strength(0.12)
      )
      .stop();

    for (let i = 0; i < 160; i += 1) {
      simulation.tick();
    }

    const linkMarkup = links
      .map(
        (link) =>
          `<line x1="${link.source.x}" y1="${link.source.y}" x2="${link.target.x}" y2="${link.target.y}" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />`
      )
      .join("");

    const nodeMarkup = nodes
      .map((node) => {
        const fill = TALUK_COLORS[node.taluk] || "#f8fafc";
        const radius = 5 + Math.min(node.degree || 0, 8);
        return `
          <g>
            <circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${fill}" opacity="0.92" />
            <title>${node.name} (${node.taluk})</title>
          </g>
        `;
      })
      .join("");

    svg.innerHTML = `
      <rect width="${width}" height="${height}" rx="28" fill="url(#panelGradient)" />
      <defs>
        <linearGradient id="panelGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111f" />
          <stop offset="100%" stop-color="#10233e" />
        </linearGradient>
      </defs>
      ${linkMarkup}
      ${nodeMarkup}
    `;

    return () => simulation.stop();
  }, [data]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Live Network View</p>
          <h3>Tourism cluster preview</h3>
        </div>
        <p className="muted">High-degree places appear larger in the graph.</p>
      </div>
      <svg ref={svgRef} className="network-svg" />
    </section>
  );
}

