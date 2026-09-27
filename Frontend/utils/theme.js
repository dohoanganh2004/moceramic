export const THEME_STORAGE_KEY = "theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // storage unavailable (private mode) - the theme just won't persist
  }
}
