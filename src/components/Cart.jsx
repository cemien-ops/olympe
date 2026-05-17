import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CoinIcon from "./CoinIcon";

export default function Cart() {
  const { items, remove, clear, total, open, setOpen } = useCart();
  const { user, users, sendGroupMessage } = useAuth();

  if (!open) return null;

  const handleCheckout = async () => {
    if (!user) { alert("Connecte-toi pour passer commande !"); return; }

    const parrainRefs = Array.isArray(user.parrain)
      ? user.parrain
      : typeof user.parrain === "string" && user.parrain.trim()
        ? user.parrain.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const parrains = parrainRefs.map(ref => {
      const trimmed = ref.trim();
      const byPseudo = users.filter(u => u.pseudo.toLowerCase() === trimmed.toLowerCase());
      if (byPseudo.length === 1) return byPseudo[0];
      if (byPseudo.length > 1) return users.find(u => u.customId === trimmed) || null;
      return users.find(u => u.customId === trimmed) || null;
    }).filter(Boolean);

    const admin = users.find(u => u.id === "zeus-001");
    const participantIds = [
      user.id,
      ...(admin ? [admin.id] : []),
      ...parrains.map(p => p.id),
    ].filter(Boolean).filter((id, i, arr) => arr.indexOf(id) === i);
    const participantPseudos = [
      user.pseudo,
      ...(admin ? [admin.pseudo] : []),
      ...parrains.map(p => p.pseudo),
    ].filter(Boolean).filter((p, i, arr) => arr.indexOf(p) === i);

    const now = Date.now();
    const groupId = `group-order-${now}`;
    const itemsList = items.map(i => `• ${i.role || i.name} — ${(i.effectivePrice ?? i.price).toFixed(2)} 🪙`).join("\n");
    const content = `🛒 Nouvelle commande de ${user.pseudo} !\n\nItems :\n${itemsList}\n\nTotal : ${total.toFixed(2)} 🪙\nDate : ${new Date().toLocaleString("fr-FR")}`;

    await sendGroupMessage({
      groupId,
      participantIds,
      participantPseudos,
      content,
      attachments: [],
      groupName: `Commande – ${user.pseudo}`,
    });

    const order = {
      id: now,
      userId: user.id,
      pseudo: user.pseudo,
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
    alert("✅ Commande envoyée ! Kraken a été notifié ⚡");
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
