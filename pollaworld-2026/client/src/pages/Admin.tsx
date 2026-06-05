import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { api, User, Match, PoolConfig } from "../lib/api";
import { getEmoji } from "../lib/emojis";
import { PdfMassExport } from "../components/PdfBoleto";

type AdminTab = "matches" | "payments" | "config" | "export";

const PHASE_OPTIONS = [
  { value: "groups", label: "Grupos" },
  { value: "round_of_16", label: "Octavos" },
  { value: "quarterfinals", label: "Cuartos" },
  { value: "semifinals", label: "Semis" },
  { value: "final", label: "Final" },
];

const PHASE_LABELS: Record<string, string> = {
  groups: "Grupos",
  round_of_16: "Octavos",
  quarterfinals: "Cuartos",
  semifinals: "Semis",
  final: "Final",
};

const API_BASE = "/api";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");

  // Shared state
  const [loading, setLoading] = useState(true);

  // Payments state
  const [pendingPayments, setPendingPayments] = useState<User[]>([]);
  const [approvedPayments, setApprovedPayments] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Matches state
  const [matches, setMatches] = useState<Match[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    phase: "groups",
    group_name: "",
    home_team: "",
    away_team: "",
    home_flag: "",
    away_flag: "",
    match_date: "",
  });
  const [resultModal, setResultModal] = useState<{
    match: Match;
    home: string;
    away: string;
  } | null>(null);

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

  // Load all data
  const loadAll = async () => {
    try {
      setLoading(true);
      const [pending, approved, users, m, cfg] = await Promise.all([
        api.getPendingPayments().catch(() => [] as User[]),
        api.getApprovedPayments().catch(() => [] as User[]),
        api.getAdminUsers().catch(() => [] as User[]),
        api.getMatches().catch(() => [] as Match[]),
        api.getPoolConfig().catch(() => null as PoolConfig | null),
      ]);
      setPendingPayments(pending);
      setApprovedPayments(approved);
      setAllUsers(users);
      setMatches(m);
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

  // Payment handlers
  const handleApprove = async (userId: string) => {
    try {
      await api.approvePayment(userId);
      toast.success("Pago aprobado");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.rejectPayment(userId, rejectReason || undefined);
      setRejectingId(null);
      setRejectReason("");
      toast.success("Pago rechazado");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al rechazar");
    }
  };

  // Match handlers
  const addMatch = async () => {
    try {
      const res = await fetch(API_BASE + "/admin/matches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      toast.success("Partido agregado");
      setShowAddForm(false);
      setAddForm({
        phase: "groups",
        group_name: "",
        home_team: "",
        away_team: "",
        home_flag: "",
        away_flag: "",
        match_date: "",
      });
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const saveResult = async () => {
    if (!resultModal) return;
    try {
      const res = await fetch(
        API_BASE + "/admin/matches/" + resultModal.match.id + "/result",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            home_score: Number(resultModal.home),
            away_score: Number(resultModal.away),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      toast.success(data.message || "Puntos calculados");
      setResultModal(null);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const toggleLock = async (matchId: string, currentLocked: boolean) => {
    try {
      await fetch(API_BASE + "/admin/matches/" + matchId + "/lock", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: !currentLocked }),
      });
      toast.success(currentLocked ? "Partido desbloqueado" : "Partido bloqueado");
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

  // Config handlers
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
      toast.success("Configuraci\u00f3n guardada");
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  // Export handlers
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
      type RankEntry = {
        user_id: string;
        name: string;
        emoji_id: string;
        total_points: number;
      };
      const rank = (await api.getRanking()) as RankEntry[];
      const approved = await api.getApprovedPayments();
      const rankMap = new Map(rank.map((r) => [r.user_id, r]));
      const sorted = [...rank].sort((a, b) => b.total_points - a.total_points);
      const posMap = new Map(sorted.map((r, i) => [r.user_id, i + 1]));

      const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';

      let csv = "nombre,telefono,emoji,fecha_aprobacion,puntos,posicion\n";
      approved.forEach((u) => {
        const r = rankMap.get(u.id);
        csv +=
          [
            esc(u.name),
            esc(u.phone),
            esc(u.emoji_id),
            esc(
              u.created_at
                ? new Date(u.created_at).toISOString().slice(0, 10)
                : ""
            ),
            r?.total_points ?? 0,
            posMap.get(u.id) ?? "",
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

  // Derived
  const pendingCount = pendingPayments.filter(
    (p) => p.payment_proof_url
  ).length;
  const approvedCount = approvedPayments.length;
  const rejectedCount = allUsers.filter(
    (u) => u.payment_status === "rejected"
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
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">{"\u2699\ufe0f"} Panel de Administraci\u00f3n</h2>

        {/* Admin Tabs */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button
            className={"tab" + (activeTab === "matches" ? " tab-active" : "")}
            onClick={() => setActiveTab("matches")}
          >
            {"\u26bd"} Partidos
          </button>
          <button
            className={"tab" + (activeTab === "payments" ? " tab-active" : "")}
            onClick={() => setActiveTab("payments")}
          >
            {"\ud83d\udcb3"} Pagos
            {pendingCount > 0 && (
              <span className="tab-badge">{pendingCount}</span>
            )}
          </button>
          <button
            className={"tab" + (activeTab === "config" ? " tab-active" : "")}
            onClick={() => setActiveTab("config")}
          >
            {"\u2699\ufe0f"} Configuraci\u00f3n
          </button>
          <button
            className={"tab" + (activeTab === "export" ? " tab-active" : "")}
            onClick={() => setActiveTab("export")}
          >
            {"\ud83d\udcc4"} Exportar
          </button>
        </div>

        {/* TAB 1: MATCHES */}
        {activeTab === "matches" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <h3 style={{ color: "var(--gold)" }}>
                Gesti\u00f3n de Partidos
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? "Cancelar" : "+ Agregar partido"}
                </button>
                {!config?.tournament_started && (
                  <button
                    className="btn btn-gold"
                    style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                    onClick={startTournament}
                  >
                    {"\ud83d\ude80"} Iniciar torneo
                  </button>
                )}
              </div>
            </div>

            {/* Add match form */}
            {showAddForm && (
              <div
                style={{
                  background: "var(--bg-dark)",
                  padding: 16,
                  borderRadius: "var(--radius-sm)",
                  marginBottom: 16,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
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
                        setAddForm({
                          ...addForm,
                          group_name: e.target.value,
                        })
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
                      placeholder="\ud83c\udde7\ud83c\uddf7"
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
                      placeholder="\ud83c\udde6\ud83c\uddf7"
                    />
                  </div>
                  <div
                    className="form-group"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="form-label">Fecha</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={addForm.match_date}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          match_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={addMatch}>
                  Guardar partido
                </button>
              </div>
            )}

            {/* Matches table */}
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
                      <td>
                        {m.home_flag} {m.home_team} vs {m.away_team}{" "}
                        {m.away_flag}
                      </td>
                      <td style={{ fontSize: "0.75rem" }}>
                        {new Date(m.match_date).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
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
                            ? "\ud83d\udd12 Bloqueado"
                            : "\ud83d\udd13 Abierto"}
                        </span>
                      </td>
                      <td>
                        {m.home_score_real !== null &&
                        m.away_score_real !== null ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--gold)",
                            }}
                          >
                            {m.home_score_real} - {m.away_score_real}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "var(--text-muted)",
                              fontStyle: "italic",
                            }}
                          >
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          {!m.home_score_real && (
                            <button
                              className="btn btn-outline"
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.7rem",
                              }}
                              onClick={() =>
                                setResultModal({
                                  match: m,
                                  home: "",
                                  away: "",
                                })
                              }
                            >
                              Ingresar resultado
                            </button>
                          )}
                          <button
                            className="btn btn-outline"
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.7rem",
                            }}
                            onClick={() => toggleLock(m.id, m.is_locked)}
                          >
                            {m.is_locked ? "Desbloquear" : "Bloquear"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {matches.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "var(--text-muted)",
                          padding: 16,
                        }}
                      >
                        No hay partidos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENTS */}
        {activeTab === "payments" && (
          <div>
            {/* Quick stats */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                className="card"
                style={{
                  padding: "12px 20px",
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  {pendingPayments.filter((p) => p.payment_proof_url).length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Pendientes
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: "12px 20px",
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "var(--success)",
                  }}
                >
                  {approvedPayments.length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Aprobados
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: "12px 20px",
                  flex: 1,
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "var(--error)",
                  }}
                >
                  {rejectedCount}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Rechazados
                </div>
              </div>
            </div>

            {/* Pending */}
            <h3 style={{ marginBottom: 12, color: "var(--gold)" }}>
              Pendientes de revisi\u00f3n (
              {pendingPayments.filter((p) => p.payment_proof_url).length})
            </h3>
            {pendingPayments.filter((p) => p.payment_proof_url).length ===
            0 ? (
              <p className="placeholder-text" style={{ marginBottom: 16 }}>
                No hay pagos pendientes.
              </p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Tel\u00e9fono</th>
                      <th>Comprobante</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments
                      .filter((p) => p.payment_proof_url)
                      .map((user) => {
                        const emoji = getEmoji(user.emoji_id);
                        return (
                          <tr key={user.id}>
                            <td>
                              <span
                                className="header-emoji"
                                style={{ fontSize: "1.2rem" }}
                              >
                                {emoji?.emoji}
                              </span>
                              {user.name}
                            </td>
                            <td>{user.phone}</td>
                            <td>
                              <img
                                src={user.payment_proof_url!}
                                alt="Comprobante"
                                className="proof-thumb"
                                style={{
                                  cursor: "pointer",
                                  width: 60,
                                  height: 60,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                                onClick={() =>
                                  setModalImage(user.payment_proof_url!)
                                }
                              />
                            </td>
                            <td>
                              {rejectingId === user.id ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    flexDirection: "column",
                                  }}
                                >
                                  <input
                                    className="form-input"
                                    placeholder="Motivo (opcional)"
                                    value={rejectReason}
                                    onChange={(e) =>
                                      setRejectReason(e.target.value)
                                    }
                                    style={{
                                      fontSize: "0.8rem",
                                      padding: "4px 8px",
                                    }}
                                  />
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button
                                      className="btn btn-primary"
                                      style={{
                                        padding: "4px 10px",
                                        fontSize: "0.75rem",
                                      }}
                                      onClick={() => handleReject(user.id)}
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      className="btn btn-outline"
                                      style={{
                                        padding: "4px 10px",
                                        fontSize: "0.75rem",
                                      }}
                                      onClick={() => setRejectingId(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button
                                    className="btn btn-primary"
                                    style={{
                                      padding: "4px 10px",
                                      fontSize: "0.75rem",
                                    }}
                                    onClick={() => handleApprove(user.id)}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    className="btn btn-outline"
                                    style={{
                                      padding: "4px 10px",
                                      fontSize: "0.75rem",
                                      color: "var(--error)",
                                      borderColor: "var(--error)",
                                    }}
                                    onClick={() => setRejectingId(user.id)}
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Approved */}
            <h3 style={{ marginTop: 24, marginBottom: 12 }}>
              Pagos aprobados ({approvedPayments.length})
            </h3>
            {approvedPayments.length === 0 ? (
              <p className="placeholder-text">No hay pagos aprobados a\u00fan.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Tel\u00e9fono</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedPayments.map((user) => {
                      const emoji = getEmoji(user.emoji_id);
                      return (
                        <tr key={user.id}>
                          <td>
                            <span
                              className="header-emoji"
                              style={{ fontSize: "1.2rem" }}
                            >
                              {emoji?.emoji}
                            </span>
                            {user.name}
                          </td>
                          <td>{user.phone}</td>
                          <td>
                            <span className="badge badge-approved">
                              {"\u2713"} Aprobado
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIG */}
        {activeTab === "config" && (
          <div>
            <h3 style={{ marginBottom: 16, color: "var(--gold)" }}>
              Configuraci\u00f3n de la polla
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Yape QR */}
              <div className="form-group">
                <label className="form-label">C\u00f3digo QR Yape</label>
                {config?.yape_qr_url && (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={config.yape_qr_url}
                      alt="Yape QR"
                      style={{
                        maxWidth: 120,
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setQrFile(e.target.files?.[0] || null)
                  }
                  style={{ color: "var(--text-primary)", marginBottom: 8 }}
                />
                <button
                  className="btn btn-outline"
                  style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  onClick={handleUploadQr}
                  disabled={!qrFile}
                >
                  Subir QR
                </button>
              </div>

              {/* Yape phone */}
              <div className="form-group">
                <label className="form-label">
                  Tel\u00e9fono Yape
                </label>
                <input
                  className="form-input"
                  value={yapePhone}
                  onChange={(e) => setYapePhone(e.target.value)}
                  placeholder="Ej: 999888777"
                />
              </div>

              {/* Entry fee */}
              <div className="form-group">
                <label className="form-label">
                  Monto de inscripci\u00f3n (S/.)
                </label>
                <input
                  className="form-input"
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                />
              </div>

              {/* Prize distribution */}
              <div
                className="form-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label className="form-label">
                  Distribuci\u00f3n de premios (%)
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      1\u00b0 lugar
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      value={prize1}
                      onChange={(e) =>
                        setPrize1(Number(e.target.value))
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      2\u00b0 lugar
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      value={prize2}
                      onChange={(e) =>
                        setPrize2(Number(e.target.value))
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      3\u00b0 lugar
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      value={prize3}
                      onChange={(e) =>
                        setPrize3(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                {prize1 + prize2 + prize3 !== 100 && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--error)",
                      marginTop: 4,
                    }}
                  >
                    La suma debe ser 100% (actual:{" "}
                    {prize1 + prize2 + prize3}%)
                  </p>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={saveConfig}
              disabled={prize1 + prize2 + prize3 !== 100}
              style={{ marginTop: 8 }}
            >
              Guardar configuraci\u00f3n
            </button>

            {/* Live preview */}
            {approvedCount > 0 && entryFee > 0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "var(--bg-dark)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ color: "var(--gold)", marginBottom: 8 }}>
                  Vista previa de premios
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {approvedCount} participantes \u00d7 S/. {entryFee} ={" "}
                  <strong style={{ color: "var(--gold)" }}>
                    S/. {(approvedCount * entryFee).toFixed(2)}
                  </strong>
                </p>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: "0.9rem" }}>
                    {"\ud83e\udd47"} 1\u00b0:{" "}
                    <strong style={{ color: "var(--gold)" }}>
                      S/.{" "}
                      {(
                        (approvedCount * entryFee * prize1) /
                        100
                      ).toFixed(2)}
                    </strong>{" "}
                    ({prize1}%)
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {"\ud83e\udd48"} 2\u00b0:{" "}
                    <strong style={{ color: "var(--gold)" }}>
                      S/.{" "}
                      {(
                        (approvedCount * entryFee * prize2) /
                        100
                      ).toFixed(2)}
                    </strong>{" "}
                    ({prize2}%)
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {"\ud83e\udd49"} 3\u00b0:{" "}
                    <strong style={{ color: "var(--gold)" }}>
                      S/.{" "}
                      {(
                        (approvedCount * entryFee * prize3) /
                        100
                      ).toFixed(2)}
                    </strong>{" "}
                    ({prize3}%)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPORT */}
        {activeTab === "export" && (
          <div>
            <h3 style={{ marginBottom: 12 }}>
              Exportaci\u00f3n masiva de predicciones
            </h3>
            <p className="placeholder-text" style={{ marginBottom: 16 }}>
              Genera un PDF con todas las predicciones de los usuarios con
              pago aprobado. Cada participante aparecer\u00e1 en una p\u00e1gina
              separada.
            </p>
            <div
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <button
                className="btn btn-gold"
                onClick={handleMassExport}
                disabled={exporting}
              >
                {exporting
                  ? "Generando PDF..."
                  : "\ud83d\udce5 Exportar todas las predicciones (PDF masivo)"}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleCsvExport}
                disabled={exportingCsv}
              >
                {exportingCsv
                  ? "Generando CSV..."
                  : "\ud83d\udcca Descargar CSV de participantes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="modal-overlay"
          onClick={() => setModalImage(null)}
        >
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
              style={{ marginTop: 8 }}
              onClick={() => setModalImage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div
          className="modal-overlay"
          onClick={() => setResultModal(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                marginBottom: 16,
                color: "var(--gold)",
              }}
            >
              Ingresar resultado
            </h3>
            <p style={{ marginBottom: 12, fontSize: "0.9rem" }}>
              {resultModal.match.home_flag}{" "}
              {resultModal.match.home_team} vs{" "}
              {resultModal.match.away_team}{" "}
              {resultModal.match.away_flag}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <input
                className="form-input"
                style={{
                  width: 60,
                  textAlign: "center",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
                type="number"
                placeholder="0"
                value={resultModal.home}
                onChange={(e) =>
                  setResultModal({
                    ...resultModal,
                    home: e.target.value,
                  })
                }
              />
              <span
                style={{
                  fontSize: "1.2rem",
                  color: "var(--text-muted)",
                }}
              >
                -
              </span>
              <input
                className="form-input"
                style={{
                  width: 60,
                  textAlign: "center",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
                type="number"
                placeholder="0"
                value={resultModal.away}
                onChange={(e) =>
                  setResultModal({
                    ...resultModal,
                    away: e.target.value,
                  })
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <button className="btn btn-primary" onClick={saveResult}>
                Guardar
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setResultModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
