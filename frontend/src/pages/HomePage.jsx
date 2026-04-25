import CategoryStrip from "../components/CategoryStrip";
import NetworkPreview from "../components/NetworkPreview";
import PlaceGallery from "../components/PlaceGallery";
import SummaryCards from "../components/SummaryCards";
import TopHubsTable from "../components/TopHubsTable";
import { useNavigate } from "react-router-dom";

export default function HomePage({ summary, hubs, network, taluks, categories, featuredPlaces }) {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Virudhunagar District · Travel Better</p>
          <h1>Discover nearby attractions, hidden gems, and smart routes across Virudhunagar.</h1>
          <p className="hero-text">
            Virudhunagar Trails blends tourism discovery with graph intelligence so visitors can
            plan richer trips, compare nearby attractions, and understand how destinations connect
            across the district.
          </p>
          <div className="hero-badges">
            <span>{summary?.places} destinations</span>
            <span>{summary?.edges} travel links</span>
            <span>{summary?.avg_distance_km} km average hop</span>
          </div>
        </div>
        <aside className="hero-story">
          <div className="story-card warm">
            <p>Shorter Better Trips</p>
            <h3>Find the next best nearby attraction, not just the biggest destination.</h3>
          </div>
          <div className="story-card cool">
            <p>Connected Discovery</p>
            <h3>See which attractions naturally cluster together for richer multi-stop travel.</h3>
          </div>
        </aside>
      </section>

      <SummaryCards summary={summary} />
      <CategoryStrip
        categories={categories.slice(0, 8)}
        onCategoryClick={(category) => navigate(`/explore?category=${encodeURIComponent(category)}`)}
      />

      <section className="feature-grid">
        <article className="feature-card">
          <p className="eyebrow">Smart Travel</p>
          <h3>Nearest-attraction planning</h3>
          <p>
            Help tourists move naturally from one attraction to another using car, bus, two-wheeler,
            cycle, or walking time.
          </p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">Network Intelligence</p>
          <h3>Hubs, bridges, and remote gems</h3>
          <p>
            Network analysis reveals central anchors, bridging places between clusters, and isolated
            destinations that feel like hidden discoveries.
          </p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">District Insight</p>
          <h3>Taluk-wise attraction concentration</h3>
          <p>
            See which taluks are dense tourism clusters and which ones offer more spread-out travel
            experiences.
          </p>
        </article>
      </section>

      <PlaceGallery
        places={featuredPlaces}
        eyebrow="Featured Destinations"
        title="Popular places to start exploring"
      />

      <section className="two-up">
        <NetworkPreview data={network} />
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Taluk Snapshot</p>
              <h3>Where the district is most active</h3>
            </div>
          </div>
          <div className="taluk-grid single-column">
            {taluks.slice(0, 7).map((taluk) => (
              <div key={taluk.taluk} className="taluk-card">
                <h4>{taluk.taluk}</h4>
                <p>{taluk.places} places</p>
                <span>{taluk.internal_edges} local links</span>
                <span>Average degree {taluk.avg_degree}</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <TopHubsTable hubs={hubs.slice(0, 8)} />
    </>
  );
}
