<<<<<<< HEAD
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
=======
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { 
  Search, 
  ChevronDown, 
  Filter, 
  SlidersHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  X,
  Loader2,
  PackageSearch,
  MapPin,
  CreditCard
} from "lucide-react";

// Reusable Status Pill
const OrderStatusPill = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
  
  if (status === "Pending") colorClass = "bg-amber-100 text-amber-700 border-amber-200";
  else if (status === "Processing") colorClass = "bg-blue-100 text-blue-700 border-blue-200";
  else if (status === "Shipped") colorClass = "bg-purple-100 text-purple-700 border-purple-200";
  else if (status === "Delivered" || status === "Completed") colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  else if (status === "Cancelled") colorClass = "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
      {status || "Unknown"}
    </span>
  );
};
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a

function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [viewingOrder, setViewingOrder] = useState(null); // For Read Only view
  const [editingOrder, setEditingOrder] = useState(null); // For Edit view
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

<<<<<<< HEAD
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
=======
  // Toast State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const canEdit = user?.role === "admin" || user?.role === "owner";

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
<<<<<<< HEAD
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.orders ?? res.data.data ?? [];
      setOrders(data);
=======
      const data = Array.isArray(res.data) ? res.data : res.data.orders ?? res.data.data ?? [];
      
      // Sort orders by created_at descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedData);
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      showToast("error", "Failed to load orders database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => clearTimeout(toastTimeoutRef.current);
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
<<<<<<< HEAD
    if (!window.confirm("Are you sure you want to delete this order?")) return;
=======
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;

>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
    try {
      await api.delete(`/orders/${id}`);
      showToast("success", `Order #${id} deleted successfully.`);
      fetchOrders();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("error", "Failed to delete order.");
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    try {
<<<<<<< HEAD
      await api.put(
        `/orders/${editingOrder.order_id || editingOrder.id}`,
        { order_status: status }
      );
=======
      await api.put(`/orders/${editingOrder.order_id || editingOrder.id}`, { order_status: status });

>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
      setOrders((prev) =>
        prev.map((order) => {
          const id = order.order_id || order.id;
          const editingId = editingOrder.order_id || editingOrder.id;
          return id === editingId ? { ...order, order_status: status } : order;
        })
      );
      setEditingOrder(null);
      setStatus("");
      showToast("success", "Order status updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      showToast("error", "Failed to update order status.");
    }
  };

  // Helper to open the edit modal
  const openEditModal = (order) => {
    setEditingOrder(order);
    setStatus(order.order_status);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150?text=No+Image";
    return `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${imagePath}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed top-6 right-6 z-[500] animate-in slide-in-from-right duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
            Manage customer orders, track delivery statuses, and oversee transactions.
          </p>
        </div>

        <div className="flex items-center gap-4">
<<<<<<< HEAD
          <h1 className="text-2xl font-semibold text-black">Orders</h1>
=======
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
          {!canEdit && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100">
              View-Only Access
            </span>
          )}
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="flex-1 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 py-40">
             <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
             <span className="text-xs font-bold uppercase tracking-widest">Loading Orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-40">
             <PackageSearch className="w-10 h-10 opacity-20 mb-2" />
             <span className="text-sm font-bold text-gray-500">No orders have been placed yet.</span>
          </div>
        ) : (
<<<<<<< HEAD
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
=======
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#f8fafc]">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap w-32">Order ID</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Customer / User ID</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Delivery</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Date Placed</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Total</th>
                  {canEdit && <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right whitespace-nowrap">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const orderId = order.order_id || order.id;
                  return (
                    <tr 
                      key={orderId} 
                      onClick={() => canEdit ? openEditModal(order) : setViewingOrder(order)}
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-5">
                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">#{orderId}</span>
                      </td>
                      
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4f6fa5] font-bold shrink-0 text-xs">
                            {order.user?.first_name ? order.user.first_name.charAt(0) : "U"}
                          </div>
                          {/* min-w-0 allows the text to truncate properly instead of stretching the table */}
                          <div className="min-w-0 max-w-[180px] lg:max-w-[240px]">
                            <p className="font-bold text-gray-900 tracking-tight truncate text-sm">
                              {order.user?.first_name ? `${order.user.first_name} ${order.user.last_name}` : `User ID: ${order.user_id}`}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">
                              {order.user?.email || "No Email provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-gray-700 capitalize whitespace-nowrap">{order.delivery_method}</p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'})}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <OrderStatusPill status={order.order_status} />
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-bold text-[#4f6fa5] whitespace-nowrap">₱{order.total_amount}</p>
                      </td>

                      {canEdit && (
                        <td className="px-5 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white border-2 border-amber-500 hover:bg-transparent hover:text-amber-500 transition-all duration-300 shadow-sm"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(orderId); }}
                              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-500 transition-all duration-300 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
              </tbody>
            </table>
          </div>
        )}
      </div>

<<<<<<< HEAD
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
=======
      {/* --- COMBINED ORDER DETAILS & EDIT MODAL --- */}
      {(editingOrder || viewingOrder) && (() => {
        const activeOrder = editingOrder || viewingOrder;
        const isEditingMode = !!editingOrder;
        const orderId = activeOrder.order_id || activeOrder.id;

        return (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-white/20 p-8 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-3 inline-block">
                    Order #{orderId}
                  </span>
                  <h2 className="text-2xl font-playfair font-bold text-gray-900">
                    {isEditingMode ? "Manage Order Status" : "Order Details"}
                  </h2>
                </div>
                {!isEditingMode && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Read Only</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Order Meta */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5"><PackageSearch className="w-3.5 h-3.5"/> Overview</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Date Placed</span><span className="font-semibold text-gray-900">{new Date(activeOrder.created_at).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-semibold text-gray-900 capitalize">{activeOrder.delivery_method}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Current Status</span><OrderStatusPill status={activeOrder.order_status} /></div>
                  </div>
                </div>

                {/* Customer Meta */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Customer</h3>
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-gray-900">{activeOrder.user?.first_name ? `${activeOrder.user.first_name} ${activeOrder.user.last_name}` : "Guest/Unknown"}</p>
                    <p className="text-gray-600 truncate">{activeOrder.user?.email || "No email"}</p>
                    <p className="text-gray-600">{activeOrder.user?.phone_number || "No phone"}</p>
                  </div>
                </div>
              </div>

              {/* Special Message Block */}
              {activeOrder.special_message && (
                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Included Card Message</h3>
                  <p className="text-sm font-playfair italic text-gray-800">"{activeOrder.special_message}"</p>
                </div>
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
              )}

<<<<<<< HEAD
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
=======
              {/* Delivery Address Block */}
              {activeOrder.address && (
                 <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Delivery Address</h3>
                   <p className="text-sm font-medium text-gray-700">{activeOrder.address}</p>
                 </div>
              )}

              {/* Ordered Items List */}
              {activeOrder.order_items && activeOrder.order_items.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1 block">Line Items</h3>
                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm divide-y divide-gray-50">
                    {activeOrder.order_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {item.product?.image ? (
                              <img src={getImageUrl(item.product.image)} alt={item.product?.name || item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">Img</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 tracking-tight">{item.product?.name || item.product_name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Qty: {item.quantity} x ₱{item.price_at_purchase}</p>
                            {item.special_message && <p className="text-xs text-amber-600 italic mt-1 font-playfair">Note: "{item.special_message}"</p>}
                          </div>
                        </div>
                        <div className="text-right pl-4">
                          <p className="text-sm font-bold text-[#4f6fa5]">₱{item.quantity * item.price_at_purchase}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Footer inside the list */}
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Order Total</span>
                      <span className="text-lg font-bold text-gray-900">₱{activeOrder.total_amount}</span>
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
                    </div>
                  </div>
                </div>
              )}

<<<<<<< HEAD
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
=======
              {/* Status Update Control (Only visible if Editing) */}
              {isEditingMode && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Update Fulfillment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all shadow-sm"
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
                  >
                    <option value="Pending">Pending (Awaiting review)</option>
                    <option value="Processing">Processing (Arrangement being created)</option>
                    <option value="Shipped">Shipped (Out for delivery)</option>
                    <option value="Delivered">Delivered (Order fulfilled)</option>
                    <option value="Cancelled">Cancelled (Order voided)</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setEditingOrder(null); setViewingOrder(null); }}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {isEditingMode ? "Cancel" : "Close Window"}
                </button>
                
                {isEditingMode && (
                  <button
<<<<<<< HEAD
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#2f4ac7] transition text-white rounded-lg"
=======
                    onClick={handleUpdateStatus}
                    className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
                  >
                    Save Status Changes
                  </button>
<<<<<<< HEAD
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
=======
                )}
              </div>

>>>>>>> 3c8e5da922bb6599ed514004a95e3a8467ea448a
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default AdminOrdersPage;