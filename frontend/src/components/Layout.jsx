import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  ["/", "Home"],
  ["/explore", "Explore"],
  ["/graph", "Graph"],
  ["/journeys", "Journeys"],
  ["/analytics", "Analytics"],
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">VT</div>
          <div>
            <strong>Virudhunagar Trails</strong>
            <span>Tourism intelligence portal</span>
          </div>
        </div>
        <nav className="nav-links">
          {NAV_ITEMS.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {children}
    </div>
  );
}
