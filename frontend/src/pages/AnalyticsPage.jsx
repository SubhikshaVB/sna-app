import MetricColumn from "../components/MetricColumn";
import TopHubsTable from "../components/TopHubsTable";

export default function AnalyticsPage({ summary, metrics, hubs, taluks }) {
  return (
    <>
      <section className="page-hero analytics-hero">
        <p className="eyebrow">Analytics</p>
        <h1>Understand the tourism network, not just the map.</h1>
        <p>
          This page explains which places behave like hubs, which ones bridge travel communities,
          and which destinations remain isolated despite popularity.
        </p>
      </section>

      <section className="analysis-ribbon">
        <div>
          <strong>{summary?.components}</strong>
          <span>connected components</span>
        </div>
        <div>
          <strong>{summary?.isolated_places}</strong>
          <span>isolated places</span>
        </div>
        <div>
          <strong>{summary?.strong_edges}</strong>
          <span>strong travel links</span>
        </div>
        <div>
          <strong>{summary?.medium_edges}</strong>
          <span>medium travel links</span>
        </div>
      </section>

      <TopHubsTable hubs={hubs} />

      <section className="metrics-grid">
        <MetricColumn title="Degree Centrality" items={metrics?.top_degree} />
        <MetricColumn title="Betweenness Centrality" items={metrics?.top_betweenness} />
        <MetricColumn title="Closeness Centrality" items={metrics?.top_closeness} />
        <MetricColumn title="PageRank" items={metrics?.top_pagerank} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Interpretation Guide</p>
            <h3>What these metrics mean for the tourism network</h3>
          </div>
        </div>
        <div className="feature-grid dense">
          <article className="feature-card">
            <h3>Degree Centrality</h3>
            <p>Shows which places have the most direct local tourism links.</p>
          </article>
          <article className="feature-card">
            <h3>Betweenness Centrality</h3>
            <p>Highlights bridge destinations that connect otherwise separate tourism clusters.</p>
          </article>
          <article className="feature-card">
            <h3>Closeness Centrality</h3>
            <p>Shows which attractions can reach other places quickly across the graph.</p>
          </article>
          <article className="feature-card">
            <h3>PageRank</h3>
            <p>Measures global importance by considering not just connections, but influential neighbors.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Taluk Analytics</p>
            <h3>Tourism concentration across the district</h3>
          </div>
        </div>
        <div className="taluk-grid">
          {taluks.map((taluk) => (
            <div key={taluk.taluk} className="taluk-card">
              <h4>{taluk.taluk}</h4>
              <p>{taluk.places} places</p>
              <span>{taluk.internal_edges} internal edges</span>
              <span>Average degree {taluk.avg_degree}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

