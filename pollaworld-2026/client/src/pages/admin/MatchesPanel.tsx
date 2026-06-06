import { useState } from "react";
import { Match, PoolConfig, api } from "../../lib/api";
import { FlagImage } from "../../lib/flags";
import { getTeamDisplayName } from "../../lib/teams";

const PHASE_OPTIONS = [
  { value: "groups", label: "Grupos" },
  { value: "round_of_32", label: "Ronda de 32" },
  { value: "round_of_16", label: "Octavos" },
  { value: "quarterfinals", label: "Cuartos" },
  { value: "semifinals", label: "Semis" },
  { value: "final_3rd", label: "Tercer Puesto" },
  { value: "final", label: "Final" },
];

const PHASE_LABELS: Record<string, string> = {
  groups: "Grupos",
  round_of_32: "Ronda de 32",
  round_of_16: "Octavos",
  quarterfinals: "Cuartos",
  semifinals: "Semis",
  final_3rd: "Tercer Puesto",
  final: "Final",
};

interface MatchesPanelProps {
  matches: Match[];
  config: PoolConfig | null;
  onStartTournament: () => void;
  onReload: () => void;
  onOpenResultModal: (match: Match) => void;
}

const EMPTY_FORM = {
  phase: "groups",
  group_name: "",
  home_team: "",
  away_team: "",
  home_flag: "",
  away_flag: "",
  match_date: "",
};

export default function MatchesPanel({
  matches,
  config,
  onStartTournament,
  onReload,
  onOpenResultModal,
}: MatchesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);

  const handleAdd = async () => {
    try {
      await api.createMatch(addForm);
      setShowAddForm(false);
      setAddForm(EMPTY_FORM);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLock = async (matchId: string, currentLocked: boolean) => {
    try {
      await api.toggleLock(matchId, !currentLocked);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3 className="admin-section-title">Gestión de Partidos</h3>
        <div className="admin-action-group">
          <button
            className="btn btn-outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancelar" : "+ Agregar partido"}
          </button>
          {!config?.tournament_started && (
            <button className="btn btn-gold" onClick={onStartTournament}>
              {"🚀"} Iniciar torneo
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="admin-inline-form">
          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Fase</label>
              <select
                className="form-input"
                value={addForm.phase}
                onChange={(e) =>
                  setAddForm({ ...addForm, phase: e.target.value })
                }
              >
                {PHASE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grupo</label>
              <input
                className="form-input"
                value={addForm.group_name}
                onChange={(e) =>
                  setAddForm({ ...addForm, group_name: e.target.value })
                }
                placeholder="Ej: A"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Equipo local</label>
              <input
                className="form-input"
                value={addForm.home_team}
                onChange={(e) =>
                  setAddForm({ ...addForm, home_team: e.target.value })
                }
                placeholder="Ej: Brasil"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bandera local</label>
              <input
                className="form-input"
                value={addForm.home_flag}
                onChange={(e) =>
                  setAddForm({ ...addForm, home_flag: e.target.value })
                }
                placeholder="🇧🇷"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Equipo visitante</label>
              <input
                className="form-input"
                value={addForm.away_team}
                onChange={(e) =>
                  setAddForm({ ...addForm, away_team: e.target.value })
                }
                placeholder="Ej: Argentina"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bandera visitante</label>
              <input
                className="form-input"
                value={addForm.away_flag}
                onChange={(e) =>
                  setAddForm({ ...addForm, away_flag: e.target.value })
                }
                placeholder="🇦🇷"
              />
            </div>
            <div className="form-group admin-full-width">
              <label className="form-label">Fecha</label>
              <input
                className="form-input"
                type="datetime-local"
                value={addForm.match_date}
                onChange={(e) =>
                  setAddForm({ ...addForm, match_date: e.target.value })
                }
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            Guardar partido
          </button>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Grupo</th>
              <th>Equipos</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{PHASE_LABELS[m.phase] || m.phase}</td>
                <td>{m.group_name || "-"}</td>
                <td className="admin-match-teams">
                  <FlagImage teamName={m.home_team} size={20} />
                  <span className="admin-match-name">{getTeamDisplayName(m.home_team)}</span>
                  <span className="admin-match-vs">vs</span>
                  <FlagImage teamName={m.away_team} size={20} />
                  <span className="admin-match-name">{getTeamDisplayName(m.away_team)}</span>
                </td>
                <td className="admin-date-cell">
                  {new Date(m.match_date).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Lima",
                  })}
                </td>
                <td>
                  <span
                    className={
                      "badge " +
                      (m.is_locked ? "badge-locked" : "badge-approved")
                    }
                  >
                    {m.is_locked
                      ? "🔒 Bloqueado"
                      : "🔓 Abierto"}
                  </span>
                </td>
                <td>
                  {m.is_locked && m.home_score_real !== null && m.away_score_real !== null ? (
                    <span className="admin-result-display">
                      {m.home_score_real} - {m.away_score_real}
                    </span>
                  ) : (
                    <span className="admin-result-pending">Pendiente</span>
                  )}
                </td>
                <td>
                  <div className="admin-action-group">
                    {!m.is_locked && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenResultModal(m)}
                      >
                        Ingresar resultado
                      </button>
                    )}
                    {m.is_locked && m.home_score_real !== null && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenResultModal(m)}
                      >
                        Editar resultado
                      </button>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleLock(m.id, m.is_locked)}
                    >
                      {m.is_locked ? "Desbloquear" : "Bloquear"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty-row">
                  No hay partidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
