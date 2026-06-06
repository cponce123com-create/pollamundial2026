import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { api, MatchWithPrediction, PoolConfig, Entry } from "../lib/api";
import { toast } from "sonner";
import { getPlayer } from "../lib/players";
import { FlagImage } from "../lib/flags";
import PdfBoleto from "../components/PdfBoleto";
import { autofillModerate, autofillSmart } from "../lib/predictionsLogic";
import { getTeamDisplayName } from "../lib/teams";
import { useAuth } from "../lib/AuthContext";

type Tab = "groups" | "elimination";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig] = useState<PoolConfig | null>(null);
  const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("groups");
  const [predictions, setPredictions] = useState<Record<string, { home: string; away: string }>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [liveMatchIds, setLiveMatchIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Multi-entry state ──
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [creatingEntry, setCreatingEntry] = useState(false);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // When selectedEntryId changes, load matches + predictions
  useEffect(() => {
    if (selectedEntryId) {
      loadData(selectedEntryId);
    }
  }, [selectedEntryId]);

  const loadEntries = async () => {
    try {
      const data = await api.getEntries();
      setEntries(data);
      if (data.length > 0 && !selectedEntryId) {
        setSelectedEntryId(data[0].id);
      }
    } catch {
      // not logged in
    }
  };

  const loadData = async (entryId: string) => {
    try {
      const [configData, matchData] = await Promise.all([
        api.getPoolConfig(),
        api.getMatchesWithPredictions(entryId),
      ]);
      setConfig(configData);
      setMatches(matchData);

      // Populate predictions state from existing data
      const preds: Record<string, { home: string; away: string }> = {};
      matchData.forEach((m) => {
        if (m.prediction) {
          preds[m.id] = {
            home: String(m.prediction.home_score_pred),
            away: String(m.prediction.away_score_pred),
          };
        }
      });
      setPredictions(preds);
    } catch {
      navigate("/login");
    }
  };

  const handleCreateEntry = useCallback(async () => {
    setCreatingEntry(true);
    try {
      const newEntry = await api.createEntry();
      setEntries((prev) => [...prev, newEntry]);
      setSelectedEntryId(newEntry.id);
      toast.success(`Ticket #${newEntry.ticket_number} creado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear ticket");
    } finally {
      setCreatingEntry(false);
    }
  }, []);

  const checkLiveMatches = async () => {
    try {
      const data = await api.getLiveMatches();
      const liveIds = new Set(data.live.map((m) => m.id));
      setLiveMatchIds(liveIds);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    const interval = setInterval(checkLiveMatches, 30_000);
    checkLiveMatches();
    return () => clearInterval(interval);
  }, []);

  const filteredMatches = useMemo(() => matches.filter((m) =>
    activeTab === "groups" ? m.phase === "groups" : m.phase !== "groups"
  ), [matches, activeTab]);

  const predictionCount = useMemo(
    () => filteredMatches.filter((m) => predictions[m.id]?.home !== undefined).length,
    [filteredMatches, predictions]
  );

  const handlePredictionChange = useCallback((matchId: string, field: "home" | "away", value: string) => {
    const num = parseInt(value, 10);
    if (value !== "" && (isNaN(num) || num < 0 || num > 20)) return;

    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        home: field === "home" ? value : (prev[matchId]?.home ?? ""),
        away: field === "away" ? value : (prev[matchId]?.away ?? ""),
      },
    }));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!selectedEntryId) return;
    setSaving(true);
    setMessage("");
    try {
      const toSave = Object.entries(predictions)
        .filter(([, v]) => v.home !== "" && v.away !== "")
        .map(([matchId, v]) => ({
          match_id: matchId,
          home_score_pred: parseInt(v.home),
          away_score_pred: parseInt(v.away),
        }));

      if (toSave.length === 0) {
        setMessage("No hay predicciones para guardar.");
        return;
      }

      await api.saveBulkPredictions(selectedEntryId, toSave);
      setMessage(`✅ ${toSave.length} predicciones guardadas.`);
      await loadData(selectedEntryId); // Refresh
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Error al guardar"}`);
    } finally {
      setSaving(false);
    }
  }, [selectedEntryId, predictions]);

  const handleUploadProof = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEntryId) return;
    setUploading(true);
    try {
      await api.uploadPaymentProof(selectedEntryId, file);
      // Reload entries to get updated payment_status
      const updatedEntries = await api.getEntries();
      setEntries(updatedEntries);
      toast.success("Comprobante subido. Pendiente de revisión.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedEntryId]);

  const handleGeneratePdf = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      const entryId = selectedEntry?.id;
      if (!entryId) {
        alert("Selecciona un ticket primero.");
        return;
      }
      const matchesWithPreds = await api.getMatchesWithPredictions(entryId);

      // Transform to the format PdfBoleto expects
      const predictionsData = matchesWithPreds
        .filter((m) => m.prediction)
        .map((m) => ({
          prediction: m.prediction!,
          match: m as any,
        }));
      const allMatches = matchesWithPreds.map((m) => m as any);

      const blob = await pdf(
        <PdfBoleto
          userName={user!.name}
          userPhone={user!.phone}
          playerSlug={user!.player_slug}
          predictions={predictionsData}
          allMatches={allMatches}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `predicciones-${user!.name.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al generar PDF");
    } finally {
      setGeneratingPdf(false);
    }
  }, [selectedEntry, user]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (m: MatchWithPrediction) => {
    if (m.is_locked && m.home_score_real !== null) {
      const pred = m.prediction;
      return (
        <span className="badge badge-points">
          {pred ? `${pred.points_earned} pts` : "—"}
        </span>
      );
    }
    if (m.is_locked) {
      return <span className="badge badge-locked">Cerrado</span>;
    }
    if (m.prediction) {
      return <span className="badge badge-predicted">✓</span>;
    }
    return <span className="badge badge-pending">Sin predecir</span>;
  };

  const player = user ? getPlayer(user.player_slug) : null;
  const tournamentStarted = config?.tournament_started;

  return (
    <div className="dashboard">
      {/* LEFT COLUMN */}
      <div className="dashboard-main">
        {/* ── ENTRY SELECTOR ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="entry-selector-row">
            <span className="entry-selector-label">🎫 Tickets:</span>
            <div className="entry-tabs">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  className={`entry-tab ${selectedEntryId === entry.id ? "entry-tab-active" : ""} ${
                    entry.payment_status === "approved"
                      ? "entry-tab-approved"
                      : entry.payment_status === "rejected"
                        ? "entry-tab-rejected"
                        : ""
                  }`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  Ticket {entry.ticket_number}
                  {entry.payment_status === "approved" && " ✅"}
                  {entry.payment_status === "rejected" && " ❌"}
                  {entry.payment_status === "pending" && entry.payment_proof_url && " ⏳"}
                </button>
              ))}
              <button
                className="entry-tab entry-tab-add"
                onClick={handleCreateEntry}
                disabled={creatingEntry}
                title="Crear nuevo ticket"
              >
                {creatingEntry ? "..." : "+"}
              </button>
            </div>
          </div>
          {selectedEntry && (
            <div className="entry-status-row">
              {selectedEntry.payment_status === "approved" ? (
                <span className="badge badge-approved">✅ Pago confirmado — Ticket habilitado</span>
              ) : selectedEntry.payment_status === "rejected" ? (
                <span className="badge badge-rejected">❌ Pago rechazado — Sube un nuevo comprobante</span>
              ) : selectedEntry.payment_proof_url ? (
                <span className="badge badge-pending">⏳ Comprobante en revisión</span>
              ) : (
                <span className="badge badge-pending">💳 Pendiente de pago</span>
              )}
            </div>
          )}
        </div>

        {/* ── PREDICTIONS PANEL (visible for all entries) ── */}
        {selectedEntry ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="dashboard-header">
              <h2>
                Mis Predicciones
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: 8 }}>
                  (Ticket {selectedEntry.ticket_number})
                </span>
              </h2>
              {user && (
                <span className="header-user">
                  {player && (
                    <img
                      src={player.image}
                      alt={player.name}
                    referrerPolicy="no-referrer"
                      className="player-header-img"
                    />
                  )}
                  {user.name}
                </span>
              )}
            </div>

            {tournamentStarted && (
              <div className="alert alert-warning">
                ⚠️ El torneo ya inició. Las predicciones están cerradas.
              </div>
            )}

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === "groups" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("groups")}
              >
                🏟️ Fase de Grupos
              </button>
              <button
                className={`tab ${activeTab === "elimination" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("elimination")}
              >
                🏆 Fase Eliminatoria
              </button>
            </div>

            {/* Progress */}
            <div className="progress-bar-container">
              <div className="progress-label">
                {predictionCount} de {filteredMatches.length} partidos predichos
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${filteredMatches.length ? (predictionCount / filteredMatches.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Autofill Buttons */}
            {!tournamentStarted && filteredMatches.length > 0 && (
              <>
              <div className="autofill-section-title">🧙 Asistente de autollenado</div>
              <div className="autofill-row">
                <button
                  className="btn btn-autofill btn-autofill-luck"
                  onClick={() => setPredictions(autofillModerate(filteredMatches))}
                  title="Llena todos los partidos con resultados 0-1"
                >
                  🎲 Llenar con suerte
                </button>
                <button
                  className="btn btn-autofill btn-autofill-smart"
                  onClick={() => setPredictions(autofillSmart(filteredMatches))}
                  title="Llena todos los partidos según la fuerza de cada selección"
                >
                  🧠 Llenar con lógica
                </button>
              </div>
              </>
            )}

            {/* Matches Grid */}
            {filteredMatches.length === 0 ? (
              <p className="placeholder-text" style={{ padding: 24, textAlign: "center" }}>
                No hay partidos registrados para esta fase aún.
              </p>
            ) : (
              <div className="match-grid">
                {filteredMatches.map((m) => {
                  const pred = predictions[m.id];
                  const locked = m.is_locked || tournamentStarted;

                  return (
                    <div key={m.id} className={`match-card ${m.is_locked ? "match-locked" : ""} ${m.prediction ? "match-predicted" : ""}`}>
                      <div className="match-header">
                        <span className="match-group">{m.group_name ? `Grupo ${m.group_name}` : formatPhase(m.phase)}</span>
                        {getStatusBadge(m)}
                        {liveMatchIds.has(m.id) && (
                          <span className="badge badge-live">🔴 EN VIVO</span>
                        )}
                      </div>

                      <div className="match-teams">
                        <div className="match-team">
                          <FlagImage teamName={m.home_team} size={36} className="match-flag" />
                          <span className="match-name">{getTeamDisplayName(m.home_team)}</span>
                        </div>
                        <span className="match-vs">vs</span>
                        <div className="match-team">
                          <span className="match-name">{getTeamDisplayName(m.away_team)}</span>
                          <FlagImage teamName={m.away_team} size={36} className="match-flag" />
                        </div>
                      </div>

                      <div className="match-date">{formatDate(m.match_date)}</div>

                      {locked ? (
                        <div className="match-prediction-locked">
                          {m.prediction ? (
                            <span className="prediction-saved">
                              {m.prediction.home_score_pred} - {m.prediction.away_score_pred}
                            </span>
                          ) : (
                            <span className="prediction-none">Sin predicción</span>
                          )}
                          {m.home_score_real !== null && (
                            <div className="real-score">
                              Resultado: {m.home_score_real} - {m.away_score_real}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="match-quick-bets">
                            <button
                              className="quick-bet-btn quick-bet-home"
                              onClick={() => {
                                handlePredictionChange(m.id, "home", "1");
                                handlePredictionChange(m.id, "away", "0");
                              }}
                              title="Gana local"
                            >
                              🏠 1-0
                            </button>
                            <button
                              className="quick-bet-btn quick-bet-draw"
                              onClick={() => {
                                handlePredictionChange(m.id, "home", "0");
                                handlePredictionChange(m.id, "away", "0");
                              }}
                              title="Empate"
                            >
                              🤝 0-0
                            </button>
                            <button
                              className="quick-bet-btn quick-bet-away"
                              onClick={() => {
                                handlePredictionChange(m.id, "home", "0");
                                handlePredictionChange(m.id, "away", "1");
                              }}
                              title="Gana visitante"
                            >
                              0-1 🚌
                            </button>
                          </div>
                          <div className="match-prediction-inputs">
                            <input
                              type="number"
                              className="pred-input"
                              min={0}
                              max={20}
                              placeholder="0"
                              value={pred?.home ?? ""}
                              onChange={(e) => handlePredictionChange(m.id, "home", e.target.value)}
                            />
                            <span className="pred-dash">—</span>
                            <input
                              type="number"
                              className="pred-input"
                              min={0}
                              max={20}
                              placeholder="0"
                              value={pred?.away ?? ""}
                              onChange={(e) => handlePredictionChange(m.id, "away", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button */}
            {!tournamentStarted && filteredMatches.length > 0 && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <button className="btn btn-gold btn-block" onClick={handleSaveAll} disabled={saving}>
                  {saving ? "Guardando..." : "💾 Guardar todas mis predicciones"}
                </button>
                {message && (
                  <p className={message.startsWith("✅") ? "msg-success" : "msg-error"} style={{ marginTop: 8 }}>
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── NO ENTRIES MESSAGE ── */          <div className="card" style={{ marginBottom: 16 }}>
            <div className="placeholder-page" style={{ padding: "32px 16px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎫</div>
              <h3 style={{ color: "var(--white)", marginBottom: 8 }}>
                Aún no tienes tickets
              </h3>
              <p className="placeholder-text" style={{ maxWidth: 400, margin: "0 auto 16px" }}>
                Crea tu primer ticket de participación para empezar a hacer tus predicciones.
              </p>
              <button className="btn btn-gold" onClick={handleCreateEntry} disabled={creatingEntry}>
                {creatingEntry ? "Creando..." : "🎫 Crear mi primer ticket"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="dashboard-sidebar">
        {/* Yape Payment Card */}
        <div className="card">
          <h3 className="card-title">💳 Pago Yape</h3>

          {selectedEntry?.payment_status === "approved" ? (
            <div className="payment-approved">
              <span className="badge badge-approved">✓ Pago confirmado</span>
              <p className="placeholder-text" style={{ marginTop: 8 }}>
                Ticket #{selectedEntry.ticket_number} habilitado.
              </p>
            </div>
          ) : (
            <>
              {config?.yape_qr_url && (
                <div className="qr-container">
                  <img src={config.yape_qr_url} alt="QR Yape" className="qr-image" />
                </div>
              )}
              <p className="payment-amount">Monto: S/. {config?.entry_fee ?? 20}.00</p>
              {config?.yape_phone && (
                <p className="payment-phone">📱 {config.yape_phone}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUploadProof}
              />
              <button
                className="btn btn-primary btn-block"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !selectedEntryId}
                style={{ marginTop: 12 }}
              >
                {uploading ? "Subiendo..." : "📎 Subir comprobante de pago"}
              </button>

              {selectedEntry?.payment_proof_url && (
                <div className="proof-preview" style={{ marginTop: 12 }}>
                  <img
                    src={selectedEntry.payment_proof_url}
                    alt="Comprobante"
                    className="proof-thumb"
                    onClick={() => window.open(selectedEntry.payment_proof_url!, "_blank")}
                  />
                  <span className={`badge ${selectedEntry.payment_status === "pending" ? "badge-pending" : "badge-rejected"}`}>
                    {selectedEntry.payment_status === "pending" ? "Pendiente" : "Rechazado"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Export PDF Card */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">📄 Exportar</h3>
          <p className="placeholder-text" style={{ marginBottom: 12 }}>
            Descarga tu boleto oficial con todas tus predicciones.
          </p>
          <button
            className="btn btn-outline btn-block"
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? "Generando..." : "⬇️ Descargar mis predicciones (PDF)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatPhase(phase: string): string {
  const map: Record<string, string> = {
    round_of_32: "Ronda de 32",
    round_of_16: "Octavos",
    quarterfinals: "Cuartos",
    semifinals: "Semifinal",
    final_3rd: "Tercer Puesto",
    final: "Final",
  };
  return map[phase] || phase;
}
