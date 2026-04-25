export default function SummaryCards({ summary }) {
  if (!summary) {
    return null;
  }

  const cards = [
    { label: "Tourist Places", value: summary.places, tone: "sun" },
    { label: "Network Edges", value: summary.edges, tone: "sky" },
    { label: "Connected Components", value: summary.components, tone: "mint" },
    { label: "Avg Distance (km)", value: summary.avg_distance_km, tone: "rose" },
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card ${card.tone}`}>
          <p>{card.label}</p>
          <h3>{card.value}</h3>
        </article>
      ))}
    </section>
  );
}

