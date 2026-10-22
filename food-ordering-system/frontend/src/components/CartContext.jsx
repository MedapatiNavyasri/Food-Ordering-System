import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';
import { MAX_QTY } from '../helpers.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'foodCornerCart';

// Read the saved cart from localStorage (only food ids, names, prices and quantities are saved)
function loadCart() {
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

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY); // remove right away (the page may reload next)
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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalAmount, addToCart, changeQuantity, removeItem, clearCart, checkCart, fixCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
