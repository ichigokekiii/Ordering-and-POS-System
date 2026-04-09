import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  formatOrderStatus,
  getOrderStatusPillClasses,
  isActionRequiredOrderStatus,
  normalizeOrderStatus,
} from "../../utils/orderStatus";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  CircleDollarSign, 
  Loader2,
  TrendingUp,
  CalendarClock,
  ArrowRight,
  Sparkles,
  Clock,
  AlertCircle,
  Activity,
  PlusCircle,
  ClipboardList,
  CheckCircle2
} from "lucide-react";

// Reusable Status Pill
const OrderStatusPill = ({ status }) => {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getOrderStatusPillClasses(status)}`}>
      {formatOrderStatus(status)}
    </span>
  );
};

function AdminOverviewPage({ user }) {
  const asBoolean = (value) => value === 1 || value === true || value === "1";
  const [data, setData] = useState({
    orders: [],
    users: [],
    products: [],
    schedules: [],
    logs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, usersRes, productsRes, premadesRes, schedulesRes, logsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/users"),
          api.get("/products"),
          api.get("/premades"),
          api.get("/schedules"),
          api.get("/logs", { params: { per_page: 5 } }) // Fetch only 5 most recent logs
        ]);

        const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.orders ?? ordersRes.data.data ?? []);
        
        setData({
          orders: fetchedOrders,
          users: usersRes.data || [],
          products: [...(productsRes.data || []), ...(premadesRes.data || [])],
          schedules: schedulesRes.data || [],
          logs: logsRes.data?.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- ACTION-ORIENTED STATS ---
  const stats = useMemo(() => {
    // 1. Pending & Processing Orders (Needs action)
    const actionRequiredOrders = data.orders.filter(o => 
      isActionRequiredOrderStatus(o.order_status)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Oldest first (longest waiting)

    // 2. Inventory Alerts (Out of stock items)
    const outOfStockItems = data.products.filter((p) => !asBoolean(p.isArchived) && !asBoolean(p.isAvailable));

    // 3. Newest Users
    const recentUsers = [...data.users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);
    
    // 4. Active Schedules
    const activeSchedules = data.schedules
      .filter((s) => !asBoolean(s.isArchived) && asBoolean(s.isAvailable))
      .slice(0, 4);

    return {
      pendingCount: actionRequiredOrders.filter((o) => normalizeOrderStatus(o.order_status) === "pending").length,
      processingCount: actionRequiredOrders.filter((o) => normalizeOrderStatus(o.order_status) === "processing").length,
      actionRequiredOrders: actionRequiredOrders.slice(0, 6),
      outOfStockCount: outOfStockItems.length,
      outOfStockItems: outOfStockItems.slice(0, 5),
      recentUsers,
      activeSchedules,
      recentLogs: data.logs.slice(0, 6)
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 py-40">
           <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
           <span className="text-xs font-bold uppercase tracking-widest">Waking up workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* HEADER AREA - Personalized */}
      <div className="mb-10">
        <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">
          Welcome, {user?.first_name || "Admin"}!
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
          What would you like to accomplish today? Here is what requires your attention.
        </p>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-900 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
            <ClipboardList className="w-4 h-4 text-gray-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Process Orders</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-900 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
            <PlusCircle className="w-4 h-4 text-gray-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Add Products</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-900 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
            <CalendarClock className="w-4 h-4 text-gray-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Manage Events</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-900 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
            <Activity className="w-4 h-4 text-gray-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">System Logs</span>
        </div>
      </div>

      {/* KPI CARDS ROW (Action Oriented) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Pending Orders */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500"><Clock className="w-5 h-5" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pending Orders</p>
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-gray-900">{stats.pendingCount}</p>
        </div>

        {/* Processing Orders */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Processing</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.processingCount}</p>
        </div>

        {/* Low Stock / Out of Stock Alerts */}
        <div className={`rounded-[1.5rem] border p-6 shadow-sm flex flex-col justify-between ${stats.outOfStockCount > 0 ? "border-gray-200 bg-gray-50/60" : "border-gray-100 bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500"><AlertCircle className="w-5 h-5" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Out of Stock</p>
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-gray-900">{stats.outOfStockCount}</p>
        </div>

        {/* Total Users */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Users</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{data.users.length}</p>
        </div>
      </div>

      {/* MIDDLE ROW (Action Required & Alerts) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Action Required: Orders (Takes 2 columns) */}
        <div className="xl:col-span-2 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
              </span>
              <h2 className="text-lg font-playfair font-bold text-gray-900">Pending Orders</h2>
            </div>
            <span className="text-xs font-bold text-gray-400 hover:text-gray-900 cursor-pointer flex items-center gap-1">View All <ArrowRight className="w-3 h-3"/></span>
          </div>
          
          {stats.actionRequiredOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold">All caught up! No pending orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc]">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Delivery</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.actionRequiredOrders.map((order) => (
                    <tr key={order.order_id || order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">#{order.order_id || order.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                          {order.user?.first_name ? `${order.user.first_name} ${order.user.last_name}` : "Guest"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-600 capitalize">{order.delivery_method}</td>
                      <td className="px-6 py-4"><OrderStatusPill status={order.order_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white shadow-sm flex flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-playfair font-bold text-gray-900">Product Alerts</h2>
            </div>
          </div>
          {stats.outOfStockItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm font-semibold">
              <Package className="w-8 h-8 mb-2 opacity-20" />
              All items are fully stocked.
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {stats.outOfStockItems.map((prod) => (
                <div key={prod.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 grayscale opacity-80">
                    {prod.image ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${prod.image}`} className="w-full h-full object-cover" alt="" /> : null}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 tracking-tight line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Out of Stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW (Recent Activity & Schedules) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent System Activity */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white shadow-sm flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-playfair font-bold text-gray-900">Recent System Activity</h2>
            <span className="text-xs font-bold text-gray-400 hover:text-gray-900 cursor-pointer flex items-center gap-1">View Logs <ArrowRight className="w-3 h-3"/></span>
          </div>
          {stats.recentLogs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-semibold">No recent activity.</div>
          ) : (
            <div className="space-y-4 flex-1 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
              {stats.recentLogs.map((log) => (
                <div key={log.log_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-[10px] font-bold">
                    {log.user_name ? log.user_name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 text-sm truncate">{log.user_name || "System"}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">{log.module || "System"}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">{log.event}</p>
                    <time className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Users & Events Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Newest Users */}
          <div className="rounded-[1.5rem] border border-gray-100 bg-white shadow-sm flex flex-col p-6">
            <h2 className="text-lg font-playfair font-bold text-gray-900 mb-6">Newest Members</h2>
            {stats.recentUsers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-semibold">No users found.</div>
            ) : (
              <div className="space-y-4 flex-1">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#eaf2ff] border border-[#d6e4ff] flex items-center justify-center text-[#4f6fa5] font-bold text-xs shrink-0">
                      {u.first_name ? u.first_name.charAt(0) : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.first_name} {u.last_name}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Schedules */}
          <div className="rounded-[1.5rem] border border-gray-100 bg-white shadow-sm flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-playfair font-bold text-gray-900">Upcoming Events</h2>
            </div>
            {stats.activeSchedules.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <CalendarClock className="w-8 h-8 opacity-20 mb-2" />
                <span className="text-xs font-bold text-gray-500">No events scheduled.</span>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {stats.activeSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{schedule.schedule_name}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#4f6fa5] truncate">{schedule.location}</p>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-gray-200 text-center shadow-sm shrink-0 min-w-[36px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{new Date(schedule.event_date).toLocaleDateString(undefined, {month: 'short'})}</p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{new Date(schedule.event_date).toLocaleDateString(undefined, {day: 'numeric'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminOverviewPage;
