function AdminSidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white px-6 py-8">
      
      {/* Logo / Title */}
      <div className="mb-10 text-lg font-semibold text-blue-600">
        Admin Panel
      </div>

      {/* Navigation */}
      <ul className="flex flex-1 flex-col gap-2 text-sm text-gray-700">
        <li
          className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
          onClick={() => window.setPage("admin-overview")}
        >
          Overview
        </li>

        <li
          className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
          onClick={() => window.setPage("admin-products")}
        >
          Products
        </li>
      </ul>

      {/* Logout */}
      <button
        onClick={window.logout}
        className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
}

export default AdminSidebar;
