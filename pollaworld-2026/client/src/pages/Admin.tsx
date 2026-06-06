import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { api, User, Entry, Match, PoolConfig, RankingEntry } from "../lib/api";
import { PdfMassExport } from "../components/PdfBoleto";
import AdminTabs from "./admin/AdminTabs";
import MatchesPanel from "./admin/MatchesPanel";
import PaymentsPanel from "./admin/PaymentsPanel";
import ConfigPanel from "./admin/ConfigPanel";
import ExportPanel from "./admin/ExportPanel";
import TestingPanel from "./admin/TestingPanel";
import ResultModal from "./admin/ResultModal";
import { PLAYERS } from "../lib/players";

type AdminTab = "matches" | "payments" | "config" | "export" | "players" | "testing";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");
  const [loading, setLoading] = useState(true);

  // Payments state (now entries)
  const [pendingEntries, setPendingEntries] = useState<Entry[]>([]);
  const [approvedEntries, setApprovedEntries] = useState<Entry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Matches state
  const [matches, setMatches] = useState<Match[]>([]);
  const [resultModal, setResultModal] = useState<{
    match: Match;
    home: string;
    away: string;
  } | null>(null);

  // Players state
  const [playerCustomNames, setPlayerCustomNames] = useState<Record<string, string>>({});
  const [playerEditSlug, setPlayerEditSlug] = useState<string | null>(null);
  const [playerEditName, setPlayerEditName] = useState("");
  const [playersSaved, setPlayersSaved] = useState(false);

  // Config state
  const [config, setConfig] = useState<PoolConfig | null>(null);
  const [yapePhone, setYapePhone] = useState("");
  const [entryFee, setEntryFee] = useState(0);
  const [prize1, setPrize1] = useState(50);
  const [prize2, setPrize2] = useState(30);
  const [prize3, setPrize3] = useState(20);
  const [qrFile, setQrFile] = useState<File | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pending, approved, users, entries, m, cfg, players] = await Promise.all([
        api.getAdminPendingEntries().catch(() => [] as Entry[]),
        api.getAdminApprovedEntries().catch(() => [] as Entry[]),
        api.getAdminUsers().catch(() => [] as User[]),
        api.getAdminEntries().catch(() => [] as Entry[]),
        api.getMatches().catch(() => [] as Match[]),
        api.getPoolConfig().catch(() => null as PoolConfig | null),
        api.getAdminPlayers().catch(() => ({ customNames: {} as Record<string, string> })),
      ]);
      setPendingEntries(pending);
      setApprovedEntries(approved);
      setAllUsers(users);
      setAllEntries(entries);
      setMatches(m);
      setPlayerCustomNames(players.customNames);
      setPlayersSaved(false);
      if (cfg) {
        setConfig(cfg);
        setYapePhone(cfg.yape_phone || "");
        setEntryFee(cfg.entry_fee);
        setPrize1(cfg.prize_1st_pct);
        setPrize2(cfg.prize_2nd_pct);
        setPrize3(cfg.prize_3rd_pct);
      }
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ── Match handlers ──
  const saveResult = async () => {
    if (!resultModal) return;
    try {
      const data = await api.saveMatchResult(
        resultModal.match.id,
        Number(resultModal.home),
        Number(resultModal.away)
      );
      toast.success(data.message || "Puntos calculados");
      setResultModal(null);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const startTournament = async () => {
    try {
      await api.updatePoolConfig({ tournament_started: true });
      toast.success("Torneo iniciado");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  // ── Config handlers ──
  const handleUploadQr = async () => {
    if (!qrFile) return;
    try {
      const data = await api.uploadYapeQr(qrFile);
      toast.success(data.message || "QR subido");
      setQrFile(null);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const saveConfig = async () => {
    try {
      await api.updatePoolConfig({
        yape_phone: yapePhone || null,
        entry_fee: entryFee,
        prize_1st_pct: prize1,
        prize_2nd_pct: prize2,
        prize_3rd_pct: prize3,
      });
      toast.success("Configuración guardada");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  // ── Export handlers ──
  const handleMassExport = async () => {
    setExporting(true);
    try {
      const data = await api.getExportData();
      const blob = await pdf(<PdfMassExport data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "predicciones-masivas-" + new Date().toISOString().slice(0, 10) + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF generado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const handleCsvExport = async () => {
    setExportingCsv(true);
    try {
      const rank = (await api.getRanking()) as RankingEntry[];
      const approved = await api.getAdminApprovedEntries();
      const users = await api.getAdminUsers();
      const userMap = new Map(users.map((u) => [u.id, u]));
      const rankMap = new Map(rank.map((r) => [r.entryId, r]));
      const sorted = [...rank].sort((a, b) => b.totalPoints - a.totalPoints);
      const posMap = new Map(sorted.map((r, i) => [r.entryId, i + 1]));

      const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';

      let csv = "nombre,telefono,jugador,ticket,fecha_aprobacion,puntos,posicion\n";
      approved.forEach((entry) => {
        const user = userMap.get(entry.user_id);
        if (!user) return;
        const r = rankMap.get(entry.id);
        csv +=
          [
            esc(user.name),
            esc(user.phone),
            esc(user.player_slug),
            entry.ticket_number,
            esc(
              entry.created_at
                ? new Date(entry.created_at).toISOString().slice(0, 10)
                : ""
            ),
            r?.totalPoints ?? 0,
            posMap.get(entry.id) ?? "",
          ].join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "participantes-" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV descargado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al exportar CSV");
    } finally {
      setExportingCsv(false);
    }
  };

  // ── Players handlers ──
  const savePlayers = async () => {
    try {
      const data = await api.saveAdminPlayers(playerCustomNames);
      toast.success(data.message || "Nombres guardados");
      setPlayersSaved(true);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar nombres");
    }
  };

  const startEditPlayer = (slug: string, name: string) => {
    setPlayerEditSlug(slug);
    setPlayerEditName(name);
  };

  const saveEditPlayer = () => {
    if (!playerEditSlug) return;
    const updated = { ...playerCustomNames, [playerEditSlug]: playerEditName };
    setPlayerCustomNames(updated);
    setPlayerEditSlug(null);
    setPlayerEditName("");
    setPlayersSaved(false);
  };

  const cancelEditPlayer = () => {
    setPlayerEditSlug(null);
    setPlayerEditName("");
  };

  const clearCustomName = (slug: string) => {
    const updated = { ...playerCustomNames };
    delete updated[slug];
    setPlayerCustomNames(updated);
    setPlayersSaved(false);
  };

  // Derived
  const pendingWithProof = pendingEntries.filter((e) => e.payment_proof_url);
  const pendingCount = pendingWithProof.length;
  const approvedCount = approvedEntries.length;
  const rejectedCount = allEntries.filter(
    (e) => e.payment_status === "rejected"
  ).length;

  if (loading) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando panel admin...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">
          ⚙️ Panel de Administración
        </h2>

        <AdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingCount}
        />

        {activeTab === "matches" && (
          <MatchesPanel
            matches={matches}
            config={config}
            onStartTournament={startTournament}
            onReload={loadAll}
            onOpenResultModal={(match) =>
              setResultModal({ match, home: "", away: "" })
            }
          />
        )}

        {activeTab === "payments" && (
          <PaymentsPanel
            pendingEntries={pendingEntries}
            approvedEntries={approvedEntries}
            allUsers={allUsers}
            rejectedCount={rejectedCount}
            onReload={loadAll}
            onOpenImage={setModalImage}
          />
        )}

        {activeTab === "config" && (
          <ConfigPanel
            config={config}
            yapePhone={yapePhone}
            entryFee={entryFee}
            prize1={prize1}
            prize2={prize2}
            prize3={prize3}
            qrFile={qrFile}
            approvedCount={approvedCount}
            onYapePhoneChange={setYapePhone}
            onEntryFeeChange={setEntryFee}
            onPrize1Change={setPrize1}
            onPrize2Change={setPrize2}
            onPrize3Change={setPrize3}
            onQrFileChange={setQrFile}
            onSaveConfig={saveConfig}
            onUploadQr={handleUploadQr}
          />
        )}

        {activeTab === "export" && (
          <ExportPanel
            exporting={exporting}
            exportingCsv={exportingCsv}
            onMassExport={handleMassExport}
            onCsvExport={handleCsvExport}
          />
        )}

        {activeTab === "testing" && (
          <TestingPanel onReload={loadAll} />
        )}

        {activeTab === "players" && (
          <div className="players-panel">
            <div className="players-panel-header">
              <h3>🏷️ Editar Nombres de Jugadores</h3>
              {!playersSaved && (
                <button className="btn btn-primary" onClick={savePlayers}>
                  💾 Guardar Cambios
                </button>
              )}
              {playersSaved && (
                <span className="badge badge-success">✓ Guardado</span>
              )}
            </div>
            <p className="text-muted">
              Personaliza los nombres de los personajes que se mostrarán en el registro y perfil de usuarios.
            </p>
            <div className="player-edit-grid">
              {PLAYERS.map((player) => {
                const currentName = playerCustomNames[player.id] || player.name;
                const isEditing = playerEditSlug === player.id;
                const hasCustom = playerCustomNames[player.id] !== undefined;
                return (
                  <div key={player.id} className={`player-edit-card ${hasCustom ? "has-custom" : ""}`}>
                    <img
                      src={player.image}
                      alt={player.name}
                      className="player-edit-img"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    {isEditing ? (
                      <div className="player-edit-form">
                        <input
                          className="form-input player-edit-input"
                          type="text"
                          value={playerEditName}
                          onChange={(e) => setPlayerEditName(e.target.value)}
                          autoFocus
                        />
                        <div className="player-edit-actions">
                          <button className="btn btn-sm btn-primary" onClick={saveEditPlayer}>
                            ✓
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={cancelEditPlayer}>
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="player-edit-info">
                        <span className="player-edit-name">{currentName}</span>
                        {hasCustom && <span className="player-edit-badge">Editado</span>}
                        <div className="player-edit-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => startEditPlayer(player.id, currentName)}
                          >
                            ✏️
                          </button>
                          {hasCustom && (
                            <button
                              className="btn btn-sm btn-outline btn-danger"
                              onClick={() => clearCustomName(player.id)}
                            >
                              ↺
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Comprobante"
              className="modal-image"
            />
            <button
              className="btn btn-outline"
              onClick={() => setModalImage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <ResultModal
          match={resultModal.match}
          home={resultModal.home}
          away={resultModal.away}
          onHomeChange={(v) =>
            setResultModal({ ...resultModal, home: v })
          }
          onAwayChange={(v) =>
            setResultModal({ ...resultModal, away: v })
          }
          onSave={saveResult}
          onClose={() => setResultModal(null)}
        />
      )}
    </div>
  );
}
