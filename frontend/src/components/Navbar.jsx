import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleOrderClick = (e) => {
    if (!user) {
      e.preventDefault();
      alert("You need to be logged in to order");
    }
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

        {/* Navigation Links */}
        <ul className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <li className="hover:text-blue-600">
            <Link to="/">Home</Link>
          </li>

          <li className="hover:text-blue-600">
            <Link to="/about">About</Link>
          </li>

          <li className="hover:text-blue-600">
            <Link to="/products">Products</Link>
          </li>

          <li className="hover:text-blue-600">
            <Link to="/schedule">Schedule</Link>
          </li>

          <li className="hover:text-blue-600">
            <Link to="/order" onClick={handleOrderClick}>Order</Link>
          </li>
        </ul>

        {/* Login Button */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, {user.first_name}</span>
            <button
              onClick={handleLogout}
              className="rounded-full border px-5 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
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

export default Navbar;
