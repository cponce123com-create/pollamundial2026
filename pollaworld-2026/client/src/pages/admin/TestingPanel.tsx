import { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

type VerifyResult = {
  config: { ok: boolean; tournament_started: boolean; entry_fee: number | null; yape_configured: boolean };
  matches: { total: number; locked: number; with_result: number; ok: boolean };
  entries: { total: number; approved: number; pending: number; ok: boolean };
  predictions: { total: number; ok: boolean };
} | null;

export default function TestingPanel({ onReload }: { onReload: () => void }) {
  const [verifyResult, setVerifyResult] = useState<VerifyResult>(null);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [demoing, setDemoing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await api.verifySystem();
      setVerifyResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setConfirmReset(false);
    try {
      const data = await api.resetTournament();
      toast.success(data.message);
      setVerifyResult(null);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reiniciar");
    } finally {
      setResetting(false);
    }
  };

  const handleDemo = async () => {
    setDemoing(true);
    setConfirmDemo(false);
    try {
      const data = await api.activateDemo();
      toast.success(data.message);
      setVerifyResult(null);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar demo");
    } finally {
      setDemoing(false);
    }
  };

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`testing-check-item ${ok ? "ok" : "fail"}`}>
      <span className="testing-check-icon">{ok ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="testing-panel">
      <div className="testing-warning">
        ⚠️ <strong>Zona de Testing</strong> — estas acciones modifican datos reales. Úsalas solo para pruebas.
      </div>

      <div className="testing-actions">

        {/* Verificar sistema */}
        <div className="testing-card">
          <div className="testing-card-header">
            <span className="testing-card-icon">🔍</span>
            <div>
              <h4>Verificar Sistema</h4>
              <p>Muestra el estado actual de config, partidos, entradas y predicciones.</p>
            </div>
          </div>
          <button className="btn btn-outline" onClick={handleVerify} disabled={verifying}>
            {verifying ? "Verificando..." : "🔍 Verificar ahora"}
          </button>

          {verifyResult && (
            <div className="testing-verify-result">
              <div className="testing-verify-section">
                <span className="testing-verify-label">Configuración</span>
                <Check ok={verifyResult.config.ok} label="Config cargada" />
                <Check ok={verifyResult.config.yape_configured} label="Yape configurado" />
                <Check ok={verifyResult.config.entry_fee !== null} label={`Cuota: S/. ${verifyResult.config.entry_fee ?? "?"}`} />
                <Check ok={!verifyResult.config.tournament_started} label={verifyResult.config.tournament_started ? "Torneo YA iniciado" : "Torneo no iniciado (abierto)"} />
              </div>
              <div className="testing-verify-section">
                <span className="testing-verify-label">Partidos</span>
                <Check ok={verifyResult.matches.ok} label={`${verifyResult.matches.total} partidos cargados`} />
                <Check ok={verifyResult.matches.locked >= 0} label={`${verifyResult.matches.locked} bloqueados`} />
                <Check ok={verifyResult.matches.with_result >= 0} label={`${verifyResult.matches.with_result} con resultado`} />
              </div>
              <div className="testing-verify-section">
                <span className="testing-verify-label">Participantes</span>
                <Check ok={verifyResult.entries.ok} label={`${verifyResult.entries.approved} aprobados`} />
                <Check ok={true} label={`${verifyResult.entries.pending} pendientes`} />
              </div>
              <div className="testing-verify-section">
                <span className="testing-verify-label">Predicciones</span>
                <Check ok={verifyResult.predictions.ok} label={`${verifyResult.predictions.total} predicciones en BD`} />
              </div>
            </div>
          )}
        </div>

        {/* Iniciar / Restaurar torneo */}
        <div className="testing-card testing-card-danger">
          <div className="testing-card-header">
            <span className="testing-card-icon">🔄</span>
            <div>
              <h4>Restaurar inicio del torneo</h4>
              <p>Pone <code>tournament_started = false</code> y desbloquea todos los partidos. Los usuarios podrán volver a editar predicciones.</p>
            </div>
          </div>
          {!confirmReset ? (
            <button className="btn btn-outline btn-danger" onClick={() => setConfirmReset(true)} disabled={resetting}>
              🔄 Restaurar torneo
            </button>
          ) : (
            <div className="testing-confirm">
              <span>¿Confirmar restauración?</span>
              <button className="btn btn-sm btn-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? "Restaurando..." : "Sí, restaurar"}
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Activar demo */}
        <div className="testing-card testing-card-warning">
          <div className="testing-card-header">
            <span className="testing-card-icon">🎭</span>
            <div>
              <h4>Activar datos demo</h4>
              <p>Aprueba automáticamente todas las entradas pendientes. Útil para poblar el sistema y probar el ranking.</p>
            </div>
          </div>
          {!confirmDemo ? (
            <button className="btn btn-outline" onClick={() => setConfirmDemo(true)} disabled={demoing}>
              🎭 Aprobar entradas pendientes
            </button>
          ) : (
            <div className="testing-confirm">
              <span>¿Aprobar todas las entradas pendientes?</span>
              <button className="btn btn-sm btn-gold" onClick={handleDemo} disabled={demoing}>
                {demoing ? "Aprobando..." : "Sí, aprobar"}
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setConfirmDemo(false)}>
                Cancelar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
