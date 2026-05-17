import { createContext, useContext, useState, useEffect } from "react";
import { requestPermission } from "../onesignal";

const AuthContext = createContext();

const USERS_KEY    = "mh_users";
const MESSAGES_KEY = "mh_messages";
const SESSION_KEY  = "mh_session";

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function loadUsers()    { try { return JSON.parse(localStorage.getItem(USERS_KEY))    || []; } catch { return []; } }
function loadMessages() { try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; } catch { return []; } }
function saveUsersStorage(u)   { localStorage.setItem(USERS_KEY,    JSON.stringify(u)); }
function saveMessagesStorage(m){ localStorage.setItem(MESSAGES_KEY, JSON.stringify(m)); }

const DB_VERSION = "5";

export function AuthProvider({ children }) {
  const [users, setUsersState] = useState([]);
  const [user,  setUser]       = useState(null);
  const [msgs,  setMsgsState]  = useState([]);

  useEffect(() => {
    (async () => {
      const savedVersion = localStorage.getItem("mh_db_version");
      if (savedVersion !== DB_VERSION) {
        localStorage.removeItem(USERS_KEY);
        localStorage.setItem("mh_db_version", DB_VERSION);
      }

      let stored = loadUsers();
      let storedMsgs = loadMessages();

      if (stored.length === 0) {
        const hashKraken = await sha256("Kraken");
        const pw         = await sha256("olympe");

        const mkAv = (bg, shape) =>
          `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='${encodeURIComponent(bg)}'/%3E${shape}%3C/svg%3E`;

        // Diplomate : cercle intérieur argent
        const avDip  = (bg) => mkAv(bg, "%3Ccircle cx='50' cy='50' r='28' fill='%238BA3C7' opacity='0.55'/%3E%3Ccircle cx='50' cy='50' r='16' fill='%238BA3C7' opacity='0.4'/%3E");
        // Ambassadeur : losange bronze
        const avAmb  = (bg) => mkAv(bg, "%3Crect x='30' y='30' width='40' height='40' rx='4' fill='%23CD7F32' opacity='0.6' transform='rotate(45 50 50)'/%3E");
        // Membre : losange simple doré
        const avMbr  = (bg) => mkAv(bg, "%3Crect x='32' y='32' width='36' height='36' rx='3' fill='none' stroke='%23C9A227' stroke-width='3' opacity='0.65' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%23C9A227' opacity='0.5'/%3E");

        stored = [
          {
            id: "zeus-001", pseudo: "Kraken", password: hashKraken,
            isAdmin: true, faction: "olympe",
            avatar: "https://i.imgur.com/QtQ2XUJ.jpg",
            perms: ["Gérant", "Couronne"], abonnement: null, whitelist: [],
          },
          {
            id: "user-hermes", pseudo: "Hermès", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avDip("#0a1825"),
            perms: ["Diplomate"], abonnement: "GOLD", whitelist: [],
          },
          {
            id: "user-athena", pseudo: "Athéna", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avDip("#0d1220"),
            perms: ["Diplomate"], abonnement: "SILVER", whitelist: [],
          },
          {
            id: "user-poseidon", pseudo: "Poséidon", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avAmb("#071520"),
            perms: ["Ambassadeur"], abonnement: null, whitelist: ["Elysée"],
          },
          {
            id: "user-ares", pseudo: "Arès", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avAmb("#1a0808"),
            perms: ["Ambassadeur"], abonnement: null, whitelist: [],
          },
          {
            id: "user-apollon", pseudo: "Apollon", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avAmb("#1a1208"),
            perms: ["Ambassadeur"], abonnement: null, whitelist: [],
          },
          {
            id: "user-artemis", pseudo: "Artémis", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avAmb("#080f1a"),
            perms: ["Ambassadeur"], abonnement: null, whitelist: [],
          },
          {
            id: "user-hephaistos", pseudo: "Héphaïstos", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avMbr("#120e08"),
            perms: [], abonnement: null, whitelist: [],
          },
          {
            id: "user-dionysos", pseudo: "Dionysos", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avMbr("#0e0812"),
            perms: [], abonnement: null, whitelist: [],
          },
          {
            id: "user-hades", pseudo: "Hadès", password: pw,
            isAdmin: false, faction: "olympe",
            avatar: avMbr("#08080e"),
            perms: [], abonnement: null, whitelist: [],
          },
        ];
        saveUsersStorage(stored);

        storedMsgs = [
          {
            id: "welcome-kraken",
            fromId: "system", fromPseudo: "Système",
            toId: "zeus-001", toPseudo: "Kraken",
            content: "Bienvenue, Seigneur de l'Olympe. Le site est opérationnel.",
            date: new Date().toISOString(), read: true,
          },
        ];
        saveMessagesStorage(storedMsgs);
      }

      setUsersState(stored);
      setMsgsState(storedMsgs);

      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const u = stored.find(u => u.id === sessionId);
        if (u) setUser(u);
      }
    })();
  }, []);

  const saveUsers = (newUsers) => { setUsersState(newUsers); saveUsersStorage(newUsers); };
  const saveMsgs  = (newMsgs)  => { setMsgsState(newMsgs);  saveMessagesStorage(newMsgs); };

  const login = async (pseudo, password) => {
    const hash = await sha256(password);
    const u = loadUsers().find(u => u.pseudo.toLowerCase() === pseudo.trim().toLowerCase() && u.password === hash);
    if (!u) return false;
    setUser(u);
    localStorage.setItem(SESSION_KEY, u.id);
    setTimeout(async () => {
      try {
        const osId = await requestPermission();
        if (osId) {
          const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
          const updated = allUsers.map(usr =>
            usr.id === u.id ? { ...usr, oneSignalId: osId } : usr
          );
          localStorage.setItem(USERS_KEY, JSON.stringify(updated));
        }
      } catch {}
    }, 2000);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const createUser = async ({ pseudo, password, avatar, isAdmin, customId, perms: userPerms, abonnement, whitelist: userWL }) => {
    const hash = await sha256(password);
    const newUser = {
      id: `user-${Date.now()}`,
      pseudo: pseudo.trim(),
      password: hash,
      isAdmin: !!isAdmin,
      avatar: avatar || "⚡",
      customId: customId || null,
      parrain: user?.pseudo || null,
      faction: "olympe",
      perms: userPerms || [],
      abonnement: abonnement || null,
      whitelist: userWL || [],
    };
    const updated = [...loadUsers(), newUser];
    saveUsers(updated);
    const autoMsg = {
      id: `msg-${Date.now()}-welcome`,
      fromId: newUser.id, fromPseudo: newUser.pseudo,
      toId: "zeus-001", toPseudo: "Kraken",
      content: `Salve Kraken, je rejoins les rangs des Olympiens.`,
      date: new Date().toISOString(), read: false,
    };
    saveMsgs([...loadMessages(), autoMsg]);
    return newUser;
  };

  const deleteUser = (id) => {
    if (id === "zeus-001") return;
    saveUsers(loadUsers().filter(u => u.id !== id));
  };

  const changePassword = async (currentPassword, newPassword) => {
    const currentHash = await sha256(currentPassword);
    const allUsers = loadUsers();
    const u = allUsers.find(u => u.id === user?.id);
    if (!u || u.password !== currentHash) return false;
    const newHash = await sha256(newPassword);
    saveUsers(allUsers.map(u => u.id === user.id ? { ...u, password: newHash } : u));
    return true;
  };

  const updateUser = (id, data) => {
    const updated = loadUsers().map(u => u.id === id ? { ...u, ...data } : u);
    saveUsers(updated);
    if (user?.id === id) setUser(prev => ({ ...prev, ...data }));
  };

  const sendMessage = (toId, content, attachments = []) => {
    const allUsers = loadUsers();
    const toUser = allUsers.find(u => u.id === toId);
    if (!toUser || !user) return;
    const msg = {
      id: `msg-${Date.now()}`,
      fromId: user.id, fromPseudo: user.pseudo,
      toId, toPseudo: toUser.pseudo,
      content, date: new Date().toISOString(), read: false,
      attachments,
    };
    const updated = [...loadMessages(), msg];
    saveMsgs(updated);
  };

  const getUserMessages = () => {
    if (!user) return [];
    const allUsers = loadUsers();
    const freshUser = allUsers.find(u => u.id === user.id);
    const flat = loadMessages().filter(m =>
      m.toId === user.id || m.fromId === user.id ||
      (m.isGroup && Array.isArray(m.participantIds) && m.participantIds.includes(user.id))
    );
    const perUser = (freshUser?.messages || []);
    const merged = [...flat, ...perUser];
    const seen = new Set();
    return merged.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
  };

  const getMessages = () => getUserMessages();

  const getUnreadCount = () => {
    return getUserMessages().filter(m =>
      !m.read && m.fromId !== user?.id && m.fromId !== "system"
    ).length;
  };

  const markRead = (messageId) => {
    const updated = loadMessages().map(m => m.id === messageId ? { ...m, read: true } : m);
    saveMsgs(updated);
    const allUsers = loadUsers();
    const updatedUsers = allUsers.map(u =>
      u.id === user?.id
        ? { ...u, messages: (u.messages || []).map(m => m.id === messageId ? { ...m, read: true } : m) }
        : u
    );
    saveUsersStorage(updatedUsers);
  };

  const markAllRead = (contactId) => {
    const updated = loadMessages().map(m =>
      m.toId === user?.id && m.fromId === contactId ? { ...m, read: true } : m
    );
    saveMsgs(updated);
    const allUsers = loadUsers();
    const updatedUsers = allUsers.map(u =>
      u.id === user?.id
        ? { ...u, messages: (u.messages || []).map(m => m.fromId === contactId ? { ...m, read: true } : m) }
        : u
    );
    saveUsersStorage(updatedUsers);
  };

  const markEverythingRead = () => {
    const updated = loadMessages().map(m =>
      m.toId === user?.id ? { ...m, read: true } : m
    );
    saveMsgs(updated);
    const allUsers = loadUsers();
    const updatedUsers = allUsers.map(u =>
      u.id === user?.id
        ? { ...u, messages: (u.messages || []).map(m => ({ ...m, read: true })) }
        : u
    );
    saveUsersStorage(updatedUsers);
  };

  const members = users.map(u => ({
    pseudo: u.pseudo,
    avatar: u.avatar,
    customId: u.customId || null,
    parrain: u.parrain || null,
    faction: u.faction || "olympe",
    isAdmin: !!u.isAdmin,
    perms: u.perms || [],
    abonnement: u.abonnement || null,
    whitelist: u.whitelist || [],
  }));

  const deleteProfile = (pseudo) => {
    const u = loadUsers().find(u => u.pseudo === pseudo);
    if (u && u.id !== "zeus-001") deleteUser(u.id);
    logout();
  };

  const updatePossessions = (updates) => {
    if (!user) return;
    updateUser(user.id, updates);
  };

  return (
    <AuthContext.Provider value={{
      user, users, members,
      login, logout, createUser, deleteUser, updateUser,
      sendMessage, getMessages, getUnreadCount, markRead, markAllRead, markEverythingRead, changePassword,
      deleteProfile, updatePossessions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
