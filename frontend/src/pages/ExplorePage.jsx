import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { proxiedImageUrl } from "../lib/api";

const TRANSPORT_LABELS = {
  car: "Car",
  bus: "Bus",
  "2w": "Two Wheeler",
  cycle: "Cycle",
  walk: "Walk",
};

function recommendStyle(photoUrl) {
  if (!photoUrl) {
    return {};
  }
  return {
    backgroundImage: `linear-gradient(180deg, rgba(5,16,28,0.18), rgba(5,16,28,0.92)), url("${proxiedImageUrl(photoUrl)}")`,
  };
}

export default function ExplorePage({
  places,
  selectedPlace,
  setSelectedPlace,
  transport,
  setTransport,
  placeDetail,
  recommendations,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";

  const filteredPlaces = useMemo(() => {
    if (!categoryFilter) {
      return places;
    }
    return places.filter(
      (place) => (place.category || "").toLowerCase() === categoryFilter.toLowerCase()
    );
  }, [places, categoryFilter]);

  useEffect(() => {
    if (!filteredPlaces.length) {
      return;
    }
    const exists = filteredPlaces.some((place) => place.node_id === selectedPlace);
    if (!exists) {
      setSelectedPlace(filteredPlaces[0].node_id);
    }
  }, [filteredPlaces, selectedPlace, setSelectedPlace]);

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Explore</p>
        <h1>Plan the next stop in your Virudhunagar trip.</h1>
        <p>
          Pick any attraction and instantly see nearby places, travel time by transport mode, and
          practical next-hop suggestions powered by the graph.
        </p>
        {categoryFilter ? (
          <div className="hero-badges">
            <span>Category filter: {categoryFilter}</span>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setSearchParams({})}
            >
              Clear filter
            </button>
          </div>
        ) : null}
      </section>

      <section className="two-up">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Trip Planner</p>
              <h3>Choose your starting place</h3>
            </div>
          </div>
          <div className="planner-controls">
            <label>
              Attraction
              <select value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)}>
                {filteredPlaces.map((place) => (
                  <option key={place.node_id} value={place.node_id}>
                    {place.name} · {place.taluk}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Travel mode
              <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                {Object.entries(TRANSPORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {placeDetail && (
            <article className="explore-focus">
              <h3>{placeDetail.name}</h3>
              <p>
                {placeDetail.category} · {placeDetail.taluk}
              </p>
              <div className="hero-badges">
                <span>Degree {placeDetail.degree}</span>
                {placeDetail.rating ? <span>Rating {placeDetail.rating}</span> : null}
                {placeDetail.popularity ? <span>Popularity {placeDetail.popularity}</span> : null}
              </div>
              {placeDetail.address ? <small>{placeDetail.address}</small> : null}
            </article>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Recommended Nearby Stops</p>
              <h3>Best next attractions by {TRANSPORT_LABELS[transport]}</h3>
            </div>
          </div>
          <div className="list-stack">
            {recommendations.map((item) => (
              <div key={item.node_id} className="recommend-card" style={recommendStyle(item.photo_url)}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.category} · {item.taluk}
                  </span>
                </div>
                <div className="recommend-meta">
                  <b>{item.travel_time} min</b>
                  <span>{item.distance_km} km</span>
                  <span>{item.strength}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Connected Neighbors</p>
            <h3>Closest linked attractions from the selected place</h3>
          </div>
        </div>
        <div className="table-list">
          {placeDetail?.nearby_places?.map((item, index) => (
            <div key={`${item.node_id}-${index}`} className="table-row nearby-row">
              <span>{index + 1}</span>
              <strong>{item.name}</strong>
              <span>{item.taluk}</span>
              <span>{item.distance_km} km</span>
              <span>{item[`time_${transport === "2w" ? "2w" : transport}`] ?? item.time_car} min</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
