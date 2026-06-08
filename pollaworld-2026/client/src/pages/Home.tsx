import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api, PoolStats, PoolConfig } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

function getSections(config: PoolConfig | null) {
  const yapePhone = config?.yape_phone || "—";

  return [
    {
      id: "como-funciona",
      icon: "⚽",
      title: "¿Cómo funciona?",
      content: (
        <ul className="home-checklist">
          <li>📝 <strong>Regístrate</strong> con tu nombre, celular y un emoji.</li>
          <li>🔮 <strong>Predice</strong> el marcador de todos los partidos del Mundial.</li>
          <li>💳 <strong>Paga</strong> tu inscripción vía Yape (antes o después de predecir).</li>
          <li>✅ <strong>Espera</strong> que el organizador confirme tu pago.</li>
          <li>🏆 <strong>Sigue</strong> tu puntuación en el ranking en vivo.</li>
        </ul>
      ),
    },
    {
      id: "puntuacion",
      icon: "⭐",
      title: "Puntuación y Desempate",
      content: (
        <>
          <div className="home-points-grid">
            <div className="home-points-card">
              <span className="home-points-icon">🎯</span>
              <span className="home-points-value">+5 pts</span>
              <span className="home-points-label">Marcador exacto</span>
              <span className="home-points-desc">Aciertas el resultado exacto (ej: 2-1)</span>
            </div>
          <div className="home-points-card">
            <span className="home-points-icon">✅</span>
            <span className="home-points-value">+3 pts</span>
            <span className="home-points-label">Ganador correcto</span>
            <span className="home-points-desc">Aciertas qué equipo gana, pero no el marcador exacto</span>
          </div>
          <div className="home-points-card">
            <span className="home-points-icon">🤝</span>
            <span className="home-points-value">+2 pts</span>
            <span className="home-points-label">Empate sin marcador</span>
            <span className="home-points-desc">Aciertas que empatan, pero no el marcador exacto</span>
          </div>
          <div className="home-points-card">
            <span className="home-points-icon">❌</span>
            <span className="home-points-value">+0 pts</span>
            <span className="home-points-label">Sin acierto</span>
            <span className="home-points-desc">No aciertas ganador, empate ni marcador</span>
          </div>
          </div>
          <div className="home-note" style={{ marginTop: 16 }}>
            ⚖️ <strong>Desempate:</strong> Si dos o más jugadores terminan con los mismos puntos, gana quien tenga más aciertos de marcador exacto (+5 pts). Si siguen empatados, se reparte el premio entre ellos.
          </div>
        </>
      ),
    },
    {
      id: "predicciones",
      icon: "🔮",
      title: "Las Predicciones",
      content: (
        <ul className="home-checklist">
          <li>📋 Predice <strong>todos</strong> los partidos del torneo (local - visitante).</li>
          <li>🎲 <strong>Llenar con suerte</strong> — relleno aleatorio, ideal si no sabes de fútbol.</li>
          <li>🧠 <strong>Llenar con lógica</strong> — usa el ranking FIFA para generar marcadores realistas.</li>
          <li>✏️ Puedes <strong>editar</strong> tus predicciones hasta el inicio del primer partido.</li>
          <li>🔒 Al arrancar el primer partido, las predicciones se <strong>cierran automáticamente</strong>.</li>
          <li>📄 Descarga un <strong>PDF</strong> con todas tus predicciones como respaldo.</li>
        </ul>
      ),
    },
    {
      id: "pagos",
      icon: "💳",
      title: "Pagos y Confirmación",
      content: (
        <>
          <div className="home-payment-card">
            <div className="home-payment-row">
              <span>Inscripción:</span>
              <strong className="home-payment-amount">S/. <span id="entry-fee">20</span>.00</strong>
            </div>
            <div className="home-payment-row">
              <span>Método:</span>
              <strong>Yape</strong>
            </div>
            <div className="home-payment-row">
              <span>Número:</span>
              <strong id="yape-phone">{yapePhone}</strong>
            </div>
          </div>
          <ul className="home-checklist" style={{ marginTop: 14 }}>
            <li>Yapea el monto exacto al número del organizador.</li>
            <li>Sube la captura de pantalla desde tu panel.</li>
            <li>El organizador aprueba y quedas habilitado para participar.</li>
          </ul>
          <div className="home-note" style={{ marginTop: 12 }}>
            💡 Si tu pago es rechazado, puedes volver a subir un nuevo comprobante.
          </div>
        </>
      ),
    },
    {
      id: "inicio-torneo",
      icon: "🏁",
      title: "¿Qué pasa al inicio del torneo?",
      content: (
        <div className="home-event-cards">
          <div className="home-event-card">
            <span className="home-event-icon">🔒</span>
            <h4>Predicciones cerradas</h4>
            <p>Ya no se pueden modificar. Quedan congeladas tal como las ingresaste.</p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">👀</span>
            <h4>Transparencia total</h4>
            <p>Todos pueden <strong>ver y descargar en PDF</strong> las predicciones de cualquier participante desde la sección <strong>Participantes</strong>, asegurando que no hubo modificaciones durante el torneo.</p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">📊</span>
            <h4>Ranking en vivo</h4>
            <p>El ranking se actualiza automáticamente con cada partido jugado.</p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">🏆</span>
            <h4>Ganador final</h4>
            <p>Al término del Mundial, el líder del ranking se lleva el primer premio.</p>
          </div>
        </div>
      ),
    },
  ];
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [config, setConfig] = useState<PoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);

  const validUrls = config?.hero_video_urls?.filter(Boolean) || [];
  const hasMultipleVideos = validUrls.length > 1;

  useEffect(() => {
    Promise.all([
      api.getPoolStats(),
      api.getPoolConfig().catch(() => null),
    ]).then(([s, c]) => {
      setStats(s);
      setConfig(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Cycle through videos when multiple are available
  useEffect(() => {
    if (!hasMultipleVideos) return;
    const interval = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % validUrls.length);
    }, 8000); // cambia cada 8 segundos
    return () => clearInterval(interval);
  }, [hasMultipleVideos, validUrls.length]);

  const sections = getSections(config);

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero">
        {/* Single video (backward compat) */}
        {!hasMultipleVideos && config?.hero_video_url && (
          <video
            className="hero-video-bg"
            src={config.hero_video_url.replace('/upload/', '/upload/f_auto:video,q_auto/')}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        {/* Multiple videos — each in its own layer, only current one visible */}
        {hasMultipleVideos && validUrls.map((url, idx) => (
          <video
            key={url}
            className={`hero-video-bg${idx === videoIndex ? '' : ' hero-video-hidden'}`}
            src={url.replace('/upload/', '/upload/f_auto:video,q_auto/')}
            autoPlay={idx === videoIndex}
            muted
            loop={idx === videoIndex}
            playsInline
          />
        ))}
        <div className="hero-video-overlay" />
        <div className="home-hero-content">
          {loading ? (
            <div className="home-hero-skeleton" />
          ) : config?.logo_url ? (
            <img src={config.logo_url.replace('/upload/', '/upload/f_auto,q_auto/')} alt="La Polla del Ponce" className="home-hero-logo" loading="eager" decoding="async" />
          ) : (
            <h1 className="home-hero-title">
              <span className="home-hero-highlight">La Polla del Ponce</span> 2026
            </h1>
          )}
          <p className="home-hero-subtitle">
            El mundial de fútbol se vive con pronósticos. Registra tus
            predicciones, compite con tus amigos y gana grandes premios.
          </p>

          {/* Stats bar */}
          <div className="home-hero-stats">
            {[
              { value: stats ? String(stats.approvedCount) : null, label: "Participantes", featured: true },
              { value: stats ? `S/. ${stats.entryFee}` : null, label: "Inscripción", featured: false },
              { value: stats ? `S/. ${stats.totalPool}` : null, label: "Pozo total", featured: false },
            ].map((item, i) => (
              <span key={item.label} style={{ display: "contents" }}>
                {i > 0 && <div className="home-hero-stat-divider" />}
                <div className={`home-hero-stat${item.featured ? " home-hero-stat-featured" : ""}`}>
                  {item.value !== null ? (
                    <span className="home-hero-stat-value">{item.value}</span>
                  ) : (
                    <span className="home-hero-stat-skeleton" />
                  )}
                  <span className="home-hero-stat-label">{item.label}</span>
                </div>
              </span>
            ))}
          </div>

          {/* Prizes */}
          <div className="home-prizes">
            <div className="home-prize home-prize-1">
              <span className="home-prize-medal">🥇</span>
              <span className="home-prize-pos">1.er puesto</span>
              <span className="home-prize-pct">{config?.prize_1st_pct ?? 70}%</span>
              <span className="home-prize-amount">
                {stats ? `S/. ${stats.prizes.first}` : <span className="home-hero-stat-skeleton" style={{ width: 60, height: 18, display: 'inline-block' }} />}
              </span>
            </div>
            <div className="home-prize home-prize-2">
              <span className="home-prize-medal">🥈</span>
              <span className="home-prize-pos">2.° puesto</span>
              <span className="home-prize-pct">{config?.prize_2nd_pct ?? 20}%</span>
              <span className="home-prize-amount">
                {stats ? `S/. ${stats.prizes.second}` : <span className="home-hero-stat-skeleton" style={{ width: 60, height: 18, display: 'inline-block' }} />}
              </span>
            </div>
            <div className="home-prize home-prize-3">
              <span className="home-prize-medal">🥉</span>
              <span className="home-prize-pos">3.er puesto</span>
              <span className="home-prize-pct">{config?.prize_3rd_pct ?? 10}%</span>
              <span className="home-prize-amount">
                {stats ? `S/. ${stats.prizes.third}` : <span className="home-hero-stat-skeleton" style={{ width: 60, height: 18, display: 'inline-block' }} />}
              </span>
            </div>
          </div>

          <div className="home-hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-gold btn-lg">
                🔮 Ir a mis predicciones
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-gold btn-lg">
                  🚀 Registrarme ahora
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Ingresar
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTIONS NAV */}
      <nav className="home-sections-nav">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            <span>{s.icon}</span>
            {s.title}
          </a>
        ))}
      </nav>

      {/* SECTIONS */}
      <div className="home-sections">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="home-section card">
            <h2 className="home-section-title">
              <span className="home-section-icon">{section.icon}</span>
              {section.title}
            </h2>
            <div className="home-section-body">{section.content}</div>
          </section>
        ))}
      </div>

      {/* CTA FOOTER */}
      <section className="home-cta card">
        <h2 className="home-cta-title">¿Listo para participar?</h2>
        <p className="home-cta-text">
          El Mundial 2026 se acerca. No te quedes fuera, <strong>registra tus
          predicciones</strong> antes del inicio del primer partido y compite por
          el pozo acumulado.
        </p>
        <div className="home-hero-actions" style={{ justifyContent: "center" }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-gold btn-lg">
              🔮 Ir a mis predicciones
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-gold btn-lg">
                🚀 Registrarme ahora
              </Link>
              <Link to="/participants" className="btn btn-outline btn-lg">
                👥 Ver participantes
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
