import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [pseudo,   setPseudo]   = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim() || !password) { setError("Remplis tous les champs."); return; }
    setLoading(true);
    setError("");
    const result = await login(pseudo.trim(), password);
    setLoading(false);
    if (result === true) navigate("/");
    else setError("Pseudo ou mot de passe incorrect.");
  };

  return (
    <main className="login-page">
      <div className="login-modal">
        <div className="login-shine" />
        <div className="login-inner">
          <div className="login-logo">⚡</div>
          <h2 className="login-title">Olympe</h2>
          <p className="login-sub">Accès réservé aux membres de l'Olympe</p>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <input
              type="text"
              placeholder="Pseudo"
              className="mh-input"
              value={pseudo}
              onChange={e => { setPseudo(e.target.value); setError(""); }}
              autoFocus
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="mh-input"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
            />
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="mh-btn" disabled={loading}>
              {loading ? "Vérification…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
