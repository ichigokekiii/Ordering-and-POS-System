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

function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [viewingOrder, setViewingOrder] = useState(null); // For Read Only view
  const [editingOrder, setEditingOrder] = useState(null); // For Edit view
  const [status, setStatus] = useState("");

  // Toast State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const canEdit = user?.role === "admin" || user?.role === "owner";

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const data = Array.isArray(res.data) ? res.data : res.data.orders ?? res.data.data ?? [];
      
      // Sort orders by created_at descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedData);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;

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
      await api.put(`/orders/${editingOrder.order_id || editingOrder.id}`, { order_status: status });

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
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              )}

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
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Control (Only visible if Editing) */}
              {isEditingMode && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Update Fulfillment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all shadow-sm"
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
                    onClick={handleUpdateStatus}
                    className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
                  >
                    Save Status Changes
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default AdminOrdersPage;