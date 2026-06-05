import { useState, useEffect } from "react";
import { api, PoolStats } from "../lib/api";
import { getEmoji } from "../lib/emojis";

interface RankingDetail {
  user_id: string;
  name: string;
  emoji_id: string;
  aciertos: number;
  exactos: number;
  total_points: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingDetail[]>([]);
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRanking() as Promise<RankingDetail[]>,
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

  const allZero = ranking.every((r) => r.total_points === 0);
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
          const emoji = getEmoji(entry.emoji_id);
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
              <div style={{ fontSize: "2.5rem", margin: "4px 0" }}>
                {emoji?.emoji || "❓"}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{entry.name}</div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", marginTop: 4 }}>
                {entry.total_points} pts
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
                <th>Aciertos (3pts)</th>
                <th>Exactos (5pts)</th>
                <th>Total Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, idx) => {
                const emoji = getEmoji(entry.emoji_id);
                const isCurrentUser = entry.user_id === currentUserId;
                return (
                  <tr
                    key={entry.user_id}
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
                      <span style={{ fontSize: "1.2rem", marginRight: 6 }}>
                        {emoji?.emoji || "❓"}
                      </span>
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
                    <td>{entry.aciertos ?? 0}</td>
                    <td>{entry.exactos ?? 0}</td>
                    <td style={{ fontWeight: 700, color: "var(--gold)" }}>
                      {entry.total_points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
