export default function CategoryStrip({ categories }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Travel Themes</p>
          <h3>Explore by attraction category</h3>
        </div>
      </div>
      <div className="chip-grid">
        {categories.map((item) => (
          <div key={item.category} className="category-chip">
            <strong>{item.category}</strong>
            <span>{item.places} places</span>
          </div>
        ))}
      </div>
    </section>
  );
}

