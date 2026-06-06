import { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

type VerifyResult = {
  config: { ok: boolean; tournament_started: boolean; entry_fee: number | null; yape_configured: boolean };
  matches: { total: number; locked: number; with_result: number; ok: boolean };
  entries: { total: number; approved: number; pending: number; ok: boolean };
  predictions: { total: number; ok: boolean };
} | null;

type SimResult = {
  match: { home_team: string; away_team: string; result: string };
  results: { name: string; pred: string; points: number; pass: boolean }[];
} | null;

export default function TestingPanel({ onReload }: { onReload: () => void }) {
  const [verifyResult, setVerifyResult]   = useState<VerifyResult>(null);
  const [simResult, setSimResult]         = useState<SimResult>(null);
  const [verifying, setVerifying]         = useState(false);
  const [resetting, setResetting]         = useState(false);
  const [demoing, setDemoing]             = useState(false);
  const [simulating, setSimulating]       = useState(false);
  const [cleaningUp, setCleaningUp]       = useState(false);
  const [confirmReset, setConfirmReset]   = useState(false);
  const [confirmDemo, setConfirmDemo]     = useState(false);
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [homeReal, setHomeReal]           = useState(1);
  const [awayReal, setAwayReal]           = useState(0);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      setVerifyResult(await api.verifySystem());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al verificar");
    } finally { setVerifying(false); }
  };

  const handleReset = async () => {
    setResetting(true); setConfirmReset(false);
    try {
      const d = await api.resetTournament();
      toast.success(d.message);
      setVerifyResult(null); setSimResult(null);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reiniciar");
    } finally { setResetting(false); }
  };

  const handleDemo = async () => {
    setDemoing(true); setConfirmDemo(false);
    try {
      const d = await api.activateDemo();
      toast.success(d.message);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar demo");
    } finally { setDemoing(false); }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const d = await api.runSimulation(homeReal, awayReal);
      setSimResult(d);
      toast.success(d.message);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error en simulación");
    } finally { setSimulating(false); }
  };

  const handleCleanup = async () => {
    setCleaningUp(true); setConfirmCleanup(false);
    try {
      const d = await api.cleanupDemo();
      toast.success(d.message);
      setSimResult(null);
      await onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al limpiar");
    } finally { setCleaningUp(false); }
  };

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`testing-check-item ${ok ? "ok" : "fail"}`}>
      <span>{ok ? "✅" : "❌"}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="testing-panel">
      <div className="testing-warning">
        ⚠️ <strong>Zona de Testing</strong> — estas acciones modifican datos reales. Úsalas solo para pruebas antes del torneo.
      </div>

      {/* ── 1. VERIFICAR ── */}
      <div className="testing-card">
        <div className="testing-card-header">
          <span className="testing-card-icon">🔍</span>
          <div>
            <h4>Verificar Sistema</h4>
            <p>Estado actual de config, partidos, participantes y predicciones en BD.</p>
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
              <Check ok={!verifyResult.config.tournament_started} label={verifyResult.config.tournament_started ? "⚠ Torneo YA iniciado" : "Torneo no iniciado"} />
            </div>
            <div className="testing-verify-section">
              <span className="testing-verify-label">Partidos</span>
              <Check ok={verifyResult.matches.ok} label={`${verifyResult.matches.total} partidos`} />
              <Check ok={verifyResult.matches.locked === 0} label={`${verifyResult.matches.locked} bloqueados`} />
              <Check ok={verifyResult.matches.with_result === 0} label={`${verifyResult.matches.with_result} con resultado`} />
            </div>
            <div className="testing-verify-section">
              <span className="testing-verify-label">Participantes</span>
              <Check ok={verifyResult.entries.ok} label={`${verifyResult.entries.approved} aprobados`} />
              <Check ok={verifyResult.entries.pending === 0} label={`${verifyResult.entries.pending} pendientes`} />
            </div>
            <div className="testing-verify-section">
              <span className="testing-verify-label">Predicciones</span>
              <Check ok={verifyResult.predictions.ok} label={`${verifyResult.predictions.total} en BD`} />
            </div>
          </div>
        )}
      </div>

      {/* ── 2. SIMULADOR DE PUNTUACIÓN ── */}
      <div className="testing-card testing-card-sim">
        <div className="testing-card-header">
          <span className="testing-card-icon">🧪</span>
          <div>
            <h4>Simulador de Puntuación</h4>
            <p>Crea 4 participantes demo con predicciones fijas (1-0, 2-0, 0-0, 0-1), aplica el resultado real que elijas y verifica que los puntos se calculen correctamente.</p>
          </div>
        </div>

        <div className="testing-sim-config">
          <span className="testing-sim-label">Resultado real del partido de prueba:</span>
          <div className="testing-sim-score">
            <div className="testing-sim-score-field">
              <label>Local</label>
              <input
                type="number"
                min={0}
                max={9}
                value={homeReal}
                onChange={(e) => setHomeReal(Number(e.target.value))}
                className="form-input testing-score-input"
              />
            </div>
            <span className="testing-sim-vs">—</span>
            <div className="testing-sim-score-field">
              <label>Visitante</label>
              <input
                type="number"
                min={0}
                max={9}
                value={awayReal}
                onChange={(e) => setAwayReal(Number(e.target.value))}
                className="form-input testing-score-input"
              />
            </div>
          </div>
        </div>

        {/* Tabla de puntos esperados */}
        <div className="testing-sim-preview">
          <span className="testing-verify-label">Puntos esperados con resultado {homeReal}-{awayReal}:</span>
          <div className="testing-sim-table">
            <div className="testing-sim-row testing-sim-header">
              <span>Participante demo</span>
              <span>Su predicción</span>
              <span>Pts esperados</span>
              <span>Motivo</span>
            </div>
            {[
              { name: "Demo Exacto",  pred: "1-0" },
              { name: "Demo Exceso",  pred: "2-0" },
              { name: "Demo Empate",  pred: "0-0" },
              { name: "Demo Inverso", pred: "0-1" },
            ].map((row) => {
              const [ph, pa] = row.pred.split("-").map(Number);
              const pts = calcPts(ph, pa, homeReal, awayReal);
              const reason = getPtsReason(ph, pa, homeReal, awayReal);
              return (
                <div key={row.name} className={`testing-sim-row ${pts === 5 ? "pts-5" : pts === 3 ? "pts-3" : pts === 2 ? "pts-2" : "pts-0"}`}>
                  <span>{row.name}</span>
                  <span className="testing-pred-badge">{row.pred}</span>
                  <span className="testing-pts-badge">{pts} pts</span>
                  <span className="testing-reason">{reason}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn btn-gold" onClick={handleSimulate} disabled={simulating}>
          {simulating ? "Ejecutando..." : "▶ Ejecutar simulación"}
        </button>

        {/* Resultado real de la simulación */}
        {simResult && (
          <div className="testing-sim-result">
            <div className="testing-sim-result-header">
              <span>✅ Simulación ejecutada</span>
              <span className="testing-sim-match">{simResult.match.home_team} vs {simResult.match.away_team} → <strong>{simResult.match.result}</strong></span>
            </div>
            <div className="testing-sim-table">
              <div className="testing-sim-row testing-sim-header">
                <span>Participante</span>
                <span>Predicción</span>
                <span>Pts obtenidos</span>
                <span>Estado</span>
              </div>
              {simResult.results.map((r) => (
                <div key={r.name} className={`testing-sim-row ${r.points === 5 ? "pts-5" : r.points === 3 ? "pts-3" : r.points === 2 ? "pts-2" : "pts-0"}`}>
                  <span>{r.name}</span>
                  <span className="testing-pred-badge">{r.pred}</span>
                  <span className="testing-pts-badge">{r.points} pts</span>
                  <span>{r.pass ? "✅ OK" : "❌ ERROR"}</span>
                </div>
              ))}
            </div>
            {!confirmCleanup ? (
              <button className="btn btn-outline btn-sm" onClick={() => setConfirmCleanup(true)} disabled={cleaningUp}>
                🗑 Eliminar usuarios demo
              </button>
            ) : (
              <div className="testing-confirm">
                <span>¿Eliminar usuarios demo?</span>
                <button className="btn btn-sm btn-danger" onClick={handleCleanup}>Sí, limpiar</button>
                <button className="btn btn-sm btn-outline" onClick={() => setConfirmCleanup(false)}>Cancelar</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. RESTAURAR TORNEO ── */}
      <div className="testing-card testing-card-danger">
        <div className="testing-card-header">
          <span className="testing-card-icon">🔄</span>
          <div>
            <h4>Restaurar torneo completo</h4>
            <p>Pone <code>tournament_started = false</code>, desbloquea todos los partidos, limpia todos los resultados y resetea puntos a 0.</p>
          </div>
        </div>
        {!confirmReset ? (
          <button className="btn btn-outline btn-danger" onClick={() => setConfirmReset(true)} disabled={resetting}>
            🔄 Restaurar todo
          </button>
        ) : (
          <div className="testing-confirm">
            <span>¿Restaurar torneo y limpiar todos los resultados?</span>
            <button className="btn btn-sm btn-danger" onClick={handleReset} disabled={resetting}>
              {resetting ? "Restaurando..." : "Sí, restaurar"}
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        )}
      </div>

      {/* ── 4. APROBAR PENDIENTES ── */}
      <div className="testing-card testing-card-warning">
        <div className="testing-card-header">
          <span className="testing-card-icon">🎭</span>
          <div>
            <h4>Aprobar entradas pendientes</h4>
            <p>Aprueba automáticamente todas las entradas con pago pendiente para poblar el sistema.</p>
          </div>
        </div>
        {!confirmDemo ? (
          <button className="btn btn-outline" onClick={() => setConfirmDemo(true)} disabled={demoing}>
            🎭 Aprobar todas las pendientes
          </button>
        ) : (
          <div className="testing-confirm">
            <span>¿Aprobar todas las entradas pendientes?</span>
            <button className="btn btn-sm btn-gold" onClick={handleDemo} disabled={demoing}>
              {demoing ? "Aprobando..." : "Sí, aprobar"}
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setConfirmDemo(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── helpers de puntuación (mirror del backend) ──
function calcPts(hp: number, ap: number, hr: number, ar: number): number {
  if (hp === hr && ap === ar) return 5;
  const pr = Math.sign(hp - ap);
  const rr = Math.sign(hr - ar);
  if (pr === 0 && rr === 0) return 2;
  if (pr === rr) return 3;
  return 0;
}

function getPtsReason(hp: number, ap: number, hr: number, ar: number): string {
  if (hp === hr && ap === ar) return "Marcador exacto";
  const pr = Math.sign(hp - ap);
  const rr = Math.sign(hr - ar);
  if (pr === 0 && rr === 0) return "Empate correcto";
  if (pr === rr) return "Ganador correcto";
  return "Sin acierto";
}
