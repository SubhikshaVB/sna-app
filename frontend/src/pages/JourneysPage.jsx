function buildJourney(title, description, places, categories) {
  const picked = [];
  for (const category of categories) {
    const match = places.find(
      (place) =>
        place.category &&
        place.category.toLowerCase().includes(category) &&
        !picked.some((item) => item.node_id === place.node_id)
    );
    if (match) {
      picked.push(match);
    }
  }
  return { title, description, stops: picked.slice(0, 4) };
}

export default function JourneysPage({ places }) {
  const sortedByPopularity = [...places].sort(
    (a, b) => Number(b.popularity || 0) - Number(a.popularity || 0)
  );

  const journeys = [
    buildJourney(
      "1-Day Temple Trail",
      "A spiritually focused route built from temple-rich destinations across the network.",
      sortedByPopularity,
      ["temple", "temple", "temple", "memorial"]
    ),
    buildJourney(
      "Nature and Open-Air Trail",
      "A slower route for parks, gardens, dams, and peaceful open-air spaces.",
      sortedByPopularity,
      ["park", "garden", "dam", "tourist attraction"]
    ),
    buildJourney(
      "Family Leisure Circuit",
      "A casual itinerary mixing parks, attractions, and accessible local highlights.",
      sortedByPopularity,
      ["park", "tourist attraction", "park", "memorial"]
    ),
  ];

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Journeys</p>
        <h1>Suggested routes for different kinds of travelers.</h1>
        <p>
          These itineraries turn your attraction network into practical travel stories instead of
          isolated place listings.
        </p>
      </section>

      <section className="journey-grid">
        {journeys.map((journey) => (
          <article key={journey.title} className="panel journey-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Curated Route</p>
                <h3>{journey.title}</h3>
              </div>
            </div>
            <p className="muted">{journey.description}</p>
            <div className="journey-steps">
              {journey.stops.map((stop, index) => (
                <div key={stop.node_id} className="journey-step">
                  <div className="journey-stop-index">Stop {index + 1}</div>
                  <div className="journey-stop-body">
                    <strong>{stop.name}</strong>
                    <span>{stop.category} · {stop.taluk}</span>
                  </div>
                  <b>{stop.rating ? `Rating ${stop.rating}` : "Scenic stop"}</b>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
