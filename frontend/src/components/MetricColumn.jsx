export default function MetricColumn({ title, items }) {
  return (
    <div className="metric-column">
      <div className="panel-head">
        <div>
          <p className="eyebrow">SNA Metric</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="list-stack">
        {items?.map((item, index) => (
          <div key={`${title}-${item.node_id}`} className="list-row">
            <div>
              <strong>
                {index + 1}. {item.name}
              </strong>
              <span>{item.taluk}</span>
            </div>
            <b>{item.score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

