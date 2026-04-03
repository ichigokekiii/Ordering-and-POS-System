/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavbar } from "../contexts/NavbarContext";
import { useContents } from "../contexts/ContentContext";

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useNavbar();

  const contentContext = useContents();
  const contents = contentContext?.contents || [];

  const getContentValue = (identifier, fallback = "") => {
    const item = contents.find(
      (c) => c.identifier === identifier && !c.isArchived
    );

    if (!item) return fallback;

    if (item.type === "text") return item.content_text;
    if (item.type === "image") return item.content_image;

    return fallback;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur-md"
      style={{
        backgroundColor: getContentValue("navbar_bg_color", "#ffffffee"),
        backgroundImage: getContentValue("navbar_bg_image", "")
          ? `url(http://localhost:8000${getContentValue("navbar_bg_image")})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        <Link
          to="/"
          className="cursor-pointer text-lg font-semibold tracking-wide"
          style={{ color: getContentValue("navbar_text_color", "#2563eb") }}
        >
          {getContentValue("navbar_brand", "petal express")}
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm text-gray-700 md:flex">
          <li className="hover:text-[#4f6fa5]">
            <Link to="/">Home</Link>
          </li>

          <li className="hover:text-[#4f6fa5]">
            <Link to="/about">About</Link>
          </li>

          <li className="hover:text-[#4f6fa5]">
            <Link to="/products">Showcase</Link>
          </li>

          <li className="hover:text-[#4f6fa5]">
            <Link to="/schedule">Schedule</Link>
          </li>
        </ul>

        {currentUser ? (
          <div ref={menuRef} className="relative flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hi, {currentUser.first_name}
            </span>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center rounded-full border p-2 hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
            >
              <User size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 rounded-lg border bg-white shadow-md">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </Link>

                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full border px-5 py-2 text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
