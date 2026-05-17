import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendNotification } from "../onesignal";

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

function renderAvatar(avatar, size = "2.5rem") {
  if (!avatar) return <span>⚡</span>;
  if (typeof avatar === "string" && (avatar.startsWith("data:") || avatar.startsWith("http"))) {
    return <img src={avatar} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return <span>{avatar}</span>;
}

export default function Messages() {
  const { user, users, getMessages, sendMessage, markAllRead, markEverythingRead } = useAuth();
  const navigate = useNavigate();
  const [selectedConv, setSelectedConv] = useState(null);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [allMsgs, setAllMsgs] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  // Group creation
  const [newConvMode, setNewConvMode] = useState("dm");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  // Add to group
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [addGroupSearch, setAddGroupSearch] = useState("");
  // Discount menu
  const [discountOpen, setDiscountOpen] = useState(false);
  const discountRef = useRef(null);
  const [confirmPending, setConfirmPending] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
  }, [user]);

  useEffect(() => {
    const refresh = () => setAllMsgs(getMessages());
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!selectedConv) return;
    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    if (selectedConv.isGroup) {
      const updatedUsers = allUsers.map(u =>
        u.id === user.id
          ? { ...u, messages: (u.messages || []).map(m =>
              m.groupId === selectedConv.groupId && m.fromId !== user.id ? { ...m, read: true } : m
            )}
          : u
      );
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    } else {
      const updatedUsers = allUsers.map(u =>
        u.id === user.id
          ? { ...u, messages: (u.messages || []).map(m =>
              m.fromId === selectedConv.otherId ? { ...m, read: true } : m
            )}
          : u
      );
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    }
    setAllMsgs(getMessages());
  }, [selectedConv]);

  // Close discount menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (discountRef.current && !discountRef.current.contains(e.target)) setDiscountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const allStoredUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
  const availableUsers = allStoredUsers.filter(u => {
    if (u.id === user.id) return false;
    if (user.pseudo === "Zeus" || user.pseudo === "Cronos") return true;
    if (u.pseudo === "Zeus" || u.pseudo === "Cronos") return true;
    return u.faction === user.faction;
  });

  const startConversation = (otherUser) => {
    const convKey = `dm-${otherUser.id}`;
    const existing = conversations.find(c => c.id === convKey);
    if (existing) {
      setSelectedConv(existing);
    } else {
      setSelectedConv({
        id: convKey, isGroup: false, otherId: otherUser.id,
        pseudo: otherUser.pseudo, avatar: otherUser.avatar,
        lastMsg: null, unread: 0, _new: true,
      });
    }
    setShowNewConv(false);
    setSearchUser("");
    setNewConvMode("dm");
    setSelectedGroupUsers([]);
  };

  const toggleGroupUser = (u) => {
    setSelectedGroupUsers(prev =>
      prev.find(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u]
    );
  };

  const createGroup = () => {
    if (selectedGroupUsers.length < 1) return;
    const groupId = `group-${Date.now()}`;
    const participants = [user, ...selectedGroupUsers];
    const participantIds = participants.map(u => u.id);
    const participantPseudos = participants.map(u => u.pseudo);
    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    const groupMsg = {
      id: `msg-${Date.now()}`, fromId: user.id, fromPseudo: user.pseudo,
      content: `Groupe créé par ${user.pseudo}`,
      attachments: [], date: new Date().toISOString(), read: false,
      isGroup: true, groupId, participantIds, participantPseudos, groupName: null,
    };
    const updatedUsers = allUsers.map(u => {
      if (!participantIds.includes(u.id)) return u;
      return { ...u, messages: [...(u.messages || []), { ...groupMsg, read: u.id === user.id }] };
    });
    localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    setSelectedConv({ id: groupId, isGroup: true, groupId, participantIds, participantPseudos, groupName: null, lastMsg: null, unread: 0 });
    setShowNewConv(false);
    setSelectedGroupUsers([]);
    setNewConvMode("dm");
    setSearchUser("");
    setTimeout(() => setAllMsgs(getMessages()), 100);
  };

  const addToGroup = (newU) => {
    const { groupId, participantIds, participantPseudos } = selectedConv;
    if (participantIds.includes(newU.id)) return;
    const newIds = [...participantIds, newU.id];
    const newPseudos = [...participantPseudos, newU.pseudo];
    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    const seen = new Set();
    const groupMsgs = [];
    allUsers.forEach(u => (u.messages || []).forEach(m => {
      if (m.groupId === groupId && !seen.has(m.id)) { seen.add(m.id); groupMsgs.push(m); }
    }));
    let updatedUsers = allUsers.map(u => {
      if (u.id === newU.id)
        return { ...u, messages: [...(u.messages || []), ...groupMsgs.map(m => ({ ...m, participantIds: newIds, participantPseudos: newPseudos, read: true }))] };
      if (participantIds.includes(u.id))
        return { ...u, messages: (u.messages || []).map(m => m.groupId === groupId ? { ...m, participantIds: newIds, participantPseudos: newPseudos } : m) };
      return u;
    });
    const sysMsg = {
      id: `msg-${Date.now()}`, fromId: "system", fromPseudo: "Système",
      content: `${newU.pseudo} a rejoint le groupe`,
      attachments: [], date: new Date().toISOString(), read: false,
      isGroup: true, groupId, participantIds: newIds, participantPseudos: newPseudos, groupName: selectedConv.groupName || null,
    };
    updatedUsers = updatedUsers.map(u => {
      if (!newIds.includes(u.id)) return u;
      return { ...u, messages: [...(u.messages || []), { ...sysMsg, read: u.id === user.id }] };
    });
    localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    setSelectedConv(prev => ({ ...prev, participantIds: newIds, participantPseudos: newPseudos }));
    setShowAddToGroup(false);
    setAddGroupSearch("");
    setTimeout(() => setAllMsgs(getMessages()), 100);
  };

  const deleteConversation = () => {
    if (!selectedConv) return;
    setConfirmPending(() => () => {
      const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
      const MSGS_KEY = "mh_messages";
      const allGlobal = JSON.parse(localStorage.getItem(MSGS_KEY) || "[]");
      if (selectedConv.isGroup) {
        const gid = selectedConv.groupId;
        localStorage.setItem(MSGS_KEY, JSON.stringify(allGlobal.filter(m => m.groupId !== gid)));
        const updated = allUsers.map(u => ({ ...u, messages: (u.messages || []).filter(m => m.groupId !== gid) }));
        localStorage.setItem("mh_users", JSON.stringify(updated));
      } else {
        const oid = selectedConv.otherId;
        const keep = m => !((m.fromId === user.id && m.toId === oid) || (m.fromId === oid && m.toId === user.id));
        localStorage.setItem(MSGS_KEY, JSON.stringify(allGlobal.filter(keep)));
        const updated = allUsers.map(u => ({ ...u, messages: (u.messages || []).filter(keep) }));
        localStorage.setItem("mh_users", JSON.stringify(updated));
      }
      setSelectedConv(null);
      setConfirmPending(null);
      setTimeout(() => setAllMsgs(getMessages()), 100);
    });
  };

  const convMap = {};
  allMsgs.forEach(msg => {
    if (msg.isGroup && msg.groupId) {
      if (!convMap[msg.groupId]) {
        convMap[msg.groupId] = {
          id: msg.groupId, isGroup: true, groupId: msg.groupId,
          participantIds: msg.participantIds || [],
          participantPseudos: msg.participantPseudos || [],
          groupName: msg.groupName || null, lastMsg: null, unread: 0,
        };
      }
      if (msg.groupName) convMap[msg.groupId].groupName = msg.groupName;
      convMap[msg.groupId].lastMsg = msg;
      if (!msg.read && msg.toId === user.id) convMap[msg.groupId].unread++;
    } else {
      const otherId = msg.fromId === user.id ? msg.toId : msg.fromId;
      if (!otherId) return;
      const convKey = `dm-${otherId}`;
      if (!convMap[convKey]) {
        const contactUser = allStoredUsers.find(u => u.id === otherId) || { id: otherId, pseudo: otherId === "system" ? "Système" : otherId, avatar: "⚙️" };
        convMap[convKey] = { id: convKey, isGroup: false, otherId, pseudo: contactUser.pseudo, avatar: contactUser.avatar, lastMsg: null, unread: 0 };
      }
      convMap[convKey].lastMsg = msg;
      if (!msg.read && msg.toId === user.id) convMap[convKey].unread++;
    }
  });

  const canMessage = (conv) => {
    if (user.pseudo === "Zeus" || user.pseudo === "Cronos") return true;
    if (conv.isGroup) return true;
    if (conv.otherId === "system") return true;
    const otherUser = allStoredUsers.find(u => u.id === conv.otherId);
    if (!otherUser) return true;
    if (otherUser.pseudo === "Zeus" || otherUser.pseudo === "Cronos") return true;
    return otherUser.faction === user.faction;
  };

  const conversations = Object.values(convMap)
    .filter(canMessage)
    .sort((a, b) => (b.lastMsg?.date || "").localeCompare(a.lastMsg?.date || ""));

  const thread = selectedConv
    ? selectedConv.isGroup
      ? allMsgs.filter(m => m.groupId === selectedConv.groupId)
      : allMsgs.filter(m =>
          (m.fromId === selectedConv.otherId && m.toId === user.id) ||
          (m.toId === selectedConv.otherId && m.fromId === user.id)
        )
    : [];

  const isDisabled = !selectedConv || (!selectedConv.isGroup && selectedConv.otherId === "system");

  const formatTime = (date) => new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const linkifyText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0;
        const href = part.startsWith("http") ? part : `https://${part}`;
        return <a key={i} href={href} target="_blank" rel="noreferrer" className="msg-link" onClick={e => e.stopPropagation()}>{part}</a>;
      }
      return part;
    });
  };

  const saveGroupName = () => {
    if (!newGroupName.trim()) return;
    const msgs = JSON.parse(localStorage.getItem("mh_messages") || "[]");
    const updated = msgs.map(m => m.groupId === selectedConv.groupId ? { ...m, groupName: newGroupName.trim() } : m);
    localStorage.setItem("mh_messages", JSON.stringify(updated));
    setAllMsgs(getMessages());
    setSelectedConv(prev => ({ ...prev, groupName: newGroupName.trim() }));
    setEditingGroupName(false);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (i) => setAttachments(prev => prev.filter((_, idx) => idx !== i));

  const sendDirect = async (content) => {
    if (!selectedConv || isDisabled) return;
    const msgId = `msg-${Date.now()}`;
    const date = new Date().toISOString();
    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    if (selectedConv.isGroup) {
      const { groupId, participantIds, participantPseudos } = selectedConv;
      const groupMsg = { id: msgId, fromId: user.id, fromPseudo: user.pseudo, content, attachments: [], date, read: false, isGroup: true, groupId, participantIds, participantPseudos, groupName: selectedConv.groupName || null };
      const updatedUsers = allUsers.map(u => !participantIds?.includes(u.id) ? u : { ...u, messages: [...(u.messages || []), { ...groupMsg, read: u.id === user.id }] });
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    } else {
      const recipient = allUsers.find(u => u.id === selectedConv.otherId);
      if (!recipient) return;
      const base = { id: msgId, fromId: user.id, fromPseudo: user.pseudo, content, attachments: [], date, isGroup: false };
      const updatedUsers = allUsers.map(u => {
        if (u.id === user.id) return { ...u, messages: [...(u.messages || []), { ...base, toId: recipient.id, toPseudo: recipient.pseudo, read: true }] };
        if (u.id === recipient.id) return { ...u, messages: [...(u.messages || []), { ...base, toId: user.id, toPseudo: user.pseudo, read: false }] };
        return u;
      });
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
    }
    setTimeout(() => setAllMsgs(getMessages()), 100);
  };

  // Extract total from order message content
  const extractOrderTotal = (content) => {
    const m = content?.match(/Total\s*:\s*([\d., ]+)/);
    return m ? parseFloat(m[1].replace(/\s/g, "").replace(",", ".")) : null;
  };

  const lastOrderMsg = [...thread].reverse().find(m =>
    m.content?.includes("Total :") && m.fromId !== user.id
  );

  const handleDiscount = (percent) => {
    if (!lastOrderMsg) return;
    const total = extractOrderTotal(lastOrderMsg.content);
    if (!total) return;
    const reduction = +(total * percent / 100).toFixed(2);
    const newTotal = +(total - reduction).toFixed(2);
    const content = `🎁 Réduction de ${percent}% appliquée !\n\nTotal original : ${total.toFixed(2)} 🪙\nRéduction : -${reduction.toFixed(2)} 🪙\nNouveau total : ${newTotal.toFixed(2)} 🪙`;
    sendDirect(content);
    setDiscountOpen(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    if (isDisabled) return;
    const encodedAttachments = await Promise.all(
      attachments.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      }))
    );
    const msgId = `msg-${Date.now()}`;
    const date = new Date().toISOString();
    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    if (selectedConv.isGroup) {
      const { groupId, participantIds, participantPseudos } = selectedConv;
      const groupMsg = { id: msgId, fromId: user.id, fromPseudo: user.pseudo, content: input.trim(), attachments: encodedAttachments, date, read: false, isGroup: true, groupId, participantIds, participantPseudos, groupName: selectedConv.groupName || null };
      const updatedUsers = allUsers.map(u => !participantIds?.includes(u.id) ? u : { ...u, messages: [...(u.messages || []), { ...groupMsg, read: u.id === user.id }] });
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
      const recipients = updatedUsers.filter(u => participantIds.includes(u.id) && u.id !== user.id && u.oneSignalId);
      if (recipients.length > 0) sendNotification(recipients.map(u => u.oneSignalId), `💬 ${user.pseudo} — ${selectedConv.groupName || "Groupe"}`, input.slice(0, 100)).catch(() => {});
    } else {
      const recipient = allUsers.find(u => u.id === selectedConv.otherId);
      if (!recipient) return;
      const msgForSender = { id: msgId, fromId: user.id, fromPseudo: user.pseudo, toId: recipient.id, toPseudo: recipient.pseudo, content: input.trim(), attachments: encodedAttachments, date, read: true, isGroup: false };
      const msgForRecipient = { id: msgId, fromId: user.id, fromPseudo: user.pseudo, toId: user.id, toPseudo: user.pseudo, content: input.trim(), attachments: encodedAttachments, date, read: false, isGroup: false };
      const updatedUsers = allUsers.map(u => {
        if (u.id === user.id) return { ...u, messages: [...(u.messages || []), msgForSender] };
        if (u.id === recipient.id) return { ...u, messages: [...(u.messages || []), msgForRecipient] };
        return u;
      });
      localStorage.setItem("mh_users", JSON.stringify(updatedUsers));
      if (recipient.oneSignalId) sendNotification([recipient.oneSignalId], `💬 ${user.pseudo}`, input.slice(0, 100)).catch(() => {});
    }
    setInput("");
    setAttachments([]);
    setTimeout(() => setAllMsgs(getMessages()), 100);
  };

  const paymentPanel = (
    <div className="payment-panel">
      <h3 className="payment-title">💳 Moyens de paiement</h3>
      <div className="payment-methods">
        <button className="payment-card revolut" onClick={() => handleCopy("https://revolut.me/suururugi", "revolut")}>
          <div className="payment-logo">💙</div>
          <div className="payment-info"><span className="payment-name">Revolut</span><span className="payment-link">revolut.me/suururugi</span></div>
          <span className="payment-arrow">{copied === "revolut" ? "✓ Copié" : "📋"}</span>
        </button>
        <button className="payment-card paypal" onClick={() => handleCopy("https://www.paypal.me/darkvadorducss", "paypal")}>
          <div className="payment-logo">🅿️</div>
          <div className="payment-info"><span className="payment-name">PayPal</span><span className="payment-link">paypal.me/darkvadorducss</span></div>
          <span className="payment-arrow">{copied === "paypal" ? "✓ Copié" : "📋"}</span>
        </button>
        <button className="payment-card bitcoin" onClick={() => handleCopy("bc1qc0hget6a7wnfaylxyh78psrycm8e55gjlrxvgq", "btc")}>
          <div className="payment-logo">₿</div>
          <div className="payment-info"><span className="payment-name">Bitcoin</span><span className="payment-link">bc1qc0hget6a7wnfaylxyh78psrycm8e55gjlrxvgq</span></div>
          <span className="payment-arrow">{copied === "btc" ? "✓ Copié" : "📋"}</span>
        </button>
        <button className="payment-card ltc" onClick={() => handleCopy("LawXU3nBgDoDUUy5ijcKrgzWCT6qefgDp9", "ltc")}>
          <div className="payment-logo">Ł</div>
          <div className="payment-info"><span className="payment-name">Litecoin</span><span className="payment-link">LawXU3nBgDoDUUy5ijcKrgzWCT6qefgDp9</span></div>
          <span className="payment-arrow">{copied === "ltc" ? "✓ Copié" : "📋"}</span>
        </button>
        <button className="payment-card virement" onClick={() => handleCopy("FR76 2823 30000188 0778 9405 046", "vir")}>
          <div className="payment-logo">🏦</div>
          <div className="payment-info"><span className="payment-name">Virement bancaire</span><span className="payment-link">FR76 2823 30000188 0778 9405 046</span></div>
          <span className="payment-arrow">{copied === "vir" ? "✓ Copié" : "📋"}</span>
        </button>
      </div>
    </div>
  );

  // Users not yet in current group
  const usersNotInGroup = selectedConv?.isGroup
    ? availableUsers.filter(u => !selectedConv.participantIds?.includes(u.id))
    : [];

  return (
    <main className={`messages-page${selectedConv ? " has-conv" : ""}`}>
      {confirmPending && (
        <ConfirmModal
          message="Supprimer cette conversation ?"
          onConfirm={confirmPending}
          onCancel={() => setConfirmPending(null)}
        />
      )}
      <div className="msg-main">
        <div className="msg-thread">
          {!selectedConv ? (
            <div className="msg-empty">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
              <p>Sélectionne une conversation</p>
            </div>
          ) : (
            <>
              <div className="msg-conv-header">
                <button className="msg-back-btn" onClick={() => setSelectedConv(null)}>←</button>
                {selectedConv.isGroup ? (
                  <div className="msg-group-header">
                    <span style={{ fontSize: "1.4rem" }}>👥</span>
                    <div style={{ flex: 1 }}>
                      {editingGroupName ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <input className="group-name-input" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveGroupName(); if (e.key === "Escape") setEditingGroupName(false); }} autoFocus />
                          <button className="group-name-save" onClick={saveGroupName}>✓</button>
                          <button className="group-name-cancel" onClick={() => setEditingGroupName(false)}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div className="msg-conv-title">{selectedConv.groupName || "Groupe"}</div>
                          <button className="group-rename-btn" onClick={() => { setNewGroupName(selectedConv.groupName || "Groupe"); setEditingGroupName(true); }}>✏️</button>
                        </div>
                      )}
                      <div className="msg-conv-participants">{selectedConv.participantPseudos?.join(" · ")}</div>
                    </div>
                    <button
                      className="group-add-btn"
                      onClick={() => { setShowAddToGroup(v => !v); setAddGroupSearch(""); }}
                      title="Ajouter un membre"
                    >+ Ajouter</button>
                    <button className="conv-delete-btn" onClick={deleteConversation} title="Supprimer la conversation">🗑️</button>
                  </div>
                ) : (
                  <div className="msg-group-header" style={{ flex: 1 }}>
                    <span className="conv-avatar">{renderAvatar(selectedConv.avatar, "36px")}</span>
                    <div className="msg-conv-title" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedConv.pseudo}</div>
                    <button className="conv-delete-btn" onClick={deleteConversation} title="Supprimer la conversation">🗑️</button>
                  </div>
                )}

                {/* Add-to-group dropdown */}
                {showAddToGroup && selectedConv.isGroup && (
                  <div className="add-to-group-panel">
                    <input
                      className="mh-input"
                      placeholder="Chercher un membre..."
                      value={addGroupSearch}
                      onChange={e => setAddGroupSearch(e.target.value)}
                      autoFocus
                    />
                    <div className="add-to-group-list">
                      {usersNotInGroup
                        .filter(u => u.pseudo.toLowerCase().includes(addGroupSearch.toLowerCase()))
                        .map(u => (
                          <div key={u.id} className="add-to-group-item" onClick={() => addToGroup(u)}>
                            {renderAvatar(u.avatar, "28px")}
                            <span>{u.pseudo}</span>
                            <span className="add-to-group-plus">+</span>
                          </div>
                        ))}
                      {usersNotInGroup.length === 0 && (
                        <div style={{ color: "#7A6A50", fontSize: "0.82rem", padding: "0.5rem" }}>Tous les membres sont déjà dans le groupe</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="msg-bubbles">
                {thread.map((m, i) => {
                  const isMine = m.fromId === user.id;
                  const prevDate = i > 0 ? formatDate(thread[i-1].date) : null;
                  const currDate = formatDate(m.date);
                  return (
                    <div key={m.id}>
                      {currDate !== prevDate && <div className="msg-date-sep">{currDate}</div>}
                      <div className={`msg-bubble-wrap ${isMine ? "sent" : "received"}`}>
                        <div className={isMine ? "msg-bubble-sent" : "msg-bubble-received"}>
                          {selectedConv.isGroup && !isMine && (
                            <div className="msg-sender-name">{m.fromPseudo}</div>
                          )}
                          {m.content && <div className="msg-text">{linkifyText(m.content)}</div>}
                          {m.attachments?.length > 0 && (
                            <div className="msg-attachments">
                              {m.attachments.map((att, idx) => (
                                att.type?.startsWith("image/") ? (
                                  <img key={idx} src={att.data} alt={att.name} className="msg-attachment-img" onClick={() => window.open(att.data)} />
                                ) : (
                                  <a key={idx} href={att.data} download={att.name} className="msg-attachment-file">📄 {att.name}</a>
                                )
                              ))}
                            </div>
                          )}
                          <div className="msg-time">{formatTime(m.date)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {user?.isAdmin && (
          <>
            {paymentOpen && paymentPanel}
            <div className="payment-toggle" onClick={() => setPaymentOpen(!paymentOpen)}>
              <span>{paymentOpen ? "▼ Fermer les paiements" : "▲ Moyens de paiement"}</span>
            </div>
          </>
        )}

        <form className="msg-input-bar" onSubmit={handleSend}>
          <label className="attach-btn" title="Joindre un fichier">
            📎
            <input type="file" accept="image/*,.pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={handleFileAttach} multiple />
          </label>

          {/* Discount menu — admin only, visible when thread has an order */}
          {user?.isAdmin && lastOrderMsg && (
            <div className="discount-wrap" ref={discountRef}>
              <button
                type="button"
                className={`discount-btn${discountOpen ? " active" : ""}`}
                onClick={() => setDiscountOpen(v => !v)}
                title="Appliquer une réduction"
              >
                <span className="discount-burger">☰</span>
                <span className="discount-label">%</span>
              </button>
              {discountOpen && (
                <div className="discount-menu">
                  <div className="discount-menu-title">🎁 Réduction</div>
                  {[10, 15, 20, 25].map(p => (
                    <button key={p} type="button" className="discount-option" onClick={() => handleDiscount(p)}>
                      <span className="discount-pct">{p}%</span>
                      <span className="discount-amount">
                        -{(extractOrderTotal(lastOrderMsg.content) * p / 100).toFixed(2)} 🪙
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="msg-input-col">
            {attachments.length > 0 && (
              <div className="attachments-preview">
                {attachments.map((file, i) => (
                  <div key={i} className="attach-preview-item">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="attach-thumb" />
                    ) : (
                      <span className="attach-file-name">📄 {file.name}</span>
                    )}
                    <button type="button" className="attach-remove" onClick={() => removeAttachment(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              placeholder={isDisabled ? "Impossible de répondre au système" : "Envoyer un message…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isDisabled}
              rows={1}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
          </div>

          <button type="submit" className="msg-send-btn" disabled={isDisabled}>Envoyer</button>
        </form>
      </div>

      {/* New conversation modal */}
      {showNewConv && (
        <div className="new-conv-modal">
          <div className="new-conv-inner">
            <button className="modal-close" onClick={() => { setShowNewConv(false); setSearchUser(""); setNewConvMode("dm"); setSelectedGroupUsers([]); }}>✕</button>
            <h3 className="new-conv-title">Nouvelle conversation</h3>

            {/* DM / Group toggle */}
            <div className="new-conv-tabs">
              <button className={`new-conv-tab${newConvMode === "dm" ? " active" : ""}`} onClick={() => { setNewConvMode("dm"); setSelectedGroupUsers([]); }}>
                💬 Message privé
              </button>
              <button className={`new-conv-tab${newConvMode === "group" ? " active" : ""}`} onClick={() => setNewConvMode("group")}>
                👥 Groupe
              </button>
            </div>

            <input
              className="mh-input"
              placeholder="Chercher un membre..."
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              autoFocus
            />

            {newConvMode === "dm" ? (
              <div className="new-conv-list">
                {availableUsers
                  .filter(u => u.pseudo.toLowerCase().includes(searchUser.toLowerCase()))
                  .map(u => (
                    <div key={u.id} className="new-conv-item" onClick={() => startConversation(u)}>
                      <div className="contact-avatar">
                        {typeof u.avatar === "string" && (u.avatar.startsWith("data:") || u.avatar.startsWith("http"))
                          ? <img src={u.avatar} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }} />
                          : <span style={{ fontSize: "1.3rem" }}>{u.avatar || "⚡"}</span>}
                      </div>
                      <div>
                        <div className="contact-name">{u.pseudo}</div>
                        <div className="contact-preview">{u.perms?.[0] || "Membre"}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <>
                <div className="new-conv-list">
                  {availableUsers
                    .filter(u => u.pseudo.toLowerCase().includes(searchUser.toLowerCase()))
                    .map(u => {
                      const selected = selectedGroupUsers.find(x => x.id === u.id);
                      return (
                        <div key={u.id} className={`new-conv-item${selected ? " selected" : ""}`} onClick={() => toggleGroupUser(u)}>
                          <div className="contact-avatar">
                            {typeof u.avatar === "string" && (u.avatar.startsWith("data:") || u.avatar.startsWith("http"))
                              ? <img src={u.avatar} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }} />
                              : <span style={{ fontSize: "1.3rem" }}>{u.avatar || "⚡"}</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="contact-name">{u.pseudo}</div>
                            <div className="contact-preview">{u.perms?.[0] || "Membre"}</div>
                          </div>
                          <span className="group-check">{selected ? "✓" : "+"}</span>
                        </div>
                      );
                    })}
                </div>
                {selectedGroupUsers.length > 0 && (
                  <div className="group-selected-bar">
                    <span>{selectedGroupUsers.map(u => u.pseudo).join(", ")}</span>
                    <button className="mh-btn" onClick={createGroup} disabled={selectedGroupUsers.length < 1}>
                      Créer le groupe ({selectedGroupUsers.length + 1})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="msg-contacts">
        <div className="msg-contacts-header">
          <span>💬 Conversations</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button className="new-conv-btn mark-all-read-btn" onClick={markEverythingRead} title="Tout marquer en lu">✓</button>
            <button className="new-conv-btn" onClick={() => setShowNewConv(true)}>+</button>
          </div>
        </div>
        {conversations.length === 0 && (
          <div style={{ color: "#7A6A50", padding: "1.5rem", textAlign: "center", fontSize: "0.85rem" }}>
            Aucune conversation
          </div>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`contact-item ${selectedConv?.id === conv.id ? "active" : ""}`}
            onClick={() => setSelectedConv(conv)}
          >
            <div className="contact-avatar">
              {conv.isGroup ? <span style={{ fontSize: "1.2rem" }}>👥</span> : renderAvatar(conv.avatar, "40px")}
            </div>
            <div className="contact-info">
              <div className="contact-name">
                {conv.isGroup ? (conv.groupName || `👥 ${conv.participantPseudos?.join(" · ")}`) : conv.pseudo}
              </div>
              <div className="contact-preview">
                {conv.lastMsg?.content?.slice(0, 35)}{conv.lastMsg?.content?.length > 35 ? "…" : ""}
              </div>
            </div>
            {conv.unread > 0 && <span className="msg-badge">{conv.unread}</span>}
          </div>
        ))}
      </div>
    </main>
  );
}
