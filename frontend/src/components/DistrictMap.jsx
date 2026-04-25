function projectPlaces(places, width, height) {
  const valid = places.filter((place) => place.latitude && place.longitude);
  if (!valid.length) {
    return [];
  }

  const minLat = Math.min(...valid.map((place) => Number(place.latitude)));
  const maxLat = Math.max(...valid.map((place) => Number(place.latitude)));
  const minLng = Math.min(...valid.map((place) => Number(place.longitude)));
  const maxLng = Math.max(...valid.map((place) => Number(place.longitude)));

  return valid.map((place) => {
    const x = 44 + ((Number(place.longitude) - minLng) / (maxLng - minLng || 1)) * (width - 88);
    const y = 36 + ((maxLat - Number(place.latitude)) / (maxLat - minLat || 1)) * (height - 72);
    return { ...place, x, y };
  });
}

export default function DistrictMap({ places, selectedNodeId, onSelect }) {
  const width = 760;
  const height = 480;
  const projected = projectPlaces(places, width, height);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">District Map</p>
          <h3>Coordinate view of attractions</h3>
        </div>
        <p className="muted">Tap any point to focus that place across the explorer.</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="district-map">
        <defs>
          <linearGradient id="mapGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10233e" />
            <stop offset="100%" stopColor="#07111f" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} rx="28" fill="url(#mapGradient)" />
        <path
          d="M145 94 C226 40, 322 58, 372 116 S486 230, 598 242 S676 354, 604 404 402 448, 266 422 106 318, 124 214 94 126, 145 94Z"
          fill="rgba(20,184,166,0.08)"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="2"
        />
        {projected.map((place) => {
          const active = place.node_id === selectedNodeId;
          const radius = active ? 11 : 6;
          return (
            <g key={place.node_id} onClick={() => onSelect?.(place.node_id)} className="map-node">
              <circle cx={place.x} cy={place.y} r={radius + 6} fill={active ? "rgba(249,115,22,0.18)" : "rgba(14,165,233,0.10)"} />
              <circle cx={place.x} cy={place.y} r={radius} fill={active ? "#f97316" : "#38bdf8"} />
              {active ? (
                <text x={place.x + 14} y={place.y - 10} fill="rgba(237,244,255,0.92)" fontSize="11">
                  {place.name.slice(0, 26)}
                </text>
              ) : null}
              <title>{place.name}</title>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

