import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api, Match, TeamRecentForm } from "../lib/api";
import { FlagImage } from "../lib/flags";
import { TEAMS } from "../lib/teams";

interface SquadPlayer {
  name: string;
  num: number;
  pos: string;
  club: string;
  age: number;
  caps: number;
  image?: string;
  stadiumImage?: string;
}

interface TeamSquad {
  team: string;
  coach: string;
  formation: string;
  fifaRank?: number;
  nickname?: string;
  bestWC?: string;
  stadium?: string;
  stadiumImage?: string;
  confederation?: string;
  worldCupTitles?: number;
  worldCupApps?: number;
  players: SquadPlayer[];
}

const GROUP_LABELS = "ABCDEFGHIJKL".split("");

// UEFA teams get a blue accent, CONMEBOL green, etc.
const CONFED_COLORS: Record<string, string> = {
  UEFA: "#3b82f6",
  CONMEBOL: "#22c55e",
  CONCACAF: "#eab308",
  CAF: "#f97316",
  AFC: "#8b5cf6",
  OFC: "#06b6d4",
};

function getPosColor(pos: string): string {
  const p = pos.replace(/[0-9]/g, "");
  if (p.includes("GK")) return "#f59e0b";
  if (p.includes("DF")) return "#3b82f6";
  if (p.includes("MF")) return "#22c55e";
  if (p.includes("FW")) return "#ef4444";
  return "#8b949e";
}

function getPosLabel(pos: string): string {
  const p = pos.replace(/[0-9]/g, "");
  if (p.includes("GK")) return "POR";
  if (p.includes("DF")) return "DEF";
  if (p.includes("MF")) return "MED";
  if (p.includes("FW")) return "DEL";
  return pos;
}

export default function Teams() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squads, setSquads] = useState<TeamSquad[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [recentForm, setRecentForm] = useState<TeamRecentForm | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    api.getMatches()
      .then(setMatches)
      .catch(() => navigate("/login"));
    fetch("/api/teams/squads")
      .then((r) => r.json())
      .then(setSquads)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setRecentForm(null);
      return;
    }
    fetch(`/api/standings/form/${encodeURIComponent(selectedTeam)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.formString) setRecentForm(data as TeamRecentForm);
      })
      .catch(() => setRecentForm(null));
  }, [selectedTeam]);

  const teamInfoMap = useMemo(() => {
    const m = new Map(TEAMS.map((t) => [t.name, t]));
    return m;
  }, []);

  const filteredTeams = useMemo(() => {
    let list = TEAMS;
    if (activeGroup) list = list.filter((t) => t.group === activeGroup);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeGroup, search]);

  const selectedSquad = selectedTeam
    ? squads.find((s) => s.team === selectedTeam)
    : null;
  const selectedInfo = selectedTeam ? teamInfoMap.get(selectedTeam) : null;

  const teamMatches = useMemo(() => {
    if (!selectedTeam) return [];
    return matches.filter(
      (m) => m.home_team === selectedTeam || m.away_team === selectedTeam
    );
  }, [selectedTeam, matches]);

  // Build pitch positions from formation string
  const pitchPositions = useMemo(() => {
    if (!selectedSquad) return [];
    const parts = selectedSquad.formation.split("-").map(Number);
    const rows: { label: string; y: number }[] = [
      { label: "GK", y: 88 },
    ];
    const rowLabels = ["DEF", "MED", "DEL"];
    // For formations with 4 rows (e.g. 4-3-2-1), add an extra "FW" row
    const labels = [...rowLabels];
    if (parts.length > 3) labels.push("FW");

    parts.forEach((count, i) => {
      for (let j = 0; j < count; j++) {
        const x = ((j + 1) / (count + 1)) * 100;
        const y = 74 - i * 16;
        rows.push({ label: labels[i] || "FW", y: Math.max(y, 6) });
      }
    });

    // Pad or trim to 11
    while (rows.length < 11) rows.push({ label: "FW", y: 10 });
    return rows.slice(0, 11);
  }, [selectedSquad]);

  const confColor = selectedInfo
    ? CONFED_COLORS[selectedInfo.confed] || "#3b82f6"
    : "#3b82f6";

  if (!squads.length) {
    return (
      <div>
        <h2 className="card-title" style={{ marginBottom: 16 }}>
          🌍 Equipos del Mundial 2026
        </h2>
        <div className="skeleton-loader" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>
          🌍 Equipos
        </h2>
        <span className="teams-count">{TEAMS.length} equipos</span>
      </div>

      {/* Group filter tabs */}
      <div className="teams-filter-bar">
        <button
          className={`teams-filter-btn ${!activeGroup ? "teams-filter-active" : ""}`}
          onClick={() => setActiveGroup(null)}
        >
          Todos
        </button>
        {GROUP_LABELS.map((g) => (
          <button
            key={g}
            className={`teams-filter-btn ${activeGroup === g ? "teams-filter-active" : ""}`}
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="teams-search-box">
        <span className="teams-search-icon">🔍</span>
        <input
          className="teams-search-input"
          placeholder="Buscar equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="teams-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* Team cards grid */}
      <div className="teams-grid">
        {filteredTeams.map((t) => {
          const squad = squads.find((s) => s.team === t.name);
          const isSelected = selectedTeam === t.name;
          return (
            <button
              key={t.name}
              className={`team-card-modern ${isSelected ? "team-card-selected" : ""}`}
              onClick={() => setSelectedTeam(isSelected ? null : t.name)}
              style={{
                borderColor: isSelected ? confColor : undefined,
              }}
            >
              <div className="team-card-flag-wrap">
                <FlagImage teamName={t.name} size={44} />
              </div>
              <div className="team-card-modern-body">
                <div className="team-card-modern-name">{t.name}</div>
                <div className="team-card-modern-meta">
                  <span className="team-card-group">Grupo {t.group}</span>
                  {squad?.fifaRank && (
                    <span className="team-card-rank">#{squad.fifaRank}</span>
                  )}
                </div>
              </div>
              <div
                className="team-card-confed-dot"
                style={{
                  background: CONFED_COLORS[t.confed] || "#3b82f6",
                }}
                title={t.confed}
              />
            </button>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="placeholder-page">
          <p className="placeholder-text">No se encontraron equipos</p>
        </div>
      )}

      {/* Team Detail Panel */}
      {selectedTeam && selectedSquad && (
        <div className="team-detail-panel">
          {/* Cover */}
          <div
            className="team-cover"
            style={{
              background: `linear-gradient(135deg, ${confColor}22, ${confColor}11, var(--bg-card))`,
              borderColor: `${confColor}44`,
            }}
          >
            {selectedSquad.stadiumImage && (
              <img
                src={selectedSquad.stadiumImage}
                alt=""
                className="team-cover-bg"
                loading="lazy"
              />
            )}
            <div className="team-cover-content">
              <div className="team-cover-flag">
                <FlagImage teamName={selectedTeam} size={72} />
              </div>
              <div className="team-cover-info">
                <h3 className="team-cover-name">{selectedTeam}</h3>
                <div className="team-cover-tags">
                  {selectedInfo && (
                    <span className="team-cover-tag" style={{ background: `${confColor}33`, color: confColor }}>
                      Grupo {selectedInfo.group}
                    </span>
                  )}
                  {selectedSquad.fifaRank && (
                    <span className="team-cover-tag">FIFA #{selectedSquad.fifaRank}</span>
                  )}
                  {selectedSquad.nickname && (
                    <span className="team-cover-tag">💬 {selectedSquad.nickname}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="team-quick-grid">
            <div className="team-quick-item">
              <span className="team-quick-label">Confederación</span>
              <span className="team-quick-value">{selectedSquad.confederation || "—"}</span>
            </div>
            <div className="team-quick-item">
              <span className="team-quick-label">DT</span>
              <span className="team-quick-value">{selectedSquad.coach}</span>
            </div>
            <div className="team-quick-item">
              <span className="team-quick-label">Formación</span>
              <span className="team-quick-value">{selectedSquad.formation}</span>
            </div>
            <div className="team-quick-item">
              <span className="team-quick-label">Mejor Mundial</span>
              <span className="team-quick-value">{selectedSquad.bestWC || "—"}</span>
            </div>
            <div className="team-quick-item">
              <span className="team-quick-label">🏆 Títulos</span>
              <span className="team-quick-value">{selectedSquad.worldCupTitles ?? 0}</span>
            </div>
            <div className="team-quick-item">
              <span className="team-quick-label">🌍 Mundiales</span>
              <span className="team-quick-value">{selectedSquad.worldCupApps ?? 0}</span>
            </div>
            {selectedSquad.stadium && (
              <div className="team-quick-item" style={{ gridColumn: "1 / -1" }}>
                <span className="team-quick-label">🏟️ Estadio</span>
                <span className="team-quick-value">{selectedSquad.stadium}</span>
              </div>
            )}
          </div>

          {/* Recent form */}
          {recentForm && recentForm.form.length > 0 && (
            <div className="team-section">
              <div className="team-section-title">📊 Forma reciente</div>
              <div className="team-form-row-modern">
                {recentForm.form.map((entry, i) => (
                  <div
                    key={i}
                    className={`team-form-badge-modern team-form-${entry.result.toLowerCase()}`}
                    title={`${entry.result === "W" ? "Ganó" : entry.result === "D" ? "Empató" : "Perdió"} ${entry.score} vs ${entry.opponent}`}
                  >
                    {entry.result}
                  </div>
                ))}
                {recentForm.formString && (
                  <span className="team-form-string-modern">{recentForm.formString}</span>
                )}
              </div>
            </div>
          )}

          {/* Pitch */}
          <div className="team-section">
            <div className="team-section-title">
              ⚽ Alineación ({selectedSquad.formation})
            </div>
            <div className="pitch-modern">
              <div className="pitch-modern-field">
                <div className="pitch-modern-grid">
                  {pitchPositions.map((pos, i) => {
                    const player = selectedSquad.players[i];
                    if (!player) return null;
                    return (
                      <div
                        key={i}
                        className="pitch-modern-player"
                        style={{ left: `${(i === 0 ? 50 : ((i - 1) % 4 === 0 ? 20 : (i - 1) % 4 === 1 ? 40 : (i - 1) % 4 === 2 ? 60 : 80))}%`, top: `${pos.y}%` }}
                      >
                        <div
                          className="pitch-modern-num"
                          style={{ background: getPosColor(player.pos) }}
                        >
                          {player.num}
                        </div>
                        <div className="pitch-modern-pos">{getPosLabel(player.pos)}</div>
                        <div className="pitch-modern-name">{player.name.split(" ").pop()}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="pitch-modern-label">ATAQUE</div>
                <div className="pitch-modern-label" style={{ top: "48%" }}>MEDIO</div>
                <div className="pitch-modern-label" style={{ top: "70%" }}>DEFENSA</div>
              </div>
              {/* Squad list */}
              <div className="pitch-modern-squad">
                <div className="pitch-modern-squad-header">
                  Plantilla ({selectedSquad.players.length})
                </div>
                <div className="pitch-modern-squad-scroll">
                  {[...selectedSquad.players]
                    .sort((a, b) => a.num - b.num)
                    .map((p) => (
                      <div key={p.num} className="pitch-modern-row">
                        <div
                          className="pitch-modern-pos-badge"
                          style={{ background: getPosColor(p.pos) }}
                        >
                          {getPosLabel(p.pos)}
                        </div>
                        <span className="pitch-modern-row-num">{p.num}</span>
                        <span className="pitch-modern-row-name">{p.name}</span>
                        <span className="pitch-modern-row-club">
                          {p.club?.split(" ").slice(-1) || "—"}
                        </span>
                        <span className="pitch-modern-row-caps">{p.caps ?? "—"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Matches */}
          {teamMatches.length > 0 && (
            <div className="team-section">
              <div className="team-section-title">📅 Partidos</div>
              <div className="team-matches-modern">
                {teamMatches.map((m) => {
                  const isHome = m.home_team === selectedTeam;
                  const opponent = isHome ? m.away_team : m.home_team;
                  const score =
                    m.home_score_real !== null
                      ? `${m.home_score_real}–${m.away_score_real}`
                      : null;
                  return (
                    <div key={m.id} className="team-match-modern-row">
                      <div className="team-match-modern-teams">
                        <span className={isHome ? "team-match-highlight" : ""}>
                          <FlagImage teamName={m.home_team} size={20} />
                          <span>{m.home_team}</span>
                        </span>
                        <span className="team-match-modern-vs">vs</span>
                        <span className={!isHome ? "team-match-highlight" : ""}>
                          <FlagImage teamName={m.away_team} size={20} />
                          <span>{m.away_team}</span>
                        </span>
                      </div>
                      <div className="team-match-modern-info">
                        {score ? (
                          <span className="team-match-modern-score">{score}</span>
                        ) : (
                          <span className="team-match-modern-date">
                            {new Date(m.match_date).toLocaleDateString("es", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                        <span className="team-match-modern-group">{m.phase === "groups" ? `Grupo ${m.group_name}` : m.phase.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
