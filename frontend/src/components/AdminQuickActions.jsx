import { useEffect, useRef, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Moon,
  Plus,
  Store,
  Sun,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  STAFF_POS_DARK_MODE_STORAGE_KEY,
  STAFF_POS_THEME_EVENT,
} from "../constants/theme";

const readPosDarkMode = (fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = window.sessionStorage.getItem(STAFF_POS_DARK_MODE_STORAGE_KEY);

    if (storedValue === null) {
      return fallbackValue;
    }

    return storedValue === "true";
  } catch {
    return fallbackValue;
  }
};

function AdminQuickActions({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const actionsRef = useRef(null);
  const { isDarkMode, setThemePreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const canUseQuickActions = user?.role === "admin" || user?.role === "owner";
  const isStaffRoute = location.pathname.startsWith("/staff");
  const currentDarkMode = isStaffRoute ? readPosDarkMode(isDarkMode) : isDarkMode;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const syncThemeModes = (nextDarkMode) => {
    setThemePreference(nextDarkMode ? "dark" : "light");

    try {
      window.sessionStorage.setItem(
        STAFF_POS_DARK_MODE_STORAGE_KEY,
        String(nextDarkMode)
      );
    } catch (error) {
      console.error("Failed to persist POS dark mode from quick actions", error);
    }

    window.dispatchEvent(
      new CustomEvent(STAFF_POS_THEME_EVENT, {
        detail: { isDarkMode: nextDarkMode },
      })
    );
  };

  const actions = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      icon: LayoutDashboard,
      onClick: () => navigate("/admin"),
    },
    {
      id: "user-site",
      label: "Go to User Page",
      icon: Home,
      onClick: () => navigate("/"),
    },
    {
      id: "pos",
      label: "Go to POS",
      icon: Store,
      onClick: () => navigate("/staff/orderpremade"),
    },
    {
      id: "theme",
      label: currentDarkMode ? "Light Mode" : "Dark Mode",
      icon: currentDarkMode ? Sun : Moon,
      onClick: () => syncThemeModes(!currentDarkMode),
    },
  ];

  if (!canUseQuickActions) {
    return null;
  }

  return (
    <div
      ref={actionsRef}
      className="pointer-events-none fixed bottom-5 right-5 z-[180] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {isOpen && (
        <div className="pointer-events-auto flex w-[220px] flex-col gap-2 rounded-[1.75rem] border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 hover:text-[#4f6fa5] dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-sky-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f6fa5]/10 text-[#4f6fa5] dark:bg-sky-500/15 dark:text-sky-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4f6fa5] text-white shadow-[0_18px_40px_rgba(79,111,165,0.35)] transition-all hover:scale-105 hover:bg-[#3f5b89] dark:bg-sky-500 dark:hover:bg-sky-400"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        <Plus className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`} />
      </button>
    </div>
  );
}

export default AdminQuickActions;
