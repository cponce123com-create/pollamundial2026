import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, Match } from "../lib/api";
import { FlagImage } from "../lib/flags";
import { TEAMS } from "../lib/teams";

interface SquadPlayer {
  name: string;
  num: number;
  pos: string;
  club?: string;
  age?: number;
  caps?: number;
}

interface TeamSquad {
  team: string;
  coach: string;
  formation: string;
  fifaRank?: number;
  nickname?: string;
  bestWC?: string;
  stadium?: string;
  players: SquadPlayer[];
}

export default function Teams() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<TeamSquad[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamMatches, setSelectedTeamMatches] = useState<Match[]>([]);

  useEffect(() => {
    api.getMatches()
      .then(setMatches)
      .catch(() => navigate("/login"));

    // Load squads from static JSON
    fetch("/api/teams/squads")
      .then((r) => r.json())
      .then((data) => setSquads(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setSelectedTeamMatches([]);
      return;
    }
    const teamMatches = matches.filter(
      (m) =>
        m.home_team === selectedTeam ||
        m.away_team === selectedTeam
    );
    setSelectedTeamMatches(teamMatches);
  }, [selectedTeam, matches]);

  const getTeamSquad = (teamName: string): TeamSquad | undefined => {
    return squads.find((s) => s.team === teamName);
  };

  // Position index for pitch placement (4-3-3 as default, parse formation)
  const getPitchPositions = (formation: string): { x: number; y: number }[] => {
    const parts = formation.split("-").map(Number);
    const positions: { x: number; y: number }[] = [];

    positions.push({ x: 50, y: 92 });

    if (parts[0]) {
      for (let i = 0; i < parts[0]; i++) {
        positions.push({ x: (100 / (parts[0] + 1)) * (i + 1), y: 74 });
      }
    }
    if (parts[1]) {
      for (let i = 0; i < parts[1]; i++) {
        positions.push({ x: (100 / (parts[1] + 1)) * (i + 1), y: 54 });
      }
    }
    if (parts[2]) {
      for (let i = 0; i < parts[2]; i++) {
        positions.push({ x: (100 / (parts[2] + 1)) * (i + 1), y: 34 });
      }
    }
    if (parts[3]) {
      for (let i = 0; i < parts[3]; i++) {
        positions.push({ x: (100 / (parts[3] + 1)) * (i + 1), y: 20 });
      }
    }
    while (positions.length < 11) {
      positions.push({ x: 50 + Math.random() * 20, y: 40 });
    }
    return positions.slice(0, 11);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("es-PE", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  const selectedSquad = selectedTeam ? getTeamSquad(selectedTeam) : null;
  const selectedTeamInfo = selectedTeam ? TEAMS.find(t => t.name === selectedTeam) : null;

  return (
    <div>
      <h2 className="card-title" style={{ marginBottom: 16 }}>
        🌍 Equipos del Mundial 2026
      </h2>

      <div className="teams-layout">
        {/* Left: Team Grid */}
        <div className="teams-grid">
          <div className="teams-search">
            <input
              className="form-input"
              placeholder="Buscar equipo..."
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                document.querySelectorAll<HTMLDivElement>(".team-card-btn").forEach((el) => {
                  const name = el.getAttribute("data-team")?.toLowerCase() || "";
                  el.style.display = name.includes(q) ? "flex" : "none";
                });
              }}
            />
          </div>
          <div className="team-cards">
            {TEAMS.map((t) => (
              <button
                key={t.name}
                className={`team-card-btn ${selectedTeam === t.name ? "team-selected" : ""}`}
                data-team={t.name}
                onClick={() => setSelectedTeam(t.name)}
              >
                <FlagImage teamName={t.name} size={28} />
                <span className="team-card-name">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Team Detail */}
        <div className="teams-detail">
          {!selectedTeam ? (
            <div className="placeholder-page">
              <p className="placeholder-text">
                Selecciona un equipo para ver sus datos
              </p>
            </div>
          ) : (
            <>
              <div className="team-detail-header">
                <FlagImage teamName={selectedTeam} size={48} />
                <div>
                  <h3>{selectedTeam}</h3>
                  {selectedTeamInfo && (
                    <p className="placeholder-text">
                      Grupo {selectedTeamInfo.group} · {selectedTeamInfo.confed} · {selectedTeamInfo.continent}
                    </p>
                  )}
                  {selectedSquad && (
                    <p className="placeholder-text">
                      DT: {selectedSquad.coach} | Formación: {selectedSquad.formation}
                    </p>
                  )}
                </div>
              </div>

              {/* Team Info Cards */}
              {selectedSquad && (
                <div className="team-info-cards" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                  <div className="card" style={{ flex: 1, minWidth: 100, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold)" }}>
                      #{selectedSquad.fifaRank ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Ranking FIFA</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 100, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.nickname ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Apodo</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.bestWC ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Mejor Mundial</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.stadium ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Estadio</div>
                  </div>
                </div>
              )}

              <div className="team-detail-sections">
                {/* Pitch View */}
                {selectedSquad && (
                  <div className="team-pitch-card">
                    <h4 className="card-title">⚽ 11 Titular</h4>
                    <div className="pitch-container">
                      <div className="pitch-field">
                        <div className="pitch-center-circle" />
                        <div className="pitch-center-line" />
                        {getPitchPositions(selectedSquad.formation).map((pos, i) => {
                          const player = selectedSquad.players[i];
                          if (!player) return null;
                          return (
                            <div
                              key={i}
                              className="pitch-player"
                              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            >
                              <span className="pitch-player-num">{player.num}</span>
                              <span className="pitch-player-name">{player.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pitch-squad-list">
                        <h5>Plantilla Completa ({selectedSquad.players.length})</h5>
                        <div className="admin-table-wrapper">
                          <table className="admin-table" style={{ fontSize: "0.8rem" }}>
                            <thead>
                              <tr>
                                <th>N°</th>
                                <th>POS</th>
                                <th>Jugador</th>
                                <th>Club</th>
                                <th>Edad</th>
                                <th>PJ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedSquad.players.map((p) => (
                                <tr key={p.num}>
                                  <td style={{ fontWeight: 700 }}>{p.num}</td>
                                  <td><span className="badge badge-pending" style={{ fontSize: "0.65rem" }}>{p.pos}</span></td>
                                  <td>{p.name}</td>
                                  <td style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.club || "—"}</td>
                                  <td style={{ textAlign: "center" }}>{p.age ?? "—"}</td>
                                  <td style={{ textAlign: "center" }}>{p.caps ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Matches */}
                <div className="team-matches-card">
                  <h4 className="card-title">📅 Partidos</h4>
                  {selectedTeamMatches.length === 0 ? (
                    <p className="placeholder-text">No hay partidos registrados.</p>
                  ) : (
                    <div className="team-matches-list">
                      {selectedTeamMatches.map((m) => (
                        <div key={m.id} className="team-match-row">
                          <div className="team-match-teams">
                            <FlagImage teamName={m.home_team} size={18} />
                            <span className={m.home_team === selectedTeam ? "team-match-highlight" : ""}>
                              {m.home_team}
                            </span>
                            <span className="team-match-vs">vs</span>
                            <FlagImage teamName={m.away_team} size={18} />
                            <span className={m.away_team === selectedTeam ? "team-match-highlight" : ""}>
                              {m.away_team}
                            </span>
                          </div>
                          <div className="team-match-info">
                            <span className="team-match-group">Grupo {m.group_name}</span>
                            <span className="team-match-date">{formatDate(m.match_date)}</span>
                            {m.home_score_real !== null && (
                              <span className="team-match-score">
                                {m.home_score_real} - {m.away_score_real}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
