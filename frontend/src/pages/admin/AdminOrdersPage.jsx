import { useEffect, useState, useRef } from "react";
import api from "../../services/api";

const OrderCard = ({ order, onEdit, onDelete, canEdit }) => (
  <div className="rounded border p-4 shadow-sm bg-white">
    <div className="mb-2">
      <span
        className={`px-2 py-1 text-xs font-bold rounded ${
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
    </div>
    <h3 className="font-medium">Order: {order.order_id || order.id}</h3>
    <p className="text-sm text-gray-600">User ID: {order.user_id}</p>
    <p className="text-sm text-gray-600">Delivery: {order.delivery_method}</p>
    <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
    <p className="text-[#3B5BDB] font-medium mt-1">₱{order.total_amount}</p>
    {canEdit && (
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(order)} className="rounded border px-3 py-1 text-sm hover:bg-gray-100">Edit</button>
        <button onClick={() => onDelete(order.order_id || order.id)} className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
      </div>
    )}
  </div>
);

function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDelivery, setFilterDelivery] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customDateActive, setCustomDateActive] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  const canEdit = user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
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

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (o) => o.order_status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (filterDelivery !== "all") {
      filtered = filtered.filter(
        (o) => o.delivery_method?.toLowerCase() === filterDelivery.toLowerCase()
      );
    }

    if (customDateActive && (dateFrom || dateTo)) {
      filtered = filtered.filter((o) => {
        const created = new Date(o.created_at);
        const createdDate = new Date(
          created.getFullYear(),
          created.getMonth(),
          created.getDate()
        );
        const parseLocalDate = (str) => {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day); // local midnight, no UTC shift
};

if (dateFrom && dateTo) {
  return createdDate >= parseLocalDate(dateFrom) && createdDate <= parseLocalDate(dateTo);
}
if (dateFrom) return createdDate >= parseLocalDate(dateFrom);
if (dateTo)   return createdDate <= parseLocalDate(dateTo);
        return true;
      });
    }

    return filtered;
  };

  const clearAllFilters = () => {
    setFilterStatus("all");
    setFilterDelivery("all");
    setDateFrom("");
    setDateTo("");
    setCustomDateActive(false);
  };

  const applyCustomDate = () => {
    if (!dateFrom && !dateTo) return;
    setCustomDateActive(true);
    setShowFilterMenu(false);
  };

  const clearCustomDate = () => {
    setDateFrom("");
    setDateTo("");
    setCustomDateActive(false);
  };

  const hasActiveFilters = filterStatus !== "all" || filterDelivery !== "all" || customDateActive;

  const customDateLabel = () => {
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo)   return `Until ${dateTo}`;
    return "Custom Range";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    try {
      await api.put(
        `/orders/${editingOrder.order_id || editingOrder.id}`,
        { order_status: status }
      );
      setOrders((prev) =>
        prev.map((order) => {
          const id = order.order_id || order.id;
          const editingId = editingOrder.order_id || editingOrder.id;
          return id === editingId ? { ...order, order_status: status } : order;
        })
      );
      setEditingOrder(null);
      setStatus("");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="px-10 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-black">Orders</h1>
          {!canEdit && (
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              View-Only Mode
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="py-6 text-center text-gray-400">No orders yet</p>
        ) : (
          <div className="rounded border p-6 shadow-sm bg-white">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Orders list</h2>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="px-5 py-2 border rounded text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  Filter By
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">

                    {/* Status */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
                      {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                        <button
                          key={s}
                          onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 ${
                            filterStatus === s ? "font-semibold text-[#3B5BDB]" : "text-gray-700"
                          }`}
                        >
                          {s === "all" ? "All Statuses" : s}
                        </button>
                      ))}
                    </div>

                    {/* Delivery */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery</p>
                      {["all", "pickup", "delivery"].map((d) => (
                        <button
                          key={d}
                          onClick={() => { setFilterDelivery(d); setShowFilterMenu(false); }}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 capitalize ${
                            filterDelivery === d ? "font-semibold text-[#3B5BDB]" : "text-gray-700"
                          }`}
                        >
                          {d === "all" ? "All Methods" : d}
                        </button>
                      ))}
                    </div>

                    {/* Date — custom range only */}
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Date Range</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">From</label>
                          <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">To</label>
                          <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                          />
                        </div>
                        <button
                          onClick={applyCustomDate}
                          disabled={!dateFrom && !dateTo}
                          className={`w-full py-1.5 rounded-lg text-sm font-semibold transition ${
                            dateFrom || dateTo
                              ? "bg-[#3B5BDB] text-white hover:bg-[#2f4ac7]"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Apply Range
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filterStatus !== "all" && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus("all")} className="ml-1 hover:text-blue-900">✕</button>
                  </span>
                )}
                {filterDelivery !== "all" && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
                    Delivery: {filterDelivery}
                    <button onClick={() => setFilterDelivery("all")} className="ml-1 hover:text-blue-900">✕</button>
                  </span>
                )}
                {customDateActive && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    Date: {customDateLabel()}
                    <button onClick={clearCustomDate} className="ml-1 hover:text-blue-900">✕</button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm uppercase border-b">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">User</th>
                  <th className="pb-4">Delivery</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Created Date</th>
                  {canEdit && <th className="pb-4">Actions</th>}
                </tr>
              </thead>

              <tbody className="text-sm text-gray-700">
                {getFilteredOrders().length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="py-10 text-center text-gray-400">
                      No orders match the current filters.
                    </td>
                  </tr>
                ) : (
                  getFilteredOrders().map((order) => (
                    <tr
                      key={order.order_id || order.id}
                      className="hover:bg-gray-50 border-b cursor-pointer transition"
                      onClick={() => {
                        setEditingOrder(order);
                        setStatus(order.order_status);
                      }}
                    >
                      <td className="py-5 font-medium">{order.order_id || order.id}</td>
                      <td className="py-5">{order.user_id}</td>
                      <td className="py-5 capitalize">{order.delivery_method}</td>
                      <td className="py-5 text-[#3B5BDB] font-medium">₱{order.total_amount}</td>
                      <td className="py-5">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="py-5">{new Date(order.created_at).toLocaleDateString()}</td>
                      {canEdit && (
                        <td className="py-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order.order_id || order.id);
                            }}
                            className="px-3 py-1 border rounded text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-[640px] max-h-[85vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              {!canEdit && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  Read Only
                </span>
              )}
            </div>

            <div className="mb-6 rounded-lg border p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Order Info</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Order ID:</span> {editingOrder.order_id || editingOrder.id}</p>
                <p>
                  <span className="font-medium">Order Date:</span>{" "}
                  {editingOrder.created_at ? new Date(editingOrder.created_at).toLocaleString() : "N/A"}
                </p>
                <p><span className="font-medium">Delivery Method:</span> {editingOrder.delivery_method}</p>
                {editingOrder.special_message && (
                  <p><span className="font-medium">Card Message:</span> {editingOrder.special_message}</p>
                )}
              </div>
            </div>

            <div className="mb-6 rounded-lg border p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Customer Info</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {editingOrder.user?.first_name
                    ? `${editingOrder.user.first_name} ${editingOrder.user.last_name}`
                    : "N/A"}
                </p>
                <p><span className="font-medium">Email:</span> {editingOrder.user?.email || "N/A"}</p>
                <p><span className="font-medium">Phone:</span> {editingOrder.user?.phone_number || "N/A"}</p>
                {editingOrder.address && (
                  <p><span className="font-medium">Delivery Address:</span> {editingOrder.address}</p>
                )}
              </div>
            </div>

            {editingOrder.order_items && editingOrder.order_items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Product Info</h3>
                <div className="border rounded-lg divide-y bg-white">
                  {editingOrder.order_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 text-sm gap-4 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        {item.product?.image && (
                          <img
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${item.product.image}`}
                            alt={item.product?.name || item.product_name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product?.name || item.product_name}</p>
                          {item.product_id && (
                            <p className="text-xs text-gray-500">Product ID: {item.product_id}</p>
                          )}
                          {item.special_message && (
                            <p className="text-xs text-gray-500">Message: {item.special_message}</p>
                          )}
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-xs text-gray-500">Subtotal: ₱{item.quantity * item.price_at_purchase}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#3B5BDB]">₱{item.price_at_purchase}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 border-t pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Order Total</span>
              <span className="text-lg font-bold text-[#3B5BDB]">₱{editingOrder.total_amount}</span>
            </div>

            {canEdit ? (
              <>
                <p className="text-sm font-semibold text-gray-800 mb-2 border-t pt-4">Update Order Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 mb-4 font-medium ${
                    status === "Pending"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : status === "Processing"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : status === "Shipped"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : status === "Delivered"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#2f4ac7] transition text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-end pt-4 border-t mt-4">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold border rounded-lg hover:bg-gray-200 transition"
                >
                  Close Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">Confirm Status Change</h3>
            <p className="text-sm text-gray-500 mb-1">
              You are updating order <span className="font-medium text-gray-700">{editingOrder?.order_id}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              New status:{" "}
              <span className={`font-semibold ${
                status === "Pending"    ? "text-yellow-600" :
                status === "Processing" ? "text-blue-600"   :
                status === "Shipped"    ? "text-purple-600" :
                status === "Delivered"  ? "text-green-600"  :
                                          "text-red-600"
              }`}>
                {status}
              </span>
            </p>

            <p className="text-xs text-gray-400 mb-6">
              A notification email will be sent to the customer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleUpdateStatus();
                }}
                className="flex-1 px-4 py-2 bg-[#3B5BDB] hover:bg-[#2f4ac7] text-white rounded-lg transition text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;