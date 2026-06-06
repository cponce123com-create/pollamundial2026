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
  whatsappLink?: string;
  onWhatsappLinkChange?: (v: string) => void;
  logoUrl?: string;
  faviconUrl?: string;
  logoFile?: File | null;
  faviconFile?: File | null;
  onLogoFileChange?: (f: File | null) => void;
  onFaviconFileChange?: (f: File | null) => void;
  onUploadLogo?: () => void;
  onUploadFavicon?: () => void;
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
  whatsappLink,
  onWhatsappLinkChange,
  logoUrl,
  faviconUrl,
  logoFile,
  faviconFile,
  onLogoFileChange,
  onFaviconFileChange,
  onUploadLogo,
  onUploadFavicon,
}: ConfigPanelProps) {
  const totalPct = prize1 + prize2 + prize3;

  return (
    <div>
      <h3 className="admin-section-title">Configuración de La Polla</h3>

      <div className="admin-form-grid">
        <div className="form-group">
          <label className="form-label">Código QR Yape</label>
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
          <label className="form-label">Teléfono Yape</label>
          <input
            className="form-input"
            value={yapePhone}
            onChange={(e) => onYapePhoneChange(e.target.value)}
            placeholder="Ej: 999888777"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Monto de inscripción (S/.)
          </label>
          <input
            className="form-input"
            type="number"
            value={entryFee}
            onChange={(e) => onEntryFeeChange(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">📱 Link del grupo de WhatsApp</label>
          <input
            className="form-input"
            value={whatsappLink || ""}
            onChange={(e) => onWhatsappLinkChange?.(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
          />
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
            Se mostrará en el Dashboard como botón "Unirse al grupo"
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Logo de la Polla</label>
          {logoUrl && (
            <div className="admin-qr-preview">
              <img
                src={logoUrl}
                alt="Logo"
                className="admin-qr-img"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onLogoFileChange?.(e.target.files?.[0] || null)}
            className="admin-file-input"
          />
          <button
            className="btn btn-outline"
            onClick={onUploadLogo}
            disabled={!logoFile}
          >
            Subir Logo
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Favicon (icono de pestaña)</label>
          {faviconUrl && (
            <div className="admin-qr-preview">
              <img
                src={faviconUrl}
                alt="Favicon"
                className="admin-qr-img"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFaviconFileChange?.(e.target.files?.[0] || null)}
            className="admin-file-input"
          />
          <button
            className="btn btn-outline"
            onClick={onUploadFavicon}
            disabled={!faviconFile}
          >
            Subir Favicon
          </button>
        </div>

        <div className="form-group admin-full-width">
          <label className="form-label">
            Distribución de premios (%)
          </label>
          <div className="admin-prize-row">
            <div className="admin-prize-field">
              <label className="admin-prize-label">1er lugar</label>
              <input
                className="form-input"
                type="number"
                value={prize1}
                onChange={(e) => onPrize1Change(Number(e.target.value))}
              />
            </div>
            <div className="admin-prize-field">
              <label className="admin-prize-label">2do lugar</label>
              <input
                className="form-input"
                type="number"
                value={prize2}
                onChange={(e) => onPrize2Change(Number(e.target.value))}
              />
            </div>
            <div className="admin-prize-field">
              <label className="admin-prize-label">3er lugar</label>
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
        Guardar configuración
      </button>

      {approvedCount > 0 && entryFee > 0 && (
        <div className="admin-preview-box">
          <h4 className="admin-preview-title">Vista previa de premios</h4>
          <p className="admin-preview-total">
            {approvedCount} participantes x S/. {entryFee} ={" "}
            <strong>S/. {(approvedCount * entryFee).toFixed(2)}</strong>
          </p>
          <div className="admin-preview-prizes">
            <div className="admin-preview-prize">
              🥇 1ro:{" "}
              <strong>
                S/.{" "}
                {((approvedCount * entryFee * prize1) / 100).toFixed(2)}
              </strong>{" "}
              ({prize1}%)
            </div>
            <div className="admin-preview-prize">
              🥈 2do:{" "}
              <strong>
                S/.{" "}
                {((approvedCount * entryFee * prize2) / 100).toFixed(2)}
              </strong>{" "}
              ({prize2}%)
            </div>
            <div className="admin-preview-prize">
              🥉 3ro:{" "}
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
