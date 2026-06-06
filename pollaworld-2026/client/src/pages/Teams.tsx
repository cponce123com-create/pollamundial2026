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

interface RecentMatch {
  date: string;
  opponent: string;
  homeAway: "H" | "A" | "N";
  goalsFor: number;
  goalsAgainst: number;
  type: string;
}

interface StarPlayer {
  name: string;
  pos: string;
  club: string;
  goals: number;
  caps: number;
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
  starPlayers?: StarPlayer[];
  recentMatches?: RecentMatch[];
}

type TeamTab = "lineup" | "squad" | "matches" | "stats";

function getMatchResult(m: RecentMatch): "W" | "D" | "L" {
  if (m.goalsFor > m.goalsAgainst) return "W";
  if (m.goalsFor < m.goalsAgainst) return "L";
  return "D";
}

function getStats(matches: RecentMatch[]) {
  let W = 0, D = 0, L = 0, gf = 0, gc = 0;
  for (const m of matches) {
    gf += m.goalsFor;
    gc += m.goalsAgainst;
    const r = getMatchResult(m);
    if (r === "W") W++;
    else if (r === "D") D++;
    else L++;
  }
  return { W, D, L, gf, gc, total: matches.length };
}

function groupByPosition(players: SquadPlayer[]) {
  const groups: Record<string, SquadPlayer[]> = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    const key = p.pos in groups ? p.pos : "FW";
    groups[key].push(p);
  }
  return groups;
}

function isOficial(type: string): boolean {
  return type !== "Amistoso";
}

export default function Teams() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<TeamSquad[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [_selectedTeamMatches, setSelectedTeamMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<TeamTab>("lineup");

  useEffect(() => {
    api.getMatches()
      .then(setMatches)
      .catch(() => navigate("/login"));

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

  useEffect(() => {
    setActiveTab("lineup");
  }, [selectedTeam]);

  const getTeamSquad = (teamName: string): TeamSquad | undefined => {
    return squads.find((s) => s.team === teamName);
  };

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
      day: "2-digit", month: "short",
    });
  };

  const selectedSquad = selectedTeam ? getTeamSquad(selectedTeam) : null;
  const selectedTeamInfo = selectedTeam ? TEAMS.find(t => t.name === selectedTeam) : null;

  // Form bar: last 5 matches sorted by date desc
  const recentMatchesSorted = selectedSquad?.recentMatches
    ? [...selectedSquad.recentMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];
  const formMatches = recentMatchesSorted.slice(0, 5);

  const stats = selectedSquad?.recentMatches ? getStats(selectedSquad.recentMatches) : null;
  const groupedPlayers = selectedSquad ? groupByPosition(selectedSquad.players) : null;

  // Sort matches for display
  const sortedMatches = recentMatchesSorted;

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

              {/* Form Bar */}
              {formMatches.length > 0 && (
                <div className="team-form-bar">
                  <span className="team-form-label">📊 Forma: </span>
                  {formMatches.map((m, i) => {
                    const r = getMatchResult(m);
                    return (
                      <span key={i} className={`form-pill ${r}`}>
                        {r === "W" ? "V" : r === "D" ? "E" : "D"}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Tabs */}
              {selectedSquad && (
                <div className="team-tabs">
                  <button
                    className={`team-tab ${activeTab === "lineup" ? "team-tab-active" : ""}`}
                    onClick={() => setActiveTab("lineup")}
                  >
                    ⚽ 11 Titular
                  </button>
                  <button
                    className={`team-tab ${activeTab === "squad" ? "team-tab-active" : ""}`}
                    onClick={() => setActiveTab("squad")}
                  >
                    👥 Plantilla
                  </button>
                  <button
                    className={`team-tab ${activeTab === "matches" ? "team-tab-active" : ""}`}
                    onClick={() => setActiveTab("matches")}
                  >
                    📅 Últimos Partidos
                  </button>
                  <button
                    className={`team-tab ${activeTab === "stats" ? "team-tab-active" : ""}`}
                    onClick={() => setActiveTab("stats")}
                  >
                    📊 Estadísticas
                  </button>
                </div>
              )}

              {/* Tab Content */}
              {/* Tab: Lineup (existing pitch view) */}
              {activeTab === "lineup" && selectedSquad && (
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

              {/* Tab: Squad with Star Players */}
              {activeTab === "squad" && selectedSquad && (
                <div className="team-pitch-card">
                  {/* Star Players */}
                  {selectedSquad.starPlayers && selectedSquad.starPlayers.length > 0 && (
                    <>
                      <h4 className="card-title">⭐ Jugadores Estrella</h4>
                      <div className="star-players-grid">
                        {selectedSquad.starPlayers.map((sp, i) => (
                          <div key={i} className="star-player-card">
                            <div className="star-player-avatar">
                              {sp.name.charAt(0)}
                            </div>
                            <div className="star-player-name">{sp.name}</div>
                            <span className="badge badge-pending" style={{ fontSize: "0.6rem" }}>{sp.pos}</span>
                            <div className="star-player-club">{sp.club}</div>
                            <div className="star-player-stats">
                              <span>⚽ {sp.goals}</span>
                              <span>🎯 {sp.caps}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Full Squad by Position */}
                  <h4 className="card-title" style={{ marginTop: 16 }}>
                    👥 Plantilla Completa ({selectedSquad.players.length})
                  </h4>
                  {groupedPlayers && Object.entries(groupedPlayers).map(([pos, players]) => (
                    <div key={pos} className="squad-position-group">
                      <div className="squad-position-header">
                        {pos === "GK" ? "🧤" : pos === "DF" ? "🛡️" : pos === "MF" ? "🎯" : "⚽"} {pos}
                        <span className="squad-position-count">{players.length}</span>
                      </div>
                      <div className="admin-table-wrapper">
                        <table className="admin-table" style={{ fontSize: "0.8rem" }}>
                          <thead>
                            <tr>
                              <th>N°</th>
                              <th>Jugador</th>
                              <th>Club</th>
                              <th>Edad</th>
                              <th>PJ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {players.map((p) => (
                              <tr key={p.num}>
                                <td style={{ fontWeight: 700 }}>{p.num}</td>
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
                  ))}
                </div>
              )}

              {/* Tab: Recent Matches */}
              {activeTab === "matches" && selectedSquad && (
                <div className="team-matches-card">
                  <h4 className="card-title">📅 Últimos Partidos</h4>
                  {sortedMatches.length === 0 ? (
                    <p className="placeholder-text">No hay partidos registrados.</p>
                  ) : (
                    <div className="team-matches-list">
                      {sortedMatches.map((m, i) => {
                        const result = getMatchResult(m);
                        const locationLabel =
                          m.homeAway === "H" ? "Local" : m.homeAway === "A" ? "Visitante" : "Neutral";
                        return (
                          <div key={i} className="recent-match-row">
                            <div className="recent-match-left">
                              <span className="recent-match-date">{formatDate(m.date)}</span>
                              <span className={`recent-match-type ${isOficial(m.type) ? "oficial" : "amistoso"}`}>
                                {m.type}
                              </span>
                            </div>
                            <div className="recent-match-center">
                              <span className="recent-match-opponent">{m.opponent}</span>
                              <span className={`recent-match-result ${result === "W" ? "win" : result === "D" ? "draw" : "loss"}`}>
                                {m.goalsFor} - {m.goalsAgainst}
                              </span>
                            </div>
                            <div className="recent-match-right">
                              <span className="recent-match-location">{locationLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Stats */}
              {activeTab === "stats" && selectedSquad && stats && (
                <div className="team-matches-card">
                  <h4 className="card-title">📊 Estadísticas</h4>

                  {/* W/D/L Boxes */}
                  <div className="team-stats-grid">
                    <div className="team-stat-box wins">
                      <div className="stat-num">{stats.W}</div>
                      <div className="stat-label">Victorias</div>
                    </div>
                    <div className="team-stat-box draws">
                      <div className="stat-num">{stats.D}</div>
                      <div className="stat-label">Empates</div>
                    </div>
                    <div className="team-stat-box losses">
                      <div className="stat-num">{stats.L}</div>
                      <div className="stat-label">Derrotas</div>
                    </div>
                  </div>

                  {/* W/D/L Percentage Bar */}
                  <div className="team-wdl-bar">
                    {stats.total > 0 && (
                      <>
                        <div
                          className="wdl-segment-w"
                          style={{ width: `${(stats.W / stats.total) * 100}%` }}
                          title={`${((stats.W / stats.total) * 100).toFixed(0)}%`}
                        />
                        <div
                          className="wdl-segment-d"
                          style={{ width: `${(stats.D / stats.total) * 100}%` }}
                          title={`${((stats.D / stats.total) * 100).toFixed(0)}%`}
                        />
                        <div
                          className="wdl-segment-l"
                          style={{ width: `${(stats.L / stats.total) * 100}%` }}
                          title={`${((stats.L / stats.total) * 100).toFixed(0)}%`}
                        />
                      </>
                    )}
                  </div>
                  <div className="team-wdl-labels">
                    <span style={{ color: "var(--success)" }}>V {stats.total > 0 ? ((stats.W / stats.total) * 100).toFixed(0) : 0}%</span>
                    <span style={{ color: "var(--gold)" }}>E {stats.total > 0 ? ((stats.D / stats.total) * 100).toFixed(0) : 0}%</span>
                    <span style={{ color: "var(--error)" }}>D {stats.total > 0 ? ((stats.L / stats.total) * 100).toFixed(0) : 0}%</span>
                  </div>

                  {/* Goals */}
                  <div className="team-goals-row">
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ color: "var(--success)" }}>{stats.gf}</div>
                      <div className="goal-label">Goles a favor</div>
                    </div>
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ color: "var(--error)" }}>{stats.gc}</div>
                      <div className="goal-label">Goles en contra</div>
                    </div>
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ color: stats.gf - stats.gc >= 0 ? "var(--success)" : "var(--error)" }}>
                        {stats.gf - stats.gc >= 0 ? "+" : ""}{stats.gf - stats.gc}
                      </div>
                      <div className="goal-label">Diferencia</div>
                    </div>
                  </div>

                  {/* Averages */}
                  <div className="team-goals-row" style={{ marginTop: 8 }}>
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ fontSize: "1rem" }}>
                        {stats.total > 0 ? (stats.gf / stats.total).toFixed(1) : "0"}
                      </div>
                      <div className="goal-label">Promedio GF</div>
                    </div>
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ fontSize: "1rem" }}>
                        {stats.total > 0 ? (stats.gc / stats.total).toFixed(1) : "0"}
                      </div>
                      <div className="goal-label">Promedio GC</div>
                    </div>
                    <div className="team-goal-stat">
                      <div className="goal-num" style={{ fontSize: "1rem" }}>
                        {stats.total > 0 ? ((stats.gf + stats.gc) / stats.total).toFixed(1) : "0"}
                      </div>
                      <div className="goal-label">Total/Partido</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
