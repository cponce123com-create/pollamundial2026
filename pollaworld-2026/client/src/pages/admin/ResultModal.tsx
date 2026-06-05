import { Match } from "../../lib/api";

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
        <p className="result-modal-match">
          {match.home_flag} {match.home_team} vs {match.away_team}{" "}
          {match.away_flag}
        </p>
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
