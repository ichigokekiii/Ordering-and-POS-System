/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, Search, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ADMIN_ROUTES = [
  { label: "Overview", path: "/admin", keywords: ["dashboard", "overview", "home"] },
  { label: "Analytics", path: "/admin/analytics", keywords: ["analytics", "reports", "stats"] },
  { label: "Products", path: "/admin/products", keywords: ["products", "items", "flowers"] },
  { label: "Orders", path: "/admin/orders", keywords: ["orders", "purchases", "transactions"] },
  { label: "Schedule", path: "/admin/schedule", keywords: ["schedule", "calendar", "bookings"] },
  { label: "Content", path: "/admin/content", keywords: ["content", "cms", "homepage"] },
  { label: "Users", path: "/admin/users", keywords: ["users", "accounts", "customers"] },
  { label: "Logs", path: "/admin/logs", keywords: ["logs", "activity", "audit"] },
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "New order received", description: "A new order just came in." },
  { id: 2, title: "Schedule updated", description: "A booking schedule was changed." },
  { id: 3, title: "User activity", description: "A user profile was recently updated." },
];

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.name || user?.email || "Admin User";
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "A";

function AdminNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const displayName = getDisplayName(user);
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Admin";

  const searchableRoutes = useMemo(
    () =>
      ADMIN_ROUTES.map((route) => ({
        ...route,
        haystack: `${route.label} ${route.keywords.join(" ")}`.toLowerCase(),
      })),
    []
  );

  useEffect(() => {
    setSearchTerm("");
    setSearchMessage("");
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setSearchMessage("");
      return;
    }

    const matchedRoute = searchableRoutes.find((route) =>
      route.haystack.includes(query)
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setSearchMessage("");
      return;
    }

    setSearchMessage("No matching admin page found.");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8">
      {/* Left side - Search */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="What do you want to find?"
            className="w-full rounded-full bg-gray-100 py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#eaf2ff] focus:border-[#4f6fa5]"
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </form>
        {searchMessage && (
          <p className="absolute mt-1 text-xs text-red-500">{searchMessage}</p>
        )}
      </div>

      {/* Right side - Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <div className="relative flex items-center" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative text-gray-400 transition-colors hover:text-[#4f6fa5]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full z-40 mt-4 w-80 rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-xs font-bold text-[#4f6fa5] hover:text-[#2a4475] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">No new notifications.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-xl bg-[#fcfaf9] p-3 text-sm transition-colors hover:bg-[#eaf2ff]/50 cursor-pointer border border-transparent hover:border-[#eaf2ff]"
                    >
                      <p className="font-semibold text-gray-900">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {notification.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative border-l border-gray-100 pl-6" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
          >
            {/* Using your brand tint and color for the avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf2ff] text-sm font-bold text-[#4f6fa5]">
              {getInitials(displayName)}
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>

            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full z-40 mt-4 w-56 overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-xl">
              <div className="border-b border-gray-50 bg-[#fcfaf9] px-4 py-4">
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="truncate text-xs text-gray-500 mt-0.5">{user?.email || roleLabel}</p>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#eaf2ff]/50 hover:text-[#4f6fa5]"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;