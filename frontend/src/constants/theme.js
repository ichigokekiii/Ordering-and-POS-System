export const APP_THEME_STORAGE_KEY = "theme";
export const STAFF_POS_DARK_MODE_STORAGE_KEY = "staff-pos-dark-mode";
export const STAFF_POS_THEME_EVENT = "staff-pos-theme-change";

export const resolveAppDarkModePreference = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const storedPreference = window.localStorage.getItem(APP_THEME_STORAGE_KEY);

  if (storedPreference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  return storedPreference === "dark";
};
