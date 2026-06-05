import { useState } from "react";
import { Entry, User, api } from "../../lib/api";
import { getPlayer } from "../../lib/players";

interface PaymentsPanelProps {
  pendingEntries: Entry[];
  approvedEntries: Entry[];
  allUsers: User[];
  rejectedCount: number;
  onReload: () => void;
  onOpenImage: (url: string) => void;
}

export default function PaymentsPanel({
  pendingEntries,
  approvedEntries,
  allUsers,
  rejectedCount,
  onReload,
  onOpenImage,
}: PaymentsPanelProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));
  const pendingWithProof = pendingEntries.filter((e) => e.payment_proof_url);

  const handleApprove = async (entryId: string) => {
    try {
      await api.approveEntry(entryId);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (entryId: string) => {
    try {
      await api.rejectEntry(entryId, rejectReason || undefined);
      setRejectingId(null);
      setRejectReason("");
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const getUserDisplay = (entry: Entry): { name: string; playerImg: string | null } => {
    const user = userMap.get(entry.user_id);
    if (!user) return { name: `Usuario #${entry.user_id.slice(0, 6)}`, playerImg: null };
    const name = entry.ticket_number > 1
      ? `${user.name} (Ticket ${entry.ticket_number})`
      : user.name;
    const player = getPlayer(user.player_slug);
    return { name, playerImg: player?.image || null };
  };

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stats-card">
          <div className="admin-stats-value admin-stats-gold">
            {pendingWithProof.length}
          </div>
          <div className="admin-stats-label">Pendientes</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value admin-stats-success">
            {approvedEntries.length}
          </div>
          <div className="admin-stats-label">Aprobados</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value admin-stats-error">
            {rejectedCount}
          </div>
          <div className="admin-stats-label">Rechazados</div>
        </div>
      </div>

      <h3 className="admin-section-title">
        Pendientes de revisión ({pendingWithProof.length})
      </h3>

      {pendingWithProof.length === 0 ? (
        <p className="placeholder-text">No hay pagos pendientes.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Ticket</th>
                <th>Teléfono</th>
                <th>Comprobante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithProof.map((entry) => {
                const { name, playerImg } = getUserDisplay(entry);
                const user = userMap.get(entry.user_id);
                return (
                  <tr key={entry.id}>
                    <td>
                      {playerImg ? (
                        <img
                          src={playerImg}
                          alt=""
                          className="admin-user-emoji"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                            verticalAlign: "middle",
                            marginRight: 4,
                          }}
                        />
                      ) : (
                        <span className="admin-user-emoji">{"❓"}</span>
                      )}
                      {name}
                    </td>
                    <td>
                      <span className="badge badge-pending" style={{ fontSize: "0.75rem" }}>
                        #{entry.ticket_number}
                      </span>
                    </td>
                    <td>{user?.phone || "—"}</td>
                    <td>
                      <img
                        src={entry.payment_proof_url!}
                        alt="Comprobante"
                        className="proof-thumb"
                        onClick={() => onOpenImage(entry.payment_proof_url!)}
                      />
                    </td>
                    <td>
                      {rejectingId === entry.id ? (
                        <div className="admin-payment-actions">
                          <input
                            className="form-input"
                            placeholder="Motivo (opcional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <div className="admin-action-group">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReject(entry.id)}
                            >
                              Confirmar
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setRejectingId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-action-group">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApprove(entry.id)}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-reject"
                            onClick={() => setRejectingId(entry.id)}
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

      <h3 className="admin-section-title">
        Pagos aprobados ({approvedEntries.length})
      </h3>

      {approvedEntries.length === 0 ? (
        <p className="placeholder-text">No hay pagos aprobados aún.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Ticket</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {approvedEntries.map((entry) => {
                const { name, playerImg } = getUserDisplay(entry);
                const user = userMap.get(entry.user_id);
                return (
                  <tr key={entry.id}>
                    <td>
                      {playerImg ? (
                        <img
                          src={playerImg}
                          alt=""
                          className="admin-user-emoji"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                            verticalAlign: "middle",
                            marginRight: 4,
                          }}
                        />
                      ) : (
                        <span className="admin-user-emoji">{"❓"}</span>
                      )}
                      {name}
                    </td>
                    <td>
                      <span className="badge badge-approved" style={{ fontSize: "0.75rem" }}>
                        #{entry.ticket_number}
                      </span>
                    </td>
                    <td>{user?.phone || "—"}</td>
                    <td>
                      <span className="badge badge-approved">
                        ✓ Aprobado
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
  );
}
