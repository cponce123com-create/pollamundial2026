import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, Match, TeamRecentForm } from "../lib/api";
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
  confederation?: string;
  worldCupTitles?: number;
  worldCupApps?: number;
  players: SquadPlayer[];
}

export default function Teams() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<TeamSquad[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [_selectedTeamMatches, setSelectedTeamMatches] = useState<Match[]>([]);
  const [recentForm, setRecentForm] = useState<TeamRecentForm | null>(null);

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
      setRecentForm(null);
      return;
    }
    const teamMatches = matches.filter(
      (m) =>
        m.home_team === selectedTeam ||
        m.away_team === selectedTeam
    );
    setSelectedTeamMatches(teamMatches);

    // Fetch recent form
    fetch(`/api/standings/form/${encodeURIComponent(selectedTeam)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.formString) {
          setRecentForm(data as TeamRecentForm);
        }
      })
      .catch(() => setRecentForm(null));
  }, [selectedTeam, matches]);

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
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold)" }}>
                      #{selectedSquad.fifaRank ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Ranking FIFA</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.nickname ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Apodo</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.confederation ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Confederación</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.bestWC ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Mejor Mundial</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--gold)" }}>
                      {selectedSquad.worldCupTitles ?? 0}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>🏆 Títulos</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 90, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--gold)" }}>
                      {selectedSquad.worldCupApps ?? 0}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>🌍 Mundiales</div>
                  </div>
                  <div className="card" style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "8px 12px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
                      {selectedSquad.stadium ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Estadio</div>
                  </div>
                </div>
              )}

              {/* Recent Form */}
              {recentForm && recentForm.form.length > 0 && (
                <div className="team-form-card">
                  <h4 className="card-title">📊 Forma reciente</h4>
                  <div className="team-form-row">
                    {recentForm.form.map((entry, i) => (
                      <div
                        key={i}
                        className={`team-form-badge team-form-${entry.result.toLowerCase()}`}
                        title={`${entry.result === "W" ? "Ganó" : entry.result === "D" ? "Empató" : "Perdió"} ${entry.score} vs ${entry.opponent}`}
                      >
                        <span className="team-form-letter">{entry.result}</span>
                        <span className="team-form-score">{entry.score}</span>
                      </div>
                    ))}
                    <span className="team-form-string">{recentForm.formString}</span>
                  </div>
                </div>
              )}

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
                      <h5>Suplentes ({selectedSquad.players.slice(11).length})</h5>
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
                            {selectedSquad.players.slice(11).map((p) => (
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

              {/* Full Squad Table */}
              {selectedSquad && (
                <div className="team-pitch-card" style={{ marginTop: 16 }}>
                  <h4 className="card-title">👥 Plantilla ({selectedSquad.players.length} jugadores)</h4>
                  <div className="admin-table-wrapper">
                    <table className="admin-table" style={{ fontSize: "0.85rem" }}>
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
                        {[...selectedSquad.players]
                          .sort((a, b) => a.num - b.num)
                          .map((p) => (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
