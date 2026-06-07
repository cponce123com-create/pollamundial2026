import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPlayer } from "../lib/players";
import { useAuth } from "../lib/AuthContext";
import { api, PoolConfig } from "../lib/api";

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
  const [poolConfigData, setPoolConfigData] = useState<PoolConfig | null>(null);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const player = user ? getPlayer(user.player_slug) : null;
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    api.getPoolConfig().then((cfg) => {
      setPoolConfigData(cfg);
      if (cfg?.favicon_url) {
        const url = cfg.favicon_url + (cfg.favicon_url.includes('?') ? '&' : '?') + 'v=' + Date.now();
        let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.removeAttribute('type');
        link.href = url;
        let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = url;
      }
    }).catch(() => {});
  }, []);

  // ── Check for pending payments ──
  useEffect(() => {
    if (!user) return;
    api.getEntries().then((entries) => {
      const hasPending = entries.some(
        (e) => e.payment_status === "pending" || e.payment_status === "rejected"
      );
      setPendingPayment(hasPending);
    }).catch(() => {});
  }, [user]);

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
            {poolConfigData?.logo_url ? (
              <img src={poolConfigData.logo_url.replace('/upload/', '/upload/f_auto,q_auto/')} alt="La Polla del Ponce" className="header-logo-img" loading="eager" decoding="async" />
            ) : (
              <span className="header-logo-icon">⚽</span>
            )}
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
                    <img src={user.avatar_url.replace('/upload/', '/upload/f_auto,q_auto/')} alt="" className="player-header-img" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                  ) : player ? (
                    <img src={player.image} alt={player.name} className="player-header-img" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
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
                <img src={user.avatar_url.replace('/upload/', '/upload/f_auto,q_auto/')} alt="" className="player-header-img" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              ) : player ? (
                <img src={player.image} alt={player.name} className="player-header-img" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
              ) : (
                <span className="header-avatar-placeholder">{user.name.charAt(0)}</span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Payment Status Banner */}
      {user && pendingPayment && !dismissedBanner && (
        <div className="payment-banner">
          <span>
            💳 Tienes tickets con pago{" "}
            <strong>pendiente o rechazado</strong>.{" "}
            <Link to="/dashboard" style={{ color: "inherit", textDecoration: "underline" }}>
              Ve al Dashboard
            </Link>{" "}
            para subir tu comprobante.
          </span>
          <button className="payment-banner-close" onClick={() => setDismissedBanner(true)} aria-label="Cerrar">
            ✕
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              {player && (
                <img src={player.image} alt={player.name} className="mobile-drawer-avatar" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
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

    </>
  );
}
