function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        
        {/* Logo */}
        <div className="text-lg font-semibold tracking-wide text-blue-600">
          petal express
        </div>
        {/* Navig
        ation Links */}
        <ul className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <li className="cursor-pointer hover:text-blue-600">Home</li>
          <li className="cursor-pointer hover:text-blue-600">About</li>
          <li className="cursor-pointer hover:text-blue-600">Products</li>
          <li className="cursor-pointer hover:text-blue-600">Schedule</li>
        </ul>

        {/* Action Button */}
        <button className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
          Login / Signup
        </button>
      </div>
    </nav>
  );
}

export default Navbar;