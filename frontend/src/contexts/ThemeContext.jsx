/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "theme";
const THEME_VALUES = new Set(["light", "dark", "system"]);
const ThemeContext = createContext(null);

const getSystemPreference = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const resolveStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_VALUES.has(storedTheme) ? storedTheme : "light";
  } catch {
    return "light";
  }
};

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(resolveStoredTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPreference);

  const isDarkMode =
    themePreference === "system" ? systemPrefersDark : themePreference === "dark";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setSystemPrefersDark(event.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.classList.toggle("dark", isDarkMode);
    rootElement.dataset.theme = themePreference;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch (error) {
      console.error("Failed to persist theme preference", error);
    }
  }, [isDarkMode, themePreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY || !THEME_VALUES.has(event.newValue)) {
        return;
      }

      setThemePreference(event.newValue);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      isDarkMode,
      themePreference,
      setThemePreference,
      toggleTheme: () =>
        setThemePreference((currentTheme) =>
          (currentTheme === "system" ? systemPrefersDark : currentTheme === "dark")
            ? "light"
            : "dark"
        ),
    }),
    [isDarkMode, systemPrefersDark, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
