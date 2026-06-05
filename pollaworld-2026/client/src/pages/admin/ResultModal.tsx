import { Match } from "../../lib/api";
import { FlagImage } from "../../lib/flags";
import { getTeamDisplayName } from "../../lib/teams";

interface ResultModalProps {
  match: Match;
  home: string;
  away: string;
  onHomeChange: (v: string) => void;
  onAwayChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function ResultModal({
  match,
  home,
  away,
  onHomeChange,
  onAwayChange,
  onSave,
  onClose,
}: ResultModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content result-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="admin-section-title">Ingresar resultado</h3>
        <div className="result-modal-teams">
          <FlagImage teamName={match.home_team} size={28} />
          <span className="result-modal-team-name">{getTeamDisplayName(match.home_team)}</span>
          <span className="result-modal-vs">vs</span>
          <FlagImage teamName={match.away_team} size={28} />
          <span className="result-modal-team-name">{getTeamDisplayName(match.away_team)}</span>
        </div>
        <div className="result-modal-inputs">
          <input
            className="form-input admin-result-input"
            type="number"
            min={0}
            placeholder="0"
            value={home}
            onChange={(e) => onHomeChange(e.target.value)}
          />
          <span className="result-modal-dash">-</span>
          <input
            className="form-input admin-result-input"
            type="number"
            min={0}
            placeholder="0"
            value={away}
            onChange={(e) => onAwayChange(e.target.value)}
          />
        </div>
        <div className="admin-action-group">
          <button className="btn btn-primary" onClick={onSave}>
            Guardar
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
