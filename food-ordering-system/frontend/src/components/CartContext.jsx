import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { MAX_QTY } from '../helpers.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const STORAGE_KEY = 'foodCornerCart';

// Guests keep their cart in localStorage (food ids, names, prices and quantities only).
function loadGuestCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && typeof item.foodId === 'string' &&
      typeof item.price === 'number' &&
      Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= MAX_QTY
    );
  } catch (err) {
    return [];
  }
}

// When a guest logs in, add the guest cart on top of the cart saved in MongoDB
function mergeCarts(savedItems, guestItems) {
  const merged = savedItems.map((item) => ({ ...item }));
  guestItems.forEach((guestItem) => {
    const found = merged.find((item) => item.foodId === guestItem.foodId);
    if (found) found.quantity = Math.min(found.quantity + guestItem.quantity, MAX_QTY);
    else merged.push({ ...guestItem });
  });
  return merged;
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState(loadGuestCart);
  const [cartReady, setCartReady] = useState(false); // true once a logged-in user's cart is loaded
  const loadedUserId = useRef(null);
  const syncAllowed = useRef(false); // only save to the server after the saved cart was loaded
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // 1) Guests: save the cart in the browser
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user, authLoading]);

  // 2) Login / logout
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (loadedUserId.current !== null) {
        // just logged out: empty the cart on screen (the saved cart stays in MongoDB)
        loadedUserId.current = null;
        syncAllowed.current = false;
        setCartReady(false);
        setItems([]);
      }
      return;
    }

    if (loadedUserId.current === user.id) return;
    loadedUserId.current = user.id;
    setCartReady(false);

    api('/api/cart')
      .then((data) => {
        localStorage.removeItem(STORAGE_KEY); // the guest cart is merged below
        syncAllowed.current = true;
        setItems(mergeCarts(data.items, itemsRef.current));
      })
      .catch(() => {
        syncAllowed.current = false; // could not load, so do not overwrite the saved cart
      })
      .finally(() => setCartReady(true));
  }, [user, authLoading]);

  // 3) Logged-in users: save every change to MongoDB (after a short pause)
  useEffect(() => {
    if (!user || !cartReady || !syncAllowed.current || loadedUserId.current !== user.id) return;
    const timer = setTimeout(() => {
      api('/api/cart', {
        method: 'PUT',
        body: { items: items.map((item) => ({ foodId: item.foodId, quantity: item.quantity })) }
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [items, user, cartReady]);

  function addToCart(food) {
    setItems((current) => {
      const found = current.find((item) => item.foodId === food._id);
      if (found) {
        return current.map((item) =>
          item.foodId === food._id ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QTY) } : item
        );
      }
      return [...current, { foodId: food._id, name: food.name, price: food.price, image: food.image, quantity: 1 }];
    });
  }

  function changeQuantity(foodId, change) {
    setItems((current) =>
      current.map((item) =>
        item.foodId === foodId
          ? { ...item, quantity: Math.min(Math.max(item.quantity + change, 1), MAX_QTY) }
          : item
      )
    );
  }

  function removeItem(foodId) {
    setItems((current) => current.filter((item) => item.foodId !== foodId));
  }

  // Used after an order is placed (the server also empties the saved cart)
  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }

  // Compare the cart with the current menu from the database.
  // Returns a list of problems: removed/unavailable items and changed prices.
  async function checkCart() {
    const data = await api('/api/foods');
    const issues = [];
    items.forEach((item) => {
      const current = data.foods.find((food) => food._id === item.foodId);
      if (!current) {
        issues.push({ foodId: item.foodId, name: item.name, type: 'unavailable' });
      } else if (current.price !== item.price) {
        issues.push({ foodId: item.foodId, name: item.name, type: 'price', oldPrice: item.price, newPrice: current.price });
      }
    });
    return issues;
  }

  // Apply the changes found by checkCart
  function fixCart(issues) {
    setItems((current) =>
      current
        .filter((item) => !issues.some((i) => i.foodId === item.foodId && i.type === 'unavailable'))
        .map((item) => {
          const priceIssue = issues.find((i) => i.foodId === item.foodId && i.type === 'price');
          return priceIssue ? { ...item, price: priceIssue.newPrice } : item;
        })
    );
  }

  const cartLoading = authLoading || (!!user && !cartReady);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, cartLoading, totalItems, totalAmount, addToCart, changeQuantity, removeItem, clearCart, checkCart, fixCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}