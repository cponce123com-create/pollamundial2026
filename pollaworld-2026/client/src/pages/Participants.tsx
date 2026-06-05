import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { api, PoolStats, Participant, Match, Prediction } from "../lib/api";
import { getPlayer } from "../lib/players";
import PdfBoleto from "../components/PdfBoleto";

export default function Participants() {
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUserId, setModalUserId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{
    userName: string;
    userPhone: string;
    playerSlug: string;
    predictions: { prediction: Prediction; match: Match }[];
    allMatches: Match[];
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTab, setModalTab] = useState<"groups" | "elim">("groups");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getPoolStats(),
      api.getParticipants(),
    ])
      .then(([s, p]) => {
        setStats(s);
        setParticipants(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openModal = async (participant: Participant) => {
    setModalUserId(participant.userId);
    setModalLoading(true);
    setModalTab("groups");
    try {
      const [userPreds, matches] = await Promise.all([
        api.getUserPredictions(participant.userId),
        api.getMatches(),
      ]);
      setModalData({
        userName: participant.name,
        userPhone: participant.phone,
        playerSlug: participant.player_slug,
        predictions: userPreds,
        allMatches: matches,
      });
    } catch {
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalUserId(null);
    setModalData(null);
  };

  const handleDownloadPdf = async () => {
    if (!modalData) return;
    setExporting(true);
    try {
      const blob = await pdf(
        <PdfBoleto
          userName={modalData.userName}
          userPhone={modalData.userPhone}
          playerSlug={modalData.playerSlug}
          predictions={modalData.predictions}
          allMatches={modalData.allMatches}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predicciones-" + modalData.userName + "-" + new Date().toISOString().slice(0, 10) + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // pass
    } finally {
      setExporting(false);
    }
  };

  const groupsMatches = modalData?.allMatches.filter((m) => m.phase === "groups") || [];
  const elimMatches = modalData?.allMatches.filter((m) => m.phase !== "groups") || [];

  const predMap = new Map(modalData?.predictions.map((p) => [p.match.id, p.prediction]));

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PHASE_LABELS: Record<string, string> = {
    round_of_32: "Ronda de 32",
    round_of_16: "Octavos",
    quarterfinals: "Cuartos",
    semifinals: "Semis",
    final_3rd: "Tercer Puesto",
    final: "Final",
  };

  if (loading) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando participantes...</p>
      </div>
    );
  }

  const totalApproved = stats?.approvedCount ?? 0;
  const totalPool = stats?.totalPool ?? 0;
  const prizes = stats?.prizes;

  return (
    <div>
      {/* METRIC CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>{"✅"}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold)" }}>
            {totalApproved}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Participantes confirmados
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>{"💰"}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold)" }}>
            S/. {totalPool.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Poza total
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>{"🏆"}</div>
          {prizes ? (
            <>
              <div style={{ fontSize: "0.9rem", color: "var(--gold)", fontWeight: 600 }}>
                1&deg; S/. {prizes.first.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                2&deg; S/. {prizes.second.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                3&deg; S/. {prizes.third.toFixed(2)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Premios por definir
            </div>
          )}
        </div>
      </div>

      {/* PARTICIPANT GRID */}
      <div className="card">
        <h2 className="card-title">{"👥"} Participantes ({participants.length})</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
          className="participant-grid-responsive"
        >
          {participants.map((p) => {
            const player = getPlayer(p.player_slug);
            const maskedPhone =
              p.phone.length >= 7
                ? p.phone.slice(0, 3) + "***" + p.phone.slice(-3)
                : p.phone;

            const displayName = p.ticketNumber > 1
              ? `${p.name} (Ticket ${p.ticketNumber})`
              : p.name;

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 16,
                  cursor: stats?.tournamentStarted ? "pointer" : "default",
                  textAlign: "center",
                  transition: "border-color 0.2s",
                }}
                onClick={() => stats?.tournamentStarted && openModal(p)}
              >
                <div style={{ marginBottom: 4 }}>
                  {player ? (
                    <img
                      src={player.image}
                      alt={player.name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border)",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: "2.5rem" }}>{"❓"}</div>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{displayName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {maskedPhone}
                </div>
                {p.ticketNumber > 1 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: 4 }}>
                    Ticket #{p.ticketNumber}
                  </div>
                )}
                {!stats?.tournamentStarted && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gold)",
                      marginTop: 8,
                      fontStyle: "italic",
                    }}
                  >
                    Las predicciones se revelar&aacute;n cuando inicie el torneo
                  </div>
                )}
              </div>
            );
          })}
          {participants.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 24,
                color: "var(--text-muted)",
              }}
            >
              No hay participantes registrados a&uacute;n.
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalUserId && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
              maxWidth: 600,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {modalLoading ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                Cargando predicciones...
              </p>
            ) : modalData ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--white)", display: "flex", alignItems: "center", gap: 8 }}>
                    {getPlayer(modalData.playerSlug) && (
                      <img
                        src={getPlayer(modalData.playerSlug)!.image}
                        alt={getPlayer(modalData.playerSlug)!.name}
                        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                      />
                    )}
                    {modalData.userName}
                  </h3>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={closeModal}
                  >
                    {"✕"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: 16 }}>
                  <button
                    className={"tab" + (modalTab === "groups" ? " tab-active" : "")}
                    onClick={() => setModalTab("groups")}
                  >
                    Grupos
                  </button>
                  <button
                    className={"tab" + (modalTab === "elim" ? " tab-active" : "")}
                    onClick={() => setModalTab("elim")}
                  >
                    Eliminatoria
                  </button>
                </div>

                {/* Groups tab */}
                {modalTab === "groups" && (
                  <div>
                    {groupsMatches.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        No hay partidos de grupos.
                      </p>
                    ) : (
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Partido</th>
                              <th>Grupo</th>
                              <th>Fecha</th>
                              <th>Pred.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupsMatches.map((m) => {
                              const pred = predMap.get(m.id);
                              return (
                                <tr key={m.id}>
                                  <td>
                                    {m.home_flag} {m.home_team} vs {m.away_team} {" "}
                                    {m.away_flag}
                                  </td>
                                  <td>{m.group_name || "-"}</td>
                                  <td style={{ fontSize: "0.75rem" }}>
                                    {formatDate(m.match_date)}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: 700,
                                      color: "var(--gold)",
                                    }}
                                  >
                                    {pred
                                      ? pred.home_score_pred + " - " + pred.away_score_pred
                                      : "—"}
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

                {/* Eliminatoria tab */}
                {modalTab === "elim" && (
                  <div>
                    {elimMatches.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        Los partidos de eliminaci&oacute;n se definir&aacute;n al
                        finalizar grupos.
                      </p>
                    ) : (
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Fase</th>
                              <th>Partido</th>
                              <th>Fecha</th>
                              <th>Pred.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {elimMatches.map((m) => {
                              const pred = predMap.get(m.id);
                              return (
                                <tr key={m.id}>
                                  <td>{PHASE_LABELS[m.phase] || m.phase}</td>
                                  <td>
                                    {m.home_flag} {m.home_team} vs {m.away_team} {" "}
                                    {m.away_flag}
                                  </td>
                                  <td style={{ fontSize: "0.75rem" }}>
                                    {formatDate(m.match_date)}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: 700,
                                      color: "var(--gold)",
                                    }}
                                  >
                                    {pred
                                      ? pred.home_score_pred + " - " + pred.away_score_pred
                                      : "—"}
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

                {/* Download button */}
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <button
                    className="btn btn-gold"
                    onClick={handleDownloadPdf}
                    disabled={exporting}
                  >
                    {exporting
                      ? "Generando PDF..."
                      : "📥 Descargar predicciones"}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
                No se pudieron cargar las predicciones.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 800px) {
          .participant-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .participant-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
