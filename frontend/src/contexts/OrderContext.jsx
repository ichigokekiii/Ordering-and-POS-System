/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */


import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const data = res.data;

      if (!Array.isArray(data)) {
        setOrders([]);
        return;
      }

      const normalized = data.map((order) => ({
        ...order,

        // Normalize order items key (backend may return orderItems)
        order_items: order.order_items || order.orderItems || [],

        // Ensure user object always exists
        user: order.user || null,

        // Ensure payment object always exists
        payment: order.payment || null,
      }));

      setOrders(normalized);
    } catch (error) {
      console.error("Failed to fetch orders", error.response?.data || error.message);
    }
  };

  const addOrder = async (orderData) => {
    try {
      const res = await api.post("/orders", orderData);
      await fetchOrders();
      return res.data;
    } catch (error) {
      console.error("Failed to add order", error.response?.data || error.message);
    }
  };

  const updateOrder = async (id, updatedData) => {
    try {
      const payload = {
        ...updatedData,
        status: updatedData.status ?? updatedData.order_status
      };

      const res = await api.put(`/orders/${id}`, payload);
      const data = res.data;

      setOrders((prev) =>
        prev.map((o) =>
          (o.order_id === id || o.id === id) ? data : o
        )
      );

      return data;
    } catch (error) {
      console.error("Failed to update order", error.response?.data || error.message);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);

      setOrders((prev) =>
        prev.filter((o) => (o.order_id || o.id) !== id)
      );
    } catch (error) {
      console.error("Failed to delete order", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        fetchOrders,
        addOrder,
        updateOrder,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};