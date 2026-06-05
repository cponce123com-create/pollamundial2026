import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { EMOJIS } from "../lib/emojis";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emojiId, setEmojiId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!emojiId) {
      setError("Debes seleccionar un emoji de personaje.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register(name, phone, password, emojiId);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">⚽ Registro</h1>
        <p className="auth-subtitle">Únete a PollaWorld 2026</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              className="form-input"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              className="form-input"
              type="text"
              placeholder="987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Elige tu personaje</label>
            <div className="emoji-grid">
              {EMOJIS.map((emoji) => (
                <div
                  key={emoji.id}
                  className={`emoji-card ${emojiId === emoji.id ? "selected" : ""}`}
                  onClick={() => setEmojiId(emoji.id)}
                >
                  <span className="emoji-card-icon">{emoji.emoji}</span>
                  <span className="emoji-card-name">{emoji.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-gold btn-block" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
        </p>
      </div>
    </div>
  );
}
