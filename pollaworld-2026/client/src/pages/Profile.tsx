import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, Entry } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { getPlayer, PLAYERS } from "../lib/players";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refresh } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (user) {
      setName(user.name);
      setSelectedPlayerSlug(user.player_slug);
    }
    api.getEntries().then(setEntries).catch(() => {});
  }, [user, authLoading]);

  const handleNameSave = async () => {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    setSavingName(true);
    try {
      await api.updateName(name.trim());
      await refresh();
      toast.success("Nombre actualizado");
    } catch { toast.error("Error al actualizar nombre"); }
    finally { setSavingName(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!previewUrl) return;
    setUploading(true);
    try {
      const input = fileInputRef.current?.files?.[0] || cameraInputRef.current?.files?.[0];
      if (!input) { toast.error("Selecciona una imagen"); setUploading(false); return; }
      await api.uploadAvatar(input);
      await refresh();
      setPreviewUrl(null);
      toast.success("Foto de perfil actualizada");
    } catch { toast.error("Error al subir foto"); }
    finally { setUploading(false); }
  };

  const handlePlayerSave = async () => {
    if (!selectedPlayerSlug || selectedPlayerSlug === user?.player_slug) return;
    setSavingPlayer(true);
    try {
      await api.updatePlayer(selectedPlayerSlug);
      await refresh();
      toast.success("Personaje actualizado");
    } catch { toast.error("Error al actualizar personaje"); }
    finally { setSavingPlayer(false); }
  };

  if (authLoading) return <div className="placeholder-page"><p>Cargando...</p></div>;
  if (!user) return null;

  const player = getPlayer(user.player_slug);

  return (
    <div className="auth-page" style={{ paddingTop: 16 }}>
      <div className="card" style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--gold)" }} />
            ) : user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }} />
            ) : player ? (
              <img src={player.image} alt={player.name} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }} referrerPolicy="no-referrer" />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--bg-card)", border: "3px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "var(--text-muted)" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 style={{ marginTop: 12, color: "var(--white)" }}>{user.name}</h2>
        </div>

        {/* Avatar upload */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">Foto de perfil</h3>
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            Tómate una foto o elige una de tu galería.
          </p>
          <div className="admin-action-group" style={{ justifyContent: "center" }}>
            <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>
              📁 Desde galería
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => cameraInputRef.current?.click()}>
              📷 Tomar foto
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={handleFileSelect} />
          {previewUrl && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <img src={previewUrl} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--gold)" }} />
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={handleUpload} disabled={uploading}>
                {uploading ? "Subiendo..." : "💾 Guardar foto"}
              </button>
              <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={() => { setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; if (cameraInputRef.current) cameraInputRef.current.value = ""; }}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Player selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">🎭 Elegir personaje</h3>
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            Selecciona un personaje para representarte en el ranking y participantes.
          </p>
          <div className="player-grid">
            {PLAYERS.map((p) => (
              <div
                key={p.id}
                className={`player-card ${selectedPlayerSlug === p.id ? "selected" : ""}`}
                onClick={() => setSelectedPlayerSlug(p.id)}
              >
                <img src={p.image} alt={p.name} className="player-card-img" referrerPolicy="no-referrer" />
                <span className="player-card-name">{p.name}</span>
              </div>
            ))}
          </div>
          {selectedPlayerSlug !== user.player_slug && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button className="btn btn-gold" onClick={handlePlayerSave} disabled={savingPlayer}>
                {savingPlayer ? "Guardando..." : "💾 Guardar personaje"}
              </button>
            </div>
          )}
        </div>

        {/* Edit name */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">Nombre</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            <button className="btn btn-primary" onClick={handleNameSave} disabled={savingName || name === user.name}>
              {savingName ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {/* Account info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">Información de cuenta</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Teléfono</span>
              <span>{user.phone}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Rol</span>
              <span>{user.role === "admin" ? "Administrador" : "Participante"}</span>
            </div>
            {player && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Personaje actual</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <img src={player.image} alt={player.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                  {player.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tickets */}
        <div className="card">
          <h3 className="card-title">Mis tickets ({entries.length})</h3>
          {entries.length === 0 ? (
            <p className="placeholder-text">No tienes tickets.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entries.map((entry) => (
                <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-dark)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <span style={{ fontWeight: 600 }}>Ticket #{entry.ticket_number}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`badge ${entry.payment_status === "approved" ? "badge-approved" : entry.payment_status === "rejected" ? "badge-rejected" : "badge-pending"}`}>
                      {entry.payment_status === "approved" ? "✅ Aprobado" : entry.payment_status === "rejected" ? "❌ Rechazado" : "⏳ Pendiente"}
                    </span>
                    {entry.payment_proof_url && (
                      <a href={entry.payment_proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem" }}>Ver comprobante</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
