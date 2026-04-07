import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ user, onLogout, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar is fixed to the left */}
      <AdminSidebar onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar is fixed to the top of the content area */}
        <AdminNavbar user={user} onLogout={onLogout} />
        
        {/* The main tag handles the scrolling for your dashboard pages */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;