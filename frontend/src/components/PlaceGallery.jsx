import { proxiedImageUrl } from "../lib/api";

function cardStyle(photoUrl) {
  if (!photoUrl) {
    return {};
  }
  return {
    backgroundImage: `linear-gradient(180deg, rgba(5,16,28,0.12), rgba(5,16,28,0.92)), url("${proxiedImageUrl(photoUrl)}")`,
  };
}

export default function PlaceGallery({ places, title, eyebrow }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="gallery-grid">
        {places.map((place) => (
          <article
            key={place.node_id}
            className="place-card"
            style={cardStyle(place.photo_url)}
          >
            <div className="place-card-body">
              <span className="place-chip">{place.category || "Destination"}</span>
              <h4>{place.name}</h4>
              <p>{place.taluk}</p>
              <div className="place-meta">
                {place.rating ? <span>Rating {place.rating}</span> : null}
                {place.popularity ? <span>Popularity {place.popularity}</span> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
