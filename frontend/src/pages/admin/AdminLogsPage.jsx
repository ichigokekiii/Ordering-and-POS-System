/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import api from "../../services/api";

const formatRole = (role) => {
  if (!role) return "System";
  if (role === "user" || role === "customer") return "Customer";
  return role.charAt(0).toUpperCase() + role.slice(1);
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
  const [filters, setFilters] = useState({
    search: "",
    user_id: "",
    type: "",
    date_from: "",
    date_to: "",
    page: 1,
  });

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
      setError("Failed to load logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
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
  };

  return (
    <div className="px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black mb-6">Logs</h1>
      </div>


      <div className="rounded border p-6 shadow-sm bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Logs list
          </h2>

          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={filters.search}
                onChange={(event) => handleFilterChange("search", event.target.value)}
                className="w-64 rounded border py-2 pl-10 pr-3 text-sm"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-5 py-2 border rounded text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                Filter By <ChevronDown className="w-4 h-4" />
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-md z-10">
                  <div className="px-4 py-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 mb-2">USER</p>
                    <div className="space-y-1">
                      <button onClick={() => handleFilterChange("user_id", "")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">All</button>
                      {filterOptions.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleFilterChange("user_id", user.id)}
                          className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 mb-2">FUNCTION</p>
                    <div className="space-y-1">
                      <button onClick={() => handleFilterChange("type", "")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">All</button>
                      {filterOptions.types.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleFilterChange("type", type)}
                          className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 mb-2">DATE FROM</p>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(event) => handleFilterChange("date_from", event.target.value)}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">DATE TO</p>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(event) => handleFilterChange("date_to", event.target.value)}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                    <button
                      onClick={clearFilters}
                      className="mt-3 w-full rounded border px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="overflow-x-auto">
          <div>
            {/* HEADER */}
            <div className="grid grid-cols-[56px_1fr_1.5fr_1.2fr_1fr_auto] gap-3 px-2 pb-2 border-b text-xs font-semibold uppercase text-gray-500">
              <div className="w-12">ID</div>
              <div>User</div>
              <div>Event</div>
              <div>Date</div>
              <div>Source</div>
              <div>Status</div>
            </div>

            {/* ROWS */}
            <div className="divide-y">
              {loading ? (
                <div className="py-10 text-center text-gray-400">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="py-10 text-center text-gray-400">No logs yet</div>
              ) : (
                logs.map((log) => (
                  <div key={log.log_id} className="grid grid-cols-[56px_1fr_1.5fr_1.2fr_1fr_auto] gap-3 items-center py-3 hover:bg-gray-50 px-2 rounded">
                    <div className="w-[56px] text-xs font-medium text-gray-500">
                      {log.log_id}
                    </div>
                    {/* User */}
                    <div>
                      <p className="font-medium text-gray-900">{log.user_name || "System"}</p>
                      <p className="text-xs text-gray-500">{formatRole(log.user_role)}</p>
                    </div>

                    {/* Event */}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{log.event || "No event"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700">
                          {log.module || "General"}
                        </span>
                        {log.type && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">
                            {log.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString("en-US")}
                    </div>

                    {/* Source */}
                    <div>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-600">
                        {log.source || "API"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          log.type === "delete"
                            ? "bg-red-100 text-red-700"
                            : log.type === "update"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {log.type || "activity"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t pt-6">
          <p className="text-sm text-gray-500">
            Page {meta.current_page} of {Math.max(meta.last_page, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange("page", Math.max(meta.current_page - 1, 1))}
              disabled={meta.current_page <= 1}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100 disabled:opacity-40"
            >
              Previous
            </button>

            {[...Array(Math.min(meta.last_page, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handleFilterChange("page", page)}
                  className={`w-8 h-8 text-sm rounded ${meta.current_page === page ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handleFilterChange("page", meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogsPage;
