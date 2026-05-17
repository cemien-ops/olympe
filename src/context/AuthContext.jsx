import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { requestPermission } from "../onesignal";
import { supabase } from "../supabase";

const AuthContext = createContext();
const SESSION_KEY = "mh_session";

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Normalize DB snake_case → camelCase (keeps both for compatibility)
const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    isAdmin:     u.is_admin      ?? false,
    customId:    u.custom_id     ?? null,
    oneSignalId: u.onesignal_id  ?? null,
  };
};

const normalizeOrder = (o) => ({
  ...o,
  userId:           o.user_id            ?? o.userId,
  groupId:          o.group_id            ?? o.groupId            ?? null,
  participantIds:   o.participant_ids     ?? o.participantIds     ?? [],
  participantPseudos: o.participant_pseudos ?? o.participantPseudos ?? [],
  groupName:        o.group_name          ?? o.groupName          ?? null,
});

const normalizeMsg = (m) => {
  if (!m) return null;
  return {
    ...m,
    fromId:           m.from_id            ?? m.fromId,
    fromPseudo:       m.from_pseudo         ?? m.fromPseudo,
    toId:             m.to_id              ?? m.toId,
    toPseudo:         m.to_pseudo           ?? m.toPseudo,
    isGroup:          m.is_group            ?? false,
    groupId:          m.group_id            ?? null,
    participantIds:   m.participant_ids     ?? [],
    participantPseudos: m.participant_pseudos ?? [],
    groupName:        m.group_name          ?? null,
    readBy:           m.read_by             ?? [],
  };
};

async function seedDefaults() {
  if (!supabase) return;

  const hashKraken = await sha256("Kraken");
  const pw         = await sha256("olympe");

  const mkAv = (bg, shape) =>
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='${encodeURIComponent(bg)}'/%3E${shape}%3C/svg%3E`;
  const avDip = (bg) => mkAv(bg, "%3Ccircle cx='50' cy='50' r='28' fill='%238BA3C7' opacity='0.55'/%3E%3Ccircle cx='50' cy='50' r='16' fill='%238BA3C7' opacity='0.4'/%3E");
  const avAmb = (bg) => mkAv(bg, "%3Crect x='30' y='30' width='40' height='40' rx='4' fill='%23CD7F32' opacity='0.6' transform='rotate(45 50 50)'/%3E");
  const avMbr = (bg) => mkAv(bg, "%3Crect x='32' y='32' width='36' height='36' rx='3' fill='none' stroke='%23C9A227' stroke-width='3' opacity='0.65' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%23C9A227' opacity='0.5'/%3E");

  // upsert: insert new rows, skip if id already exists
  await supabase.from("users").upsert([
    { id: "zeus-001",        pseudo: "Kraken",      password: hashKraken, is_admin: true,  faction: "olympe", avatar: "https://i.imgur.com/QtQ2XUJ.jpg", perms: ["Gérant", "Couronne"], abonnement: null,     whitelist: [] },
    { id: "user-hermes",     pseudo: "Hermès",      password: pw,         is_admin: false, faction: "olympe", avatar: avDip("#0a1825"), perms: ["Diplomate"],   abonnement: "GOLD",   whitelist: [] },
    { id: "user-athena",     pseudo: "Athéna",      password: pw,         is_admin: false, faction: "olympe", avatar: avDip("#0d1220"), perms: ["Diplomate"],   abonnement: "SILVER", whitelist: [] },
    { id: "user-poseidon",   pseudo: "Poséidon",    password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#071520"), perms: ["Ambassadeur"], abonnement: null,     whitelist: ["Elysée"] },
    { id: "user-ares",       pseudo: "Arès",        password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#1a0808"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-apollon",    pseudo: "Apollon",     password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#1a1208"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-artemis",    pseudo: "Artémis",     password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#080f1a"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-hera",       pseudo: "Héra",        password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#1a0818"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-demeter",    pseudo: "Déméter",     password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#0d1a08"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-hestia",     pseudo: "Hestia",      password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#1a0e08"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-persephone", pseudo: "Perséphone",  password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#0e081a"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-hecate",     pseudo: "Hécate",      password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#08081a"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-hypnos",     pseudo: "Hypnos",      password: pw,         is_admin: false, faction: "olympe", avatar: avAmb("#080d18"), perms: ["Ambassadeur"], abonnement: null,     whitelist: [] },
    { id: "user-hephaistos", pseudo: "Héphaïstos",  password: pw,         is_admin: false, faction: "olympe", avatar: avMbr("#120e08"), perms: [],             abonnement: null,     whitelist: [] },
    { id: "user-dionysos",   pseudo: "Dionysos",    password: pw,         is_admin: false, faction: "olympe", avatar: avMbr("#0e0812"), perms: [],             abonnement: null,     whitelist: [] },
    { id: "user-hades",      pseudo: "Hadès",       password: pw,         is_admin: false, faction: "olympe", avatar: avMbr("#08080e"), perms: [],             abonnement: null,     whitelist: [] },
  ], { onConflict: "id", ignoreDuplicates: true });

  await supabase.from("messages").upsert([{
    id: "welcome-kraken",
    from_id: "system", from_pseudo: "Système",
    to_id: "zeus-001", to_pseudo: "Kraken",
    content: "Bienvenue, Seigneur de l'Olympe. Le site est opérationnel.",
    date: new Date().toISOString(), read: true,
  }], { onConflict: "id", ignoreDuplicates: true });
}

export function AuthProvider({ children }) {
  const [users,  setUsers]  = useState([]);
  const [user,   setUser]   = useState(null);
  const [msgs,   setMsgs]   = useState([]);
  const [orders, setOrders] = useState([]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase non configuré. Remplis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local");
      return;
    }
    (async () => {
      await seedDefaults();
      const [{ data: ud }, { data: md }, ordRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("messages").select("*"),
        Promise.resolve(supabase.from("orders").select("*")).catch(() => ({ data: [] })),
      ]);
      const nu = (ud || []).map(normalizeUser);
      const nm = (md || []).map(normalizeMsg);
      setUsers(nu);
      setMsgs(nm);
      setOrders((ordRes?.data || []).map(normalizeOrder));
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const u = nu.find(u => u.id === sessionId);
        if (u) {
          setUser(u);
          supabase.from("users").update({ last_seen: new Date().toISOString() }).eq("id", u.id);
        }
      }
    })();
  }, []);

  // ── Heartbeat last_seen ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || !supabase) return;
    const beat = async () => {
      await supabase.from("users").update({ last_seen: new Date().toISOString() }).eq("id", user.id);
    };
    beat();
    const t = setInterval(beat, 60_000);
    return () => clearInterval(t);
  }, [user?.id]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel("olympe-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" },
        ({ eventType, new: row, old: oldRow }) => {
          if (eventType === "INSERT") {
            setUsers(prev => [...prev, normalizeUser(row)]);
          } else if (eventType === "UPDATE") {
            const n = normalizeUser(row);
            setUsers(prev => prev.map(u => u.id === n.id ? n : u));
            setUser(prev => prev?.id === n.id ? n : prev);
          } else if (eventType === "DELETE") {
            setUsers(prev => prev.filter(u => u.id !== oldRow.id));
            setUser(prev => prev?.id === oldRow.id ? null : prev);
          }
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" },
        ({ eventType, new: row, old: oldRow }) => {
          if (eventType === "INSERT") {
            setMsgs(prev => [...prev, normalizeMsg(row)]);
          } else if (eventType === "UPDATE") {
            const n = normalizeMsg(row);
            setMsgs(prev => prev.map(m => m.id === n.id ? n : m));
          } else if (eventType === "DELETE") {
            setMsgs(prev => prev.filter(m => m.id !== oldRow.id));
          }
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" },
        ({ eventType, new: row, old: oldRow }) => {
          if (eventType === "INSERT") {
            setOrders(prev => [...prev, normalizeOrder(row)]);
          } else if (eventType === "UPDATE") {
            const n = normalizeOrder(row);
            setOrders(prev => prev.map(o => o.id === n.id ? n : o));
          } else if (eventType === "DELETE") {
            setOrders(prev => prev.filter(o => o.id !== oldRow.id));
          }
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (pseudo, password) => {
    if (!supabase) return false;
    const hash = await sha256(password);
    const { data } = await supabase
      .from("users")
      .select("*")
      .ilike("pseudo", pseudo.trim())
      .eq("password", hash)
      .single();
    if (!data) return false;
    const u = normalizeUser(data);
    setUser(u);
    localStorage.setItem(SESSION_KEY, u.id);
    await supabase.from("users").update({ last_seen: new Date().toISOString() }).eq("id", u.id);
    setTimeout(async () => {
      try {
        const osId = await requestPermission();
        if (osId) await supabase.from("users").update({ onesignal_id: osId }).eq("id", u.id);
      } catch {}
    }, 2000);
    return true;
  };

  const logout = async () => {
    if (user && supabase) {
      await supabase.from("users").update({ last_seen: null }).eq("id", user.id);
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // ── Users CRUD ────────────────────────────────────────────────────────────
  const createUser = async ({ pseudo, password, avatar, isAdmin, customId, perms: userPerms, abonnement, whitelist: userWL }) => {
    if (!supabase) return null;
    const hash = await sha256(password);
    const row = {
      id:         `user-${Date.now()}`,
      pseudo:     pseudo.trim(),
      password:   hash,
      is_admin:   !!isAdmin,
      avatar:     avatar || "⚡",
      custom_id:  customId || null,
      parrain:    user?.pseudo || null,
      faction:    "olympe",
      perms:      userPerms || [],
      abonnement: abonnement || null,
      whitelist:  userWL || [],
    };
    const { data } = await supabase.from("users").insert(row).select().single();
    if (data) {
      await supabase.from("messages").insert({
        id: `msg-${Date.now()}-welcome`,
        from_id: data.id, from_pseudo: data.pseudo,
        to_id: "zeus-001", to_pseudo: "Kraken",
        content: `Salve Kraken, je rejoins les rangs des Olympiens.`,
        date: new Date().toISOString(), read: false,
      });
    }
    return data ? normalizeUser(data) : null;
  };

  const deleteUser = async (id) => {
    if (!supabase || id === "zeus-001") return;
    await supabase.from("users").delete().eq("id", id);
  };

  const updateUser = async (id, data) => {
    if (!supabase) return;
    const dbData = { ...data };
    if ("isAdmin"     in dbData) { dbData.is_admin     = dbData.isAdmin;     delete dbData.isAdmin; }
    if ("customId"    in dbData) { dbData.custom_id    = dbData.customId;    delete dbData.customId; }
    if ("oneSignalId" in dbData) { dbData.onesignal_id = dbData.oneSignalId; delete dbData.oneSignalId; }
    await supabase.from("users").update(dbData).eq("id", id);
    // Optimistic local update
    const patch = { ...dbData };
    if ("is_admin"     in patch) patch.isAdmin  = patch.is_admin;
    if ("custom_id"    in patch) patch.customId = patch.custom_id;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
    if (user?.id === id) setUser(prev => ({ ...prev, ...patch }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!supabase || !user) return false;
    const currentHash = await sha256(currentPassword);
    const u = users.find(u => u.id === user.id);
    if (!u || u.password !== currentHash) return false;
    const newHash = await sha256(newPassword);
    await supabase.from("users").update({ password: newHash }).eq("id", user.id);
    return true;
  };

  // ── Messages ──────────────────────────────────────────────────────────────
  const sendMessage = async (toId, content, attachments = []) => {
    if (!supabase || !user) return;
    const toUser = users.find(u => u.id === toId);
    if (!toUser) return;
    await supabase.from("messages").insert({
      id: `msg-${Date.now()}`,
      from_id: user.id, from_pseudo: user.pseudo,
      to_id: toId, to_pseudo: toUser.pseudo,
      content, date: new Date().toISOString(),
      read: false, is_group: false,
      attachments: attachments || [],
    });
  };

  const sendGroupMessage = async ({ groupId, participantIds, participantPseudos, content, attachments = [], groupName = null }) => {
    if (!supabase || !user) return;
    await supabase.from("messages").insert({
      id: `msg-${Date.now()}`,
      from_id: user.id, from_pseudo: user.pseudo,
      content, date: new Date().toISOString(),
      read_by: [user.id],
      attachments, is_group: true,
      group_id: groupId,
      participant_ids: participantIds,
      participant_pseudos: participantPseudos,
      group_name: groupName,
    });
  };

  const createGroupConv = async (participants) => {
    if (!supabase || !user) return null;
    const groupId        = `group-${Date.now()}`;
    const participantIds     = [user, ...participants].map(u => u.id);
    const participantPseudos = [user, ...participants].map(u => u.pseudo);
    await supabase.from("messages").insert({
      id: `msg-${Date.now()}-init`,
      from_id: user.id, from_pseudo: user.pseudo,
      content: `Groupe créé par ${user.pseudo}`,
      date: new Date().toISOString(),
      read_by: [user.id],
      attachments: [], is_group: true,
      group_id: groupId,
      participant_ids: participantIds,
      participant_pseudos: participantPseudos,
      group_name: null,
    });
    return { groupId, participantIds, participantPseudos };
  };

  const addUserToGroup = async (groupId, newU, currentParticipantIds, currentParticipantPseudos) => {
    if (!supabase || newU === undefined) return null;
    const newIds    = [...currentParticipantIds, newU.id];
    const newPseudos = [...currentParticipantPseudos, newU.pseudo];
    await supabase.from("messages")
      .update({ participant_ids: newIds, participant_pseudos: newPseudos })
      .eq("group_id", groupId);
    await supabase.from("messages").insert({
      id: `msg-${Date.now()}-join`,
      from_id: "system", from_pseudo: "Système",
      content: `${newU.pseudo} a rejoint le groupe`,
      date: new Date().toISOString(),
      read_by: newIds,
      attachments: [], is_group: true,
      group_id: groupId,
      participant_ids: newIds,
      participant_pseudos: newPseudos,
      group_name: null,
    });
    return { participantIds: newIds, participantPseudos: newPseudos };
  };

  const saveGroupNameDB = async (groupId, name) => {
    if (!supabase) return;
    await supabase.from("messages").update({ group_name: name }).eq("group_id", groupId);
    setMsgs(prev => prev.map(m => m.groupId === groupId ? { ...m, group_name: name, groupName: name } : m));
  };

  const deleteConversationDB = async (conv) => {
    if (!supabase || !user) return;
    if (conv.isGroup) {
      await supabase.from("messages").delete().eq("group_id", conv.groupId);
    } else {
      await supabase.from("messages").delete().eq("from_id", user.id).eq("to_id", conv.otherId);
      await supabase.from("messages").delete().eq("from_id", conv.otherId).eq("to_id", user.id);
    }
  };

  const markRead = async (messageId) => {
    if (!supabase) return;
    await supabase.from("messages").update({ read: true }).eq("id", messageId);
    setMsgs(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  const markAllRead = async (contactId) => {
    if (!supabase || !user) return;
    await supabase.from("messages").update({ read: true }).eq("to_id", user.id).eq("from_id", contactId);
    setMsgs(prev => prev.map(m => m.toId === user.id && m.fromId === contactId ? { ...m, read: true } : m));
  };

  const markEverythingRead = async () => {
    if (!supabase || !user) return;
    await supabase.from("messages").update({ read: true }).eq("to_id", user.id);
    setMsgs(prev => prev.map(m => m.toId === user.id ? { ...m, read: true } : m));
  };

  const createOrder = async (order) => {
    if (!supabase) return;
    await supabase.from("orders").insert({
      id:                 String(order.id),
      user_id:            order.userId,
      pseudo:             order.pseudo,
      items:              order.items,
      total:              order.total,
      date:               order.date,
      treated:            false,
      group_id:           order.groupId           || null,
      participant_ids:    order.participantIds     || [],
      participant_pseudos: order.participantPseudos || [],
      group_name:         order.groupName          || null,
    });
  };

  const treatOrder = async (orderId) => {
    if (!supabase) return;
    await supabase.from("orders").update({ treated: true }).eq("id", String(orderId));
  };

  const markGroupRead = async (groupId) => {
    if (!supabase || !user) return;
    const unread = msgs.filter(m =>
      m.isGroup && m.groupId === groupId && m.fromId !== user.id && !m.readBy?.includes(user.id)
    );
    for (const m of unread) {
      const newReadBy = [...(m.readBy || []), user.id];
      await supabase.from("messages").update({ read_by: newReadBy }).eq("id", m.id);
      setMsgs(prev => prev.map(x => x.id === m.id ? { ...x, read_by: newReadBy, readBy: newReadBy } : x));
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const getMessages = useCallback(() => {
    if (!user) return [];
    return msgs.filter(m =>
      m.toId === user.id || m.fromId === user.id ||
      (m.isGroup && Array.isArray(m.participantIds) && m.participantIds.includes(user.id))
    );
  }, [msgs, user]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return msgs.filter(m => {
      const mine = m.toId === user.id || m.fromId === user.id ||
        (m.isGroup && Array.isArray(m.participantIds) && m.participantIds.includes(user.id));
      if (!mine) return false;
      if (m.isGroup) return m.fromId !== user.id && !m.readBy?.includes(user.id);
      return !m.read && m.toId === user.id && m.fromId !== "system";
    }).length;
  }, [msgs, user]);

  const getUnreadCount = useCallback(() => unreadCount, [unreadCount]);

  const members = users.map(u => ({
    pseudo:     u.pseudo,
    avatar:     u.avatar,
    customId:   u.customId   || null,
    parrain:    u.parrain    || null,
    faction:    u.faction    || "olympe",
    isAdmin:    !!u.isAdmin,
    perms:      u.perms      || [],
    abonnement: u.abonnement || null,
    whitelist:  u.whitelist  || [],
    lastSeen:   u.last_seen  ?? null,
  }));

  const deleteProfile = async (pseudo) => {
    const u = users.find(u => u.pseudo === pseudo);
    if (u && u.id !== "zeus-001") await deleteUser(u.id);
    logout();
  };

  const updatePossessions = (updates) => {
    if (!user) return;
    updateUser(user.id, updates);
  };

  return (
    <AuthContext.Provider value={{
      user, users, members,
      login, logout, createUser, deleteUser, updateUser, changePassword,
      sendMessage, sendGroupMessage, createGroupConv, addUserToGroup,
      saveGroupNameDB, deleteConversationDB, markGroupRead,
      orders, createOrder, treatOrder,
      getMessages, getUnreadCount, unreadCount, markRead, markAllRead, markEverythingRead,
      deleteProfile, updatePossessions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
