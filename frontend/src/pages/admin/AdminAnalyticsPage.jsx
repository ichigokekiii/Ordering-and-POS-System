/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Store,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CircleDollarSign,
  TrendingUp,
  Loader2, // This was missing in your console
  Mail,
  FileText,
  CheckCircle2,
  X,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import api from "../../services/api";

const SECTION_OPTIONS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "sales", label: "Sales", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "pos", label: "POS", icon: Store },
  { id: "schedules", label: "Schedules", icon: CalendarDays },
  { id: "operations", label: "Operations", icon: ShieldCheck },
];

const PIE_COLORS = ["#4f6fa5", "#eab308", "#f43f5e", "#10b981", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899"];

const formatValue = (value, format = "number") => {
  if (format === "currency") return `₱${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (format === "percent") return `${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
  return Number(value || 0).toLocaleString();
};

const CardMenu = ({ onEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-50">
        <MoreHorizontal className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-xl z-[100] animate-in fade-in zoom-in duration-100">
          <button 
            onClick={() => { setIsOpen(false); onEmail(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-[#eaf2ff] hover:text-[#4f6fa5] transition-colors"
          >
            <Mail className="h-4 w-4" /> Email this Data
          </button>
          <button onClick={() => setIsOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ metric, icon: Icon, onEmail }) => {
  const isPositive = typeof metric.change === "number" && metric.change >= 0;
  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center">
             {Icon ? <Icon className="w-4 h-4 text-gray-400" /> : <TrendingUp className="w-4 h-4 text-gray-400" />}
           </div>
           <p className="text-sm font-semibold text-gray-600">{metric.label}</p>
        </div>
        <CardMenu onEmail={() => onEmail(metric.label)} />
      </div>
      <div className="flex items-end gap-3 mt-2">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatValue(metric.value, metric.format)}</h3>
        {typeof metric.change === "number" && (
          <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold mb-1.5 ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(metric.change)}%
          </div>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-gray-400">{metric.description}</p>
    </div>
  );
};

const AnalyticsPanel = ({ title, subtitle, children, action, className = "", onEmail }) => (
  <section className={`rounded-[1.5rem] border border-gray-100 bg-white p-7 shadow-sm flex flex-col ${className}`}>
    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between shrink-0">
      <div>
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-xs font-medium text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action && <div>{action}</div>}
        {onEmail && <CardMenu onEmail={() => onEmail(title)} />}
      </div>
    </div>
    <div className="flex-1 min-h-[300px]">{children}</div>
  </section>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm p-4 shadow-xl z-50">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="font-semibold text-gray-600">{item.name}</span></div>
            <span className="font-bold text-gray-900">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const s = status?.toLowerCase() || "";
  let color = "bg-gray-100 text-gray-600";
  if (["confirmed", "completed", "success"].includes(s)) color = "bg-emerald-100 text-emerald-700";
  if (["pending", "processing"].includes(s)) color = "bg-amber-100 text-amber-700";
  if (["cancelled", "failed", "error"].includes(s)) color = "bg-rose-100 text-rose-700";
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>{status}</span>;
};

const SimpleTable = ({ columns, rows, emptyMessage = "No data available yet." }) => {
  if (!rows?.length) return <div className="p-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">{emptyMessage}</div>;
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((column) => (
              <th key={column.key} className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-[#f8fafc] transition-colors group">
              {columns.map((column) => (
                <td key={column.key} className="py-4 text-sm text-gray-600 whitespace-nowrap pr-4">
                  <span className={column.className}>{column.render ? column.render(row) : row[column.key]}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
    return () => clearTimeout(toastTimeoutRef.current);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/analytics");
      setAnalytics(data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to load analytics dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReport = async (contextName) => {
    setToast({ type: "info", message: `Generating PDF for ${contextName}...` });
    try {
      await api.post('/analytics/email', { section: activeSection, context: contextName });
      setToast({ type: "success", message: `Report sent successfully to your email!` });
    } catch (err) {
      const msg = err.response?.data?.error || "Check mail settings.";
      setToast({ type: "error", message: `Failed: ${msg}` });
    }
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = useMemo(
    () => SECTION_OPTIONS.find((option) => option.id === activeSection) || SECTION_OPTIONS[0],
    [activeSection]
  );

  const renderOverview = () => {
    const metrics = analytics?.overview?.cards || [];
    const revenueTrend = analytics?.sales?.revenue_trend || [];
    const topProducts = analytics?.products?.top_products || [];
    const recentQueue = analytics?.payments?.pending_queue || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {metrics.slice(0, 4).map((m, i) => {
                 const icons = [CircleDollarSign, ShoppingBag, CreditCard, Users];
                 return <MetricCard key={m.label} metric={m} icon={icons[i]} onEmail={handleEmailReport} />;
              })}
            </div>
            <AnalyticsPanel title="Revenue Trend" subtitle="Daily online vs POS" onEmail={handleEmailReport}>
              {revenueTrend.length ? (
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="online" name="Online" stroke="#4f6fa5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="pos" name="POS" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-full flex items-center justify-center text-gray-400">No data found</div>}
            </AnalyticsPanel>
          </div>
          <div className="flex flex-col gap-6 h-fit">
            <AnalyticsPanel title="Top Products" onEmail={handleEmailReport}>
               {topProducts.length ? (
                 <div className="space-y-5 mt-2">
                   {topProducts.slice(0, 5).map((prod, i) => (
                     <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#4f6fa5] font-bold text-sm border border-slate-100">{prod.name.charAt(0)}</div>
                         <div><p className="text-sm font-bold text-gray-800 tracking-tight line-clamp-1">{prod.name}</p><p className="text-[11px] font-semibold text-gray-400 uppercase">{prod.quantity} Units</p></div>
                       </div>
                       <p className="text-sm font-bold text-gray-900">{formatValue(prod.revenue, "currency")}</p>
                     </div>
                   ))}
                 </div>
               ) : <div className="text-center py-10 text-gray-400">No products sold</div>}
            </AnalyticsPanel>
          </div>
        </div>
        <AnalyticsPanel title="Recent Transactions" onEmail={handleEmailReport}>
           <SimpleTable
             columns={[
               { key: "order_id", label: "Order ID", className: "font-bold text-gray-900" },
               { key: "method", label: "Method", className: "font-medium capitalize" },
               { key: "amount", label: "Amount", render: (row) => formatValue(row.amount, "currency"), className: "font-bold text-gray-900" },
               { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
             ]}
             rows={recentQueue}
           />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderSales = () => {
    const trend = analytics?.sales?.revenue_trend || [];
    const deliveryBreakdown = analytics?.sales?.delivery_breakdown || [];
    const paymentMethods = analytics?.sales?.payment_method_breakdown || [];

    return (
      <div className="flex flex-col gap-6">
        <AnalyticsPanel title="Revenue by Channel" subtitle="Daily website revenue compared with POS revenue." onEmail={handleEmailReport}>
          {trend.length ? (
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="online" name="Online" fill="#4f6fa5" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="pos" name="POS" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-full flex items-center justify-center text-gray-400">No sales data found</div>}
        </AnalyticsPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Delivery Breakdown" subtitle="Revenue share by delivery method." onEmail={handleEmailReport}>
            {deliveryBreakdown.length ? (
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deliveryBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {deliveryBreakdown.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No delivery data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Payment Methods" subtitle="How customers pay across tracked transactions." onEmail={handleEmailReport}>
            {paymentMethods.length ? (
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {paymentMethods.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No payment method data found</div>}
          </AnalyticsPanel>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const kpis = analytics?.orders?.kpis || [];
    const statusTrend = analytics?.orders?.status_trend || [];
    const mix = analytics?.orders?.mix || [];
    const basketSizes = analytics?.orders?.basket_sizes || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [CheckCircle2, X, Package, Mail];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsPanel title="Order Status Trend" subtitle="Monthly view of pending, confirmed, completed, and cancelled orders." onEmail={handleEmailReport}>
              {statusTrend.length ? (
                <div className="h-[320px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="pending" stackId="orders" fill="#eab308" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="confirmed" stackId="orders" fill="#4f6fa5" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="completed" stackId="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="cancelled" stackId="orders" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-full flex items-center justify-center text-gray-400">No order history found</div>}
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="Order Mix" subtitle="Custom versus premade ordering behavior." onEmail={handleEmailReport}>
            {mix.length ? (
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {mix.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No order mix data found</div>}
          </AnalyticsPanel>
        </div>

        <AnalyticsPanel title="Largest Baskets" subtitle="Orders with the highest item counts." onEmail={handleEmailReport}>
          <SimpleTable
            columns={[
              { key: "label", label: "Order ID", className: "font-bold text-gray-900" },
              { key: "items", label: "Item Count", className: "font-medium" },
            ]}
            rows={basketSizes}
          />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderProducts = () => {
    const topProducts = analytics?.products?.top_products || [];
    const categories = analytics?.products?.category_performance || [];
    const types = analytics?.products?.type_performance || [];

    return (
      <div className="flex flex-col gap-6">
        <AnalyticsPanel title="Top Products by Revenue" subtitle="Best-performing products across online and POS channels." onEmail={handleEmailReport}>
          {topProducts.length ? (
            <div className="h-[360px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ top: 10, right: 10, left: 50, bottom: 0 }}>
                  <CartesianGrid horizontal stroke="#f1f5f9" strokeDasharray="4 4" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={140} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#4f6fa5" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-full flex items-center justify-center text-gray-400">No product data found</div>}
        </AnalyticsPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Category Performance" subtitle="Revenue distribution by category." onEmail={handleEmailReport}>
            {categories.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No category data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Type Performance" subtitle="Revenue by product type." onEmail={handleEmailReport}>
            {types.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={types}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No type data found</div>}
          </AnalyticsPanel>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    const kpis = analytics?.customers?.kpis || [];
    const growth = analytics?.customers?.growth || [];
    const distribution = analytics?.customers?.spend_distribution || [];
    const topCustomers = analytics?.customers?.top_customers || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [Users, ShieldCheck, RefreshCw, CircleDollarSign];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Customer Growth" subtitle="New versus returning customers over time." onEmail={handleEmailReport}>
            {growth.length ? (
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growth}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="new" name="New" fill="#4f6fa5" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="returning" name="Returning" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No customer growth data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Spend Distribution" subtitle="How customer spend is distributed across brackets." onEmail={handleEmailReport}>
            {distribution.length ? (
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#f97316" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No spend distribution data found</div>}
          </AnalyticsPanel>
        </div>

        <AnalyticsPanel title="Top Customers" subtitle="Highest-spending customer accounts." onEmail={handleEmailReport}>
          <SimpleTable
            columns={[
              { key: "name", label: "Customer", className: "font-bold text-gray-900" },
              { key: "orders", label: "Orders", className: "font-medium" },
              { key: "spend", label: "Spend", render: (row) => formatValue(row.spend, "currency"), className: "font-bold text-gray-900" },
            ]}
            rows={topCustomers}
          />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderPayments = () => {
    const kpis = analytics?.payments?.kpis || [];
    const statusBreakdown = analytics?.payments?.status_breakdown || [];
    const methodBreakdown = analytics?.payments?.method_breakdown || [];
    const pendingQueue = analytics?.payments?.pending_queue || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [CheckCircle2, Loader2, FileText, Users];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Payment Status" subtitle="Breakdown of tracked payment states." onEmail={handleEmailReport}>
            {statusBreakdown.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {statusBreakdown.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No payment status data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Payment Methods" subtitle="Method usage across payments." onEmail={handleEmailReport}>
            {methodBreakdown.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {methodBreakdown.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No payment method data found</div>}
          </AnalyticsPanel>
        </div>

        <AnalyticsPanel title="Pending Payment Queue" subtitle="Payments that still need review or confirmation." onEmail={handleEmailReport}>
          <SimpleTable
            columns={[
              { key: "payment_id", label: "Payment ID", className: "font-bold text-gray-900" },
              { key: "order_id", label: "Order ID", className: "font-medium" },
              { key: "method", label: "Method", className: "capitalize" },
              { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
              { key: "amount", label: "Amount", render: (row) => formatValue(row.amount, "currency"), className: "font-bold text-gray-900" },
            ]}
            rows={pendingQueue}
          />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderPos = () => {
    const kpis = analytics?.pos?.kpis || [];
    const trend = analytics?.pos?.trend || [];
    const methodBreakdown = analytics?.pos?.method_breakdown || [];
    const hourly = analytics?.pos?.hourly || [];
    const topItems = analytics?.pos?.top_items || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [Store, CircleDollarSign, CreditCard, Package];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsPanel title="POS Sales Trend" subtitle="Monthly in-store sales and transaction volume." onEmail={handleEmailReport}>
              {trend.length ? (
                <div className="h-[320px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" name="Sales" stroke="#4f6fa5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="transactions" name="Transactions" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-full flex items-center justify-center text-gray-400">No POS trend data found</div>}
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel title="POS Payment Mix" subtitle="Payment methods recorded in the POS flow." onEmail={handleEmailReport}>
            {methodBreakdown.length ? (
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      {methodBreakdown.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No POS payment data found</div>}
          </AnalyticsPanel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Busiest POS Hours" subtitle="Hourly in-store sales pattern." onEmail={handleEmailReport}>
            {hourly.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourly}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" height={55} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sales" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No hourly POS data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Top POS Items" subtitle="Best-selling items in the point-of-sale flow." onEmail={handleEmailReport}>
            <SimpleTable
              columns={[
                { key: "name", label: "Item", className: "font-bold text-gray-900" },
                { key: "quantity", label: "Units Sold", className: "font-medium" },
                { key: "revenue", label: "Revenue", render: (row) => formatValue(row.revenue, "currency"), className: "font-bold text-gray-900" },
              ]}
              rows={topItems}
            />
          </AnalyticsPanel>
        </div>
      </div>
    );
  };

  const renderSchedules = () => {
    const kpis = analytics?.schedules?.kpis || [];
    const trend = analytics?.schedules?.trend || [];
    const bookingsPerEvent = analytics?.schedules?.bookings_per_event || [];
    const upcoming = analytics?.schedules?.upcoming || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [CalendarDays, CalendarDays, CheckCircle2, Sparkles];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Booking Trend" subtitle="Monthly schedule booking activity." onEmail={handleEmailReport}>
            {trend.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="bookings" stroke="#4f6fa5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No booking trend data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Bookings per Event" subtitle="Most popular schedules and events." onEmail={handleEmailReport}>
            {bookingsPerEvent.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsPerEvent}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-15} textAnchor="end" height={55} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No event booking data found</div>}
          </AnalyticsPanel>
        </div>

        <AnalyticsPanel title="Upcoming Events" subtitle="Scheduled events with location and booking counts." onEmail={handleEmailReport}>
          <SimpleTable
            columns={[
              { key: "name", label: "Event", className: "font-bold text-gray-900" },
              { key: "date", label: "Date", className: "font-medium" },
              { key: "location", label: "Location" },
              { key: "bookings", label: "Bookings", className: "font-bold text-gray-900" },
            ]}
            rows={upcoming}
          />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderOperations = () => {
    const kpis = analytics?.operations?.kpis || [];
    const activityTrend = analytics?.operations?.activity_trend || [];
    const actionsByUser = analytics?.operations?.actions_by_user || [];
    const recent = analytics?.operations?.recent || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((metric, index) => {
            const icons = [FileText, ShieldCheck, X, Users];
            return <MetricCard key={metric.label} metric={metric} icon={icons[index]} onEmail={handleEmailReport} />;
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnalyticsPanel title="Activity Trend" subtitle="Recent admin and staff activity over time." onEmail={handleEmailReport}>
            {activityTrend.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="opsAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f6fa5" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#4f6fa5" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="actions" stroke="#4f6fa5" fill="url(#opsAreaFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No activity trend data found</div>}
          </AnalyticsPanel>

          <AnalyticsPanel title="Actions by User" subtitle="Most active accounts in the logs." onEmail={handleEmailReport}>
            {actionsByUser.length ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionsByUser}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-15} textAnchor="end" height={55} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No user activity data found</div>}
          </AnalyticsPanel>
        </div>

        <AnalyticsPanel title="Recent Activity Feed" subtitle="Latest operational events from your logs." onEmail={handleEmailReport}>
          <SimpleTable
            columns={[
              { key: "time", label: "Time", className: "font-medium" },
              { key: "user", label: "User", className: "font-bold text-gray-900" },
              { key: "role", label: "Role" },
              { key: "event", label: "Event" },
              { key: "module", label: "Module" },
            ]}
            rows={recent}
          />
        </AnalyticsPanel>
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "sales":
        return renderSales();
      case "orders":
        return renderOrders();
      case "products":
        return renderProducts();
      case "customers":
        return renderCustomers();
      case "payments":
        return renderPayments();
      case "pos":
        return renderPos();
      case "schedules":
        return renderSchedules();
      case "operations":
        return renderOperations();
      case "overview":
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-[300] transition-all transform animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium backdrop-blur-md border ${
              toast.type === "success" ? "bg-emerald-500 text-white" :
              toast.type === "info" ? "bg-gray-900 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "info" ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="drop-shadow-sm pr-4">{toast.message}</span>
            <button onClick={() => setToast(null)}><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="relative z-[160] mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">Workspace for revenue, orders, products, and operations.</p>
        </div>
        <div className="flex items-center gap-4">
        <button onClick={() => handleEmailReport(`${activeOption.label} Full Report`)} className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm active:scale-95">
          <Mail className="w-4 h-4" />
          Email Report
        </button>
          <div className="relative z-[170] w-[180px]" ref={dropdownRef}>
            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all">
              <div className="flex items-center gap-2"><activeOption.icon className="h-4 w-4 text-[#4f6fa5]" />{activeOption.label}</div>
              <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-[180] mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {SECTION_OPTIONS.map((option) => (
                  <button key={option.id} onClick={() => { setActiveSection(option.id); setIsDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${activeSection === option.id ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                    <option.icon className="h-4 w-4 shrink-0" /><span className="text-sm font-bold tracking-tight">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[600px] items-center justify-center rounded-[2rem] border border-gray-100 bg-[#f8fafc] shadow-sm">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" /><span className="text-sm font-bold tracking-widest uppercase">Compiling Data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-100 bg-rose-50 px-6 py-20 text-center text-rose-600 font-bold">{error}</div>
      ) : renderActiveSection()}
    </div>
  );
}

export default AdminAnalyticsPage;
