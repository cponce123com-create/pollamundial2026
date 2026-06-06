import { useState, useEffect } from "react";
import { api, PoolStats, RankingEntry } from "../lib/api";
import { getPlayer } from "../lib/players";

function getShareText(stats: PoolStats | null, position: number, name: string): string {
  const prizeStr = position === 1 ? `S/.${stats?.prizes.first}` : position === 2 ? `S/.${stats?.prizes.second}` : position === 3 ? `S/.${stats?.prizes.third}` : "";
  const posText = position <= 3 ? `🥇🥈🥉`.charAt(position - 1) : `#${position}°`;
  return `🏆 *La Polla del Ponce*\n${posText} — ${name}${prizeStr ? ` (Premio: ${prizeStr})` : ""}\n\n⬇️ Ve el ranking completo en:\n${window.location.href}`;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRanking() as Promise<RankingEntry[]>,
      api.getPoolStats(),
      api.me().then((d) => d.user).catch(() => null),
    ])
      .then(([rank, st, user]) => {
        setRanking(rank);
        setStats(st);
        if (user) setCurrentUserId(user.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando ranking...</p>
      </div>
    );
  }

  const allZero = ranking.every((r) => r.totalPoints === 0);
  if (allZero || ranking.length === 0) {
    return (
      <div className="placeholder-page">
        <div className="placeholder-icon">{"⚽"}</div>
        <h2 className="placeholder-title">Ranking</h2>
        <p className="placeholder-text">
          El ranking se activa cuando se juegue el primer partido {"⚽"}
        </p>
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);

  const podiumPositions = [
    { pos: 2, key: "second", medal: "🥈", bg: "#c0c0c0", offset: "20px" },
    { pos: 1, key: "first", medal: "👑", bg: "#f0a500", offset: "0px" },
    { pos: 3, key: "third", medal: "🥉", bg: "#cd7f32", offset: "20px" },
  ];

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {"🏆"} Ranking
      </h2>

      {/* PODIUM */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        {podiumPositions.map((p) => {
          const entry = top3[p.pos - 1];
          if (!entry) return null;
          const player = getPlayer(entry.playerSlug);
          const prize =
            p.pos === 1
              ? stats?.prizes.first
              : p.pos === 2
                ? stats?.prizes.second
                : stats?.prizes.third;
          return (
            <div
              key={p.key}
              style={{
                background: p.bg,
                borderRadius: "var(--radius)",
                padding: "20px 24px",
                textAlign: "center",
                minWidth: 160,
                color: "#0d1117",
                transform: "translateY(" + p.offset + ")",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                order: p.pos === 1 ? 0 : p.pos === 2 ? -1 : 1,
              }}
            >
              <div style={{ fontSize: "2rem" }}>{p.medal}</div>
              <div style={{ margin: "4px 0" }}>
                {player ? (
                  <img
                    src={player.image}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(0,0,0,0.2)",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "2.5rem" }}>{"❓"}</div>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{entry.name}</div>
              {entry.ticketNumber > 1 && (
                <div style={{ fontSize: "0.8rem", fontWeight: 500, marginTop: 2 }}>
                  Ticket #{entry.ticketNumber}
                </div>
              )}
              <div style={{ fontWeight: 800, fontSize: "1.3rem", marginTop: 4 }}>
                {entry.totalPoints} pts
              </div>
              {prize !== undefined && (
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: 2 }}>
                  S/. {prize.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="card">
        <h3 className="card-title">{"📊"} Tabla de posiciones</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Participante</th>
                <th>Ticket</th>
                <th>Aciertos (2-3pts)</th>
                <th>Exactos (5pts)</th>
                <th>Total Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, idx) => {
                const player = getPlayer(entry.playerSlug);
                const isCurrentUser = entry.userId === currentUserId;
                return (
                  <tr
                    key={entry.entryId}
                    style={{
                      border: isCurrentUser ? "2px solid var(--gold)" : undefined,
                      background: isCurrentUser
                        ? "rgba(240, 165, 0, 0.05)"
                        : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 700, color: "var(--gold)" }}>
                      {idx + 1}
                    </td>
                    <td>
                      {player ? (
                        <img
                          src={player.image}
                          alt={player.name}
                    referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                            verticalAlign: "middle",
                            marginRight: 6,
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.2rem", marginRight: 6 }}>{"❓"}</span>
                      )}
                      {entry.name}
                      {isCurrentUser && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--gold)",
                            marginLeft: 6,
                          }}
                        >
                          (t&uacute;)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-pending" style={{ fontSize: "0.75rem" }}>
                        #{entry.ticketNumber}
                      </span>
                    </td>
                    <td>{entry.correctResults ?? 0}</td>
                    <td>{entry.exactScores ?? 0}</td>
                    <td style={{ fontWeight: 700, color: "var(--gold)" }}>
                      {entry.totalPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Share on WhatsApp */}
        {currentUserId && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                const userEntries = ranking.filter((e) => e.userId === currentUserId);
                const bestEntry = userEntries[0];
                const pos = bestEntry ? ranking.indexOf(bestEntry) + 1 : 0;
                const text = getShareText(stats, pos, bestEntry?.name || "Participante");
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
            >
              📱 Compartir mi posición en WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
