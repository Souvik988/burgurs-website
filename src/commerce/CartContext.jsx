import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { menu } from '../data/menu';

export const commerce = Object.freeze({ discountPercent: 10, paymentsEnabled: false, deliveryEnabled: false, currency: 'INR', city: 'Kolkata', storageKey: 'dres-cart:v1' });
export const formatMoney = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const CartContext = createContext(null);
const byId = new Map(menu.map(item => [item.id, item]));
const keyFor = (id, extras) => `${id}:${[...extras].sort().join('|')}`;

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const merged = new Map();
  for (const row of value.slice(0, 100)) {
    const item = byId.get(row?.id);
    if (!item) continue;
    const allowed = new Set(item.customizations.map(extra => extra.name));
    const extras = [...new Set(Array.isArray(row.extras) ? row.extras.filter(name => allowed.has(name)) : [])].sort();
    const quantity = Number.isFinite(row.quantity) ? Math.min(20, Math.max(0, Math.floor(row.quantity))) : 0;
    if (!quantity) continue;
    const key = keyFor(item.id, extras);
    merged.set(key, { key, id: item.id, extras, quantity: Math.min(20, (merged.get(key)?.quantity || 0) + quantity) });
  }
  return [...merged.values()];
}

function readCart() {
  try { return normalizeCart(JSON.parse(localStorage.getItem(commerce.storageKey) || '[]')); } catch { return []; }
}

export function priceCart(rows) {
  const lines = normalizeCart(rows).map(row => {
    const item = byId.get(row.id);
    const options = item.customizations.filter(extra => row.extras.includes(extra.name));
    const unitPrice = item.price + options.reduce((sum, extra) => sum + extra.price, 0);
    return { ...row, item, options, unitPrice, total: unitPrice * row.quantity };
  });
  const subtotalPaise = Math.round(lines.reduce((sum, line) => sum + line.total, 0) * 100);
  const discountPaise = Math.round(subtotalPaise * commerce.discountPercent / 100);
  return { lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal: subtotalPaise / 100, discount: discountPaise / 100, total: (subtotalPaise - discountPaise) / 100 };
}

export function CartProvider({ children }) {
  const [rows, setRows] = useState(readCart);
  const [notice, setNotice] = useState('');
  useEffect(() => { try { localStorage.setItem(commerce.storageKey, JSON.stringify(rows.map(({ id, extras, quantity }) => ({ id, extras, quantity })))); } catch { /* The cart still works for this visit. */ } }, [rows]);
  useEffect(() => { if (!notice) return;const timer = setTimeout(() => setNotice(''), 3500);return () => clearTimeout(timer); }, [notice]);
  const add = useCallback((id, extras = []) => {
    const item = byId.get(id);if (!item) return;
    setRows(previous => normalizeCart([...previous, { id, extras, quantity: 1 }]));
    setNotice(`${item.name} added to your bag.`);
  }, []);
  const setQuantity = useCallback((key, quantity) => setRows(previous => normalizeCart(previous.map(row => row.key === key ? { ...row, quantity } : row))), []);
  const remove = useCallback(key => setRows(previous => previous.filter(row => row.key !== key)), []);
  const priced = useMemo(() => priceCart(rows), [rows]);
  const value = useMemo(() => ({ ...priced, add, setQuantity, remove, notice }), [priced, add, setQuantity, remove, notice]);
  return <CartContext.Provider value={value}>{children}<div className={`cart-toast ${notice ? 'toast-visible' : ''}`} role="status" aria-live="polite">{notice}</div></CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
