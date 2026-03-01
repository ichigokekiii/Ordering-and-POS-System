import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, RefreshCw } from "lucide-react";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [status, setStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/orders");

      // Support both raw array and wrapped response
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.orders ?? res.data.data ?? [];

      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;

    try {
      await axios.put(
        `http://localhost:8000/api/orders/${editingOrder.order_id || editingOrder.id}`,
        { order_status: status }
      );

      // Update local state immediately for better UX
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === editingOrder.order_id || order.id === editingOrder.id
            ? { ...order, order_status: status }
            : order
        )
      );

      setEditingOrder(null);
      setStatus("");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#3B5BDB]">
          Orders Dashboard
        </h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B5BDB] text-white rounded-lg hover:opacity-90"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-6 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-gray-500">No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-left">
                <th className="p-4">ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.order_id || order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-4">{order.order_id || order.id}</td>
                  <td className="p-4">{order.user_id}</td>
                  <td className="p-4 text-[#3B5BDB] font-medium">
                    ₱{order.total_amount}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.order_status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.order_status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : order.order_status === "Shipped"
                          ? "bg-purple-100 text-purple-700"
                          : order.order_status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => {
                        setEditingOrder(order);
                        setStatus(order.order_status);
                      }}
                      className="text-[#3B5BDB] hover:text-[#2f4ac7] transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(order.order_id || order.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">
              Update Order Status
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#2f4ac7] transition text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
