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
} from "lucide-react";

function AdminSidebar({ isOpen, onClose }) {
  const [showBlockModal, setShowBlockModal] = useState(false);

  const baseClass =
    "flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-500 border-l-4 border-transparent transition-all duration-200 hover:bg-[#eaf2ff]/50 hover:text-[#4f6fa5]";

  const activeClass =
    "flex items-center gap-3 px-6 py-3 text-sm font-bold bg-[#eaf2ff] text-[#4f6fa5] border-l-4 border-[#4f6fa5]";

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <Link
            to="/admin"
            className="text-lg font-semibold tracking-wide text-[#2563eb]"
            onClick={handleNavClick}
          >
            petal express
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col">
            <NavLink
              to="/admin"
              end
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <LayoutDashboard className="h-5 w-5" />
              Overview
            </NavLink>

            <NavLink
              to="/admin/analytics"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <LineChart className="h-5 w-5" />
              Analytics
            </NavLink>

            <NavLink
              to="/admin/products"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <Package className="h-5 w-5" />
              Products
            </NavLink>

            <NavLink
              to="/admin/orders"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </NavLink>

            <NavLink
              to="/admin/schedule"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <Calendar className="h-5 w-5" />
              Schedule
            </NavLink>

            <NavLink
              to="/admin/content"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <FileText className="h-5 w-5" />
              Content
            </NavLink>

            <NavLink
              to="/admin/feedbacks"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <MessageSquare className="h-5 w-5" />
              Feedback
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <Users className="h-5 w-5" />
              Users
            </NavLink>

            <NavLink
              to="/admin/logs"
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : baseClass)}
            >
              <ScrollText className="h-5 w-5" />
              Logs
            </NavLink>
          </ul>
        </nav>

        {showBlockModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-[2rem] border border-gray-100 bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-playfair font-bold text-gray-900">
                Feature In Progress
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                This section is currently under development. Please check back
                later.
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
    </>
  );
}

export default AdminSidebar;
