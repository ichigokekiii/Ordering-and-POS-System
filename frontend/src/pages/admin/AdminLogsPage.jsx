/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown, Search, Filter, Loader2, CalendarClock } from "lucide-react";
import api from "../../services/api";
import { sanitizeSearchTerm } from "../../utils/formValidation";

const formatRole = (role) => {
  if (!role) return "System";
  if (role === "user" || role === "customer") return "Customer";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Reusable Module Pill for the new Activity column
const ModulePill = ({ moduleName }) => {
  const m = (moduleName || "general").toLowerCase();
  
  let colorClass = "bg-gray-100 text-gray-600 border-gray-200"; // default
  
  if (m.includes("user") || m.includes("auth") || m.includes("account")) {
    colorClass = "bg-purple-100 text-purple-700 border-purple-200";
  } else if (m.includes("product") || m.includes("inventory")) {
    colorClass = "bg-indigo-100 text-indigo-700 border-indigo-200";
  } else if (m.includes("order") || m.includes("checkout") || m.includes("payment")) {
    colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (m.includes("schedule") || m.includes("event")) {
    colorClass = "bg-amber-100 text-amber-700 border-amber-200";
  } else if (m.includes("cms") || m.includes("content")) {
    colorClass = "bg-pink-100 text-pink-700 border-pink-200";
  } else {
    colorClass = "bg-blue-100 text-blue-700 border-blue-200";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
      {m}
    </span>
  );
};

function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });
  
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    types: [],
  });
  
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const dropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    user_id: "",
    type: "",
    date_from: "",
    date_to: "",
    page: 1,
  });

  // Check if any filters are actively applied
  const hasActiveFilters = Boolean(filters.user_id || filters.type || filters.date_from || filters.date_to);

  // Handle clicking outside the filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = useMemo(() => {
    const params = {
      per_page: meta.per_page,
      page: filters.page,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.type) params.type = filters.type;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;

    return params;
  }, [filters, meta.per_page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchLogs();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [queryParams]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/logs", { params: queryParams });

      setLogs(response.data.data || []);
      setMeta(response.data.meta || meta);
      setFilterOptions(response.data.filter_options || { users: [], types: [] });
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError("Failed to load logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "search" ? sanitizeSearchTerm(value) : value,
      page: key === "page" ? value : 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      user_id: "",
      type: "",
      date_from: "",
      date_to: "",
      page: 1,
    });
    setShowFilterMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* HEADER AREA */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">System Logs</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
            Track and monitor all administrative actions, data changes, and user activities.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search logs by keyword or module..." 
             value={filters.search}
             onChange={(event) => handleFilterChange("search", event.target.value)}
             maxLength={100}
             className="w-full bg-slate-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#eaf2ff] transition-all"
           />
        </div>

        <div className="flex gap-3">
          {/* FILTER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] relative"
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#4f6fa5] ring-2 ring-white"></span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilterMenu ? "rotate-180" : ""}`} />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 p-5 animate-in fade-in zoom-in duration-100">
                
                {/* User Filter (Button Stack) */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filter by User</p>
                <div className="space-y-1 mb-4 max-h-40 overflow-y-auto nice-scrollbar pr-2">
                  <button
                    onClick={() => handleFilterChange("user_id", "")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      filters.user_id === "" ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Users
                  </button>
                  {filterOptions.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleFilterChange("user_id", String(user.id))}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold truncate transition-colors ${
                        String(filters.user_id) === String(user.id) ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>

                {/* Function/Type Filter (Button Stack) */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-t border-gray-50 pt-4">Filter by Module</p>
                <div className="space-y-1 mb-4 max-h-40 overflow-y-auto nice-scrollbar pr-2">
                  <button
                    onClick={() => handleFilterChange("type", "")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      filters.type === "" ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Modules
                  </button>
                  {filterOptions.types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange("type", type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold capitalize truncate transition-colors ${
                        filters.type === type ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Date Filters */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-t border-gray-50 pt-4">Date Range</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-500 font-bold ml-1 mb-1 block">FROM</span>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => handleFilterChange("date_from", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 focus:bg-white focus:border-[#4f6fa5] focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-500 font-bold ml-1 mb-1 block">TO</span>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => handleFilterChange("date_to", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 focus:bg-white focus:border-[#4f6fa5] focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                    />
                  </div>
                </div>

                {/* Optional Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-bold text-rose-600 text-center">
          {error}
        </div>
      )}

      {/* MAIN TABLE CONTAINER (Fixed height, Scrollable Inner Viewport) */}
      <div className="flex flex-col h-[650px] shrink-0 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
             <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
             <span className="text-xs font-bold uppercase tracking-widest">Loading Logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
             <Search className="w-10 h-10 opacity-20 mb-2" />
             <span className="text-sm font-bold text-gray-500">No logs found matching your criteria.</span>
             <button onClick={clearFilters} className="text-xs font-bold text-[#4f6fa5] hover:underline mt-2">Clear Filters</button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative nice-scrollbar">
            <table className="min-w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#f8fafc] shadow-sm">
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap w-16">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap w-64">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Event Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Source</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right whitespace-nowrap">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {logs.map((log) => (
                  <tr key={log.log_id} className="group hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-400">#{log.log_id}</span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4f6fa5] font-bold shrink-0 text-xs">
                          {log.user_name ? log.user_name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight whitespace-nowrap text-sm">{log.user_name || "System Automated"}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formatRole(log.user_role)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Event Details */}
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 max-w-md">{log.event || "No description provided"}</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("en-US", { 
                            month: 'short', day: 'numeric', year: 'numeric', 
                            hour: 'numeric', minute: '2-digit', hour12: true 
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-gray-500">{log.source || "Application"}</span>
                    </td>

                    {/* Activity Module Pill */}
                    <td className="px-6 py-5 text-right">
                      <ModulePill moduleName={log.module} />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && logs.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Page <span className="text-gray-900">{meta.current_page}</span> of <span className="text-gray-900">{Math.max(meta.last_page, 1)}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange("page", Math.max(meta.current_page - 1, 1))}
              disabled={meta.current_page <= 1}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm disabled:opacity-40 disabled:hover:border-gray-200"
            >
              Previous
            </button>

            <div className="hidden sm:flex gap-1">
              {[...Array(Math.min(meta.last_page, 5))].map((_, i) => {
                let pageNum = i + 1;
                if (meta.last_page > 5 && meta.current_page > 3) {
                  pageNum = meta.current_page - 2 + i;
                  if (pageNum > meta.last_page) return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange("page", pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      meta.current_page === pageNum 
                        ? "bg-gray-900 border border-gray-900 text-white shadow-sm" 
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleFilterChange("page", meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm disabled:opacity-40 disabled:hover:border-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Helper CSS for the dropdown and table scrollbars */}
      <style>{`
        .nice-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .nice-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
        .nice-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}

export default AdminLogsPage; 