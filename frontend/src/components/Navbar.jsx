function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        
        {/* Logo */}
        <div
          className="cursor-pointer text-lg font-semibold tracking-wide text-blue-600"
          onClick={() => window.setPage("home")}
        >
          petal express
        </div>

        {/* Navigation Links */}
        <ul className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <li
            className="cursor-pointer hover:text-blue-600"
            onClick={() => window.setPage("home")}
          >
            Home
          </li>

          <li className="cursor-pointer hover:text-blue-600">
            About
          </li>

          <li
            className="cursor-pointer hover:text-blue-600"
            onClick={() => window.setPage("products")}
          >
            Products
          </li>

          <li className="cursor-pointer hover:text-blue-600">
            Schedule
          </li>
        </ul>

        {/* Auth Button */}
        {window.user ? (
          <button
            onClick={window.logout}
            className="rounded-full border px-5 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => window.setPage("login")}
            className="rounded-full border px-5 py-2 text-sm hover:bg-gray-100"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
