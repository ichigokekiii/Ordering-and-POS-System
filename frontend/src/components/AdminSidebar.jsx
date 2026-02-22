import { NavLink } from "react-router-dom";

function AdminSidebar({ onLogout }) {
  const baseClass =
    "block rounded px-3 py-2 transition hover:bg-gray-100";

  const activeClass =
    "block rounded px-3 py-2 bg-blue-100 text-blue-600 font-semibold";

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white px-6 py-8">
      {/* Logo */}
      <div className="mb-10 text-lg font-semibold text-blue-600">
        Admin Panel
      </div>

      {/* Navigation */}
      <ul className="flex flex-1 flex-col gap-2 text-sm text-gray-700">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Overview
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Analytics
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Products
        </NavLink>

        <NavLink
          to="/admin/premades"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Premades
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Orders
        </NavLink>

        <NavLink
          to="/admin/schedule"
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Schedule
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => (isActive ? activeClass : baseClass)}
        >
          Users
        </NavLink>
      </ul>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
}

export default AdminSidebar;
