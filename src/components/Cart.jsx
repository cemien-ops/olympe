import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CoinIcon from "./CoinIcon";

export default function Cart() {
  const { items, remove, clear, total, open, setOpen } = useCart();
  const { user } = useAuth();

  if (!open) return null;

  const handleCheckout = () => {
    if (!user) { alert("Connecte-toi pour passer commande !"); return; }

    const allUsers = JSON.parse(localStorage.getItem("mh_users") || "[]");
    const freshUser = allUsers.find(u => u.id === user.id);
    if (!freshUser) return;

    const parrainRefs = Array.isArray(freshUser.parrain)
      ? freshUser.parrain
      : typeof freshUser.parrain === "string" && freshUser.parrain.trim()
        ? freshUser.parrain.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const parrains = parrainRefs.map(ref => {
      const trimmed = ref.trim();
      const byPseudo = allUsers.filter(u => u.pseudo.toLowerCase() === trimmed.toLowerCase());
      if (byPseudo.length === 1) return byPseudo[0];
      if (byPseudo.length > 1) return allUsers.find(u => u.customId === trimmed) || null;
      return allUsers.find(u => u.customId === trimmed) || null;
    }).filter(Boolean);

    const zeus = allUsers.find(u => u.pseudo === "Zeus");
    const participantIds = [
      freshUser.id,
      ...(zeus ? [zeus.id] : []),
      ...parrains.map(p => p.id),
    ].filter(Boolean).filter((id, i, arr) => arr.indexOf(id) === i);
    const participantPseudos = [
      freshUser.pseudo,
      ...(zeus ? ["Zeus"] : []),
      ...parrains.map(p => p.pseudo),
    ].filter(Boolean).filter((p, i, arr) => arr.indexOf(p) === i);

    const now = Date.now();
    const groupId = `group-order-${now}`;
    const msgId = `msg-${now}`;
    const itemsList = items.map(i => `• ${i.role || i.name} — ${(i.effectivePrice ?? i.price).toFixed(2)} 🪙`).join("\n");

    const orderMsg = {
      id: msgId,
      fromId: "system", fromPseudo: "Système",
      toId: null,
      content: `🛒 Nouvelle commande de ${freshUser.pseudo} !\n\nItems :\n${itemsList}\n\nTotal : ${total.toFixed(2)} 🪙\nDate : ${new Date().toLocaleString("fr-FR")}`,
      date: new Date().toISOString(),
      read: false,
      attachments: [],
      isGroup: true,
      groupId,
      participantIds,
      participantPseudos,
    };

    const msgs = JSON.parse(localStorage.getItem("mh_messages") || "[]");
    if (!msgs.some(m => m.id === msgId)) {
      msgs.push(orderMsg);
    }
    localStorage.setItem("mh_messages", JSON.stringify(msgs));

    const order = {
      id: Date.now(),
      userId: freshUser.id,
      pseudo: freshUser.pseudo,
      items: items.map(i => ({ name: i.role || i.name, price: i.effectivePrice ?? i.price })),
      total,
      date: new Date().toISOString(),
      treated: false,
      groupId, participantIds, participantPseudos,
    };
    const orders = JSON.parse(localStorage.getItem("mh_orders") || "[]");
    localStorage.setItem("mh_orders", JSON.stringify([...orders, order]));

    clear();
    setOpen(false);
    alert("✅ Commande envoyée ! Zeus a été notifié ⚡");
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setOpen(false)} />
      <aside className="cart-panel">
        <div className="cart-header">
          <h2>🛒 Panier</h2>
          <button className="cart-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span>⚡</span>
            <p>Ton panier est vide</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.role || item.name}</span>
                    <span className="cart-item-price">{item.effectivePrice ?? item.price} <CoinIcon size={14} /></span>
                  </div>
                  <button className="cart-item-remove" onClick={() => remove(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>{total.toFixed(2)} <CoinIcon size={16} /></span>
              </div>
              <button className="btn-primary" onClick={handleCheckout}>Commander</button>
              <button className="btn-ghost" onClick={clear}>Vider le panier</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
