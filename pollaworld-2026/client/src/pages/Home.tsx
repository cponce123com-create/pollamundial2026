import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, PoolStats, PoolConfig } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const SECTIONS = [
  {
    id: "como-funciona",
    icon: "⚽",
    title: "¿Cómo funciona?",
    content: (
      <>
        <p>
          <strong>La Polla del Ponce</strong> es una competencia de pronósticos para el
          Mundial de Fútbol 2026. Cada participante registra sus predicciones para
          todos los partidos del torneo <strong>antes del inicio del primer partido</strong>.
        </p>
        <ul className="home-checklist">
          <li>📝 Regístrate con tu nombre, celular y un emoji que te identifique.</li>
          <li>🔮 Llena tus predicciones con los marcadores de todos los partidos.</li>
          <li>💳 Realiza el pago de inscripción vía Yape (puedes pagar antes o después de llenar tus predicciones).</li>
          <li>✅ Espera la confirmación del organizador.</li>
          <li>🏆 Sigue tu puntuación en el ranking en vivo.</li>
        </ul>
      </>
    ),
  },
  {
    id: "puntuacion",
    icon: "⭐",
    title: "Sistema de Puntuación",
    content: (
      <>
        <p>Cada partido se puntúa de la siguiente manera:</p>
        <div className="home-points-grid">
          <div className="home-points-card">
            <span className="home-points-icon">🎯</span>
            <span className="home-points-value">+5 pts</span>
            <span className="home-points-label">
              Marcador exacto
            </span>
            <span className="home-points-desc">
              Aciertas el resultado exacto del partido (incluyendo empates)
            </span>
          </div>
          <div className="home-points-card">
            <span className="home-points-icon">✅</span>
            <span className="home-points-value">+3 pts</span>
            <span className="home-points-label">
              Ganador o empate
            </span>
            <span className="home-points-desc">
              Aciertas quién gana o el empate, pero sin el marcador exacto
            </span>
          </div>
          <div className="home-points-card">
            <span className="home-points-icon">❌</span>
            <span className="home-points-value">+0 pts</span>
            <span className="home-points-label">
              Sin acierto
            </span>
            <span className="home-points-desc">
              No aciertas ni ganador, ni empate, ni marcador
            </span>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "predicciones",
    icon: "🔮",
    title: "Las Predicciones",
    content: (
      <>
        <p>
          Una vez registrado y con el pago confirmado, podrás ingresar tus
          predicciones desde la sección <strong>Predicciones</strong>.
        </p>
        <ul className="home-checklist">
          <li>📋 Debes predecir <strong>todos</strong> los partidos del torneo.</li>
          <li>🏠 Ingresa el marcador que crees que tendrá cada partido (local - visitante).</li>
          <li>🔄 Usa los botones de <strong>relleno automático</strong> si no estás seguro de algunos partidos:</li>
          <li style={{ marginLeft: 24, listStyle: 'none' }}>
            🎲 <strong>Llenar con suerte</strong> — Asigna 0 o 1 a cada equipo
            de forma completamente aleatoria. Ideal si no sabes de fútbol y
            quieres pura suerte.
          </li>
          <li style={{ marginLeft: 24, listStyle: 'none' }}>
            🧠 <strong>Llenar con lógica</strong> — Analiza la fuerza de cada
            selección (según ranking FIFA e historial) y genera marcadores
            realistas: los equipos fuertes anotan más, los débiles menos, con
            ventaja de local y sorpresas ocasionales.
          </li>
          <li>✏️ Puedes editar tus predicciones <strong>todas las veces que quieras</strong> hasta el inicio del primer partido del torneo.</li>
          <li>🔒 Una vez que el primer partido del torneo comience, las predicciones se <strong>cierran automáticamente</strong> y ya no se pueden modificar.</li>
          <li>📄 Puedes descargar un <strong>PDF</strong> con todas tus predicciones como respaldo.</li>
        </ul>
      </>
    ),
  },
  {
    id: "automarcado",
    icon: "🤖",
    title: "Auto-Marcado Automático",
    content: (
      <>
        <p>
          No necesitas hacer nada para que tus puntos se calculen. El sistema
          es completamente automático:
        </p>
        <ol className="home-steps-list">
          <li>
            <strong>El administrador</strong> ingresa los resultados reales de cada
            partido cuando finaliza.
          </li>
          <li>
            El sistema <strong>compara automáticamente</strong> tu predicción con el
            resultado real.
          </li>
          <li>
            Se asignan los puntos según el sistema de puntuación explicado arriba.
          </li>
          <li>
            Tu <strong>puntaje total</strong> se actualiza al instante en el ranking.
          </li>
          <li>
            Puedes ver en cada partido cuántos puntos ganaste o si no acertaste.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "pagos",
    icon: "💳",
    title: "Pagos y Confirmación",
    content: (
      <>
        <p>
          Para participar, debes realizar un pago único de inscripción:
        </p>
        <div className="home-payment-card">
          <div className="home-payment-row">
            <span>Monto de inscripción:</span>
            <strong className="home-payment-amount">
              S/. <span id="entry-fee">20</span>.00
            </strong>
          </div>
          <div className="home-payment-row">
            <span>Método de pago:</span>
            <strong>Yape</strong>
          </div>
          <div className="home-payment-row">
            <span>Número:</span>
            <strong id="yape-phone">—</strong>
          </div>
        </div>
        <ol className="home-steps-list">
          <li>
            Escanea el código QR de Yape (o escribe el número) desde tu app
            Yape.
          </li>
          <li>Realiza el depósito del monto exacto de inscripción.</li>
          <li>
            Sube el <strong>comprobante</strong> (captura de pantalla) desde la
            sección de pago en tu panel.
          </li>
          <li>
            El organizador revisará y <strong>confirmará</strong> tu pago.
          </li>
          <li>
            Recibirás una notificación cuando tu pago sea aprobado y quedarás
            habilitado para participar.
          </li>
        </ol>
        <div className="home-note">
          💡 Si tu pago es rechazado, puedes volver a subir un nuevo comprobante.
        </div>
      </>
    ),
  },
  {
    id: "aprobacion",
    icon: "✅",
    title: "Aprobación de Participantes",
    content: (
      <>
        <p>
          El administrador del grupo revisa cada comprobante de pago y decide
          si lo aprueba o lo rechaza.
        </p>
        <ul className="home-checklist">
          <li>✅ <strong>Aprobado</strong> — Tu pago fue verificado. Ya puedes hacer tus predicciones y apareces en la lista de participantes aptos.</li>
          <li>⏳ <strong>Pendiente</strong> — Tu comprobante está en revisión. El administrador lo revisará pronto.</li>
          <li>❌ <strong>Rechazado</strong> — El comprobante no pudo ser verificado. Sube uno nuevo.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Solo los participantes con pago <strong>aprobado</strong> son elegibles
          para ganar los premios.
        </p>
      </>
    ),
  },
  {
    id: "participantes-aptos",
    icon: "👥",
    title: "Participantes Aptos",
    content: (
      <>
        <p>
          En la sección <strong>Participantes</strong> puedes ver a todos los
          jugadores registrados. Una vez que el torneo inicie, podrás ver las
          predicciones de los participantes aprobados.
        </p>
        <ul className="home-checklist">
          <li>📊 Todos los participantes confirmados aparecen con su emoji y nombre.</li>
          <li>💰 El <strong>pozo total</strong> se calcula multiplicando el número de participantes aprobados por la cuota de inscripción.</li>
          <li>🏆 Los <strong>premios</strong> se distribuyen entre el 1.°, 2.° y 3.er puesto.</li>
          <li>🔒 Antes del inicio del torneo, las predicciones de cada participante están ocultas para mantener la competencia justa.</li>
        </ul>
      </>
    ),
  },
  {
    id: "inicio-torneo",
    icon: "🏁",
    title: "¿Qué pasa cuando inicia el primer partido?",
    content: (
      <>
        <p>
          El momento clave de la competencia es el <strong>inicio del primer partido</strong>:
        </p>
        <div className="home-event-cards">
          <div className="home-event-card">
            <span className="home-event-icon">🔒</span>
            <h4>Predicciones cerradas</h4>
            <p>
              Ya no se pueden modificar ni crear nuevas predicciones. Todas
              quedan congeladas con los valores que ingresaste.
            </p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">👀</span>
            <h4>Predicciones visibles</h4>
            <p>
              Las predicciones de todos los participantes se vuelven públicas.
              Puedes ver qué pronosticó cada jugador.
            </p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">📊</span>
            <h4>Ranking en vivo</h4>
            <p>
              A medida que los partidos se juegan y se ingresan los resultados,
              el ranking se actualiza automáticamente en tiempo real.
            </p>
          </div>
          <div className="home-event-card">
            <span className="home-event-icon">🏆</span>
            <h4>Ganador final</h4>
            <p>
              Al término del Mundial, el participante con mayor puntaje acumulado
              se lleva el primer premio.
            </p>
            <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--gold)' }}>
              ⚖️ <strong>Desempate:</strong> Si dos o más jugadores igualan en
              puntos, se contarán los <strong>aciertos al marcador exacto
              (+5 pts)</strong>. Quien tenga más marcadores exactos acertados
              ocupará la mejor posición.
            </p>
          </div>
        </div>
      </>
    ),
  },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [config, setConfig] = useState<PoolConfig | null>(null);

  useEffect(() => {
    Promise.all([
      api.getPoolStats(),
      api.getPoolConfig().catch(() => null),
    ]).then(([s, c]) => {
      setStats(s);
      setConfig(c);
    }).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-content">
          {config?.logo_url ? (
            <img src={config.logo_url.replace('/upload/', '/upload/f_auto,q_auto/')} alt="La Polla del Ponce" className="home-hero-logo" loading="lazy" decoding="async" />
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
              { value: stats ? `S/. ${stats.prizes.first}` : null, label: "1.er puesto", featured: false },
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
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            <span>{s.icon}</span>
            {s.title}
          </a>
        ))}
      </nav>

      {/* SECTIONS */}
      <div className="home-sections">
        {SECTIONS.map((section) => (
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
