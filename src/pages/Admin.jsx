import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
import { perms, abonnements, whitelist } from "../data/shopData";

function renderAvatar(avatar, size = "2rem") {
  if (!avatar) return <span>⚡</span>;
  if (typeof avatar === "string" && (avatar.startsWith("data:") || avatar.startsWith("http"))) {
    return <img src={avatar} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return <span>{avatar}</span>;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="confirm-btn-ok" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}


const allWLItems = whitelist.flatMap(cat => cat.items);

const RANKED_PERMS = new Set(perms.map(p => p.role));

function RoleAssignSection({ selectedPerms, setSelectedPerms, selectedAbo, setSelectedAbo, selectedWL, setSelectedWL }) {
  const togglePerm = (role) => setSelectedPerms(prev => {
    if (prev.includes(role)) return prev.filter(p => p !== role);
    // Remove all other ranked perms, keep tier labels, add the new one
    const kept = prev.filter(p => !RANKED_PERMS.has(p));
    return [...kept, role];
  });
  const toggleWL = (name) => setSelectedWL(prev =>
    prev.includes(name) ? prev.filter(w => w !== name) : [...prev, name]
  );

  return (
    <div className="role-assign-section">
      <h4 className="role-assign-title">⚡ Permissions</h4>
      <div className="role-assign-grid">
        {perms.map(p => (
          <label key={p.id} className={`role-checkbox-label role-${p.id === "botbot" ? "bot" : p.id}`}>
            <input
              type="checkbox"
              checked={selectedPerms.includes(p.role)}
              onChange={() => togglePerm(p.role)}
            />
            <span>{p.role}</span>
          </label>
        ))}
      </div>

      <h4 className="role-assign-title">💎 Abonnement</h4>
      <select className="mh-select" value={selectedAbo} onChange={e => setSelectedAbo(e.target.value)}>
        <option value="">Aucun</option>
        {abonnements.map(a => (
          <option key={a.id} value={a.name}>{a.name}</option>
        ))}
      </select>

      <h4 className="role-assign-title">📋 Whitelist</h4>
      <div className="role-assign-grid">
        {allWLItems.map(item => (
          <label key={item.id} className="role-checkbox-label">
            <input
              type="checkbox"
              checked={selectedWL.includes(item.name)}
              onChange={() => toggleWL(item.name)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, users, createUser, deleteUser, updateUser, sendMessage, sendGroupMessage, orders, treatOrder } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("members");
  const [confirmPending, setConfirmPending] = useState(null);

  const [newPseudo,    setNewPseudo]    = useState("");
  const [userId,       setUserId]       = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [newIsAdmin,   setNewIsAdmin]   = useState(false);
  const [newTier,      setNewTier]      = useState("membre");
  const [avatarMode,   setAvatarMode]   = useState("emoji");
  const [avatarEmoji,  setAvatarEmoji]  = useState("");
  const [avatarUrl,    setAvatarUrl]    = useState("");
  const [avatarFile,   setAvatarFile]   = useState(null);
  const [avatarData,   setAvatarData]   = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [selectedAbo,   setSelectedAbo]   = useState("");
  const [selectedWL,    setSelectedWL]    = useState([]);
  const [createMsg,    setCreateMsg]    = useState("");
  const [creating,     setCreating]     = useState(false);

  const handleTierChange = (tier) => {
    setNewTier(tier);
    setSelectedPerms(prev => {
      const without = prev.filter(p => p !== "Diplomate" && p !== "Ambassadeur");
      if (tier === "diplomate")   return [...without, "Diplomate"];
      if (tier === "ambassadeur") return [...without, "Ambassadeur"];
      return without;
    });
  };

  const [editUser,        setEditUser]        = useState(null);
  const [editPerms,       setEditPerms]       = useState([]);
  const [editAbo,         setEditAbo]         = useState("");
  const [editWL,          setEditWL]          = useState([]);
  const [editParrainList, setEditParrainList] = useState([]);
  const [parrainSearch,   setParrainSearch]   = useState("");
  const [editPseudo,      setEditPseudo]      = useState("");
  const [editCustomId,    setEditCustomId]    = useState("");
  const [editPassword,    setEditPassword]    = useState("");
  const [editAvatarMode,  setEditAvatarMode]  = useState("emoji");
  const [editAvatarEmoji, setEditAvatarEmoji] = useState("");
  const [editAvatarUrl,   setEditAvatarUrl]   = useState("");
  const [editAvatarFile,  setEditAvatarFile]  = useState(null);
  const [editAvatarData,  setEditAvatarData]  = useState("");


  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPseudo.trim() || !newPassword) { setCreateMsg("Remplis pseudo et mot de passe."); return; }
    if (users.find(u => u.pseudo.toLowerCase() === newPseudo.trim().toLowerCase())) {
      setCreateMsg("Ce pseudo existe déjà.");
      return;
    }
    setCreating(true);
    const finalAvatar = avatarMode === "emoji" ? (avatarEmoji || "⚡")
                      : avatarMode === "url"   ? avatarUrl
                      : avatarData || "⚡";
    const newUser = await createUser({
      pseudo: newPseudo, password: newPassword, avatar: finalAvatar,
      isAdmin: newIsAdmin, customId: userId.trim() || null,
      perms: selectedPerms, abonnement: selectedAbo || null, whitelist: selectedWL,
    });
    setNewPseudo(""); setUserId(""); setNewPassword(""); setNewIsAdmin(false); setNewTier("membre");
    setAvatarMode("emoji"); setAvatarEmoji(""); setAvatarUrl(""); setAvatarFile(null); setAvatarData("");
    setSelectedPerms([]); setSelectedAbo(""); setSelectedWL([]);
    setCreateMsg(`Compte "${newUser.pseudo}" créé avec succès !`);
    setCreating(false);
    setTimeout(() => setCreateMsg(""), 3000);
  };

  const managedUsers = (user?.pseudo === "Zeus" || user?.pseudo === "Cronos")
    ? users
    : users.filter(u => u.faction === user?.faction || u.id === "zeus-001" || u.id === "cronos-001");

  const toggleAdmin = (u) => {
    if (u.id === "zeus-001" || u.id === "cronos-001") return;
    updateUser(u.id, { isAdmin: !u.isAdmin });
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setEditPerms(u.perms || []);
    setEditAbo(u.abonnement || "");
    setEditWL(u.whitelist || []);
    setEditParrainList(Array.isArray(u.parrain) ? u.parrain : u.parrain ? [u.parrain] : []);
    setParrainSearch("");
    setEditPseudo(u.pseudo || "");
    setEditCustomId(u.customId || "");
    setEditPassword("");
    const av = u.avatar;
    if (av?.startsWith("data:")) {
      setEditAvatarMode("file"); setEditAvatarData(av); setEditAvatarUrl("");
    } else if (av?.startsWith("http")) {
      setEditAvatarMode("url"); setEditAvatarUrl(av); setEditAvatarData("");
    } else {
      setEditAvatarMode("url"); setEditAvatarUrl(""); setEditAvatarData("");
    }
    setEditAvatarFile(null);
  };

  const handleSaveEdit = async () => {
    const parrainArray = user?.id === "zeus-001" ? editParrainList : editUser.parrain;
    const finalAvatar = editAvatarMode === "url" ? editAvatarUrl : editAvatarData || editUser.avatar;
    const updates = {
      perms: editPerms, abonnement: editAbo || null, whitelist: editWL,
      parrain: parrainArray,
      pseudo: editPseudo.trim() || editUser.pseudo,
      customId: editCustomId.trim() || null,
      avatar: finalAvatar,
    };
    if (editPassword) updates.password = await sha256(editPassword);
    updateUser(editUser.id, updates);
    setEditUser(null);
  };

  const TIER_RANK = { "Gérant": 0, "Fondateur": 1, "Diplomate": 2, "Ambassadeur": 3 };
  const TIER_STYLE = {
    "Gérant":      { label: "Gérant",      col: "#C9A227", bg: "rgba(201,162,39,0.15)"  },
    "Fondateur":   { label: "Fondateur",   col: "#C8B4E8", bg: "rgba(200,180,232,0.15)" },
    "Diplomate":   { label: "Diplomate",   col: "#8BA3C7", bg: "rgba(139,163,199,0.15)" },
    "Ambassadeur": { label: "Ambassadeur", col: "#CD7F32", bg: "rgba(205,127,50,0.15)"  },
    "Membre":      { label: "Membre",      col: "#8A7A58", bg: "rgba(138,122,88,0.12)"  },
  };

  const getUserTier = (u) => {
    if (u.perms?.includes("Gérant"))      return "Gérant";
    if (u.perms?.includes("Créateur"))    return "Fondateur";
    if (u.perms?.includes("Diplomate"))   return "Diplomate";
    if (u.perms?.includes("Ambassadeur")) return "Ambassadeur";
    return "Membre";
  };

  const PERM_PRICES = {
    "Co-owner": 10, "Owner": 25, "Diamant": 50, "Billet": 100, "Soleil": 160,
    "Trèfle": 230, "Flocon": 300, "Bulle": 400, "Royal": 550, "Crown": 800,
    "Admin": 1200, "BOT=BOT": 1800, "Invisible": 2500, "Couronne": 3500,
    "Créateur": 5500, "Système": 8500,
  };
  const ABO_PRICES = {
    "SILVER": 14.99, "GOLD": 29.99, "PLAT": 44.99,
    "DIAMS": 74.99, "RUBY": 149.99, "OPAL": 299.99,
  };

  const handleTreated = async (order) => {
    await treatOrder(order.id);

    const member = users.find(u => u.id === order.userId);
    if (!member) return;

    const permNames = new Set(Object.keys(PERM_PRICES));
    const aboNames  = new Set(Object.keys(ABO_PRICES));
    const permItems = order.items.filter(i => permNames.has(i.name));
    const aboItems  = order.items.filter(i => aboNames.has(i.name));
    const wlItems   = order.items.filter(i => !permNames.has(i.name) && !aboNames.has(i.name));

    let newPerms      = member.perms      || [];
    let newAbonnement = member.abonnement || null;
    let newWhitelist  = member.whitelist  || [];

    if (permItems.length > 0) {
      const newPerm    = permItems.sort((a, b) => (PERM_PRICES[b.name] || 0) - (PERM_PRICES[a.name] || 0))[0];
      const knownPerms = Object.keys(PERM_PRICES);
      newPerms = [...(member.perms || []).filter(p => !knownPerms.includes(p)), newPerm.name];
    }
    if (aboItems.length > 0) {
      const newAbo = aboItems.sort((a, b) => (ABO_PRICES[b.name] || 0) - (ABO_PRICES[a.name] || 0))[0];
      newAbonnement = newAbo.name;
    }
    if (wlItems.length > 0) {
      const newWLNames = wlItems.map(i => i.name);
      newWhitelist = [...new Set([...newWhitelist, ...newWLNames])];
    }

    const confirmContent = [
      "✅ Ta commande a été traitée !",
      "",
      permItems.length > 0 ? `⚡ Perm ajoutée : ${permItems.map(p => p.name).join(", ")}` : null,
      aboItems.length > 0  ? `💎 Abonnement : ${aboItems.map(a => a.name).join(", ")}`    : null,
      wlItems.length > 0   ? `📋 Whitelist ajoutée : ${wlItems.map(w => w.name).join(", ")}` : null,
      "",
      "Merci pour ta confiance ! ⚡",
    ].filter(l => l !== null).join("\n");

    await sendMessage(member.id, confirmContent);

    if (order.groupId) {
      await sendGroupMessage({
        groupId:           order.groupId,
        participantIds:    order.participantIds    || [],
        participantPseudos: order.participantPseudos || [],
        content:           confirmContent,
        groupName:         order.groupName || `Commande – ${order.pseudo}`,
      });
    }

    await updateUser(member.id, { perms: newPerms, abonnement: newAbonnement, whitelist: newWhitelist });
  };

  return (
    <main className="admin-page">
      {confirmPending && (
        <ConfirmModal
          message={confirmPending.message}
          onConfirm={confirmPending.onConfirm}
          onCancel={() => setConfirmPending(null)}
        />
      )}
      <div className="admin-header">
        <h1>⚙️ Panel Admin</h1>
        <p>Gestion du serveur Olympe</p>
      </div>

      <div className="tabs" style={{ justifyContent: "flex-start" }}>
        {[["members","👥 Membres"], ["create","➕ Créer un compte"], ["orders","📦 Commandes"]].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Pseudo</th>
                <th>Rang</th>
                <th>Perms</th>
                <th>Abonnement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...managedUsers].sort((a, b) => {
                const ta = TIER_RANK[getUserTier(a)] ?? 3;
                const tb = TIER_RANK[getUserTier(b)] ?? 3;
                if (ta !== tb) return ta - tb;
                const pa = Math.max(0, ...(a.perms || []).map(p => PERM_PRICES[p] || 0));
                const pb = Math.max(0, ...(b.perms || []).map(p => PERM_PRICES[p] || 0));
                return pb - pa;
              }).map(u => {
                const tier = getUserTier(u);
                const ts   = TIER_STYLE[tier];
                return (
                <tr key={u.id} className="admin-row">
                  <td style={{ fontSize: "1.4rem" }}>{renderAvatar(u.avatar, "36px")}</td>
                  <td className="admin-pseudo">
                    {u.pseudo}
                    {u.isAdmin && <span className="badge-admin">Admin</span>}
                  </td>
                  <td>
                    <span className="admin-tier-badge" style={{ color: ts.col, background: ts.bg, borderColor: ts.col + "55" }}>
                      {ts.label}
                    </span>
                  </td>
                  <td style={{ color: "#C9A227", fontSize: "0.8rem" }}>
                    {(() => { const fp = (u.perms || []).filter(p => !["Gérant","Diplomate","Ambassadeur","Membre"].includes(p)); return fp.slice(0,2).join(", ") || "—" + (fp.length > 2 ? ` +${fp.length-2}` : ""); })()}
                  </td>
                  <td style={{ color: "#D9B45B" }}>{u.abonnement || "—"}</td>
                  <td>
                    <span className={`status-dot ${u.last_seen && Date.now() - new Date(u.last_seen).getTime() < 3 * 60 * 1000 ? "online" : ""}`} />
                  </td>
                  <td className="admin-actions">
                    <button className="admin-action-btn edit" onClick={() => openEditModal(u)}>✏️ Modifier</button>
                    {u.id !== "zeus-001" && u.id !== "cronos-001" && (
                      <>
                        <button
                          className="admin-action-btn toggle-admin"
                          onClick={() => toggleAdmin(u)}
                        >
                          👑 {u.isAdmin ? "Retirer" : "Admin"}
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => setConfirmPending({ message: `Supprimer ${u.pseudo} ?`, onConfirm: () => { deleteUser(u.id); setConfirmPending(null); } })}
                        >
                          🗑️ Supprimer
                        </button>
                      </>
                    )}
                    {(u.id === "zeus-001" || u.id === "cronos-001") && <span style={{ color: "#7A6A50", fontSize: "0.8rem" }}>Protégé</span>}
                  </td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "create" && (
        <div className="admin-create-wrap">
          <div className="create-form-wrapper">
            <div className="admin-create-form">
              <h3 style={{ color: "#F5EDD8", marginBottom: "1.25rem", fontFamily: "'Cinzel', serif" }}>
                Nouveau membre
              </h3>
              <form onSubmit={handleCreate}>
                <input placeholder="Pseudo" className="mh-input" value={newPseudo} onChange={e => setNewPseudo(e.target.value)} />
                <input className="mh-input" placeholder="ID personnalisé (ex: #0001)" value={userId} onChange={e => setUserId(e.target.value)} />
                <input type="password" placeholder="Mot de passe" className="mh-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

                <div className="tier-select-section">
                  <label className="role-assign-title">🏛️ RANG</label>
                  <div className="tier-select-btns">
                    {[
                      { key: "membre",      label: "Membre",      icon: "⚡" },
                      { key: "ambassadeur", label: "Ambassadeur", icon: "🏛️" },
                      { key: "diplomate",   label: "Diplomate",   icon: "⚔" },
                    ].map(t => (
                      <button
                        key={t.key}
                        type="button"
                        className={`tier-btn tier-btn-${t.key}${newTier === t.key ? " active" : ""}`}
                        onClick={() => handleTierChange(t.key)}
                      >
                        <span className="tier-btn-icon">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="avatar-input-section">
                  <label className="role-assign-title">⚡ AVATAR</label>
                  <div className="avatar-tabs">
                    <button className={`avatar-tab ${avatarMode === "url" ? "active" : ""}`} onClick={() => setAvatarMode("url")} type="button">Lien URL</button>
                    <button className={`avatar-tab ${avatarMode === "file" ? "active" : ""}`} onClick={() => setAvatarMode("file")} type="button">Fichier</button>
                  </div>
                  {avatarMode === "url" && (
                    <input className="mh-input" placeholder="https://..." value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                  )}
                  {avatarMode === "file" && (
                    <label className="avatar-file-label">
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="avatar" className="avatar-file-preview" />
                      ) : (
                        <span>📁 Cliquer pour choisir une image</span>
                      )}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setAvatarFile(file);
                          const reader = new FileReader();
                          reader.onload = () => setAvatarData(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                  <div className="avatar-preview">
                    {avatarMode === "url" && avatarUrl && <img src={avatarUrl} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />}
                    {avatarMode === "file" && avatarData && <img src={avatarData} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />}
                  </div>
                </div>
                <label className="admin-checkbox">
                  <input type="checkbox" checked={newIsAdmin} onChange={e => setNewIsAdmin(e.target.checked)} />
                  <span>Accorder les droits Admin</span>
                </label>

                <RoleAssignSection
                  selectedPerms={selectedPerms} setSelectedPerms={setSelectedPerms}
                  selectedAbo={selectedAbo}     setSelectedAbo={setSelectedAbo}
                  selectedWL={selectedWL}       setSelectedWL={setSelectedWL}
                />

                {createMsg && (
                  <div style={{ color: createMsg.includes("succès") ? "#90ffb0" : "#ff6b6b", marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                    {createMsg}
                  </div>
                )}
                <button type="submit" className="mh-btn" disabled={creating} style={{ marginTop: "1rem" }}>
                  {creating ? "Création…" : "Créer le compte"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="admin-orders">
          {orders.length === 0 ? (
            <div className="members-empty"><p>📦 Aucune commande pour l'instant.</p></div>
          ) : (
            [...orders].reverse().map(order => (
              <div key={order.id} className={`order-card ${order.treated ? "order-treated" : ""}`}>
                <div className="order-header">
                  <span className="order-pseudo">{order.pseudo}</span>
                  <span className="order-date">{new Date(order.date).toLocaleString("fr-FR")}</span>
                  {order.treated && <span className="badge-treated">✓ Traité</span>}
                </div>
                <div className="order-items">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="order-item">
                      <span>{item.name}</span>
                      <span style={{ color: "#D9B45B" }}>{item.price} 🪙</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">Total : <strong>{order.total?.toFixed?.(2) ?? order.total} 🪙</strong></span>
                  {!order.treated && (
                    <button className="admin-btn admin-btn-treat" onClick={() => handleTreated(order)}>
                      ✓ Traité
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editUser && (
        <>
          <div className="admin-edit-overlay" onClick={() => setEditUser(null)} />
          <div className="admin-edit-modal">
            <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>

            <div className="edit-modal-avatar-preview">
              {editAvatarMode === "url"  && editAvatarUrl  && <img src={editAvatarUrl}  alt="" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />}
              {editAvatarMode === "file" && editAvatarData && <img src={editAvatarData} alt="" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />}
            </div>

            <h3 style={{ color: "#F5EDD8", fontFamily: "'Cinzel', serif", marginBottom: "1rem" }}>
              Modifier le profil
            </h3>

            {/* Identité */}
            <div className="edit-section">
              <label className="role-assign-title">👤 IDENTITÉ</label>
              <input className="mh-input" placeholder="Pseudo" value={editPseudo} onChange={e => setEditPseudo(e.target.value)} />
              <input className="mh-input" placeholder="ID personnalisé (ex: #0001)" value={editCustomId} onChange={e => setEditCustomId(e.target.value)} />
              <input className="mh-input" type="password" placeholder="Nouveau mot de passe (laisser vide = inchangé)" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
            </div>

            {/* Avatar */}
            <div className="edit-section">
              <label className="role-assign-title">🖼️ AVATAR</label>
              <div className="avatar-tabs">
                <button type="button" className={`avatar-tab ${editAvatarMode === "url"   ? "active" : ""}`} onClick={() => setEditAvatarMode("url")}>URL</button>
                <button type="button" className={`avatar-tab ${editAvatarMode === "file"  ? "active" : ""}`} onClick={() => setEditAvatarMode("file")}>Fichier</button>
              </div>
              {editAvatarMode === "url" && (
                <input className="mh-input" placeholder="https://..." value={editAvatarUrl} onChange={e => setEditAvatarUrl(e.target.value)} />
              )}
              {editAvatarMode === "file" && (
                <label className="avatar-file-label">
                  {editAvatarFile ? (
                    <img src={URL.createObjectURL(editAvatarFile)} alt="avatar" className="avatar-file-preview" />
                  ) : (
                    <span>📁 Cliquer pour choisir une image</span>
                  )}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditAvatarFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setEditAvatarData(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>

            {/* Rôles / abo / WL */}
            <RoleAssignSection
              selectedPerms={editPerms} setSelectedPerms={setEditPerms}
              selectedAbo={editAbo}     setSelectedAbo={setEditAbo}
              selectedWL={editWL}       setSelectedWL={setEditWL}
            />

            {user?.id === "zeus-001" && editUser?.id !== "zeus-001" && (
              <div className="edit-section">
                <label className="role-assign-title">🤝 PARRAIN(S)</label>

                {/* Current parrains as removable tags */}
                {editParrainList.length > 0 && (
                  <div className="parrain-tags">
                    {editParrainList.map(p => (
                      <span key={p} className="parrain-tag">
                        {p}
                        <button
                          type="button"
                          className="parrain-tag-remove"
                          onClick={() => setEditParrainList(prev => prev.filter(x => x !== p))}
                        >✕</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search + add */}
                <input
                  className="mh-input"
                  placeholder="Chercher un membre à ajouter…"
                  value={parrainSearch}
                  onChange={e => setParrainSearch(e.target.value)}
                />
                {parrainSearch.trim() && (
                  <div className="parrain-dropdown">
                    {users
                      .filter(u =>
                        u.id !== editUser?.id &&
                        !editParrainList.includes(u.pseudo) &&
                        u.pseudo.toLowerCase().includes(parrainSearch.toLowerCase())
                      )
                      .slice(0, 6)
                      .map(u => (
                        <div
                          key={u.id}
                          className="parrain-option"
                          onClick={() => {
                            setEditParrainList(prev => [...prev, u.pseudo]);
                            setParrainSearch("");
                          }}
                        >
                          {u.pseudo}
                          <span className="parrain-option-tier">
                            {u.perms?.includes("Gérant") ? "Gérant" : u.perms?.includes("Diplomate") ? "Diplomate" : u.perms?.includes("Ambassadeur") ? "Ambassadeur" : "Membre"}
                          </span>
                        </div>
                      ))}
                    {users.filter(u => u.id !== editUser?.id && !editParrainList.includes(u.pseudo) && u.pseudo.toLowerCase().includes(parrainSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: "0.5rem", color: "#7A6A50", fontSize: "0.8rem" }}>Aucun résultat</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button className="mh-btn" style={{ marginTop: "1.25rem" }} onClick={handleSaveEdit}>
              💾 Sauvegarder
            </button>
          </div>
        </>
      )}
    </main>
  );
}
