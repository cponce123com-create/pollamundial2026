import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { api, User, Match, PoolConfig } from "../lib/api";
import { PdfMassExport } from "../components/PdfBoleto";
import AdminTabs from "./admin/AdminTabs";
import MatchesPanel from "./admin/MatchesPanel";
import PaymentsPanel from "./admin/PaymentsPanel";
import ConfigPanel from "./admin/ConfigPanel";
import ExportPanel from "./admin/ExportPanel";
import ResultModal from "./admin/ResultModal";

type AdminTab = "matches" | "payments" | "config" | "export";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");
  const [loading, setLoading] = useState(true);

  // Payments state
  const [pendingPayments, setPendingPayments] = useState<User[]>([]);
  const [approvedPayments, setApprovedPayments] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Matches state
  const [matches, setMatches] = useState<Match[]>([]);
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
      toast.success("Configuraci\u00f3n guardada");
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
      <div className="card">
        <h2 className="card-title">
          {"\u2699\ufe0f"} Panel de Administraci\u00f3n
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
            pendingPayments={pendingPayments}
            approvedPayments={approvedPayments}
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
