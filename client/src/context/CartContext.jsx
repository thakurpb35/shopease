import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = "se_cart";
const MAX_QTY = 99;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // Add a product (never more than what is in stock)
  const add = (product, qty = 1) => {
    const max = Math.min(product.stock, MAX_QTY);
    if (max < 1) return;
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === product._id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i],
          price: product.price,
          stock: product.stock,
          qty: Math.min(next[i].qty + qty, max),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          qty: Math.min(qty, max),
        },
      ];
    });
  };

  const setQty = (productId, qty) =>
    setItems((prev) =>
      prev.map((x) =>
        x.productId === productId
          ? { ...x, qty: Math.max(1, Math.min(qty, x.stock, MAX_QTY)) }
          : x
      )
    );

  const remove = (productId) => setItems((prev) => prev.filter((x) => x.productId !== productId));
  const clear = () => setItems([]);

  const count = items.reduce((n, x) => n + x.qty, 0);
  const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}
