/* eslint-disable react-hooks/refs */
/* eslint-disable no-unused-vars */
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
import { hasAdminDashboardAccess } from "../utils/adminAccess";

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

const QUICK_ACTIONS_POS_KEY = "admin_quick_actions_position";

function AdminQuickActions({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const actionsRef = useRef(null);
  const { isDarkMode, setThemePreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Dragging State & Refs
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start off-screen to avoid flash
  const [isInitialized, setIsInitialized] = useState(false);
  const dragInfo = useRef({ startX: 0, startY: 0, hasMoved: false, isDragging: false });
  
  const buttonSize = 56; // 14 * 4px (h-14 w-14)
  const padding = 24; // 6 * 4px (bottom-6 right-6)
  const getMaxY = () => window.innerHeight - buttonSize - padding;

  const canUseQuickActions = hasAdminDashboardAccess(user);
  const isStaffRoute = location.pathname.startsWith("/staff");
  const currentDarkMode = isStaffRoute ? readPosDarkMode(isDarkMode) : isDarkMode;

  // Initialize position and handle window resizing
  useEffect(() => {
    const setInitialPosition = () => {
      let defaultX = window.innerWidth - buttonSize - padding;
      let defaultY = window.innerHeight - buttonSize - padding;

      // Try to load saved position
      try {
        const savedPos = localStorage.getItem(QUICK_ACTIONS_POS_KEY);
        if (savedPos) {
          const { x, y } = JSON.parse(savedPos);
          // Ensure it's still within bounds in case of screen resize between sessions
          defaultX = Math.min(Math.max(padding, x), window.innerWidth - buttonSize - padding);
          defaultY = Math.min(Math.max(padding, y), window.innerHeight - buttonSize - padding);
        }
      } catch (error) {
        console.error("Failed to parse saved quick actions position", error);
      }

      setPosition({ x: defaultX, y: defaultY });
      setIsInitialized(true);
    };

    setInitialPosition();

    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(padding, prev.x), window.innerWidth - buttonSize - padding),
        y: Math.min(Math.max(padding, prev.y), getMaxY()),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    if (!isOpen) return;

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

  // --- Dragging Logic ---
  const handlePointerDown = (e) => {
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      isDragging: true,
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragInfo.current.isDragging) return;

    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragInfo.current.hasMoved = true;
      setPosition((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth - buttonSize, prev.x + dx)),
        y: Math.max(padding, Math.min(getMaxY(), prev.y + dy)),
      }));
      
      dragInfo.current.startX = e.clientX;
      dragInfo.current.startY = e.clientY;
      
      if (isOpen) setIsOpen(false); 
    }
  };

  const handlePointerUp = (e) => {
    dragInfo.current.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);

    if (dragInfo.current.hasMoved) {
      snapToEdge();
    }
  };

  const snapToEdge = () => {
    setPosition((prev) => {
      const centerX = prev.x + buttonSize / 2;
      const distLeft = centerX;
      const distRight = window.innerWidth - centerX;
      const newX =
        distLeft <= distRight
          ? padding
          : window.innerWidth - buttonSize - padding;
      const newY = Math.min(Math.max(padding, prev.y), getMaxY());

      // Save the new position to localStorage
      try {
        localStorage.setItem(QUICK_ACTIONS_POS_KEY, JSON.stringify({ x: newX, y: newY }));
      } catch (error) {
        console.error("Failed to save quick actions position", error);
      }

      return { x: newX, y: newY };
    });
  };

  const toggleMenu = (e) => {
    if (dragInfo.current.hasMoved) {
      dragInfo.current.hasMoved = false; 
      return;
    }
    setIsOpen((prev) => !prev);
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

  const isLeftHalf = position.x < window.innerWidth / 2;
  const isTopHalf = position.y < window.innerHeight / 2;

  return (
    <div
      ref={actionsRef}
      className="fixed z-[180] touch-none select-none"
      style={{
        left: position.x,
        top: position.y,
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        opacity: isInitialized ? 1 : 0,
        transition: dragInfo.current.isDragging 
          ? "none" 
          : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
      }}
    >
      {isOpen && (
        <div 
          className={`absolute flex w-[220px] flex-col gap-2 rounded-[1.75rem] border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 transition-all
            ${isTopHalf ? "top-full mt-4" : "bottom-full mb-4"} 
            ${isLeftHalf ? "left-0" : "right-0"}
          `}
        >
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={toggleMenu}
        className="pointer-events-auto flex h-full w-full items-center justify-center rounded-full bg-[#4f6fa5] text-white shadow-[0_18px_40px_rgba(79,111,165,0.35)] transition-colors hover:bg-[#3f5b89] dark:bg-sky-500 dark:hover:bg-sky-400 cursor-grab active:cursor-grabbing"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        <Plus className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`} />
      </button>
    </div>
  );
}

export default AdminQuickActions;
