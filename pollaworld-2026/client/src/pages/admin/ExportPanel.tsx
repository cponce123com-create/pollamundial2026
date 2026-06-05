interface ExportPanelProps {
  exporting: boolean;
  exportingCsv: boolean;
  onMassExport: () => void;
  onCsvExport: () => void;
}

export default function ExportPanel({
  exporting,
  exportingCsv,
  onMassExport,
  onCsvExport,
}: ExportPanelProps) {
  return (
    <div>
      <h3 className="admin-section-title">
        Exportaci\u00f3n masiva de predicciones
      </h3>
      <p className="placeholder-text">
        Genera un PDF con todas las predicciones de los usuarios con pago
        aprobado. Cada participante aparecer\u00e1 en una p\u00e1gina separada.
      </p>
      <div className="admin-export-actions">
        <button
          className="btn btn-gold"
          onClick={onMassExport}
          disabled={exporting}
        >
          {exporting
            ? "Generando PDF..."
            : "\ud83d\udce5 Exportar todas las predicciones (PDF masivo)"}
        </button>
        <button
          className="btn btn-outline"
          onClick={onCsvExport}
          disabled={exportingCsv}
        >
          {exportingCsv
            ? "Generando CSV..."
            : "\ud83d\udcca Descargar CSV de participantes"}
        </button>
      </div>
    </div>
  );
}
