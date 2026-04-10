/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext();
const SELECTED_SCHEDULE_STORAGE_KEY = "selectedScheduleId";
const SCHEDULE_CARTS_STORAGE_KEY = "scheduleCartItems";

const readStoredScheduleId = () => {
  const storedValue = localStorage.getItem(SELECTED_SCHEDULE_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  const parsedValue = Number(storedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const readStoredScheduleCarts = () => {
  try {
    const storedValue = localStorage.getItem(SCHEDULE_CARTS_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
};

export function CartProvider({ children }) {
  const [cartItemsBySchedule, setCartItemsBySchedule] = useState(() =>
    readStoredScheduleCarts()
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState(() =>
    readStoredScheduleId()
  );

  const activeScheduleKey =
    selectedScheduleId !== null ? String(selectedScheduleId) : null;
  const cartItems = activeScheduleKey
    ? cartItemsBySchedule[activeScheduleKey] || []
    : [];

  useEffect(() => {
    if (selectedScheduleId !== null) {
      localStorage.setItem(
        SELECTED_SCHEDULE_STORAGE_KEY,
        String(selectedScheduleId)
      );
      return;
    }

    localStorage.removeItem(SELECTED_SCHEDULE_STORAGE_KEY);
  }, [selectedScheduleId]);

  useEffect(() => {
    localStorage.setItem(
      SCHEDULE_CARTS_STORAGE_KEY,
      JSON.stringify(cartItemsBySchedule)
    );
  }, [cartItemsBySchedule]);

  const updateActiveCartItems = (updater) => {
    if (!activeScheduleKey) {
      return;
    }

    setCartItemsBySchedule((prev) => {
      const currentItems = prev[activeScheduleKey] || [];
      const nextItems =
        typeof updater === "function" ? updater(currentItems) : updater;

      if (!nextItems || nextItems.length === 0) {
        const nextState = { ...prev };
        delete nextState[activeScheduleKey];
        return nextState;
      }

      return {
        ...prev,
        [activeScheduleKey]: nextItems,
      };
    });
  };

  const addToCart = (product, quantity) => {
    if (!activeScheduleKey) {
      return;
    }

    updateActiveCartItems((prev) => {
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
    if (!activeScheduleKey) {
      return;
    }

    updateActiveCartItems((prev) => prev.filter((item) => item.id !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (!activeScheduleKey) {
      return;
    }

    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    updateActiveCartItems((prev) =>
      prev.map((item) =>
        item.id === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = (scheduleId = selectedScheduleId) => {
    if (scheduleId === null || scheduleId === undefined) {
      return;
    }

    const scheduleKey = String(scheduleId);

    setCartItemsBySchedule((prev) => {
      if (!prev[scheduleKey]) {
        return prev;
      }

      const nextState = { ...prev };
      delete nextState[scheduleKey];
      return nextState;
    });
  };

  const selectSchedule = (scheduleId) => {
    const parsedScheduleId = Number(scheduleId);
    setSelectedScheduleId(
      Number.isFinite(parsedScheduleId) ? parsedScheduleId : null
    );
  };
  const clearSelectedSchedule = () => setSelectedScheduleId(null);
  const getCartItemCountForSchedule = (scheduleId) => {
    if (scheduleId === null || scheduleId === undefined) {
      return 0;
    }

    return (cartItemsBySchedule[String(scheduleId)] || []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  };
  const hasCartForSchedule = (scheduleId) =>
    getCartItemCountForSchedule(scheduleId) > 0;

  const checkout = async (userId, scheduleId) => {
    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    const resolvedScheduleId = scheduleId ?? selectedScheduleId;

    if (!resolvedScheduleId) {
      throw new Error("No event selected for this order");
    }

    const payload = {
      user_id: userId,
      schedule_id: resolvedScheduleId,
      items: cartItems.map((item) => ({
        product_id: item._productId ?? item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const res = await api.post("/orders", payload);
    clearCart(resolvedScheduleId);
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
        selectedScheduleId,
        selectSchedule,
        clearSelectedSchedule,
        checkout,
        totalItems,
        totalPrice,
        getCartItemCountForSchedule,
        hasCartForSchedule,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
