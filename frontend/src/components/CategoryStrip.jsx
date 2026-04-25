export default function CategoryStrip({ categories, onCategoryClick }) {
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
          <button
            key={item.category}
            type="button"
            className="category-chip clickable"
            onClick={() => onCategoryClick?.(item.category)}
          >
            <strong>{item.category}</strong>
            <span>{item.places} places</span>
          </button>
        ))}
      </div>
    </section>
  );
}
