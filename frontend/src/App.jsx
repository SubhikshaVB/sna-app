import { useEffect, useState } from "react";
import NetworkPreview from "./components/NetworkPreview";
import SummaryCards from "./components/SummaryCards";
import { api } from "./lib/api";

const TRANSPORT_OPTIONS = [
  ["car", "Car"],
  ["bus", "Bus"],
  ["2w", "Two Wheeler"],
  ["cycle", "Cycle"],
  ["walk", "Walk"],
];

function MetricColumn({ title, items, valueLabel }) {
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
              <strong>{index + 1}. {item.name}</strong>
              <span>{item.taluk}</span>
            </div>
            <b>{item[valueLabel]}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [network, setNetwork] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [placeDetail, setPlaceDetail] = useState(null);
  const [transport, setTransport] = useState("car");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          summaryData,
          hubData,
          talukData,
          metricData,
          networkData,
          placeData,
        ] = await Promise.all([
          api.summary(),
          api.topHubs(),
          api.talukSummary(),
          api.metrics(),
          api.networkPreview(),
          api.places(),
        ]);

        setSummary(summaryData);
        setHubs(hubData);
        setTaluks(talukData);
        setMetrics(metricData);
        setNetwork(networkData);
        setPlaces(placeData);
        if (placeData.length > 0) {
          setSelectedPlace(placeData[0].node_id);
        }
      } catch (err) {
        setError("Could not load the tourism network. Make sure the FastAPI backend is running.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadPlace() {
      if (!selectedPlace) {
        return;
      }
      try {
        const [detailData, recommendationData] = await Promise.all([
          api.placeDetail(selectedPlace),
          api.recommendations(selectedPlace, transport),
        ]);
        setPlaceDetail(detailData);
        setRecommendations(recommendationData);
      } catch (err) {
        setError("Could not load place details or recommendations.");
      }
    }
    loadPlace();
  }, [selectedPlace, transport]);

  if (loading) {
    return <main className="shell"><section className="hero"><h1>Loading tourism intelligence...</h1></section></main>;
  }

  if (error) {
    return <main className="shell"><section className="hero"><h1>{error}</h1></section></main>;
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Virudhunagar District · Neo4j + SNA</p>
          <h1>A tourism intelligence portal built from the district’s social network of attractions.</h1>
          <p className="hero-text">
            Explore hubs, remote gems, nearest attractions, and network-driven travel suggestions
            across Virudhunagar using graph analytics, centrality measures, and transport-aware edges.
          </p>
          <div className="hero-badges">
            <span>{summary?.places} places</span>
            <span>{summary?.edges} travel edges</span>
            <span>{summary?.taluks_covered} taluks covered</span>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-card">
            <p>Strong edges</p>
            <h3>{summary?.strong_edges}</h3>
          </div>
          <div className="hero-card">
            <p>Medium edges</p>
            <h3>{summary?.medium_edges}</h3>
          </div>
          <div className="hero-card">
            <p>Weak edges</p>
            <h3>{summary?.weak_edges}</h3>
          </div>
        </div>
      </section>

      <SummaryCards summary={summary} />

      <section className="two-up">
        <NetworkPreview data={network} />

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Smart Trip Companion</p>
              <h3>Nearby attraction planner</h3>
            </div>
          </div>

          <div className="planner-controls">
            <label>
              Choose a place
              <select value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)}>
                {places.map((place) => (
                  <option key={place.node_id} value={place.node_id}>
                    {place.name} · {place.taluk}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Travel mode
              <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                {TRANSPORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {placeDetail && (
            <div className="place-highlight">
              <h4>{placeDetail.name}</h4>
              <p>{placeDetail.category} · {placeDetail.taluk}</p>
              <span>Degree: {placeDetail.degree}</span>
            </div>
          )}

          <div className="list-stack compact">
            {recommendations.map((item) => (
              <div key={item.node_id} className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category} · {item.taluk}</span>
                </div>
                <b>{item.travel_time} min</b>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Top Tourism Hubs</p>
            <h3>Places acting as local anchors in the graph</h3>
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

      <section className="metrics-grid">
        <MetricColumn title="Degree Centrality" items={metrics?.top_degree} valueLabel="score" />
        <MetricColumn title="Betweenness Centrality" items={metrics?.top_betweenness} valueLabel="score" />
        <MetricColumn title="Closeness Centrality" items={metrics?.top_closeness} valueLabel="score" />
        <MetricColumn title="PageRank" items={metrics?.top_pagerank} valueLabel="score" />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Taluk Distribution</p>
            <h3>Where the attraction network is concentrated</h3>
          </div>
        </div>
        <div className="taluk-grid">
          {taluks.map((taluk) => (
            <div key={taluk.taluk} className="taluk-card">
              <h4>{taluk.taluk}</h4>
              <p>{taluk.places} places</p>
              <span>{taluk.internal_edges} internal edges</span>
              <span>Avg degree {taluk.avg_degree}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

