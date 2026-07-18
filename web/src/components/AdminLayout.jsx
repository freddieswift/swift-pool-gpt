import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/app", label: "Overview", end: true },
  { to: "/app/leagues", label: "Leagues" },
  { to: "/app/profile", label: "Profile" }
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <NavLink className="brand brand--sidebar" to="/app">
          <span className="brand-mark">8</span>
          <span>
            <strong>SwiftPool</strong>
            <small>Control room</small>
          </span>
        </NavLink>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} end={item.end} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <span className="avatar">{user?.firstName?.[0] || user?.email?.[0] || "U"}</span>
          <div>
            <strong>{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"}</strong>
            <small>{user?.email}</small>
          </div>
          <button className="text-button" onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="mobile-admin-header">
          <NavLink className="brand" to="/app">
            <span className="brand-mark">8</span>
            <strong>SwiftPool</strong>
          </NavLink>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
