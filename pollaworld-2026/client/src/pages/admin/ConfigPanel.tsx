import { PoolConfig } from "../../lib/api";

interface ConfigPanelProps {
  config: PoolConfig | null;
  yapePhone: string;
  entryFee: number;
  prize1: number;
  prize2: number;
  prize3: number;
  qrFile: File | null;
  approvedCount: number;
  onYapePhoneChange: (v: string) => void;
  onEntryFeeChange: (v: number) => void;
  onPrize1Change: (v: number) => void;
  onPrize2Change: (v: number) => void;
  onPrize3Change: (v: number) => void;
  onQrFileChange: (f: File | null) => void;
  onSaveConfig: () => void;
  onUploadQr: () => void;
}

export default function ConfigPanel({
  config,
  yapePhone,
  entryFee,
  prize1,
  prize2,
  prize3,
  qrFile,
  approvedCount,
  onYapePhoneChange,
  onEntryFeeChange,
  onPrize1Change,
  onPrize2Change,
  onPrize3Change,
  onQrFileChange,
  onSaveConfig,
  onUploadQr,
}: ConfigPanelProps) {
  const totalPct = prize1 + prize2 + prize3;

  return (
    <div>
      <h3 className="admin-section-title">Configuraci\u00f3n de la polla</h3>

      <div className="admin-form-grid">
        <div className="form-group">
          <label className="form-label">C\u00f3digo QR Yape</label>
          {config?.yape_qr_url && (
            <div className="admin-qr-preview">
              <img
                src={config.yape_qr_url}
                alt="Yape QR"
                className="admin-qr-img"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onQrFileChange(e.target.files?.[0] || null)}
            className="admin-file-input"
          />
          <button
            className="btn btn-outline"
            onClick={onUploadQr}
            disabled={!qrFile}
          >
            Subir QR
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Tel\u00e9fono Yape</label>
          <input
            className="form-input"
            value={yapePhone}
            onChange={(e) => onYapePhoneChange(e.target.value)}
            placeholder="Ej: 999888777"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Monto de inscripci\u00f3n (S/.)
          </label>
          <input
            className="form-input"
            type="number"
            value={entryFee}
            onChange={(e) => onEntryFeeChange(Number(e.target.value))}
          />
        </div>

        <div className="form-group admin-full-width">
          <label className="form-label">
            Distribuci\u00f3n de premios (%)
          </label>
          <div className="admin-prize-row">
            <div className="admin-prize-field">
              <label className="admin-prize-label">1\u00b0 lugar</label>
              <input
                className="form-input"
                type="number"
                value={prize1}
                onChange={(e) => onPrize1Change(Number(e.target.value))}
              />
            </div>
            <div className="admin-prize-field">
              <label className="admin-prize-label">2\u00b0 lugar</label>
              <input
                className="form-input"
                type="number"
                value={prize2}
                onChange={(e) => onPrize2Change(Number(e.target.value))}
              />
            </div>
            <div className="admin-prize-field">
              <label className="admin-prize-label">3\u00b0 lugar</label>
              <input
                className="form-input"
                type="number"
                value={prize3}
                onChange={(e) => onPrize3Change(Number(e.target.value))}
              />
            </div>
          </div>
          {totalPct !== 100 && (
            <p className="admin-prize-error">
              La suma debe ser 100% (actual: {totalPct}%)
            </p>
          )}
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={onSaveConfig}
        disabled={totalPct !== 100}
      >
        Guardar configuraci\u00f3n
      </button>

      {approvedCount > 0 && entryFee > 0 && (
        <div className="admin-preview-box">
          <h4 className="admin-preview-title">Vista previa de premios</h4>
          <p className="admin-preview-total">
            {approvedCount} participantes \u00d7 S/. {entryFee} ={" "}
            <strong>S/. {(approvedCount * entryFee).toFixed(2)}</strong>
          </p>
          <div className="admin-preview-prizes">
            <div className="admin-preview-prize">
              {"\ud83e\udd47"} 1\u00b0:{" "}
              <strong>
                S/.{" "}
                {((approvedCount * entryFee * prize1) / 100).toFixed(2)}
              </strong>{" "}
              ({prize1}%)
            </div>
            <div className="admin-preview-prize">
              {"\ud83e\udd48"} 2\u00b0:{" "}
              <strong>
                S/.{" "}
                {((approvedCount * entryFee * prize2) / 100).toFixed(2)}
              </strong>{" "}
              ({prize2}%)
            </div>
            <div className="admin-preview-prize">
              {"\ud83e\udd49"} 3\u00b0:{" "}
              <strong>
                S/.{" "}
                {((approvedCount * entryFee * prize3) / 100).toFixed(2)}
              </strong>{" "}
              ({prize3}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
