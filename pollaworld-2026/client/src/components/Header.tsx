import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { getPlayer } from "../lib/players";
import { useAuth } from "../lib/AuthContext";

const NAV_ITEMS_AUTH = [
  { path: "/", label: "Inicio", icon: "🏠" },
  { path: "/dashboard", label: "Predicciones", icon: "🔮" },
  { path: "/participants", label: "Participantes", icon: "👥" },
  { path: "/ranking", label: "Ranking", icon: "🏆" },
  { path: "/teams", label: "Equipos", icon: "🌍" },
  { path: "/profile", label: "Perfil", icon: "👤" },
];

const NAV_ITEMS_GUEST = [
  { path: "/", label: "Inicio", icon: "🏠" },
  { path: "/login", label: "Ingresar", icon: "🔑" },
  { path: "/register", label: "Registro", icon: "📝" },
  { path: "/participants", label: "Participantes", icon: "👥" },
  { path: "/ranking", label: "Ranking", icon: "🏆" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const player = user ? getPlayer(user.player_slug) : null;
  const isActive = (path: string) => location.pathname === path;

  const navItems = user
    ? user.role === "admin"
      ? [...NAV_ITEMS_AUTH, { path: "/admin", label: "Admin", icon: "⚙️" }]
      : [...NAV_ITEMS_AUTH]
    : [...NAV_ITEMS_GUEST];

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <button
            className="header-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>

          <Link to="/" className="header-logo" onClick={() => setMenuOpen(false)}>
            <span className="header-logo-icon">⚽</span>
            <span className="header-logo-text">La Polla del Ponce</span>
          </Link>

          <nav className="header-nav-desktop">
            {user ? (
              <>
                {NAV_ITEMS_AUTH.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={isActive(item.path) ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                ))}
                {user.role === "admin" && (
                  <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Admin</Link>
                )}
                <button onClick={handleLogout}>Salir</button>
                <span className="header-user">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="player-header-img" referrerPolicy="no-referrer" />
                  ) : player ? (
                    <img src={player.image} alt={player.name} className="player-header-img" referrerPolicy="no-referrer" />
                  ) : null}
                  {user.name}
                </span>
              </>
            ) : (
              <>
                {NAV_ITEMS_GUEST.map((item) => (
                  <Link key={item.path} to={item.path} className={isActive(item.path) ? "active" : ""}>
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {user && (
            <Link to="/profile" className="header-mobile-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="player-header-img" referrerPolicy="no-referrer" />
              ) : player ? (
                <img src={player.image} alt={player.name} className="player-header-img" referrerPolicy="no-referrer" />
              ) : (
                <span className="header-avatar-placeholder">{user.name.charAt(0)}</span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              {player && (
                <img src={player.image} alt={player.name} className="mobile-drawer-avatar" referrerPolicy="no-referrer" />
              )}
              <div>
                <div className="mobile-drawer-name">{user?.name || "Invitado"}</div>
                <div className="mobile-drawer-role">{user?.role === "admin" ? "Administrador" : "Participante"}</div>
              </div>
            </div>

            <div className="mobile-drawer-items">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-drawer-item ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mobile-drawer-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {user && (
              <div className="mobile-drawer-footer">
                <button className="btn btn-outline btn-block" onClick={handleLogout}>
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav">
        {(user ? NAV_ITEMS_AUTH : NAV_ITEMS_GUEST).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
