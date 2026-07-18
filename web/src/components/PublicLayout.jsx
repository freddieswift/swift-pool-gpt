import { Link, NavLink, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link className="brand" to="/">
          <span className="brand-mark">8</span>
          <span>
            <strong>SwiftPool</strong>
            <small>League management</small>
          </span>
        </Link>
        <nav>
          <NavLink to="/">Find a league</NavLink>
          <NavLink to="/login">Admin login</NavLink>
        </nav>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <span>SwiftPool</span>
        <span>Fixtures, results, standings and league administration.</span>
      </footer>
    </div>
  );
}
