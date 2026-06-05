import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, User } from "../lib/api";
import { getPlayer } from "../lib/players";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    navigate("/login");
  };

  const player = user ? getPlayer(user.player_slug) : null;

  const isActive = (path: string) => location.pathname === path ? "active" : "";

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          ⚽ PollaWorld 2026
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/" className={isActive("/")}>Inicio</Link>
              <Link to="/dashboard" className={isActive("/dashboard")}>Predicciones</Link>
              <Link to="/participants" className={isActive("/participants")}>Participantes</Link>
              <Link to="/ranking" className={isActive("/ranking")}>Ranking</Link>
              <Link to="/teams" className={isActive("/teams")}>🌍 Equipos</Link>
              <Link to="/profile" className={isActive("/profile")}>Mi perfil</Link>
              {user.role === "admin" && (
                <Link to="/admin" className={isActive("/admin")}>Admin</Link>
              )}
              <button onClick={handleLogout}>Salir</button>
              <span className="header-user">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="player-header-img"
                    referrerPolicy="no-referrer"
                  />
                ) : player ? (
                  <img
                    src={player.image}
                    alt={player.name}
                    className="player-header-img"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                {user.name}
              </span>
            </>
          ) : (
            <>
              <Link to="/" className={isActive("/")}>Inicio</Link>
              <Link to="/login">Ingresar</Link>
              <Link to="/register">Registrarse</Link>
              <Link to="/participants">Participantes</Link>
              <Link to="/ranking">Ranking</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
