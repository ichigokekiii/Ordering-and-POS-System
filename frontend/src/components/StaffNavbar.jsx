import { Link, useNavigate } from "react-router-dom";

function StaffNavbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="cursor-pointer text-lg font-semibold tracking-wide text-blue-600"
        >
          petal express
        </Link>
        {/* Login Button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="rounded-full border px-5 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-full border px-5 py-2 text-sm hover:bg-gray-100"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default StaffNavbar;
