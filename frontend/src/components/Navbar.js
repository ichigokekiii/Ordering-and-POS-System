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

          <li
            className="cursor-pointer hover:text-blue-600"
            onClick={() => window.setPage("products")}
          >
            Products
          </li>

          {/* for v0 only */}
          <li
            className="cursor-pointer text-red-500 hover:text-red-600"
            onClick={() => window.setPage("admin")}
          >
            Admin
          </li>
        </ul>

        <button className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Login / Signup
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
