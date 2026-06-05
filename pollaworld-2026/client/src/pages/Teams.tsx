import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, Match } from "../lib/api";
import { FlagImage } from "../lib/flags";

interface SquadPlayer {
  name: string;
  num: number;
  pos: string;
}

interface TeamSquad {
  team: string;
  coach: string;
  formation: string;
  players: SquadPlayer[];
}

export default function Teams() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<TeamSquad[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamSquad | null>(null);
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
        m.home_team === selectedTeam.team ||
        m.away_team === selectedTeam.team
    );
    setSelectedTeamMatches(teamMatches);
  }, [selectedTeam, matches]);

  // Position index for pitch placement (4-3-3 as default, parse formation)
  const getPitchPositions = (formation: string): { x: number; y: number }[] => {
    const parts = formation.split("-").map(Number);
    const positions: { x: number; y: number }[] = [];

    // GK at bottom
    positions.push({ x: 50, y: 92 });

    // Defenders
    if (parts[0]) {
      for (let i = 0; i < parts[0]; i++) {
        positions.push({ x: (100 / (parts[0] + 1)) * (i + 1), y: 74 });
      }
    }

    // Midfielders
    if (parts[1]) {
      for (let i = 0; i < parts[1]; i++) {
        positions.push({ x: (100 / (parts[1] + 1)) * (i + 1), y: 54 });
      }
    }

    // Forwards
    if (parts[2]) {
      for (let i = 0; i < parts[2]; i++) {
        positions.push({ x: (100 / (parts[2] + 1)) * (i + 1), y: 34 });
      }
    }

    // Extra forward line (4-3-3 has forwards at y=34)
    if (parts[3]) {
      for (let i = 0; i < parts[3]; i++) {
        positions.push({ x: (100 / (parts[3] + 1)) * (i + 1), y: 20 });
      }
    }

    // Ensure we have exactly 11 positions
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
            {squads.map((s) => (
              <button
                key={s.team}
                className={`team-card-btn ${selectedTeam?.team === s.team ? "team-selected" : ""}`}
                data-team={s.team}
                onClick={() => setSelectedTeam(s)}
              >
                <FlagImage teamName={s.team} size={28} />
                <span className="team-card-name">{s.team}</span>
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
                <FlagImage teamName={selectedTeam.team} size={48} />
                <div>
                  <h3>{selectedTeam.team}</h3>
                  <p className="placeholder-text">
                    DT: {selectedTeam.coach} | Formación: {selectedTeam.formation}
                  </p>
                </div>
              </div>

              <div className="team-detail-sections">
                {/* Pitch View */}
                <div className="team-pitch-card">
                  <h4 className="card-title">⚽ 11 Titular</h4>
                  <div className="pitch-container">
                    <div className="pitch-field">
                      <div className="pitch-center-circle" />
                      <div className="pitch-center-line" />
                      {getPitchPositions(selectedTeam.formation).map((pos, i) => {
                        const player = selectedTeam.players[i];
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
                      <h5>Jugadores</h5>
                      <div className="pitch-squad-grid">
                        {selectedTeam.players.map((p) => (
                          <div key={p.num} className="pitch-squad-item">
                            <span className="pitch-squad-pos">{p.pos}</span>
                            <span className="pitch-squad-num">{p.num}</span>
                            <span className="pitch-squad-name">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

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
                            <span className={m.home_team === selectedTeam.team ? "team-match-highlight" : ""}>
                              {m.home_team}
                            </span>
                            <span className="team-match-vs">vs</span>
                            <FlagImage teamName={m.away_team} size={18} />
                            <span className={m.away_team === selectedTeam.team ? "team-match-highlight" : ""}>
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
