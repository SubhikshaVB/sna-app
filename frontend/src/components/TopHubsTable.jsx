export default function TopHubsTable({ hubs }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Anchor Destinations</p>
          <h3>Top tourism hubs</h3>
        </div>
      </div>
      <div className="table-list">
        {hubs.map((hub, index) => (
          <div key={hub.node_id} className="table-row">
            <span>{index + 1}</span>
            <strong>{hub.name}</strong>
            <span>{hub.taluk}</span>
            <span>Degree {hub.degree}</span>
            <span>PageRank {hub.pagerank}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

