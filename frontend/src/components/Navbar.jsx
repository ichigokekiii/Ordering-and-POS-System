/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavbar } from "../contexts/NavbarContext";
import { useContents } from "../contexts/ContentContext";
import CmsEditableRegion from "./admin/CmsEditableRegion";
import {
  getCmsField,
  getContentValue as getCmsContentValue,
} from "../cms/cmsRegistry";

function Navbar({ cmsPreview }) {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useNavbar();

  const contentContext = useContents();
  const contents = contentContext?.contents || [];

  const getContentValue = (identifier, fallback = "") =>
    getCmsContentValue(contents, "navbar", identifier, fallback);

  const preventPreviewNavigation = (event) => {
    if (!cmsPreview?.enabled) return;
    event.preventDefault();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

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
          onClick={preventPreviewNavigation}
          className="cursor-pointer text-lg font-semibold tracking-wide"
        >
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("navbar", "navbar_brand")}
            className="inline-block"
          >
            <span
              style={{ color: getContentValue("navbar_text_color", "#2563eb") }}
            >
              {getContentValue("navbar_brand", "petal express")}
            </span>
          </CmsEditableRegion>
        </Link>

        <CmsEditableRegion
          cmsPreview={cmsPreview}
          field={getCmsField("navbar", "navbar_text_color")}
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul
            className="flex items-center gap-8 text-sm"
            style={{ color: getContentValue("navbar_text_color", "#374151") }}
          >
            <li className="hover:text-[#4f6fa5]">
              <Link to="/" onClick={preventPreviewNavigation}>
                Home
              </Link>
            </li>

            <li className="hover:text-[#4f6fa5]">
              <Link to="/about" onClick={preventPreviewNavigation}>
                About
              </Link>
            </li>

            <li className="hover:text-[#4f6fa5]">
              <Link to="/products" onClick={preventPreviewNavigation}>
                Showcase
              </Link>
            </li>

            <li className="hover:text-[#4f6fa5]">
              <Link to="/schedule" onClick={preventPreviewNavigation}>
                Schedule
              </Link>
            </li>
          </ul>
        </CmsEditableRegion>

        {currentUser ? (
          <div ref={menuRef} className="relative flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hi, {currentUser.first_name}
            </span>

            <button
              onClick={() => {
                if (!cmsPreview?.enabled) {
                  setMenuOpen(!menuOpen);
                }
              }}
              className="flex items-center justify-center rounded-full border p-2 hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
            >
              <User size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 rounded-lg border bg-white shadow-md">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
                  onClick={(event) => {
                    preventPreviewNavigation(event);
                    setMenuOpen(false);
                  }}
                >
                  My Account
                </Link>

                <button
                  onClick={() => {
                    if (!cmsPreview?.enabled) {
                      toggleTheme();
                    }
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[#4f6fa5]/10 hover:text-[#4f6fa5]"
                >
                  {isDarkMode ? "Light Theme" : "Dark Theme"}
                </button>

                <button
                  onClick={() => {
                    if (!cmsPreview?.enabled) {
                      handleLogout();
                    }
                  }}
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
            onClick={preventPreviewNavigation}
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
