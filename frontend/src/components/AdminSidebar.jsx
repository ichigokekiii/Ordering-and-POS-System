import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  LineChart, 
  Package, 
  ShoppingCart, 
  Calendar, 
  FileText, 
  Users, 
  ScrollText, 
  MessageSquare,
  LogOut 
} from "lucide-react";

function AdminSidebar() {
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Inactive state: Soft gray, hovering to your brand's slate blue
  const baseClass =
    "flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-500 border-l-4 border-transparent transition-all duration-200 hover:bg-[#eaf2ff]/50 hover:text-[#4f6fa5]";

  // Active state: Your light blue tint background, slate blue text, and slate blue border indicator
  const activeClass =
    "flex items-center gap-3 px-6 py-3 text-sm font-bold bg-[#eaf2ff] text-[#4f6fa5] border-l-4 border-[#4f6fa5]";

  return (
    <div className="sticky top-0 flex h-screen w-64 flex-col bg-white border-r border-gray-100 transition-all duration-300">
      {/* Logo Area - Updated to match your user Navbar */}
      <div className="flex h-16 items-center border-b border-gray-100 px-6">
        <Link to="/admin" className="text-lg font-semibold tracking-wide text-[#2563eb]">
          petal express
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </NavLink>

          <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <LineChart className="h-5 w-5" />
            Analytics
          </NavLink>

          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <Package className="h-5 w-5" />
            Products
          </NavLink>

          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <ShoppingCart className="h-5 w-5" />
            Orders
          </NavLink>

          <NavLink to="/admin/schedule" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <Calendar className="h-5 w-5" />
            Schedule
          </NavLink>

          <NavLink to="/admin/content" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <FileText className="h-5 w-5" />
            Content
          </NavLink>

          <NavLink to="/admin/feedbacks" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <MessageSquare className="h-5 w-5" />
            Feedback
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <Users className="h-5 w-5" />
            Users
          </NavLink>

          <NavLink to="/admin/logs" className={({ isActive }) => (isActive ? activeClass : baseClass)}>
            <ScrollText className="h-5 w-5" />
            Logs
          </NavLink>
        </ul>
      </nav>

      {/* Logout */}

      {/* Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-[2rem] bg-white p-8 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-playfair font-bold text-gray-900">
              Feature In Progress
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              This section is currently under development. Please check back later.
            </p>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowBlockModal(false)}
                className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#4f6fa5]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSidebar;
