import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function ChangePasswordModal({ onClose, changePassword }) {
  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg,     setMsg]     = useState("");
  const [ok,      setOk]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!current || !next) { setMsg("Remplis tous les champs."); return; }
    if (next !== confirm)  { setMsg("Les mots de passe ne correspondent pas."); return; }
    if (next.length < 4)   { setMsg("Minimum 4 caractères."); return; }
    const success = await changePassword(current, next);
    if (!success) { setMsg("Mot de passe actuel incorrect."); return; }
    setOk(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal pw-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-message" style={{ marginBottom: "1rem" }}>🔑 Changer le mot de passe</div>
        {ok ? (
          <div style={{ color: "#4ade80", fontFamily: "'Cinzel',serif", fontSize: "0.88rem" }}>✓ Mot de passe modifié !</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
            <input className="mh-input" type="password" placeholder="Mot de passe actuel" value={current} onChange={e => setCurrent(e.target.value)} autoFocus />
            <input className="mh-input" type="password" placeholder="Nouveau mot de passe" value={next} onChange={e => setNext(e.target.value)} />
            <input className="mh-input" type="password" placeholder="Confirmer" value={confirm} onChange={e => setConfirm(e.target.value)} />
            {msg && <div style={{ color: "#e07070", fontSize: "0.78rem", textAlign: "center" }}>{msg}</div>}
            <div className="confirm-actions" style={{ marginTop: "0.4rem" }}>
              <button type="button" className="confirm-btn-cancel" onClick={onClose}>Annuler</button>
              <button type="submit" className="confirm-btn-ok" style={{ background: "rgba(201,162,39,0.2)", borderColor: "rgba(201,162,39,0.5)", color: "#F0D878" }}>Confirmer</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const linkVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

function renderAvatar(avatar, size = "24px") {
  if (!avatar) return "⚡";
  if (typeof avatar === "string" && (avatar.startsWith("data:") || avatar.startsWith("http"))) {
    return <img src={avatar} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", verticalAlign: "middle" }} />;
  }
  return avatar;
}

function UserDropdown({ user, logout, deleteProfile, changePassword }) {
  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = () => {
    if (window.confirm("Es-tu sûr de vouloir supprimer ton profil ? Cette action est irréversible.")) {
      deleteProfile(user.pseudo);
    }
  };

  const userPerms = user.perms || [];
  const orderedPerms = userPerms.includes("Gérant")
    ? ["Gérant", ...userPerms.filter(p => p !== "Gérant")]
    : userPerms;
  const aboName  = user.abonnement || null;
  const wlNames  = user.whitelist || [];

  return (
    <div className="user-dropdown-wrapper" ref={ref}>
      <button className="user-pseudo-btn" onClick={() => setOpen(!open)}>
        {renderAvatar(user.avatar)} {user.pseudo} ▾
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="dropdown-section">
            {orderedPerms.length > 0 && (
              <>
                <span className="dropdown-label">⚡ Permission</span>
                <div className="dropdown-tags">
                  {orderedPerms.map(p => (
                    <span key={p} className={`tag tag-perm ${p === "Gérant" ? "role-gerant" : ""}`}>
                      {p === "Gérant" ? "👑 Gérant" : p}
                    </span>
                  ))}
                </div>
              </>
            )}
            {aboName && (
              <>
                <span className="dropdown-label">💎 Abonnement</span>
                <div className="dropdown-tags">
                  <span className="tag tag-abo">{aboName}</span>
                </div>
              </>
            )}
            {wlNames.length > 0 && (
              <>
                <span className="dropdown-label">📋 Whitelist</span>
                <div className="dropdown-tags">
                  {wlNames.map((w) => (
                    <span key={w} className="tag tag-wl">{w}</span>
                  ))}
                </div>
              </>
            )}
            {orderedPerms.length === 0 && !aboName && wlNames.length === 0 && (
              <span style={{ color: "rgba(201,162,39,0.5)", fontSize: "0.8rem" }}>Aucune possession</span>
            )}
          </div>

          <hr className="dropdown-divider" />

          <button className="dropdown-pw" onClick={() => { setShowPw(true); setOpen(false); }}>
            🔑 Changer le mot de passe
          </button>
          {user.id !== "zeus-001" && (
            <button className="dropdown-delete" onClick={handleDelete}>
              🗑️ Supprimer mon profil
            </button>
          )}
          <button className="dropdown-logout" onClick={logout}>
            🚪 Se déconnecter
          </button>
        </div>
      )}

      {showPw && (
        <ChangePasswordModal
          onClose={() => setShowPw(false)}
          changePassword={changePassword}
        />
      )}
    </div>
  );
}

export default function Navbar() {
  const { items, setOpen } = useCart();
  const { user, logout, deleteProfile, getUnreadCount, changePassword } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread,   setUnread]   = useState(0);

  useEffect(() => {
    document.body.setAttribute("data-faction", user?.faction || "olympe");
  }, [user]);

  useEffect(() => {
    const refresh = () => setUnread(getUnreadCount ? getUnreadCount() : 0);
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [user, getUnreadCount]);

  const goto = (path) => navigate("/" + (path === "home" ? "" : path));

  const navLinks = [
    { to: "/",        label: "Accueil" },
    { to: "/shop",    label: "Boutique" },
    { to: "/members", label: "Membres" },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="navbar-brand"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <motion.span
          style={{ fontSize: "1.4rem", display: "inline-block" }}
          animate={{ rotate: [0, -15, 15, -8, 0] }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeInOut" }}
        >⚡</motion.span>
        <span className="navbar-title">Olympe</span>
        <motion.a
          href="https://discord.gg/BfUkgdDw"
          target="_blank"
          rel="noreferrer"
          className="discord-badge"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          title="Rejoindre le serveur Discord"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.08.114 18.1.13 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          Discord
        </motion.a>
      </motion.div>

      <motion.div
        className="navbar-links"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.07, delayChildren: 0.25 }}
      >
        {navLinks.map((l) => (
          <motion.div key={l.to} variants={linkVariants} transition={{ duration: 0.3 }}>
            <Link
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? "active" : ""}`}
            >
              {l.label}
            </Link>
          </motion.div>
        ))}
        {user && (
          <motion.div variants={linkVariants} transition={{ duration: 0.3 }}>
            <Link
              to="/messages"
              className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`}
            >
              ✉️ Messages
              {unread > 0 && <span className="msg-badge">{unread}</span>}
            </Link>
          </motion.div>
        )}
        {user?.isAdmin && (
          <motion.div variants={linkVariants} transition={{ duration: 0.3 }}>
            <Link
              to="/admin"
              className={`nav-link nav-admin ${location.pathname === "/admin" ? "active" : ""}`}
            >
              ⚙️ Admin
            </Link>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="navbar-actions"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {user ? (
          <UserDropdown user={user} logout={logout} deleteProfile={deleteProfile} changePassword={changePassword} />
        ) : (
          <Link to="/auth" className="btn-ghost">Connexion</Link>
        )}
        <motion.button
          className="cart-btn"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          🛒
          {items.length > 0 && <span className="cart-badge">{items.length}</span>}
        </motion.button>
        <button className="burger-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button onClick={() => { goto("home");     setMenuOpen(false); }}>Accueil</button>
            <button onClick={() => { goto("shop");     setMenuOpen(false); }}>Boutique</button>
            <button onClick={() => { goto("members");  setMenuOpen(false); }}>Membres</button>
            {user && (
              <button onClick={() => { goto("messages"); setMenuOpen(false); }}>
                ✉️ Messages {unread > 0 && `(${unread})`}
              </button>
            )}
            {user?.isAdmin && (
              <button onClick={() => { goto("admin"); setMenuOpen(false); }}>⚙️ Admin</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
