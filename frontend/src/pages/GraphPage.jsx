import DistrictMap from "../components/DistrictMap";
import GraphExplorer from "../components/GraphExplorer";

export default function GraphPage({
  network,
  places,
  selectedPlace,
  setSelectedPlace,
  placeDetail,
}) {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Graph Explorer</p>
        <h1>See how attractions connect across the district.</h1>
        <p>
          This view pairs a clickable relationship graph with a coordinate-based district map so you
          can inspect both the network structure and the geography together.
        </p>
      </section>

      <section className="two-up">
        <GraphExplorer data={network} selectedNodeId={selectedPlace} onSelect={setSelectedPlace} />
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Focused Place</p>
              <h3>Selected attraction details</h3>
            </div>
          </div>
          {placeDetail ? (
            <div className="list-stack">
              <div className="explore-focus">
                <h3>{placeDetail.name}</h3>
                <p>{placeDetail.category} · {placeDetail.taluk}</p>
                <div className="hero-badges">
                  <span>Degree {placeDetail.degree}</span>
                  {placeDetail.rating ? <span>Rating {placeDetail.rating}</span> : null}
                </div>
              </div>
              {placeDetail.nearby_places?.slice(0, 6).map((item) => (
                <div key={item.node_id} className="list-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.category} · {item.taluk}</span>
                  </div>
                  <b>{item.distance_km} km</b>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      <DistrictMap places={places} selectedNodeId={selectedPlace} onSelect={setSelectedPlace} />
    </>
  );
}

