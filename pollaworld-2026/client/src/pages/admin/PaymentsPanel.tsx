import { useState } from "react";
import { User, api } from "../../lib/api";
import { getEmoji } from "../../lib/emojis";

interface PaymentsPanelProps {
  pendingPayments: User[];
  approvedPayments: User[];
  rejectedCount: number;
  onReload: () => void;
  onOpenImage: (url: string) => void;
}

export default function PaymentsPanel({
  pendingPayments,
  approvedPayments,
  rejectedCount,
  onReload,
  onOpenImage,
}: PaymentsPanelProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingWithProof = pendingPayments.filter((p) => p.payment_proof_url);

  const handleApprove = async (userId: string) => {
    try {
      await api.approvePayment(userId);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.rejectPayment(userId, rejectReason || undefined);
      setRejectingId(null);
      setRejectReason("");
      onReload();
    } catch (err) {
      console.error(err);
    }
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
            {approvedPayments.length}
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
                <th>Teléfono</th>
                <th>Comprobante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithProof.map((user) => {
                const emoji = getEmoji(user.emoji_id);
                return (
                  <tr key={user.id}>
                    <td>
                      <span className="admin-user-emoji">{emoji?.emoji}</span>
                      {user.name}
                    </td>
                    <td>{user.phone}</td>
                    <td>
                      <img
                        src={user.payment_proof_url!}
                        alt="Comprobante"
                        className="proof-thumb"
                        onClick={() => onOpenImage(user.payment_proof_url!)}
                      />
                    </td>
                    <td>
                      {rejectingId === user.id ? (
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
                              onClick={() => handleReject(user.id)}
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
                            onClick={() => handleApprove(user.id)}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-reject"
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

      <h3 className="admin-section-title">
        Pagos aprobados ({approvedPayments.length})
      </h3>

      {approvedPayments.length === 0 ? (
        <p className="placeholder-text">No hay pagos aprobados aún.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {approvedPayments.map((user) => {
                const emoji = getEmoji(user.emoji_id);
                return (
                  <tr key={user.id}>
                    <td>
                      <span className="admin-user-emoji">{emoji?.emoji}</span>
                      {user.name}
                    </td>
                    <td>{user.phone}</td>
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
