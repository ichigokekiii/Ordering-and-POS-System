import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavbar } from "../contexts/NavbarContext";
import { useContents } from "../contexts/ContentContext";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import CmsEditableRegion from "./admin/CmsEditableRegion";
import { getAssetUrl } from "../utils/assetUrl";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../cms/cmsRegistry";

function Navbar({ cmsPreview }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logoutUser } = useNavbar();
  const { isDarkMode, toggleTheme } = useTheme();
  const { selectedScheduleId, totalItems } = useCart();

  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const orderBuilderRoutes = [
    "/order",
    "/ordercustom",
    "/order/custom/additional",
    "/orderpremade",
  ];
  const shouldShowOrderCart =
    selectedScheduleId !== null &&
    orderBuilderRoutes.includes(location.pathname);

  const getContentValue = (identifier, fallback = "") =>
    getCmsContentValue(contents, "navbar", identifier, fallback);

  const preventPreviewNavigation = (event) => {
    if (!cmsPreview?.enabled) return;
    event.preventDefault();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profilePictureUrl = getAssetUrl(currentUser?.profile_picture);
  const profileInitial = currentUser?.first_name?.[0]?.toUpperCase() || "U";
  const cartCountLabel = totalItems > 9 ? "9+" : String(totalItems);

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
      className={`${
        /* FIXED: Lowered z-[120] to z-40 so modals can sit above it! */
        cmsPreview?.enabled ? "relative z-30" : "sticky top-0 z-40"
      } w-full border-b border-gray-200 backdrop-blur-md pointer-events-auto`}
      style={{
        backgroundColor: isDarkMode
          ? "rgba(8, 17, 31, 0.94)"
          : getContentValue("navbar_bg_color", "#ffffffee"),
        backgroundImage: isDarkMode
          ? "none"
          : getContentValue("navbar_bg_image", "")
          ? `url(${getCmsAssetUrl(getContentValue("navbar_bg_image"))})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-4">
        
        {/* Brand Section - Elevated Z-index and forced pointer events for CMS */}
        <CmsEditableRegion
          cmsPreview={cmsPreview}
          field={getCmsField("navbar", "navbar_brand")}
          className="inline-block relative z-[200] pointer-events-auto"
        >
          <Link
            to="/"
            onClick={preventPreviewNavigation}
            className="cursor-pointer text-lg font-semibold tracking-wide block"
          >
            <span
              style={{
                color: isDarkMode
                  ? "#93c5fd"
                  : getContentValue("navbar_text_color", "#2563eb"),
              }}
            >
              {getContentValue("navbar_brand", "petal express")}
            </span>
          </Link>
        </CmsEditableRegion>

        {/* Links Section - Absolute positioning moved to a safe parent div */}
        <div className="hidden min-w-0 justify-center md:flex z-40">
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("navbar", "navbar_text_color")}
            className="block"
          >
            <ul
              className="flex items-center gap-8 px-2 py-1 text-sm pointer-events-auto"
              style={{
                color: isDarkMode
                  ? "#e2e8f0"
                  : getContentValue("navbar_text_color", "#374151"),
              }}
            >
              <li className="hover:text-[#4f6fa5] transition-colors">
                <Link to="/" onClick={preventPreviewNavigation}>
                  Home
                </Link>
              </li>

              <li className="hover:text-[#4f6fa5] transition-colors">
                <Link to="/about" onClick={preventPreviewNavigation}>
                  About
                </Link>
              </li>

              <li className="hover:text-[#4f6fa5] transition-colors">
                <Link to="/products" onClick={preventPreviewNavigation}>
                  Showcase
                </Link>
              </li>

              <li className="hover:text-[#4f6fa5] transition-colors">
                <Link to="/schedule" onClick={preventPreviewNavigation}>
                  Schedule
                </Link>
              </li>
            </ul>
          </CmsEditableRegion>
        </div>

        {/* Profile Section */}
        {currentUser ? (
          <div ref={menuRef} className="relative flex items-center gap-4 z-[200] pointer-events-auto">
            {shouldShowOrderCart && (
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="relative text-gray-400 transition-colors hover:text-[#4f6fa5]"
                aria-label="View cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {cartCountLabel}
                  </span>
                )}
              </button>
            )}

            <span className="text-sm text-gray-600">
              Hi, {currentUser.first_name}
            </span>

            <button
              onClick={() => {
                if (!cmsPreview?.enabled) {
                  setMenuOpen(!menuOpen);
                }
              }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white hover:border-[#4f6fa5] hover:bg-[#4f6fa5]/10 transition-colors"
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${currentUser.first_name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-700">
                  {profileInitial}
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-[200]">
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#4f6fa5] transition-colors"
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
                  className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#4f6fa5] transition-colors border-t border-gray-50"
                >
                  {isDarkMode ? "Light Theme" : "Dark Theme"}
                </button>

                <button
                  onClick={() => {
                    if (!cmsPreview?.enabled) {
                      handleLogout();
                    }
                  }}
                  className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-[200] flex items-center gap-3 pointer-events-auto">
            {shouldShowOrderCart && (
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="relative text-gray-400 transition-colors hover:text-[#4f6fa5]"
                aria-label="View cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {cartCountLabel}
                  </span>
                )}
              </button>
            )}

            <Link
              to="/login"
              onClick={preventPreviewNavigation}
              className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-[#4f6fa5] transition-all shadow-sm block"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
