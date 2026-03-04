/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity) => {
    setCartItems((prev) => {
      // Two premade items can be merged only when:
      // 1. They have the same product id
      // 2. Both have NO greeting card (null/undefined)
      // If either has a greeting card, always add as a separate entry.
      const canMerge = (existing) =>
        existing.id === product.id &&
        !existing.greetingCard &&
        !product.greetingCard;

      const existingIndex = prev.findIndex(canMerge);

      if (existingIndex !== -1) {
        // Merge into the existing entry
        return prev.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // No mergeable entry found — add as a brand new cart row.
      // Give it a unique cart id so it can be individually managed.
      const uniqueId = product.greetingCard
        ? `${product.id}-card-${Date.now()}`
        : product.id;

      return [...prev, { ...product, id: uniqueId, _productId: product.id, quantity }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const checkout = async (userId, scheduleId) => {
    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    const payload = {
      user_id: userId,
      schedule_id: scheduleId,
      items: cartItems.map((item) => ({
        product_id: item._productId ?? item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const res = await api.post("/orders", payload);
    clearCart();
    return res.data;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}