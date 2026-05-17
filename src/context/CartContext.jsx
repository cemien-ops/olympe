import { createContext, useContext, useState } from "react";
import { perms } from "../data/shopData";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const add = (item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev;
      if (item._type === "perm") {
        const filtered = prev.filter((i) => i._type !== "perm");
        return [...filtered, { ...item, qty: 1 }];
      }
      if (item._type === "abo") {
        const filtered = prev.filter((i) => i._type !== "abo");
        return [...filtered, { ...item, qty: 1 }];
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const getPermPrice = (item, ownedPermId) => {
    if (!ownedPermId) return item.price;
    const owned = perms.find((p) => p.id === ownedPermId);
    if (!owned || owned.price >= item.price) return item.price;
    return item.price - owned.price;
  };

  const total = items.reduce((acc, i) => acc + i.effectivePrice * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, open, setOpen, getPermPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
